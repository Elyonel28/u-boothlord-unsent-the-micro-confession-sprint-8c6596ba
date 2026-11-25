// Unsent: The Micro-Confession Sprint — entry program (program/v1, node22).
// Emits one two-part micro-confession to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR/entry.txt when set): a "To:" line naming who the
// unsent message was meant for, then the message itself, one line, exactly
// as it was typed, with nothing after it.
//
// The gate requires UTF-8 text of 1-260 characters, not only whitespace,
// and the judge's brief caps the message line itself at 200 characters.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Why this confession: the reason it stayed in drafts is felt, never
// stated — too late and too afraid at once. The "To:" line is load-bearing:
// a last voicemail only exists for someone who is gone, and only "Grandma"
// says who, so swapping the addressee would break the message. It reads as
// typed and never sent, because to her it could never be sent at all.

const TO_LINE = "To: Grandma";

const MESSAGE_LINE =
  "I saved your last voicemail for four years and still haven't played it, because once I hear your voice again I'll have to admit there will never be another one.";

const ENTRY_LINES = [TO_LINE, MESSAGE_LINE];

const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 260;
const MESSAGE_MAX_CHARS = 200;

function validateEntry(lines: string[]): string[] {
  const problems: string[] = [];
  if (lines.length !== 2) {
    problems.push(`entry must have exactly 2 lines, got ${lines.length}`);
  }
  if (!lines[0]?.startsWith("To: ")) {
    problems.push('first line must be a "To: " line naming the addressee');
  }
  const addressee = lines[0]?.slice("To: ".length).trim() ?? "";
  if (addressee.length === 0) {
    problems.push('the "To: " line names nobody');
  }
  const message = lines[1] ?? "";
  if (message.length > MESSAGE_MAX_CHARS) {
    problems.push(
      `message line is ${message.length} characters, over the ${MESSAGE_MAX_CHARS} cap`,
    );
  }
  if (message.trim().length === 0) {
    problems.push("message line is blank");
  }
  const whole = lines.join("\n");
  if (whole.length < GATE_MIN_CHARS || whole.length > GATE_MAX_CHARS) {
    problems.push(
      `whole entry is ${whole.length} characters, must be ${GATE_MIN_CHARS}-${GATE_MAX_CHARS}`,
    );
  }
  if (whole.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  return problems;
}

function main(): void {
  const problems = validateEntry(ENTRY_LINES);
  if (problems.length > 0) {
    for (const problem of problems) console.error(`error: ${problem}`);
    process.exit(1);
  }

  const text = ENTRY_LINES.join("\n");
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, text + "\n", "utf8");

  const roundTrip = readFileSync(outPath, "utf8");
  if (roundTrip !== text + "\n") {
    console.error("error: round-trip mismatch: file differs from the entry");
    process.exit(1);
  }

  const encoder = new TextEncoder();
  console.log(
    `wrote entry.txt (${text.length} chars, ${encoder.encode(text).length} bytes; message line ${MESSAGE_LINE.length} chars)`,
  );
}

main();
