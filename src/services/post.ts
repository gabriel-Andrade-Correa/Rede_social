import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: Date;
}

export const createPost = async (userId: string, content: string, imageUrl?: string): Promise<string> => {
  const postsCollection = collection(db, 'posts');
  
  const newPost = {
    userId,
    content,
    imageUrl,
    likes: 0,
    comments: 0,
    createdAt: new Date()
  };

  const docRef = await addDoc(postsCollection, newPost);
  return docRef.id;
};

export const getPost = async (postId: string): Promise<Post | null> => {
  const postDoc = doc(db, 'posts', postId);
  const postSnapshot = await getDoc(postDoc);

  if (postSnapshot.exists()) {
    return { id: postSnapshot.id, ...postSnapshot.data() } as Post;
  }

  return null;
};

export const getFeed = async (limit: number = 10): Promise<Post[]> => {
  const postsCollection = collection(db, 'posts');
  const q = query(postsCollection, orderBy('createdAt', 'desc'), limit(limit));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Post);
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const postsCollection = collection(db, 'posts');
  const q = query(
    postsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Post);
};

export const updatePost = async (postId: string, content: string): Promise<void> => {
  const postDoc = doc(db, 'posts', postId);
  await updateDoc(postDoc, { content });
};

export const deletePost = async (postId: string): Promise<void> => {
  const postDoc = doc(db, 'posts', postId);
  await deleteDoc(postDoc);
};

export const likePost = async (postId: string): Promise<void> => {
  const postDoc = doc(db, 'posts', postId);
  const post = await getDoc(postDoc);
  
  if (post.exists()) {
    await updateDoc(postDoc, {
      likes: (post.data().likes || 0) + 1
    });
  }
}; 