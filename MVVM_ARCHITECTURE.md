# MedSync MVVM Architecture

## MVVM Pattern Overview

MVVM (Model-View-ViewModel) separates concerns into three layers:
- **Model**: Data and business logic
- **View**: UI components (Screens, Components)
- **ViewModel**: Presentation logic that connects View and Model

## MVVM Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          VIEW LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Screens    │  │  Components  │  │  Navigation  │         │
│  │              │  │              │  │              │         │
│  │ - HomeScreen │  │ - Medicine   │  │ - AppNavigator│         │
│  │ - LoginScreen│  │   Card       │  │              │         │
│  │ - Schedule   │  │ - TimingModal│  │              │         │
│  │   Screen     │  │ - Toast      │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         │ Observes        │                 │                  │
│         │ Updates         │                 │                  │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          │ Binds to        │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VIEWMODEL LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ HomeViewModel│  │Schedule      │  │Interaction   │        │
│  │              │  │ViewModel     │  │ViewModel     │        │
│  │ - navigation │  │              │  │              │        │
│  │   methods    │  │ - medicines  │  │ - drugList   │        │
│  │              │  │ - add()      │  │ - results    │        │
│  │              │  │ - remove()   │  │ - check()    │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │                 │
│         │ Uses            │                 │                 │
└─────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MODEL LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Services   │  │  Repositories │  │   Entities   │        │
│  │              │  │               │  │              │        │
│  │ - authService│  │ - Medicine    │  │ - Medicine   │        │
│  │ - interaction│  │   Repository │  │ - Interaction│        │
│  │   Service    │  │ - Schedule   │  │ - User       │        │
│  │              │  │   Repository │  │              │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │                 │
│         │ Accesses        │                 │                 │
└─────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Firebase   │  │   SQLite     │  │  Gemini API  │        │
│  │   (Remote)   │  │  (Local)     │  │  (Remote)    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Current Architecture vs MVVM Mapping

### Current Structure
```
Screens → Context → Services → APIs
```

### MVVM Structure
```
View (Screens) → ViewModel → Model (Services/Repositories) → Data Sources
```

## MVVM Layer Breakdown

### 1. MODEL LAYER

#### Entities (Data Models)
```javascript
// src/models/Medicine.js
export class Medicine {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.dosage = data.dosage;
    this.ingredients = data.ingredients;
    this.instructions = data.instructions;
    this.additionalInfo = data.additionalInfo;
    this.images = data.images || [];
  }
}

// src/models/DrugInteraction.js
export class DrugInteraction {
  constructor(data) {
    this.id = data.id;
    this.drugA = data.drug_a;
    this.drugB = data.drug_b;
    this.severity = data.severity; // 'major', 'moderate', 'minor'
    this.description = data.description;
    this.recommendation = data.recommendation;
  }
}

// src/models/ScheduledMedicine.js
export class ScheduledMedicine {
  constructor(data) {
    this.id = data.id;
    this.medicine = data.medicine; // Medicine entity
    this.timing = {
      morning: data.timing?.morning || 0,
      afternoon: data.timing?.afternoon || 0,
      night: data.timing?.night || 0
    };
  }
}
```

#### Repositories (Data Access)
```javascript
// src/repositories/MedicineRepository.js
export class MedicineRepository {
  constructor() {
    this.medicines = []; // In-memory cache or from API
  }

  async getAll() {
    // Fetch from API or local storage
    return this.medicines;
  }

  async getById(id) {
    return this.medicines.find(m => m.id === id);
  }

  async search(query) {
    return this.medicines.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// src/repositories/InteractionRepository.js
export class InteractionRepository {
  constructor(database) {
    this.db = database;
  }

  async checkInteractions(drugNames) {
    // Query SQLite database
    const interactions = [];
    // ... interaction checking logic
    return interactions;
  }

  async getByDrug(drugName) {
    // Query database for specific drug
    return await this.db.getAllAsync(
      `SELECT * FROM drug_interactions 
       WHERE drug_a = ? OR drug_b = ?`,
      [drugName.toLowerCase(), drugName.toLowerCase()]
    );
  }
}

// src/repositories/ScheduleRepository.js
export class ScheduleRepository {
  constructor(context) {
    this.context = context; // ScheduleContext
  }

  getAll() {
    return this.context.scheduledMedicines;
  }

  add(medicine, timing) {
    this.context.addToSchedule(medicine, timing);
  }

  remove(medicineId) {
    this.context.removeFromSchedule(medicineId);
  }
}
```

