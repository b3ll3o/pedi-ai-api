export interface RestauranteProps {
  id?: string;
  nome: string;
  cnpj: string;
  email?: string | null;
  telefone?: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  horarioAbertura: string;
  horarioFechamento: string;
  ativo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  version?: number;
}

export class RestauranteEntity {
  private readonly _id: string;
  private readonly _nome: string;
  private readonly _cnpj: string;
  private readonly _email: string | null;
  private readonly _telefone: string | null;
  private readonly _endereco: string;
  private readonly _cidade: string;
  private readonly _estado: string;
  private readonly _cep: string;
  private readonly _horarioAbertura: string;
  private readonly _horarioFechamento: string;
  private readonly _ativo: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt: Date | null;
  private readonly _version: number;

  constructor(props: RestauranteProps) {
    this.validateDomain(props);

    this._id = props.id || '';
    this._nome = props.nome;
    this._cnpj = this.formatCnpj(props.cnpj);
    this._email = props.email || null;
    this._telefone = props.telefone || null;
    this._endereco = props.endereco;
    this._cidade = props.cidade;
    this._estado = props.estado.toUpperCase();
    this._cep = props.cep;
    this._horarioAbertura = props.horarioAbertura;
    this._horarioFechamento = props.horarioFechamento;
    this._ativo = props.ativo !== undefined ? props.ativo : true;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._deletedAt = props.deletedAt || null;
    this._version = props.version || 1;
  }

  private validateDomain(props: RestauranteProps): void {
    if (!this.validarCnpj(props.cnpj)) {
      throw new Error('CNPJ inválido');
    }

    if (props.estado && props.estado.length !== 2) {
      throw new Error('Estado deve ter exatamente 2 caracteres');
    }

    if (!this.validarHorario(props.horarioAbertura, props.horarioFechamento)) {
      throw new Error('Horário de abertura deve ser anterior ao fechamento');
    }
  }

  private validarCnpj(cnpj: string): boolean {
    // Remove non-digits
    const cnpjDigits = cnpj.replace(/\D/g, '');

    if (cnpjDigits.length !== 14) {
      return false;
    }

    // Check for known invalid CNPJs (all same digit)
    if (/^(\d)\1+$/.test(cnpjDigits)) {
      return false;
    }

    // Validate first check digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum1 = 0;
    for (let i = 0; i < 12; i++) {
      sum1 += parseInt(cnpjDigits[i]) * weights1[i];
    }
    const remainder1 = sum1 % 11;
    const digit1 = remainder1 < 2 ? 0 : 11 - remainder1;

    if (parseInt(cnpjDigits[12]) !== digit1) {
      return false;
    }

    // Validate second check digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum2 = 0;
    for (let i = 0; i < 13; i++) {
      sum2 += parseInt(cnpjDigits[i]) * weights2[i];
    }
    const remainder2 = sum2 % 11;
    const digit2 = remainder2 < 2 ? 0 : 11 - remainder2;

    if (parseInt(cnpjDigits[13]) !== digit2) {
      return false;
    }

    return true;
  }

  private validarHorario(abertura: string, fechamento: string): boolean {
    const [abH, abM] = abertura.split(':').map(Number);
    const [feH, feM] = fechamento.split(':').map(Number);

    const abMinutes = abH * 60 + abM;
    const feMinutes = feH * 60 + feM;

    return feMinutes > abMinutes;
  }

  private formatCnpj(cnpj: string): string {
    return cnpj.replace(/[.\-/]/g, '');
  }

  get id(): string {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  get cnpj(): string {
    return this._cnpj;
  }

  get email(): string | null {
    return this._email;
  }

  get telefone(): string | null {
    return this._telefone;
  }

  get endereco(): string {
    return this._endereco;
  }

  get cidade(): string {
    return this._cidade;
  }

  get estado(): string {
    return this._estado;
  }

  get cep(): string {
    return this._cep;
  }

  get horarioAbertura(): string {
    return this._horarioAbertura;
  }

  get horarioFechamento(): string {
    return this._horarioFechamento;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get version(): number {
    return this._version;
  }

  toPlainObject(): RestauranteProps {
    return {
      id: this._id,
      nome: this._nome,
      cnpj: this._cnpj,
      email: this._email,
      telefone: this._telefone,
      endereco: this._endereco,
      cidade: this._cidade,
      estado: this._estado,
      cep: this._cep,
      horarioAbertura: this._horarioAbertura,
      horarioFechamento: this._horarioFechamento,
      ativo: this._ativo,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
      version: this._version,
    };
  }
}