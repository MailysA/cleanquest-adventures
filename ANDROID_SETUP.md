# Configuration Android pour CleanQuest Adventures

## Prérequis

1. **Android Studio** installé sur votre machine
2. **Android SDK** configuré
3. **Un émulateur Android** ou un appareil Android connecté

## Installation des dépendances

```bash
# Installer Capacitor et les plugins
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/app @capacitor/haptics
```

## Configuration

### 1. Initialiser Capacitor (déjà fait)

```bash
npx cap init "CleanQuest Adventures" "com.cleanquest.adventures"
```

### 2. Ajouter la plateforme Android (déjà fait)

```bash
npx cap add android
```

## Scripts disponibles

### Build et ouverture dans Android Studio

```bash
npm run android
```

### Build et synchronisation

```bash
npm run build:android
```

### Développement avec live reload

```bash
npm run android:dev
```

## Test sur émulateur

1. **Ouvrir Android Studio**
2. **Créer un émulateur** si vous n'en avez pas :

   - Tools > AVD Manager
   - Create Virtual Device
   - Choisir un appareil (ex: Pixel 7)
   - Choisir une image système (API 33+ recommandé)

3. **Lancer l'émulateur**

4. **Build et tester** :

```bash
npm run android
```

## Test sur appareil physique

1. **Activer le mode développeur** sur votre appareil Android
2. **Activer le débogage USB**
3. **Connecter l'appareil** via USB
4. **Autoriser le débogage** sur l'appareil
5. **Lancer le build** :

```bash
npm run android
```

## Développement avec live reload

Pour un développement plus rapide avec rechargement automatique :

```bash
npm run android:dev
```

Cela va :

- Build l'application
- Lancer l'émulateur/appareil
- Activer le live reload
- Permettre les modifications en temps réel

## Structure des fichiers

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   │   └── ...
│   └── build.gradle
├── gradle/
└── build.gradle
```

## Personnalisation

### Icônes

Remplacer les icônes dans `android/app/src/main/res/` :

- `mipmap-hdpi/ic_launcher.png`
- `mipmap-mdpi/ic_launcher.png`
- `mipmap-xhdpi/ic_launcher.png`
- `mipmap-xxhdpi/ic_launcher.png`
- `mipmap-xxxhdpi/ic_launcher.png`

### Splash Screen

Modifier `android/app/src/main/res/drawable/splash.png`

### Configuration Capacitor

Modifier `capacitor.config.ts` pour ajuster les paramètres de l'application.

## Dépannage

### Erreur "Command not found: cap"

```bash
npm install -g @capacitor/cli
```

### Erreur de build

```bash
cd android
./gradlew clean
cd ..
npm run build:android
```

### Problème de synchronisation

```bash
npx cap sync android
```

### Reset complet

```bash
rm -rf android
npx cap add android
npm run build:android
```

## Ressources utiles

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Guide Android](https://capacitorjs.com/docs/android)
- [Plugins Capacitor](https://capacitorjs.com/docs/plugins)
