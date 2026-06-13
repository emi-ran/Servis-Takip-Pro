import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { ServiceType, ServicePriority } from "@prisma/client";

export class UpdateServiceRecordDto {
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  customerAddressId?: string;

  @IsUUID()
  @IsOptional()
  deviceId?: string;

  @IsEnum(ServiceType)
  @IsOptional()
  serviceType?: ServiceType;

  @IsEnum(ServicePriority)
  @IsOptional()
  priority?: ServicePriority;

  @IsString()
  @IsOptional()
  faultDescription?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  internalNote?: string;

  @IsString()
  @IsOptional()
  customerVisibleNote?: string;

  @IsUUID()
  @IsOptional()
  assignedUserId?: string;

  @IsString()
  @IsOptional()
  appointmentAt?: string;
}
