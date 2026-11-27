import { Channel, invoke } from "@tauri-apps/api/core";
import { StudyAuthor } from "@utilities/studyAuthors";
import { ImportPlan } from "@utilities/studyImport";

export type ImportTarget =
  | { type: "existingStudy"; id: number }
  | { type: "newStudy"; name: string; authors: StudyAuthor[] };

export interface ImportProgress {
  importedLines: number;
  totalLines: number;
}

export function importStudy(target: ImportTarget, plan: ImportPlan, onProgress: (progress: ImportProgress) => void) {
  const channel = new Channel<ImportProgress>();
  channel.onmessage = onProgress;
  return invoke<number>("import_study", { target, plan, onProgress: channel });
}
