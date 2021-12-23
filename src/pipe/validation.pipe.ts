import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { Logger } from '../utils/log4js'

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    console.log('value: ', value, 'metadata: ', metadata)
    if (!metadata.metatype || !ValidationPipe.toValidate(metadata.metatype)) {
      // 如果没有传入验证规则, 则不验证, 直接返回数据
      return value
    }
    // 将对象装换为Class来验证
    const object = plainToInstance(metadata.metatype, value)
    const errors = await validate(object)
    if (errors.length > 0) {
      const msg = Object.values(errors[0].constraints)[0]
      Logger.error(`Validation failed: ${msg}`)
      throw new BadRequestException(`Validation failed: ${msg}`)
    }
    return value
  }

  private static toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }
}
