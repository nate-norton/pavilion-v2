/**
 * Parse a pasted roster into invitations.
 *
 * Boards keep their rosters in spreadsheets, so the input is whatever a
 * column copy produces: one home per line, fields split by commas, tabs or
 * semicolons, in any order. The email is the field with an "@"; everything
 * else on the line, joined, is the unit label. A line with no email is
 * skipped and reported, never silently dropped. Duplicate emails within the
 * paste keep the first line.
 */
export interface RosterLine { email: string; unitLabel: string; role: 'resident' | 'board' }
export interface RosterParse { ready: RosterLine[]; skipped: { line: number; text: string }[] }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseRoster(text: string): RosterParse {
  const ready: RosterLine[] = [];
  const skipped: RosterParse['skipped'] = [];
  const seen = new Set<string>();
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const fields = line.split(/[,\t;]+/).map((f) => f.trim().replace(/^"|"$/g, '')).filter(Boolean);
    const emailIdx = fields.findIndex((f) => EMAIL.test(f));
    if (emailIdx === -1) { skipped.push({ line: i + 1, text: line }); return; }
    const email = fields[emailIdx].toLowerCase();
    if (seen.has(email)) return;
    seen.add(email);
    const rest = fields.filter((_, j) => j !== emailIdx);
    const role: RosterLine['role'] = rest.some((f) => /^board$/i.test(f)) ? 'board' : 'resident';
    const unitLabel = rest.filter((f) => !/^(board|resident)$/i.test(f)).join(' ');
    ready.push({ email, unitLabel, role });
  });
  return { ready, skipped };
}
