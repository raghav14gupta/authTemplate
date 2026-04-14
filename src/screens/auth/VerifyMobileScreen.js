// import React, { useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Keyboard,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch, useSelector } from 'react-redux';
// import { verifyOtp } from '../../store/authSlice';
// import { w, h, mw, f } from '../../utils/responsive';

// export default function VerifyMobileScreen({ route }) {
//   const { mobile, selectedRole } = route.params;
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [error, setError] = useState('');
//   const dispatch = useDispatch();
//   const { verifyOtpLoading, verifyOtpError } = useSelector(state => state.auth);
//   const inputs = useRef([]);

//   const handleChange = (text, idx) => {
//     if (/^[0-9]?$/.test(text)) {
//       const newOtp = [...otp];
//       newOtp[idx] = text;
//       setOtp(newOtp);
//       setError('');
//       if (text && idx < 5) {
//         inputs.current[idx + 1].focus();
//       }
//       if (!text && idx > 0) {
//         inputs.current[idx - 1].focus();
//       }
//     }
//   };

//   const handleVerify = async () => {
//     const enteredOtp = otp.join('');

//     if (enteredOtp.length < 6) {
//       setError('Please enter all 6 digits.');
//       return;
//     }

//     setError('');
//     Keyboard.dismiss();

//     const action = await dispatch(
//       verifyOtp({ mobile, otp: enteredOtp, role: selectedRole }),
//     );

//     if (typeof action.payload === 'string') {
//       setError(action.payload);
//     }

//     if (!action.payload && verifyOtp.rejected.match(action)) {
//       setError('OTP verification failed');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <Text style={styles.title}>Verify Mobile</Text>
//         <Text style={styles.subtitle}>We have sent OTP to</Text>
//         <Text style={styles.mobile}>{mobile}</Text>
//         <View style={styles.otpRow}>
//           {otp.map((digit, idx) => (
//             <TextInput
//               key={idx}
//               ref={el => (inputs.current[idx] = el)}
//               style={styles.otpBox}
//               keyboardType="numeric"
//               maxLength={1}
//               value={digit}
//               onChangeText={text => handleChange(text, idx)}
//               returnKeyType={idx === 5 ? 'done' : 'next'}
//               onSubmitEditing={handleVerify}
//               autoFocus={idx === 0}
//             />
//           ))}
//         </View>
//         {error || verifyOtpError ? (
//           <Text style={styles.error}>{error || verifyOtpError}</Text>
//         ) : null}
//         <TouchableOpacity
//           style={[styles.btn, verifyOtpLoading && styles.disabled]}
//           onPress={handleVerify}
//           disabled={verifyOtpLoading}
//         >
//           {verifyOtpLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.btnText}>Verify & Login</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#fff' },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: w(30),
//   },
//   title: { fontSize: f(22), fontWeight: 'bold', marginBottom: h(10) },
//   subtitle: { fontSize: f(16), color: '#666', marginBottom: h(4) },
//   mobile: {
//     fontSize: f(18),
//     fontWeight: '600',
//     marginBottom: h(24),
//   },
//   otpRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: h(20),
//   },
//   otpBox: {
//     width: mw(40),
//     height: mw(48),
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: mw(8),
//     textAlign: 'center',
//     fontSize: f(20),
//     marginHorizontal: mw(6),
//     backgroundColor: '#f9f9f9',
//   },
//   error: { color: 'red', marginBottom: h(10), fontSize: f(14) },
//   btn: {
//     backgroundColor: '#007bff',
//     borderRadius: mw(8),
//     alignItems: 'center',
//     marginTop: h(10),
//     padding: mw(15),
//   },
//   btnText: { color: '#fff', fontWeight: 'bold', fontSize: f(16) },
//   disabled: { opacity: 0.6 },
// });
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp } from '../../store/authSlice';
import { saveFcmTokenToBackend } from '../../store/notificationSlice';
import { w, h, mw, f } from '../../utils/responsive';

function WaveDivider() {
  return (
    <View style={styles.waveDivider}>
      {[...Array(8)].map((_, i) => (
        <View key={i} style={[styles.waveSeg, { opacity: 1 - i * 0.1 }]} />
      ))}
    </View>
  );
}

