# Flutter Installation Guide

## Quick Install Flutter on macOS

### Option 1: Using Homebrew (Easiest)

```bash
# Install Flutter
brew install --cask flutter

# Verify installation
flutter doctor
```

### Option 2: Manual Installation

1. **Download Flutter SDK:**
   ```bash
   cd ~
   git clone https://github.com/flutter/flutter.git -b stable
   ```

2. **Add to PATH:**
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export PATH="$PATH:$HOME/flutter/bin"
   
   # Reload shell
   source ~/.zshrc  # or source ~/.bash_profile
   ```

3. **Run Flutter Doctor:**
   ```bash
   flutter doctor
   ```

4. **Install Additional Tools:**
   ```bash
   # Install Xcode Command Line Tools
   xcode-select --install
   
   # Accept licenses
   sudo xcodebuild -license accept
   ```

### Option 3: Use Flutter Web Only (No Mobile)

If you only need web, you can use Flutter Web without full installation:

```bash
# Install Dart SDK
brew install dart

# Then use Flutter Web tools
```

## After Installation

Once Flutter is installed:

```bash
cd /Users/radio/flutter
flutter pub get
flutter run -d chrome
```

## Test Frontend (No Flutter Needed!)

I've created a simple HTML test interface that works right now:

**Open in browser:**
```
file:///Users/radio/flutter/test_frontend/index.html
```

Or run:
```bash
cd /Users/radio/flutter
open test_frontend/index.html
```

This lets you test the backend API immediately without installing Flutter!
