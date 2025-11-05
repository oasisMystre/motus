import type { z, ZodType } from "zod";

export type InferNormalize<T extends ZodType> = z.infer<T> extends Date
  ? string
  : z.infer<T> extends Array<infer U>
    ? Normalize<U>[]
    : z.infer<T> extends object
      ? Normalize<z.infer<T>>
      : z.infer<T>;

export type Normalize<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Normalize<U>[]
    : T extends object
      ? { [K in keyof T]: Normalize<T[K]> }
      : T;
