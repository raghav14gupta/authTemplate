import { StyleSheet, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const CropDoctor = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>CropDoctor</Text>
    </SafeAreaView>
  );
};

export default CropDoctor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
