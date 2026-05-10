import bcrypt from "bcrypt";
import ICryptoProvider from "./ICryptoProvider";

export default class CryptoProviderBcrypt implements ICryptoProvider {
  criptografar(senha: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(senha, salt);
  }

  comparar(senha: string, senhaCriptografada: string): boolean {
    return bcrypt.compareSync(senha, senhaCriptografada);
  }
}
