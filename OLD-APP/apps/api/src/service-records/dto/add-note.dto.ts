import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddNoteDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsBoolean()
  @IsOptional()
  isCustomerVisible?: boolean;
}
