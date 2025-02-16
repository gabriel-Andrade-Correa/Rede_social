import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { refreshToken } from './auth';
import { Platform } from 'react-native';

// Use o IP correto baseado na plataforma
const getApiUrl = () => {
  if (__DEV__) {
    console.log('Ambiente de desenvolvimento detectado');
    console.log('Platform.OS:', Platform.OS);
    console.log('Constants.isDevice:', Constants.isDevice);
    
    // Para dispositivo físico ou iOS, use o IP da máquina
    const localIP = '192.168.1.102';
    console.log('Usando IP:', localIP);
    return `http://${localIP}:3000/api`;
  }
  return 'sua_url_de_producao';
};

const API_URL = getApiUrl();
console.log('API URL final configurada:', API_URL);

// Configuração global do Axios
axios.defaults.timeout = 10000; // 10 segundos
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 500; // Aceita qualquer status entre 200 e 499
};

// Adiciona um interceptor para logs
axios.interceptors.request.use(
  config => {
    console.log('Requisição sendo enviada:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
    });
    return config;
  },
  error => {
    console.error('Erro na preparação da requisição:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log('Resposta recebida:', {
      status: response.status,
      headers: response.headers,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('Erro na resposta:', {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    return Promise.reject(error);
  }
);

// Função para testar a conexão com o servidor
export const testServerConnection = async () => {
  try {
    // Testando primeiro a raiz da API
    console.log('Testando conexão com:', API_URL);
    const response = await axios.get(API_URL);
    console.log('Conexão com servidor OK:', response.data);
    return true;
  } catch (error) {
    console.error('Erro detalhado ao conectar com servidor:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro Axios:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });

      // Tentar fazer uma requisição com configurações específicas para debug
      try {
        console.log('Tentando conexão alternativa...');
        const testResponse = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        console.log('Resposta do teste:', await testResponse.text());
      } catch (fetchError) {
        console.error('Erro no teste alternativo:', fetchError);
      }
    }
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
export const getAuthHeader = async () => {
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
  try {
    // Primeiro, testar a conexão com uma chamada simples
    console.log('Testando conexão básica...');
    try {
      const testUrl = API_URL.replace('/api', '');
      console.log('Testando conexão com:', testUrl);
      
      const testResponse = await fetch(testUrl);
      console.log('Status da resposta do teste:', testResponse.status);
      
      const testText = await testResponse.text();
      console.log('Resposta do teste:', testText);
    } catch (testError) {
      console.error('Erro no teste de conexão:', testError);
      // Continuar mesmo com erro no teste
    }

    // Criar FormData de maneira mais simples
    const formData = new FormData();
    
    // Preparar o arquivo com o nome do arquivo original
    const fileName = fileUri.split('/').pop() || 'image.jpg';
    const fileInfo = {
      uri: fileUri,
      name: fileName,
      type: 'image/jpeg'
    };
    
    console.log('Preparando upload com:', {
      fileName,
      uri: fileUri,
      type: type
    });

    // Adicionar ao FormData
    formData.append('file', fileInfo as any);
    formData.append('type', type);

    // Obter token
    const authHeader = await getAuthHeader();
    
    const uploadUrl = `${API_URL}/media/upload`;
    console.log('Iniciando upload para:', uploadUrl);

    // Fazer a requisição
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': authHeader.Authorization
      }
    });

    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta não-ok do servidor:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Erro do servidor: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('Resposta bruta do servidor:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Resposta do upload:', responseData);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError);
      throw new Error('Resposta inválida do servidor');
    }

    if (!responseData.id) {
      throw new Error('Resposta inválida: id não encontrado');
    }

    return responseData.id;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw new Error('Erro ao fazer upload da imagem: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};

export const getMediaUrl = (mediaId: string): string => {
  // Usar a URL base da API
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}/api/media/${mediaId}`;
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