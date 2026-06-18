# Signhify AI — Distribution & Marketing Strategy

> **Creator**: Piyush Raj Singh  
> **Date**: June 18, 2026  
> **Goal**: Maximum reach across all platforms

---

## Part 1: Platform Publishing Strategy

### 🟢 VS Code Extension Marketplace

**Prerequisites:**

- Microsoft/Azure account (free)
- Publisher account ($5 one-time fee)

**Steps:**

```bash
# 1. Create publisher at https://marketplace.visualstudio.com
# 2. Get Personal Access Token (PAT)
# 3. Login with vsce
vsce login signhify

# 4. Publish
cd packages/vscode-extension
vsce publish
```

**Optimization:**

- Title: "Signhify AI — Multi-Provider Coding Assistant"
- Tags: ai, llm, copilot, code-completion, chatgpt, multi-provider
- Category: AI, Programming
- Screenshots: Chat panel, inline completions, code actions
- README with GIF demos

---

### 🟦 Microsoft Store (Electron App)

**Prerequisites:**

- Microsoft Partner Center account ($19 one-time)
- Company logo and screenshots

**Steps:**

1. Go to https://partner.microsoft.com/dashboard
2. Register as a developer ($19)
3. Create new app submission
4. Upload `Signhify AI Setup 1.0.0.exe`
5. Fill store listing:
   - Name: "Signhify AI"
   - Description: "AI coding assistant with 10+ providers"
   - Screenshots: 1920x1080 minimum
   - Category: Developer Tools
6. Submit for certification (usually 1-3 days)

**Alternative: Sideload**

```bash
# Create MSIX package
electron-builder --win msix
```

---

### 🍎 Mac App Store

**Prerequisites:**

- Apple Developer account ($99/year)
- App notarization

**Steps:**

1. Code sign the app:

```bash
# Export certificates from Keychain
electron-builder --mac dmg --sign
```

2. Notarize:

```bash
xcrun notarytool submit dist/SignhifyAI.dmg \
  --apple-id "your@email.com" \
  --team-id "YOUR_TEAM_ID" \
  --password "app-specific-password"
```

3. Upload to App Store Connect:
   - Go to https://appstoreconnect.apple.com
   - Create new app
   - Upload .pkg or .dmg
   - Fill metadata and screenshots
   - Submit for review

**Note:** Mac App Store has strict sandboxing. May need to remove:

- File system access (use macOS sandbox)
- Network restrictions (entitlements)

---

### 📱 iOS App Store (Future)

**Prerequisites:**

- Apple Developer account ($99/year)
- React Native or Flutter wrapper

**Strategy:**

1. Wrap web app in WKWebView
2. Add native features (push notifications, Siri shortcuts)
3. Submit for review

---

### 🤖 Google Play Store (Future)

**Prerequisites:**

- Google Play Developer account ($25 one-time)

**Strategy:**

1. Use Capacitor or Cordova to wrap web app
2. Add Android-specific features
3. Submit for review

---

### 🐧 Linux Package Managers

**Debian/Ubuntu (.deb):**

```bash
# Build .deb package
electron-builder --linux deb

# Submit to PPA
ppa-publisher signhify-ai
```

**Fedora/RHEL (.rpm):**

```bash
electron-builder --linux rpm
```

**AUR (Arch):**

```bash
# Create PKGBUILD
# Submit to AUR
```

**Snap Store:**

```bash
snapcraft
snapcraft upload signhify_1.0.0_amd64.snap
```

**Flatpak:**

```bash
flatpak-builder build-dir io.github.signhify.desktop.yml
flatpak upload flathub
```

---

### 🌐 Web Distribution

**Already Deployed:**

- ✅ Vercel: https://signhify-ai.vercel.app
- ✅ Render: https://signhify-ai.onrender.com

**Additional Platforms:**

- Product Hunt launch
- Hacker News "Show HN"
- Reddit r/programming, r/artificial, r/SideProject
- Dev.to article
- Medium article
- Hashnode blog post

---

## Part 2: Launch Timeline

### Week 1: Soft Launch

- [ ] Deploy to Vercel + Render ✅
- [ ] Publish VS Code extension
- [ ] Submit to Product Hunt
- [ ] Post on LinkedIn/X

### Week 2: Expansion

- [ ] Submit to Microsoft Store
- [ ] Create Mac DMG
- [ ] Write dev.to article
- [ ] Reddit posts

### Week 3: Community

- [ ] Hacker News "Show HN"
- [ ] YouTube demo video
- [ ] Reddit AMAs
- [ ] Discord community

### Week 4: Scale

- [ ] Mac App Store submission
- [ ] Linux packages
- [ ] Press outreach
- [ ] Partnership discussions

---

## Part 3: SEO & Discoverability

### Keywords (All Platforms)

```
Signhify AI, AI coding assistant, multi-provider LLM,
free AI copilot, code completion, AI chat,
VS Code extension, Cursor alternative,
GPT-4 free, Claude free, Gemini free,
open source AI, BYOK AI, privacy-first AI
```

### GitHub Optimization

- ✅ README with badges
- ✅ Contributing guidelines
- ✅ Issue templates
- ✅ GitHub Actions CI
- ✅ Release tags

### Product Hunt Listing

- Tagline: "Type less. Signhify everything."
- Description: "7 AI agents, 10 providers, 100% free tier"
- Topics: AI, Developer Tools, Open Source
- Maker: Piyush Raj Singh

---

## Part 4: Content Calendar

### Day 1: Launch Day

- LinkedIn post (see below)
- X/Twitter thread (see below)
- Product Hunt submission
- Dev.to article

### Day 2-3: Follow-up

- YouTube demo video
- Reddit posts
- Hacker News

### Day 4-7: Community Building

- Discord server setup
- Respond to all comments
- Bug fixes from feedback

### Week 2: Expansion

- Microsoft Store submission
- Mac App Store prep
- Partnership outreach

---

_Created by Piyush Raj Singh_
_"Type less. Signhify everything."_
