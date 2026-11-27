import { Studies } from "@/database";
import { Insertable } from "kysely";

type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };

export type EditableStudy = Pick<NoUndefinedField<Insertable<Studies>>, "name" | "description">;

export interface StudySummary {
  id: number;
  name: string;
  description: string | null;
  chapterCount: number;
  lineCount: number;
  side?: "white" | "black" | "both";
}
