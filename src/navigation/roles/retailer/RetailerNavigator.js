import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RetailerHomeScreen from '../../../screens/retailer/RetailerHomeScreen';

const Stack = createNativeStackNavigator();

export default function RetailerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="RetailerHome" 
        component={RetailerHomeScreen} 
      />
    </Stack.Navigator>
  );
}
