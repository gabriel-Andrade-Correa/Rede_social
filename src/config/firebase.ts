import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Suas configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD9XKAhINDxvoczoZLaByAFFtl2Q6SNSHg",
  authDomain: "projetotcc-ea81d.firebaseapp.com",
  projectId: "projetotcc-ea81d",
  storageBucket: "projetotcc-ea81d.firebasestorage.app",
  messagingSenderId: "517156873976",
  appId: "1:517156873976:android:1d69fc5a889dce04e1bd0d"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Obtém as instâncias dos serviços que vamos usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuração das regras de storage (você precisa configurar isso no console do Firebase)
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
*/

export default app; 