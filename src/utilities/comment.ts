const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function formatComment(comment: string) {
  // strip html tags including content assuming any html is malicious
  const htmlPattern = /<([^</> ]+)[^<>]*?>[^<>]*?<\/\1>/g;
  let comment_ = comment.replace(htmlPattern, "");
  // strip custom pgn comments
  const customCommentPattern = /\[[^\]]+?\]/g;
  comment_ = comment_.replace(customCommentPattern, "");
  // unescape brackets
  comment_ = comment_.replaceAll("@@StartBracket@@", "(").replaceAll("@@EndBracket@@", ")");
  // remove fen information
  const fenPattern = /@@StartFEN@@[^@]+?@@EndFEN@@/g;
  comment_ = comment_.replaceAll(fenPattern, "");
  // The result is rendered with v-html, so whatever the tag stripping missed must not reach the DOM as markup.
  comment_ = comment_.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
  // highlight chess moves
  // The leading group stands in for a lookbehind, which the oldest supported WebKit (Safari 15) cannot parse.
  const chessMovePattern =
    /(^|[^A-Za-z0-9])(([\d]{0,3}\.)?(\.{2,3})?[KQBNRP]?[a-h]?[1-8]?[x]?[a-h][1-8](=[NBRQK])?[+#]?|[0O]-[0O](-[0O])?)(?![A-Za-z0-9])/g;
  comment_ = comment_.replace(chessMovePattern, "$1<b>$2</b>");
  comment_ = comment_.trim();

  return comment_;
}
