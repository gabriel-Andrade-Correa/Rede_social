import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text } from '@/components/Themed';
import { PostType } from '@/types/feed';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface PostProps {
  post: PostType;
  isDark?: boolean;
}

export function Post({ post, isDark = true }: PostProps) {
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      {/* Header do Post */}
      <View style={[
        styles.header,
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
      ]}>
        <Image source={{ uri: post.userImage }} style={styles.userImage} />
        <View style={[
          styles.headerInfo,
          { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
        ]}>
          <Text
            style={[
              styles.userName,
              { color: isDark ? Colors.dark.text : Colors.light.text }
            ]}
          >
            {post.userName}
          </Text>
          <Text
            style={[
              styles.timeAgo,
              { color: isDark ? Colors.dark.textDim : Colors.light.textDim }
            ]}
          >
            {post.timeAgo}
          </Text>
        </View>
      </View>

      {/* Conteúdo do Post */}
      <Text
        style={[
          styles.content,
          { color: isDark ? Colors.dark.text : Colors.light.text }
        ]}
      >
        {post.content}
      </Text>

      {/* Imagem do Post (se houver) */}
      {post.postImage && (
        <Image
          source={{ uri: post.postImage }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Footer do Post */}
      <View style={[
        styles.footer,
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
      ]}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="heart-outline"
            size={24}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />
          <Text
            style={[
              styles.actionText,
              { color: isDark ? Colors.dark.text : Colors.light.text }
            ]}
          >
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />
          <Text
            style={[
              styles.actionText,
              { color: isDark ? Colors.dark.text : Colors.light.text }
            ]}
          >
            {post.comments}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    borderRadius: 10,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    padding: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  postImage: {
    width: width,
    height: width,
  },
  footer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
  },
}); 