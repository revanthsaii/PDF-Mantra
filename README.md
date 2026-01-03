# 📄 PDF-Mantra

> An all-in-one mobile PDF toolkit built with React Native & Expo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.30-000.svg)](https://expo.dev/)
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)](#)

## Overview

PDF-Mantra is a comprehensive, feature-rich mobile PDF manipulation toolkit designed for seamless document handling on iOS and Android platforms. Built with modern web technologies (React Native, Expo, and pdf-lib), it provides an intuitive interface for all your PDF processing needs.

## ✨ Features

### Core Functionality
- **📑 Document Merging** - Combine multiple PDFs into a single file
- **✌️ Document Splitting** - Extract specific pages and create new documents
- **🗻️ PDF Compression** - Reduce file size while maintaining quality
- **🗼️ Image-to-PDF Conversion** - Convert images into professional PDF documents
- **📈 Document Scanning** - Capture documents using the device camera with OCR capability
- **🔍 Text Extraction** - Extract text content from PDF documents
- **👁️ PDF Viewer** - Built-in viewer for seamless document preview
- **🔐 Document Protection** - Secure your PDFs with password protection
- **🔄 Document Reordering** - Rearrange pages in your PDF documents
- **📋 Page Management** - Advanced tools for managing individual pages

## 🔨 Tech Stack

### Frontend
- **React Native** (v0.81.5) - Cross-platform mobile development
- **Expo** (v54.0.30) - Development platform and managed hosting
- **Expo Router** (v6.0.21) - File-based routing for navigation
- **React DOM** (v19.1.0) - Web support via Expo
- **NativeWind** (v2.0.11) - Tailwind CSS for React Native

### PDF Processing
- **pdf-lib** (v1.17.1) - JavaScript PDF manipulation library
- **expo-document-picker** - File selection capabilities
- **expo-file-system** - File system access and management

### Media & Camera
- **expo-camera** (v17.0.10) - Camera integration for document scanning
- **expo-image-picker** (v17.0.10) - Image selection from device
- **expo-image-manipulator** (v14.0.8) - Image processing capabilities
- **react-native-pdf** (v7.0.3) - PDF rendering component

### UI & Navigation
- **expo-router** - Modern routing system
- **react-native-screens** (v4.16.0) - Native screen management
- **react-native-safe-area-context** - Safe area handling
- **react-native-gesture-handler** (v2.28.0) - Touch gesture support
- **react-native-reanimated** (v4.1.1) - Smooth animations
- **react-native-draggable-flatlist** (v4.0.3) - Draggable list components
- **expo-haptics** (v15.0.8) - Haptic feedback

### Utilities
- **expo-sharing** - Native share functionality
- **expo-clipboard** - Clipboard operations
- **expo-linking** - Deep linking support
- **react-native-webview** (v13.16.0) - WebView component
- **react-native-blob-util** (v0.24.6) - Blob handling
- **Tailwind CSS** (v3.3.2) - Styling framework

## 📆 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/revanthsaii/PDF-Mantra.git
   cd PDF-Mantra
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

## 🚀 Usage

### Running on Different Platforms

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Web:**
```bash
npm run web
```

### Project Structure

```
PDF-Mantra/
├── app/                      # Main application folder
│   ├── _layout.tsx          # Root layout configuration
│   ├── index.tsx            # Home screen
│   ├── about.tsx            # About page
│   ├── compress.tsx         # PDF compression feature
│   ├── extract-text.tsx     # Text extraction feature
│   ├── image-to-pdf.tsx     # Image to PDF conversion
│   ├── merge.tsx            # Document merging
│   ├── protect.tsx          # Document protection
│   ├── reorder.tsx          # Page reordering
│   ├── scan-document.tsx    # Document scanning with camera
│   ├── split.tsx            # Document splitting
│   └── viewer.tsx           # PDF viewer component
├── assets/                   # Static assets and images
├── package.json             # Project dependencies
├── app.json                 # Expo configuration
├── babel.config.js          # Babel configuration
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json            # TypeScript configuration
└── nativewind.d.ts          # NativeWind types
```

## 🌟 Key Features Explained

### 1. Document Merging
Combine multiple PDF files into a single document with page order control.

### 2. Document Splitting
Extract specific page ranges from a PDF to create new documents.

### 3. PDF Compression
Reduce file size using intelligent compression algorithms while preserving document quality.

### 4. Image to PDF
Convert images (JPG, PNG) into professional PDF documents with batch processing support.

### 5. Document Scanning
Use your device camera to scan physical documents with automatic edge detection and OCR.

### 6. Text Extraction
Extract all text content from PDF documents for easy copying and processing.

### 7. Protection
Add password protection to your PDFs to ensure document security.

### 8. Page Reordering
Drag-and-drop interface to rearrange pages in your PDF documents.

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Build production app
expo build
```

### Configuration Files

- **app.json** - Expo configuration (app metadata, permissions, etc.)
- **babel.config.js** - Babel transpiler configuration
- **tailwind.config.js** - Tailwind CSS customization
- **tsconfig.json** - TypeScript compiler options
- **nativewind.config.js** - NativeWind configuration

## 📱 Platform Support

- **Android** (8.0+)
- **iOS** (12.0+)
- **Web** (via Expo for Web)

## 🔐 Permissions Required

- **Camera** - For document scanning
- **Photos/Gallery** - For image and document selection
- **Storage** - For file access and saving
- **Clipboard** - For text operations

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Revanth Sai** - [@revanthsaii](https://github.com/revanthsaii)
- Computer Science Student @ SRM University AP
- Full-stack Developer | Competitive Programmer
- Open-source Enthusiast

## 🙋 Support & Feedback

- **Issues** - [Report a bug](https://github.com/revanthsaii/PDF-Mantra/issues)
- **Discussions** - [Share ideas and feedback](https://github.com/revanthsaii/PDF-Mantra/discussions)
- **Email** - revanth@example.com

## 🎓 Learning & Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [NativeWind Documentation](https://www.nativewind.dev/)

## 🚀 Roadmap

- [ ] Advanced OCR integration
- [ ] Batch operations
- [ ] Cloud storage integration (Google Drive, OneDrive)
- [ ] Annotation tools
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Desktop application (Electron)
- [ ] Cloud backup and sync

## 📊 Project Stats

- **Version**: 1.0.0
- **License**: MIT
- **Languages**: TypeScript, JavaScript
- **Platforms**: iOS, Android, Web
- **Last Updated**: January 2026

## 💡 Tips & Best Practices

1. Always backup important PDFs before processing
2. Use compression for large documents to save storage
3. Test document scanning with good lighting
4. Clear app cache regularly for optimal performance

## ⭐ Show Your Support

If you find this project helpful, please consider:
- Starring the repository ⭐
- Sharing it with others
- Contributing improvements
- Providing feedback

---

**Made with ❤️ by [Revanth Sai](https://github.com/revanthsaii)**
