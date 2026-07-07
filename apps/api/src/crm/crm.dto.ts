import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  leadSource?: string;

  @IsString()
  @IsOptional()
  projectType?: string;

  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}

export class UpdateClientDto extends CreateClientDto {}
