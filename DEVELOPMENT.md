# Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Chrome browser for testing

### Installation & Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build Chrome Extension
npm run build:extension
```

## 🏗 Architecture Overview

### Modern Frontend Stack
- **React 18**: Latest React features with Hooks and Context API
- **TypeScript**: Full type safety across the codebase
- **Vite**: Lightning-fast build tool with HMR
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library

### Component Architecture
```
App (Provider Wrapper)
├── Sidebar (Navigation)
│   └── Navigation Buttons (4 tabs)
└── MainContent (Dynamic Content)
    └── Tab Components (Improve, History, Settings, Profile)
```

### State Management
- **React Context**: Global application state
- **useReducer**: Complex state logic
- **Chrome Storage API**: Persistent storage
- **localStorage**: Fallback for development

## 🎨 Design Principles

### Visual Design
- **Clean & Minimal**: Inspired by modern VPN applications
- **Responsive**: Optimized for 400x600px popup
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Consistent**: Unified spacing, colors, and typography

### Interaction Design
- **Smooth Animations**: 200ms transitions with ease-out timing
- **Hover States**: Scale and shadow effects on interactive elements
- **Loading States**: Spinner animations for async operations
- **Feedback**: Toast notifications and visual confirmations

## 🔧 Chrome Extension Development

### Manifest V3 Features
```json
{
  "manifest_version": 3,
  "permissions": ["storage", "activeTab"],
  "action": { "default_popup": "index.html" }
}
```

### API Integration
```typescript
// Chrome Storage with fallback
ChromeApiService.getStorage('key')
ChromeApiService.setStorage('key', value)

// Development mode fallback
mockChromeApi.storage.local.get()
```

### Security Considerations
- Content Security Policy (CSP) compliance
- No inline scripts or styles
- Secure API communication patterns

## 📱 User Interface Breakdown

### Sidebar Navigation (64px width)
- Logo/branding area
- 4 navigation buttons with tooltips
- Active state indicators
- Smooth hover animations

### Main Content Area (336px width)
- Dynamic tab content
- Consistent padding and spacing
- Scrollable areas where needed
- Responsive text and input areas

### Tab-Specific Layouts

#### Improve Prompt Tab
- Large textarea (120px height)
- Prominent action button
- Output display area
- Copy functionality

#### History Tab
- Scrollable item list
- Timestamp formatting
- Individual copy buttons
- Clear all option

#### Settings Tab
- Toggle switches for theme
- Radio buttons for language
- Version information
- Clean sectioned layout

#### Profile Tab
- Login/logout states
- User avatar display
- Account statistics
- Action buttons

## 🌐 Internationalization

### Language Support
- English (default)
- Russian (ru)

### Translation System
```typescript
getTranslation('key', language)

// Usage example
getTranslation('improveButton', 'en') // "Improve"
getTranslation('improveButton', 'ru') // "Улучшить"
```

### Adding New Languages
1. Add language to `Language` type
2. Extend `translations` object
3. Update language selector in Settings

## 🎭 Theme System

### Theme Architecture
- CSS custom properties (Tailwind variables)
- React Context for theme state
- Automatic class application (`dark` class)
- Smooth transitions between themes

### Color Tokens
```css
/* Light theme */
bg-gray-50, text-gray-900

/* Dark theme */
dark:bg-gray-900, dark:text-white
```

### Creating New Themes
1. Define color palette in `tailwind.config.js`
2. Add theme type to TypeScript definitions
3. Update theme selector component

## 🔄 State Management Deep Dive

### Context Structure
```typescript
interface AppContextType {
  // State
  currentTab: TabType;
  user: User | null;
  isLoggedIn: boolean;
  history: HistoryItem[];
  settings: AppSettings;
  
  // Actions
  setCurrentTab: (tab: TabType) => void;
  setTheme: (theme: Theme) => void;
  addHistoryItem: (item: HistoryItem) => void;
  // ... more actions
}
```

### Reducer Actions
- `SET_TAB`: Navigate between tabs
- `SET_THEME`: Toggle light/dark mode
- `SET_LANGUAGE`: Change interface language
- `ADD_HISTORY_ITEM`: Add new prompt to history
- `CLEAR_HISTORY`: Remove all history items
- `LOGIN_USER` / `LOGOUT_USER`: Authentication state

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
# Serves at http://localhost:5173
# Hot reload enabled
# Chrome APIs mocked
```

### Production Build
```bash
npm run build:extension
# Outputs to ./dist/
# Optimized bundle
# Chrome Extension ready
```

### Chrome Extension Loading
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `./dist` folder

### File Structure After Build
```
dist/
├── index.html          # Extension popup
├── popup.js           # Bundled React app
├── popup.css          # Compiled Tailwind styles
├── manifest.json      # Extension manifest
└── icons/            # Extension icons
```

## 🧪 Testing Strategy

### Component Testing
```bash
# Individual component testing
npm run test:components

# Visual regression testing
npm run test:visual
```

### Extension Testing
1. Load in Chrome as unpacked extension
2. Test all tab functionality
3. Verify storage persistence
4. Check responsive behavior
5. Test theme switching
6. Validate translations

### Browser Compatibility
- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)
- Opera 74+ (Chromium-based)

## 🔍 Debugging

### Development Tools
```bash
# React Developer Tools
chrome://extensions/ → React Developer Tools

# Chrome Extension Debugging
chrome://extensions/ → Inspect views: popup.html

# Console Debugging
ChromeApiService.checkApiAvailability()
```

### Common Issues
1. **Storage not persisting**: Check Chrome API availability
2. **Styles not loading**: Verify Tailwind build process
3. **Context not updating**: Check provider wrapper
4. **Icons not showing**: Verify Lucide React imports

## 📋 Code Quality

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/` → `src/`)
- Chrome types included
- React types configured

### ESLint Rules
- React Hooks rules
- TypeScript recommended
- Import/export consistency
- Accessibility checks

### Code Structure
- Single Responsibility Principle
- Consistent naming conventions
- Proper error boundaries
- Performance optimizations

This development guide provides everything needed to understand, modify, and extend the Chrome Extension codebase.