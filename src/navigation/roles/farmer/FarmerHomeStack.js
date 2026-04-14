import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FarmerHomeScreen from '../../../screens/farmer/home/FarmerHomeScreen';
import MyFarms from '../../../screens/farmer/home/MyFarms';
import MyCrops from '../../../screens/farmer/home/MyCrops';
import CropDoctor from '../../../screens/farmer/home/CropDoctor';
import Inquiry from '../../../screens/farmer/home/Inquiry';
import MyOrders from '../../../screens/farmer/home/MyOrders';

const FarmerHomeStack = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={FarmerHomeScreen} />
      <Stack.Screen name="MyFarms" component={MyFarms} />
      <Stack.Screen name="MyCrops" component={MyCrops} />
      <Stack.Screen name="CropDoctor" component={CropDoctor} />
      <Stack.Screen name="Inquiry" component={Inquiry} />
      <Stack.Screen name="MyOrders" component={MyOrders} />
    </Stack.Navigator>
  );
};

export default FarmerHomeStack;

const styles = StyleSheet.create({});
