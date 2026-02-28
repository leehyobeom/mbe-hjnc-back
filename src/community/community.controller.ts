import {
  Body,
  Controller,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { Types } from 'mongoose';
import { ApiOperation } from '@nestjs/swagger';
import {
  ResponseFactory,
} from 'src/common/common';
import {
  ResponseCreateCommunityDto,
  RequestCreateCommunityDto,
  ResponseReadCommunityDto,
  RequestReadCommunityDto,
  ResponseReadListCommunityDto,
  RequestReadListCommunityDto,
  RequestUpdateCommunityDto,
  ResponseUpdateCommunityDto,
  ResponseDeleteCommunityDto,
  RequestDeleteCommunityDto,
} from './models/community.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) { }
  @Put('/create')
  @ApiOperation({
    summary: '게시글 정보 생성',
    description: `게시글 정보를 생성 한다
    \n\n- 언제: 게시글 생성 버튼 클릭시
    \n\n- 누가: 일반 유저
    \n\n- 목적: 게시글 정보를 생성 하기 위해`,
  })
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseFactory.ResponseDecoration(ResponseCreateCommunityDto)
  async createCommunity(
    @Body() dto: RequestCreateCommunityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let result: ResponseCreateCommunityDto;
    result = await this.communityService.createCommunity(
      dto,
      files,
    );
    return ResponseFactory.fromResult(result);
  }

  @Put('/update')
  @ApiOperation({
    summary: '게시글 정보 수정',
    description: `게시글 정보를 수정 한다
    \n\n- 언제: 게시글 수정 버튼 클릭시
    \n\n- 누가: 일반 유저
    \n\n- 목적: 게시글 정보를 수정 하기 위해`,
  })
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseFactory.ResponseDecoration(ResponseUpdateCommunityDto)
  async updateCommunity(
    @Body() dto: RequestUpdateCommunityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let result: ResponseUpdateCommunityDto;
    result = await this.communityService.updateCommunity(
      dto,
      files,
    );
    return ResponseFactory.fromResult(result);
  }

  @Put('/read')
  @ApiOperation({
    summary: '게시글 정보',
    description: `게시글 정보를 불러온다.
    \n\n- 언제: 게시글 목록 중 클릭시
    \n\n- 누가: 모든 유저
    \n\n- 목적: 게시글 정보를 보기 위해`,
  })
  @ResponseFactory.ResponseDecoration(ResponseReadCommunityDto)
  async readCommunity(
    @Body() dto: RequestReadCommunityDto,
  ) {
    const result = await this.communityService.readCommunity(dto);
    return ResponseFactory.fromResult(result);
  }

  @Put('/delete')
  @ApiOperation({
    summary: '게시글 정보',
    description: `게시글 정보를 불러온다.
    \n\n- 언제: 게시글 목록 중 클릭시
    \n\n- 누가: 모든 유저
    \n\n- 목적: 게시글 정보를 보기 위해`,
  })
  @ResponseFactory.ResponseDecoration(ResponseDeleteCommunityDto)
  async deleteCommunity(
    @Body() dto: RequestDeleteCommunityDto,
  ) {
    const result = await this.communityService.deleteCommunity(dto);
    return ResponseFactory.fromResult(result);
  }


  @Put('/read/list')
  @ApiOperation({
    summary: '전체 게시글 목록',
    description: `전체 게시글 목록을 가져온다.
    \n\n- 언제: 하단의 게시글 탭 클릭시
    \n\n- 누가: 모든 유저
    \n\n- 목적: 전체 게시글 목록을 보기 위해.`,
  })
  @ResponseFactory.ResponseDecoration(ResponseReadListCommunityDto)
  async readCommunityList(
    @Body() dto: RequestReadListCommunityDto,
  ) {
    const result = await this.communityService.readCommunityList(
      dto,
    );
    return ResponseFactory.fromResult(result);
  }
}
