import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { w, h, mw, f } from '../utils/responsive';
import IMAGES from '../assets/images';

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        <View style={styles.topStrip} />

        <ImageBackground
          source={IMAGES.onBoardImg}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.content}>
            <Text style={styles.title}>
              Welcome to Retailer{'\n'}Management System
            </Text>
            <Text style={styles.subTitle}>
              Streamline your retail business effortlessly
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('RoleSelection')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '109%',
    padding: 8,
  },
  topStrip: {
    height: h(2),
    backgroundColor: '#FFFFFF',
  },
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: h(10),
    paddingBottom: h(22),
    paddingHorizontal: w(20),
  },
  content: {
    width: '100%',
    alignItems: 'center',
    marginTop: h(30),
    paddingRight: 40,
  },
  title: {
    fontSize: f(28),
    fontWeight: '800',
    textAlign: 'center',
    color: '#2D3C58',
    lineHeight: f(38),
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: f(15),
    color: '#4A5568',
    textAlign: 'center',
    marginTop: h(14),
    lineHeight: f(22),
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  button: {
    backgroundColor: '#1D2F66',
    height: h(56),
    width: '90%',
    borderRadius: mw(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#11254D',
    shadowOffset: {
      width: 0,
      height: h(7),
    },
    shadowOpacity: 0.24,
    shadowRadius: mw(11),
    elevation: 9,
  },
  buttonText: {
    color: '#fff',
    fontSize: f(17),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
