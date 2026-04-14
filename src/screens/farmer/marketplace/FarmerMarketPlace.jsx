import React, { useState } from 'react';
import {StyleSheet, FlatList, View } from 'react-native';
import MarketPlaceHeader from './components/MarketPlaceHeader';
import MarketPlaceSearchBar from './components/MarketPlaceSearchBar';
import CategoryList from './components/CategoryList';
import ProductCard from './components/ProductCard';
import { SafeAreaView } from 'react-native-safe-area-context';
const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=150&auto=format&fit=crop' },
  { id: 'c2', name: 'Grains', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop' },
  { id: 'c3', name: 'Herbs', imageUrl: 'https://images.unsplash.com/photo-1615486171448-4afbf36e84d4?q=80&w=150&auto=format&fit=crop' },
   { id: 'c4', name: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=150&auto=format&fit=crop' },
  { id: 'c5', name: 'Grains', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop' },
  { id: 'c6', name: 'Herbs', imageUrl: 'https://images.unsplash.com/photo-1615486171448-4afbf36e84d4?q=80&w=150&auto=format&fit=crop' },
];

const MOCK_PRODUCTS = [
  { id: 'p1', title: 'Berries', shopName: 'XYZ Shop name', price: 800, imageUrl: 'https://images.unsplash.com/photo-1596541603957-e1ee4f14e41d?q=80&w=300&auto=format&fit=crop' },
  { id: 'p2', title: 'Tulsi', shopName: 'XYZ Shop name', price: 100, imageUrl: 'https://images.unsplash.com/photo-1662544256228-406cb87b1c1e?q=80&w=300&auto=format&fit=crop' },
  { id: 'p3', title: 'Wheat', shopName: 'XYZ Shop name', price: 200, imageUrl: 'https://images.unsplash.com/photo-1574323347407-347bb8dc7988?q=80&w=300&auto=format&fit=crop' },
  { id: 'p4', title: 'Apples', shopName: 'XYZ Shop name', price: 500, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6caa6?q=80&w=300&auto=format&fit=crop' },
  { id: 'p5', title: 'Berries', shopName: 'XYZ Shop name', price: 800, imageUrl: 'https://images.unsplash.com/photo-1596541603957-e1ee4f14e41d?q=80&w=300&auto=format&fit=crop' },
  { id: 'p6', title: 'Tulsi', shopName: 'XYZ Shop name', price: 100, imageUrl: 'https://images.unsplash.com/photo-1662544256228-406cb87b1c1e?q=80&w=300&auto=format&fit=crop' },
  { id: 'p7', title: 'Wheat', shopName: 'XYZ Shop name', price: 200, imageUrl: 'https://images.unsplash.com/photo-1574323347407-347bb8dc7988?q=80&w=300&auto=format&fit=crop' },
  { id: 'p8', title: 'Apples', shopName: 'XYZ Shop name', price: 500, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6caa6?q=80&w=300&auto=format&fit=crop' },
];

const FarmerMarketPlace = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('c1');
    const [favorites, setFavorites] = useState({});

// Dummy handler for cart press
const handleCartPress = () => {
    console.log('Cart pressed!');
};

const handleFavoritePress = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
};

const handleProductPress = (id) => {
    console.log('Navigate to product detail:', id);
};

	return (
		<SafeAreaView
			style={styles.container}
		>
            <FlatList
                data={MOCK_PRODUCTS}
                keyExtractor={item => String(item?.id ?? Math.random())}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View>
                        <MarketPlaceHeader onCartPress={handleCartPress} />
                        <MarketPlaceSearchBar 
                            value={searchQuery} 
                            onChangeText={setSearchQuery} 
                        />
                        <CategoryList 
                            categories={MOCK_CATEGORIES} 
                            selectedId={selectedCategoryId} 
                            onSelect={setSelectedCategoryId} 
                        />
                    </View>
                }
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <ProductCard
                            id={item.id}
                            title={item.title}
                            shopName={item.shopName}
                            price={item.price}
                            imageUrl={item.imageUrl}
                            isFavorite={!!favorites[item.id]}
                            onFavoritePress={handleFavoritePress}
                            onPress={handleProductPress}
                        />
                    </View>
                )}
            />
		</SafeAreaView>
	);
};

export default FarmerMarketPlace;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9', // Light background behind cards
    },
    listContent: {
        paddingBottom: 24, // Bottom padding for scrolling comfort
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    cardWrapper: {
        width: '48%', // Flexible column width
    }
});
