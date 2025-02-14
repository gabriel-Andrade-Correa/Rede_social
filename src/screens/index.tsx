import { StyleSheet, FlatList, View, Image, Dimensions } from 'react-native';
import { Text } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  
  const feedItems = [
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

  return (
    <View style={styles.container}>
      <FlatList
        data={feedItems}
        renderItem={({ item }) => (
          <View style={[styles.postContainer, { backgroundColor: '#000' }]}>
            <View style={styles.postHeader}>
              <Image source={{ uri: item.userImage }} style={styles.userImage} />
              <View style={[styles.userInfo, { backgroundColor: 'transparent' }]}>
                <Text style={[styles.userName, { color: '#fff' }]}>{item.userName}</Text>
                <Text style={[styles.timeAgo, { color: '#999' }]}>{item.timeAgo}</Text>
              </View>
            </View>
            <Text style={[styles.postText, { color: '#fff' }]}>{item.content}</Text>
            {item.postImage && (
              <Image 
                source={{ uri: item.postImage }} 
                style={styles.postImage}
                resizeMode="cover"
              />
            )}
            <View style={[styles.postFooter, { backgroundColor: 'transparent' }]}>
              <View style={[styles.interactionContainer, { backgroundColor: 'transparent' }]}>
                <FontAwesome name="heart" size={20} color="#ff3b30" />
                <Text style={[styles.interactionText, { color: '#999' }]}>{item.likes}</Text>
              </View>
              <View style={[styles.interactionContainer, { backgroundColor: 'transparent' }]}>
                <FontAwesome name="comment" size={20} color="#999" />
                <Text style={[styles.interactionText, { color: '#999' }]}>{item.comments}</Text>
              </View>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  postContainer: {
    padding: 15,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomWidth: 0.8,
    borderBottomColor: '#333',
    paddingBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  postText: {
    fontSize: 16,
    marginBottom: 10,
  },
  postImage: {
    width: Dimensions.get('window').width - 32,
    height: 300,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    marginTop: 10,
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  interactionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  }
});
