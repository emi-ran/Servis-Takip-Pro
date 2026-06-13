import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    // Admin has bypass
    if (user.role === "ADMIN") {
      return true;
    }

    // Fetch the role with permissions, either tenant specific or global
    const roleWithPermissions: any = await this.prisma.role.findFirst({
      where: {
        key: user.role,
        OR: [
          { companyId: user.companyId },
          { companyId: null },
        ],
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!roleWithPermissions) {
      return false;
    }

    const userPermissions = roleWithPermissions.rolePermissions.map((rp: any) => rp.permission.key);

    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }
}
