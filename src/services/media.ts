import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { refreshToken } from './auth';
import { Platform } from 'react-native';

// Use o IP correto baseado na plataforma
const getApiUrl = () => {
  if (__DEV__) {
    // 10.0.2.2 é o localhost do emulador Android
    // Para iOS ou dispositivo físico, use o IP da sua máquina
    if (Platform.OS === 'android' && !Constants.isDevice) {
      return 'http://10.0.2.2:3000/api';
    }
    // Para iOS e dispositivos físicos
    return 'http://192.168.1.35:3000/api';
  }
  return 'sua_url_de_producao';
};

const API_URL = getApiUrl();

// Log para debug
console.log('API URL configurada:', API_URL);

// Configuração global do Axios
axios.defaults.timeout = 10000; // 10 segundos
axios.defaults.headers.common['Accept'] = 'application/json';

// Função para testar a conexão com o servidor
export const testServerConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('Conexão com servidor OK:', response.data);
    return true;
  } catch (error) {
    console.error('Erro ao conectar com servidor:', error);
    return false;
  }
};

export interface Media {
  _id?: string;
  userId: string;
  type: 'profile' | 'post' | 'feed';
  mimeType: string;
  createdAt: Date;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    description?: string;
  };
}

// Função auxiliar para obter o token de autenticação
const getAuthHeader = async () => {
  try {
    let token = await AsyncStorage.getItem('jwt_token');
    if (!token) {
      // Tentar atualizar o token
      token = await refreshToken();
    }
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    return {
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    console.error('Erro ao obter token:', error);
    throw new Error('Erro ao obter token de autenticação');
  }
};

export const uploadMedia = async (
  userId: string,
  type: Media['type'],
  fileUri: string,
  metadata?: Media['metadata']
): Promise<string> => {
  let currentFormData: FormData | null = null;
  
  try {
    // Testar conexão primeiro
    const isConnected = await testServerConnection();
    if (!isConnected) {
      throw new Error('Servidor não está acessível. Verifique se o servidor está rodando e se o IP está correto.');
    }

    // Criar FormData com a imagem
    const formData = new FormData();
    currentFormData = formData;
    
    const filename = fileUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

    // Log do arquivo sendo enviado
    console.log('Arquivo a ser enviado:', {
      uri: fileUri,
      name: filename,
      type: mimeType
    });

    // Adicionar arquivo ao FormData
    const fileData = {
      uri: fileUri,
      name: filename,
      type: mimeType,
    };
    formData.append('file', fileData as any);

    // Adicionar outros campos
    formData.append('type', type);
    formData.append('userId', userId);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    // Obter headers de autenticação
    const authHeader = await getAuthHeader();

    // Log para debug
    console.log('Enviando requisição para:', `${API_URL}/media/upload`);
    console.log('Headers:', authHeader);
    console.log('FormData:', {
      file: filename,
      type,
      userId,
      metadata,
    });

    // Fazer upload com timeout maior para arquivos grandes
    const response = await axios.post(`${API_URL}/media/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...authHeader,
      },
      timeout: 30000, // 30 segundos
    });

    console.log('Resposta do servidor:', response.data);

    if (!response.data || !response.data.mediaId) {
      throw new Error('Resposta inválida do servidor');
    }

    return response.data.mediaId;
  } catch (error) {
    console.error('Detalhes completos do erro:', error);
    
    if (axios.isAxiosError(error)) {
      // Erro de timeout
      if (error.code === 'ECONNABORTED') {
        throw new Error('O upload demorou muito tempo. Tente novamente.');
      }
      
      // Erro de autenticação
      if (error.response?.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      
      // Erro do servidor
      if (error.response) {
        console.error('Erro do servidor:', error.response.data);
        throw new Error(`Erro do servidor: ${error.response.data?.message || error.response.statusText}`);
      }
      
      // Erro de conexão
      if (error.request) {
        console.error('Erro de conexão:', error.request);
        throw new Error(`Erro de conexão: Verifique se o servidor está rodando em ${API_URL}`);
      }
    }
    
    throw new Error('Erro inesperado ao fazer upload da imagem: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};

export const getMediaUrl = (mediaId: string): string => {
  return `${API_URL}/media/${mediaId}`;
};

export const getUserMedia = async (userId: string, type: Media['type']): Promise<Media[]> => {
  try {
    const authHeader = await getAuthHeader();
    const response = await axios.get(
      `${API_URL}/media/user/${userId}?type=${type}`,
      { headers: authHeader }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error(error.response?.data?.message || 'Erro ao buscar mídias do usuário');
    }
    throw error;
  }
};

export const deleteMedia = async (mediaId: string): Promise<boolean> => {
  try {
    const authHeader = await getAuthHeader();
    await axios.delete(
      `${API_URL}/media/${mediaId}`,
      { headers: authHeader }
    );
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error(error.response?.data?.message || 'Erro ao deletar mídia');
    }
    throw error;
  }
};

export const updateMediaMetadata = async (
  mediaId: string,
  metadata: Media['metadata']
): Promise<boolean> => {
  try {
    const authHeader = await getAuthHeader();
    const response = await axios.patch(
      `${API_URL}/media/${mediaId}/metadata`,
      { metadata },
      { headers: authHeader }
    );
    return response.data.success;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error(error.response?.data?.message || 'Erro ao atualizar metadados');
    }
    throw error;
  }
}; 