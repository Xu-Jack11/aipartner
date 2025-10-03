import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ProgressController } from "./progress.controller";
import { ProgressService } from "./progress.service";

@Module({
  controllers: [ProgressController],
  exports: [ProgressService],
  imports: [PrismaModule],
  providers: [ProgressService],
})
export class ProgressModule {}
