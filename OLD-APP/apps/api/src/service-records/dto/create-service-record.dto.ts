import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { ServiceType, ServicePriority } from "@prisma/client";

export class NewDeviceDto {
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsOptional()
  serialNo?: string;
}

export class CreateServiceRecordDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsOptional()
  customerAddressId?: string;

  @IsUUID()
  @IsOptional()
  deviceId?: string;

  @ValidateNested()
  @Type(() => NewDeviceDto)
  @IsOptional()
  newDevice?: NewDeviceDto;

  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;

  @IsEnum(ServicePriority)
  @IsNotEmpty()
  priority: ServicePriority;

  @IsString()
  @IsNotEmpty()
  faultDescription: string;

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
