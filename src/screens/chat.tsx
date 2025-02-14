import { StyleSheet, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  
  // Dados mockados para exemplo
  const chats = [
    { id: '1', name: 'João Silva', lastMessage: 'Olá, tudo bem?' },
    { id: '2', name: 'Maria Santos', lastMessage: 'Como vai?' },
    { id: '3', name: 'Pedro Costa', lastMessage: 'Vamos marcar algo?' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={({ item }) => (
          <View style={[styles.chatItem, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.message}>{item.lastMessage}</Text>
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
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 