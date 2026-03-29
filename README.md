# Wing Piggy Saving: Your Smart Financial Companion

![Project Badge](https://img.shields.io/badge/Status-Under%20Development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Project Overview

**Wing Piggy Saving** is a modern, full-stack personal finance application designed to empower users to achieve their savings goals with ease and confidence. Built as a digital piggy bank, it provides intuitive tools for setting financial targets, tracking progress, managing transactions, and facilitating secure fund transfers. With a focus on user experience and robust functionality, this application is ideal for individuals seeking to gain better control over their finances, save for specific objectives, and engage in seamless digital banking operations.

**Purpose**: To simplify personal savings management and foster financial literacy through an engaging and accessible platform.
**Target Audience**: Individuals of all ages looking for an intuitive way to manage their savings, track expenses, and conduct secure digital transfers.

---

## Key Features

- **Robust User Authentication**: Secure sign-up, sign-in, and session management powered by NextAuth.js, supporting JWT refresh for enhanced security.
- **Personalized Dashboard**: A comprehensive overview of current savings goals, recent transactions, and overall financial health.
- **Piggy Goal Management**: Create, track, and manage multiple savings goals with clear visual progress indicators. Contribute funds to your goals and monitor your journey towards financial milestones.
- **Transaction History**: Detailed log of all incoming and outgoing funds, providing transparency and aiding in financial analysis.
- **Real-time Notifications**: Stay informed with timely alerts regarding account activities, goal progress, and important system messages.
- **QR Code Functionality**: Generate dynamic QR codes for receiving payments or initiating transfers effortlessly. Scan QR codes for quick and secure transactions.
- **Flexible Fund Transfers**:
  - **Peer-to-Peer (P2P) Transfers**: Send money to other users within the platform.
  - **Own Piggy Transfers**: Move funds between your main account and your various piggy goals.
  - **Contribution Transfers**: Allow others to contribute directly to your specific piggy goals.
- **User Profile Management**: Update personal information, preferences, and security settings.
- **Administrative Panel**: (Implied) A dedicated section for administrators to manage users, system settings, and potentially resolve disputes.
- **Responsive Design**: A seamless experience across various devices, from desktops to mobile phones.

---

## Tech Stack

| Category                     | Technology                     | Description                                                         |
| :--------------------------- | :----------------------------- | :------------------------------------------------------------------ |
| **Framework**                | `Next.js 16.x`                 | React framework for production with App Router for modern routing.  |
| **Language**                 | `TypeScript 5.x`               | Statically typed JavaScript for improved code quality.              |
| **Styling**                  | `Tailwind CSS 3.x`             | Utility-first CSS framework for rapid UI development.               |
| **UI Components**            | `shadcn/ui`                    | Reusable UI components built with Radix UI and Tailwind CSS.        |
|                              | `Ant Design 6.x`               | Enterprise-class UI toolkit for rich web applications.              |
| **Animations**               | `Framer Motion 12.x`           | Production-ready motion library for React.                          |
| **State Mgmt/Data Fetching** | `React Query 5.x`              | Powerful asynchronous state management for caching, sync, & update. |
| **Authentication**           | `NextAuth.js 4.x`              | Flexible authentication for Next.js with JWT support.               |
| **Validation**               | `Zod 4.x`                      | TypeScript-first schema declaration and validation.                 |
| **Forms**                    | `React Hook Form 7.x`          | Performant, flexible, and extensible forms with easy validation.    |
| **HTTP Client**              | `Fetch API`                    | Native browser API for making HTTP requests. (Axios not used)       |
| **QR Code**                  | `qrcode.react`, `html5-qrcode` | Libraries for generating and scanning QR codes.                     |
| **Date Handling**            | `date-fns`, `dayjs`            | Modern JavaScript date utility libraries.                           |
| **Icons**                    | `lucide-react`                 | Beautifully crafted open-source icons.                              |
| **Theming**                  | `next-themes`                  | Theme provider for Next.js apps with dark mode support.             |
| **Testing**                  | `Jest` (Planned)               | JavaScript testing framework for unit tests.                        |
|                              | `Playwright` (Planned)         | Framework for end-to-end testing.                                   |

---

## Architecture

The project leverages Next.js's App Router to organize a modular and scalable architecture.

### Folder Structure & Design Decisions

```
.
├── app/                              # Next.js App Router (pages, layouts, API routes)
│   ├── (protected)/                  # Route Group: Authenticated user routes
│   │   ├── layout.tsx                # Protected layout (e.g., enforces authentication)
│   │   ├── page.tsx                  # Dashboard/default protected route
│   │   ├── admin/                    # Admin-specific pages
│   │   ├── dashboard/                # User dashboard
│   │   ├── history/                  # Transaction history
│   │   ├── notifications/            # User notifications
│   │   ├── piggy/                    # Piggy goal management
│   │   │   ├── [id]/                 # Dynamic route for specific piggy goal details
│   │   │   └── create/               # Create new piggy goal
│   │   ├── profile/                  # User profile
│   │   ├── qr/                       # QR code scanning
│   │   ├── qr-generate/              # QR code generation
│   │   └── transfer/                 # Fund transfer interface
│   ├── (public)/                     # Route Group: Publicly accessible routes
│   │   └── auth/                     # Authentication pages
│   │       ├── otp/                  # OTP verification
│   │       ├── sign-in/              # Login page
│   │       └── sign-up/              # Registration page
│   ├── api/                          # Next.js API Routes
│   │   ├── auth/                     # Authentication API (e.g., NextAuth.js handlers)
│   │   ├── qr/                       # QR-related API endpoints
│   │   ├── transfer/                 # Fund transfer API endpoints
│   │   └── webhook/                  # Webhook handlers
│   ├── lib/                          # Shared utilities and configurations for the app directory
│   ├── providers/                    # React Context Providers (e.g., SessionProvider)
│   ├── types/                        # Global TypeScript type declarations for app-specific types
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx                    # Root layout
│   ├── not-found.tsx                 # Custom 404 page
│   ├── page.tsx                      # Root public page
│   └── theme-provider.tsx            # Theme context provider
├── components/                       # Reusable UI components
│   ├── app-layout.tsx                # Application shell/layout components
│   └── ui/                           # Shadcn/ui & custom atomic components (buttons, inputs, dialogs, etc.)
├── hooks/                            # Custom React Hooks for encapsulating logic
│   ├── api/                          # Hooks for API interactions (e.g., useAccount, usePiggyGoal)
│   ├── auth/                         # Hooks for authentication-related logic (e.g., useSession)
│   └── ui/                           # Hooks for UI-related functionality (e.g., useClickOutside)
│   └── utils/                        # General utility hooks (e.g., useDebounce, useLocalStorage)
├── lib/                              # Backend-agnostic core libraries, utils, and configurations
│   ├── api/                          # API client configurations, interceptors, types, and services
│   │   ├── client.ts                 # HTTP client setup (e.g., base URL, headers)
│   │   ├── endpoints.ts              # Centralized API endpoint definitions
│   │   ├── interceptors.ts           # Request/response interceptors (e.g., for auth tokens)
│   │   └── services/                 # Functions for specific API calls (e.g., authService, transferService)
│   ├── auth.ts                       # NextAuth.js configuration
│   ├── queryKeys.ts                  # Centralized keys for React Query caching
│   ├── types/                        # Shared TypeScript types for API payloads and data models
│   ├── utils.ts                      # General utility functions
│   └── zod/                          # Zod schemas for validation (API responses, forms)
├── public/                           # Static assets (images, fonts)
├── types/                            # Global TypeScript type definitions
├── ... (config files like next.config.ts, tailwind.config.ts, tsconfig.json)
```

**Design Decisions:**

- **Route Groups (`(protected)`, `(public)`)**: Organizes routes based on access control, enhancing clarity and simplifying middleware implementation.
- **Custom Hooks (`hooks/`)**: Encapsulates component logic, API fetching (`hooks/api/`), and UI interactions (`hooks/ui/`) for reusability and cleaner components.
- **Service Layer (`lib/api/services/`)**: Decouples API interaction logic from components and hooks, making it easier to manage API calls, error handling, and data transformation.
- **Next.js API Routes (`app/api/`)**: Provides a seamless full-stack development experience, allowing frontend and backend logic to reside within the same project.
- **Shared Libraries (`lib/`)**: Centralizes configurations, utility functions, and type definitions for consistency across the application.
- **`shadcn/ui` Integration**: Leverages headless UI components with full styling control via Tailwind CSS, promoting consistency and developer efficiency.

### Data Flow (Text Description)

1.  **User Interaction**: A user interacts with the UI (e.g., clicks a button, submits a form) on a Next.js client component or server component.
2.  **Event Handling**: The UI triggers an event, which is typically handled by a React component or a custom hook.
3.  **Data Fetching/Mutation**:
    - For data fetching, a custom hook (e.g., `usePiggyGoal` from `hooks/api/`) uses `React Query` to make an API request.
    - For data mutations (e.g., transfers), the custom hook calls a service function (e.g., `transferService.createTransfer` from `lib/api/services/`).
4.  **API Service Layer**: The service function constructs the HTTP request (using `Fetch API` or a configured client from `lib/api/client.ts`), potentially applies interceptors (`lib/api/interceptors.ts` for adding auth tokens, error handling), and sends it to a Next.js API Route or an external backend.
5.  **Next.js API Route/Backend**: The API route (e.g., `app/api/transfer/route.ts`) processes the request, validates input using `Zod` schemas, interacts with the database (not explicitly shown in project structure, assumed external), and returns a response.
6.  **Data Invalidation/Update**: `React Query` automatically handles caching and data invalidation on successful mutations, ensuring the UI reflects the latest state.
7.  **UI Update**: The component re-renders with the updated data, providing real-time feedback to the user.

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js**: `^18.17.0` or `^20.5.0` (LTS versions recommended).
- **pnpm**: Recommended package manager.
  ```bash
  npm install -g pnpm
  ```
- **Git**: For cloning the repository.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/wing-piggy-saving-final.git
    cd wing-piggy-saving-final
    ```
2.  **Install PNPM dependencies:**
    ```bash
    pnpm install
    ```

### Environment Variables

Create a `.env.local` file in the root of your project and populate it with the following environment variables:

```dotenv
# NextAuth.js Secret - Generate a strong secret: openssl rand -base64 32
NEXTAUTH_SECRET=YOUR_SECURE_RANDOM_STRING

# NextAuth.js URL - Base URL of your application
NEXTAUTH_URL=http://localhost:3000

# Public API URL - URL of your backend API
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

**Note:** The `NEXT_PUBLIC_API_URL` is used for client-side API requests. Ensure your backend is running and accessible at this URL. The `next.config.ts` also shows a rewrite for `/api/proxy` to `http://localhost:8080/api/v1`, indicating a potential proxy setup.

### Running the Application

1.  **Run in Development Mode:**

    ```bash
    pnpm dev
    ```

    This will start the development server. Open your browser and navigate to `http://localhost:3000`. The application will hot-reload on changes.

2.  **Build for Production:**

    ```bash
    pnpm build
    ```

    This command optimizes the application for production deployment.

3.  **Start Production Server:**
    ```bash
    pnpm start
    ```
    After building, this command serves the optimized production build.

---

## Project Structure

A tree view of the significant directories and their purpose:

```
wing-piggy-saving-final/
├── app/                                    # Next.js App Router (pages, layouts, API routes)
│   ├── (protected)/                        # Routes requiring authentication
│   ├── (public)/                           # Publicly accessible routes
│   └── api/                                # Backend API Routes
├── components/                             # Reusable React components
│   ├── app-layout.tsx                      # Main layout components
│   └── ui/                                 # Atomic UI components (shadcn/ui based)
├── hooks/                                  # Custom React Hooks
│   ├── api/                                # API interaction hooks (e.g., useAccount)
│   ├── auth/                               # Authentication-related hooks (e.g., useSession)
│   ├── ui/                                 # UI-specific hooks (e.g., useClickOutside)
│   └── utils/                              # General utility hooks (e.g., useDebounce)
├── lib/                                    # Core libraries, utilities, and configurations
│   ├── api/                                # API client, endpoints, interceptors, services
│   ├── auth.ts                             # NextAuth.js configuration
│   ├── queryKeys.ts                        # React Query cache keys
│   ├── types/                              # Shared TypeScript types for data models
│   └── zod/                                # Zod schemas for validation
├── public/                                 # Static assets (images, fonts)
├── types/                                  # Global TypeScript type definitions
├── next.config.ts                          # Next.js configuration
├── package.json                            # Project dependencies and scripts
├── pnpm-lock.yaml                          # PNPM lock file
├── tailwind.config.ts                      # Tailwind CSS configuration
├── tsconfig.json                           # TypeScript configuration
└── ...
```

---

## Core Features Deep Dive

### Authentication

Implemented using **NextAuth.js**, the authentication flow is secure and flexible. It supports standard credentials-based login and manages user sessions via JSON Web Tokens (JWTs).

- **JWT Refresh**: The system is configured to handle JWT token rotation and refreshing to maintain session validity and enhance security without requiring frequent re-logins. This is typically managed via callbacks in `lib/auth.ts` and `app/api/auth/[...nextauth]/route.ts`.
- **Session Management**: User session data, including tokens and user information, is securely stored and accessible via `useSession` hook (`hooks/auth/useSession.ts`).
- **Protected Routes**: Route groups (`app/(protected)/`) are used in conjunction with Next.js middleware (`middleware.ts`) to enforce authentication, redirecting unauthenticated users to login pages.

### QR Code Generation and Scanning

The application integrates robust QR code functionalities:

- **Generation**: Users can generate dynamic QR codes (`app/(protected)/qr-generate/page.tsx`) using `qrcode.react`. These QR codes can encode various types of information, such as payment requests or piggy goal contribution links.
- **Display**: The `components/ui/qr-display.tsx` component handles the rendering of QR codes.
- **Scanning**: The `app/(protected)/qr/page.tsx` likely uses `html5-qrcode` to enable scanning of QR codes via the device's camera, facilitating quick actions like fund transfers or linking to specific piggy goals.
- **API Interaction**: The `app/api/qr/` endpoints and `hooks/api/useQr.ts` manage the backend logic for QR code data processing and associated actions.

### Piggy Goal Management

The core of the savings functionality revolves around piggy goals:

- **Creation**: Users can create new piggy goals (`app/(protected)/piggy/create/page.tsx`), defining targets, names, and potentially categories.
- **Tracking**: Each goal's progress is visually tracked (`app/(protected)/piggy/[id]/page.tsx`), showing contributions and the remaining amount needed.
- **Contributions**: Users can contribute funds to their own piggy goals or receive contributions from others via the transfer mechanism.
- **Data Models**: Types for piggy goals are defined in `lib/types/piggy.ts`. API interactions are handled via `hooks/api/usePiggyGoal.ts` and related service functions.

### Fund Transfers

A versatile transfer system supports multiple scenarios:

- **Peer-to-Peer (P2P)**: Direct transfers between users' main accounts (`lib/types/p2p-transfer.ts`).
- **Own Piggy Transfer**: Internal transfers from a user's main account to one of their piggy goals (`lib/types/own-piggy-transfer.ts`).
- **Contribute to Piggy**: Transfers initiated by one user to contribute directly to another user's public piggy goal (`lib/types/contribute-transfer.ts`).
- **API Endpoints**: The `app/api/transfer/` routes handle the server-side logic for processing and recording these transactions.
- **Hooks**: `hooks/api/useTransfer.ts` provides the client-side interface for initiating various transfer types.

---

## API Endpoints

The application exposes several API endpoints for managing various functionalities:

- **`/api/auth/...`**: NextAuth.js API routes for authentication (sign-in, sign-out, session, callbacks).
- **`/api/qr`**: Endpoints related to QR code generation data and scanning operations.
- **`/api/transfer`**: Endpoints for initiating and managing different types of fund transfers (P2P, piggy contributions, etc.).
- **`/api/webhook`**: Handlers for external service webhooks (e.g., payment gateways, notifications).
- **`/api/session`**: Likely for retrieving and managing user session data.

---

## Performance Optimizations

- **React Query Caching**: Aggressive client-side data caching and intelligent invalidation reduce redundant API calls and improve perceived performance.
- **Conditional Data Fetching**: Data is fetched only when necessary, often triggered by component mounting or specific user actions.
- **Code Splitting**: Next.js automatically splits code, loading only the JavaScript needed for the current page, resulting in faster initial page loads.
- **Image Optimization**: Next.js `Image` component is likely used for optimized image delivery (though not explicitly checked, it's a common Next.js pattern).
- **Client-side Hydration**: Efficient hydration of React components to ensure quick interactivity.
- **Blob URL Cleanup**: (Inferred for QR generation/image handling) Proper cleanup of temporary Blob URLs to prevent memory leaks.

---

## Security Considerations

- **JWT Refresh Tokens**: Implemented through NextAuth.js, ensuring that session tokens are regularly renewed, minimizing the risk associated with compromised tokens.
- **Input Validation (Zod)**: Comprehensive server-side and client-side validation of all user inputs and API payloads using Zod schemas, preventing common vulnerabilities like injection attacks and malformed data.
- **CORS Configuration**: Properly configured Cross-Origin Resource Sharing (CORS) policies on API routes to restrict access to trusted origins.
- **Environment Variables**: Sensitive information (API keys, secrets) is stored and accessed securely via environment variables, not hardcoded into the codebase.
- **CSRF Protection**: NextAuth.js provides built-in Cross-Site Request Forgery (CSRF) protection for all authenticated routes.
- **HTTPS Only**: (Assumed for production deployment) Enforcing HTTPS to encrypt all communication between the client and server.

---

## Testing Strategy

The project aims for a robust testing strategy to ensure reliability and maintainability.

- **Unit Testing (Planned with Jest)**: Individual functions, components, and utility modules will be tested in isolation using Jest to verify their correctness.
- **End-to-End Testing (Planned with Playwright)**: Comprehensive E2E tests using Playwright will simulate user interactions across the application to ensure critical user flows work as expected from start to finish.

---

## Deployment

The application is built for easy deployment to modern hosting platforms.

### Vercel Deployment

Being a Next.js application, deployment to [Vercel](https://vercel.com/) is straightforward:

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import your project into Vercel.
3.  Vercel automatically detects Next.js and deploys your application.
4.  Configure environment variables in your Vercel project settings.

### Manual Deployment

For other environments:

1.  Build the application: `pnpm build`
2.  Copy the `.next/` folder and `public/` assets to your server.
3.  Install dependencies: `pnpm install --prod` (only production dependencies).
4.  Start the application: `pnpm start` (ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_API_URL` are correctly set for the production environment).

---

## Contributing

We welcome contributions to the Wing Piggy Saving project! To contribute:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b bugfix/issue-description`.
3.  **Make your changes**, ensuring they adhere to the existing code style.
4.  **Write clear, concise commit messages** following a conventional commit style (e.g., `feat: add new piggy goal creation form`, `fix: resolve auth redirect bug`).
5.  **Test your changes** thoroughly.
6.  **Submit a Pull Request** to the `main` branch with a detailed description of your changes.

### Code Style

This project uses ESLint for linting and Prettier for code formatting. Ensure your code is formatted correctly before submitting a PR.

```bash
pnpm lint # To check for linting errors
pnpm format # (if a format script exists, or run prettier directly)
```

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

**Made with ❤️ by [Your Name/Organization]**
