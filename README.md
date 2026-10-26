# Room Gallery — Ambientes 3D

Portal pessoal e responsivo para armazenar, organizar e visualizar modelos 3D
de ambientes residenciais (OBJ e FBX) diretamente no navegador.

> **Modelo de acesso desta versão:** aberto (sem login), conforme solicitado —
> qualquer pessoa com o link vê e adiciona projetos, e **nenhum dado pessoal é
> coletado**. O código já está preparado para ativar autenticação por usuário
> com poucas mudanças (ver [Ativando autenticação](#ativando-autenticação-depois)).

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| UI | Tailwind CSS v4 + componentes no estilo shadcn/ui + Radix |
| 3D | Three.js 0.186 · @react-three/fiber 9 · @react-three/drei 10 |
| Loaders | OBJLoader + MTLLoader · FBXLoader · TGALoader |
| Backend | Supabase (PostgreSQL + Storage) via `@supabase/ssr` |
| Deploy | Vercel |

## Como funciona

- O **visualizador 3D** (`src/components/viewer`) é isolado, roda **somente no
  cliente** (`dynamic(..., { ssr: false })`), escolhe o loader pelo formato,
  resolve MTL/texturas por nome de arquivo com um `LoadingManager`, enquadra o
  modelo automaticamente pela *bounding box* (independente de escala/origem),
  oferece controles orbitais suaves, recentralização, visão perspectiva/superior,
  grade e controle de luz, e **libera geometrias, materiais, texturas e recursos
  WebGL** ao desmontar.
- Os arquivos 3D ficam **fora do bundle** (Supabase Storage, bucket privado) e
  são carregados sob demanda via **URLs assinadas**.
- O upload é feito **direto do navegador para o Storage** (com barra de
  progresso real), e o servidor **re-valida os metadados** (extensão, tamanho,
  tipo) antes de gravar as linhas no banco — a validação não confia apenas na
  extensão enviada pelo navegador (há também uma checagem de *magic bytes* no
  cliente).
- A relação **modelo ↔ dependências** é preservada na tabela `project_assets`;
  a exclusão remove apenas os arquivos do próprio projeto.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis do Supabase (opcional)
npm run dev                  # http://localhost:3000
```

Sem as variáveis do Supabase o app ainda sobe: a galeria e o upload mostram um
aviso de configuração, e **o visualizador funciona com o modelo de exemplo** em
`/exemplo`.

Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.

## Configurando o Supabase

1. **Crie um projeto** em <https://supabase.com/dashboard>.
2. **Aplique as migrações**: abra o SQL Editor e execute o conteúdo de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Isso cria as tabelas `projects` e `project_assets` (UUID, FKs, índices,
   constraints), habilita **RLS**, cria o bucket privado `models` e as políticas
   de Storage.
3. **Pegue as credenciais** em *Project Settings → API* e preencha `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```

   > Use **apenas** a chave `anon` (pública). A `service_role` nunca deve ir para
   > o cliente nem para este repositório.

### Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | sim* | — | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim* | — | Chave anônima (pública) |
| `NEXT_PUBLIC_MAX_MODEL_MB` | não | `60` | Tamanho máx. do modelo principal |
| `NEXT_PUBLIC_MAX_ASSET_MB` | não | `25` | Tamanho máx. por dependência |
| `NEXT_PUBLIC_MAX_COVER_MB` | não | `8` | Tamanho máx. da imagem de capa |
| `NEXT_PUBLIC_MAX_DEPENDENCIES` | não | `40` | Nº máx. de dependências por projeto |

\* Sem elas o app roda apenas em modo demonstração (UI + visualizador de exemplo).

> **Atenção:** o bucket `models` tem limite de 64 MiB por objeto. Se aumentar
> `NEXT_PUBLIC_MAX_MODEL_MB`, ajuste também `file_size_limit` do bucket no SQL.

## Deploy na Vercel

1. Importe o repositório na Vercel (framework detectado: **Next.js**).
2. Em *Settings → Environment Variables*, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (e os limites opcionais, se quiser).
3. Faça o deploy. Como as variáveis são lidas em *build time*, após configurá-las
   é preciso **refazer o deploy** para a galeria/upload saírem do modo demo.

## Segurança

- **RLS habilitado** em `projects` e `project_assets`; o bucket de Storage é
  **privado** com políticas equivalentes. Arquivos privados são servidos por
  **URLs assinadas** com validade de 1 hora.
- Nesta versão as políticas são **abertas** (role `anon`) por ser um portal sem
  login. As políticas **por usuário** já estão escritas (comentadas) no fim da
  migração — basta trocá-las ao ativar o Auth.
- A `service_role key` nunca é usada no cliente. Toda escrita passa por Server
  Actions que re-validam os metadados.

### Ativando autenticação depois

1. Ative o provedor desejado em *Authentication* (e desative *sign-ups* públicos
   se quiser acesso restrito).
2. Na migração, **remova as políticas `*_open_*`** e **ative as políticas
   `PER-USER`** (comentadas) — elas restringem cada linha e cada objeto de
   Storage ao `auth.uid()`. As colunas `user_id` já existem para isso.
3. Preencha `user_id` nas escritas (Server Actions) com o usuário autenticado e
   adicione um middleware de sessão (`@supabase/ssr` já está integrado).

## Status dos critérios de aceite

Verificado nesta entrega (build + visualizador testados em navegador headless):

- ✅ Visualizador carrega OBJ **com MTL e materiais** (modelo de exemplo),
  enquadra e centraliza automaticamente, com controles, grade e iluminação.
- ✅ Código WebGL roda apenas no cliente (sem erro de SSR).
- ✅ Erros de carregamento exibem mensagens compreensíveis.
- ✅ `npm run lint`, typecheck e `npm run build` passam.
- ✅ Publicável na Vercel.

Depende da configuração do Supabase (migração + env vars) para exercício
completo: criação/edição/exclusão de projetos, upload de OBJ+MTL+texturas e
FBX+texturas, persistência e acesso por URL em outro dispositivo. FBX é carregado
pelo mesmo componente de visualização.

## Estrutura

```
src/
  app/
    projetos/                galeria, novo, [id] (visualizador), [id]/editar
    exemplo/                 visualizador com o modelo de exemplo (sem backend)
    projetos/actions.ts      Server Actions (criar/editar/substituir/excluir)
  components/
    viewer/                  componente 3D isolado e reutilizável
    gallery/ project/ ui/    galeria, formulários e primitivos de UI
  lib/                       supabase, validação, storage, acesso a dados
supabase/migrations/         schema + RLS + bucket + políticas
public/samples/              modelo de exemplo (room.obj + room.mtl)
```
