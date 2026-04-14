import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { w, h, f } from '../../../../utils/responsive';
import { fetchBroadcasts } from '../../../../store/notificationSlice';

// Helper: timestamp ko "m ago", "h ago" mein badalne ke liye.
// Backend se sentAt ya createdAt aata hai jo ek ISO date string hoti hai.
// Jaise: "2024-04-12T10:30:00.000Z"
// timeAgo() ko milliseconds chahiye isliye pehle Date object banate hain.
const timeAgo = isoDateString => {
  // ISO string ko number (milliseconds) mein convert karo
  const timestamp = new Date(isoDateString).getTime();

  // Agar date invalid ho toh "Just now" dikha do
  if (isNaN(timestamp)) return 'Just now';

  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

// ─────────────────────────────────────────────
//  Empty State Component (Fallback UI jab no notification ho)
// ─────────────────────────────────────────────
const EmptyState = () => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={emptyStyles.container}>
      {/* Target UI ke according Green Circular illustration */}
      <Animated.View
        style={[
          emptyStyles.illustrationCircle,
          { transform: [{ scale: scaleAnim }] },
        ]}>
        {/* Inner card icon layout */}
        <View style={emptyStyles.cardIcon}>
          <View style={emptyStyles.cardLine} />
          <View style={[emptyStyles.cardLine, { width: w(40) }]} />
        </View>

        {/* Chhota green badge icon icon list me */}
        <View style={emptyStyles.badgeCircle}>
          <Icon name="notifications-off-outline" size={f(18)} color="#fff" />
        </View>
      </Animated.View>

      {/* Main Title Fallback */}
      <Animated.Text style={[emptyStyles.title, { opacity: fadeAnim }]}>
        No Notification Available{'\n'}At This Time
      </Animated.Text>

      {/* Description below title */}
      <Animated.Text style={[emptyStyles.description, { opacity: fadeAnim }]}>
        We strive to keep you informed, and when there are updates or important
        messages for you, we'll make sure to notify you promptly. Thank you for
        using our app, and stay tuned for future notifications!
      </Animated.Text>
    </View>
  );
};

