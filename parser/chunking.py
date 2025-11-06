import html
import json
import os
import re
import xml.etree.ElementTree as ET
from glob import glob
from itertools import groupby
from typing import Dict, Iterable, List, Optional

try:
    import nltk
    nltk.download("punkt", quiet=True)
    try:
        nltk.download("punkt_tab", quiet=True)
    except Exception:
        pass
    _NLTK_OK = True
except Exception:
    nltk = None
    _NLTK_OK = False

try:
    import tiktoken
    _ENC = tiktoken.get_encoding("cl100k_base")
except Exception:
    _ENC = None

# ---------- CONFIG ----------
BASE_DIR = os.path.dirname(__file__)
SICP_XML_DIR = os.path.join(BASE_DIR, "..", "xml")
OUTPUT_FILE = os.path.join(BASE_DIR, "sicp_mesochunks_semantic_rag.json")

MAX_TOKENS = 300
OVERLAP_SENTENCES = 1

# ---------- PARSING HELPERS ----------
DROP_TAGS = {
    "INDEX",
    "LABEL",
    "CITATION",
    "COMMENT",
    "FOOTNOTE",
    "WEB_ONLY",
    "HISTORY",
}
SCHEME_PREFIXES = ("SCHEME",)
CODE_BLOCK_TAGS = {"SNIPPET", "PROGRAMLISTING", "CODE", "DISPLAY"}
INLINE_CODE_TAGS = {"JAVASCRIPTINLINE"}


def num_tokens(text: str) -> int:
    if _ENC:
        try:
            return len(_ENC.encode(text))
        except Exception:
            pass
    return max(1, len(text.split()))


