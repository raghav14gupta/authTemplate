import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { w, h, f } from '../../../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import CaraousalAdvertismentComponent from './component/CaraousalAdvertisment';
import NotificationModal from './component/NotificationModal';
import { setOpenModalOnLaunch } from '../../../store/notificationSlice';

// 👉 QUICK ACTIONS (label UI ke liye, key logic ke liye)
const QUICK_ACTIONS = [
  {
    id: '1',
    key: 'my_farm',
    label: 'My Farm',
    image: require('../../../assets/images/MyFarm.png'),
  },
  {
    id: '2',
    key: 'my_crop',
    label: 'My Crop',
    image: require('../../../assets/images/MyCrop.png'),
  },
  {
    id: '3',
    key: 'crop_doctor',
    label: 'Crop Doctor',
    image: require('../../../assets/images/cropDoctor.png'),
  },
  {
    id: '4',
    key: 'inquiry',
    label: 'Inquiry',
    image: require('../../../assets/images/inquiry.png'),
  },
  {
    id: '5',
    key: 'my_orders',
    label: 'My Orders',
    image: require('../../../assets/images/inquiry.png'),
  },
];

// 👉 Navigation mapping (same logic but centralized)
//jo screen banai h add kro yaha to navigate krne ke liye
const NAVIGATION_MAP = {
  my_farm: 'MyFarms',
  my_crop: 'MyCrops',
  crop_doctor: 'CropDoctor',
  inquiry: 'Inquiry', // apna screen name dalna
  my_orders: 'MyOrders',
};

const FarmerHomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const debugLog = (...args) => {
    if (__DEV__) {
      console.log('[FarmerHome]', ...args);
    }
  };

  // Notification state Redux se fetch karke laye (Count & AutoOpen Flag)
  const { unreadCount, openModalOnLaunch } = useSelector(
    state => state.notification,
  );

  // Modal ko manually visible or hide karne ke iye
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  // Magic Hook 🧙‍♂️: Jab bhi background/killed se notice tap ho k launch ho,
  // Ye auto trigger kar dega UI ko bina kisi alag screen load karwaye
  useEffect(() => {
    if (openModalOnLaunch) {
      setNotifModalVisible(true);
      // Ekbaar use karke false karna zaruri hai
      dispatch(setOpenModalOnLaunch(false));
    }
  }, [openModalOnLaunch, dispatch]);

  // 👉 reusable navigation handler  jo item me key hogi yaha jaaegi us base pe navigation hoga
  const handleNavigation = key => {
    debugLog('quick action tapped', { key });
    const screen = NAVIGATION_MAP[key];
    debugLog('resolved screen mapping', { key, screen });

    if (!screen) {
      console.warn('No screen mapped for:', key);
      return;
    }

    try {
      debugLog('navigating to screen', { screen });
      navigation.navigate(screen);
    } catch (error) {
      console.error('[FarmerHome] navigation failed:', error);
    }
  };

  const renderAction = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => handleNavigation(item.key)}
        activeOpacity={0.7}
      >
        {/* 👉 Icon */}
        <View style={styles.iconContainer}>
          <Image source={item.image} style={styles.icon} />
        </View>

        {/* 👉 Label */}
        <Text style={styles.label} numberOfLines={2}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F9F7' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Hello Farmer 👋</Text>
            <Text style={styles.headerSub}>Welcome back</Text>
          </View>

          {/* 🔔 Notification Bell jispe Red Badge & On Click listener lagna tha */}
          <TouchableOpacity
            style={styles.bellWrapper}
            onPress={() => setNotifModalVisible(true)}
            activeOpacity={0.7}
          >
            <Icon name="notifications-outline" size={f(22)} color="#fff" />

            {/* Unread badge agar 0 se zyada ho tabhi dikhana hai */}
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* caraousalad banner */}
        <View>
          <CaraousalAdvertismentComponent />
        </View>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <FlatList
          data={QUICK_ACTIONS}
          keyExtractor={item => item.id}
          renderItem={renderAction}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.flatListContentContainer}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* 👉 Humare Notification Full Screen Modal render yahan hoga */}
      <NotificationModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
      />
    </SafeAreaView>
  );
};
export default FarmerHomeScreen;

// CSS UI Code unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F7',
  },
  header: {
    backgroundColor: '#3A9D4F',
    padding: w(20),
    paddingBottom: h(28),
    borderBottomLeftRadius: w(24),
    borderBottomRightRadius: w(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: f(20),
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: f(13),
    color: '#E0F2E9',
    marginTop: h(4),
  },
  bellWrapper: {
    width: w(40),
    height: w(40),
    borderRadius: w(20),
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 👉 Naya Badge styling notification bell ke top right me red ping circle
  badge: {
    position: 'absolute',
    top: -h(2),
    right: -w(2),
    minWidth: w(18),
    height: w(18),
    borderRadius: w(9),
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: w(4),
    borderWidth: w(1.5),
    borderColor: '#3A9D4F',
  },
  badgeText: {
    fontSize: f(9),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: f(16),
    fontWeight: '600',
    marginHorizontal: w(16),
    marginTop: h(20),
    marginBottom: h(10),
  },
  actionCard: {
    width: '31%',
    padding: w(8),
    borderWidth: w(1),
    borderColor: '#E0E0E0',
    borderRadius: w(12),
    backgroundColor: '#FFFFFF',
    marginBottom: h(20),
  },
  actionIcon: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#264d29',
    borderRadius: w(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: h(8),
  },
  actionImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  actionText: {
    fontSize: f(13),
    fontWeight: '500',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: h(4),
  },
  flatListContentContainer: {
    paddingHorizontal: w(16),
    paddingBottom: h(20),
  },
  columnWrapper: {
    gap: w(12),
  },
});
