import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export interface PurifyConfig {
  skipKeys?: string[];
  maxDepth?: number;
  purifyOptions?: {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
    ALLOW_DATA_ATTR?: boolean;
    USE_PROFILES?: {
      html?: boolean;
      svg?: boolean;
      svgFilters?: boolean;
      mathMl?: boolean;
    };
    RETURN_DOM?: boolean;
    RETURN_DOM_FRAGMENT?: boolean;
    RETURN_TRUSTED_TYPE?: boolean;
  };
}

@Injectable()
export class DOMPurifyPipe implements PipeTransform {
  private readonly defaultConfig: PurifyConfig = {
    skipKeys: ['password', 'token', 'secret'],
    maxDepth: 10,
    purifyOptions: {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li', 'ol'],
      ALLOWED_ATTR: ['href', 'target', 'class', 'id'],
      ALLOW_DATA_ATTR: false,
      USE_PROFILES: {
        html: true,
        svg: false,
        svgFilters: false,
        mathMl: false
      }
    }
  };

  constructor(private readonly config: PurifyConfig = {}) {
    this.config = {
      ...this.defaultConfig,
      ...config,
      purifyOptions: {
        ...this.defaultConfig.purifyOptions,
        ...config.purifyOptions
      }
    };
  }

  transform(value: any, metadata: ArgumentMetadata) {
    return this.sanitizeValue(value);
  }

  private sanitizeValue(value: any, depth: number = 0): any {
    if (depth > this.config.maxDepth) return value;

    if (typeof value === 'string') {
      return DOMPurify.sanitize(value, this.config.purifyOptions);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeValue(item, depth + 1));
    }

    if (typeof value === 'object' && value !== null) {
      const sanitizedObject = {};

      for (const [key, val] of Object.entries(value)) {
        if (this.config.skipKeys.includes(key)) {
          sanitizedObject[key] = val;
          continue;
        }

        sanitizedObject[key] = this.sanitizeValue(val, depth + 1);
      }

      return sanitizedObject;
    }

    return value;
  }

  private containsXSS(value: string): boolean {
    const cleanValue = DOMPurify.sanitize(value, {
      RETURN_DOM_FRAGMENT: true
    });
    return cleanValue.textContent !== value;
  }

  sanitizeWithMetadata(value: any) {
    const sanitized = this.sanitizeValue(value);
    return {
      data: sanitized,
      metadata: {
        wasSanitized: JSON.stringify(value) !== JSON.stringify(sanitized),
        xssAttempts: typeof value === 'string' ? this.containsXSS(value) : undefined,
        timestamp: new Date()
      }
    };
  }
}