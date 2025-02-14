import { StyleSheet, FlatList, View, useColorScheme } from 'react-native';
import { Post } from '@/components/feed/Post';
import { TopUsersCarousel } from '@/components/feed/TopUsersCarousel';
import { PostType } from '@/types/feed';
import { User } from '@/types/user';
import { Colors } from '@/constants/Colors';

export function FeedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Dados mockados para exemplo do Top 10
  const topUsers: User[] = [
    {
      id: '1',
      name: 'Julia',
      age: 25,
      bio: 'Amo viajar e conhecer novos lugares!',
      mainPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330'],
      ratings: [],
      averageRating: 9.5,
      totalRatings: 128,
      location: {
        city: 'São Paulo',
        state: 'SP'
      }
    },
    {
      id: '2',
      name: 'Rafael',
      age: 28,
      bio: 'Músico e fotógrafo nas horas vagas',
      mainPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e'],
      ratings: [],
      averageRating: 9.3,
      totalRatings: 95,
      location: {
        city: 'Rio de Janeiro',
        state: 'RJ'
      }
    },
    // Adicione mais usuários aqui...
  ];

  const feedItems: PostType[] = [
    {
      id: '1',
      userName: 'Maria Silva',
      userImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      content: 'Acabei de voltar de uma viagem incrível a Paris! 🗼✈️ Que cidade maravilhosa! Alguém mais ama viajar por aí?',
      postImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop',
      likes: 234,
      comments: 45,
      timeAgo: '2h'
    },
    {
      id: '2',
      userName: 'João Santos',
      userImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      content: 'Novo projeto começando hoje! Super animado para desenvolver esse app usando React Native. Quem mais aqui é dev? 💻🚀',
      likes: 156,
      comments: 23,
      timeAgo: '4h'
    },
    {
      id: '3',
      userName: 'Ana Costa',
      userImage: 'https://randomuser.me/api/portraits/women/3.jpg',
      content: 'Meu café da manhã de hoje! ☕️ Nada melhor que começar o dia assim!',
      postImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop',
      likes: 89,
      comments: 34,
      timeAgo: '6h'
    },
    {
      id: '4',
      userName: 'Pedro Oliveira',
      userImage: 'https://randomuser.me/api/portraits/men/4.jpg',
      content: 'Finalmente terminei minha primeira maratona! 🏃‍♂️ 42km concluídos! Nunca pensei que chegaria tão longe!',
      postImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2074&auto=format&fit=crop',
      likes: 445,
      comments: 67,
      timeAgo: '8h'
    },
    {
      id: '5',
      userName: 'Carla Mendes',
      userImage: 'https://randomuser.me/api/portraits/women/5.jpg',
      content: 'Minha primeira foto com a câmera nova! O que acharam? 📸',
      postImage: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?q=80&w=2058&auto=format&fit=crop',
      likes: 178,
      comments: 29,
      timeAgo: '12h'
    }
  ];

  const handleRateUser = (userId: string, rating: number) => {
    // Aqui você implementará a lógica para salvar a avaliação
    console.log(`Usuário ${userId} recebeu nota ${rating}`);
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      <FlatList
        data={feedItems}
        renderItem={({ item }) => (
          <Post 
            post={item} 
            isDark={isDark}
          />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={() => (
          <TopUsersCarousel 
            users={topUsers} 
            onRateUser={handleRateUser}
            isDark={isDark}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
}); 