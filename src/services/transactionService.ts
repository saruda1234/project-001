import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { Transaction, Budget } from '../types';

export function subscribeTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collectionPath = `users/${userId}/transactions`;
  const q = query(collection(db, collectionPath), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Transaction, 'id'>) });
      });
      onData(items);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

export async function addTransaction(
  userId: string,
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const collectionPath = `users/${userId}/transactions`;
  const newDocRef = doc(collection(db, collectionPath));
  const newId = newDocRef.id;
  const now = new Date().toISOString();

  const payload: Transaction = {
    id: newId,
    userId,
    type: data.type,
    amount: Number(data.amount),
    category: data.category,
    date: data.date,
    ...(data.description ? { description: data.description } : {}),
    ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
    createdAt: now,
  };

  try {
    await setDoc(newDocRef, payload);
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${newId}`);
    throw error;
  }
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docPath = `users/${userId}/transactions/${transactionId}`;
  const docRef = doc(db, docPath);
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    updatedAt: now,
  };
  if (data.type !== undefined) payload.type = data.type;
  if (data.amount !== undefined) payload.amount = Number(data.amount);
  if (data.category !== undefined) payload.category = data.category;
  if (data.date !== undefined) payload.date = data.date;
  if (data.description !== undefined) payload.description = data.description;
  if (data.paymentMethod !== undefined) payload.paymentMethod = data.paymentMethod;

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
    throw error;
  }
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  const docPath = `users/${userId}/transactions/${transactionId}`;
  const docRef = doc(db, docPath);

  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
    throw error;
  }
}

export function subscribeBudget(
  userId: string,
  month: string,
  onData: (budget: Budget | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docPath = `users/${userId}/budgets/${month}`;
  const docRef = doc(db, docPath);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData({ id: snapshot.id, ...(snapshot.data() as Omit<Budget, 'id'>) });
      } else {
        onData(null);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  );
}

export async function saveBudget(
  userId: string,
  month: string,
  monthlyBudget: number,
  savingsGoal: number = 0
): Promise<void> {
  const docPath = `users/${userId}/budgets/${month}`;
  const docRef = doc(db, docPath);
  const now = new Date().toISOString();

  const payload: Budget = {
    id: month,
    userId,
    month,
    monthlyBudget: Number(monthlyBudget),
    savingsGoal: Number(savingsGoal),
    updatedAt: now,
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
    throw error;
  }
}
