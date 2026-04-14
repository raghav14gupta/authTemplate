import { StyleSheet, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const Inquiry = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Inquiry</Text>
    </SafeAreaView>
  );
};

export default Inquiry;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
