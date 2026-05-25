#!/usr/bin/env python3
"""extract_docx.py — convert PRD.docx / ERD.docx into greppable markdown.

Usage:
    python scripts/extract_docx.py PRD.docx docs/product-specs/PRD.md
    python scripts/extract_docx.py ERD.docx docs/design-docs/ERD.md

The .docx remains canonical for humans; the .md becomes the source the
harness can actually read (grep, check_spec_compliance, feature_list.json
cross-refs).

Style-name heuristics map Word styles to markdown:
  - "Heading 1".."Heading 6"   -> # .. ######
  - "Title"                    -> #
  - style name contains "List" -> bullet "- " (numbering rebuilds anyway)
  - everything else            -> paragraph

Tables become GitHub-flavored markdown tables.
"""

from __future__ import annotations

import sys
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph


def iter_block_items(parent):
    """Yield paragraphs and tables in document order."""
    body = parent.element.body
    for child in body.iterchildren():
        if child.tag == qn("w:p"):
            yield Paragraph(child, parent)
        elif child.tag == qn("w:tbl"):
            yield Table(child, parent)


def heading_level(style_name: str) -> int | None:
    if not style_name:
        return None
    s = style_name.lower()
    if s == "title":
        return 1
    if s.startswith("heading "):
        try:
            return min(int(s.split()[1]), 6)
        except (IndexError, ValueError):
            return None
    return None


def is_list_paragraph(p: Paragraph) -> bool:
    style = (p.style.name or "") if p.style is not None else ""
    if "list" in style.lower():
        return True
    # Word numbering is also signalled via <w:numPr> inside pPr.
    p_pr = p._p.find(qn("w:pPr"))
    if p_pr is not None and p_pr.find(qn("w:numPr")) is not None:
        return True
    return False


def render_paragraph(p: Paragraph) -> str:
    text = (p.text or "").strip()
    if not text:
        return ""
    level = heading_level(p.style.name if p.style is not None else "")
    if level is not None:
        return f"{'#' * level} {text}"
    if is_list_paragraph(p):
        return f"- {text}"
    return text


def render_table(tbl: Table) -> str:
    rows = []
    for row in tbl.rows:
        cells = [" ".join((c.text or "").split()) for c in row.cells]
        rows.append(cells)
    if not rows:
        return ""
    width = max(len(r) for r in rows)
    rows = [r + [""] * (width - len(r)) for r in rows]
    header = "| " + " | ".join(rows[0]) + " |"
    sep = "| " + " | ".join(["---"] * width) + " |"
    body = ["| " + " | ".join(r) + " |" for r in rows[1:]]
    return "\n".join([header, sep, *body])


def convert(src: Path, dst: Path) -> None:
    doc = Document(str(src))
    out: list[str] = []
    prev_was_list = False
    for block in iter_block_items(doc):
        if isinstance(block, Paragraph):
            rendered = render_paragraph(block)
            if not rendered:
                continue
            is_list = rendered.startswith("- ")
            if out and not (prev_was_list and is_list):
                out.append("")
            out.append(rendered)
            prev_was_list = is_list
        elif isinstance(block, Table):
            rendered = render_table(block)
            if not rendered:
                continue
            if out:
                out.append("")
            out.append(rendered)
            prev_was_list = False

    dst.parent.mkdir(parents=True, exist_ok=True)
    header = (
        f"<!-- Auto-generated from {src.name} by scripts/extract_docx.py. "
        f"Edit the .docx, then re-run extraction. -->\n\n"
    )
    dst.write_text(header + "\n".join(out) + "\n", encoding="utf-8")
    print(f"Wrote {dst} ({len(out)} blocks)")


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("Usage: extract_docx.py <input.docx> <output.md>", file=sys.stderr)
        return 2
    src = Path(argv[1])
    dst = Path(argv[2])
    if not src.exists():
        print(f"ERROR: {src} not found", file=sys.stderr)
        return 1
    convert(src, dst)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
