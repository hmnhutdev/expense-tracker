import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { AppSettings } from '../db/types';

export function useSettings() {
  const settings = useLiveQuery(
    async () => {
      const current = await db.settings.get(1);
      if (!current) {
        const defaultSettings: AppSettings = {
          id: 1,
          currency: 'VND',
          language: 'vi',
          theme: 'system',
          monthlyBudget: 15000000,
        };
        await db.settings.add(defaultSettings);
        return defaultSettings;
      }
      return current;
    },
    [],
    {
      id: 1,
      currency: 'VND',
      language: 'vi',
      theme: 'system',
      monthlyBudget: 15000000,
    } as AppSettings
  );

  const updateSettings = async (partial: Partial<Omit<AppSettings, 'id'>>) => {
    const current = (await db.settings.get(1)) || {
      id: 1,
      currency: 'VND',
      language: 'vi',
      theme: 'system',
      monthlyBudget: 15000000,
    };
    await db.settings.put({
      ...current,
      ...partial,
      id: 1,
    });
  };

  return {
    settings: settings || {
      id: 1,
      currency: 'VND',
      language: 'vi',
      theme: 'system',
      monthlyBudget: 15000000,
    },
    updateSettings,
  };
}
