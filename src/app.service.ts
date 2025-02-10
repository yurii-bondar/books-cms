import { Injectable } from '@nestjs/common';

import pckg from '../package.json';

@Injectable()
export class AppService {
  private readonly startDate: string;

  constructor() {
    this.startDate = new Date().toLocaleString('uk-UA');
  }

  about() {
    return {
      name: pckg.name,
      version: pckg.version,
      description: pckg.description,
      dateNow: new Date().toLocaleString('uk-UA'),
      startDate: this.startDate,
    };
  }
}
