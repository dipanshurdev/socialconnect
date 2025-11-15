## SocialConnect – Fullstack Social Media App [Live](https://socialconnect-black.vercel.app)

### Built with Next.js, TypeScript, Supabase, shadcn/ui, Tailwind CSS.

## 🚀 Overview

### SocialConnect is a fully functional mini social media platform featuring:

- User authentication (signup/login)

- Profile management (avatar, bio, info)

- Create/edit/delete posts with images

- Like, comment, follow

- Real-time notifications using Supabase Realtime

- Admin dashboard for moderation


## 🛠 Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind, shadcn/ui

- Backend: Supabase (PostgreSQL + Auth + Storage + RLS)

- Real-time: Supabase Realtime Channels

- Validation: Zod

- UI Icons: Lucide React

## 🔧 Setup Instructions

### 1. Install dependencies
npm install

### 2. Environment variables

Create .env.local and add:

NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY

### 3. Supabase setup

Create buckets: avatars, posts

Make them public

Add storage policies

Create tables using given schema

Confirm RLS policies

Create a test user

### 4. Run development server
npm run dev


App runs at http://localhost:3000

## 🧪 Testing

You can test the backend using:

Thunder Client / Postman

Supabase SQL Editor

Frontend forms after login

## 🔐 Features Implemented

✔ Authentication
✔ Profile CRUD
✔ Post CRUD
✔ Follow/unfollow
✔ Likes & comments
✔ Image upload (2MB limit)
✔ Real-time notifications
✔ Admin tools
✔ Database triggers + RLS security
