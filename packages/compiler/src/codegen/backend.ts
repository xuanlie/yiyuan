import type { ParsedSchema } from '@yiyuan/core';

export interface GenerateOptions {
  locale?: string;
}

export interface BackendGenerator {
  generate(schema: ParsedSchema, options?: GenerateOptions): Record<string, string>;
}