#### Services (Business Logic)
```javascript
// src/services/InteractionService.js (Model Layer)
export class InteractionService {
  constructor(interactionRepository) {
    this.repository = interactionRepository;
  }

  async checkInteractions(drugNames) {
    if (!drugNames || drugNames.length < 2) {
      return {
        hasInteractions: false,
        interactions: [],
        message: "Need at least 2 drugs"
      };
    }

    const interactions = await this.repository.checkInteractions(drugNames);
    
    return {
      hasInteractions: interactions.length > 0,
      interactions: interactions.map(i => new DrugInteraction(i)),
      checkedDrugs: drugNames,
      message: interactions.length > 0 
        ? `Found ${interactions.length} interaction(s)`
        : "No interactions found"
    };
  }
}
```

### 2. VIEWMODEL LAYER

#### HomeViewModel
```javascript
// src/viewmodels/HomeViewModel.js
import { useState } from 'react';

export class HomeViewModel {
  constructor(navigation) {
    this.navigation = navigation;
  }

  navigateToSchedule() {
    this.navigation.navigate('Schedule');
  }

  navigateToDatabase() {
    this.navigation.navigate('Database');
  }

  navigateToBarcodeScanner() {
    this.navigation.navigate('BarcodeScanner');
  }

  navigateToChatbot() {
    this.navigation.navigate('Chatbot');
  }

  navigateToInteractionChecker() {
    this.navigation.navigate('InteractionChecker');
  }

  navigateToProfile() {
    this.navigation.navigate('Profile');
  }

  navigateToNotifications() {
    this.navigation.navigate('Notifications');
  }
}
```

#### ScheduleViewModel
```javascript
// src/viewmodels/ScheduleViewModel.js
import { useState, useEffect } from 'react';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { useSchedule } from '../context/ScheduleContext';

export class ScheduleViewModel {
  constructor() {
    this.repository = new ScheduleRepository(useSchedule());
    this.medicines = [];
    this.loading = false;
    this.error = null;
  }

  async loadMedicines() {
    this.loading = true;
    try {
      this.medicines = this.repository.getAll();
      this.error = null;
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  addMedicine(medicine, timing) {
    this.repository.add(medicine, timing);
    this.loadMedicines(); // Refresh
  }

  removeMedicine(medicineId) {
    this.repository.remove(medicineId);
    this.loadMedicines(); // Refresh
  }

  formatTiming(timing) {
    if (!timing) return "Not set";
    const { morning = 0, afternoon = 0, night = 0 } = timing;
    return `${morning}-${afternoon}-${night}`;
  }
}
```

#### InteractionCheckerViewModel
```javascript
// src/viewmodels/InteractionCheckerViewModel.js
import { useState } from 'react';
import { InteractionService } from '../services/InteractionService';
import { InteractionRepository } from '../repositories/InteractionRepository';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { getDatabase } from '../services/database';
import { useSchedule } from '../context/ScheduleContext';

export class InteractionCheckerViewModel {
  constructor() {
    this.interactionRepo = new InteractionRepository(getDatabase());
    this.interactionService = new InteractionService(this.interactionRepo);
    this.scheduleRepo = new ScheduleRepository(useSchedule());
    
    // State
    this.drugList = '';
    this.results = null;
    this.loading = false;
    this.dbInitialized = false;
  }

  async initializeDatabase() {
    try {
      await initDatabase();
      await seedInteractions();
      this.dbInitialized = true;
    } catch (error) {
      throw new Error('Failed to initialize database');
    }
  }

  setDrugList(drugs) {
    this.drugList = drugs;
  }

  async importFromSchedule() {
    const scheduledMedicines = this.scheduleRepo.getAll();
    
    if (scheduledMedicines.length === 0) {
      throw new Error('No medicines in schedule');
    }

    const medicineNames = scheduledMedicines
      .map(medicine => medicine.name)
      .filter(name => name && name.trim().length > 0);

    this.drugList = medicineNames.join(', ');
    this.results = null; // Clear previous results
    
    return medicineNames.length;
  }

  async checkInteractions() {
    if (!this.drugList.trim()) {
      throw new Error('Please enter at least one drug name');
    }

    if (!this.dbInitialized) {
      throw new Error('Database not initialized');
    }

    this.loading = true;
    this.results = null;

    try {
      const drugs = this.drugList
        .split(/[,\n]/)
        .map(drug => drug.trim())
        .filter(drug => drug.length > 0);

      if (drugs.length < 2) {
        throw new Error('Please enter at least 2 drugs');
      }

      this.results = await this.interactionService.checkInteractions(drugs);
    } catch (error) {
      throw error;
    } finally {
      this.loading = false;
    }
  }

  getSeverityColor(severity) {
    switch (severity?.toLowerCase()) {
      case 'major': return '#FF3B30';
      case 'moderate': return '#FF9500';
      case 'minor': return '#FFCC00';
      default: return '#8E8E93';
    }
  }
}
```

