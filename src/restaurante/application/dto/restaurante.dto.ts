import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MaxLength,
  Length,
  Matches,
  IsBoolean,
} from 'class-validator';

export class CriarRestauranteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
  })
  cnpj: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @Length(2, 2)
  estado: string;

  @IsString()
  @Matches(/^\d{5}-\d{3}$/, {
    message: 'CEP deve estar no formato XXXXX-XXX',
  })
  cep: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Horário deve estar no formato HH:mm',
  })
  horarioAbertura: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Horário deve estar no formato HH:mm',
  })
  horarioFechamento: string;
}

export class AtualizarRestauranteDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nome?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  endereco?: string;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  estado?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{5}-\d{3}$/, {
    message: 'CEP deve estar no formato XXXXX-XXX',
  })
  cep?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Horário deve estar no formato HH:mm',
  })
  horarioAbertura?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Horário deve estar no formato HH:mm',
  })
  horarioFechamento?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}

export class RestauranteResponseDto {
  id: string;
  nome: string;
  cnpj: string;
  email: string | null;
  telefone: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  horarioAbertura: string;
  horarioFechamento: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;

  static fromEntity(entity: any): RestauranteResponseDto {
    const dto = new RestauranteResponseDto();
    dto.id = entity.id;
    dto.nome = entity.nome;
    dto.cnpj = entity.cnpj;
    dto.email = entity.email;
    dto.telefone = entity.telefone;
    dto.endereco = entity.endereco;
    dto.cidade = entity.cidade;
    dto.estado = entity.estado;
    dto.cep = entity.cep;
    dto.horarioAbertura = entity.horarioAbertura;
    dto.horarioFechamento = entity.horarioFechamento;
    dto.ativo = entity.ativo;
    dto.createdAt =
      entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt;
    dto.updatedAt =
      entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt;
    return dto;
  }
}
