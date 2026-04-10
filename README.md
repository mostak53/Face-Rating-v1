# Face Rating System

A professional face rating system built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

- **User Authentication**: Register and login with username or email.
- **Face Rating**: Rate celebrity photos from 5 different angles (Front, Left, Right, Top, 45 degree).
- **Shuffle System**: Photos are presented in a random order to ensure variety.
- **Admin Panel**:
  - Upload celebrity photos with specific angles.
  - Manage and delete photos.
  - View all registered users.
  - Export ratings to Excel with performance segmentation (Good, Average, Low).
- **My Ratings**: Users can view and update their previous ratings.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion.
- **Backend**: Firebase (Auth, Firestore, Storage).
- **Data Export**: XLSX.

## Setup Instructions

1. **Firebase Configuration**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Google Login or Email/Password).
   - Create a **Firestore** database.
   - Create a **Storage** bucket.
   - Copy your Firebase configuration and place it in `firebase-applet-config.json` in the root directory.

2. **Environment Variables**:
   - Create a `.env` file based on `.env.example`.
   - Add your `GEMINI_API_KEY` if using AI features.

3. **Installation**:
   ```bash
   npm install
   ```

4. **Development**:
   ```bash
   npm run dev
   ```

5. **Build**:
   ```bash
   npm run build
   ```

## Admin Access

To access the admin panel:
1. Register an account with the email: `252-15-974@diu.edu.bd`
2. This email is hardcoded in the security rules as the bootstrap admin.
3. Once logged in, you will have access to the Admin Panel in the navigation bar.

## Deployment

This project is ready to be hosted on platforms like GitHub Pages, Vercel, or Netlify.

### GitHub Pages Deployment
1. **Build the project**:
   ```bash
   npm run build
   ```
2. **Deploy the `dist` folder**:
   - You can use the `gh-pages` package or manually upload the contents of the `dist` folder to a `gh-pages` branch.
   - The `vite.config.ts` is already configured with `base: './'` to support subfolder hosting.
   - Ensure your GitHub repository settings are set to serve from the `gh-pages` branch or the `/docs` folder (if you move `dist` to `docs`).

### Important Note on index.html
The `index.html` file is located in the root directory as required by Vite and GitHub Pages. During the build process, Vite will generate a production-ready `index.html` in the `dist` folder.
