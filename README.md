# Ticket System 🎫

**Ticket System** é um sistema Full-Stack de gestão de chamados responsávels desenvolvido para ambientes industriais de chão de fábrica. A plataforma centraliza a comunicação entre monitores de linha de produção e as engenharias de **Automação, Setup, Teste e Software**, substituindo processos manuais por um fluxo rastreável, estruturado e integrado ao WhatsApp.

O projeto é organizado como um **Monorepo**, reunindo API e Web em um único repositório para facilitar manutenção, versionamento e deploy sincronizado.

<div align="center">
  <img src="https://img.shields.io/badge/.NET%208-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 8">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Chakra_UI-319795?style=for-the-badge&logo=chakraui&logoColor=white" alt="Chakra UI">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT">
  <img src="https://img.shields.io/badge/Framer_Motion-EF0187?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion">
</div>

---

## ✨ Sobre o Projeto

O Ticket System nasceu de uma necessidade real de operação: agilizar e rastrear os chamados entre a produção e os departamentos de engenharia, eliminando comunicação informal e sem histórico.

O sistema suporta quatro tipos de chamados, cada um com seu próprio fluxo de estados, regras de negócio e integrações:

| Tipo | Departamento Destino | Casos de Uso |
|---|---|---|
| **Setup** | Engenharia de Setup | Setup de linha, solicitação de materiais |
| **Automação** | Engenharia de Sistemas | Sistemas de linha, integrações industriais, validação de etiquetas, testes de produto |
| **Teste** | Engenharia de Teste | Testes finais e coleta de logs das linhas de produção |
| **Software** | Engenharia de Software | Chaves Windows, atualizações, firmware, bugs em sistemas |

A segurança é gerenciada via **RBAC (Role-Based Access Control)** com **15 roles granulares** delegadas a um provedor de identidade externo (AccessControlAPI), sem duplicar a gestão de usuários.

---

## 🌟 Funcionalidades Principais

- ✅ **Autenticação Delegada:** Login integrado a um provedor de identidade externo (AccessControlAPI). O token JWT resultante carrega todos os claims de roles necessários para as decisões de autorização.
- ✅ **Fluxo de Tickets com Handshake por Token:** Cada ticket gerado recebe um token de confirmação de 4 dígitos. O responsável só consegue assumir o chamado apresentando esse token, garantindo rastreabilidade e evitando assumções indevidas.
- ✅ **Integração Nativa com WhatsApp:** Ao abrir, assumir ou finalizar um ticket, uma mensagem estruturada com emojis, timeline e duração do atendimento é copiada automaticamente para o clipboard e o grupo do departamento é aberto no WhatsApp.
- ✅ **Cockpit Administrativo:** Painel exclusivo para o role `admin` com gestão completa de linhas de produção e prefixos, incluindo ativação/desativação e proteção contra exclusão de linhas com tickets vinculados.
- ✅ **Checklist Pós-Atendimento:** Para tickets de Setup do tipo `LineSetup`, ao finalizar o atendimento o status de checklist muda para `Pending`, exigindo que o requester preencha e assine digitalmente o checklist antes de encerrar o ciclo.
- ✅ **UI/UX de Alto Nível:** Skeletons em todas as telas, ícones 100% animados com Framer Motion via hook customizado, sidebar com expansão animada, sistema de temas por departamento com suporte completo a dark/light mode e alertas contextuais com SweetAlert2.
- ✅ **Seed Automático:** Ao iniciar, a API verifica e popula automaticamente as linhas de produção e prefixos iniciais caso o banco esteja vazio.

---

## 🏗️ Arquitetura e Decisões Técnicas

### Backend — Domain-Driven Design

As entidades de ticket (`SetupTickets`, `AutomationTickets`, `TestTickets`, `SoftwareTickets`) seguem o padrão de **encapsulamento por DDD**:

- Propriedades com setter `private` — nenhum controller altera estado diretamente.
- **Factory Methods estáticos** (`Create()`) centralizam as regras de criação e validam invariantes de domínio.
- **Domain Exceptions** (`DomainException`) propagam erros de negócio de forma semântica, capturados nos controllers e convertidos em respostas HTTP apropriadas.
- Métodos de comportamento (`Start()`, `Resolve()`, `SubmitChecklist()`) encapsulam as transições de estado.

```
Open ──── Start(token) ──► InProgress ──── Resolve() ──► Resolved
```

### Autenticação e Autorização

A autenticação é **completamente delegada** a um provedor de identidade externo (AccessControlAPI):