#### ChatbotViewModel
```javascript
// src/viewmodels/ChatbotViewModel.js
import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/gemini';

export class ChatbotViewModel {
  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    this.messages = [{
      role: 'assistant',
      content: "Hello! I'm your medical assistant chatbot. How can I help you today?"
    }];
    this.inputText = '';
    this.loading = false;
  }

  setInputText(text) {
    this.inputText = text;
  }

  async sendMessage() {
    if (!this.inputText.trim() || this.loading) return;

    const userMessage = this.inputText.trim();
    this.inputText = '';
    this.loading = true;

    // Add user message
    this.messages.push({
      role: 'user',
      content: userMessage
    });

    try {
      const prompt = `You are a helpful medical assistant chatbot. 
        Provide accurate, helpful information about medications, health questions, 
        and general medical advice. Always remind users to consult with healthcare 
        professionals for serious medical concerns. Keep responses concise and friendly.

        User question: ${userMessage}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.messages.push({
        role: 'assistant',
        content: text
      });
    } catch (error) {
      this.messages.push({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      });
    } finally {
      this.loading = false;
    }
  }
}
```

### 3. VIEW LAYER (Refactored Screens)

#### InteractionCheckerScreen (MVVM)
```javascript
// src/screens/InteractionCheckerScreen.js
import React, { useState, useEffect } from 'react';
import { InteractionCheckerViewModel } from '../viewmodels/InteractionCheckerViewModel';

