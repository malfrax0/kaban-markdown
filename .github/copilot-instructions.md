# Galactic Mission Control (KanbanMarkdown) - Project Instructions

This document provides a comprehensive overview of the `KabanMarkdown` project. It describes the architecture, technology stack, directory structure, and specific behaviors of the application. Use this document as a primary reference when generating code or making modifications.

## 1. Project Overview

**Galactic Mission Control** is a web-based Kanban application that manages tasks using a **local file system** of Markdown files. It is designed to be a "Space/Sci-Fi" themed project management tool where data ownership remains with the user (text files on disk).

### Core Philosophy

- **Markdown as Database**: The application does not use a traditional database. The state is strictly derived from the file system.
- **Client-Server Architecture**: A Node.js backend reads/writes files; a React frontend visualizes them.
- **Galactic Theme**: The UI uses a dark, space-themed palette with glassmorphism effects.
- **Monorepo**: Managed via `pnpm` workspaces.

## 2. Technology Stack

### General

- **Package Manager**: `pnpm`
- **Containerization**: Docker & Docker Compose (Multi-stage builds)

### Server (`/server`)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Key Libraries**:
  - `dotenv`: Environment variable management.
  - `cors`, `body-parser`: Middleware.
  - Native `fs/promises`: File system operations.

### Client (`/client`)

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **UI Framework**: Material UI (MUI) v7
- **Styling**: `@emotion/react`, `@emotion/styled`
- **Key Libraries**:
  - `@hello-pangea/dnd`: Drag and drop functionality for Kanban board.
  - `@monaco-editor/react`: VS Code-like editor integration for raw file editing.
  - `axios`: API communication.

## 3. Directory Structure

```text
/
├── client/                 # Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components (TaskCard, BoardColumn, Modals)
│   │   ├── pages/          # Route views (HomePage, BoardPage)
│   │   ├── api.ts          # Axios setup and API endpoints
│   │   ├── theme.ts        # MUI Theme Definition (Galactic Palette)
│   │   └── types.ts        # Shared TypeScript interfaces (mirrors server)
│   ├── .env                # Runtime environment vars (VITE_API_URL)
│   └── vite.config.ts
├── server/                 # Backend Application
│   ├── src/
│   │   ├── services/       # Business Logic
│   │   │   ├── MarkdownService.ts  # Logic to parse MD -> Kanban Object
│   │   │   └── ProjectService.ts   # Logic to manage FS operations
│   │   ├── index.ts        # Express App Entrypoint & Routes
│   │   └── types.ts        # Shared TypeScript interfaces
│   └── .env                # Runtime environment vars (RESOURCES_DIR)
├── resources/              # Data Directory (Docker Volume Mount)
│   └── demo-project/       # Example Project
│       ├── index.json      # Project Metadata
│       ├── todo.md         # "Todo" Column
│       └── ongoing.md      # "On Going" Column
├── Dockerfile              # Multi-stage production build
├── docker-compose.yaml     # Dev/Prod orchestration
├── pnpm-workspace.yaml     # Monorepo config
└── package.json            # Root scripts
```

## 4. Data Model & Parsing Logic

The application maps directory structures and Markdown syntax to a strict Object Model.

### Project

- **Definition**: A folder inside `resources/` containing an `index.json`.
- **Metadata (`index.json`)**:
  ```json
  {
    "name": "Project Name",
    "description": "Short description",
    "background_image": "URL to image"
  }
  ```

### Column

- **Definition**: A `.md` file inside a Project folder.
- **ID**: Filename without extension (e.g., `ongoing`).
- **Title**: The **H1** header (`# Title`).
- **Content**: Contains multiple Tasks.

### Task

- **Definition**: A section starting with **H2** (`## `) and ending at the next H2.
- **Title**: The text after `##`.
- **Metadata (H3 Sections)**:
  - Sub-sections marked with **H3** (`### `) are parsed into the `metadata` object.
  - `### Description` -> `task.metadata.description`
  - `### Acceptance` -> `task.metadata.acceptance`
  - `### Tasks` -> `task.metadata.subtasks`
- **Subtasks**: Parsed from lists like `- [ ]` or `[ ]` inside the `### Tasks` section.

## 5. Key Features

### Backend API

- `GET /api/projects`: List all valid projects.
- `GET /api/projects/:id`: Parse and return full project state (Columns & Tasks).
- `PUT /api/projects/:id/files/:filename`: Save **raw** text content to a specific file (used by the Editor).
- **Static Serving**: The server serves the built React app from `client/dist` and handles SPA routing via a wildcard regex `new RegExp('(.*)')`.

### Frontend UI

- **Home Page**: Grid of projects with background images.
- **Kanban Board**:
  - Horizontal scrolling list of Columns.
  - Vertical lists of Task Cards.
  - Drag and drop (visual only currently, requires persistence implementation).
- **Task Detail Modal**: Read-only view of parsed metadata (Description, Checklists).
- **Raw Editor (Monaco)**:
  - Accessible via "Edit" icon on columns.
  - Opens the raw Markdown file content.
  - Allows saving changes directly to disk (Server API).

## 6. Development & Deployment

### Environment Variables

| Service    | Variable        | Description              | Default                                  |
| :--------- | :-------------- | :----------------------- | :--------------------------------------- |
| **Server** | `PORT`          | Listening port           | `3001`                                   |
| **Server** | `RESOURCES_DIR` | Path to data folder      | `../resources` (relative to server root) |
| **Client** | `VITE_API_URL`  | Wrapper for API requests | `http://localhost:3001/api`              |

### Commands

Run from **Root**:

- `pnpm install`: Install strict dependencies.
- `pnpm dev:server`: Start Backend (Watch mode).
- `pnpm dev:client`: Start Frontend (Vite).
- `pnpm build`: Build production artifacts for both.
- `pnpm start`: Start production server.

### Docker

- Uses a **Multi-Stage Build**:
  1. `base`: Setup pnpm.
  2. `build`: Build client and server.
  3. `runtime`: Copy artifacts, install server prod deps, expose port 3001.
- **Volume**: Mounts local `./resources` to `/app/resources` in the container.

## 7. Configuration Details

- **Theme**: Defined in `client/src/theme.ts`. Custom colors:
  - Primary: Nebular Blue (`#4A90E2`)
  - Secondary: Stellar Purple (`#9013FE`)
  - Background: Deep Void (`#0B0E14`)
  - Paper: (`#151922`) with blur filters.
