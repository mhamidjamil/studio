import { useState, useEffect, useCallback } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/localStorage';

const SERVER_URL_STORAGE_KEY = 'ledRemoteServerUrl';

export function useServerUrl(): [string, (url: string) => void] {
  const [serverUrl, setServerUrl] = useState<string>('');

  useEffect(() => {
    const storedUrl = getFromLocalStorage<string>(SERVER_URL_STORAGE_KEY, 'http://leds.dolphinpk.com/');
    setServerUrl(storedUrl);
  }, []);

  const updateServerUrl = useCallback((url: string) => {
    setServerUrl(url);
    saveToLocalStorage(SERVER_URL_STORAGE_KEY, url);
  }, []);

  return [serverUrl, updateServerUrl];
}
