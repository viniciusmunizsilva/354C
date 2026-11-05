"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Box, Download, FileText, Ruler, Layers3, Info } from "lucide-react";

const ViewerCanvas = dynamic(
  () => import("@/components/viewer/viewer-canvas").then((m) => m.ViewerCanvas),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Preparando visualizador 3D…</div> },
);
const modelUrl = "/models/dormitorio2-layoutC.glb";

function FloorPlan() {
  return <div className="mx-auto w-full max-w-3xl rounded-xl border border-border bg-[#f3f0e9] p-5 sm:p-8">
    <div className="mb-4 flex justify-between text-xs uppercase tracking-[.18em] text-[#746e64]"><span>Planta esquemática · vista superior</span><span>Proporcional</span></div>
    <svg viewBox="0 0 760 610" role="img" aria-label="Planta esquemática de quarto de 3,80 por 3,00 metros" className="w-full">
      <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e1ddd4"/></pattern></defs>
      <rect x="75" y="65" width="570" height="450" fill="url(#grid)" stroke="#302f2a" strokeWidth="12"/><rect x="96" y="86" width="528" height="408" fill="#faf9f6"/>
      <rect x="110" y="100" width="216" height="280" rx="5" fill="#c8b9a4" stroke="#6e6255" strokeWidth="3"/><text x="218" y="232" textAnchor="middle" fontSize="19" fill="#39342e" fontWeight="600">Cama</text><text x="218" y="257" textAnchor="middle" fontSize="14" fill="#51483f">casal</text>
      <rect x="355" y="100" width="245" height="54" rx="3" fill="#b69b7d" stroke="#6e6255" strokeWidth="3"/><text x="477" y="133" textAnchor="middle" fontSize="16" fill="#2f2923" fontWeight="600">Armário / marcenaria</text>
      <rect x="110" y="400" width="225" height="72" rx="3" fill="#ad9678" stroke="#6e6255" strokeWidth="3"/><text x="222" y="443" textAnchor="middle" fontSize="16" fill="#2f2923" fontWeight="600">Mesa / bancada</text>
      <rect x="535" y="220" width="65" height="175" rx="3" fill="#8d9a99" stroke="#56605f" strokeWidth="3"/><text x="567" y="305" textAnchor="middle" fontSize="14" fill="#fff" transform="rotate(90 567 305)">Estante</text>
      <path d="M75 515v34M645 515v34M75 535h570" stroke="#6e6255" fill="none"/><text x="360" y="566" textAnchor="middle" fontSize="18" fill="#51483f">3,80 m (modelo)</text>
      <path d="M48 65h-28M48 515h-28M32 65v450" stroke="#6e6255" fill="none"/><text x="18" y="290" textAnchor="middle" fontSize="18" fill="#51483f" transform="rotate(-90 18 290)">3,00 m (modelo)</text>
    </svg>
    <p className="mt-2 text-xs leading-relaxed text-[#746e64]">Contorno baseado nos limites do arquivo 3D. A disposição dos móveis nesta ilustração é indicativa; não usar para fabricação sem conferência.</p>
  </div>;
}

