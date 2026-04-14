import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { w, h, mw, f } from '../../utils/responsive'; // Aapke custom responsive utilities
import COLORS from '../../const/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import IMAGES from '../../assets/images';

// Role data with individual styling themes
const ROLES = [
  {
    id: 'Farmer',
    title: 'Farmer',
    subtitle: 'Get crop advisory,\nmarketplace access & rewards',
    iconName: 'account-hard-hat',
    theme: {
      bg: '#F2F8F4',
      iconBg: '#2A633F',
      activeBorder: '#2A633F',
      inactiveBorder: 'transparent',
      titleColor: '#1C3E2A',
    },
  },
  {
    id: 'Employee',
    title: 'Employee',
    subtitle: 'Track field visits, farmer leads\n& performance',
    iconName: 'briefcase-outline',
    theme: {
      bg: '#FFF8EA',
      iconBg: '#F4B13E',
      activeBorder: '#F4B13E',
      inactiveBorder: 'transparent',
      titleColor: '#4A3B22',
    },
  },
  {
    id: 'Retailer',
    title: 'Retailer',
    subtitle: 'Manage operations,\nsupport & reports',
    iconName: 'storefront-outline',
    theme: {
      bg: '#F0F2FA',
      iconBg: '#2B326B',
      activeBorder: '#2B326B',
      inactiveBorder: 'transparent',
      titleColor: '#1F244C',
    },
  },
];

export default function RoleSelectionScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole) {
      navigation.navigate('Login', { selectedRole });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Placeholder for top farm image - Replace with actual Image component later */}
        <Image
          source={IMAGES.roleBased}
          style={styles.headerPlaceholder}
          resizeMode="cover"
          height={h(90)}
        />
        <View style={styles.headerPlaceholder} />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome to KrishiGyan AI</Text>
          <Text style={styles.subtitle}>
            Select your role to personalize your experience
          </Text>

          {/* Role Cards List */}
          {ROLES.map(role => {
            const isSelected = selectedRole === role.id;

            return (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.8}
                onPress={() => setSelectedRole(role.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: role.theme.bg,
                    borderColor: isSelected
                      ? role.theme.activeBorder
                      : role.theme.inactiveBorder,
                  },
                ]}
              >
                {/* Left Icon Block */}
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: role.theme.iconBg },
                  ]}
                >
                  <Icon name={role.iconName} size={f(28)} color="#FFF" />
                </View>

                {/* Center Text Block */}
                <View style={styles.textContainer}>
                  <Text
                    style={[styles.roleTitle, { color: role.theme.titleColor }]}
                  >
                    {role.title}
                  </Text>
                  <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                </View>

                {/* Right Arrow Icon */}
                <Icon
                  name="arrow-right"
                  size={f(24)}
                  color={role.theme.titleColor}
                />
              </TouchableOpacity>
            );
          })}

          {/* Bottom Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedRole && styles.disabledButton, // Button gets slightly faded if no role is selected
            ]}
            disabled={!selectedRole}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Icon
              name="arrow-right"
              size={f(20)}
              color="#FFF"
              style={styles.continueIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerPlaceholder: {
    width: '100%',
    height: h(70),
    backgroundColor: '#f5f8f0', // Matches the light green tint of your header image
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: w(20),
    paddingTop: h(20),
  },
  title: {
    fontSize: f(24),
    fontWeight: '800',
    color: '#1B3B2A',
    textAlign: 'center',
    marginBottom: h(8),
  },
  subtitle: {
    fontSize: f(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: h(30),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mw(16),
    borderRadius: mw(16),
    marginBottom: h(16),
    borderWidth: 1.5,
  },
  iconWrapper: {
    width: mw(56),
    height: mw(56),
    borderRadius: mw(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: w(16),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: f(18),
    fontWeight: '700',
    marginBottom: h(4),
  },
  roleSubtitle: {
    fontSize: f(13),
    color: '#555',
    lineHeight: f(18),
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.RetailerPrimary,
    paddingVertical: h(18),
    borderRadius: mw(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: h(70),
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueText: {
    color: '#FFF',
    fontSize: f(16),
    fontWeight: '600',
  },
  continueIcon: {
    marginLeft: w(8),
  },
});
