import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CompanyStatus, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException("Bu e-posta adresi zaten kullanımda.");
    }

    const existingCompany = await this.prisma.company.findUnique({
      where: { slug: dto.slug },
    });
    if (existingCompany) {
      throw new ConflictException("Bu firma kısa kodu (slug) zaten kullanımda.");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Run transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Create company
      const company = await tx.company.create({
        data: {
          name: dto.companyName,
          slug: dto.slug,
          status: CompanyStatus.ACTIVE,
          defaultLocale: "tr",
          currency: "TRY",
        },
      });

      // 2. Find system ADMIN role to copy permissions
      const systemAdminRole = await tx.role.findFirst({
        where: { companyId: null, key: "ADMIN" },
      });
      if (!systemAdminRole) {
        throw new InternalServerErrorException("Sistem yöneticisi rolü bulunamadı.");
      }

      // 3. Create company admin role copy
      const adminRole = await tx.role.create({
        data: {
          companyId: company.id,
          key: "ADMIN",
          name: "Firma Sahibi / Admin",
          description: "Firma Sahibi Rolü",
          isSystem: false,
        },
      });

      // 4. Fetch all permissions linked to system admin role
      const systemRolePermissions = await tx.rolePermission.findMany({
        where: { roleId: systemAdminRole.id },
      });

      // 5. Link all permissions to the new company admin role copy
      for (const sp of systemRolePermissions) {
        await tx.rolePermission.create({
          data: {
            roleId: adminRole.id,
            permissionId: sp.permissionId,
          },
        });
      }

      // 6. Create user
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          status: UserStatus.ACTIVE,
          locale: "tr",
        },
      });

      // 7. Link user to company
      const companyUser = await tx.companyUser.create({
        data: {
          companyId: company.id,
          userId: user.id,
          roleId: adminRole.id,
          isOwner: true,
          status: UserStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user.id, company.id, "ADMIN");

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
        },
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
        },
        accessToken,
        refreshToken,
      };
    });
  }

  async login(dto: LoginDto) {
    const isAdminEnv =
      process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      dto.email === process.env.ADMIN_EMAIL &&
      dto.password === process.env.ADMIN_PASSWORD;

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        companyUsers: {
          include: {
            company: true,
            role: true,
          },
        },
      },
    });

    if (!user || user.status === UserStatus.DELETED || user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException("Kullanıcı adı veya şifre hatalı.");
    }

    if (!isAdminEnv) {
      const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
      if (!passwordMatch) {
        throw new UnauthorizedException("Kullanıcı adı veya şifre hatalı.");
      }
    }

    // Get active/default membership
    const membership = user.companyUsers.find((cu) => cu.status === UserStatus.ACTIVE);
    if (!membership) {
      throw new UnauthorizedException("Bu kullanıcının aktif bir firma üyeliği bulunamadı.");
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      membership.companyId,
      membership.role.key,
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
      company: {
        id: membership.company.id,
        name: membership.company.name,
        slug: membership.company.slug,
      },
      accessToken,
      refreshToken,
    };
  }

  private async generateTokens(userId: string, companyId: string, roleKey: string) {
    const payload = {
      sub: userId,
      companyId,
      role: roleKey,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || "access-secret",
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
