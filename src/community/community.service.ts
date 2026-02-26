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
} from './models/community.dto';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import * as _ from 'lodash';
import {
  HandleException,
  isEmptyString,
} from 'src/common/common';

import { CommonErrorType } from 'src/common/common-error-types';
import { Community, CommunityDocument } from './models/community.schema';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

//import { types } from 'util';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name)
    private communityModel: Model<CommunityDocument>,
    @InjectConnection()
    private readonly connection: Connection,
    private configService: ConfigService,
  ) {
  }


  async createCommunity(
    dto: RequestCreateCommunityDto,
    files: Express.Multer.File[],
  ): Promise<ResponseCreateCommunityDto> {

    const query = { ...dto };

    const _id = new Types.ObjectId();
    query['_id'] = _id;
    query['status'] = 1;

    const objectIdStr = _id.toString();

    // dist 기준 상위 경로
    // const rootPath = path.join(__dirname, '../../..');
    // const imagesRootPath = path.join(rootPath, 'images');
    const imagesRootPath = path.join(process.cwd(), 'dbFiles');
    const targetDir = path.join(imagesRootPath, objectIdStr);

    // images/{objectId} 폴더 생성
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const today = new Date();
    const yymmdd =
      today.getFullYear().toString().slice(2) +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');

    const savedImagePaths: string[] = [];
    for (const [index, file] of files.entries()) {

      const ext = path.extname(file.originalname);
      const fileName = `${index + 1}-${yymmdd}${ext}`;
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
      const communityDocument = await this.communityModel.create(query);
      return new ResponseCreateCommunityDto(communityDocument);
    } catch (error) {
      throw new HandleException(
        CommonErrorType.TRANSACTION_ERROR,
        `createCommunity중 데이터 문제가 발생 하였습니다. error:${error.message}`,
      );
    }
  }

  async updateCommunity(
    dto: RequestUpdateCommunityDto,
    files: Express.Multer.File[],
  ): Promise<ResponseUpdateCommunityDto> {
    // const changedImageUrls: ChangedImageUrlDto[] = JSON.parse(
    //   dto.changedImages,
    // );
    const timestamp = new Date().getTime();
    //const deletedImageUrls: string[] = JSON.parse(dto.deletedImages);
    const imageUrls: string[] = [];
    const imageLength = dto.changedImages.length + files.length;
    const query = {
      title: dto.title,
      text: dto.text,
    };

    // for (const deletedImageUrl of deletedImageUrls) {
    //   const currentKey = this.uploadService.extractKeyFromUrl(deletedImageUrl);
    //   await this.uploadService.deleteFile(currentKey);
    // }
    // for (let i = 0; i < imageLength; i++) {
    //   const changedImageUrl = changedImageUrls.find((x) => x.index === i);
    //   if (changedImageUrl) {
    //     const oldUrl = changedImageUrl.url;
    //     const currentKey = this.uploadService.extractKeyFromUrl(oldUrl);
    //     const ext = currentKey.split('.').pop();
    //     const newKey = `community/${String(tokenUserId)}/${String(dto.communityId)}/${timestamp}_${i}.${ext}`;
    //     await this.uploadService.changeFileName(currentKey, newKey);
    //     imageUrls.push(this.uploadService.getUrl(newKey));
    //     continue;
    //   }
    //   const file = files.shift();
    //   const ext = file.originalname.split('.').pop();
    //   const newKey = `community/${String(tokenUserId)}/${String(dto.communityId)}/${timestamp}_${i}.${ext}`;
    //   await this.uploadService.uploadFile(
    //     file.buffer,
    //     file.originalname,
    //     newKey,
    //   );
    //   imageUrls.push(this.uploadService.getUrl(newKey));
    // }
    // query['mainImageUrl'] = imageUrls.shift();
    // query['subImageUrl'] = imageUrls;
    try {
      const communityDocument = await this.communityModel.findOneAndUpdate(
        { _id: dto.communityId },
        query,
        {
          new: true,
        },
      );

      const result = new ResponseReadCommunityDto(communityDocument);
      return result;
    } catch (error) {
      throw new HandleException(
        CommonErrorType.TRANSACTION_ERROR,
        `createCommunity중 데이터 문제가 발생 하였습니다. error:${error.message}`,
      );
    }
  }


  async readCommunity(
    dto: RequestReadCommunityDto,
  ): Promise<ResponseReadCommunityDto> {
    try {
      const communityDocument = await this.communityModel.findOne({
        _id: new Types.ObjectId(dto.communityId),
      });
      const result = new ResponseReadCommunityDto(communityDocument);
      result.updatedAt = communityDocument.updatedAt;
      return result;
    } catch (error) {
      throw new HandleException(
        CommonErrorType.TRANSACTION_ERROR,
        `readCommunity중 데이터 문제가 발생 하였습니다. error:${error.message}`,
      );
    }
  }


  async readCommunityList(
    dto: RequestReadListCommunityDto,
  ): Promise<ResponseReadListCommunityDto> {
    const { page, search } = dto;
    const reuslt = new ResponseReadListCommunityDto();

    try {

      const match_search: any = {
      };

      if (!isEmptyString(search)) {
        const searchTrim = search.trim();
        match_search.$or = [
          { title: { $regex: searchTrim, $options: 'i' } }, // ✅ 대소문자 무시
          { author: { $regex: searchTrim, $options: 'i' } },
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
      const communityList: CommunityDto[] = documents.map(
        (x: any) => {
          const result = new CommunityDto(x);
          return result;
        },
      );
      reuslt.communities = communityList;
      return reuslt;
    } catch (error) {
      throw new HandleException(
        CommonErrorType.TRANSACTION_ERROR,
        `readCommunityList중 데이터 문제가 발생 하였습니다. error:${error.message}`,
      );
    }
  }
}
