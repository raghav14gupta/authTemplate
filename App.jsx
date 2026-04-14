import React from 'react';
import { Provider } from 'react-redux';
import store from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import NotificationController from './src/services/notification/NotificationController';
import { CustomAlertHost } from './src/componentCommon/CustomAlert';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />

      <Provider store={store}>
        {/* 👉 Controller jo FCM setup sambhalega (invisible components) */}
        <NotificationController />
        <CustomAlertHost />
        <RootNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}
