import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Platform,
  Modal,
} from 'react-native';
import { showAlert } from '../../../componentCommon/CustomAlert';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GOOGLE_MAPS_API_KEY } from '../../../config';
import { addFarm } from '../../../services/farmHome/myFarmService';
import { w, h, f, mw } from '../../../utils/responsive';

const MyFarm = ({ navigation }) => {
  // 📍 Manage map region (camera position)
  const [region, setRegion] = useState({
    latitude: 18.5204,
    longitude: 73.8567,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  // 📍 Store user's current GPS location
  const [currentLocation, setCurrentLocation] = useState(null);

  // 📍 Store all tapped coordinates (farm boundary points)
  const [markers, setMarkers] = useState([]);

  // 🔍 Search input for location
  const [searchText, setSearchText] = useState('');

  // 📦 Modal visibility for farm details
  const [showModal, setShowModal] = useState(false);

  // 🌾 Farm form states
  const [farmName, setFarmName] = useState('');
  const [farmArea, setFarmArea] = useState(0);
  const [unit, setUnit] = useState('acre');

  // ⏳ API loading state
  const [loading, setLoading] = useState(false);

  // 🗺️ Map reference for animations
  const mapRef = useRef(null);
  const debugLog = useCallback((...args) => {
    if (__DEV__) {
      console.log('[MyFarms]', ...args);
    }
  }, []);
  const handleGoBack = () => navigation.goBack();

  // 📍 Get user's current GPS location and center map
  const getCurrentLocation = useCallback(() => {
    debugLog('getCurrentLocation called');

    if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
      console.error('[MyFarms] Geolocation module is unavailable.');
      showAlert({
        type: 'error',
        title: 'Location Error',
        message: 'Geolocation service is not available on this device.',
      });
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        debugLog('location fetch success', { latitude, longitude });

        setCurrentLocation({ latitude, longitude });

        const updatedRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };

        setRegion(updatedRegion);

        if (mapRef.current?.animateToRegion) {
          mapRef.current.animateToRegion(updatedRegion, 1000);
        } else {
          debugLog('map ref is not ready for animateToRegion');
        }
      },
      error => {
        console.error('Geolocation error:', error);
        debugLog('location fetch failed', {
          code: error?.code,
          message: error?.message,
        });
        showAlert({
          type: 'error',
          title: 'Location Error',
          message: 'Unable to fetch your location. Please try again.',
        });
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }, [debugLog]);

  // 📍 Request location permission & fetch current location on mount
  useEffect(() => {
    debugLog('screen mounted');

    const initLocation = async () => {
      try {
        if (Platform.OS === 'android') {
          debugLog('requesting location permission on android');
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            debugLog('location permission denied');
            showAlert({
              type: 'error',
              title: 'Permission Denied',
              message: 'Location permission is required to use this feature.',
            });
            return;
          }

          debugLog('location permission granted');
        }

        getCurrentLocation();
      } catch (error) {
        console.error('Permission error:', error);
        debugLog('permission request failed', error?.message || error);
        showAlert({
          type: 'error',
          title: 'Error',
          message: 'Failed to request location permission.',
        });
      }
    };

    initLocation();

    return () => {
      debugLog('screen unmounted');
    };
  }, [debugLog, getCurrentLocation]);

  // 📍 Add marker when user taps on map
  const handleMapPress = e => {
    const coordinate = e.nativeEvent.coordinate;

    setMarkers(prevMarkers => {
      const nextMarkers = [...prevMarkers, coordinate];
      debugLog('marker added', {
        coordinate,
        markerCount: nextMarkers.length,
      });
      return nextMarkers;
    });
  };

  // ↩️ Remove last placed marker (undo functionality)
  const removeLastMarker = () => {
    if (markers.length > 0) {
      debugLog('removing last marker', {
        markerCountBefore: markers.length,
        markerCountAfter: markers.length - 1,
      });
      setMarkers(markers.slice(0, -1));
    }
  };

  // 📐 Calculate polygon area from coordinates (in acres)
  const calculateArea = coordinates => {
    if (coordinates.length < 3) return 0;

    const earthRadius = 6371000;
    let area = 0;

    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;

      const lat1 = (coordinates[i].latitude * Math.PI) / 180;
      const lat2 = (coordinates[j].latitude * Math.PI) / 180;
      const lng1 = (coordinates[i].longitude * Math.PI) / 180;
      const lng2 = (coordinates[j].longitude * Math.PI) / 180;

      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs((area * earthRadius * earthRadius) / 2);

    return area / 4046.86;
  };

  // ➡️ Validate markers & calculate area before opening modal
  const handleNext = () => {
    debugLog('next pressed', { markerCount: markers.length });

    if (markers.length < 3) {
      showAlert({
        type: 'warning',
        title: 'Insufficient Markers',
        message:
          'Please place at least 3 markers to define your farm boundary.',
      });
      return;
    }

    const calculatedArea = calculateArea(markers);
    debugLog('calculated farm area', { calculatedArea, unit });
    setFarmArea(calculatedArea);
    setShowModal(true);
  };

  const handleUnitChange = selectedUnit => {
    if (selectedUnit === unit) {
      debugLog('unit unchanged', { unit: selectedUnit });
      return;
    }

    debugLog('unit changed', { from: unit, to: selectedUnit });
    setUnit(selectedUnit);
  };

  // 💾 Save farm data (token handled automatically via interceptor)
  const handleSaveFarm = async () => {
    debugLog('save initiated', {
      farmNameLength: farmName.trim().length,
      markerCount: markers.length,
      unit,
    });

    if (!farmName.trim()) {
      showAlert({
        type: 'warning',
        title: 'Error',
        message: 'Please enter a farm name.',
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        farmName: farmName,
        farmArea: parseFloat(farmArea.toFixed(2)),
        unit: unit,
        geojson: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [markers.map(m => [m.longitude, m.latitude])],
          },
        },
      };

      debugLog('sending addFarm payload', {
        farmName: payload.farmName,
        farmArea: payload.farmArea,
        unit: payload.unit,
        points: markers.length,
      });

      const result = await addFarm(payload);
      debugLog('addFarm result received', result);

      if (!result?.success) {
        const backendMessage = result?.error?.backendError?.message;
        throw new Error(
          backendMessage ||
            result?.error?.message ||
            'Failed to add farm. Please try again.',
        );
      }

      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Farm added successfully!',
      });
      debugLog('farm saved successfully, navigating back');
      navigation.goBack();
    } catch (error) {
      console.error('Farm add error:', error);
      debugLog('farm save failed', error?.message || error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to add farm. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search location using Google Geocoding API
  const searchLocation = async () => {
    if (!searchText.trim()) return;

    debugLog('search started', { query: searchText });

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchText,
        )}&key=${GOOGLE_MAPS_API_KEY}`,
      );

      const data = await response.json();
      debugLog('search response received', {
        status: data?.status,
        resultsCount: data?.results?.length || 0,
      });

      if (data.results?.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        debugLog('search location found', { latitude: lat, longitude: lng });

        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };

        setRegion(newRegion);
        if (mapRef.current?.animateToRegion) {
          mapRef.current.animateToRegion(newRegion, 1000);
        } else {
          debugLog('map ref is not ready for search animate');
        }
      } else {
        debugLog('search completed with no results');
        showAlert({
          type: 'warning',
          title: 'No Results',
          message: 'No location found. Please try again.',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      debugLog('search failed', error?.message || error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to search location. Please try again.',
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔙 Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Farm</Text>
      </View>

      {/* 🔍 Search + current location controls */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for location..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={searchLocation}
        />
        <TouchableOpacity onPress={searchLocation} style={styles.searchButton}>
          <Icon name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={getCurrentLocation}
          style={styles.locationButton}
        >
          <Icon name="my-location" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 🗺️ Map with markers & polygon */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        mapType="satellite"
        showsUserLocation
        showsMyLocationButton={false}
      >
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Your Location" />
        )}

        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            pinColor={index === 0 ? 'red' : 'blue'}
          />
        ))}

        {markers.length >= 3 && (
          <Polygon
            coordinates={markers}
            strokeColor="#FF0000"
            fillColor="rgba(255,0,0,0.3)"
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* ↩️ Undo button */}
      {markers.length > 0 && (
        <TouchableOpacity onPress={removeLastMarker} style={styles.undoButton}>
          <Icon name="undo" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ➡️ Next button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* 📊 Marker count info */}
      <View style={styles.markerInfo}>
        <Text style={styles.markerInfoText}>
          Markers Placed: {markers.length}
        </Text>
      </View>

      {/* 📦 Modal for farm details */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          debugLog('modal closed from back action');
          setShowModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Enter Farm Name"
              value={farmName}
              onChangeText={setFarmName}
            />

            <TextInput
              style={styles.input}
              value={farmArea.toFixed(2)}
              keyboardType="decimal-pad"
            />

            <View style={styles.unitContainer}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  unit === 'acre' && styles.unitButtonActive,
                ]}
                onPress={() => handleUnitChange('acre')}
              >
                <Text
                  style={[
                    styles.unitText,
                    unit === 'acre' && styles.unitTextActive,
                  ]}
                >
                  Acre
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  unit === 'hectare' && styles.unitButtonActive,
                ]}
                onPress={() => handleUnitChange('hectare')}
              >
                <Text
                  style={[
                    styles.unitText,
                    unit === 'hectare' && styles.unitTextActive,
                  ]}
                >
                  Hectare
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.nextModalButton}
                onPress={handleSaveFarm}
                disabled={loading}
              >
                <Text style={styles.nextModalButtonText}>
                  {loading ? 'Saving...' : 'Next'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  debugLog('modal cancel pressed');
                  setShowModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyFarm;
``;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#3A9D4F',
//     elevation: 4,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   backButton: {
//     marginRight: 16,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     padding: 12,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//   },
//   searchInput: {
//     flex: 1,
//     height: 48,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     fontSize: 16,
//   },
//   searchButton: {
//     width: 48,
//     height: 48,
//     backgroundColor: '#3A9D4F',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   locationButton: {
//     width: 48,
//     height: 48,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   map: {
//     flex: 1,
//   },
//   undoButton: {
//     position: 'absolute',
//     right: 16,
//     top: 200,
//     width: 48,
//     height: 48,
//     backgroundColor: '#ff6b6b',
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 4,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   nextButton: {
//     flex: 1,
//     height: 56,
//     backgroundColor: '#3A9D4F',
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 16,
//   },
//   nextButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   markerInfo: {
//     position: 'absolute',
//     top: 140,
//     left: 16,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   markerInfoText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '90%',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 24,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   input: {
//     height: 56,
//     borderWidth: 2,
//     borderColor: '#6b4ce6',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     marginBottom: 16,
//   },
//   unitContainer: {
//     flexDirection: 'row',
//     marginBottom: 24,
//   },
//   unitButton: {
//     flex: 1,
//     height: 48,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 4,
//     backgroundColor: '#fff',
//   },
//   unitButtonActive: {
//     backgroundColor: '#4CAF50',
//     borderColor: '#4CAF50',
//   },
//   unitText: {
//     fontSize: 16,
//     color: '#666',
//   },
//   unitTextActive: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   modalFooter: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   nextModalButton: {
//     flex: 1,
//     height: 56,
//     backgroundColor: '#4CAF50',
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   nextModalButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   cancelButton: {
//     flex: 1,
//     height: 56,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   cancelButtonText: {
//     color: '#666',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   currentLocationMarker: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: 'rgba(66, 133, 244, 0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   currentLocationDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: '#4285F4',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
// });
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(16),
    backgroundColor: '#3A9D4F',
    elevation: 4,
    borderBottomLeftRadius: mw(24),
    borderBottomRightRadius: mw(24),
  },
  backButton: {
    marginRight: w(16),
  },
  headerTitle: {
    fontSize: f(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: w(12),
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: h(48),
    backgroundColor: '#f5f5f5',
    borderRadius: mw(8),
    paddingHorizontal: w(16),
    fontSize: f(16),
  },
  searchButton: {
    width: w(48),
    height: w(48),
    backgroundColor: '#3A9D4F',
    borderRadius: mw(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: w(8),
  },
  locationButton: {
    width: w(48),
    height: w(48),
    backgroundColor: '#fff',
    borderRadius: mw(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: w(8),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    flex: 1,
  },
  undoButton: {
    position: 'absolute',
    right: w(16),
    top: h(200),
    width: w(48),
    height: w(48),
    backgroundColor: '#ff6b6b',
    borderRadius: mw(24),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: w(16),
    backgroundColor: '#fff',
  },
  nextButton: {
    flex: 1,
    height: h(56),
    backgroundColor: '#3A9D4F',
    borderRadius: mw(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: w(16),
  },
  nextButtonText: {
    color: '#fff',
    fontSize: f(18),
    fontWeight: 'bold',
  },
  markerInfo: {
    position: 'absolute',
    top: h(140),
    left: w(16),
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: w(12),
    paddingVertical: h(8),
    borderRadius: mw(8),
  },
  markerInfoText: {
    color: '#fff',
    fontSize: f(14),
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: mw(16),
    padding: w(24),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h(24),
  },
  modalTitle: {
    fontSize: f(24),
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    height: h(56),
    borderWidth: 2,
    borderColor: '#6b4ce6',
    borderRadius: mw(8),
    paddingHorizontal: w(16),
    fontSize: f(16),
    marginBottom: h(16),
  },
  unitContainer: {
    flexDirection: 'row',
    marginBottom: h(24),
  },
  unitButton: {
    flex: 1,
    height: h(48),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: mw(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: w(4),
    backgroundColor: '#fff',
  },
  unitButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  unitText: {
    fontSize: f(16),
    color: '#666',
  },
  unitTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: w(12),
  },
  nextModalButton: {
    flex: 1,
    height: h(56),
    backgroundColor: '#4CAF50',
    borderRadius: mw(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextModalButtonText: {
    color: '#fff',
    fontSize: f(18),
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    height: h(56),
    backgroundColor: '#fff',
    borderRadius: mw(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: f(18),
    fontWeight: 'bold',
  },
  currentLocationMarker: {
    width: w(20),
    height: w(20),
    borderRadius: mw(10),
    backgroundColor: 'rgba(66, 133, 244, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationDot: {
    width: w(12),
    height: w(12),
    borderRadius: mw(6),
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
