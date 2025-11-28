
# System Context: AirNote

## Project Overview
AirNote is a dual-interface note-taking application designed for speed and focus. It consists of two synchronized parts:
1.  **Web Dashboard**: A React SPA for managing, editing, and organizing notes.
2.  **Chrome Extension**: A browser popup for quick capture, URL saving, and text selection autocomplete.

## Tech Stack
-   **Frontend**: React 18, Tailwind CSS (Dark Mode default), Lucide React (UI Icons).
-   **Build Tool**: Parcel.
-   **Backend/DB**: Supabase (PostgreSQL, Auth, Realtime).
-   **Hosting**: Vercel (SPA Routing configured).

## Critical Instructions for AI Assistants

### 1. Interaction Style
*   **NO CHATTER**: Do not explain what you are doing. Do not wrap code in markdown blocks within the conversational text.
*   **DIRECT UPDATES**: Always output the full XML block `<changes><change>...</change></changes>` to update files directly.
*   **FULL FILES**: When updating a file, provide the **complete** file content, not just diffs, unless specifically instructed otherwise.

### 2. Branding & Assets
*   **Logos**: The app uses a custom image file for branding.
    *   **Web**: `/icon.png` (in public/root).
    *   **Extension**: `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`.
*   **UI Icons**: Use `lucide-react` for interface elements (save, edit, trash, etc.).
*   **Theme**: Dark mode is forced. Colors are `zinc-900` (bg), `zinc-800` (surface), and `sky-400` (accent).

### 3. Authentication & Security
*   **Provider**: Supabase Email/Password.
*   **Backdoor**: There is a hardcoded **Preset Admin Account** for testing without email confirmation.
    *   Email: `admin@airnote`
    *   Password: `Airnote123`
    *   **DO NOT REMOVE THIS LOGIC** from `Auth.tsx`, `index.tsx`, or `extension/popup.js`.
*   **RLS**: Row Level Security is currently **DISABLED** on the `notes` table to allow the extension to write easily.

### 4. Chrome Extension Specifics
*   **Manifest V3**: Uses `manifest.json` version 3.
*   **Permissions**: Requires `storage`, `activeTab`, and `scripting` to function.
*   **Ghost Text Feature**: The extension injects a script into the active tab to grab selected text and the full URL (`window.location.href`). It displays this as "Ghost Text" behind the textarea, confirmable via the `TAB` key.
*   **DOM**: The extension does *not* use React. It uses vanilla JS (`popup.js`) and HTML/CSS (`popup.html`) to remain lightweight.

### 5. Deployment
*   **Vercel**: The project is deployed on Vercel. `vercel.json` handles rewrites for SPA routing (`/(.*)` -> `/index.html`).
*   **Build**: The build command is `parcel build`.

## Project Structure
```text
/
├── components/       # React Components (Auth, Sidebar, NoteList, etc.)
├── extension/        # Chrome Extension Source (Vanilla JS/HTML)
│   ├── icons/        # Extension Icons (manually managed)
│   ├── manifest.json
│   ├── popup.html
│   └── popup.js
├── lib/              # Shared utilities (Supabase client, types)
├── utils/            # Helper functions (Markdown parser)
├── index.html        # Web App Entry Point
├── index.tsx         # React Entry Point
└── package.json
```