const InteractionCheckerScreen = ({ navigation }) => {
  const [viewModel] = useState(() => new InteractionCheckerViewModel());
  const [drugList, setDrugList] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    viewModel.initializeDatabase();
  }, []);

  const handleImportFromSchedule = async () => {
    try {
      const count = await viewModel.importFromSchedule();
      setDrugList(viewModel.drugList);
      setResults(null);
      Alert.alert('Imported', `Imported ${count} medicine(s) from schedule`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCheckInteractions = async () => {
    viewModel.setDrugList(drugList);
    try {
      await viewModel.checkInteractions();
      setResults(viewModel.results);
      setLoading(viewModel.loading);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Render UI using viewModel state
  return (
    // ... JSX using viewModel properties
  );
};
```

## MVVM Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTION                              │
│              (Button Click, Input Change)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      VIEW LAYER                             │
│  - Receives user input                                      │
│  - Calls ViewModel methods                                  │
│  - Observes ViewModel state changes                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    VIEWMODEL LAYER                          │
│  - Processes user input                                     │
│  - Validates data                                           │
│  - Calls Model/Service methods                             │
│  - Updates state (observable)                               │
│  - Formats data for View                                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      MODEL LAYER                            │
│  - Business logic                                           │
│  - Data validation                                          │
│  - Calls Repository methods                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   REPOSITORY LAYER                           │
│  - Data access logic                                        │
│  - Database queries                                         │
│  - API calls                                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                             │
│  - SQLite Database                                          │
│  - Firebase                                                 │
│  - External APIs                                            │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              STATE UPDATES FLOW BACK                         │
│  Data Source → Repository → Model → ViewModel → View        │
└─────────────────────────────────────────────────────────────┘
```

## Benefits of MVVM in React Native

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
2. **Testability**: ViewModels can be tested independently
3. **Reusability**: ViewModels can be shared across multiple Views
4. **Maintainability**: Changes in one layer don't affect others
5. **Scalability**: Easy to add new features following the pattern

## Migration Strategy

### Phase 1: Create ViewModels
- Extract business logic from screens into ViewModels
- Keep existing Context API for state management

### Phase 2: Create Repositories
- Abstract data access into Repository pattern
- Keep existing services but wrap them in repositories

### Phase 3: Refactor Screens
- Update screens to use ViewModels
- Remove direct service calls from screens

### Phase 4: Add State Management
- Consider using MobX or Redux for observable state
- Or use React hooks with ViewModels

## Example: Complete MVVM Implementation

### ViewModel with React Hooks
```javascript
// src/viewmodels/useInteractionCheckerViewModel.js
import { useState, useCallback } from 'react';
import { InteractionService } from '../services/InteractionService';
import { InteractionRepository } from '../repositories/InteractionRepository';

export const useInteractionCheckerViewModel = () => {
  const [drugList, setDrugList] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const interactionService = new InteractionService(
    new InteractionRepository(getDatabase())
  );

  const importFromSchedule = useCallback((scheduledMedicines) => {
    const names = scheduledMedicines
      .map(m => m.name)
      .filter(n => n?.trim());
    
    setDrugList(names.join(', '));
    setResults(null);
    return names.length;
  }, []);

  const checkInteractions = useCallback(async () => {
    setLoading(true);
    try {
      const drugs = drugList.split(/[,\n]/)
        .map(d => d.trim())
        .filter(d => d.length > 0);
      
      const result = await interactionService.checkInteractions(drugs);
      setResults(result);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [drugList, interactionService]);

  return {
    drugList,
    setDrugList,
    results,
    loading,
    importFromSchedule,
    checkInteractions
  };
};
```

### Screen Using ViewModel Hook
```javascript
// src/screens/InteractionCheckerScreen.js
import { useInteractionCheckerViewModel } from '../viewmodels/useInteractionCheckerViewModel';
import { useSchedule } from '../context/ScheduleContext';

const InteractionCheckerScreen = ({ navigation }) => {
  const { scheduledMedicines } = useSchedule();
  const {
    drugList,
    setDrugList,
    results,
    loading,
    importFromSchedule,
    checkInteractions
  } = useInteractionCheckerViewModel();

  const handleImport = () => {
    const count = importFromSchedule(scheduledMedicines);
    Alert.alert('Imported', `Imported ${count} medicines`);
  };

  // ... rest of component
};
```

## MVVM Directory Structure

```
src/
├── models/                    # Entity classes
│   ├── Medicine.js
│   ├── DrugInteraction.js
│   └── ScheduledMedicine.js
│
├── repositories/              # Data access layer
│   ├── MedicineRepository.js
│   ├── InteractionRepository.js
│   └── ScheduleRepository.js
│
├── services/                   # Business logic
│   ├── InteractionService.js
│   ├── AuthService.js
│   └── ChatService.js
│
├── viewmodels/                # Presentation logic
│   ├── HomeViewModel.js
│   ├── ScheduleViewModel.js
│   ├── InteractionCheckerViewModel.js
│   ├── ChatbotViewModel.js
│   └── useInteractionCheckerViewModel.js (Hook version)
│
├── views/                      # UI Components
│   ├── screens/
│   └── components/
│
└── context/                    # Global state (optional)
    ├── AuthContext.js
    └── ScheduleContext.js
```

## State Management Options

### Option 1: React Hooks + ViewModels
- Use `useState` and `useEffect` in ViewModels
- Simple and React-native approach

### Option 2: MobX + ViewModels
- ViewModels extend MobX stores
- Automatic reactivity
- Better for complex state

### Option 3: Redux + ViewModels
- ViewModels dispatch actions
- Centralized state management
- Good for large apps

## Testing MVVM Architecture

```javascript
// Example: Testing InteractionCheckerViewModel
describe('InteractionCheckerViewModel', () => {
  let viewModel;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      checkInteractions: jest.fn()
    };
    viewModel = new InteractionCheckerViewModel(mockRepository);
  });

  it('should check interactions for drug list', async () => {
    mockRepository.checkInteractions.mockResolvedValue([
      { drugA: 'ibuprofen', drugB: 'warfarin', severity: 'major' }
    ]);

    viewModel.setDrugList('ibuprofen, warfarin');
    await viewModel.checkInteractions();

    expect(viewModel.results.hasInteractions).toBe(true);
    expect(viewModel.results.interactions).toHaveLength(1);
  });
});
```

This MVVM architecture provides a clean, testable, and maintainable structure for the MedSync application.

