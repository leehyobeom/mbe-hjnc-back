import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Community {
  @ApiProperty({ description: '게시글 제목' })
  @Prop()
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  @Prop()
  text: string;

  @ApiProperty({ description: '게시글 사진 경로' })
  @Prop()
  images: string[];

  @ApiProperty({ description: '베셀 코드' })
  @Prop()
  vesselCode: string;

  @ApiProperty({ description: '베이 번호' })
  @Prop()
  bay: string;

  @ApiProperty({ description: '홀드/데크' })
  @Prop({ default: true })
  isHold: boolean;

  @ApiProperty({ description: '선적/양하' })
  @Prop({ default: true })
  isLD: boolean;

  @ApiProperty({ description: '업데이트 날짜' })
  @Prop()
  updatedAt: Date;

  @ApiProperty({ description: '생성 날짜' })
  @Prop()
  createdAt: Date;
}

export type CommunityDocument = Community & Document;
export const CommunitySchema = SchemaFactory.createForClass(Community);
