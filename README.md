# Kasagi Labo Coding Challenge

Anime Explorer app for https://github.com/kasagi-labo/kasagi-coding-challenge

## Tech Stacks

- **Languages:** TypeScript
- **Frameworks:** React, React Native, Expo
- **Navigation:** React Navigation
- **State Management:** React Context
- **API:** Apisauce
- **Testing:** Jest, @testing-library/react-native
- **Styling:** Custom theming, Expo Google Fonts
- **Other:** MMKV storage, Reactotron, EAS Build

## Boilerplate

This project was bootstrapped using [Ignite CLI](https://github.com/infinitered/ignite), a popular React Native project boilerplate and CLI.

## Files Structure
```
kasagi-labo-frontend-development-challenge/
├── app/
│   ├── app.tsx         # App entry point
│   ├── components/     # Reusable UI components
│   ├── config/         # App configuration files (env, API, etc.)
│   ├── context/        # React Context providers and hooks
│   ├── devtools/       # Development/debugging tools (e.g., Reactotron)
│   ├── i18n/           # Internationalization (translations)
│   ├── navigators/     # Navigation setup and utilities
│   ├── screens/        # App screens and screen groups
│   ├── services/       # API and business logic services
│   ├── theme/          # Theme files
│   └── utils/          # Utility functions and hooks
├── assets/
│   ├── icons/          # App icon images
│   └── images/         # Other image assets
│ ...
```

## Current Limitations

1. **`DetailsScreen` not able to Deeplink:**  
   The `DetailsScreen` currently cannot be opened via deeplink because it requires a full `AnimeDetails` object. To support deeplinking, the structure should be updated to fetch details from an API using an `mal_id`

2. **Hardcoded Genres:**  
   Genre data is hardcoded now for demo purposes. In a production app, genres should be fetched dynamically from an API.

3. **Checkbox API Calls:**  
   Each time a checkbox is toggled, an API call is made. This could slow down the app due to multiple requests. Maybe we can do debounce or batch the requests to improve the UX.

## Future Improvements

1. Add more tests for additional screens and integration scenarios.
2. Implement deeplink for `DetailsScreen` and share functionality for sharing Anime
3. Replace checkboxes with a dropdown that supports multi-select for better UX.
4. Add CI/CD pipeline for automated testing and deployment.

## Installation Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/limkhashing/kasagi-labo-frontend-development-challenge.git
   ```
2. Navigate to the project directory:
   ```bash
   cd kasagi-labo-frontend-development-challenge
   ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the development server:
    ```bash
    npm run start
    ```
   
5. To run the app on a simulator or device:
   - For iOS:
   `npm run ios`
   - For Android:
   `npm run android`

### Requirements
1. Node.js 
2. npm 
3. Expo CLI (npm install -g expo-cli)
4. Android Studio (for Android)
5. Xcode (for iOS)