import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { w, h, f, mw } from '../../../../utils/responsive';


const ProductCard = ({
  id,
  title = 'Unknown Product',
  shopName = 'Unknown Shop',
  price = 0,
  imageUrl,
  isFavorite = false,
  onFavoritePress,
  onPress,
}) => {
  // Safety checks
  const safeTitle = typeof title === 'string' && title.trim().length > 0 ? title : 'Unknown Product';
  const safeShopName = typeof shopName === 'string' && shopName.trim().length > 0 ? shopName : 'Unknown Shop';
  const safePrice = typeof price === 'number' && !Number.isNaN(price) ? price : 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        { opacity: pressed ? 0.95 : 1 },
      ]}
      onPress={() => onPress?.(id)}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${safeTitle}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {safeTitle}
          </Text>
          <Pressable
            hitSlop={10}
            onPress={() => onFavoritePress?.(id)}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={styles.favoriteBtn}
          >
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={mw(20)}
              color={isFavorite ? '#e74c3c' : '#555'}
            />
          </Pressable>
        </View>

        <Text style={styles.shopName} numberOfLines={1} ellipsizeMode="tail">
          From {safeShopName}
        </Text>

        <Text style={styles.price} numberOfLines={1}>
           ₹{safePrice}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: mw(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    // Using flex: 1 alone inside a grid helps it stretch, but we control width in grid instead
    minHeight: h(200),
  },
  imageContainer: {
    width: '100%',
    height: h(140),
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: w(12),
    flex: 1, 
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: h(4),
  },
  title: {
    fontSize: f(16),
    fontWeight: '700',
    color: '#333',
    flex: 1, // Ensures long text gets ellipsized instead of pushing the heart icon
    marginRight: w(8),
  },
  favoriteBtn: {
    alignSelf: 'flex-start', // Prevent heart icon from stretching vertically
  },
  shopName: {
    fontSize: f(12),
    color: '#777',
    marginBottom: h(6),
  },
  price: {
    fontSize: f(16),
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ProductCard;
