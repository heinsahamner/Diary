import { openDB, DBSchema } from 'idb';
import { AppState, UserCredentials } from '../types';

interface DiaryDB extends DBSchema {
  users: {
    key: string;
    value: UserCredentials;
  };
  app_state: {
    key: string;
    value: AppState;
  };
}

const DB_NAME = 'diary-planner-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB<DiaryDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'username' });
      }
      if (!db.objectStoreNames.contains('app_state')) {
        db.createObjectStore('app_state');
      }
    },
  });
};

export const DBService = {
  async getUser(username: string): Promise<UserCredentials | undefined> {
    const db = await initDB();
    return db.get('users', username);
  },

  async saveUser(user: UserCredentials): Promise<void> {
    const db = await initDB();
    await db.put('users', user);
  },

  async loadState(username: string, year: number): Promise<AppState | undefined> {
    const db = await initDB();
    const key = `${username}_${year}`;
    return db.get('app_state', key);
  },

  async saveState(username: string, year: number, state: AppState): Promise<void> {
    const db = await initDB();
    const key = `${username}_${year}`;
    await db.put('app_state', state, key);
  },

  async getAllDataForUser(username: string): Promise<any> {
     const db = await initDB();
     const allKeys = await db.getAllKeys('app_state');
     const userKeys = allKeys.filter(k => k.toString().startsWith(`${username}_`));
     
     const backup: Record<string, any> = {};
     for (const key of userKeys) {
         backup[key.toString()] = await db.get('app_state', key);
     }
     return backup;
  },
  
  async uploadBackupToServer(username: string, serverUrl: string): Promise<boolean> {
      try {
          const data = await this.getAllDataForUser(username);
          
          // NOTA: Aqui deve se conectar ao backend MariaDB
          /*
          const response = await fetch(serverUrl, {
          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          ody: JSON.stringify({ username, data, timestamp: new Date().toISOString() })
          );

          if (!response.ok) throw new Error('Falha ao fazer o upload');

          */
          
          console.log(`[Mock Upload] Uploading ${JSON.stringify(data).length} bytes to ${serverUrl}...`);
          await new Promise(r => setTimeout(r, 1500));
          
          return true;
      } catch (e) {
          console.error("Backup failed", e);
          return false;
      }
  }
};
