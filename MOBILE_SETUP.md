# 🚀 Configuration Mobile - CleanQuest Adventures

## ✅ Configuration terminée

Votre application CleanQuest Adventures est maintenant configurée pour fonctionner sur mobile ! Voici ce qui a été mis en place :

### 📱 Plateformes supportées

- **Android** (via Capacitor)
- **iOS** (via Capacitor)
- **PWA** (Progressive Web App)

### 🛠️ Technologies utilisées

- **Capacitor** pour les applications natives
- **Service Worker** pour le fonctionnement offline
- **PWA Manifest** pour l'installation
- **Hooks React** pour les fonctionnalités mobiles

## 🎯 Comment tester

### 1. **Test sur iPhone (Safari)**

```bash
npm run dev
```

Puis ouvrir `http://192.168.1.149:8080` sur votre iPhone

### 2. **Test sur Android (Émulateur)**

```bash
npm run android
```

Cela va :

- Build l'application
- Ouvrir Android Studio
- Lancer l'émulateur

### 3. **Test sur Android (Appareil physique)**

```bash
npm run android:dev
```

Cela va :

- Build l'application
- Lancer sur votre appareil connecté
- Activer le live reload

### 4. **Test sur iOS (Simulateur)**
```bash
npm run ios
```
Cela va :
- Build l'application
- Ouvrir Xcode
- Lancer le simulateur iOS

### 5. **Installation PWA**
1. Ouvrir l'app dans Chrome/Safari
2. Cliquer sur "Installer" ou "Ajouter à l'écran d'accueil"
3. L'app fonctionnera comme une application native

## 📋 Scripts disponibles

| Commande                | Description                      |
| ----------------------- | -------------------------------- |
| `npm run android`       | Build + ouvre Android Studio     |
| `npm run android:dev`   | Build + live reload sur appareil |
| `npm run build:android` | Build + synchronise avec Android |
| `npm run ios`           | Build + ouvre Xcode              |
| `npm run ios:dev`       | Build + live reload sur iOS      |
| `npm run build:ios`     | Build + synchronise avec iOS     |
| `npm run dev`           | Serveur de développement web     |

## 🔧 Fonctionnalités mobiles ajoutées

### ✅ Interface adaptée

- Design responsive optimisé mobile
- Boutons tactiles (44px minimum)
- Animations fluides
- Support des safe areas (notch)

### ✅ Expérience native

- Haptic feedback (vibrations)
- Gestes tactiles (swipe)
- Détection d'orientation
- Mode standalone

### ✅ Fonctionnement offline

- Service worker pour le cache
- Synchronisation automatique
- Notifications push
- Background sync

### ✅ Performance

- Optimisations CSS pour mobile
- Lazy loading des composants
- Cache intelligent
- Compression des assets

## 📁 Structure des fichiers

```
├── android/                 # Projet Android natif
├── public/
│   ├── manifest.json       # Configuration PWA
│   └── sw.js              # Service Worker
├── src/
│   ├── hooks/
│   │   └── use-mobile.tsx  # Hooks pour mobile
│   └── index.css          # Styles optimisés mobile
├── capacitor.config.ts     # Configuration Capacitor
└── ANDROID_SETUP.md       # Guide détaillé Android
```

## 🎨 Personnalisation

### Icônes

Remplacer les icônes dans :

- `public/icon-192.png`
- `public/icon-512.png`
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Couleurs

Modifier dans `capacitor.config.ts` :

- `backgroundColor`
- `theme-color` dans `index.html`

### Splash Screen

Remplacer `android/app/src/main/res/drawable/splash.png`

## 🚨 Dépannage

### Erreur "Command not found: cap"

```bash
npm install -g @capacitor/cli
```

### Problème de build Android

```bash
cd android
./gradlew clean
cd ..
npm run build:android
```

### Reset complet

```bash
rm -rf android
npx cap add android
npm run build:android
```

### Problème de synchronisation

```bash
npx cap sync android
```

## 📱 Test sur différents appareils

### iPhone

- Safari : `http://192.168.1.149:8080`
- Ajouter à l'écran d'accueil
- Test en mode portrait/landscape

### Android

- Chrome : `http://192.168.1.149:8080`
- Installer comme PWA
- Test sur émulateur et appareil physique

### Tablettes

- Test en mode paysage
- Vérifier l'adaptation de l'interface

## 🎯 Prochaines étapes

1. **Tester sur votre iPhone** : `http://192.168.1.149:8080`
2. **Installer Android Studio** si pas déjà fait
3. **Créer un émulateur Android** dans Android Studio
4. **Tester sur appareil physique** Android
5. **Personnaliser les icônes** et le splash screen
6. **Configurer les notifications push**

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier que tous les prérequis sont installés
2. Consulter `ANDROID_SETUP.md` pour plus de détails
3. Vérifier les logs dans la console du navigateur
4. Redémarrer le serveur de développement

---

🎉 **Votre application est maintenant prête pour le mobile !** 🎉
