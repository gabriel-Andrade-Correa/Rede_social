import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, increment, Timestamp, getDoc, where } from 'firebase/firestore';
import { auth } from '../config/firebase';
import { uploadMedia, getMediaUrl } from './media';
import { formatMediaUrl, getAuthToken, getBaseUrl } from '../utils/mediaHelper';
import { getUserProfile } from './user';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  imageURL: string;
  caption?: string;
  likes: number;
  likedBy: string[]; // Array de IDs dos usuários que deram like
  comments: number;
  createdAt: Date;
}

export const getPosts = async (): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const posts = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      
      // Converter Timestamp para Date
      const createdAt = data.createdAt instanceof Timestamp ? 
        data.createdAt.toDate() : 
        new Date(data.createdAt);

      // Garantir que a URL da imagem está completa
      const imageURL = formatMediaUrl(data.imageURL) || '';

      // Se não tiver userName ou userPhotoURL, busca do perfil do usuário
      if (!data.userName || !data.userPhotoURL) {
        try {
          const userProfile = await getUserProfile(data.userId);
          if (userProfile) {
            data.userName = userProfile.name;
            data.userPhotoURL = userProfile.photoURL;
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }

      // Adiciona timestamp na URL da foto do usuário para evitar cache
      const userPhotoURL = data.userPhotoURL ? `${data.userPhotoURL}?v=${Date.now()}` : null;

      return {
        id: doc.id,
        ...data,
        imageURL,
        createdAt,
        userName: data.userName || 'Usuário',
        userPhotoURL
      } as Post;
    }));

    return posts;
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    throw new Error('Não foi possível carregar os posts');
  }
};

export const createPost = async (imageUri: string, caption?: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuário não autenticado');

    // Buscar dados completos do usuário
    const userProfile = await getUserProfile(currentUser.uid);
    if (!userProfile) {
      throw new Error('Perfil do usuário não encontrado');
    }

    // Upload da imagem e obtenção do ID da mídia
    const mediaId = await uploadMedia(
      currentUser.uid,
      'post',
      imageUri,
      { description: caption }
    );

    // Criar o post no Firestore primeiro
    const postRef = await addDoc(collection(db, 'posts'), {
      userId: currentUser.uid,
      userName: userProfile.name || 'Usuário',
      userPhotoURL: userProfile.photoURL || null,
      imageURL: mediaId,
      caption,
      likes: 0,
      likedBy: [], // Inicializa array vazio de likes
      comments: 0,
      createdAt: Timestamp.now()
    });

    // Depois criar no MongoDB usando o ID do Firestore
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${getBaseUrl()}/api/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageUrl: mediaId,
        description: caption,
        firestoreId: postRef.id,
        userName: userProfile.name,
        userPhotoURL: userProfile.photoURL
      })
    });

    if (!response.ok) {
      // Se falhar no MongoDB, remove do Firestore para manter consistência
      await deleteDoc(postRef);
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar post no servidor');
    }
  } catch (error) {
    console.error('Erro ao criar post:', error);
    throw new Error('Não foi possível criar o post');
  }
};

export const likePost = async (postId: string): Promise<{ liked: boolean, totalLikes: number }> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuário não autenticado');

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post não encontrado');
    }

    const postData = postDoc.data();
    const likedBy = postData.likedBy || [];
    const userIndex = likedBy.indexOf(currentUser.uid);
    
    if (userIndex === -1) {
      // Usuário ainda não deu like
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: [...likedBy, currentUser.uid]
      });
      return { liked: true, totalLikes: (postData.likes || 0) + 1 };
    } else {
      // Usuário já deu like, então vamos remover
      likedBy.splice(userIndex, 1);
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: likedBy
      });
      return { liked: false, totalLikes: (postData.likes || 0) - 1 };
    }
  } catch (error) {
    console.error('Erro ao curtir post:', error);
    throw new Error('Não foi possível curtir o post');
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    console.log('Iniciando processo de deleção do post:', postId);
    
    // Primeiro, buscar o post no Firestore
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post não encontrado no Firestore');
    }

    const postData = postDoc.data();
    console.log('Dados do post a ser deletado:', {
      postId,
      imageURL: postData.imageURL
    });

    const token = await getAuthToken();
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Tenta deletar no MongoDB primeiro
      const response = await fetch(`${getBaseUrl()}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Se o post não existir no MongoDB (404) ou houver outro erro,
      // tenta deletar a mídia diretamente
      if (!response.ok) {
        console.log('Post não encontrado no MongoDB, tentando deletar mídia...');
        
        // Tenta deletar a mídia diretamente
        if (postData.imageURL) {
          const mediaResponse = await fetch(`${getBaseUrl()}/api/media/${postData.imageURL}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Resposta da deleção da mídia:', {
            status: mediaResponse.status,
            ok: mediaResponse.ok
          });
        }
      }
    } catch (error) {
      console.error('Erro ao deletar no MongoDB/mídia:', error);
      // Continua a execução para tentar deletar do Firestore
    }

    // Deleta do Firestore independentemente do resultado no MongoDB
    await deleteDoc(postRef);
    console.log('Post deletado do Firestore com sucesso');

  } catch (error) {
    console.error('Erro ao deletar post:', error);
    throw new Error('Não foi possível deletar o post');
  }
};

export const updatePost = async (postId: string, caption: string): Promise<void> => {
  try {
    console.log('Iniciando atualização do post:', { postId, caption });
    
    const token = await getAuthToken();
    if (!token) {
      console.error('Token não encontrado');
      throw new Error('Usuário não autenticado');
    }
    console.log('Token obtido com sucesso');

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/posts/${postId}`;
    console.log('URL da requisição:', url);

    // Atualizar no MongoDB
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description: caption })
    });

    console.log('Resposta do servidor:', {
      status: response.status,
      statusText: response.statusText
    });

    const responseText = await response.text();
    console.log('Corpo da resposta:', responseText);

    if (!response.ok) {
      console.error('Erro na resposta do servidor:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(`Erro do servidor: ${response.status} ${response.statusText}`);
    }

    // Atualizar no Firestore
    console.log('Atualizando no Firestore...');
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      caption: caption,
      updatedAt: Timestamp.now()
    });

    console.log('Post atualizado com sucesso no Firestore');
  } catch (error) {
    console.error('Erro detalhado ao atualizar post:', error);
    throw new Error('Não foi possível atualizar o post');
  }
};

export const updateUserPhotoInPosts = async (userId: string, newPhotoURL: string): Promise<void> => {
  try {
    console.log('Atualizando foto do usuário nos posts...');
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map(doc => {
      return updateDoc(doc.ref, {
        userPhotoURL: newPhotoURL
      });
    });

    await Promise.all(updatePromises);
    console.log(`Foto atualizada em ${updatePromises.length} posts`);
  } catch (error) {
    console.error('Erro ao atualizar foto nos posts:', error);
    throw new Error('Não foi possível atualizar a foto nos posts');
  }
}; 