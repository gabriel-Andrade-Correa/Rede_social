import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  useColorScheme,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { Post, likePost, deletePost, updatePost } from '@/services/posts';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { loadImageAsBase64 } from '@/utils/mediaHelper';
import { clearImageCache } from '../../utils/imageCache';
import { auth } from '@/config/firebase';

interface FeedPostProps {
  post: Post;
  onPostDeleted?: () => void;
}

export function FeedPost({ post, onPostDeleted }: FeedPostProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [postImage, setPostImage] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentUser = auth.currentUser;
  const isPostAuthor = currentUser?.uid === post.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption || '');
  const [showOptions, setShowOptions] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);

  const loadPostImage = useCallback(async () => {
    if (!post.imageURL) return;

    try {
      setImageError(false);
      const base64 = await loadImageAsBase64(post.imageURL);
      
      if (base64) {
        console.log('Imagem do post carregada com sucesso');
        setPostImage(base64);
      } else {
        console.error('Não foi possível carregar a imagem do post');
        setImageError(true);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem do post:', error);
      setImageError(true);
    }
  }, [post.imageURL]);

  const loadUserImage = useCallback(async () => {
    if (!post.userPhotoURL) return;

    try {
      const photoURLWithTimestamp = `${post.userPhotoURL}?v=${Date.now()}`;
      const base64 = await loadImageAsBase64(photoURLWithTimestamp);
      if (base64) {
        console.log('Foto do usuário carregada com sucesso');
        setUserImage(base64);
      }
    } catch (error) {
      console.error('Erro ao carregar foto do usuário:', error);
    }
  }, [post.userPhotoURL]);

  useEffect(() => {
    loadPostImage();
    loadUserImage();
  }, [loadPostImage, loadUserImage]);

  // Adicionar efeito para recarregar a foto do usuário quando ela mudar
  useEffect(() => {
    if (post.userPhotoURL) {
      loadUserImage();
    }
  }, [post.userPhotoURL]);

  useEffect(() => {
    // Verificar se o usuário atual já curtiu o post
    if (currentUser && post.likedBy) {
      setIsLiked(post.likedBy.includes(currentUser.uid));
    }
  }, [post.likedBy]);

  const handleImageError = async () => {
    setImageError(true);
    setImageLoading(false);
    console.error('Erro ao carregar imagem do post');
    
    // Limpa o cache em caso de erro
    await clearImageCache();
    
    // Tenta recarregar a imagem
    loadPostImage();
  };

  const handleLike = async () => {
    try {
      const result = await likePost(post.id);
      setLocalLikes(result.totalLikes);
      setIsLiked(result.liked);
    } catch (error) {
      console.error('Erro ao curtir:', error);
      Alert.alert('Erro', 'Não foi possível curtir o post');
    }
  };

  const navigateToProfile = () => {
    router.push({
      pathname: "/user/[id]",
      params: { id: post.userId }
    });
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Deletar Post',
      'Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id);
              Alert.alert('Sucesso', 'Post deletado com sucesso');
              // Atualiza a lista de posts
              onPostDeleted?.();
            } catch (error) {
              console.error('Erro ao deletar:', error);
              Alert.alert('Erro', 'Não foi possível deletar o post. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const handleEditPost = () => {
    setEditedCaption(post.caption || '');
    setIsEditing(true);
  };

  const handleUpdatePost = async () => {
    try {
      await updatePost(post.id, editedCaption);
      setIsEditing(false);
      Alert.alert('Sucesso', 'Post atualizado com sucesso');
      // Atualiza a lista de posts
      onPostDeleted?.(); // Reusa o callback para atualizar a lista
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o post. Tente novamente.');
    }
  };

  const timeAgo = formatDistanceToNow(post.createdAt, {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <View style={[
      styles.container,
      { backgroundColor: Colors[isDark ? 'dark' : 'light'].background }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfoContainer} onPress={navigateToProfile}>
          <Image
            source={
              userImage
                ? { uri: userImage }
                : { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' }
            }
            style={styles.userImage}
            key={post.userPhotoURL}
          />
          <View style={styles.userInfo}>
            <Text style={[
              styles.userName,
              { color: Colors[isDark ? 'dark' : 'light'].text }
            ]}>{post.userName}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </TouchableOpacity>

        {isPostAuthor && (
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowOptions(!showOptions)}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={Colors[isDark ? 'dark' : 'light'].text}
              />
            </TouchableOpacity>

            {showOptions && (
              <View style={[
                styles.optionsMenu,
                { backgroundColor: Colors[isDark ? 'dark' : 'light'].cardBackground }
              ]}>
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setShowOptions(false);
                    handleEditPost();
                  }}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={20}
                    color={Colors[isDark ? 'dark' : 'light'].text}
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionItem, styles.deleteOption]}
                  onPress={() => {
                    setShowOptions(false);
                    handleDeletePost();
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors[isDark ? 'dark' : 'light'].error}
                    style={styles.optionIcon}
                  />
                  <Text style={[styles.optionText, { color: Colors[isDark ? 'dark' : 'light'].error }]}>
                    Deletar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.imageContainer}>
        {postImage && !imageError ? (
          <Image
            source={{ uri: postImage }}
            style={styles.postImage}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={handleImageError}
          />
        ) : null}
        {imageLoading && !imageError && (
          <View style={styles.imageLoadingContainer}>
            <ActivityIndicator 
              size="large" 
              color={Colors[isDark ? 'dark' : 'light'].primary} 
            />
          </View>
        )}
        {imageError && (
          <View style={styles.imageErrorContainer}>
            <Ionicons 
              name="image-outline" 
              size={40} 
              color={isDark ? '#666' : '#999'} 
            />
            <Text style={styles.imageErrorText}>
              Erro ao carregar imagem
            </Text>
            {retryCount < 2 && (
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => {
                  setImageError(false);
                  setImageLoading(true);
                  loadPostImage();
                }}
              >
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.interactionButton} 
          onPress={handleLike}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? Colors.light.primary : Colors[isDark ? 'dark' : 'light'].secondary}
          />
          <Text style={[
            styles.interactionText,
            isLiked ? { color: Colors.light.primary } : { color: Colors[isDark ? 'dark' : 'light'].secondary }
          ]}>{localLikes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={Colors[isDark ? 'dark' : 'light'].secondary}
          />
          <Text style={[
            styles.interactionText,
            { color: Colors[isDark ? 'dark' : 'light'].secondary }
          ]}>{post.comments}</Text>
        </TouchableOpacity>
      </View>

      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={[
            styles.caption,
            { color: Colors[isDark ? 'dark' : 'light'].text }
          ]}>{post.caption}</Text>
        </View>
      )}

      <Modal
        visible={isEditing}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditing(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[
            styles.modalContent,
            { 
              backgroundColor: Colors[isDark ? 'dark' : 'light'].cardBackground,
              borderColor: Colors[isDark ? 'dark' : 'light'].secondary,
              borderWidth: 1
            }
          ]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                style={styles.modalButton}
              >
                <Text style={[styles.modalButtonText, { color: Colors[isDark ? 'dark' : 'light'].secondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: Colors[isDark ? 'dark' : 'light'].secondary }]}>
                Editar Post
              </Text>
              <TouchableOpacity
                onPress={handleUpdatePost}
                style={[styles.modalButton, styles.saveButton, { backgroundColor: Colors.light.primary }]}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[isDark ? 'dark' : 'light'].text,
                  backgroundColor: isDark ? '#333' : '#f5f5f5'
                }
              ]}
              value={editedCaption}
              onChangeText={setEditedCaption}
              placeholder="Escreva uma legenda..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              multiline
              autoFocus
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    backgroundColor: Colors.dark.cardBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'transparent',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  userImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userInfo: {
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  postImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'transparent',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: 'transparent',
  },
  interactionText: {
    marginLeft: 5,
    fontSize: 14,
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  imageLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  imageErrorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  imageErrorText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  retryButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 5,
  },
  retryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 8,
  },
  optionsMenu: {
    position: 'absolute',
    right: 0,
    top: 40,
    width: 150,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionIcon: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 16,
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButton: {
    padding: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: Colors.light.primary,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFF',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
}); 