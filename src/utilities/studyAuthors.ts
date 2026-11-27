export const CHESS_TITLES = ["GM", "IM", "FM", "CM", "WGM", "WIM", "WFM", "WCM"] as const;

export type ChessTitle = (typeof CHESS_TITLES)[number];

export interface StudyAuthor {
  name: string;
  title: ChessTitle | null;
}

export function isChessTitle(value: unknown): value is ChessTitle {
  return CHESS_TITLES.includes(value as ChessTitle);
}

export function cleanAuthors(authors: StudyAuthor[]): StudyAuthor[] {
  return authors.map((author) => ({ name: author.name.trim(), title: author.title })).filter((author) => author.name);
}

const TITLED_NAME = new RegExp(`^(${CHESS_TITLES.join("|")})\\.?\\s+(.+)$`);
// Lichess study exports name the author by profile URL
const LICHESS_PROFILE = /^https?:\/\/(?:www\.)?lichess\.org\/@\/([\w-]+)\/?$/i;

export function formatAuthor(author: StudyAuthor) {
  return author.title ? `${author.title} ${author.name}` : author.name;
}

export function parseAuthor(text: string): StudyAuthor {
  const name = text.trim();
  const titled = name.match(TITLED_NAME);
  if (titled && isChessTitle(titled[1])) return { name: titled[2], title: titled[1] };
  return { name, title: null };
}

export function toKnownAuthor(author: StudyAuthor, knownAuthors: StudyAuthor[]): StudyAuthor {
  return knownAuthors.find((known) => known.name.toLowerCase() === author.name.toLowerCase()) ?? author;
}

export function parseAnnotator(annotator: string): StudyAuthor[] {
  return annotator
    .split(/\s*(?:[,;&]|\s+and\s+)\s*/i)
    .map((part) => part.trim())
    .filter((part) => part && part !== "?")
    .flatMap((part): StudyAuthor[] => {
      const profile = part.match(LICHESS_PROFILE);
      if (profile) return [{ name: profile[1], title: null }];
      if (/^https?:\/\//i.test(part)) return [];
      return [parseAuthor(part)];
    });
}
