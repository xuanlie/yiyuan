import type { ParsedSchema } from '@yiyuan/core';

export interface FrontendGenerator {
  /** 生成前端文件，返回 文件路径 -> 内容 的映射 */
  generate(schema: ParsedSchema, options?: { locale?: string; ui?: string }): Record<string, string>;
}
