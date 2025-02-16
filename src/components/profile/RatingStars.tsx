import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { rateUser, getUserRating } from '@/services/user';
import { auth } from '@/config/firebase';

interface RatingStarsProps {
  userId: string;
  currentRating: {
    average: number;
    count: number;
  };
  onRatingUpdated?: (newAverage: number) => void;
}

export default function RatingStars({ userId, currentRating, onRatingUpdated }: RatingStarsProps) {
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const currentUser = auth.currentUser;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (currentUser) {
      loadUserRating();
    }
  }, [currentUser, userId]);

  const loadUserRating = async () => {
    if (!currentUser) return;
    try {
      const rating = await getUserRating(currentUser.uid, userId);
      setUserRating(rating);
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error);
    }
  };

  const handleRate = async (rating: number) => {
    if (!currentUser) {
      Alert.alert('Erro', 'Você precisa estar logado para avaliar');
      return;
    }

    if (currentUser.uid === userId) {
      Alert.alert('Erro', 'Você não pode avaliar seu próprio perfil');
      return;
    }

    try {
      setLoading(true);
      const result = await rateUser(userId, rating);
      setUserRating(rating);
      if (onRatingUpdated) {
        onRatingUpdated(result.newAverage);
      }
      Alert.alert('Sucesso', 'Avaliação registrada com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível registrar sua avaliação');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      const isFilled = i <= (hoveredRating || userRating || currentRating.average);
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRate(i)}
          onPressIn={() => setHoveredRating(i)}
          onPressOut={() => setHoveredRating(null)}
          disabled={loading || !!userRating}
          style={styles.starContainer}
        >
          <Ionicons
            name={isFilled ? "star" : "star-outline"}
            size={24}
            color={isFilled ? Colors.light.secondary : Colors[isDark ? 'dark' : 'light'].textDim}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {loading ? (
          <ActivityIndicator color={Colors.light.secondary} />
        ) : (
          renderStars()
        )}
      </View>
      <View style={styles.ratingInfo}>
        <Text style={[styles.averageText, { color: Colors.light.secondary }]}>
          {currentRating.average.toFixed(1)}
        </Text>
        <Text style={styles.countText}>
          ({currentRating.count} {currentRating.count === 1 ? 'avaliação' : 'avaliações'})
        </Text>
      </View>
      {userRating && (
        <Text style={styles.userRatingText}>
          Sua avaliação: {userRating} {userRating === 1 ? 'estrela' : 'estrelas'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starContainer: {
    padding: 2,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 5,
  },
  countText: {
    fontSize: 16,
    color: '#666',
  },
  userRatingText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 