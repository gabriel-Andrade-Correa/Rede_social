import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Dimensions,
  View as RNView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/services/auth';
import { User, getUserProfile, rateUser } from '@/services/user';
import ProfileForm from '@/components/profile/ProfileForm';
import PhotoUpload from '@/components/profile/PhotoUpload';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const PROFILE_IMAGE_SIZE = width * 0.4;

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const currentUser = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!currentUser) {
      router.replace('/');
      return;
    }

    try {
      setLoading(true);
      const profile = await getUserProfile(currentUser.uid);
      setUser(profile);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao carregar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!user) return;

    try {
      await rateUser(user.id, rating);
      loadUserProfile();
      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const renderRatingStars = () => {
    const rating = user?.rating?.average || 0;
    return (
      <RNView style={styles.starsRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRate(star)}
            style={styles.starButton}>
            <Ionicons
              name={star <= Math.round(rating) ? 'star' : 'star-outline'}
              size={28}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </RNView>
    );
  };

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
        <Text style={styles.errorText}>Erro ao carregar perfil</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[isDark ? 'dark' : 'light'].background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.photoContainer}>
          <PhotoUpload
            userId={user.id}
            currentPhotoURL={user.photoURL}
            onPhotoUpdated={(url) => {
              setUser({ ...user, photoURL: url });
            }}
            size={PROFILE_IMAGE_SIZE}
            isDark={isDark}
          />
        </View>

        <View style={[styles.nameContainer, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.name, { color: Colors[isDark ? 'dark' : 'light'].text }]}>
            {user.name || 'Sem nome'}
          </Text>
          <View style={[styles.ratingContainer, { backgroundColor: 'transparent' }]}>
            {renderRatingStars()}
            {user.rating && (
              <Text style={[styles.ratingText, { color: isDark ? '#999' : '#666' }]}>
                {user.rating.average.toFixed(1)} ({user.rating.count} avaliações)
              </Text>
            )}
          </View>
        </View>

        {!isEditing ? (
          <>
            <View style={[styles.section, { borderBottomColor: isDark ? '#333' : '#EEE' }]}>
              <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>Email</Text>
              <Text style={[styles.value, { color: Colors[isDark ? 'dark' : 'light'].text }]}>
                {user.email}
              </Text>
            </View>

            {user.age && (
              <View style={[styles.section, { borderBottomColor: isDark ? '#333' : '#EEE' }]}>
                <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>Idade</Text>
                <Text style={[styles.value, { color: Colors[isDark ? 'dark' : 'light'].text }]}>
                  {user.age} anos
                </Text>
              </View>
            )}

            {user.gender && (
              <View style={[styles.section, { borderBottomColor: isDark ? '#333' : '#EEE' }]}>
                <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>Gênero</Text>
                <Text style={[styles.value, { color: Colors[isDark ? 'dark' : 'light'].text }]}>
                  {user.gender}
                </Text>
              </View>
            )}

            {user.bio && (
              <View style={[styles.section, { borderBottomColor: isDark ? '#333' : '#EEE' }]}>
                <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>Biografia</Text>
                <Text style={[styles.value, { color: Colors[isDark ? 'dark' : 'light'].text }]}>
                  {user.bio}
                </Text>
              </View>
            )}

            {user.interests.length > 0 && (
              <View style={[styles.section, { borderBottomColor: isDark ? '#333' : '#EEE' }]}>
                <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>Interesses</Text>
                <View style={styles.interestsContainer}>
                  {user.interests.map((interest, index) => (
                    <View key={index} style={[styles.interestTag, { backgroundColor: Colors[isDark ? 'dark' : 'light'].primary }]}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.editProfileButton, { backgroundColor: Colors[isDark ? 'dark' : 'light'].primary }]}
              onPress={() => setIsEditing(true)}>
              <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          </>
        ) : (
          <ProfileForm
            user={user}
            onUpdate={() => {
              loadUserProfile();
              setIsEditing(false);
            }}
          />
        )}
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  nameContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starButton: {
    padding: 3,
  },
  ratingText: {
    fontSize: 16,
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  interestTag: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  interestText: {
    color: '#FFF',
    fontSize: 14,
  },
  editProfileButton: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 