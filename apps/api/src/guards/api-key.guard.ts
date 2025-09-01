import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private VALID_API_KEY: string;
  constructor(private readonly configService: ConfigService) {
    this.VALID_API_KEY =
      this.configService.get<string>('CRON_SECRET_KEY') || '';
    if (!this.VALID_API_KEY) {
      throw new Error('CRON_SECRET_KEY is not configured on the server.');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<
      FastifyRequest & {
        ['x-api-key']?: string;
      }
    >();

    const apiKey = request.headers['x-api-key'];

    if (apiKey === this.VALID_API_KEY) {
      return true;
    }

    throw new UnauthorizedException('Invalid or missing API key.');
  }
}
