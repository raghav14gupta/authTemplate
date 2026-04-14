import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FarmerMarketPlace from '../../../screens/farmer/marketplace/FarmerMarketPlace';
import FarmerHomeStack from './FarmerHomeStack';
import FarmerCommunity from '../../../screens/farmer/community/FarmerCommunity';
import FarmerProfile from '../../../screens/farmer/profile/FarmerProfile';
import { h, f } from '../../../utils/responsive';

const Tab = createBottomTabNavigator();
const ACTIVE_COLOR = '#2E7D32';
const INACTIVE_COLOR = '#9E9E9E';

const TABS = [
  { name: 'FarmerHomeTab', label: 'Home', icon: 'home' },
  { name: 'FarmerMarketTab', label: 'Marketplace', icon: 'storefront' },
  { name: 'Community', label: 'Community', icon: 'list' },
  { name: 'Profile', label: 'Profile', icon: 'person' },
];

// Single animated tab item
const TabItem = ({ tab, isFocused, onPress }) => {
  const anim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 60,
    }).start();
  }, [isFocused]);

  const indicatorWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%'],
  });

  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [INACTIVE_COLOR, ACTIVE_COLOR],
  });

  const iconScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.tabItem}
    >
      {/* GREEN TOP INDICATOR — rendered as normal flow, guaranteed visible */}
      <View style={styles.indicatorTrack}>
        <Animated.View style={[styles.indicator, { width: indicatorWidth }]} />
      </View>

      <Animated.View
        style={{ transform: [{ scale: iconScale }], marginTop: h(6) }}
      >
        <Icon
          name={isFocused ? tab.icon : `${tab.icon}-outline`}
          size={24}
          color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
      </Animated.View>

      <Animated.Text style={[styles.tabLabel, { color: labelColor }]}>
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

// Fully custom tab bar — full control over rendering
const CustomTabBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        { height: h(65) + insets.bottom, paddingBottom: insets.bottom },
      ]}
    >
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <TabItem
            key={tab.name}
            tab={tab}
            isFocused={isFocused}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(tab.name);
              }
            }}
          />
        );
      })}
    </View>
  );
};

export default function FarmerTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="FarmerHomeTab" component={FarmerHomeStack} />
      <Tab.Screen name="FarmerMarketTab" component={FarmerMarketPlace} />
      <Tab.Screen name="Community" component={FarmerCommunity} />
      <Tab.Screen name="Profile" component={FarmerProfile} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  indicatorTrack: {
    width: '100%',
    height: 4,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  indicator: {
    height: 4,
    backgroundColor: ACTIVE_COLOR,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  tabLabel: {
    fontSize: f(11),
    fontWeight: '600',
    marginTop: h(3),
  },
});
