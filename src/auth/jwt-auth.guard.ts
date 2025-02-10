import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    // If it is GraphQL, take the context from GraphQLExecutionContext
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // If this is REST, take a regular request
    return request || context.switchToHttp().getRequest();
  }
}
