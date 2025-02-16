import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  View as RNView,
  Image,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { User, getUserProfile } from '@/services/user';
import { useLocalSearchParams } from 'expo-router';
import { loadImageAsBase64 } from '@/utils/mediaHelper';
import RatingStars from '@/components/profile/RatingStars';

export default function UserProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const loadImage = useCallback(async (photoURL: string | null | undefined) => {
    if (!photoURL) return;

    try {
      setImageError(false);
      const base64 = await loadImageAsBase64(photoURL);
      
      if (base64) {
        console.log('Imagem do perfil carregada com sucesso');
        setBase64Image(base64);
      } else {
        console.error('Não foi possível carregar a imagem do perfil');
        setImageError(true);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem do perfil:', error);
      setImageError(true);
    } finally {
      setImageLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setLoading(true);
      const profile = await getUserProfile(id);
      setUser(profile);
      if (profile?.photoURL) {
        await loadImage(profile.photoURL);
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[isDark ? 'dark' : 'light'].primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Usuário não encontrado</Text>
      </View>
    );
  }

  const imageSource = base64Image ? 
    { uri: base64Image } : 
    { uri: 'https://via.placeholder.com/120' };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <RNView style={styles.avatarContainer}>
            <Image
              source={imageSource}
              style={styles.avatar}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                console.error('Erro ao carregar imagem do perfil');
                setImageError(true);
                setImageLoading(false);
              }}
            />
            {imageLoading && !imageError && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator 
                  size="large" 
                  color={Colors[isDark ? 'dark' : 'light'].primary} 
                />
              </View>
            )}
          </RNView>
          <Text style={[
            styles.name,
            { color: Colors[isDark ? 'dark' : 'light'].text }
          ]}>{user.name}</Text>
          {user.bio && (
            <Text style={[
              styles.bio,
              { color: isDark ? '#999' : '#666' }
            ]}>{user.bio}</Text>
          )}

          <RatingStars 
            userId={user.id}
            currentRating={{
              average: user.rating?.average || 0,
              count: user.rating?.count || 0
            }}
            onRatingUpdated={(newAverage) => {
              if (user) {
                setUser({
                  ...user,
                  rating: {
                    ...user.rating,
                    average: newAverage
                  }
                });
              }
            }}
          />
        </View>

        <View style={[styles.infoSection, { borderTopColor: isDark ? '#333' : '#eee', borderTopWidth: 1 }]}>
          {user.rating && (
            <View style={styles.ratingContainer}>
              <Text style={[
                styles.label,
                { color: isDark ? '#999' : '#666' }
              ]}>Avaliação</Text>
              <Text style={[
                styles.value,
                { color: Colors[isDark ? 'dark' : 'light'].text }
              ]}>
                {user.rating.average.toFixed(1)} ({user.rating.count} avaliações)
              </Text>
            </View>
          )}

          {user.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              <Text style={[
                styles.label,
                { color: isDark ? '#999' : '#666' }
              ]}>Interesses</Text>
              <View style={styles.interestsList}>
                {user.interests.map((interest, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.interestTag,
                      { backgroundColor: Colors[isDark ? 'dark' : 'light'].primary }
                    ]}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoSection: {
    padding: 20,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
  },
  interestsContainer: {
    marginTop: 20,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  interestText: {
    color: '#FFF',
    fontSize: 14,
  },
  imageLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
}); 