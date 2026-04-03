# Wing Piggy Saving: Your Smart Financial Companion

Wing Piggy Saving is a comprehensive personal finance management application designed to help users save smarter, track their goals, and manage transactions with ease. Built with modern web technologies, it offers a secure and intuitive experience for managing your financial journey.

## 🚀 Live Demo

Experience the application live: [https://wing-piggy-saving-final-uyp4.vercel.app](https://wing-piggy-saving-final-uyp4.vercel.app)

## ✨ Features

### 👤 User Experience

- **Secure Authentication**: Robust sign-up, sign-in, and session management using NextAuth.js.
- **Personalized Dashboard**: A centralized overview of your savings goals, recent activities, and account status.
- **User Profile Management**: Easily update personal information and account settings.

### 🐷 Savings & Goals

- **Piggy Goal Management**: Create, track, and manage multiple savings goals with specific targets and deadlines.
- **Visual Progress**: Real-time tracking of goal completion with intuitive progress indicators.
- **Goal Contributions**: Seamlessly add funds to your specific savings goals.

### 💸 Transactions & Transfers

- **Flexible Fund Transfers**: Support for P2P (Peer-to-Peer) transfers, transfers between own accounts, and goal contributions.
- **Transaction History**: A detailed, searchable, and paginated log of all financial activities.
- **QR Code Functionality**: Generate personal QR codes for receiving funds and scan others' codes for quick payments/transfers.

### 🛡️ Admin Capabilities

- **Transaction Management**: Administrative view of all platform-wide transactions.
- **Transaction Reversal**: Ability for administrators to reverse completed transactions if necessary.
- **System Overview**: High-level statistics on platform volume and activity.

### 📱 Modern Interface

- **Responsive Design**: A mobile-first, fully responsive UI that works perfectly on desktops, tablets, and smartphones.
- **Real-time Notifications**: Instant alerts for important account activities and updates.
- **Dark Mode Support**: Built-in theme switching for a comfortable viewing experience.

## 🛠️ Technologies Used

- **Framework**: [Next.js 16.2.1](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.x](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.x](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Ant Design 6.x](https://ant.design/)
- **State Management/Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Forms**: [React Hook Form v7](https://react-hook-form.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **QR Code**: `qrcode.react`, `html5-qrcode`

## 📂 Project Structure

```text
├── app/                  # Next.js App Router (Pages, Layouts, APIs)
│   ├── (protected)/      # Authenticated routes (Dashboard, Piggy, Transfer, Admin)
│   ├── (public)/         # Public routes (Auth, Home)
│   └── api/              # Internal API handlers
├── components/           # Reusable UI components (shadcn/ui, custom)
├── hooks/                # Custom React hooks (API, UI, Auth)
│   └── api/              # Data fetching hooks using React Query
├── lib/                  # Utility functions and shared logic
│   ├── api/              # API Client and Service definitions
│   └── zod/              # Validation schemas
├── public/               # Static assets (images, icons)
└── types/                # TypeScript type definitions
```

## 🏁 Getting Started

### Prerequisites

- **Node.js**: `^20.x` (Recommended)
- **pnpm**: `npm install -g pnpm`
- **Git**

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/wing-piggy-saving-final.git
   cd wing-piggy-saving-final
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory and configure the following variables:

```dotenv
# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# API Configuration
# The base URL for the backend API services
API_BASE_URL=https://your-api-endpoint.com/api/v1
```

### Running Locally

- **Development Mode**:

  ```bash
  pnpm dev
  ```

  Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Build for Production**:

  ```bash
  pnpm build
  ```

- **Start Production Server**:
  ```bash
  pnpm start
  ```

## 🧪 Demo Accounts

Explore the application using these test credentials:

| Role       | Email                    | Password |
| :--------- | :----------------------- | :------- |
| **User A** | `bovuthey2019@gmail.com` | `kimsan` |
| **User B** | `sliptfrogs@gmail.com`   | `kimsan` |

## 🚢 Deployment

### Vercel (Recommended)

This project is optimized for Vercel. Simply connect your repository to Vercel, configure the environment variables, and it will deploy automatically.

### Manual Deployment

1. Run `pnpm build` to generate the production build.
2. Ensure your server has the required Node.js version and environment variables set.
3. Run `pnpm start` to launch the application.

## 📄 License

This project is private and intended for demonstration purposes.
