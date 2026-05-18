import { ConflictError } from "@/lib/errors";
import { IUsersRepository } from "../repositories/IUsersRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class UserServices {
  constructor(private readonly usersRepository: IUsersRepository) {}

  // Método para validar regras de negócio relacionadas a um novo usuário
  async validarRegraNovoUsuario(email: string, slug: string) {
    const [existingEmail, existingSlug] = await Promise.all([
      this.usersRepository.findByEmail(email),
      this.usersRepository.findBySlug(slug),
    ]);

    if (existingEmail) {
      throw new ConflictError(
        MensagensPadronizadas.USUARIO_EMAIL_JA_CADASTRADO,
      );
    }

    if (existingSlug) {
      throw new ConflictError(
        MensagensPadronizadas.USUARIO_NOME_NEGOCIO_JA_CADASTRADO,
      );
    }
  }

  // Método para validar regras de negócio relacionadas a um novo usuário
  async validarRegraAtualizarUsuario(id: string, slug: string) {
    const [existingUser, existingSlug] = await Promise.all([
      this.usersRepository.findById(id),
      this.usersRepository.findBySlug(slug),
    ]);

    if (!existingUser) {
      throw new ConflictError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    if (existingSlug && existingSlug.id !== id) {
      throw new ConflictError(
        MensagensPadronizadas.USUARIO_NOME_NEGOCIO_JA_CADASTRADO,
      );
    }
  }

  // Método para buscar um usuário por email
  async buscarUsuarioPorEmail(email: string) {
    const existeUsuario = await this.usersRepository.findByEmail(email);
    if (!existeUsuario) {
      throw new ConflictError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }
    return existeUsuario;
  }

  // Método para buscar um usuário por ID
  async buscarUsuarioPorId(id: string) {
    const existeUsuario = await this.usersRepository.findById(id);
    if (!existeUsuario) {
      throw new ConflictError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }
    return existeUsuario;
  }

  async buscarTodosUsuarios() {
    const usuarios = await this.usersRepository.findMany();
    if (!usuarios || usuarios.length === 0) {
      throw new ConflictError(MensagensPadronizadas.USUARIOS_NAO_ENCONTRADOS);
    }
    return usuarios;
  }
}
