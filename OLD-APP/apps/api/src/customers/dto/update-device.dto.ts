import { IsOptional, IsString } from "class-validator";

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  category?: string;

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
