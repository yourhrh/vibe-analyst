import type { ZodSchema } from 'zod';

export interface LLMPort {
  /**
   * 텍스트를 스트리밍으로 생성한다.
   * 반환되는 ReadableStream<string>은 토큰 단위로 흐른다.
   */
  streamText(params: {
    system: string;
    prompt: string;
    temperature?: number;
  }): Promise<ReadableStream<string>>;

  /**
   * 구조화된 JSON 객체를 생성한다.
   * Zod 스키마로 타입 안전성 보장.
   */
  generateObject<T>(params: {
    system: string;
    prompt: string;
    schema: ZodSchema<T>;
    temperature?: number;
  }): Promise<T>;
}
