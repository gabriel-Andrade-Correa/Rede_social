import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  View as RNView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile } from '@/services/user';
import { Ionicons } from '@expo/vector-icons';
import { uploadMedia, getMediaUrl } from '@/services/media';

interface PhotoUploadProps {
  userId: string;
  currentPhotoURL?: string;
  onPhotoUpdated: (url: string) => void;
  size: number;
  isDark?: boolean;
}

export default function PhotoUpload({
  userId,
  currentPhotoURL,
  onPhotoUpdated,
  size,
  isDark,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar imagem');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      // Upload para o backend com metadados
      const mediaId = await uploadMedia(userId, 'profile', uri, {
        description: 'Foto de perfil',
      });

      // Obter URL da mídia
      const mediaUrl = getMediaUrl(mediaId);

      // Atualizar perfil do usuário com a URL da mídia
      await updateUserProfile(userId, { photoURL: mediaUrl });
      onPhotoUpdated(mediaUrl);

    } catch (error) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }]}
      onPress={pickImage}
      disabled={uploading}>
      {currentPhotoURL ? (
        <Image
          source={{ uri: currentPhotoURL }}
          style={[styles.photo, { width: size, height: size }]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              backgroundColor: Colors[isDark ? 'dark' : 'light'].primary,
            },
          ]}>
          <Ionicons name="camera" size={size * 0.3} color="#FFF" />
        </View>
      )}

      {uploading ? (
        <View style={styles.overlay}>
          <ActivityIndicator color="#FFF" size="large" />
        </View>
      ) : (
        <View style={styles.editOverlay}>
          <RNView style={styles.editIconContainer}>
            <Ionicons name="camera" size={24} color="#FFF" />
          </RNView>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    borderRadius: 999,
  },
  placeholder: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
}); 