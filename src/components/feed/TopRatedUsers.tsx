import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useColorScheme,
  RefreshControl,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { getTopRatedUsers, User } from '@/services/user';
import { router } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { loadImageAsBase64 } from '@/utils/mediaHelper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

interface UserWithPhoto extends User {
  photoBase64?: string | null;
}

export default function TopRatedUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithPhoto[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadTopUsers();
  }, []);

  const loadTopUsers = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento dos top usuários...');
      
      const topUsers = await getTopRatedUsers();
      console.log('Top usuários recebidos:', topUsers.map(user => ({
        id: user.id,
        name: user.name,
        rating: {
          total: user.rating?.total,
          count: user.rating?.count
        }
      })));
      
      const usersWithPhotos: UserWithPhoto[] = await Promise.all(
        topUsers.map(async (user): Promise<UserWithPhoto> => {
          let photoBase64 = null;
          if (user.photoURL) {
            try {
              photoBase64 = await loadImageAsBase64(user.photoURL);
              console.log(`Foto carregada para usuário ${user.name}`);
            } catch (error) {
              console.error(`Erro ao carregar foto do usuário ${user.name}:`, error);
            }
          }
          return {
            ...user,
            photoBase64
          };
        })
      );
      
      console.log(`Total de usuários carregados com fotos: ${usersWithPhotos.length}`);
      setUsers(usersWithPhotos);
    } catch (error) {
      console.error('Erro ao carregar top usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopUsers();
    setRefreshing(false);
  };

  const navigateToProfile = (userId: string) => {
    router.push({
      pathname: "/user/[id]",
      params: { id: userId }
    });
  };

  const renderStars = (total: number) => {
    const stars = [];
    const maxStars = 50; // Considerando que cada pessoa pode dar até 10 estrelas
    const normalizedTotal = Math.min(total, maxStars); // Limita a 50 estrelas no total
    const fullStars = Math.floor(normalizedTotal / 10);
    const hasPartialStar = (normalizedTotal % 10) >= 5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FontAwesome 
            key={i} 
            name="star" 
            size={12} 
            color={Colors.light.secondary} 
            style={styles.star}
          />
        );
      } else if (i === fullStars && hasPartialStar) {
        stars.push(
          <FontAwesome 
            key={i} 
            name="star-half-o" 
            size={12} 
            color={Colors.light.secondary} 
            style={styles.star}
          />
        );
      } else {
        stars.push(
          <FontAwesome 
            key={i} 
            name="star-o" 
            size={12} 
            color={Colors.light.secondary} 
            style={styles.star}
          />
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[isDark ? 'dark' : 'light'].primary} />
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="trophy" size={24} color={Colors.light.secondary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Top 10 Mais Bem Avaliados</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={50} color={Colors.light.secondary} />
          <Text style={styles.emptyText}>
            Ainda não há usuários avaliados.{'\n'}
            Seja o primeiro a avaliar alguém!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={24} color={Colors.light.secondary} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Top 10 Mais Bem Avaliados</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors[isDark ? 'dark' : 'light'].primary}
          />
        }
      >
        {users.map((user, index) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => navigateToProfile(user.id)}
          >
            <View style={styles.imageContainer}>
              <Image
                source={user.photoBase64 ? 
                  { uri: user.photoBase64 } : 
                  { uri: 'https://via.placeholder.com/100' }
                }
                style={styles.userPhoto}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                style={styles.gradient}
              >
                <View style={styles.userInfo}>
                  <View style={styles.nameAgeContainer}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.name || 'Usuário'}
                    </Text>
                    {user.age && (
                      <Text style={styles.userAge}>, {user.age}</Text>
                    )}
                  </View>

                  {user.location?.city && (
                    <Text style={styles.location}>
                      {user.location.city}, {user.location.state}
                    </Text>
                  )}

                  <View style={styles.ratingContainer}>
                    <FontAwesome 
                      name="star" 
                      size={16} 
                      color={Colors.light.secondary}
                      style={styles.ratingIcon}
                    />
                    <Text style={styles.ratingText}>
                      {user.rating.total}
                    </Text>
                    <Text style={styles.ratingCount}>
                      estrelas
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.secondary,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingRight: 30,
  },
  userCard: {
    width: width * 0.6,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  imageContainer: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  userPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    padding: 15,
  },
  userInfo: {
    backgroundColor: 'transparent',
  },
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  userName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userAge: {
    color: '#FFF',
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  location: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  ratingIcon: {
    marginRight: 4,
    opacity: 0.8,
  },
  ratingText: {
    color: '#DAA520',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    margin: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
  star: {
    marginHorizontal: 2,
  },
}); 