def safe_sentence_tokenize(text: str) -> List[str]:
    if _NLTK_OK and nltk:
        try:
            return nltk.sent_tokenize(text)
        except Exception:
            pass
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z(0-9`])", text.strip())
    if len(parts) == 1:
        words = text.split()
        chunk = []
        acc: List[str] = []
        for word in words:
            acc.append(word)
            if len(acc) >= 25:
                chunk.append(" ".join(acc))
                acc = []
        if acc:
            chunk.append(" ".join(acc))
        return chunk or [text]
    return parts


def normalize_whitespace(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s*\n\s*", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalize_code(text: str) -> str:
    lines = [line.rstrip() for line in text.splitlines()]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines)


def prune_tree(node: ET.Element) -> None:
    for child in list(node):
        tag = child.tag.upper()
        if tag in DROP_TAGS or tag.startswith(SCHEME_PREFIXES):
            node.remove(child)
            continue
        prune_tree(child)


def gather_code(node: ET.Element) -> str:
    parts: List[str] = []

    def visit(el: ET.Element) -> None:
        tag = el.tag.upper()
        if tag in DROP_TAGS or tag.startswith(SCHEME_PREFIXES):
            return
        if tag == "JAVASCRIPT_OUTPUT":
            return
        if el.text:
            parts.append(el.text)
        for child in el:
            visit(child)
            if child.tail:
                parts.append(child.tail)

    visit(node)
    return normalize_code(html.unescape("".join(parts)))


def is_text_container(node: ET.Element) -> bool:
    return any(child.tag.upper() == "TEXT" for child in node)


def extract_segments_from_text(node: ET.Element) -> List[Dict[str, str]]:
    segments: List[Dict[str, str]] = []
    buffer: List[str] = []

    def append_text(value: Optional[str]) -> None:
        if value:
            buffer.append(html.unescape(value))

    def flush_text() -> None:
        if not buffer:
            return
        text = normalize_whitespace(" ".join(buffer))
        if text:
            segments.append({"type": "text", "content": text})
        buffer.clear()

    def walk(el: ET.Element) -> None:
        tag = el.tag.upper()

        if tag in DROP_TAGS or tag.startswith(SCHEME_PREFIXES):
            return

        if tag in {"UL", "OL"}:
            for li in el:
                if li.tag.upper() == "LI":
                    append_text("\n- ")
                    walk(li)
                    if li.tail:
                        append_text(li.tail)
            return

        if tag == "LI":
            append_text("\n- ")

        if tag in CODE_BLOCK_TAGS:
            flush_text()
            code_block = gather_code(el)
            if code_block:
                segments.append({"type": "code", "content": code_block})
            return

        if tag == "JAVASCRIPT" and not is_text_container(el):
            snippet = gather_code(el)
            if not snippet:
                return
            if "\n" in snippet or re.search(r"[;{}=]", snippet):
                flush_text()
                segments.append({"type": "code", "content": snippet})
            else:
                append_text(snippet)
            return

        if el.text:
            append_text(el.text)

        for child in el:
            walk(child)
            if child.tail:
                append_text(child.tail)

    if node.text:
        append_text(node.text)

    for child in node:
        walk(child)
        if child.tail:
            append_text(child.tail)

    flush_text()
    return segments


def extract_title(root: ET.Element) -> str:
    name = root.find("NAME")
    if name is None:
        return "Untitled"
    title = " ".join(name.itertext())
    return re.sub(r"\s+", " ", html.unescape(title)).strip()


def extract_segments(
    root: ET.Element,
    context: Dict[str, Optional[str]],
    source_file: str,
) -> List[Dict[str, Optional[str]]]:
    results: List[Dict[str, Optional[str]]] = []
    for order, text_node in enumerate(root.findall(".//TEXT"), start=1):
        for segment in extract_segments_from_text(text_node):
            entry = {
                "chapter": context.get("chapter"),
                "section": context.get("section"),
                "subsection": context.get("subsection"),
                "content_type": segment["type"],
                "content": segment["content"],
                "source_file": os.path.basename(source_file),
                "order": order,
            }
            results.append(entry)
    return results


def parse_xml_file(
    file_path: str,
    context: Optional[Dict[str, Optional[str]]] = None,
    depth: int = 0,
    visited: Optional[set] = None,
) -> List[Dict[str, Optional[str]]]:
    if visited is None:
        visited = set()

    real_path = os.path.abspath(file_path)
    if real_path in visited or not os.path.exists(file_path):
        return []
    visited.add(real_path)

    try:
        tree = ET.parse(file_path)
    except Exception as exc:
        print(f"⚠️  XML parse error in {file_path}: {exc}")
        return []

    root = tree.getroot()
    prune_tree(root)

    tag_type = root.tag.upper()
    title = extract_title(root)

    ctx = dict(context or {"chapter": None, "section": None, "subsection": None})
    if tag_type == "CHAPTER":
        ctx["chapter"] = title
        ctx["section"] = None
        ctx["subsection"] = None
    elif tag_type == "SECTION":
        ctx["section"] = title
        ctx["subsection"] = None
    elif tag_type == "SUBSECTION":
        ctx["subsection"] = title

    segments = extract_segments(root, ctx, file_path)

    xml_text = html.unescape(ET.tostring(root, encoding="unicode"))
    section_refs = re.findall(r"&section([\d\.]+);", xml_text)
    subsection_refs = re.findall(r"&subsection([\d\.]+);", xml_text)

    base_dir = os.path.dirname(file_path)

    for ref in section_refs:
        section_id = ref.split(".")[-1]
        section_folder = os.path.join(base_dir, f"section{section_id}")
        section_file = os.path.join(section_folder, f"section{section_id}.xml")
        segments.extend(parse_xml_file(section_file, ctx, depth + 1, visited))

    for ref in subsection_refs:
        subsection_id = ref.split(".")[-1]
        subsection_file = os.path.join(base_dir, f"subsection{subsection_id}.xml")
        segments.extend(parse_xml_file(subsection_file, ctx, depth + 1, visited))

    return segments


# ---------- CHUNK HELPERS ----------
VARIANT_REPLACEMENTS = [
    (re.compile(r"\bprocedures?\s+functions\b", re.IGNORECASE), "functions"),
    (re.compile(r"\bprocedure\s+function\b", re.IGNORECASE), "function"),
    (re.compile(r"\bexpression\s+statement\b", re.IGNORECASE), "statement"),
    (re.compile(r"\bExpressions?\s+Statements?\b", re.IGNORECASE), "Statements"),
    (re.compile(r"\bprocedure\s+applications?\b", re.IGNORECASE), "function application"),
    (re.compile(r"\bProcedures?\s+Applications?\b"), "Function Applications"),
    (re.compile(r"\bLisp\b", re.IGNORECASE), ""),
    (re.compile(r"\bScheme\b", re.IGNORECASE), ""),
]


def normalize_sentence(sentence: str) -> str:
    s = sentence.strip()
    for pattern, replacement in VARIANT_REPLACEMENTS:
        s = pattern.sub(replacement, s)
    s = re.sub(r"\s{2,}", " ", s)
    s = re.sub(r"\s+\.", ".", s)
    return s.strip()


def expand_segment(segment: Dict[str, str]) -> Iterable[Dict[str, str]]:
    seg_type = segment.get("content_type")
    content = (segment.get("content") or "").strip()
    if not content:
        return []
    if seg_type == "code":
        code = "\n".join(line.rstrip() for line in content.splitlines())
        if not code:
            return []
        return [{"type": "code", "text": code}]

    text = normalize_whitespace(content)
    sentences = safe_sentence_tokenize(text)
    units = []
    seen = set()
    for sentence in sentences:
        s = normalize_sentence(sentence)
        if not s:
            continue
        key = s.lower()
        if key in seen:
            continue
        seen.add(key)
        units.append({"type": "text", "text": s})
    return units


def join_units(units: List[str], types: List[str]) -> str:
    parts: List[str] = []
    for text, ttype in zip(units, types):
        if ttype == "code":
            parts.append(f"```javascript\n{text}\n```")
        else:
            parts.append(text)
    out = "\n\n".join(parts)
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out.strip()


def chunk_units(
    units: List[Dict[str, str]],
    meta: Dict[str, Optional[str]],
) -> List[Dict[str, object]]:
    buffer: List[str] = []
    types: List[str] = []
    carryover: List[str] = []
    carry_pending = False
    current_tokens = 0
    chunks: List[Dict[str, object]] = []

    def seed_carry() -> None:
        nonlocal carry_pending, current_tokens
        if not (carry_pending and carryover):
            return
        for text in carryover:
            buffer.append(text)
            types.append("text")
            current_tokens += num_tokens(text)
        carry_pending = False

    def compute_carry() -> None:
        carryover.clear()
        if not OVERLAP_SENTENCES:
            return
        text_units = [text for text, ttype in zip(buffer, types) if ttype == "text"]
        if not text_units:
            return
        tail = text_units[-OVERLAP_SENTENCES:]
        carryover.extend(tail)

    def flush() -> None:
        nonlocal buffer, types, current_tokens, carry_pending
        if not buffer:
            return
        content = join_units(buffer, types)
        token_count = num_tokens(content)
        chunks.append(
            {
                "content": content,
                "token_count": token_count,
                "has_code": any(t == "code" for t in types),
                **meta,
            }
        )
        compute_carry()
        buffer = []
        types = []
        current_tokens = 0
        carry_pending = bool(carryover)

    for unit in units:
        text = unit["text"]
        ttype = unit["type"]
        unit_tokens = num_tokens(text)

        if carry_pending and not buffer:
            seed_carry()

        if current_tokens + unit_tokens > MAX_TOKENS and buffer:
            flush()
            if carry_pending and not buffer:
                seed_carry()

        buffer.append(text)
        types.append(ttype)
        current_tokens += unit_tokens

    flush()
    return chunks


# ---------- MAIN ----------
def collect_segments() -> List[Dict[str, Optional[str]]]:
    segments: List[Dict[str, Optional[str]]] = []
    chapter_dirs = sorted(glob(os.path.join(SICP_XML_DIR, "chapter*")))
    for chapter_dir in chapter_dirs:
        if not os.path.isdir(chapter_dir):
            continue
        chapter_xml = os.path.join(chapter_dir, f"{os.path.basename(chapter_dir)}.xml")
        if not os.path.exists(chapter_xml):
            continue
        segments.extend(parse_xml_file(chapter_xml))
    return segments


def main():
    segments = collect_segments()
    if not segments:
        print("⚠️ No segments parsed from XML.")
        return

    segments.sort(
        key=lambda s: (
            s.get("chapter") or "",
            s.get("section") or "",
            s.get("subsection") or "",
            s.get("order") or 0,
        )
    )

    all_chunks: List[Dict[str, object]] = []

    def group_key(item: Dict[str, Optional[str]]) -> tuple:
        return (
            item.get("chapter") or "",
            item.get("section") or "",
            item.get("subsection") or "",
        )

    for key, group in groupby(segments, key=group_key):
        chapter, section, subsection = key
        group_list = list(group)
        units: List[Dict[str, str]] = []
        for seg in group_list:
            units.extend(expand_segment(seg))

        if not units:
            continue

        slug_source = subsection or section or chapter or "section"
        slug = re.sub(r"[^\w\s-]", "", slug_source or "")
        slug = re.sub(r"\s+", "_", slug.strip())[:60] or "section"
        chapter_slug = re.sub(r"[^\w\s-]", "", chapter or "chapter")
        chapter_slug = re.sub(r"\s+", "_", chapter_slug.strip())[:40] or "chapter"

        meta = {
            "chapter": chapter or None,
            "section": section or None,
            "subsection": subsection or None,
        }

        group_chunks = chunk_units(units, meta)

        for idx, chunk in enumerate(group_chunks, start=1):
            chunk["chunk_index"] = idx
            chunk["chunk_id"] = f"{chapter_slug}_{slug}_{idx}"
            all_chunks.append(chunk)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as handle:
        json.dump(all_chunks, handle, indent=2, ensure_ascii=False)

    if all_chunks:
        avg = sum(c["token_count"] for c in all_chunks) / len(all_chunks)
        print(f"✅ Created {len(all_chunks)} chunks → {OUTPUT_FILE}")
        print(f"📊 Avg tokens: {avg:.1f}, Max: {max(c['token_count'] for c in all_chunks)}")
    else:
        print("⚠️ No chunks produced.")


if __name__ == "__main__":
    main()
