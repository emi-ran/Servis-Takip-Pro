import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Permissions } from "../common/decorators/permissions.decorator";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { ServiceRecordsService } from "./service-records.service";
import { CreateServiceRecordDto } from "./dto/create-service-record.dto";
import { UpdateServiceRecordDto } from "./dto/update-service-record.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { AddNoteDto } from "./dto/add-note.dto";

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ServiceRecordsController {
  constructor(private readonly serviceRecordsService: ServiceRecordsService) {}

  @Post("service-records")
  @Permissions("service.create")
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateServiceRecordDto) {
    return this.serviceRecordsService.create(user.companyId, user.userId, dto);
  }

  @Get("service-records")
  @Permissions("service.read")
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("priority") priority?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.serviceRecordsService.findAll(user.companyId, search, status, priority, pageNum, limitNum);
  }

  @Get("service-records/:id")
  @Permissions("service.read")
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.serviceRecordsService.findOne(user.companyId, id);
  }

  @Put("service-records/:id")
  @Permissions("service.update")
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateServiceRecordDto,
  ) {
    return this.serviceRecordsService.update(user.companyId, id, dto);
  }

  @Delete("service-records/:id")
  @Permissions("service.delete")
  async remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.serviceRecordsService.remove(user.companyId, id);
  }

  @Put("service-records/:id/status")
  @Permissions("service.update")
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.serviceRecordsService.updateStatus(user.companyId, id, user.userId, dto);
  }

  @Get("service-records/:id/timeline")
  @Permissions("service.read")
  async getTimeline(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.serviceRecordsService.getTimeline(user.companyId, id);
  }

  @Post("service-records/:id/notes")
  @Permissions("service.update")
  async addNote(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AddNoteDto,
  ) {
    return this.serviceRecordsService.addNote(user.companyId, id, user.userId, dto);
  }

  @Get("service-records/:id/notes")
  @Permissions("service.read")
  async getNotes(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.serviceRecordsService.getNotes(user.companyId, id);
  }

  @Post("service-records/:id/assign/:staffUserId")
  @Permissions("service.update")
  async assignStaff(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("staffUserId") staffUserId: string,
    @Body("note") note?: string,
  ) {
    return this.serviceRecordsService.assignStaff(user.companyId, id, user.userId, staffUserId, note);
  }
}
