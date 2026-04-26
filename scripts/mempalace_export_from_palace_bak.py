#!/usr/bin/env python3
"""
One-time: export text from a MemPalace Chroma store using only stdlib sqlite3
(no chromadb import — avoids the segfault you see with the old palace).

Next step after export:
  python3 -m mempalace mine <out_dir> --wing tuherenciafacil

  Or point --out inside this repo and add --include-ignored if the folder is gitignored.
"""
from __future__ import annotations

import argparse
import hashlib
import os
import sqlite3
import sys
from pathlib import Path


def main() -> int:
    p = argparse.ArgumentParser(
        description="Export chroma:document rows for a given wing from a palace.bak Chroma DB."
    )
    p.add_argument(
        "--db",
        default=os.path.expanduser("~/.mempalace/palace.bak-2026-04-26/chroma.sqlite3"),
        help="Path to chroma.sqlite3 inside the backup palace folder",
    )
    p.add_argument(
        "--out",
        default=os.path.expanduser("~/mempalace_palace_bak_export"),
        help="Directory to write .md files (created if missing)",
    )
    p.add_argument(
        "--wing",
        default="tuherenciafacil",
        help="Only export chunks whose metadata wing equals this (exact match)",
    )
    p.add_argument(
        "--dedupe",
        action="store_true",
        help="Skip duplicate bodies (sha256 of text); keeps first only",
    )
    args = p.parse_args()

    db = Path(args.db)
    if not db.is_file():
        print(f"error: not a file: {db}", file=sys.stderr)
        return 1

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    try:
        cur = conn.execute(
            """
            SELECT
              em_wing.id,
              em_doc.string_value
            FROM embedding_metadata em_wing
            JOIN embedding_metadata em_doc
              ON em_wing.id = em_doc.id
            WHERE em_wing.key = 'wing'
              AND em_wing.string_value = ?
              AND em_doc.key = 'chroma:document'
            ORDER BY em_wing.id
            """,
            (args.wing,),
        )
        rows = cur.fetchall()
    finally:
        conn.close()

    seen: set[str] = set()
    n_written = 0
    n_skipped = 0
    for eid, body in rows:
        if body is None:
            continue
        text = body if isinstance(body, str) else str(body)
        if args.dedupe:
            h = hashlib.sha256(text.encode("utf-8")).hexdigest()
            if h in seen:
                n_skipped += 1
                continue
            seen.add(h)
        # Filename safe; embedding id is integer in this schema
        name = f"wing-{args.wing}--eid-{eid}.md"
        (out / name).write_text(text, encoding="utf-8")
        n_written += 1

    print(f"Exported {n_written} files to {out}")
    if args.dedupe and n_skipped:
        print(f"Skipped {n_skipped} duplicate bodies (dedupe on)")
    print()
    print("Re-ingest into the new (empty) palace, e.g.:")
    print(f"  python3 -m mempalace mine {out} --wing {args.wing}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
