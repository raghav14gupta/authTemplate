// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch, useSelector } from 'react-redux';
// import { sendOtp } from '../../store/authSlice';
// import { w, h, mw, f } from '../../utils/responsive';

// export default function LoginWithPhoneScreen({ route, navigation }) {
//   const dispatch = useDispatch();
//   //role jo user ne select kia tha
//   const selectedRole = route?.params?.selectedRole || 'Farmer';

//   const [mobile, setMobile] = useState('');
//   const [formError, setFormError] = useState('');
//   const { sendOtpLoading, sendOtpError } = useSelector(state => state.auth);

//   const handleMobileChange = value => {
//     const digitsOnly = value.replace(/[^0-9]/g, '');
//     setMobile(digitsOnly);
//     setFormError('');
//   };

//   const handleLoginWithOtp = async () => {
//     if (mobile.length !== 10) {
//       setFormError('Please enter a valid 10-digit mobile number.');
//       return;
//     }
//     if (!selectedRole) {
//       setFormError('Please select a role.');
//       return;
//     }

//     setFormError('');

//     const action = await dispatch(sendOtp({ mobile, role: selectedRole }));

//     if (sendOtp.fulfilled.match(action)) {
//       navigation.navigate('VerifyMobile', { mobile, selectedRole });
//       return;
//     }

//     if (typeof action.payload === 'string') {
//       setFormError(action.payload);
//     }

//     if (!action.payload) {
//       setFormError('Failed to send OTP');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         style={styles.flex}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       >
//         <View style={styles.container}>
//           <Text style={styles.title}>
//             Login as {selectedRole || 'Role not selected'}
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Mobile Number"
//             keyboardType="numeric"
//             maxLength={10}
//             value={mobile}
//             onChangeText={handleMobileChange}
//             editable={!sendOtpLoading}
//           />

//           {(formError || sendOtpError) && (
//             <Text style={styles.errorText}>{formError || sendOtpError}</Text>
//           )}

//           <TouchableOpacity
//             style={[styles.btn, sendOtpLoading && styles.disabled]}
//             onPress={handleLoginWithOtp}
//             disabled={sendOtpLoading}
//           >
//             {sendOtpLoading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.btnText}>Login with OTP</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#fff' },
//   flex: { flex: 1 },
//   container: { flex: 1, paddingHorizontal: w(20), justifyContent: 'center' },
//   title: { fontSize: f(22), fontWeight: 'bold', marginBottom: h(20) },
//   input: {
//     borderBottomWidth: 1,
//     borderColor: '#ccc',
//     paddingVertical: h(10),
//     fontSize: f(16),
//     marginBottom: h(20),
//   },
//   hintText: {
//     color: '#6b7280',
//     marginTop: -h(12),
//     marginBottom: h(16),
//   },
//   errorText: { color: 'red', marginBottom: h(10), fontSize: f(14) },
//   btn: {
//     backgroundColor: '#007bff',
//     paddingVertical: h(14),
//     borderRadius: mw(8),
//     alignItems: 'center',
//     marginTop: h(10),
//   },
//   btnText: { color: '#fff', fontWeight: 'bold', fontSize: f(16) },
//   disabled: { opacity: 0.6 },
// });
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp } from '../../store/authSlice';
import { w, h, mw, f } from '../../utils/responsive';

// ─── Decorative SVG-like shapes via View components ───────────────────────────
function LeafDot({ style }) {
  return <View style={[styles.leafDot, style]} />;
}

function WaveDivider() {
  return (
    <View style={styles.waveDivider}>
      {[...Array(8)].map((_, i) => (
        <View key={i} style={[styles.waveSeg, { opacity: 1 - i * 0.1 }]} />
      ))}
    </View>
  );
}

