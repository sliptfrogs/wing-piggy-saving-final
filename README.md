# Wing Piggy Saving: Your Smart Financial Companion

## Live Demo

Experience the application live: [https://wing-piggy-saving-final-uyp4.vercel.app](https://wing-piggy-saving-final-uyp4.vercel.app)

## Features

- **User Authentication**: Secure sign-up, sign-in, and session management.
- **Personalized Dashboard**: Overview of savings goals and transactions.
- **Piggy Goal Management**: Create, track, and manage multiple savings goals.
- **Transaction History**: Detailed log of all financial activities.
- **Real-time Notifications**: Timely alerts for account activities.
- **QR Code Functionality**: Generate and scan QR codes for payments and transfers.
- **Flexible Fund Transfers**: P2P, own piggy transfers, and contributions to goals.
- **User Profile Management**: Update personal information and settings.
- **Responsive Design**: Seamless experience across devices.

## Technologies Used

- **Framework**: Next.js 14.x (React)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x, shadcn/ui, Ant Design 6.x
- **State Management/Data Fetching**: React Query 5.x
- **Authentication**: NextAuth.js 4.x
- **Validation**: Zod 4.x
- **Forms**: React Hook Form 7.x
- **QR Code**: qrcode.react, html5-qrcode

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js: `^18.17.0` or `^20.5.0`
- pnpm: `npm install -g pnpm`
- Git

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

Create a `.env.local` file in the root and add:

```dotenv
NEXTAUTH_SECRET=YOUR_SECURE_RANDOM_STRING # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Running the Application

1.  **Development Mode:**

    ```bash
    pnpm dev
    ```

    Open `http://localhost:3000`.

2.  **Build for Production:**

    ```bash
    pnpm build
    ```

3.  **Start Production Server:**
    ```bash
    pnpm start
    ```

### Demo Accounts

You can use the following credentials to explore the application:

**Account 1:**

- **Email:** `bovuthey2019@gmail.com`
- **Password:** `kimsan`

**Account 2:**

- **Email:** `sliptfrogs@gmail.com`
- **Password:** `kimsan`

## Deployment

### Vercel Deployment

1.  Push code to a Git repository.
2.  Import project into Vercel.
3.  Configure environment variables in Vercel settings.

### Manual Deployment

1.  Build: `pnpm build`
2.  Copy `.next/` and `public/` to your server.
3.  Install production dependencies: `pnpm install --prod`
4.  Start: `pnpm start` (ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_API_URL` are set for production).