// Notification Card Component
// Backend broadcast ka ek item render karta hai.
//
// Broadcast object mein ye fields hoti hain:
//   item._id       — unique ID (backend MongoDB ID)
//   item.title     — notification ka heading
//   item.body      — notification ka detail text (ho bhi sakta hai, na bhi)
//   item.message   — kuch backends body ki jagah message field use karte hain
//   item.sentAt    — kab bheja gaya (ISO string)
//   item.createdAt — fallback agar sentAt na ho
const NotificationCard = ({ item, index }) => {
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Broadcast ka body text safely nikalo
  // Kuch backends "body" use karte hain, kuch "message" — dono check karo
  const bodyText = item.body || item.message || null;

  // Kab bheja gaya — sentAt prefer karo, nahi toh createdAt use karo
  const sentTime = item.sentAt || item.createdAt || null;

  return (
    <Animated.View
      style={[
        cardStyles.card,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}>
      {/* Icon badge */}
      <View style={cardStyles.iconBadge}>
        <Icon name="megaphone-outline" size={f(18)} color="#fff" />
      </View>

      {/* Title aur body */}
      <View style={cardStyles.content}>
        <Text style={cardStyles.cardTitle} numberOfLines={2}>
          {item.title || 'Notification'}
        </Text>

        {bodyText ? (
          <Text style={cardStyles.cardBody} numberOfLines={3}>
            {bodyText}
          </Text>
        ) : null}

        {/* Timestamp — sentAt ya createdAt se calculate karo */}
        {sentTime ? (
          <Text style={cardStyles.time}>{timeAgo(sentTime)}</Text>
        ) : null}
      </View>
    </Animated.View>
  );
};

// Main Modal Component
const NotificationModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();

  // Redux se broadcasts ki list aur states lo
  const broadcasts = useSelector(state => state.notification.broadcasts);
  const broadcastsLoading = useSelector(state => state.notification.broadcastsLoading);
  const broadcastsError = useSelector(state => state.notification.broadcastsError);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (visible) {
      // Modal khula — page 1 se fresh broadcasts fetch karo
      dispatch(fetchBroadcasts({ page: 1 }));
    }
  }, [visible, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Pull-to-refresh pe hamesha page 1 se fresh data laao
    await dispatch(fetchBroadcasts({ page: 1 })).unwrap().catch(() => {});
    setRefreshing(false);
  }, [dispatch]);

  const renderNotification = ({ item, index }) => (
    <NotificationCard item={item} index={index} />
  );

  // Backend broadcasts mein _id hoti hai, local notifications mein id
  const keyExtractor = item => item._id || item.id || String(Math.random());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

        {/* Modal Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-back" size={f(24)} color="#1A1A1A" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Notifications</Text>

          <View style={styles.headerRight} />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Error state — API fail ho gayi toh message dikho */}
        {broadcastsError && !broadcastsLoading ? (
          <View style={styles.errorContainer}>
            <Icon name="cloud-offline-outline" size={f(22)} color="#999" />
            <Text style={styles.errorText}>{broadcastsError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => dispatch(fetchBroadcasts({ page: 1 }))}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : broadcasts.length === 0 && !broadcastsLoading ? (
          // Empty state — koi broadcast nahi
          <EmptyState />
        ) : (
          // Broadcasts ki list
          <FlatList
            data={broadcasts}
            keyExtractor={keyExtractor}
            renderItem={renderNotification}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || broadcastsLoading}
                onRefresh={onRefresh}
                colors={['#2E7D32']}
                tintColor="#2E7D32"
              />
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default NotificationModal;

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(16),
    paddingVertical: h(14),
  },
  backButton: {
    width: w(36),
    height: w(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: f(20),
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: w(8),
  },
  headerRight: {
    width: w(36),
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  listContent: {
    paddingHorizontal: w(16),
    paddingTop: h(12),
    paddingBottom: h(30),
  },

  // Error state — jab API fail ho jaye
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: w(32),
    gap: h(12),
  },
  errorText: {
    fontSize: f(14),
    color: '#999999',
    textAlign: 'center',
    lineHeight: f(20),
  },
  retryButton: {
    paddingHorizontal: w(24),
    paddingVertical: h(10),
    backgroundColor: '#2E7D32',
    borderRadius: w(8),
    marginTop: h(4),
  },
  retryText: {
    fontSize: f(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Empty state styles
const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: w(32),
    marginTop: -h(40),
  },
  illustrationCircle: {
    width: w(160),
    height: w(160),
    borderRadius: w(80),
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: h(32),
    // Outer ring effect
    borderWidth: w(6),
    borderColor: '#E8F5E9',
    elevation: 8,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  cardIcon: {
    width: w(70),
    height: w(55),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: w(8),
    justifyContent: 'center',
    alignItems: 'center',
    padding: w(10),
    gap: h(6),
  },
  cardLine: {
    width: w(50),
    height: h(6),
    backgroundColor: '#E0E0E0',
    borderRadius: w(3),
  },
  badgeCircle: {
    position: 'absolute',
    bottom: w(18),
    right: w(30),
    width: w(38),
    height: w(38),
    borderRadius: w(19),
    backgroundColor: '#43A047',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: w(3),
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: f(22),
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: f(30),
    marginBottom: h(16),
  },
  description: {
    fontSize: f(13),
    color: '#888888',
    textAlign: 'center',
    lineHeight: f(20),
    paddingHorizontal: w(8),
  },
});

// Notification card styles
const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: h(16),
    paddingHorizontal: w(14),
    marginBottom: h(10),
    borderRadius: w(14),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // Subtle shadow
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  unreadCard: {
    backgroundColor: '#FAFFFE',
    borderColor: '#E0F2E9',
  },
  iconBadge: {
    width: w(44),
    height: w(44),
    borderRadius: w(22),
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: w(14),
  },
  content: {
    flex: 1,
  },
  cardTitle: {
    fontSize: f(14),
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: f(20),
  },
  cardBody: {
    fontSize: f(12),
    color: '#666666',
    lineHeight: f(18),
    marginTop: h(2),
  },
  time: {
    fontSize: f(11),
    color: '#AAAAAA',
    marginTop: h(4),
  },
  unreadDot: {
    width: w(8),
    height: w(8),
    borderRadius: w(4),
    backgroundColor: '#2E7D32',
    marginLeft: w(8),
  },
});