import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '@/services/posts';

export default function CreatePostButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const pickImage = async () => {
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
      setImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!image) {
      Alert.alert('Erro', 'Por favor, selecione uma imagem');
      return;
    }

    try {
      setLoading(true);
      await createPost(image, caption);
      setModalVisible(false);
      setImage(null);
      setCaption('');
      Alert.alert('Sucesso', 'Post criado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: Colors[isDark ? 'dark' : 'light'].primary }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[
          styles.modalContainer,
          { backgroundColor: Colors[isDark ? 'dark' : 'light'].background }
        ]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={Colors[isDark ? 'dark' : 'light'].text}
              />
            </TouchableOpacity>
            <Text style={[
              styles.modalTitle,
              { color: Colors[isDark ? 'dark' : 'light'].text }
            ]}>Novo Post</Text>
            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={loading || !image}
              style={[
                styles.postButton,
                { opacity: loading || !image ? 0.5 : 1 }
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.postButtonText}>Publicar</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.imageContainer}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <View style={[
                styles.imagePlaceholder,
                { backgroundColor: isDark ? '#333' : '#f5f5f5' }
              ]}>
                <Ionicons
                  name="image-outline"
                  size={40}
                  color={isDark ? '#666' : '#999'}
                />
                <Text style={[
                  styles.placeholderText,
                  { color: isDark ? '#666' : '#999' }
                ]}>Toque para selecionar uma foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              {
                color: Colors[isDark ? 'dark' : 'light'].text,
                backgroundColor: isDark ? '#333' : '#f5f5f5'
              }
            ]}
            placeholder="Escreva uma legenda..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 40,
  },
  postButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  imageContainer: {
    aspectRatio: 1,
    width: '100%',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    height: 100,
    textAlignVertical: 'top',
  },
}); 