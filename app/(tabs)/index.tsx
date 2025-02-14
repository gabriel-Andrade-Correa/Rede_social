import { StyleSheet, FlatList, View, Image, Dimensions } from 'react-native';
import { Text } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FeedScreen } from '@/screens/FeedScreen';

export default FeedScreen;

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
