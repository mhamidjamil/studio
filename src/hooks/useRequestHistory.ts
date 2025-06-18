import { useState, useEffect, useCallback } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/localStorage';
import type { RequestHistoryItem } from '@/lib/types';

const HISTORY_STORAGE_KEY = 'ledRemoteRequestHistory';
const MAX_HISTORY_ITEMS = 10;

export function useRequestHistory(): {
  history: RequestHistoryItem[];
  addHistoryItem: (item: Omit<RequestHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
} {
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);

  useEffect(() => {
    const storedHistory = getFromLocalStorage<RequestHistoryItem[]>(HISTORY_STORAGE_KEY, []);
    setHistory(storedHistory);
  }, []);

  const addHistoryItem = useCallback((itemData: Omit<RequestHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: RequestHistoryItem = {
      ...itemData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setHistory(prevHistory => {
      const updatedHistory = [newItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
      saveToLocalStorage(HISTORY_STORAGE_KEY, updatedHistory);
      return updatedHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveToLocalStorage(HISTORY_STORAGE_KEY, []);
  }, []);

  return { history, addHistoryItem, clearHistory };
}
