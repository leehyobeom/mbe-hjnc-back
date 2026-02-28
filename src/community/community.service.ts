import { Injectable } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import {
  RequestCreateCommunityDto,
  ResponseCreateCommunityDto,
  RequestReadCommunityDto,
  ResponseReadCommunityDto,
  RequestReadListCommunityDto,
  ResponseReadListCommunityDto,
  RequestUpdateCommunityDto,
  ResponseUpdateCommunityDto,
  CommunityDto,
  RequestDeleteCommunityDto,
  ResponseDeleteCommunityDto,
  ChangedImageUrlDto,
} from './models/community.dto';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import {
  HandleException,
  isEmptyString,
} from 'src/common/common';
import { CommonErrorType } from 'src/common/common-error-types';
import { Community, CommunityDocument } from './models/community.schema';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name)
    private communityModel: Model<CommunityDocument>,
    @InjectConnection()
    private readonly connection: Connection,
    private configService: ConfigService,
  ) { }

  /* =========================================================
     CREATE
  ========================================================= */

  async createCommunity(
    dto: RequestCreateCommunityDto,
    files: Express.Multer.File[],
  ): Promise<ResponseCreateCommunityDto> {

    const query = { ...dto };
    const _id = new Types.ObjectId();
    query['_id'] = _id;
    query['status'] = 1;

    const objectIdStr = _id.toString();
    const imagesRootPath = path.join(process.cwd(), 'dbFiles');
    const targetDir = path.join(imagesRootPath, objectIdStr);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const timestamp = Date.now();
    const savedImagePaths: string[] = [];

    for (const [index, file] of files.entries()) {

      const ext = path.extname(file.originalname);
      const fileName = `${index + 1}-${timestamp}${ext}`;
      const savePath = path.join(targetDir, fileName);

      await fs.promises.writeFile(
        savePath,
        file.buffer as Uint8Array,
      );

      savedImagePaths.push(
        `dbFiles/${objectIdStr}/${fileName}`
      );
    }

    query['images'] = savedImagePaths;

    try {
      const communityDocument =
        await this.communityModel.create(query);

      return new ResponseCreateCommunityDto(
        communityDocument,
      );

    } catch (error) {
      throw new HandleException(
        CommonErrorType.TRANSACTION_ERROR,
        `createCommunity error: ${error.message}`,
      );
    }
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  async updateCommunity(
    dto: RequestUpdateCommunityDto,
    files: Express.Multer.File[],
  ): Promise<ResponseUpdateCommunityDto> {

    try {
      // 문자열 → 배열 파싱
      let safeChanged: ChangedImageUrlDto[] = [];
      let safeDeleted: string[] = [];

      try {
        safeChanged = dto.changedImages
          ? JSON.parse(dto.changedImages)
          : [];
      } catch {
        safeChanged = [];
      }

      try {
        safeDeleted = dto.deletedImages
          ? JSON.parse(dto.deletedImages)
          : [];
      } catch {
        safeDeleted = [];
      }

      const objectId = new Types.ObjectId(dto.communityId);

      const community =
        await this.communityModel.findById(objectId);

      if (!community) {
        throw new Error('Community not found');
      }

      const folderPath = path.join(
        process.cwd(),
        'dbFiles',
        dto.communityId,
      );

      if (!fs.existsSync(folderPath)) {
        await fs.promises.mkdir(folderPath, {
          recursive: true,
        });
      }

      const safeFiles = files || [];

      /* ---------- 삭제 처리 ---------- */

      for (const deleted of safeDeleted) {
        if (!deleted) continue;

        const fullPath = path.join(
          process.cwd(),
          deleted,
        );

        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
        }
      }

      /* ---------- index 기반 배열 구성 ---------- */

      const maxIndex =
        safeChanged.length > 0
          ? Math.max(...safeChanged.map(i => i.index))
          : -1;

      const finalLength =
        Math.max(
          maxIndex + 1,
          safeChanged.length + safeFiles.length,
        );

      const finalImages: (string | null)[] =
        new Array(finalLength).fill(null);

      // 기존 이미지 배치
      for (const item of safeChanged) {
        if (
          item &&
          typeof item.index === 'number' &&
          typeof item.url === 'string'
        ) {
          finalImages[item.index] = item.url;
        }
      }

      // 빈 자리 새 파일 채우기
      let fileCursor = 0;

      for (let i = 0; i < finalImages.length; i++) {

        if (finalImages[i] === null) {

          const file = safeFiles[fileCursor++];
          if (!file) continue;

          const ext = path.extname(file.originalname);
          const tempName =
            `temp_${Date.now()}_${i}${ext}`;

          const tempPath = path.join(
            folderPath,
            tempName,
          );

          await fs.promises.writeFile(
            tempPath,
            file.buffer as Uint8Array,
          );

          finalImages[i] =
            `dbFiles/${dto.communityId}/${tempName}`;
        }
      }

      /* ---------- 파일명 통일 (index-timestamp) ---------- */

      const timestamp = Date.now();
      const cleanedImages: string[] = [];

      for (let i = 0; i < finalImages.length; i++) {

        const relativePath = finalImages[i];
        if (!relativePath) continue;

        const oldFullPath = path.join(
          process.cwd(),
          relativePath,
        );

        if (!fs.existsSync(oldFullPath)) continue;

        const ext = path.extname(oldFullPath);
        const newFileName =
          `${i + 1}-${timestamp}${ext}`;

        const newFullPath = path.join(
          folderPath,
          newFileName,
        );

        await fs.promises.rename(
          oldFullPath,
          newFullPath,
        );

        cleanedImages.push(
          `dbFiles/${dto.communityId}/${newFileName}`,
        );
      }

      /* ---------- DB 업데이트 ---------- */

      const updated =
        await this.communityModel.findOneAndUpdate(
          { _id: objectId },
          {
            title: dto.title,
            text: dto.text,
            vesselCode: dto.vesselCode,
            bay: dto.bay,
            isHold: dto.isHold === 'true',
            isLD: dto.isLD === 'true',
            images: cleanedImages,
          },
          { new: true },
        );

      return new ResponseUpdateCommunityDto(
        updated,
      );

    } catch (error) {
      throw new HandleException(
        CommonErrorType.TRANSACTION_ERROR,
        `updateCommunity error: ${error.message}`,
      );
    }
  }

  /* =========================================================
     READ / DELETE / LIST (기존 그대로)
  ========================================================= */

  async readCommunity(
    dto: RequestReadCommunityDto,
  ): Promise<ResponseReadCommunityDto> {

    try {
      const communityDocument =
        await this.communityModel.findOne({
          _id: new Types.ObjectId(dto.communityId),
        });

      const result =
        new ResponseReadCommunityDto(
          communityDocument,
        );

      result.updatedAt = communityDocument.updatedAt;

      return result;

    } catch (error) {
      throw new HandleException(
        CommonErrorType.TRANSACTION_ERROR,
        `readCommunity error: ${error.message}`,
      );
    }
  }

  async deleteCommunity(
    dto: RequestDeleteCommunityDto,
  ): Promise<ResponseDeleteCommunityDto> {

    try {
      const objectId =
        new Types.ObjectId(dto.communityId);

      const communityDocument =
        await this.communityModel.findOne({
          _id: objectId,
        });

      if (!communityDocument) {
        throw new HandleException(
          CommonErrorType.TRANSACTION_ERROR,
          'Community not found',
        );
      }

      const folderPath = path.join(
        process.cwd(),
        'dbFiles',
        dto.communityId,
      );

      if (fs.existsSync(folderPath)) {
        await fs.promises.rm(folderPath, {
          recursive: true,
          force: true,
        });
      }

      await this.communityModel.deleteOne({
        _id: objectId,
      });

      return new ResponseDeleteCommunityDto(
        communityDocument,
      );

    } catch (error) {
      throw new HandleException(
        CommonErrorType.TRANSACTION_ERROR,
        `deleteCommunity error: ${error.message}`,
      );
    }
  }

  async readCommunityList(
    dto: RequestReadListCommunityDto,
  ): Promise<ResponseReadListCommunityDto> {

    const { page, search } = dto;
    const result =
      new ResponseReadListCommunityDto();

    try {

      const match_search: any = {};

      if (!isEmptyString(search)) {
        const searchTrim = search.trim();
        match_search.$or = [
          { title: { $regex: searchTrim, $options: 'i' } },
          { text: { $regex: searchTrim, $options: 'i' } },
          { vesselCode: { $regex: searchTrim, $options: 'i' } },
          { bay: { $regex: searchTrim, $options: 'i' } },
        ];
      }

      const baseFind = this.communityModel
        .find(match_search)
        .sort({ updatedAt: -1 })
        .lean();

      let documents: any[];

      if (page < 0) {
        documents = await baseFind.limit(20).exec();
      } else {
        documents = await baseFind
          .skip(page * 20)
          .limit(20)
          .exec();
      }

      result.communities = documents.map(
        (x: any) => new CommunityDto(x),
      );

      return result;

    } catch (error) {
      throw new HandleException(
        CommonErrorType.TRANSACTION_ERROR,
        `readCommunityList error: ${error.message}`,
      );
    }
  }
}