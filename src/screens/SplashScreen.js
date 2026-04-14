import React, { useEffect } from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import IMAGES from '../assets/images';

export default function SplashScreen() {
  return (
    <ImageBackground
      source={IMAGES.Splash}
      style={styles.background}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
});
