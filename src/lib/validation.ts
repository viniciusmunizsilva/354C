import {
  COVER_EXTENSIONS,
  MAX_ASSET_BYTES,
  MAX_COVER_BYTES,
  MAX_DEPENDENCIES,
  MAX_MODEL_BYTES,
  MODEL_EXTENSIONS,
  MTL_EXTENSIONS,
  TEXTURE_EXTENSIONS,
  fileExtension,
  formatBytes,
  type AssetType,
  type ModelFormat,
} from "./constants";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/** Classify a dependency file by extension. */
export function classifyDependency(name: string): AssetType | null {
  const ext = fileExtension(name);
  if (MTL_EXTENSIONS.includes(ext)) return "mtl";
  if (TEXTURE_EXTENSIONS.includes(ext)) return "texture";
  return null;
}

/** Read the leading bytes of a file (browser only). */
async function readHeader(file: File, length = 64): Promise<Uint8Array> {
  const buf = await file.slice(0, length).arrayBuffer();
  return new Uint8Array(buf);
}

function startsWithAscii(bytes: Uint8Array, text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (bytes[i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

function looksLikeText(bytes: Uint8Array): boolean {
  // Reject files with NUL or an excess of non-printable control bytes.
  let suspicious = 0;
  for (const b of bytes) {
    if (b === 0) return false;
    if (b < 9 || (b > 13 && b < 32)) suspicious++;
  }
  return suspicious < bytes.length * 0.1;
}

const IMAGE_SIGNATURES: Array<{ ext: string; test: (b: Uint8Array) => boolean }> =
  [
    { ext: ".png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
    { ext: ".jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { ext: ".jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { ext: ".gif", test: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
    {
      ext: ".webp",
      test: (b) =>
        b[0] === 0x52 &&
        b[1] === 0x49 &&
        b[2] === 0x46 &&
        b[3] === 0x46 &&
        b[8] === 0x57 &&
        b[9] === 0x45 &&
        b[10] === 0x42 &&
        b[11] === 0x50,
    },
    { ext: ".bmp", test: (b) => b[0] === 0x42 && b[1] === 0x4d },
    // TGA has no reliable magic number; accept by extension only.
  ];

/**
 * Best-effort content sniff so we do not rely solely on the browser-reported
 * extension. Returns an error string if the bytes clearly contradict the
 * extension, otherwise null.
 */
export async function sniffMismatch(file: File): Promise<string | null> {
  const ext = fileExtension(file.name);
  const head = await readHeader(file, 64);

  if (ext === ".obj") {
    if (!looksLikeText(head)) {
      return `"${file.name}" não parece um arquivo OBJ de texto válido.`;
    }
    return null;
  }

  if (ext === ".mtl") {
    if (!looksLikeText(head)) {
      return `"${file.name}" não parece um arquivo MTL de texto válido.`;
    }
    return null;
  }

  if (ext === ".fbx") {
    // Binary FBX starts with "Kaydara FBX Binary"; ASCII FBX is plain text.
    const binary = startsWithAscii(head, "Kaydara FBX Binary");
    if (!binary && !looksLikeText(head)) {
      return `"${file.name}" não parece um arquivo FBX válido.`;
    }
    return null;
  }

  if (TEXTURE_EXTENSIONS.includes(ext)) {
    if (ext === ".tga") return null; // no reliable signature
    const sig = IMAGE_SIGNATURES.find((s) => s.ext === ext);
    if (sig && !sig.test(head)) {
      return `"${file.name}" não corresponde a uma imagem ${ext.slice(1).toUpperCase()}.`;
    }
    return null;
  }

  return null;
}

export function detectModelFormat(name: string): ModelFormat | null {
  const ext = fileExtension(name);
  if (ext === ".obj") return "obj";
  if (ext === ".fbx") return "fbx";
  return null;
}

/**
 * Validate the complete upload set (model + dependencies + optional cover).
 * Size/extension/companion checks are synchronous; magic-byte sniffing (async)
 * is applied separately via {@link sniffMismatch}.
 */
export function validateUploadSet(args: {
  model: File | null;
  dependencies: File[];
  cover: File | null;
}): ValidationResult {
  const { model, dependencies, cover } = args;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!model) {
    errors.push("Selecione um arquivo de modelo OBJ ou FBX.");
  } else {
    const ext = fileExtension(model.name);
    if (!MODEL_EXTENSIONS.includes(ext)) {
      errors.push("O modelo principal deve ter extensão .obj ou .fbx.");
    }
    if (model.size > MAX_MODEL_BYTES) {
      errors.push(
        `O modelo excede o limite de ${formatBytes(MAX_MODEL_BYTES)} (${formatBytes(model.size)}).`,
      );
    }
    if (model.size === 0) {
      errors.push("O arquivo de modelo está vazio.");
    }
  }

  const format = model ? detectModelFormat(model.name) : null;

  if (dependencies.length > MAX_DEPENDENCIES) {
    errors.push(
      `Máximo de ${MAX_DEPENDENCIES} arquivos de dependência por projeto.`,
    );
  }

  const seen = new Set<string>();
  let mtlCount = 0;
  for (const dep of dependencies) {
    const kind = classifyDependency(dep.name);
    if (!kind) {
      errors.push(
        `"${dep.name}" não é um tipo de dependência suportado (MTL ou textura).`,
      );
      continue;
    }
    if (kind === "mtl") {
      mtlCount++;
      if (format === "fbx") {
        warnings.push(
          `FBX não usa arquivos MTL; "${dep.name}" será ignorado pelo visualizador.`,
        );
      }
    }
    if (dep.size > MAX_ASSET_BYTES) {
      errors.push(
        `"${dep.name}" excede o limite de ${formatBytes(MAX_ASSET_BYTES)}.`,
      );
    }
    const key = dep.name.toLowerCase();
    if (seen.has(key)) {
      errors.push(`Arquivo duplicado: "${dep.name}".`);
    }
    seen.add(key);
  }

  // OBJ files commonly reference an MTL. Warn (do not block) if none provided.
  if (format === "obj" && mtlCount === 0) {
    warnings.push(
      "Nenhum arquivo .mtl foi adicionado. O modelo será exibido com um material padrão.",
    );
  }

  if (cover) {
    const ext = fileExtension(cover.name);
    if (!COVER_EXTENSIONS.includes(ext)) {
      errors.push("A capa deve ser uma imagem PNG, JPG ou WEBP.");
    }
    if (cover.size > MAX_COVER_BYTES) {
      errors.push(
        `A capa excede o limite de ${formatBytes(MAX_COVER_BYTES)}.`,
      );
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

/** Server-side re-validation from stored metadata (no byte access needed). */
export function validateAssetMetadata(args: {
  originalFilename: string;
  assetType: AssetType;
  fileSize: number;
}): string | null {
  const { originalFilename, assetType, fileSize } = args;
  const ext = fileExtension(originalFilename);

  if (assetType === "model") {
    if (!MODEL_EXTENSIONS.includes(ext)) return "Extensão de modelo inválida.";
    if (fileSize > MAX_MODEL_BYTES) return "Modelo acima do limite permitido.";
  } else if (assetType === "mtl") {
    if (!MTL_EXTENSIONS.includes(ext)) return "Extensão de MTL inválida.";
    if (fileSize > MAX_ASSET_BYTES) return "MTL acima do limite permitido.";
  } else if (assetType === "texture") {
    if (!TEXTURE_EXTENSIONS.includes(ext)) return "Extensão de textura inválida.";
    if (fileSize > MAX_ASSET_BYTES) return "Textura acima do limite permitido.";
  } else if (assetType === "cover") {
    if (!COVER_EXTENSIONS.includes(ext)) return "Extensão de capa inválida.";
    if (fileSize > MAX_COVER_BYTES) return "Capa acima do limite permitido.";
  }
  if (fileSize <= 0) return "Arquivo vazio.";
  return null;
}
