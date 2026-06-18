#!/usr/bin/env python3
"""Rename JavaScript language tags to Python tags in an XML source tree.

Replaces the opening and closing forms of every <JAVASCRIPT...> tag
(JAVASCRIPT, JAVASCRIPTINLINE, JAVASCRIPT_RUN, JAVASCRIPT_TEST,
JAVASCRIPT_OUTPUT, JAVASCRIPT_PROMPT) with the corresponding <PYTHON...> tag.

Only tag tokens are touched (matched via the leading "<" / "</"), so prose
mentions of the word "JavaScript" are left untouched. Run on the Python
edition's source tree, e.g.:

    python3 scripts/js_tags_to_python.py xml_py
    python3 scripts/js_tags_to_python.py xml_py --dry-run
"""
import argparse
import pathlib
import sys

# Closing form must be handled too, else <PYTHON>...</JAVASCRIPT> is malformed.
# "<JAVASCRIPT" does not occur inside "</JAVASCRIPT" (the char after "<" is "/"),
# so the two replacements are independent and order does not matter.
REPLACEMENTS = [
    ("</JAVASCRIPT", "</PYTHON"),
    ("<JAVASCRIPT", "<PYTHON"),
]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", help="directory tree to process (e.g. xml_py)")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="report replacements without writing files",
    )
    args = parser.parse_args()

    root = pathlib.Path(args.root)
    if not root.is_dir():
        print(f"error: {root} is not a directory", file=sys.stderr)
        return 1

    total_repl = 0
    changed_files = 0
    for path in sorted(root.rglob("*.xml")):
        text = path.read_text(encoding="utf-8")
        new_text = text
        file_repl = 0
        for old, new in REPLACEMENTS:
            file_repl += new_text.count(old)
            new_text = new_text.replace(old, new)
        if file_repl:
            changed_files += 1
            total_repl += file_repl
            if not args.dry_run:
                path.write_text(new_text, encoding="utf-8")
            print(f"{file_repl:6d}  {path}")

    verb = "would change" if args.dry_run else "changed"
    print(f"\n{verb} {changed_files} files, {total_repl} tag replacements")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
