import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

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
  };
  rating?: {
    average: number;
    count: number;
    total: number;
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
      total: 0
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    firebaseUid: userId
  };

  await setDoc(userDoc, newUser);
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userDoc = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    return userSnapshot.data() as User;
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

export const rateUser = async (userId: string, rating: number): Promise<void> => {
  if (rating < 1 || rating > 10) {
    throw new Error('A avaliação deve ser entre 1 e 10');
  }

  const userDoc = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userDoc);

  if (!userSnapshot.exists()) {
    throw new Error('Usuário não encontrado');
  }

  const userData = userSnapshot.data() as User;
  const currentRating = userData.rating || { average: 0, count: 0, total: 0 };

  const newRating = {
    count: currentRating.count + 1,
    total: currentRating.total + rating,
    average: Number(((currentRating.total + rating) / (currentRating.count + 1)).toFixed(1))
  };

  await updateDoc(userDoc, {
    rating: newRating,
    updatedAt: new Date()
  });
}; 