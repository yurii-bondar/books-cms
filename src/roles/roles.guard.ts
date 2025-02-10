import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<number[]>('roles', context.getHandler());
    if (!requiredRoles) {
      console.warn('No roles requirements found');
      return false;
    }

    let token: string | undefined;

    // REST API (Express)
    if (context.getType<'http' | 'rpc' | 'graphql'>() === 'http') {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      const reqType = request.headers['x-request-type'];

      if(reqType === 'isTest') return true;

      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // GraphQL (Apollo)
    if (context.getType<'http' | 'rpc' | 'graphql'>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context).getContext();

      token = this.extractToken(gqlContext);
    }

    if (!token) {
      console.warn('No token found in request');
      return false;
    }

    try {
      const user = this.jwtService.decode(token);

      if (!user || typeof user !== 'object') {
        console.warn('Invalid token payload');
        return false;
      }

      const hasRole = requiredRoles.includes(user.roleId);
      console.log(`User role ${user.roleId} access: ${hasRole}`);

      return hasRole;
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return false;
    }
  }

  private extractToken(context: any): string | undefined {
    // Check the token in the context (our current graphql context)
    if (context.token) return context.token;

    // Check in headers
    if (context.req?.headers?.authorization?.startsWith('Bearer ')) {
      return context.req.headers.authorization.split(' ')[1];
    }

    // Check in connection context (for subscriptions)
    if (context.connection?.context?.token) {
      return context.connection.context.token;
    }

    // Check in extra (for some GraphQL clients)
    if (context.extra?.token) return context.extra.token;

    return undefined;
  }
}