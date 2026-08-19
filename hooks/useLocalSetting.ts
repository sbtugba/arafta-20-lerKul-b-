import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'arafta:setting:';

// Cihazda kalan, sunucuya senkronize edilmeyen tercihler için (görünüm, veri
// kullanımı vb.) — uygulama kapanıp açıldığında korunur, ama cihazlar arasında
// paylaşılmaz. Sunucuya senkron gereken ayarlar (gizlilik, bildirimler) profile
// üstünden gidiyor, bkz. hooks/useProfile.ts.
export function useLocalSetting<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(PREFIX + key)
      .then((raw) => {
        if (!mounted) return;
        if (raw != null) {
          try {
            setValue(JSON.parse(raw));
          } catch {
            // bozuk kayıt — varsayılana devam
          }
        }
      })
      .finally(() => {
        if (mounted) setLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      AsyncStorage.setItem(PREFIX + key, JSON.stringify(next)).catch(() => {});
    },
    [key]
  );

  return [value, update, loaded] as const;
}