1. O frontend envia matrícula + senha.
2. A API repassa para a AccessControlAPI e obtém um token externo.
3. Com esse token, busca os dados do usuário e suas roles.
4. Gera um **JWT próprio** com os claims necessários (`NameIdentifier`, `Name`, `Registration`, `Department`, roles).

Os controllers utilizam `[Authorize(Roles = "...")]` com constantes definidas em `UserRoles`, evitando magic strings espalhadas pelo código.

### Frontend — Arquitetura de Hooks e Temas

- **`useDepartmentTheme`:** Hook centraliza 100% das decisões de cor e estilo da UI — cards, badges, botões, estados hover, modo claro/escuro — por departamento. Nenhum componente define cor diretamente.
- **`useIconAnimation`:** Hook que controla animações Framer Motion via estado `isHovered`, com suporte a loop automático. Todos os ícones do sistema são animados.
- **`useAuth`:** Valida o token JWT no endpoint `/Auth/validate` a cada carregamento, removendo sessões expiradas automaticamente.
- **`api.ts`:** Instância Axios com interceptor de request (injeção do Bearer token) e interceptor de response (redirecionamento automático para `/login` em 401).

---

## 🧱 Estrutura do Projeto

```
Ticket-System/
├── TicketSystem.API/                  # Backend ASP.NET Core
│   ├── Controllers/                   # Endpoints REST
│   │   ├── AdminCockpitController.cs  # Gestão de linhas e prefixos (Admin only)
│   │   ├── AuthController.cs          # Login e validação de token
│   │   ├── AutomationTicketsController.cs
│   │   ├── SetupTicketsController.cs
│   │   ├── SoftwareTicketsController.cs
│   │   ├── TestTicketsController.cs
│   │   ├── TicketResolverActionController.cs  # Mensagens WhatsApp para responsávels
│   │   ├── TicketTransportController.cs         # Mensagens WhatsApp para monitores
│   │   ├── ProductionLinesController.cs
│   │   └── SupportController.cs
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── DbSeeder.cs
│   │   └── ProductionLineSeeder.cs
│   ├── Domain/
│   │   └── Exceptions/
│   │       └── DomainException.cs
│   ├── Dtos/                          # Objetos de entrada e saída da API
│   ├── Enums/
│   │   ├── TicketsEnums.cs
│   │   └── UserRoles.cs
│   ├── Models/                        # Entidades de domínio
│   │   ├── AutomationTickets.cs
│   │   ├── SetupTickets.cs
│   │   ├── SoftwareTickets.cs
│   │   ├── TestTickets.cs
│   │   ├── ProductionLine.cs
│   │   ├── LinePrefix.cs
│   │   └── Users.cs
│   ├── Services/
│   │   └── ExternalAuthService.cs     # Integração com AccessControlAPI
│   ├── Utils/
│   │   └── TicketMessageHelper.cs     # Geração de mensagens formatadas para WhatsApp
│   ├── Migrations/
│   ├── appsettings.Example.json       # Modelo de configuração (sem dados sensíveis)
│   └── Program.cs
│
├── TicketSystem.Web/                  # Frontend React + Vite
│   └── src/
│       ├── components/
│       │   ├── CockpitAdmin/          # Modais de gestão (linhas, prefixos, usuários)
│       │   ├── icons/                 # Ícones animados com Framer Motion
│       │   ├── ActionCard.tsx
│       │   ├── Layout.tsx
│       │   ├── Sidebar.tsx
│       │   ├── TicketFilters.tsx
│       │   ├── TicketResolverWhatsappTransport.tsx
│       │   └── WhatsappTransport.tsx
│       ├── constants/
│       │   ├── apiEndpoints.ts        # Centralização de todos os endpoints
│       │   ├── lineConfig.ts
│       │   └── storageKeys.ts
│       ├── helpers/
│       │   └── date.ts
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useColorModeValue.ts
│       │   ├── useDepartmentTheme.ts
│       │   └── useIconAnimation.ts
│       ├── pages/
│       │   ├── AutomationForm.tsx
│       │   ├── AutomationTicketsList.tsx
│       │   ├── ChecklistPage.tsx
│       │   ├── CockpitAdminDashboard.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Login.tsx
│       │   ├── ProductionLinesPage.tsx
│       │   ├── PrefixesPage.tsx
│       │   ├── SetupForm.tsx
│       │   ├── SetupTicketsList.tsx
│       │   ├── SoftwareForm.tsx
│       │   ├── SoftwareTicketsList.tsx
│       │   ├── TestForm.tsx
│       │   └── TestTicketsList.tsx
│       ├── services/
│       │   ├── api.ts
│       │   └── alertService.ts
│       ├── types/
│       │   └── index.ts               # Interfaces, enums e tipos globais
│       └── App.tsx
│
├── docker-compose.yml
├── .gitignore
└── TicketSystem.slnx
```

