import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text } from '@/components/Themed';
import { User } from '@/types/user';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

interface TopUsersCarouselProps {
  users: User[];
  onRateUser: (userId: string, rating: number) => void;
  isDark?: boolean;
}

export function TopUsersCarousel({ users, onRateUser, isDark = true }: TopUsersCarouselProps) {
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      <View style={[
        styles.header,
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
      ]}>
        <Text
          style={[
            styles.title,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}
        >
          Top 10 Mais Bem Avaliados
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}
        >
          Deslize para ver mais
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      >
        {users.map((user) => (
          <View
            key={user.id}
            style={[
              styles.card,
              { backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground }
            ]}
          >
            <Image source={{ uri: user.mainPhoto }} style={styles.userPhoto} />
            <View style={[
              styles.userInfo,
              { backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground }
            ]}>
              <Text
                style={[
                  styles.userName,
                  { color: isDark ? Colors.dark.text : Colors.light.text }
                ]}
              >
                {user.name}, {user.age}
              </Text>
              <Text
                style={[
                  styles.userLocation,
                  { color: isDark ? Colors.dark.textDim : Colors.light.textDim }
                ]}
              >
                {user.location.city}, {user.location.state}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons
                  name="star"
                  size={20}
                  color={Colors.light.primary}
                />
                <Text
                  style={[
                    styles.rating,
                    { color: isDark ? Colors.dark.text : Colors.light.text }
                  ]}
                >
                  {user.averageRating.toFixed(1)}
                </Text>
                <Text
                  style={[
                    styles.totalRatings,
                    { color: isDark ? Colors.dark.textDim : Colors.light.textDim }
                  ]}
                >
                  ({user.totalRatings})
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  carouselContainer: {
    paddingHorizontal: 15,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userPhoto: {
    width: '100%',
    height: CARD_WIDTH,
    resizeMode: 'cover',
  },
  userInfo: {
    padding: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userLocation: {
    fontSize: 14,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  totalRatings: {
    fontSize: 14,
    marginLeft: 5,
  },
}); 