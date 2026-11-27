import { db, execute, select } from "@services/database";
import { StudyAuthor, isChessTitle } from "@utilities/studyAuthors";
import { sql } from "kysely";

export async function loadStudyAuthors(studyId?: number) {
  let query = db.selectFrom("study_authors").select(["study", "name", "title"]).orderBy("study").orderBy("position");
  if (studyId !== undefined) query = query.where("study", "=", studyId);

  const authorsByStudy = new Map<number, StudyAuthor[]>();
  for (const row of await select(query.compile())) {
    const authors = authorsByStudy.get(row.study) ?? [];
    authors.push({ name: row.name, title: isChessTitle(row.title) ? row.title : null });
    authorsByStudy.set(row.study, authors);
  }
  return authorsByStudy;
}

// One entry per name across all studies; a trigger keeps their titles in sync, so any row's title will do.
export async function loadKnownAuthors(): Promise<StudyAuthor[]> {
  const latestRows = db
    .selectFrom("study_authors")
    .select((eb) => eb.fn.max("id").as("id"))
    .groupBy(sql`lower(name)`);
  const rows = await select(
    db
      .selectFrom("study_authors")
      .select(["name", "title"])
      .where("id", "in", latestRows)
      .orderBy(sql`name collate nocase`)
      .compile()
  );
  return rows.map((row) => ({ name: row.name, title: isChessTitle(row.title) ? row.title : null }));
}

// The SQL plugin can't hold a transaction across calls, so this upserts by position and then trims instead of
// deleting first: a failure halfway keeps the study's authors rather than leaving it with none.
export async function saveStudyAuthors(studyId: number, authors: StudyAuthor[]) {
  if (authors.length) {
    await execute(
      db
        .insertInto("study_authors")
        .values(authors.map((author, position) => ({ study: studyId, position, ...author })))
        .onConflict((conflict) =>
          conflict.columns(["study", "position"]).doUpdateSet((eb) => ({
            name: eb.ref("excluded.name"),
            title: eb.ref("excluded.title"),
          }))
        )
        .compile()
    );
  }
  await execute(
    db.deleteFrom("study_authors").where("study", "=", studyId).where("position", ">=", authors.length).compile()
  );
}
