import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Text,
} from 'react-native';

import { caraousalAdvertisment } from '../../../../services/farmHome/farmerHomeService';
const { width } = Dimensions.get('window');

const CaraousalAdvertismentComponent = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          const next = (prev + 1) % ads.length;
          flatListRef.current?.scrollToIndex({
            index: next,
            animated: true,
          });
          return next;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [ads]);

  const fetchAds = async () => {
    try {
      const res = await caraousalAdvertisment();

      if (res?.success && Array.isArray(res?.data)) {
        setAds(res.data);
        setCurrentIndex(0);
      } else {
        setAds([]);

        if (__DEV__) {
          console.log(
            '[ADS][UI] invalid advertisement payload:',
            res?.error || res,
          );
        }
      }
    } catch (error) {
      console.error('[ADS][UI] failed to fetch ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3A9D4F" />
      </View>
    );
  }

  if (!ads.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ads}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={({ item }) => {
          const imageUri =
            item?.imageUrl ||
            item?.image ||
            item?.url ||
            item?.posterUrl ||
            item?.posterImage;

          if (typeof imageUri !== 'string' || !imageUri.trim()) {
            return (
              <View style={[styles.image, styles.placeholderContainer]}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            );
          }

          return (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          );
        }}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          const safeIndex = Math.max(0, Math.min(index, ads.length - 1));
          setCurrentIndex(safeIndex);
        }}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        {ads.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

export default CaraousalAdvertismentComponent;

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  loadingContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width - 32,
    height: 160,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#3A9D4F',
    width: 20,
  },
});
