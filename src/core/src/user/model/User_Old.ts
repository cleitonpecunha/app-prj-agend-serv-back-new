import Email from "@/core/src/shared/Email";
import Entidade, { EntidadeProps } from "@/core/src/shared/Entidade";
import NomePessoa from "@/core/src/shared/NomePessoa";
import SenhaHash from "@/core/src/shared/SenhaHash";

export interface UsuarioProps extends EntidadeProps {
  name?: string;
  businessName?: string;
  slug?: string;
  email?: string;
  passwordHash?: string | undefined;
  phone?: string;
  address?: string;
}

export default class Usuario extends Entidade<Usuario, UsuarioProps> {
  readonly name: NomePessoa;
  readonly businessName: NomePessoa;
  readonly slug: NomePessoa;
  readonly email: Email;
  readonly passwordHash: SenhaHash | null;
  readonly phone: string;
  readonly address: string;

  constructor(props: UsuarioProps) {
    super(props);

    this.name = new NomePessoa(props.name!, "name", "Usuário");
    this.businessName = new NomePessoa(
      props.businessName!,
      "businessName",
      "Usuário",
    );
    this.slug = new NomePessoa(props.slug!, "slug", "Usuário");
    this.email = new Email(props.email, "email", "Usuário");
    this.passwordHash = props.passwordHash
      ? new SenhaHash(props.passwordHash, "passwordHash", "Usuário")
      : null;
    this.phone = props.phone ? props.phone : "";
    this.address = props.address ? props.address : "";
  }

  semSenha(): Usuario {
    return this.clone({ passwordHash: undefined });
  }
}
