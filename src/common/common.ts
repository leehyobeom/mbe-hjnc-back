import { ClassConstructor, plainToInstance } from 'class-transformer';
import * as crypto from 'crypto';
import { Document } from 'mongoose';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';
import { CommonErrorType } from './common-error-types';
export function isEmptyObject(obj: object): boolean {
  return !obj || Object.keys(obj).length === 0;
}

export function isEmptyString(value: string | null | undefined): boolean {
  return !value || value.trim() === '';
}

export function isNagativeInteger(value) {
  return !Number.isInteger(value) || value < 0;
}

export function riskyFunction(): string {
  if (Math.random() < 0.5) {
    throw new Error('💥 50% 확률로 발생한 에러!');
  }
  return '✅ 정상 실행됨';
}

export function isInvalidString(value: string | null | undefined): boolean {
  // 미완성 한글 포함 정규식
  const regexK = /[ㄱ-ㅎㅏ-ㅣ]/gim;
  // 유니코드 문자 정규식
  const regexU = /[\p{L}]+$/u;
  // 특수 문자 + 띄어쓰기 정규식 ( _ . 언더바,점 허용)
  const regexS = /[\{\}\[\]\/?,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"\s]/g;
  return regexS.test(value) || regexK.test(value) || !regexU.test(value);
}

export function getUniqueString() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function isInvalidName(value: string | null | undefined): boolean {
  // 미완성 한글 포함 정규식
  const regexK = /[ㄱ-ㅎㅏ-ㅣ]/gim;
  // 유니코드 문자 정규식
  const regexU = /[\p{L}]+$/u;
  // 특수 문자 + 띄어쓰기 정규식
  const regexS = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"\s]/g;
  return (
    regexS.test(value) ||
    regexK.test(value) ||
    !regexU.test(value) ||
    !!!Number(value) ||
    value?.length <= 2 ||
    value?.length >= 12
  );
}

export function isEmptyArray(value: any[] | null | undefined): boolean {
  return !Array.isArray(value) || value.length === 0;
}

export function generateRandomText(length: number): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

export function documentToClass<T>(
  classType: ClassConstructor<T>,
  document: Document,
): T {
  const result = new classType(document);

  return result;
}

export function toDouble(value: any): number {
  const num = Number(value);
  return Number.isNaN(num) ? 0.0 : parseFloat(num.toFixed(6));
}

export function parseBooleanOrThrow(value: any, field: string): boolean {
  if (value === null || value === undefined) {
    throw new HandleException(
      CommonErrorType.API_ERROR,
      `${field} 입력값이 잘못 되었습니다.`,
    );
  }

  if (typeof value === 'boolean') {
    return value;
  }

  // 문자열로 들어온 경우 ("true", "false") 처리
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }

  throw new HandleException(
    CommonErrorType.API_ERROR,
    `${field} 입력값이 잘못 되었습니다.`,
  );
}

export function parseNumberOrThrow(value: any, field: string): number {
  if (value === null || value === undefined) {
    throw new HandleException(
      CommonErrorType.API_ERROR,
      `${field} 입력값이 잘못 되었습니다.`,
    );
  }
  const num = Number(value);
  if (typeof num !== 'number' || isNaN(num)) {
    throw new HandleException(
      CommonErrorType.API_ERROR,
      `${field} 입력값이 잘못 되었습니다.`,
    );
  }
  return num;
}

export function parseDateOrThrow(value: any, field: string): Date {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new HandleException(
      CommonErrorType.API_ERROR,
      `${field} 입력값이 잘못 되었습니다.`,
    );
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new HandleException(
      CommonErrorType.API_ERROR,
      `${field} 입력값이 잘못 되었습니다.`,
    );
  }
  return date;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function checkResetUTC(date: Date): boolean {
  if (!date) {
    return true;
  }
  const todayUTCZeroAM = new Date();
  todayUTCZeroAM.setUTCHours(0, 0, 0, 0);
  const diffTime = todayUTCZeroAM.getTime() - date.getTime();
  const result = diffTime >= 0;
  return result;
}
export function getDayDiff(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
export function getHouresDiff(startDate: Date, endDate: Date): number {
  const diffTime = endDate?.getTime() - startDate?.getTime();
  const diffHoures = Math.floor(diffTime / (1000 * 60 * 60));
  return diffHoures;
}

export function getPriceString(price: number, currency: number): string {
  let currencyString = '₩';
  switch (currency) {
    case 0:
      currencyString = '₩';
      break;
    case 1:
      currencyString = '¥';
      break;
    case 2:
      currencyString = '$';
      break;
    default:
      currencyString = '₩';
      break;
  }

  return `${price} ${currencyString}`;
}

// export async function sendMessenger(message: any) {
//   if (!AppModule.MESSENGER_MODE) {
//     return;
//   }
//   try {
//     const form = new FormData();
//     form.append('message', JSON.stringify(message));
//     const response$ = AppModule.httpService.post('/', form, {});
//     await firstValueFrom(response$);
//   } catch (err) {
//     console.log(err);
//   }
// }

export class ResponseData {
  result: any;
  @ApiProperty()
  errorMessage: string;
  @ApiProperty()
  errorCode: number;
  @ApiProperty()
  serverTime: number;
}

export class ResponseFactory {
  static fromResult(result: any) {
    const response = new ResponseData();
    response.result = result;
    response.serverTime = new Date().getTime();
    return response;
  }

  static fromError(errorCode: number, errorMessage: string) {
    const response = new ResponseData();
    response.result = {
      errorCode,
      errorMessage,
    };

    response.serverTime = new Date().getTime();
    return response;
  }

  static createEmptyResponse() {
    return this.fromResult({});
  }

  static ResponseDecoration = <DataDto extends Type<unknown>>(
    dataDto: DataDto,
  ) => {
    const result: object = { $ref: getSchemaPath(dataDto) };

    return applyDecorators(
      ApiExtraModels(ResponseData, dataDto),
      ApiOkResponse({
        schema: {
          allOf: [
            { $ref: getSchemaPath(ResponseData) },
            {
              properties: {
                result,
              },
            },
          ],
        },
      }),
    );
  };
}

export class HandleException {
  code: number;
  message: string;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }
}
