import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ServiceStatus } from "@prisma/client";

export class UpdateStatusDto {
  @IsEnum(ServiceStatus)
  @IsNotEmpty()
  status: ServiceStatus;

  @IsString()
  @IsOptional()
  note?: string;
}
