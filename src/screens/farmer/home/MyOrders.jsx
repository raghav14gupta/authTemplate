import { StyleSheet, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const MyOrders = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>MyOrders</Text>
    </SafeAreaView>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
