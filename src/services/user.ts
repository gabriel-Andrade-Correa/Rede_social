import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { auth } from '../config/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  age?: number;
  gender?: string;
  interests: string[];
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
  };
  rating: {
    average: number;
    count: number;
    total: number;
    votedBy: { [userId: string]: number };
  };
  createdAt: Date;
  firebaseUid: string;
  updatedAt: Date;
}

export const createUserProfile = async (userId: string, email: string): Promise<void> => {
  const userDoc = doc(db, 'users', userId);
  
  const newUser: User = {
    id: userId,
    email,
    name: '',
    interests: [],
    rating: {
      average: 0,
      count: 0,
      total: 0,
      votedBy: {}
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    firebaseUid: userId
  };

  await setDoc(userDoc, newUser);
};

export const initializeUserRating = async (userId: string): Promise<void> => {
  try {
    const userDoc = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      throw new Error('Usuário não encontrado');
    }

    const userData = userSnapshot.data() as User;

    // Se o usuário não tiver a estrutura de rating, inicializa
    if (!userData.rating) {
      await updateDoc(userDoc, {
        rating: {
          average: 0,
          count: 0,
          total: 0,
          votedBy: {}
        },
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar rating do usuário:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userDoc = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data() as User;
    
    // Se não tiver rating, inicializa
    if (!userData.rating) {
      await initializeUserRating(userId);
      // Busca o usuário novamente após inicializar
      const updatedSnapshot = await getDoc(userDoc);
      return updatedSnapshot.data() as User;
    }
    
    return userData;
  }

  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, {
    ...data,
    updatedAt: new Date()
  });
};

export const rateUser = async (userId: string, rating: number): Promise<{ success: boolean, newAverage: number }> => {
  try {
    if (rating < 1 || rating > 10) {
      throw new Error('A avaliação deve ser entre 1 e 10');
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const userDoc = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      throw new Error('Usuário não encontrado');
    }

    const userData = userSnapshot.data() as User;
    const currentRating = userData.rating || { average: 0, count: 0, total: 0, votedBy: {} };

    if (currentRating.votedBy && currentRating.votedBy[currentUser.uid]) {
      throw new Error('Você já avaliou este usuário');
    }

    const newTotal = currentRating.total + rating;
    const newCount = currentRating.count + 1;
    const newAverage = Number((newTotal / newCount).toFixed(1));

    const newRating = {
      count: newCount,
      total: newTotal,
      average: newAverage,
      votedBy: {
        ...currentRating.votedBy,
        [currentUser.uid]: rating
      }
    };

    await updateDoc(userDoc, {
      rating: newRating,
      updatedAt: new Date()
    });

    return { success: true, newAverage };
  } catch (error) {
    console.error('Erro ao avaliar usuário:', error);
    throw error;
  }
};

export const searchUsers = async (searchText: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const searchQuery = query(
      usersRef,
      where('name', '>=', searchText),
      where('name', '<=', searchText + '\uf8ff'),
      limit(20)
    );
    
    const snapshot = await getDocs(searchQuery);
    const currentUser = auth.currentUser;
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<User, 'id'>)
      }))
      .filter(user => user.id !== currentUser?.uid);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error('Não foi possível realizar a busca de usuários');
  }
};

export const getTopRatedUsers = async (limitCount: number = 10): Promise<User[]> => {
  try {
    console.log('Iniciando busca de top usuários...');
    const usersRef = collection(db, 'users');
    
    // Query simplificada
    const q = query(
      usersRef,
      orderBy('rating.total', 'desc'),
      limit(limitCount)
    );
    
    console.log('Executando query...');
    const snapshot = await getDocs(q);
    console.log(`Encontrados ${snapshot.docs.length} usuários`);

    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      const user = {
        id: doc.id,
        ...data
      } as User;

      // Log detalhado de cada usuário
      console.log('Dados do usuário encontrado:', {
        id: user.id,
        name: user.name,
        rating: {
          total: user.rating?.total || 0,
          count: user.rating?.count || 0,
          average: user.rating?.average || 0
        }
      });

      return user;
    });

    // Filtra apenas usuários que têm avaliações
    const ratedUsers = users.filter(user => user.rating && user.rating.total > 0);
    console.log(`Total de usuários com avaliações: ${ratedUsers.length}`);

    // Ordenar por total de estrelas
    ratedUsers.sort((a, b) => b.rating.total - a.rating.total);

    console.log('Usuários ordenados:', ratedUsers.map(u => ({
      id: u.id,
      name: u.name,
      rating: {
        total: u.rating.total,
        count: u.rating.count
      }
    })));

    return ratedUsers;
  } catch (error) {
    console.error('Erro detalhado ao buscar usuários mais bem avaliados:', error);
    throw new Error('Não foi possível carregar o ranking');
  }
};

export const getUserRating = async (userId: string, ratedUserId: string): Promise<number | null> => {
  try {
    const userDoc = doc(db, 'users', ratedUserId);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return null;
    }

    const userData = userSnapshot.data() as User;
    return userData.rating?.votedBy?.[userId] || null;
  } catch (error) {
    console.error('Erro ao buscar avaliação do usuário:', error);
    return null;
  }
}; 