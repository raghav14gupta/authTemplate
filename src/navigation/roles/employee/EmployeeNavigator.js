import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeeHomeScreen from '../../../screens/employee/EmployeeHomeScreen';

const Stack = createNativeStackNavigator();

export default function EmployeeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="EmployeeHome" 
        component={EmployeeHomeScreen} 
      />
    </Stack.Navigator>
  );
}
