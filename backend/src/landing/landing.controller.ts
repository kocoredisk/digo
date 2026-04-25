import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { LandingService } from './landing.service';
import { JwtAuthGuard } from '../auth/session.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  // Landing Sources
  @Get('landing-sources')
  async getLandingSources() {
    return this.landingService.getLandingSources();
  }

  @Post('landing-sources')
  async createLandingSource(@Body() body: any) {
    return this.landingService.createLandingSource(body);
  }

  @Put('landing-sources/:id')
  async updateLandingSource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.landingService.updateLandingSource(id, body);
  }

  @Delete('landing-sources/:id')
  async deleteLandingSource(@Param('id', ParseIntPipe) id: number) {
    return this.landingService.deleteLandingSource(id);
  }

  // Landing Mappings
  @Get('landing-mappings')
  async getLandingMappings() {
    return this.landingService.getLandingMappings();
  }

  @Post('landing-mappings')
  async createLandingMapping(@Body() body: any) {
    return this.landingService.createLandingMapping(body);
  }

  @Put('landing-mappings/:id')
  async updateLandingMapping(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.landingService.updateLandingMapping(id, body);
  }

  @Delete('landing-mappings/:id')
  async deleteLandingMapping(@Param('id', ParseIntPipe) id: number) {
    return this.landingService.deleteLandingMapping(id);
  }

  // Thumbnail upload
  @Post('landing-thumbnail-upload')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = path.join(process.cwd(), 'public/landing-thumbnails');
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          cb(null, `thumbnail-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadThumbnail(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { url: null };
    }
    return { url: `/landing-thumbnails/${file.filename}` };
  }
}
