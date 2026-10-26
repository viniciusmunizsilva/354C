import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader.js";
import { basename, type ModelFormat } from "@/lib/constants";

export interface LoadArgs {
  format: ModelFormat;
  modelUrl: string;
  /** Map of dependency basename (lowercased) -> resolvable URL. */
  dependencyUrls: Record<string, string>;
  onProgress?: (pct: number) => void;
}

export class ModelLoadError extends Error {}

/**
 * Load an OBJ or FBX model, resolving MTL/texture dependencies by filename.
 *
 * A single LoadingManager with a URL modifier remaps every requested resource
 * to its signed URL by basename, so arbitrary relative paths inside the model
 * or MTL (e.g. "textures/wood.jpg") resolve correctly without us having to
 * rewrite the model files.
 */
export async function loadModel(args: LoadArgs): Promise<THREE.Object3D> {
  const { format, modelUrl, dependencyUrls, onProgress } = args;

  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => {
    try {
      // Pass through blob:/data: and the already-signed model URL.
      if (url.startsWith("blob:") || url.startsWith("data:")) return url;
      const withoutQuery = url.split("?")[0];
      const base = basename(decodeURIComponent(withoutQuery)).toLowerCase();
      if (base && dependencyUrls[base]) return dependencyUrls[base];
    } catch {
      /* fall through */
    }
    return url;
  });
  manager.addHandler(/\.tga$/i, new TGALoader(manager));

  manager.onProgress = (_url, loaded, total) => {
    if (total > 0) onProgress?.(Math.min(99, Math.round((loaded / total) * 100)));
  };

  let root: THREE.Object3D;
  try {
    if (format === "obj") {
      root = await loadObj(manager, modelUrl, dependencyUrls);
    } else {
      root = await new FBXLoader(manager).loadAsync(modelUrl);
    }
  } catch (err) {
    throw new ModelLoadError(describeLoadError(err, format));
  }

  normalizeMaterials(root);
  onProgress?.(100);
  return root;
}

async function loadObj(
  manager: THREE.LoadingManager,
  modelUrl: string,
  dependencyUrls: Record<string, string>,
): Promise<THREE.Object3D> {
  const mtlEntry = Object.entries(dependencyUrls).find(([name]) =>
    name.endsWith(".mtl"),
  );

  const objLoader = new OBJLoader(manager);

  if (mtlEntry) {
    const mtlLoader = new MTLLoader(manager);
    const materials = await mtlLoader.loadAsync(mtlEntry[1]);
    materials.preload();
    objLoader.setMaterials(materials);
  }

  return objLoader.loadAsync(modelUrl);
}

/** Give every mesh a usable material and normals (fallback when missing). */
function normalizeMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;

    const geometry = mesh.geometry as THREE.BufferGeometry;
    if (geometry && !geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }

    const hasMaterial = Array.isArray(mesh.material)
      ? mesh.material.length > 0
      : Boolean(mesh.material);
    if (!hasMaterial) {
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0xb8b2a7,
        roughness: 0.75,
        metalness: 0.05,
      });
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}

function describeLoadError(err: unknown, format: ModelFormat): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/404|not found/i.test(raw)) {
    return "Arquivo não encontrado no armazenamento. Ele pode ter sido removido.";
  }
  if (/network|failed to fetch|load error|cors/i.test(raw)) {
    return "Falha de rede ao baixar o modelo. Verifique sua conexão e tente novamente.";
  }
  return `Não foi possível carregar o modelo ${format.toUpperCase()}. O arquivo pode estar corrompido ou em um formato incompatível.`;
}

/** Recursively dispose geometries, materials and their textures. */
export function disposeObject(root: THREE.Object3D | null) {
  if (!root) return;
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material;
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
      for (const value of Object.values(mat)) {
        if (value && (value as THREE.Texture).isTexture) {
          (value as THREE.Texture).dispose();
        }
      }
      mat.dispose();
    }
  });
}
