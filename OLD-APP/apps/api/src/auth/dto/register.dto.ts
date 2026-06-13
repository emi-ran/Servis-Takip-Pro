import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class RegisterDto {
  @IsNotEmpty({ message: "Firma adı boş bırakılamaz." })
  @IsString()
  companyName: string;

  @IsNotEmpty({ message: "Firma kısa kodu (slug) boş bırakılamaz." })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "Slug sadece küçük harf, rakam ve tire içerebilir." })
  slug: string;

  @IsNotEmpty({ message: "Ad soyad alanı boş bırakılamaz." })
  @IsString()
  name: string;

  @IsEmail({}, { message: "Geçerli bir e-posta adresi giriniz." })
  @IsNotEmpty({ message: "E-posta alanı boş bırakılamaz." })
  email: string;

  @IsNotEmpty({ message: "Şifre alanı boş bırakılamaz." })
  @MinLength(6, { message: "Şifre en az 6 karakter olmalıdır." })
  password: string;
}
