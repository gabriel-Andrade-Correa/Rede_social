import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadMedia } from '@/services/media';
import { updateUserProfile } from '@/services/user';
import { updateUserPhotoInPosts } from '@/services/posts';
import { auth } from '@/config/firebase';
import { formatMediaUrl, getAuthToken, getBaseUrl } from '@/utils/mediaHelper';
import { loadImageAsBase64 } from '@/utils/mediaHelper';
import { clearImageCache } from '@/utils/imageCache';

interface PhotoUploadProps {
  currentPhotoURL?: string | null;
  onPhotoUpdated?: (newPhotoURL: string) => void;
}

export default function PhotoUpload({ currentPhotoURL, onPhotoUpdated }: PhotoUploadProps) {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [localPhotoURL, setLocalPhotoURL] = useState<string | null>(currentPhotoURL || null);
  const [retryCount, setRetryCount] = useState(0);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const loadAuthToken = useCallback(async (forceRefresh: boolean = false) => {
    try {
      const token = await getAuthToken(forceRefresh);
      if (!token) {
        console.error('Token não encontrado ou expirado');
        setImageError(true);
        return;
      }
      setAuthToken(token);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      setImageError(true);
    }
  }, []);

  const loadImage = useCallback(async () => {
    if (!localPhotoURL) return;

    try {
      setImageError(false);
      const base64 = await loadImageAsBase64(localPhotoURL);
      
      if (base64) {
        console.log('Imagem carregada com sucesso em base64');
        setBase64Image(base64);
      } else {
        console.error('Não foi possível carregar a imagem');
        setImageError(true);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      setImageError(true);
    }
  }, [localPhotoURL]);

  useEffect(() => {
    loadAuthToken();
  }, [loadAuthToken]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  useEffect(() => {
    setLocalPhotoURL(currentPhotoURL || null);
  }, [currentPhotoURL]);

  // Efeito para recarregar o token quando expirar
  useEffect(() => {
    const tokenRefreshInterval = setInterval(() => loadAuthToken(true), 4 * 60 * 1000); // Recarrega a cada 4 minutos
    return () => clearInterval(tokenRefreshInterval);
  }, [loadAuthToken]);

  const handleImageError = async () => {
    console.error('Erro ao exibir imagem, tentando recarregar...');
    
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      await loadImage();
    } else {
      setImageError(true);
      Alert.alert(
        'Erro',
        'Não foi possível carregar a imagem. Por favor, tente novamente mais tarde.'
      );
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const uploadPhoto = async (imageUri: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    // Sempre recarrega o token antes do upload
    await loadAuthToken();
    if (!authToken) {
      Alert.alert('Erro', 'Não foi possível autenticar o upload');
      return;
    }

    try {
      setLoading(true);
      setImageError(false);
      setRetryCount(0); // Reseta o contador de tentativas

      console.log('Iniciando upload da foto...');
      const mediaId = await uploadMedia(
        currentUser.uid,
        'profile',
        imageUri,
        {
          description: 'Foto de perfil'
        }
      );
      console.log('Upload concluído, mediaId:', mediaId);

      // Atualizar perfil do usuário com o ID da mídia
      await updateUserProfile(currentUser.uid, {
        photoURL: mediaId
      });
      console.log('Perfil atualizado com novo mediaId');

      // Atualizar a foto em todos os posts do usuário
      await updateUserPhotoInPosts(currentUser.uid, mediaId);
      console.log('Foto atualizada em todos os posts');

      // Limpar cache de imagens
      await clearImageCache();
      console.log('Cache de imagens limpo');

      setLocalPhotoURL(mediaId);
      
      if (onPhotoUpdated) {
        onPhotoUpdated(mediaId);
      }

      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro detalhado no upload:', error);
      Alert.alert('Erro', 'Não foi possível fazer o upload da foto');
      setImageError(true);
    } finally {
      setLoading(false);
    }
  };

  const imageSource = base64Image ? {
    uri: base64Image
  } : {
    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    width: 120,
    height: 120
  };

  console.log('Estado atual da imagem:', {
    localPhotoURL,
    hasBase64: !!base64Image,
    retryCount
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={pickImage}
      disabled={loading}
    >
      <View style={[styles.photoContainer, imageError && styles.photoError]}>
        <Image
          source={imageSource}
          style={styles.photo}
          onLoadStart={() => {
            console.log('Carregando imagem:', imageSource.uri);
            setImageError(false);
          }}
          onLoadEnd={() => {
            console.log('Imagem carregada com sucesso');
          }}
          onError={handleImageError}
        />
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator 
            size="large" 
            color={Colors[isDark ? 'dark' : 'light'].primary} 
          />
        </View>
      )}
      {!loading && !imageError && (
        <View style={styles.editButton}>
          <Ionicons 
            name="camera" 
            size={20} 
            color="#FFF" 
          />
        </View>
      )}
      {imageError && (
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: Colors[isDark ? 'dark' : 'light'].error }]}
          onPress={() => {
            setRetryCount(0);
            setImageError(false);
            loadAuthToken(true);
          }}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color="#FFF" 
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    marginBottom: 20,
  },
  photoContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  photoError: {
    borderWidth: 2,
    borderColor: Colors.light.error,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
}); 