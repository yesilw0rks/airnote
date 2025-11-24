
# airnote 🌬️

**Capture thoughts at the speed of light.**

airnote is a dual-interface note-taking application consisting of a **Web Dashboard** and a **Chrome Extension**. It features a beautiful dark mode, markdown support, and real-time syncing.

![airnote Logo](https://via.placeholder.com/150/000000/FFFFFF?text=airnote)

## Features

- **Markdown Support**: Write with style using `## Headers`, `**Bold**`, `*Italics*`, and more.
- **Spaces**: Organize your notes into different contexts (Work, Personal, General).
- **Dark Mode**: Designed for focus with a sleek, high-contrast dark theme.
- **Dual Sync**: 
  - Use the **Chrome Extension** to clip ideas while browsing.
  - Use the **Web App** for deep work and organization.

## Project Structure

- `/`: The React Web Application.
- `/extension`: The unpacked Chrome Extension files.

## Getting Started

### 1. The Web App

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open your browser to the local URL provided.

### 2. The Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the `extension` folder from this repository.
5. Pin the airnote extension to your toolbar and start writing!

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL)
- **Platform**: Web & Chrome Extension V3

## License

MIT
