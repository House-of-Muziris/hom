# House of M - Premium Spice Membership Platform

Museum-quality, Awwwards-standard Next.js application with Firebase backend.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete production deployment guide
- **[DOCS.md](DOCS.md)** - Architecture and technical documentation

## ✨ Features

- Firebase Authentication (password + passwordless)
- Firestore Database with real-time sync
- Firebase Analytics on all pages
- Museum-themed email templates
- Shopping cart with checkout flow
- Admin dashboard for membership management
- Custom cursor and smooth scroll
- Parallax effects and animations

## 🔐 Environment Setup

Create `.env.local` (see `.env.local.example`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... see .env.local.example for full list
```

## 🎨 Tech Stack

- Next.js 16 (App Router, Turbopack)
- Firebase (Auth, Firestore, Analytics)
- Framer Motion
- Tailwind CSS
- TypeScript

---

This is a [Next.js](https://nextjs.org) project.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
