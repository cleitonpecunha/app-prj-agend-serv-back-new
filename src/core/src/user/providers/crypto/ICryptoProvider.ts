export default interface ICryptoProvider {
  criptografar(password: string): string;
  comparar(password: string, passwordCrypto: string): boolean;
}
