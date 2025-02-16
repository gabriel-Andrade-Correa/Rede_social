import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCachedImage, cacheImage } from './imageCache';

export const getBaseUrl = () => {
  if (__DEV__) {
    const localIP = '192.168.1.102';
    const baseUrl = `http://${localIP}:3000`;
    console.log('URL base da API:', baseUrl);
    return baseUrl;
  }
  return 'sua_url_de_producao';
};

export const formatMediaUrl = (mediaId: string | null | undefined): string | null => {
  if (!mediaId) {
    console.log('mediaId nulo ou indefinido');
    return null;
  }

  // Remove qualquer prefixo de URL existente
  let cleanId = mediaId;
  if (mediaId.includes('/api/media/')) {
    cleanId = mediaId.split('/api/media/')[1];
  }

  // Retorna apenas o caminho relativo
  const relativePath = `/api/media/${cleanId}`;
  
  console.log('URL formatada:', {
    originalId: mediaId,
    cleanId,
    relativePath
  });

  return relativePath;
};

export const getAuthToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  try {
    let token = await AsyncStorage.getItem('jwt_token');
    
    if (!token || forceRefresh) {
      console.log('Token não encontrado ou refresh forçado, tentando obter novo token');
      // Aqui você pode adicionar a lógica para obter um novo token
      // Por exemplo, chamar uma função de refresh token
      return null;
    }

    // Remove o prefixo Bearer se existir
    const cleanToken = token.replace('Bearer ', '');
    
    // Verifica se o token está expirado
    try {
      const payload = JSON.parse(atob(cleanToken.split('.')[1]));
      const expiration = payload.exp * 1000; // Converter para milissegundos
      
      if (expiration < Date.now()) {
        console.log('Token expirado, necessário refresh');
        return null;
      }
    } catch (e) {
      console.error('Erro ao verificar expiração do token:', e);
    }
    
    console.log('Token válido recuperado');
    return cleanToken;
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return null;
  }
};

export const loadImageAsBase64 = async (mediaId: string | null | undefined): Promise<string | null> => {
  try {
    if (!mediaId) {
      console.log('mediaId nulo ou indefinido');
      return null;
    }

    // Tenta recuperar do cache primeiro
    const cached = await getCachedImage(mediaId);
    if (cached) {
      return cached;
    }

    const token = await getAuthToken();
    if (!token) {
      console.error('Token não encontrado');
      return null;
    }

    const url = `${getBaseUrl()}${formatMediaUrl(mediaId)}`;
    console.log('Carregando imagem:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Erro ao carregar imagem:', response.status);
      return null;
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        console.log('Imagem convertida para base64');
        
        // Salva no cache
        await cacheImage(mediaId, base64);
        
        resolve(base64);
      };
      reader.onerror = () => {
        console.error('Erro ao converter imagem para base64');
        reject(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao carregar imagem como base64:', error);
    return null;
  }
}; 