export default function LoginWithPhoneScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const selectedRole = route?.params?.selectedRole || 'Farmer';

  const [mobile, setMobile] = useState('');
  const [formError, setFormError] = useState('');
  const { sendOtpLoading, sendOtpError } = useSelector(state => state.auth);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const inputScale = useRef(new Animated.Value(1)).current;
  const btnPulse = useRef(new Animated.Value(1)).current;

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

  const handleFocus = () => {
    Animated.spring(inputScale, {
      toValue: 1.02,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    Animated.spring(inputScale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleMobileChange = value => {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    setMobile(digitsOnly);
    setFormError('');
  };

  const handleLoginWithOtp = async () => {
    if (mobile.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!selectedRole) {
      setFormError('Please select a role.');
      return;
    }

    setFormError('');

    // Button press animation
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

    const action = await dispatch(sendOtp({ mobile, role: selectedRole }));

    if (sendOtp.fulfilled.match(action)) {
      navigation.navigate('VerifyMobile', { mobile, selectedRole });
      return;
    }

    if (typeof action.payload === 'string') {
      setFormError(action.payload);
    }

    if (!action.payload) {
      setFormError('Failed to send OTP');
    }
  };

  const progressWidth = (mobile.length / 10) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background texture blobs */}
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />
      <LeafDot style={styles.leafDotGreen} />
      <LeafDot style={styles.leafDotYellow} />
      <LeafDot style={styles.leafDotOrange} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View
          style={[
            styles.flex,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Scrollable content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>🏪</Text>
              </View>
              <Text style={styles.appName}>Retail Management</Text>
              <Text style={styles.tagline}>Aapka Business, Aapki Tarakki</Text>
            </View>

            <WaveDivider />

            {/* ── Card ── */}
            <View style={styles.card}>
              <Text style={styles.roleLabel}>
                <Text style={styles.roleBadge}> {selectedRole} </Text> access ke
                saath login karein
              </Text>
              <Text style={styles.cardSubtitle}>
                Apna registered mobile number enter karein — OTP aapke phone par
                bheja jaega
              </Text>

              {/* Phone input */}
              <Animated.View
                style={[
                  styles.inputWrapper,
                  { transform: [{ scale: inputScale }] },
                ]}
              >
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <View style={styles.codeDivider} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9caf7e"
                  keyboardType="numeric"
                  maxLength={10}
                  value={mobile}
                  onChangeText={handleMobileChange}
                  editable={!sendOtpLoading}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {mobile.length === 10 && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Animated.View>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    { width: `${progressWidth}%` },
                    mobile.length === 10
                      ? styles.progressBarFull
                      : styles.progressBarPartial,
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                {mobile.length}/10 digits entered
              </Text>

              {/* Error */}
              {(formError || sendOtpError) && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>
                    {formError || sendOtpError}
                  </Text>
                </View>
              )}
            </View>

            {/* Decorative bottom row */}
            <View style={styles.bottomRow}>
              {['🏪', '📦', '💼', '📊', '🧾'].map((emoji, i) => (
                <Text key={i} style={styles.bottomEmoji}>
                  {emoji}
                </Text>
              ))}
            </View>
          </ScrollView>

          {/* ── Sticky Footer: Button always above keyboard ── */}
          <View style={styles.stickyFooter}>
            <Animated.View style={{ transform: [{ scale: btnPulse }] }}>
              <TouchableOpacity
                style={[styles.btn, sendOtpLoading && styles.disabled]}
                onPress={handleLoginWithOtp}
                disabled={sendOtpLoading}
                activeOpacity={0.85}
              >
                {sendOtpLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.btnInner}>
                    <Text style={styles.btnText}>Send OTP</Text>
                    <Text style={styles.btnArrow}>→</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.footerNote}>
              🔒 Your data is encrypted &amp; secure
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f3eb',
    overflow: 'hidden',
  },
  flex: { flex: 1 },

  // BG blobs
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
  leafDot: { position: 'absolute' },
  leafDotGreen: {
    position: 'absolute',
    top: h(80),
    left: w(30),
    width: w(10),
    height: w(10),
    backgroundColor: '#a3c97a',
    borderRadius: w(5),
  },
  leafDotYellow: {
    position: 'absolute',
    top: h(160),
    right: w(20),
    width: w(6),
    height: w(6),
    backgroundColor: '#f5c842',
    borderRadius: w(3),
  },
  leafDotOrange: {
    position: 'absolute',
    bottom: h(120),
    left: w(15),
    width: w(8),
    height: w(8),
    backgroundColor: '#e8a045',
    borderRadius: w(4),
  },

  scrollContent: {
    paddingHorizontal: w(22),
    paddingTop: h(40),
    paddingBottom: h(16),
  },

  stickyFooter: {
    paddingHorizontal: w(22),
    paddingTop: h(12),
    paddingBottom: h(16),
    backgroundColor: '#f7f3eb',
    borderTopWidth: 1,
    borderTopColor: '#e0efd0',
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

  roleLabel: {
    fontSize: f(13),
    color: '#5a7a3a',
    marginBottom: h(4),
    fontWeight: '500',
  },
  roleBadge: {
    backgroundColor: '#e6f5d0',
    color: '#3a6b10',
    fontWeight: '700',
    paddingHorizontal: w(6),
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: f(13),
  },
  cardSubtitle: {
    fontSize: f(13),
    color: '#8fa86a',
    marginBottom: h(20),
    lineHeight: f(19),
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f8ea',
    borderRadius: mw(12),
    borderWidth: 1.5,
    borderColor: '#c2dfa0',
    paddingHorizontal: w(12),
    marginBottom: h(8),
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: w(8),
  },
  countryCodeText: {
    fontSize: f(16),
    fontWeight: '700',
    color: '#4a7c1f',
  },
  codeDivider: {
    width: 1,
    height: h(20),
    backgroundColor: '#c2dfa0',
    marginLeft: w(8),
  },
  input: {
    flex: 1,
    paddingVertical: h(14),
    fontSize: f(17),
    color: '#2d4a10',
    fontWeight: '600',
    letterSpacing: 2,
  },
  checkmark: {
    fontSize: f(18),
    color: '#4a7c1f',
    fontWeight: '700',
  },

  // Progress
  progressTrack: {
    height: h(4),
    backgroundColor: '#e0efd0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: h(4),
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarFull: { backgroundColor: '#5a8c2a' },
  progressBarPartial: { backgroundColor: '#8db84a' },
  progressHint: {
    fontSize: f(11),
    color: '#9ab870',
    textAlign: 'right',
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

  // Bottom emoji row
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: h(28),
    gap: w(14),
  },
  bottomEmoji: { fontSize: f(20) },
});
