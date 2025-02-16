import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Image,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { searchUsers, User } from '@/services/user';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setError(null);
    
    if (query.length < 3) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchUsers(query);
      setUsers(results);
    } catch (error: any) {
      console.error('Erro na busca:', error);
      setError('Não foi possível realizar a busca. Por favor, tente novamente.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToProfile = (userId: string) => {
    if (userId) {
      router.push({
        pathname: "/user/[id]",
        params: { id: userId }
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color={Colors[isDark ? 'dark' : 'light'].text} 
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            { 
              color: Colors[isDark ? 'dark' : 'light'].text,
              backgroundColor: isDark ? '#333' : '#f5f5f5'
            }
          ]}
          placeholder="Buscar usuários..."
          placeholderTextColor={isDark ? '#999' : '#666'}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#dc3545' }]}>
            {error}
          </Text>
        </View>
      ) : loading ? (
        <ActivityIndicator style={styles.loading} color={Colors[isDark ? 'dark' : 'light'].primary} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.userItem,
                { borderBottomColor: isDark ? '#333' : '#eee' }
              ]}
              onPress={() => navigateToProfile(item.id)}
            >
              <Image
                source={{ uri: item.photoURL || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                {item.bio && (
                  <Text style={styles.userBio} numberOfLines={1}>
                    {item.bio}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            searchQuery.length > 0 && !loading && !error ? (
              <Text style={styles.emptyText}>
                Nenhum usuário encontrado
              </Text>
            ) : null
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  loading: {
    marginTop: 20,
  },
  userItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 