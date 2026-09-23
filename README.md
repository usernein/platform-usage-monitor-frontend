# Platform Usage Monitor — Frontend

Frontend da plataforma de monitoramento de utilização de aplicações educacionais. A interface permite acompanhar instituições, indicadores de adesão, metas e usuários elegíveis, incluindo alunos, professores e gestores.

## Tecnologias

- React 19 e TypeScript
- Vite
- Mantine
- TanStack Query
- React Router
- Recharts
- Yarn 4
- Docker e Nginx

## Configuração de ambiente

Crie o arquivo local a partir do exemplo:

```bash
cp .env.example .env
```

Variáveis disponíveis:

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `VITE_API_BASE_URL` | URL pública do backend acessível pelo navegador | `http://127.0.0.1:3000` |
| `FRONTEND_PORT` | Porta do frontend no host ao usar Docker | `8080` |

Se o backend estiver em outra máquina, substitua `127.0.0.1` pelo IP dela, por exemplo:

```dotenv
VITE_API_BASE_URL=http://192.168.1.50:3000
```

O backend deve aceitar requisições CORS originadas do endereço do frontend. A aplicação ainda utiliza dados mockados; `VITE_API_BASE_URL` já fica disponível para a integração da API real.

## Executar com Docker

Requisito: Docker com o plugin Docker Compose.

Depois de configurar o `.env`, execute:

```bash
docker compose up --build
```

Abra [http://localhost:8080](http://localhost:8080). Para usar outra porta, altere `FRONTEND_PORT` no `.env` e recrie o serviço.

O Compose gera o bundle com a URL configurada em `VITE_API_BASE_URL` e o serve com Nginx. Como variáveis `VITE_*` são definidas durante o build, qualquer alteração em `VITE_API_BASE_URL` exige uma nova compilação:

```bash
docker compose up --build --force-recreate
```

Para encerrar e remover o container:

```bash
docker compose down
```

## Executar localmente

Requisitos: Node.js 24 e Corepack habilitado.

```bash
corepack enable
yarn install --immutable
yarn dev
```

O endereço local padrão é [http://localhost:5173](http://localhost:5173).

## Validação

```bash
yarn typecheck
yarn build
```

## Estrutura principal

```text
src/
  api/          API mockada e futura integração HTTP
  components/   componentes reutilizáveis
  constants/    metadados compartilhados
  layouts/      estrutura global da aplicação
  mocks/        dados de demonstração
  pages/        páginas e fluxos da aplicação
  types/        contratos TypeScript
  utils/        regras auxiliares e filtros
```

## Uso de IA

Preencha esta seção com as ferramentas realmente utilizadas, as etapas em que foram usadas, como as sugestões foram revisadas e validadas, e ao menos uma sugestão que tenha sido modificada ou descartada com o respectivo motivo.

- **Ferramentas utilizadas:**
- **Etapas apoiadas por IA:**
- **Como o código foi revisado:**
- **Como o resultado foi validado:**
- **Sugestão modificada ou descartada:**
