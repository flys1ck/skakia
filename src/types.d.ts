import { StudyAuthor } from "@utilities/studyAuthors";

export interface EditableStudy {
  name: string;
  authors: StudyAuthor[];
}

export interface StudySummary {
  id: number;
  name: string;
  authors: StudyAuthor[];
  chapterCount: number;
  lineCount: number;
  side?: "white" | "black" | "both";
}
