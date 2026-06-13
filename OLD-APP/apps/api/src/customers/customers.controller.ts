import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Permissions } from "../common/decorators/permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // --- Customers CRUD ---

  @Post("customers")
  @Permissions("customer.create")
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(user.companyId, user.userId, dto);
  }

  @Get("customers")
  @Permissions("customer.read")
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.customersService.findAll(user.companyId, search, pageNum, limitNum);
  }

  @Get("customers/:id")
  @Permissions("customer.read")
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.findOne(user.companyId, id);
  }

  @Put("customers/:id")
  @Permissions("customer.update")
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(user.companyId, id, dto);
  }

  @Delete("customers/:id")
  @Permissions("customer.delete")
  async remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.remove(user.companyId, id);
  }

  // --- Devices Sub-resource CRUD ---

  @Post("customers/:customerId/devices")
  @Permissions("device.create")
  async createDevice(
    @CurrentUser() user: AuthenticatedUser,
    @Param("customerId") customerId: string,
    @Body() dto: CreateDeviceDto,
  ) {
    return this.customersService.createDevice(user.companyId, customerId, dto);
  }

  @Put("customers/:customerId/devices/:deviceId")
  @Permissions("device.update")
  async updateDevice(
    @CurrentUser() user: AuthenticatedUser,
    @Param("customerId") customerId: string,
    @Param("deviceId") deviceId: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.customersService.updateDevice(user.companyId, customerId, deviceId, dto);
  }

  @Delete("customers/:customerId/devices/:deviceId")
  @Permissions("device.delete")
  async removeDevice(
    @CurrentUser() user: AuthenticatedUser,
    @Param("customerId") customerId: string,
    @Param("deviceId") deviceId: string,
  ) {
    return this.customersService.removeDevice(user.companyId, customerId, deviceId);
  }

  // --- Global Devices CRUD ---

  @Get("devices")
  @Permissions("device.read")
  async findAllDevices(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.customersService.findAllDevices(user.companyId, search, pageNum, limitNum);
  }

  @Get("devices/:id")
  @Permissions("device.read")
  async findOneDevice(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.findOneDevice(user.companyId, id);
  }
}
