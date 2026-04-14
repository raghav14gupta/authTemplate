import React from 'react';
import { FlatList, View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { w, h, f, mw } from '../../../../utils/responsive';


const CategoryList = ({ categories = [], selectedId, onSelect }) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return null; // Empty state for categories
  }

  const renderItem = ({ item }) => {
    const isSelected = item.id === selectedId;
    return (
      <Pressable
        style={[styles.pillContainer, isSelected && styles.pillSelected]}
        onPress={() => onSelect?.(item.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <Image 
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
          style={styles.pillImage} 
        />
        <Text
          style={[styles.pillText, isSelected && styles.pillTextSelected]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name || 'Unknown'}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item?.id ?? 'unknown')}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: h(20),
  },
  listContent: {
    paddingHorizontal: w(16),
    gap: w(12), // Supported in newer RN, otherwise use padding on items
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: mw(24),
    paddingVertical: h(6),
    paddingHorizontal: w(6),
    paddingRight: w(16), // Extra padding on right
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2, // minor shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pillSelected: {
    backgroundColor: '#2b5228',
    borderColor: '#2b5228',
  },
  pillImage: {
    width: mw(32),
    height: mw(32),
    borderRadius: mw(16),
    marginRight: w(8),
    backgroundColor: '#eee',
  },
  pillText: {
    fontSize: f(14),
    fontWeight: '600',
    color: '#555',
  },
  pillTextSelected: {
    color: '#fff',
  },
});

export default CategoryList;