---

## 🛠️ Tech Stack

### Backend
| Tecnologia | Uso |
|---|---|
| C# / ASP.NET Core 8 | Framework principal da API REST |
| Entity Framework Core | ORM com Code-First e Migrations |
| MySQL | Banco de dados relacional |
| JWT Bearer | Autenticação stateless |
| BCrypt.Net | Hash seguro de senhas |
| QuestPDF | Geração de PDFs (checklists) |
| Swashbuckle | Documentação Swagger interativa |

### Frontend
| Tecnologia | Uso |
|---|---|
| React + Vite | Framework e bundler |
| TypeScript | Tipagem estática |
| Chakra UI v2 | Design system base |
| Framer Motion | Animações e microinterações |
| Axios | Cliente HTTP com interceptores |
| React Router v6 | Roteamento SPA |
| SweetAlert2 | Alertas, toasts e confirmações |
| Lucide React | Ícones vetoriais animados |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- .NET SDK 8.0+
- Node.js v18+
- MySQL Server

---

### 1. Clone o repositório

```bash
git clone https://github.com/DevSanthiago/Ticket-System.git
cd Ticket-System
```

---

### 2. Configuração do Backend

**Navegue até a pasta da API:**
```bash
cd TicketSystem.API
```

**Crie o `appsettings.json` a partir do modelo:**
```bash
cp appsettings.Example.json appsettings.json
```

**Preencha as configurações no `appsettings.json`:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ticketsystem;User=root;Password=SUA_SENHA;"
  },
  "Jwt": {
    "Key": "SUA_CHAVE_SECRETA_MINIMO_32_CARACTERES",
    "Issuer": "TicketSystem.API",
    "Audience": "TicketSystem.Web",
    "ExpireHours": "8"
  },
  "SupportSettings": {
    "GroupLink": "https://chat.whatsapp.com/SEU_LINK"
  },
  "SupportAutomation": { "GroupLink": "https://chat.whatsapp.com/SEU_LINK" },
  "SupportSetup":      { "GroupLink": "https://chat.whatsapp.com/SEU_LINK" },
  "SupportTest":       { "GroupLink": "https://chat.whatsapp.com/SEU_LINK" },
  "SupportSoftware":   { "GroupLink": "https://chat.whatsapp.com/SEU_LINK" }
}
```

**Execute as migrations e inicie a API:**
```bash
dotnet ef database update
dotnet run
```

> A API iniciará em `https://localhost:7106`. O seed de linhas de produção e prefixos é executado automaticamente na primeira inicialização.

> A documentação Swagger estará disponível em `https://localhost:7106/swagger`.

---

### 3. Configuração do Frontend

**Navegue até a pasta do frontend:**
```bash
cd ../TicketSystem.Web
```

**Crie o arquivo de variáveis de ambiente:**
```bash
cp .env.example .env
```

**Preencha o `.env`:**
```env
VITE_API_BASE_URL=https://localhost:7106/api
```

**Instale as dependências e inicie o servidor:**
```bash
npm install
npm run dev
```

> O frontend estará disponível em `http://localhost:5173`.

---

## 🔐 Roles e Permissões

| Role | Abrir Ticket | Assumir (Setup/Automação/Teste) | Assumir (Software) | Cockpit ADM |
|---|:---:|:---:|:---:|:---:|
| `admin` | ✅ | ✅ | ✅ | ✅ |
| `requester` | ✅ | ❌ | ❌ | ❌ |
| `operator` | ✅ | ❌ | ❌ | ❌ |
| `setup-agent` | ❌ | ✅ (Setup) | ❌ | ❌ |
| `automation-agent` | ❌ | ✅ (Automação) | ❌ | ❌ |
| `test-agent` | ❌ | ✅ (Teste) | ❌ | ❌ |
| `software-agent` | ✅ | ❌ | ✅ (Software) | ❌ |
| `software-specialist` | ✅ | ✅ | ✅ | ❌ |
| `specialist` | ✅ | ✅ | ❌ | ❌ |

---

## ✉️ Contato

- **Desenvolvedor:** Johnatan dos Santos Reis
- **GitHub:** [DevSanthiago](https://github.com/DevSanthiago)
- **Projeto:** pessoal — Dev Santhiago

---

_Projeto pessoal de portfólio, distribuído sob a **Licença MIT**._