export default function Home() {
 const [tab,setTab]=useState<"3d"|"planta"|"arquivos">("3d");
 const tabs=[{id:"3d" as const,label:"Modelo 3D",icon:Box},{id:"planta" as const,label:"Planta",icon:Ruler},{id:"arquivos" as const,label:"Arquivos e informações",icon:Layers3}];
 return <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 lg:px-10">
  <header className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-3 text-xs font-medium uppercase tracking-[.22em] text-muted-foreground">Projeto residencial · marcenaria</p><h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">Dormitório 02</h1><p className="mt-2 max-w-xl text-sm text-muted-foreground">Modelo tridimensional, planta de referência e arquivos para análise do marceneiro.</p></div><a href={modelUrl} download className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"><Download className="size-4"/> Baixar modelo 3D</a></header>
  <section className="mb-6 grid gap-3 sm:grid-cols-4">{[["Largura identificada","3,80 m"],["Profundidade identificada","3,00 m"],["Altura máxima do modelo","2,394 m"],["Formato principal","GLB · 3D interativo"]].map(([a,b])=><div key={a} className="rounded-xl border border-border bg-card px-4 py-3"><p className="text-xs text-muted-foreground">{a}</p><p className="mt-1 text-lg font-medium">{b}</p></div>)}</section>
  <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Visualizações do projeto">{tabs.map(({id,label,icon:Icon})=><button key={id} role="tab" aria-selected={tab===id} onClick={()=>setTab(id)} className={`rounded-full px-4 py-2 text-sm transition ${tab===id?"bg-primary text-primary-foreground":"border border-border bg-card hover:bg-secondary"}`}><Icon className="mr-2 inline size-4"/>{label}</button>)}</div>
  {tab==="3d"&&<section className="grid gap-5 lg:grid-cols-[1fr_280px]"><div className="h-[520px] overflow-hidden rounded-2xl border border-border bg-card sm:h-[650px]"><ViewerCanvas payload={{format:"glb",modelUrl,dependencyUrls:[]}}/></div><aside className="space-y-4"><div className="rounded-2xl border border-border bg-card p-5"><h2 className="font-medium">Como visualizar</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Arraste para girar, use a roda do mouse para aproximar e o botão direito para deslocar a câmera. A barra inferior oferece vista superior e controles de visualização.</p></div><div className="rounded-2xl border border-border bg-card p-5"><h2 className="font-medium">Objetivo</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Apresentar o conceito do ambiente e facilitar a conversa sobre os móveis planejados. O modelo é uma referência visual, não substitui medição presencial.</p></div></aside></section>}
  {tab==="planta"&&<section className="rounded-2xl border border-border bg-card p-4 sm:p-7"><h2 className="text-xl font-medium">Planta baixa de referência</h2><p className="mb-5 mt-1 text-sm text-muted-foreground">Dimensões gerais identificadas nos limites do modelo 3D.</p><FloorPlan/><div className="mt-5 flex gap-3 rounded-xl bg-secondary/70 p-4 text-sm leading-relaxed"><Info className="mt-0.5 size-5 shrink-0 text-muted-foreground"/><p>Planta esquemática, não executiva. Portas, janelas, vãos, folgas e medidas finais dos móveis devem ser conferidos no local antes da fabricação.</p></div></section>}
  {tab==="arquivos"&&<section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-5"><Box className="mb-3 size-5 text-muted-foreground"/><h2 className="font-medium">Modelo GLB</h2><p className="text-xs text-muted-foreground">Geometria e materiais em um arquivo.</p><a className="mt-4 inline-flex text-sm font-medium underline underline-offset-4" href={modelUrl} download>Baixar GLB</a></div><div className="rounded-2xl border border-border bg-card p-5"><FileText className="mb-3 size-5 text-muted-foreground"/><h2 className="font-medium">OBJ + MTL</h2><p className="text-sm text-muted-foreground">Formato alternativo para softwares de modelagem. Devem ser publicados juntos no diretório público.</p></div><div className="rounded-2xl border border-border bg-card p-5 md:col-span-2"><h2 className="font-medium">Observações para o marceneiro</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Confirmar as medidas do quarto presencialmente.</li><li>Definir espessuras do MDF, fundos, fitas de borda e ferragens.</li><li>Conferir abertura de portas e gavetas, tomadas, rodapés e interferências.</li><li>Produzir desenhos de fabricação e plano de corte após aprovação das medidas.</li></ul></div></section>}
  <footer className="mt-10 border-t border-border py-5 text-xs text-muted-foreground">Estudo preliminar · Material para apresentação e orçamento · Medidas sujeitas à conferência no local</footer>
 </main>;
}