export default function VerifyMobileScreen({ route }) {
  const { mobile, selectedRole } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { verifyOtpLoading, verifyOtpError } = useSelector(state => state.auth);
  const inputs = useRef([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnPulse = useRef(new Animated.Value(1)).current;
  // One scale ref per OTP box
  const boxScales = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    // fadeAnim and slideAnim are stable Animated.Value refs — no re-runs needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateBox = idx => {
    Animated.sequence([
      Animated.timing(boxScales[idx], {
        toValue: 1.12,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(boxScales[idx], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleChange = (text, idx) => {
    if (/^[0-9]?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[idx] = text;
      setOtp(newOtp);
      setError('');
      // Forward: digit entered → move to next box
      if (text) {
        animateBox(idx);
        if (idx < 5) {
          inputs.current[idx + 1].focus();
        }
      }
      // Backward focus handled by onKeyPress (Backspace)
    }
  };

  const handleKeyPress = ({ nativeEvent }, idx) => {
    if (nativeEvent.key === 'Backspace') {
      if (otp[idx] === '' && idx > 0) {
        // Current box already empty → clear prev box and move focus back
        const newOtp = [...otp];
        newOtp[idx - 1] = '';
        setOtp(newOtp);
        inputs.current[idx - 1].focus();
      }
      // If current box has a digit, onChangeText fires with '' and clears it
      // — user stays on same box, no extra shift needed
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError('');
    Keyboard.dismiss();

    Animated.sequence([
      Animated.timing(btnPulse, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(btnPulse, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const action = await dispatch(
      verifyOtp({ mobile, otp: enteredOtp, role: selectedRole }),
    );

    if (typeof action.payload === 'string') {
      setError(action.payload);
      return;
    }

    if (!action.payload || verifyOtp.rejected.match(action)) {
      setError('OTP verification failed');
      return;
    }

    // ✅ OTP verify hua — ab FCM token backend pe bhejo
    // Login flow mat ruko agar FCM fail ho — isliye fire-and-forget dispatch hai
    dispatch(saveFcmTokenToBackend());
  };

  const filledCount = otp.filter(d => d !== '').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* BG blobs */}
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />
      <View style={styles.dotA} />
      <View style={styles.dotB} />
      <View style={styles.dotC} />

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🔐</Text>
          </View>
          <Text style={styles.appName}>Retail Management</Text>
          <Text style={styles.tagline}>Aapka Business, Aapki Tarakki</Text>
        </View>

        <WaveDivider />

        {/* ── Card ── */}
        <View style={styles.card}>
          {/* Title */}
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>A 6-digit OTP has been sent to</Text>
          <View style={styles.mobileRow}>
            <Text style={styles.mobileFlag}>📱</Text>
            <Text style={styles.mobile}>+91 {mobile}</Text>
          </View>

          {/* Role badge */}
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{selectedRole} Access</Text>
          </View>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.otpBoxWrap,
                  { transform: [{ scale: boxScales[idx] }] },
                ]}
              >
                <TextInput
                  ref={el => (inputs.current[idx] = el)}
                  style={[styles.otpBox, digit !== '' && styles.otpBoxFilled]}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleChange(text, idx)}
                  onKeyPress={e => handleKeyPress(e, idx)}
                  returnKeyType={idx === 5 ? 'done' : 'next'}
                  onSubmitEditing={handleVerify}
                  autoFocus={idx === 0}
                  selectionColor="#4a7c1f"
                />
              </Animated.View>
            ))}
          </View>

          {/* Progress dots */}
          <View style={styles.progressDots}>
            {otp.map((digit, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  digit !== '' ? styles.dotFilled : styles.dotEmpty,
                ]}
              />
            ))}
          </View>
          <Text style={styles.progressHint}>
            {filledCount}/6 digits entered
          </Text>

          {/* Error */}
          {error || verifyOtpError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error || verifyOtpError}</Text>
            </View>
          ) : null}

          {/* Button */}
          <Animated.View style={{ transform: [{ scale: btnPulse }] }}>
            <TouchableOpacity
              style={[styles.btn, verifyOtpLoading && styles.disabled]}
              onPress={handleVerify}
              disabled={verifyOtpLoading}
              activeOpacity={0.85}
            >
              {verifyOtpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnInner}>
                  <Text style={styles.btnText}>Verify &amp; Login</Text>
                  <Text style={styles.btnArrow}>→</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.footerNote}>
            🔒 Your data is encrypted &amp; secure
          </Text>
        </View>

        {/* Bottom emoji strip */}
        <View style={styles.bottomRow}>
          {['🏪', '📦', '💼', '📊', '🧾'].map((emoji, i) => (
            <Text key={i} style={styles.bottomEmoji}>
              {emoji}
            </Text>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f3eb',
    overflow: 'hidden',
  },

  // BG blobs — same as LoginScreen
  bgBlob1: {
    position: 'absolute',
    top: -h(60),
    right: -w(60),
    width: w(220),
    height: w(220),
    borderRadius: w(110),
    backgroundColor: '#dff0c0',
    opacity: 0.55,
  },
  bgBlob2: {
    position: 'absolute',
    bottom: -h(80),
    left: -w(50),
    width: w(200),
    height: w(200),
    borderRadius: w(100),
    backgroundColor: '#fde9b0',
    opacity: 0.5,
  },
  dotA: {
    position: 'absolute',
    top: h(80),
    left: w(30),
    width: w(10),
    height: w(10),
    borderRadius: w(5),
    backgroundColor: '#a3c97a',
  },
  dotB: {
    position: 'absolute',
    top: h(160),
    right: w(20),
    width: w(6),
    height: w(6),
    borderRadius: w(3),
    backgroundColor: '#f5c842',
  },
  dotC: {
    position: 'absolute',
    bottom: h(120),
    left: w(15),
    width: w(8),
    height: w(8),
    borderRadius: w(4),
    backgroundColor: '#e8a045',
  },

  container: {
    flex: 1,
    paddingHorizontal: w(22),
    justifyContent: 'center',
  },

  // ── Header ──
  header: { alignItems: 'center', marginBottom: h(24) },
  iconCircle: {
    width: w(72),
    height: w(72),
    borderRadius: w(36),
    backgroundColor: '#4a7c1f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: h(10),
    shadowColor: '#2e5a0e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  iconEmoji: { fontSize: f(34) },
  appName: {
    fontSize: f(26),
    fontWeight: '800',
    color: '#2d5a0f',
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  tagline: {
    fontSize: f(12),
    color: '#7a9e50',
    marginTop: h(3),
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },

  // Wave divider
  waveDivider: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: h(20),
    gap: w(4),
  },
  waveSeg: {
    width: w(18),
    height: h(4),
    borderRadius: 4,
    backgroundColor: '#8db84a',
  },

  // ── Card ──
  card: {
    backgroundColor: '#ffffffee',
    borderRadius: mw(20),
    paddingHorizontal: w(22),
    paddingVertical: h(28),
    shadowColor: '#5a8c2a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#d5eab0',
  },

  title: {
    fontSize: f(20),
    fontWeight: '800',
    color: '#2d5a0f',
    marginBottom: h(6),
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: f(13),
    color: '#8fa86a',
    marginBottom: h(4),
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h(12),
    gap: w(6),
  },
  mobileFlag: { fontSize: f(16) },
  mobile: {
    fontSize: f(17),
    fontWeight: '700',
    color: '#2d5a0f',
    letterSpacing: 1,
  },

  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f5d0',
    borderRadius: mw(20),
    paddingHorizontal: w(12),
    paddingVertical: h(4),
    marginBottom: h(20),
    borderWidth: 1,
    borderColor: '#c2dfa0',
  },
  rolePillText: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#3a6b10',
    letterSpacing: 0.4,
  },

  // OTP row
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: h(12),
    gap: w(8),
  },
  otpBoxWrap: {
    // wrapper for scale animation
  },
  otpBox: {
    width: mw(42),
    height: mw(52),
    borderWidth: 1.5,
    borderColor: '#c2dfa0',
    borderRadius: mw(10),
    textAlign: 'center',
    fontSize: f(22),
    fontWeight: '700',
    color: '#2d5a0f',
    backgroundColor: '#f2f8ea',
  },
  otpBoxFilled: {
    borderColor: '#4a7c1f',
    backgroundColor: '#e6f5d0',
  },

  // Progress dots
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: w(6),
    marginBottom: h(4),
  },
  dot: {
    width: w(7),
    height: w(7),
    borderRadius: w(4),
  },
  dotFilled: { backgroundColor: '#4a7c1f' },
  dotEmpty: { backgroundColor: '#d5eab0' },
  progressHint: {
    fontSize: f(11),
    color: '#9ab870',
    textAlign: 'center',
    marginBottom: h(16),
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderRadius: mw(8),
    padding: w(10),
    marginBottom: h(12),
    borderLeftWidth: 3,
    borderLeftColor: '#e07b00',
    gap: w(6),
  },
  errorIcon: { fontSize: f(14) },
  errorText: { color: '#7a4000', fontSize: f(13), flex: 1 },

  // Button
  btn: {
    backgroundColor: '#4a7c1f',
    paddingVertical: h(16),
    borderRadius: mw(12),
    alignItems: 'center',
    marginTop: h(4),
    shadowColor: '#2e5a0e',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: w(8),
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: f(16),
    letterSpacing: 0.5,
  },
  btnArrow: {
    color: '#c5e89a',
    fontSize: f(18),
    fontWeight: '700',
  },
  disabled: { opacity: 0.55 },

  footerNote: {
    textAlign: 'center',
    fontSize: f(12),
    color: '#9ab870',
    marginTop: h(14),
  },

  // Bottom strip
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: h(28),
    gap: w(14),
  },
  bottomEmoji: { fontSize: f(20) },
});
