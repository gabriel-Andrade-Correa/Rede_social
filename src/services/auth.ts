import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { createUserProfile } from './user';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para salvar o token
export const saveToken = async (user: FirebaseUser) => {
  try {
    const token = await user.getIdToken();
    await AsyncStorage.setItem('jwt_token', token);
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    throw error;
  }
};

// Função para atualizar o token
export const refreshToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    const token = await user.getIdToken(true); // Force refresh
    await AsyncStorage.setItem('jwt_token', token);
    return token;
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Criar perfil do usuário no Firestore
    await createUserProfile(userCredential.user.uid, email);
    await saveToken(userCredential.user);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await saveToken(userCredential.user);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('jwt_token');
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Hook para obter o usuário atual
export const useAuth = () => {
  return auth.currentUser;
}; 