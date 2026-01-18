# Architecture & Technical Overview

## Project Structure

PDF Mantra is built using **Expo Router** for file-based routing. The project structure is organized as follows:

```
pdf-mantra/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout & navigation stack
│   ├── index.tsx           # Home screen
│   └── [feature].tsx       # Feature screens (edit, merge, etc.)
├── components/
│   ├── common/             # Reusable UI components
│   │   ├── ActionButton.tsx
│   │   ├── AnimatedComponents.tsx  # Reanimated wrappers
│   │   └── FileCard.tsx
├── hooks/                  # Custom React hooks
│   ├── usePDFPicker.ts     # File processing logic
│   └── usePDFProcessor.ts  # Operation state management
├── modules/
│   └── pdf/                # Core business logic
│       └── PDFService.ts   # pdf-lib wrapper functions
```

## Core Technologies

### 1. PDF Processing Strategy
We use **pdf-lib** for all PDF generation and modification.
-   **Advantages**: Pure JavaScript, works offline, no native build requirements for basic ops.
-   **Limitations**: Rendering pages requires converting to images or using native views. We currently use `pdf-lib` for structure manipulation (merge, split, rotate, watermark).

### 2. UI/UX Philosophy
-   **Gradient Headers**: Using `expo-linear-gradient` for premium feel.
-   **Animations**: All interactions use `react-native-reanimated`.
    -   `FadeInView`: Staggered entrance for list items.
    -   `AnimatedPressable`: Tactile spring feedback on touch.
    -   `Slide`: Native iOS-style navigation transitions.

### 3. State Management
We use React Context and custom hooks.
-   `usePDFPicker`: Encapsulates `expo-document-picker`.
-   `usePDFProcessor`: Standardizes loading states, error handling, and Haptics feedback.

## Deployment
The app is designed to be fully compatible with **Expo Go** for development and builds via **EAS Build** for production android/ios binaries.

## Future Roadmap
-   **Native Modules**: Integration of `react-native-pdf` for true page rendering.
-   **Dark Mode**: Complete theme support (Implemented ✅).
-   **Cloud Sync**: Optional Google Drive integration.
