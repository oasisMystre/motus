import { sql, type SQL, type Column } from "drizzle-orm";
import type { PgBoolean } from "drizzle-orm/pg-core";

export const date = <T extends Column>(column: T) => sql`Date(${column})`;
export const coalesce = <
  T extends Column | SQL.Aliased,
  U extends T extends Column ? T["_"]["data"] : string | number | boolean,
>(
  column: T,
  value: U,
) => sql`COALESCE(${column}, ${value})`;
