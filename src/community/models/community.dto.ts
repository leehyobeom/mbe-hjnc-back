import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBooleanString } from 'class-validator';
import { Types } from 'mongoose';
export class CommunityDto {
  @ApiProperty({ description: '게시글 ID' })
  communityId: string;

  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  text: string;

  @ApiProperty({ description: '게시글 사진 경로' })
  images: string[];

  @ApiProperty({ description: '베셀 코드' })
  vesselCode: string;

  @ApiProperty({ description: '베이 번호' })
  bay: string;

  @ApiProperty({ description: '홀드/데크' })
  isHold: boolean;

  @ApiProperty({ description: '선적/양하' })
  isLD: boolean;

  @ApiProperty({ description: '업데이트 날짜' })
  updatedAt: Date;

  constructor(document?) {
    if (!document) {
      return;
    }
    this.communityId = document._id;
    this.title = document.title;
    this.text = document.text;
    this.images = document.images;
    this.vesselCode = document.vesselCode;
    this.bay = document.bay;
    this.isHold = document.isHold;
    this.isLD = document.isLD;
    this.updatedAt = document.updatedAt;
  }
}

export class RequestCreateCommunityDto {
  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  text: string;

  @ApiProperty({ description: '게시글 사진 경로' })
  images: string[];

  @ApiProperty({ description: '베셀 코드' })
  vesselCode: string;

  @ApiProperty({ description: '베이 번호' })
  bay: string;

  @Type(() => Boolean)
  isHold: boolean;

  @Type(() => Boolean)
  isLD: boolean;
}
export class ResponseCreateCommunityDto extends CommunityDto { }

export class RequestUpdateCommunityDto {
  @ApiProperty({ description: '게시글 ID' })
  communityId: string;

  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  text: string;

  @ApiProperty({ description: '베셀 코드' })
  vesselCode: string;

  @ApiProperty({ description: '베이 번호' })
  bay: string;

  isHold: string;

  isLD: string;

  @ApiProperty({ description: '삭제할 image path' })
  deletedImages: string

  @ApiProperty({ description: '수정할 image path' })
  changedImages: string;
}

export class ChangedImageUrlDto {
  @ApiProperty({ description: '변경할 인덱스' })
  index: number;

  @ApiProperty({ description: '변경 대상 url' })
  url: string;
}

export class ResponseUpdateCommunityDto extends CommunityDto { }

export class RequestReadCommunityDto {
  @ApiProperty({ description: '게시글 ID' })
  communityId: string;
}
export class ResponseReadCommunityDto extends CommunityDto { }

export class RequestReadListCommunityDto {
  @ApiProperty({ description: '검색 단어' })
  search: string;

  @ApiProperty({ description: '리스트 페이지 넘버' })
  page: number;
}

export class ResponseReadListCommunityDto {
  @ApiProperty({ description: '게시글 목록' })
  communities: CommunityDto[] = [];
}

export class RequestDeleteCommunityDto {
  @ApiProperty({ description: '게시글 ID' })
  communityId: string;
}
export class ResponseDeleteCommunityDto extends CommunityDto { }
