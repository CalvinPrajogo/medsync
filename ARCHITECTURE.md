# MedSync Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.js (Root)                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │ AuthProvider   │  │ScheduleProvider│  │  AppNavigator   │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Navigation Stack │
                    └──────────────────┘
```

## Project Structure

```
MedSync/
├── App.js                          # Root component with providers
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js         # React Navigation setup
│   │
│   ├── screens/                    # Screen components
│   │   ├── LoginScreen.js
│   │   ├── SignUpScreen.js
│   │   ├── HomeScreen.js           # Dashboard
│   │   ├── DatabaseScreen.js       # Medicine search
│   │   ├── MedicineDetailScreen.js
│   │   ├── ScheduleScreen.js       # Medication schedule
│   │   ├── BarcodeScannerScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── NotificationsScreen.js
│   │   ├── ChatbotScreen.js        # Gemini AI chat
│   │   └── InteractionCheckerScreen.js
│   │
│   ├── components/                 # Reusable components
│   │   ├── MedicineCard.js
│   │   ├── TimingModal.js
│   │   └── Toast.js
│   │
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.js          # Authentication state
│   │   └── ScheduleContext.js     # Medication schedule state
│   │
│   ├── services/                   # Business logic & APIs
│   │   ├── authService.js         # Firebase auth
│   │   ├── database.js             # SQLite initialization
│   │   └── interactionService.js  # Drug interaction checking
│   │
│   ├── config/                     # Configuration files
│   │   ├── firebase.js            # Firebase config
│   │   └── gemini.js              # Gemini API key
│   │
│   └── constants/
│       └── theme.js                # App theme (colors, sizes)
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Screens    │  │  Components  │  │  Navigation  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                           │
│  ┌──────────────┐              ┌──────────────┐              │
│  │ AuthContext   │              │ScheduleContext│              │
│  │              │              │               │              │
│  │ - user       │              │ - scheduled   │              │
│  │ - login()    │              │   Medicines   │              │
│  │ - logout()   │              │ - addToSchedule│             │
│  └──────┬───────┘              │ - removeFrom  │              │
│         │                       │   Schedule   │              │
│         │                       └──────┬───────┘              │
│         │                              │                      │
└─────────┼──────────────────────────────┼──────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVICES LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ authService  │  │  database.js  │  │interaction   │        │
│  │             │  │               │  │Service.js    │        │
│  │ - Firebase  │  │ - SQLite      │  │              │        │
│  │   Auth      │  │ - Init DB     │  │ - check      │        │
│  │             │  │ - Seed data   │  │   Interactions│       │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘        │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Firebase   │  │   SQLite     │  │  Gemini API  │        │
│  │   (Auth)     │  │  (Local DB)  │  │  (Chatbot)   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Navigation Flow

