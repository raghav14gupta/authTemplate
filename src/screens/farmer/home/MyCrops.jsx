import { StyleSheet, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const MyCrops = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>MyCrops</Text>
    </SafeAreaView>
  );
};

export default MyCrops;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
