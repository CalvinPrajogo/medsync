<h1 align="center">MedSync</h1>
<p align="center"><b>A Mobile Medication Management App</b></p>

<p align="center">
  <img alt="Platform" src="https://img.shields.io/badge/platform-mobile-blue" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-Expo-000000" />
  <img alt="Firebase" src="https://img.shields.io/badge/backend-Firebase-orange" />
  <img alt="Database" src="https://img.shields.io/badge/database-SQLite-lightgrey" />
  <img alt="AI" src="https://img.shields.io/badge/AI-Gemini-purple" />
</p>

---

## Overview

MedSync is a mobile application designed to simplify how users manage multiple medications. It centralizes scheduling, reminders, and safety checks in a single accessible interface, with built-in support for caregivers and family members.

---

## Key Features

| Feature | Description |
|-------|-------------|
| **Barcode & QR Scanning** | Quickly add medications by scanning packaging, with manual entry as a fallback. |
| **Smart Scheduling & Reminders** | Flexible recurring reminders to support complex medication routines. |
| **Drug Interaction Checks** | Flags potentially unsafe medication combinations using locally stored severity data. |
| **Adherence Tracking** | Tracks medication history, missed doses, and adherence streaks. |
| **Caregiver Support** | Shares schedules and adherence data across multiple profiles. |
| **AI Assistant** | Conversational support for scheduling help and medication-related questions. |

---

## Tech Stack

- **Frontend:** React Native, Expo
- **Backend / Services:** Firebase
- **Database:** SQLite
- **AI Integration:** Google Gemini

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Expo CLI
- Expo Go app (mobile device or emulator)

### Installation & Running the App

1. Clone the repository

        git clone https://github.com/<your-username>/medsync.git
        cd medsync

2. Install dependencies

        npm install

3. Create a `.env` file in the project root and add:

        FIREBASE_API_KEY=your_key_here
        FIREBASE_AUTH_DOMAIN=your_domain_here
        FIREBASE_PROJECT_ID=your_project_id
        GEMINI_API_KEY=your_gemini_key

4. Start the Expo development server

        npx expo start

5. Run the app
   - Scan the QR code with **Expo Go**, or
   - Launch on an iOS/Android simulator from the Expo dashboard

---

## Project Structure

    medsync/
    ├── assets/
    ├── components/
    ├── screens/
    ├── services/
    ├── database/
    ├── utils/
    ├── App.tsx
    └── package.json

---

## Team

- Swasti Singh
- Adnan Fazulbhoy
- Noah Long
- Calvin Prajogo
