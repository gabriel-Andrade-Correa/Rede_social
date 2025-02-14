import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  and,
  or,
} from 'firebase/firestore';

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'matched' | 'rejected';
  createdAt: Date;
}

export const createMatch = async (user1Id: string, user2Id: string): Promise<string> => {
  // Verifica se já existe um match entre esses usuários
  const existingMatch = await findExistingMatch(user1Id, user2Id);
  if (existingMatch) {
    return existingMatch.id;
  }

  const matchesCollection = collection(db, 'matches');
  const newMatch = {
    user1Id,
    user2Id,
    status: 'pending',
    createdAt: new Date()
  };

  const docRef = await addDoc(matchesCollection, newMatch);
  return docRef.id;
};

export const findExistingMatch = async (user1Id: string, user2Id: string): Promise<Match | null> => {
  const matchesCollection = collection(db, 'matches');
  const q = query(
    matchesCollection,
    or(
      and(
        where('user1Id', '==', user1Id),
        where('user2Id', '==', user2Id)
      ),
      and(
        where('user1Id', '==', user2Id),
        where('user2Id', '==', user1Id)
      )
    )
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Match;
  }

  return null;
};

export const getUserMatches = async (userId: string): Promise<Match[]> => {
  const matchesCollection = collection(db, 'matches');
  const q = query(
    matchesCollection,
    or(
      where('user1Id', '==', userId),
      where('user2Id', '==', userId)
    ),
    where('status', '==', 'matched')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Match);
};

export const updateMatchStatus = async (matchId: string, status: Match['status']): Promise<void> => {
  const matchDoc = doc(db, 'matches', matchId);
  await updateDoc(matchDoc, { status });
}; 