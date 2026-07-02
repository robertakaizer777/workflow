import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  
  // A chave DEVE ter exatamente 32 bytes para o AES-256
  private readonly secretKey = Buffer.from(
    process.env.ENCRYPTION_KEY || 'super-secret-key-that-is-32bytes',
    'utf-8'
  );

  encrypt(text: string): string {
    if (!text) return text;
    
    // Vetor de inicialização (IV) de 16 bytes
    const iv = crypto.randomBytes(16);
    
    // Cria a cifra
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    
    // Criptografa
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Tag de autenticação (garante que não foi adulterado)
    const authTag = cipher.getAuthTag();
    
    // Retorna iv:tag:dado
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;
    
    // Tratativa para tokens legados (que já estavam no banco em plain text)
    if (!encryptedText.includes(':')) {
       return encryptedText;
    }

    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) return encryptedText;

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encryptedData = parts[2];

      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (e) {
      console.error('Decryption error:', e);
      return '';
    }
  }
}
