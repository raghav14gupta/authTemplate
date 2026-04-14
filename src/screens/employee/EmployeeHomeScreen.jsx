import React from 'react';
import { Text, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/authSlice';

export default function EmployeeHomeScreen() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    await dispatch(logoutUser());
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Employee Home Screen</Text>
      <Button title="Logout" onPress={handleLogout} color="#f97316" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