```
                    ┌─────────────┐
                    │ LoginScreen │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ SignUpScreen│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ HomeScreen  │◄─────────────────┐
                    │ (Dashboard)  │                  │
                    └───┬─────────┘                  │
                        │                            │
        ┌───────────────┼───────────────┐           │
        │               │               │           │
        ▼               ▼               ▼           │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  Schedule   │ │  Database   │ │  Chatbot    │   │
│   Screen    │ │   Screen     │ │   Screen    │   │
└──────┬──────┘ └──────┬───────┘ └─────────────┘   │
       │               │                            │
       │        ┌──────▼───────┐                    │
       │        │MedicineDetail│                    │
       │        │   Screen     │                    │
       │        └──────────────┘                    │
       │                                            │
       ▼                                            │
┌─────────────┐                                     │
│ Interaction │                                     │
│  Checker    │                                     │
└─────────────┘                                     │
                                                     │
        ┌────────────────────────────────────────────┘
        │
        ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Profile   │  │Notification │  │  Barcode    │
│   Screen    │  │   Screen    │  │  Scanner    │
└─────────────┘  └─────────────┘  └─────────────┘
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    HomeScreen (Dashboard)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ View         │  │ Add Medicine │  │ Search      │    │
│  │ Schedule     │  │ (Barcode)     │  │ Medicine     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │             │
│         ▼                 ▼                 ▼             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ScheduleScreen│  │BarcodeScanner│  │DatabaseScreen│   │
│  │              │  │              │  │              │   │
│  │ Uses:        │  │ Uses:       │  │ Uses:       │   │
│  │ - Schedule   │  │ - Camera    │  │ - Medicine  │   │
│  │   Context    │  │   API       │  │   Card      │   │
│  └──────────────┘  └──────────────┘  └──────┬───────┘   │
│                                                │           │
│                                                ▼           │
│                                         ┌──────────────┐  │
│                                         │MedicineDetail│  │
│                                         │   Screen     │  │
│                                         └──────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              InteractionCheckerScreen                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  User Input: Drug Names                             │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │ Import from Schedule Button                  │  │    │
│  │  └──────────────┬───────────────────────────────┘  │    │
│  │                 │                                   │    │
│  │                 ▼                                   │    │
│  │         ┌──────────────┐                           │    │
│  │         │ScheduleContext│                           │    │
│  │         │  (Read)      │                           │    │
│  │         └──────────────┘                           │    │
│  └────────────────────────────────────────────────────┘    │
│                 │                                           │
│                 ▼                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Check Interactions Button                         │    │
│  └──────────────┬────────────────────────────────────┘    │
│                 │                                           │
│                 ▼                                           │
│         ┌──────────────┐                                   │
│         │interaction    │                                   │
│         │Service.js    │                                   │
│         └──────┬───────┘                                   │
│                │                                           │
│                ▼                                           │
│         ┌──────────────┐                                   │
│         │  database.js │                                   │
│         │  (SQLite)    │                                   │
│         └──────────────┘                                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Display Results: Interactions Found              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   React      │  │ React Native │  │   Expo       │    │
│  │   (19.1.0)   │  │   (0.81.5)   │  │  (~54.0.20)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATION                                │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │@react-       │  │@react-        │                       │
│  │navigation/   │  │navigation/   │                       │
│  │native        │  │native-stack  │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ React        │  │ AsyncStorage │                       │
│  │ Context API  │  │ (Persistence)│                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICES & APIS                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Firebase   │  │   SQLite     │  │  Gemini AI   │    │
│  │   (Auth)     │  │  (Local DB)  │  │  (Chatbot)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    NATIVE MODULES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │expo-camera   │  │expo-barcode- │  │expo-sqlite   │    │
│  │              │  │scanner       │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### ScheduleContext State
```javascript
{
  scheduledMedicines: [
    {
      id: number,
      name: string,
      dosage: string,
      timing: {
        morning: number,
        afternoon: number,
        night: number
      }
    }
  ]
}
```

### Drug Interaction Database Schema
```sql
drug_interactions (
  id INTEGER PRIMARY KEY,
  drug_a TEXT NOT NULL,
  drug_b TEXT NOT NULL,
  severity TEXT NOT NULL,      -- 'major', 'moderate', 'minor'
  description TEXT,
  recommendation TEXT,
  created_at DATETIME
)
```

### AuthContext State
```javascript
{
  user: User | null,
  loading: boolean,
  login: (email, password) => Promise,
  logout: () => Promise,
  signup: (email, password) => Promise
}
```

## Key Features & Their Implementation

### 1. Authentication
- **Service**: `authService.js` (Firebase)
- **Context**: `AuthContext.js`
- **Screens**: `LoginScreen.js`, `SignUpScreen.js`

### 2. Medication Schedule
- **Context**: `ScheduleContext.js`
- **Screen**: `ScheduleScreen.js`
- **Component**: `TimingModal.js`

### 3. Medicine Database
- **Screen**: `DatabaseScreen.js`
- **Component**: `MedicineCard.js`
- **Detail**: `MedicineDetailScreen.js`

### 4. Drug Interaction Checker
- **Service**: `interactionService.js`
- **Database**: `database.js` (SQLite)
- **Screen**: `InteractionCheckerScreen.js`
- **Integration**: Reads from `ScheduleContext`

### 5. AI Chatbot
- **API**: Gemini AI (via `@google/generative-ai`)
- **Config**: `gemini.js`
- **Screen**: `ChatbotScreen.js`

### 6. Barcode Scanner
- **Module**: `expo-barcode-scanner`
- **Screen**: `BarcodeScannerScreen.js`

## Data Flow Examples

### Example 1: Adding Medicine to Schedule
```
User → DatabaseScreen
  → Selects Medicine
  → Opens TimingModal
  → Confirms Timing
  → addToSchedule(medicine, timing)
  → ScheduleContext updates
  → ScheduleScreen reflects changes
```

### Example 2: Checking Drug Interactions
```
User → InteractionCheckerScreen
  → Clicks "Import from Schedule"
  → Reads ScheduleContext
  → Populates drug list
  → Clicks "Check Interactions"
  → interactionService.checkInteractions()
  → Queries SQLite database
  → Returns results
  → Displays interactions
```

### Example 3: Chatbot Query
```
User → ChatbotScreen
  → Types message
  → Calls Gemini API
  → Receives response
  → Displays in chat
```

## Security Considerations

- **API Keys**: Stored in `config/` (gitignored)
- **Authentication**: Firebase Auth (secure)
- **Local Data**: SQLite (device storage)
- **No sensitive data** in version control

## Dependencies Summary

- **UI**: React Native, Expo
- **Navigation**: React Navigation
- **State**: React Context API
- **Auth**: Firebase
- **Database**: SQLite (expo-sqlite)
- **AI**: Google Gemini API
- **Camera**: Expo Camera & Barcode Scanner
- **Storage**: AsyncStorage

