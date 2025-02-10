import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    if (host.getType<GqlContextType>() === 'graphql') {
      const gqlContext = gqlHost.getContext();
      const errorResponse = {
        statusCode: exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        path: gqlContext.req?.url || 'GraphQL operation',
      };

      console.error('🔥 GraphQL Exception:', errorResponse);

      return exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      message: exception.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    console.error('🔥 REST Exception:', errorResponse);

    return response.status(status).json(errorResponse);
  }
}
