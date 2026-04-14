import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { w, h, f, mw } from '../../../../utils/responsive';

/**
 * @typedef {Object} MarketPlaceSearchBarProps
 * @property {string} value - Current search text
 * @property {(text: string) => void} onChangeText - Handler when text changes
 */

/**
 * @param {MarketPlaceSearchBarProps} props
 */
const MarketPlaceSearchBar = ({ value = '', onChangeText }) => {
  return (
    <View style={styles.container}>
      <Icon name="search" size={mw(20)} color="#fff" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search.."
        placeholderTextColor="#ddd"
        value={value}
        onChangeText={onChangeText}
        accessibilityRole="search"
        accessibilityLabel="Search products"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b5228', // Dark green background
    borderRadius: mw(8),
    marginHorizontal: w(16),
    paddingHorizontal: w(12),
    height: mw(46), // Use minHeight/height suitable for touch targets
    marginBottom: h(20),
  },
  icon: {
    marginRight: w(8),
  },
  input: {
    flex: 1,
    fontSize: f(16),
    color: '#fff',
    paddingVertical: 0, // Fixes Android vertical padding issue inside fixed height
  },
});

export default MarketPlaceSearchBar;
