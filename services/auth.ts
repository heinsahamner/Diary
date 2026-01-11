import { UserCredentials } from "../types";
import { DBService } from "./db";

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  
  const msgUint8 = enc.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  return bufferToHex(hashBuffer);
}

export const AuthService = {
  async register(username: string, password: string): Promise<{success: boolean, message?: string}> {
    const existingUser = await DBService.getUser(username);
    if (existingUser) {
      return { success: false, message: 'Usuário já existe.' };
    }

    const salt = window.crypto.randomUUID();
    const passwordHash = await hashPassword(password, salt);

    await DBService.saveUser({ username, passwordHash, salt });
    return { success: true };
  },

  async login(username: string, password: string): Promise<{success: boolean, message?: string}> {
    const user = await DBService.getUser(username);

    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    const hashAttempt = await hashPassword(password, user.salt);
    if (hashAttempt === user.passwordHash) {
      return { success: true };
    } else {
      return { success: false, message: 'Senha incorreta.' };
    }
  }
};
