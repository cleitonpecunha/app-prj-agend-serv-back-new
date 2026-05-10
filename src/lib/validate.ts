import type { ZodTypeAny, z } from "zod";
import { ZodError } from "zod";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError };

export function parseWith<TSchema extends ZodTypeAny>(
  schema: TSchema,
  data: unknown,
): ParseResult<z.output<TSchema>> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as z.output<TSchema> };
  }
  return { success: false, error: result.error };
}
