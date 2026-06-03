import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const ISENHA_HASH_SERVICE = 'ISENHA_HASH_SERVICE';

export interface ISenhaHashService {
  hash(senha: string): Promise<string>;
  compare(senha: string, hash: string): Promise<boolean>;
}

export class SenhaHashService implements ISenhaHashService {
  async hash(senha: string): Promise<string> {
    return bcrypt.hash(senha, SALT_ROUNDS);
  }

  async compare(senha: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senha, hash);
  }
}
