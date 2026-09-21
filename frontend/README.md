# Thunder Kanban Frontend

A modern, highly interactive, production-grade Kanban Board user interface built with React, TypeScript, and Vite. Features fluid drag-and-drop task organization, real-time validations, state persistence, and seamless Google (Gmail) OAuth2 authentication.

---

## ⚡ Features

* **Visual Kanban Layout**: Organize tasks into columns (Backlog, Todo, In Progress, Done).
* **Drag-and-Drop**: Fluid, animations-powered drag-and-drop of tasks between columns using `@dnd-kit`.
* **Google OAuth2 / Gmail Sign-In**: Fully integrated Google Identity Services login button and "One Tap" dropdown.
* **JWT Authentication**: Secure login/registration with automatic silent token refresh via HTTPOnly cookies.
* **Task Actions**: Custom dialogs to create, edit, preview task details, delete, and change priorities (Low, Medium, High).
* **Board Operations**: Create new boards, delete boards, and duplicate existing boards.
* **Instant Initial Load**: Cache layer via Zustand and LocalStorage to prevent screen flicker and minimize API queries.

---

## 🛠️ Technology Stack

* **React 18**: Frontend UI library.
* **TypeScript**: Type-safe development.
* **Vite**: Ultra-fast hot-reloading bundler.
* **Tailwind CSS**: Rapid utility-first styling.
* **Zustand**: Lightweight global state management.
* **dnd-kit**: Flexible, modular drag-and-drop framework.
* **React Hook Form & Zod**: Schema validation for register, login, and edit forms.
* **Axios**: Custom HTTP client with interceptors for auth headers and token auto-refresh.

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: Version 18.0 or higher
* **npm**: Version 9.0 or higher

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env` file (or edit `.env.local`):
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173`.

---

## 🔑 Google Authentication Setup

To configure Google Sign-In:
1. Obtain an OAuth 2.0 Web Client ID from the [Google Cloud Console](https://console.cloud.google.com/).
2. Add your local development port (typically `http://localhost:5173`) to Google's **Authorized JavaScript Origins**.
3. Copy the Client ID and paste it into the `VITE_GOOGLE_CLIENT_ID` environment variable in your frontend `.env`.

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── api/            # HTTP client configuration, error interceptors, and endpoint routes
│   ├── assets/         # App logo, imagery, and static assets
│   ├── components/     # App-wide UI components (Modals, Buttons, Inputs, Layouts)
│   ├── features/       # Feature-centric modules
│   │   ├── auth/       # Login, Register, Google login integration, and auth store
│   │   ├── boards/     # Board management components, lists, cards, and custom hooks
│   │   └── kanban/     # Active board view, column containers, drag-and-drop logic
│   ├── pages/          # Full route pages (Dashboard, Login, Register, Landing Page)
│   ├── services/       # Cache management, token handlers, and global utility services
│   ├── styles/         # Global styling rules, animations, and Tailwind imports
│   ├── App.tsx         # Route registry and top-level providers
│   └── main.tsx        # Entry point wrapping GoogleOAuthProvider
```
