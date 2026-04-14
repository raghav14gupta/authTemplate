import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { w, h, f, mw } from '../../../../utils/responsive';

/**
 * @typedef {Object} MarketPlaceHeaderProps
 * @property {() => void} onCartPress - Cart icon click handler
 */

/**
 * @param {MarketPlaceHeaderProps} props
 */
const MarketPlaceHeader = ({ onCartPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        Marketplace
      </Text>
      
      <Pressable
        style={({ pressed }) => [
          styles.cartButton,
          { opacity: pressed ? 0.7 : 1 }
        ]}
        onPress={onCartPress}
        accessibilityRole="button"
        accessibilityLabel="View Cart"
      >
        <Icon name="shopping-cart" size={mw(24)} color="#fff" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: w(16),
    marginTop: h(24),
    marginBottom: h(16),
  },
  title: {
    fontSize: f(28),
    fontWeight: '700',
    color: '#333',
    flex: 1, // To ensure text doesn't push cart icon out if scaling is weird
  },
  cartButton: {
    width: mw(44),
    height: mw(44),
    borderRadius: mw(12),
    backgroundColor: '#2b5228', // Primary green as per figma estimate
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default MarketPlaceHeader;
