# Plataforma BIM 3D com Autodesk APS Viewer

Plataforma web full stack para upload, conversão, visualização e colaboração em modelos BIM 3D oriundos do Navisworks (`.NWD`). A solução usa **Autodesk Platform Services (APS/Forge)** para armazenamento, tradução para SVF2 e visualização no Viewer, com **Node.js + Express**, **React**, **Three.js** e **MongoDB**.

## Arquitetura

```text
frontend/ React + Vite + APS Viewer
   │ JWT
backend/ Express API + RBAC + APS integration
   │ Mongoose
MongoDB
   │
Autodesk APS OSS + Model Derivative + Viewer
```

### Módulos implementados

- Autenticação com cadastro, login, JWT e sessão no navegador.
- RBAC com papéis `ADMIN` e `VIEWER` validado no backend e refletido na interface.
- Projetos: criação, edição, exclusão e listagem autenticada.
- Modelos: associação obrigatória a projeto, upload de `.NWD` apenas por administrador.
- Versões: múltiplas versões por modelo, `v1`, `v2`, `v3`, versão ativa e histórico.
- APS: bucket OSS, signed S3 upload, tradução Model Derivative para SVF2 e token seguro do Viewer.
- Viewer 3D: carregamento por URN, seleção de elementos e leitura de propriedades BIM.
- Issues: criação por elemento, posição 3D, câmera, status, filtros, comentários e permissões por autor/admin.
- UI dashboard com sidebar de projetos/modelos/versões, área central do viewer e painel de issues.

## Requisitos

- Node.js 22+
- npm 10+
- MongoDB 7+
- Credenciais Autodesk Platform Services com acesso a OSS, Model Derivative e Viewer.

## Configuração local

1. Instale dependências:

```bash
npm install
```

2. Configure o backend:

```bash
cp backend/.env.example backend/.env
```

Preencha:

```env
MONGO_URI=mongodb://localhost:27017/bim_platform
JWT_SECRET=uma-chave-forte
APS_CLIENT_ID=...
APS_CLIENT_SECRET=...
APS_BUCKET_KEY=um-bucket-globalmente-unico
APS_REGION=US
```

3. Configure o frontend, se necessário:

```bash
cp frontend/.env.example frontend/.env
```

4. Execute MongoDB e a aplicação:

```bash
npm run dev
```

- Frontend: <http://localhost:5173>
- API: <http://localhost:4000>
- Health check: <http://localhost:4000/health>

> O primeiro usuário cadastrado vira `ADMIN` automaticamente para facilitar o bootstrap. Usuários seguintes usam o papel enviado no cadastro ou `VIEWER`.

## Execução com Docker

```bash
cp backend/.env.example backend/.env
# edite backend/.env com as credenciais APS

docker compose up --build
```

## Principais endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Projetos

- `GET /api/projects` — autenticado
- `POST /api/projects` — `ADMIN`
- `PUT /api/projects/:projectId` — `ADMIN`
- `DELETE /api/projects/:projectId` — `ADMIN`

### Modelos e versões

- `GET /api/models/projects/:projectId/models` — autenticado
- `POST /api/models/upload` — `ADMIN`, multipart com `projectId`, `modelId?`, `name?`, `file`
- `GET /api/models/:modelId/versions` — autenticado
- `PATCH /api/models/versions/:versionId/active` — `ADMIN`
- `GET /api/models/versions/:versionId/manifest` — autenticado

### Issues

- `GET /api/issues?versionId=&status=&assignedTo=&from=&to=` — `ADMIN` vê tudo; `VIEWER` vê suas próprias issues
- `POST /api/issues` — autenticado
- `PUT /api/issues/:issueId` — `ADMIN` ou autor
- `DELETE /api/issues/:issueId` — `ADMIN` ou autor
- `POST /api/issues/:issueId/comments` — autenticado

### APS Viewer

- `GET /api/aps/token` — token de curta duração para o Viewer, sempre protegido por JWT.

## Segurança

- Senhas criptografadas com bcrypt.
- JWT com expiração configurável.
- Todas as rotas de domínio protegidas por autenticação.
- Upload e gestão de projetos/versões protegidos por role `ADMIN`.
- Validação de payloads com `express-validator`.
- Headers HTTP endurecidos com `helmet` e rate limit básico.
- Segredo APS nunca exposto ao frontend; o browser recebe apenas token temporário para visualização.

## Fluxo APS para `.NWD`

1. Administrador envia um `.NWD` pelo dashboard.
2. API valida extensão e permissão.
3. API cria/verifica bucket OSS.
4. API solicita signed S3 upload e envia o arquivo.
5. API completa o upload, gera URN base64 e solicita tradução para `svf2`.
6. Versão é persistida com URN, arquivo, usuário, data e flag ativa.
7. Frontend solicita `/api/aps/token` e carrega `urn:<URN>` no APS Viewer.

## Deploy

### Backend

- Provisionar MongoDB gerenciado.
- Definir variáveis de ambiente do backend.
- Executar `npm install --omit=dev --workspace backend` e `npm run start --workspace backend`.
- Publicar atrás de HTTPS e configurar `CORS_ORIGIN` com o domínio do frontend.

### Frontend

- Definir `VITE_API_URL=https://sua-api.example.com/api`.
- Executar `npm run build --workspace frontend`.
- Publicar `frontend/dist` em CDN/hosting estático.

## Observações de integração

A integração usa os serviços oficiais APS atuais para token OAuth 2-legged, OSS signed S3 upload, Model Derivative e Viewer. Traduções podem gerar custos na Autodesk e exigem conta/assinatura compatível.
