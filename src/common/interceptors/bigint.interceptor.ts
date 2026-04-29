import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.serializeBigInt(data)))
  }

  private serializeBigInt(data: any): any {
    if (data === null || data === undefined) return data

    if (typeof data === 'bigint') {
      return data.toString()
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.serializeBigInt(item))
    }

    if (typeof data === 'object' && data.constructor === Object) {
      const result: Record<string, any> = {}
      for (const key of Object.keys(data)) {
        result[key] = this.serializeBigInt(data[key])
      }
      return result
    }

    return data
  }
}
