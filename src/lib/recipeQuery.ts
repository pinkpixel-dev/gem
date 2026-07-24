// Structured representation of a GitHub "search repositories" query, plus
// bidirectional conversion to/from the raw `q=` string the scanner sends to
// GitHub (src-tauri/src/scanner.rs). The DB/backend only ever sees the raw
// string - all structure lives here, client-side.

export type DateField = "created" | "pushed";

export interface DateQualifier {
  field: DateField;
  /** Relative window in days. The backend only resolves the literal `DATE`
   * placeholder to "30 days ago" (see scanner.rs), so this is fixed at 30
   * for now - kept as a field so a future backend change to support custom
   * windows doesn't require another UI rework. */
  days: 30;
}

export interface RecipeCriteria {
  starsMin?: number;
  starsMax?: number;
  language?: string;
  topics: string[];
  dateQualifier?: DateQualifier;
  excludeTerms: string[];
  /** Any qualifiers we didn't recognize while parsing an existing query.
   * Preserved verbatim so editing a recipe never silently drops a token. */
  rawExtra: string;
}

export function emptyRecipeCriteria(): RecipeCriteria {
  return {
    topics: [],
    excludeTerms: [],
    rawExtra: "",
  };
}

/** Splits a query string on whitespace, respecting "quoted phrases". */
function tokenize(query: string): string[] {
  const tokens: string[] = [];
  const re = /"[^"]*"|\S+/g;
  const matches = query.trim().match(re);
  if (matches) tokens.push(...matches);
  return tokens;
}

export function parseRecipeQuery(query: string): RecipeCriteria {
  const criteria = emptyRecipeCriteria();
  const rawExtraTokens: string[] = [];

  for (const token of tokenize(query)) {
    let match: RegExpMatchArray | null;

    if ((match = token.match(/^stars:(\d+|\*)\.\.(\d+|\*)$/))) {
      const [, min, max] = match;
      criteria.starsMin = min === "*" ? undefined : parseInt(min, 10);
      criteria.starsMax = max === "*" ? undefined : parseInt(max, 10);
      continue;
    }

    if (criteria.language === undefined && (match = token.match(/^language:(.+)$/))) {
      criteria.language = match[1];
      continue;
    }

    if ((match = token.match(/^topic:(.+)$/))) {
      criteria.topics.push(match[1]);
      continue;
    }

    if (
      criteria.dateQualifier === undefined &&
      (match = token.match(/^(created|pushed):>DATE$/))
    ) {
      criteria.dateQualifier = { field: match[1] as DateField, days: 30 };
      continue;
    }

    if ((match = token.match(/^-(.+)$/))) {
      criteria.excludeTerms.push(match[1].replace(/^"|"$/g, ""));
      continue;
    }

    rawExtraTokens.push(token);
  }

  criteria.rawExtra = rawExtraTokens.join(" ");
  return criteria;
}

export function serializeRecipeCriteria(criteria: RecipeCriteria): string {
  const tokens: string[] = [];

  if (criteria.dateQualifier) {
    tokens.push(`${criteria.dateQualifier.field}:>DATE`);
  }

  if (criteria.starsMin !== undefined || criteria.starsMax !== undefined) {
    const min = criteria.starsMin !== undefined ? String(criteria.starsMin) : "*";
    const max = criteria.starsMax !== undefined ? String(criteria.starsMax) : "*";
    tokens.push(`stars:${min}..${max}`);
  }

  if (criteria.language?.trim()) {
    tokens.push(`language:${criteria.language.trim()}`);
  }

  for (const topic of criteria.topics) {
    if (topic.trim()) tokens.push(`topic:${topic.trim()}`);
  }

  if (criteria.rawExtra.trim()) {
    tokens.push(criteria.rawExtra.trim());
  }

  for (const term of criteria.excludeTerms) {
    if (!term.trim()) continue;
    tokens.push(term.includes(" ") ? `-"${term.trim()}"` : `-${term.trim()}`);
  }

  return tokens.join(" ");
}

/** Short human-readable summary for display in recipe lists, e.g.
 * "TypeScript · ★3-250 · created <30d · excl: windows, macos" */
export function describeRecipeCriteria(criteria: RecipeCriteria): string {
  const parts: string[] = [];

  if (criteria.language) parts.push(criteria.language);

  if (criteria.starsMin !== undefined || criteria.starsMax !== undefined) {
    const min = criteria.starsMin ?? 0;
    const max = criteria.starsMax !== undefined ? criteria.starsMax : "∞";
    parts.push(`★${min}-${max}`);
  }

  if (criteria.topics.length > 0) {
    parts.push(criteria.topics.map((t) => `#${t}`).join(" "));
  }

  if (criteria.dateQualifier) {
    parts.push(`${criteria.dateQualifier.field} <${criteria.dateQualifier.days}d`);
  }

  if (criteria.excludeTerms.length > 0) {
    parts.push(`excl: ${criteria.excludeTerms.join(", ")}`);
  }

  if (criteria.rawExtra.trim()) {
    parts.push(criteria.rawExtra.trim());
  }

  return parts.length > 0 ? parts.join(" · ") : "(empty query)";
}
