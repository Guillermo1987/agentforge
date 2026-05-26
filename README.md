# AgentForge — AI Agent Deployment Platform

> **SaaS · AI Automation** · React + Firebase + n8n + Claude · Despliegue de agentes IA en menos de 1 hora
> **Status:** In development · 2026-05

[![Portfolio](https://img.shields.io/badge/Portfolio-proyectos--personales.web.app-60a5fa?style=for-the-badge&logo=firebase&logoColor=white)](https://proyectos-personales.web.app)
[![Stack](https://img.shields.io/badge/Stack-React%20+%20Firebase%20+%20n8n-6366f1?style=for-the-badge&logo=react&logoColor=white)](.)
[![Wiki](https://img.shields.io/badge/Wiki-Documentación-a78bfa?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mindset-code/agentforge/wiki)

---

## Project Status

| Phase | Status |
|---|---|
| Definición de arquitectura y stack | Done |
| MVP — catálogo de agentes + onboarding | In progress |
| Integración n8n + Claude API | Planned |
| Dashboard de monitoreo de agentes | Planned |
| Deploy a producción (Firebase) | Planned |

**Current phase:** diseño de arquitectura y MVP inicial.

---

## Project Overview

**AgentForge** es una plataforma SaaS que permite a agencias y consultoras desplegar agentes IA personalizados para sus clientes en menos de 1 hora, sin necesidad de conocimientos técnicos avanzados.

El stack combina **React** (frontend), **Firebase** (hosting + Firestore), **n8n** (orquestación de workflows) y **Claude** (Anthropic) como motor de razonamiento de los agentes. La plataforma abstrae la complejidad técnica de los LLMs y expone una interfaz de configuración no-code orientada a negocios.

---

## Key Features (planificadas)

- **Catálogo de agentes:** plantillas predefinidas por industria (ventas, soporte, marketing, datos)
- **Onboarding guiado:** configurar y desplegar un agente en < 60 minutos
- **Orquestación n8n:** flujos de trabajo visuales que conectan el agente con CRMs, correo, Slack
- **Dashboard de monitoreo:** métricas de uso, conversaciones, latencia y costos por agente
- **Multitenancy:** cada cliente tiene sus agentes aislados con su propia configuración

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Auth | Firebase Auth |
| Database | Firestore (Firebase Spark) |
| Hosting | Firebase Hosting |
| Workflows | n8n (self-hosted) |
| AI Engine | Claude (Anthropic) via API |

---

## Repository Structure

```
agentforge/
├── src/
│   ├── App.jsx
│   ├── pages/          # Landing, Dashboard, Catalog, Onboarding
│   └── components/     # UI components
├── public/
├── firebase.json
├── .firebaserc
└── README.md
```

---

## How to Run

```bash
git clone https://github.com/mindset-code/agentforge.git
cd agentforge
npm install
npm run dev   # localhost:5173
```

---

## Links

- **Wiki:** [Documentación técnica](https://github.com/mindset-code/agentforge/wiki)
- **Portfolio:** [proyectos-personales.web.app](https://proyectos-personales.web.app)
- **LinkedIn:** [Mindset & Code](https://www.linkedin.com/company/mindset-code)
- **Email:** contacto@mindset-code.com

---

*Built by [Mindset & Code](https://github.com/mindset-code) · Data & BI Analyst · MBA · ISC2 CC*
