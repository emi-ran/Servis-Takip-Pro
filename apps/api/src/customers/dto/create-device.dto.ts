import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  serialNo?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
