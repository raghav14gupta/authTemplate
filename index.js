/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setupBackgroundHandler } from './src/services/notification/notificationService';

// 👉 IMPORTANT: Ye background/killed-state ka handler hai. App start se pehle register hona chahiye.
setupBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
