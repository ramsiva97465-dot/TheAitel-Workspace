# Discord-Style Team Chat

A real-time team communication platform built with React, Tailwind CSS, and Firebase.

## Features
- **Modern Auth:** Support for Google Sign-In and Email/Password authentication.
- **Real-time Messaging:** Instant message delivery using Cloud Firestore.
- **Fixed Channels:** 3 public team rooms (`prompt-engineers`, `developers`, `bde`).
- **Modern UI:** Discord-inspired dark theme with responsive design.
- **Security:** Firestore security rules to protect user data and channel integrity.
- **Free-Tier Friendly:** Uses only free-tier compatible Firebase features.

## Prerequisites
- Node.js (v18 or higher)
- A Firebase Project

## Setup Instructions

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Firebase Configuration**
   - Create a project in [Firebase Console](https://console.firebase.google.com/).
   - Enable **Email/Password** and **Google** authentication in the Auth section.
   - Create a **Firestore Database** in production mode.
   - Register a Web App in your Firebase project.
   - Copy the configuration and create a `.env` file from `.env.example`.

3. **Firestore Setup**
   - Go to the **Rules** tab in Firestore and copy the contents of `firestore.rules`.
   - The channels are fixed in the frontend for V1, but you can create a `rooms` collection with documents `prompt-engineers`, `developers`, and `bde` if you wish to store metadata there.

4. **Run Locally**
   ```bash
   npm run dev
   ```

## Deployment

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy --only hosting`

### Vercel
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add the Environment Variables from your `.env` file.
4. Deploy!

## Tech Stack
- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Firebase (Auth, Firestore)
