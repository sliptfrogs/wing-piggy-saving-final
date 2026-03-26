# Wing Piggy Saving Final

This project appears to be a comprehensive personal finance or savings application, dubbed "Wing Piggy Saving," built with modern web technologies. It aims to provide users with tools for managing their savings goals (piggy banks), tracking transactions, and facilitating transfers, possibly including QR code-based operations. The architecture suggests a robust, scalable, and secure platform.

## Features

*   **User Authentication**: Secure sign-up, sign-in, and session management using `next-auth`.
*   **Admin Panel**: Dedicated section for administrative functionalities.
*   **Dashboard**: Overview of user's financial activities and savings progress.
*   **Piggy Bank Management**: Create, view, and manage individual savings goals with detailed tracking (`piggy/page.tsx`, `piggy/[id]`, `piggy/create`).
*   **Transaction History**: View a detailed history of all financial transactions (`history/page.tsx`).
*   **Notifications**: System for alerting users about important account activities (`notifications/page.tsx`).
*   **QR Code Functionality**: Generate and scan QR codes for various operations, likely for transfers or account linking (`qr/page.tsx`, `qr-generate/page.tsx`, `components/ui/qr-display.tsx`).
*   **Fund Transfers**: Facilitate peer-to-peer (P2P) and other types of transfers (`transfer/page.tsx`, `lib/types/p2p-transfer.ts`, `lib/types/own-piggy-transfer.ts`, `lib/types/contribute-transfer.ts`).
*   **User Profile Management**: Section for users to manage their personal information (`profile/page.tsx`).
*   **API Integrations**: Backend API routes for authentication, QR, transfers, and webhooks.

## Technologies Used

*   **Next.js**: React framework for production-grade applications, providing server-side rendering (SSR), static site generation (SSG), and API routes.
*   **React**: JavaScript library for building user interfaces.
*   **TypeScript**: Statically typed superset of JavaScript for enhanced code quality and developer experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
*   **Ant Design**: UI library (observed usage in `app/antd/dist`) for rich and interactive user interface components.
*   **Zod**: TypeScript-first schema declaration and validation library, used for API response and form validation (`lib/zod/`).
*   **NextAuth.js**: Authentication library for Next.js applications (`lib/auth.ts`, `app/types/next-auth.d.ts`).
*   **SWR (Stale-While-Revalidate)**: Likely used for data fetching (indicated by `hooks/api/useApi.ts` and other `use*.ts` files).

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or pnpm (preferred, as `pnpm-lock.yaml` is present)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/wing-piggy-saving-final.git
    cd wing-piggy-saving-final
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    # or npm install
    ```

### Environment Variables

Create a `.env.local` file in the root of the project and add the necessary environment variables. These typically include:

```
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost:3000
# Add any other API keys or database connection strings here
```

### Running the Application

1.  **Development Mode:**
    ```bash
    pnpm dev
    # or npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

2.  **Build for Production:**
    ```bash
    pnpm build
    # or npm run build
    ```

3.  **Start Production Server:**
    ```bash
    pnpm start
    # or npm run start
    ```

## Project Structure

The project follows a standard Next.js application structure with additional organization for clarity and maintainability:

*   `app/`: Contains all route-based components, API routes, and global styles/providers.
    *   `(protected)/`: Routes requiring authentication.
    *   `(public)/`: Publicly accessible routes, including authentication pages.
    *   `api/`: Backend API routes.
    *   `lib/`: Shared utility functions, types, and schema definitions.
    *   `providers/`: React Context providers.
*   `components/`: Reusable React components, categorized into general components and `ui` components (likely Shadcn UI or similar).
*   `hooks/`: Custom React hooks for encapsulating reusable logic.
    *   `api/`: Hooks specifically for interacting with the backend API.
    *   `auth/`: Authentication-related hooks.
    *   `ui/`: UI-related hooks.
*   `lib/`: Core utilities, API client, authentication logic, and shared types.
*   `public/`: Static assets.
*   `types/`: Global TypeScript type definitions.

## API Endpoints

The application includes several API endpoints under `app/api/` for managing:

*   Authentication (`auth/`)
*   QR Code operations (`qr/`)
*   Fund Transfers (`transfer/`)
*   Webhooks (`webhook/`)

## Contributing

Contributions are welcome! Please follow standard GitHub flow: fork the repository, create a branch for your feature or bug fix, commit your changes, and open a pull request.

## License

[MIT License](LICENSE) (Assuming an MIT license based on common practice; please create a `LICENSE` file if one does not exist).