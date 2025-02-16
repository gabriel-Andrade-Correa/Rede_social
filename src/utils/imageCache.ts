import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@image_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

interface CachedImage {
  data: string;
  timestamp: number;
}

export const cacheImage = async (mediaId: string, base64Data: string): Promise<void> => {
  try {
    const cacheData: CachedImage = {
      data: base64Data,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${mediaId}`,
      JSON.stringify(cacheData)
    );
    
    console.log('Imagem salva no cache:', mediaId);
  } catch (error) {
    console.error('Erro ao salvar imagem no cache:', error);
  }
};

export const getCachedImage = async (mediaId: string): Promise<string | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${mediaId}`);
    
    if (!cached) {
      return null;
    }

    const cacheData: CachedImage = JSON.parse(cached);
    
    // Verifica se o cache expirou
    if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
      console.log('Cache expirado para:', mediaId);
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${mediaId}`);
      return null;
    }

    console.log('Imagem recuperada do cache:', mediaId);
    return cacheData.data;
  } catch (error) {
    console.error('Erro ao recuperar imagem do cache:', error);
    return null;
  }
};

export const clearImageCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('Cache de imagens limpo');
  } catch (error) {
    console.error('Erro ao limpar cache de imagens:', error);
  }
};

export const cleanExpiredCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    for (const key of cacheKeys) {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const cacheData: CachedImage = JSON.parse(cached);
        if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
          await AsyncStorage.removeItem(key);
          console.log('Cache expirado removido:', key);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao limpar cache expirado:', error);
  }
}; 