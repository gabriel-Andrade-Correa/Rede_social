import React, { useState, useEffect } from 'react';
import { Image, ActivityIndicator, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import { View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthenticatedImageProps {
  url: string;
  style?: StyleProp<ImageStyle>;
  placeholderColor?: string;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  url,
  style,
  placeholderColor = '#ccc',
  onLoadComplete,
  onError,
}) => {
  const [imageSource, setImageSource] = useState<{ uri: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!url) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const token = await AsyncStorage.getItem('jwt_token');
        if (!token) {
          throw new Error('Token não encontrado');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'image/jpeg, image/png, image/*',
          'Cache-Control': 'no-cache'
        };

        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`Erro ao carregar imagem: ${response.status}`);
        }

        const blob = await response.blob();
        const reader = new FileReader();
        
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
        });
        
        reader.readAsDataURL(blob);
        const base64data = await base64Promise;

        setImageSource({ uri: base64data });
        onLoadComplete?.();
      } catch (err) {
        console.error('Erro ao carregar imagem:', err);
        setError(true);
        onError?.(err instanceof Error ? err : new Error('Erro ao carregar imagem'));
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [url, onLoadComplete, onError]);

  if (loading) {
    return (
      <View style={[styles.container, style, { backgroundColor: placeholderColor }]}>
        <ActivityIndicator color="#FFF" />
      </View>
    );
  }

  if (error || !imageSource) {
    return (
      <View style={[styles.container, style, { backgroundColor: placeholderColor }]} />
    );
  }

  return (
    <Image
      source={imageSource}
      style={[styles.image, style]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
}); 