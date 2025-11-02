import os
import re
import json
from glob import glob
from itertools import groupby
from difflib import SequenceMatcher
from typing import List, Tuple

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
CHAPTER_JSON_DIR = "."
CHAPTER_FILE_GLOB = "chapter*_chunks.json"
OUTPUT_FILE = "sicp_mesochunks_semantic_rag.json"

MAX_TOKENS = 300           # smaller chunks for RAG
OVERLAP_SENTENCES = 1
HARD_SENT_WORD_SPLIT = 80
HUGE_CODE_LINES = 25
SYMBOL_DENSITY = 0.10

# ---------- HELPERS ----------
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
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z(0-9`])', text.strip())
    if len(parts) == 1:
        words = text.split()
        return [" ".join(words[i:i+HARD_SENT_WORD_SPLIT]) for i in range(0,len(words),HARD_SENT_WORD_SPLIT)] or [text]
    return parts

def is_symbol_dense(line: str) -> bool:
    symbols = re.findall(r"[()\[\]{};:+\-*/=<>|&^%$~,.`]", line)
    return (len(symbols) / max(1, len(line))) >= SYMBOL_DENSITY

def looks_like_code_line(line: str) -> bool:
    s = line.strip()
    if not s: return False
    if s == "```": return True
    if s.startswith(("    ", "\t")): return True
    if re.match(r"^\s*(>>>|#|//|/\*|\*|\w+\s*=\s*)", s): return True
    if re.match(r"^\s*\(.*\)\s*$", s): return True               # Lisp
    if re.match(r"^\s*(function\s+\w+\s*\(|\w+\s*\(.*\)\s*;?\s*|\{\s*|\}\s*)$", s): return True
    if re.match(r"^\s*[\d.]+\s*[\+\-\*/]\s*[\d.]+;?\s*$", s): return True
    if is_symbol_dense(s): return True
    return False

def detect_code_blocks(text: str) -> List[Tuple[str,str]]:
    segs, cur, is_code, fenced = [], [], False, False
    lines = text.splitlines()
    for i, raw in enumerate(lines):
        line = raw.rstrip("\n")
        if line.strip() == "```":
            if cur:
                segs.append(("code" if is_code or fenced else "text", "\n".join(cur)))
                cur = []
            fenced = not fenced
            is_code = fenced or is_code
            continue

        # decide next_line for boundary detection
        next_line = lines[i+1].strip() if i+1 < len(lines) else ""

        if fenced or looks_like_code_line(line):
            if not is_code and cur:
                segs.append(("text", "\n".join(cur)))
                cur = []
            is_code = True
        else:
            # boundary: code followed by capitalized prose
            if is_code and next_line and re.match(r"^[A-Z]", next_line):
                segs.append(("code", "\n".join(cur+[line])))
                cur, is_code = [], False
                continue
            if is_code and cur:
                segs.append(("code", "\n".join(cur)))
                cur = []
            is_code = False
        cur.append(line)
    if cur:
        segs.append(("code" if is_code or fenced else "text", "\n".join(cur)))
    return segs

def split_code_by_lines(block: str, window: int) -> List[str]:
    lines, out, cur = block.split("\n"), [], []
    for ln in lines:
        cur.append(ln)
        if len(cur) >= window or num_tokens("\n".join(cur)) >= MAX_TOKENS:
            out.append("\n".join(cur))
            cur = []
    if cur: out.append("\n".join(cur))
    return out

def split_huge_code_block(block: str) -> List[str]:
    if "function" in block and "(define" in block:
        return split_code_by_lines(block, 15)
    lines = block.split("\n")
    return split_code_by_lines(block, HUGE_CODE_LINES)

def clean_text_noise(txt: str) -> str:
    txt = re.sub(r'\b\w*_example(_\d+)?\b', '', txt)
    lines = [l for l in txt.splitlines() if l.strip()]
    uniq = []
    for l in lines:
        if not uniq or l.strip() != uniq[-1].strip():
            uniq.append(l)
    return "\n".join(uniq).strip()

def is_duplicate_code(a: str, b: str) -> bool:
    return SequenceMatcher(None, a.strip(), b.strip()).ratio() > 0.8

def chunk_by_tokens(text: str) -> List[str]:
    segs = detect_code_blocks(clean_text_noise(text))
    chunks, buf, tok = [], [], 0

    def flush():
        nonlocal buf, tok
        if buf:
            chunks.append(" ".join(buf).strip())
            buf = []
            tok = 0

    for t, seg in segs:
        if not seg.strip(): continue
        if t == "code":
            seg = seg.strip()
            seg_toks = num_tokens(seg)
            code_parts = [seg] if seg_toks <= MAX_TOKENS else split_huge_code_block(seg)
            # dedupe similar adjacent code blocks (Lisp vs JS)
            if buf and any(is_duplicate_code(seg, b) for b in buf if b.startswith("(") or b.startswith("function")):
                continue
            for part in code_parts:
                part_toks = num_tokens(part)
                if tok + part_toks > MAX_TOKENS: flush()
                buf.append(part)
                tok += part_toks
                if tok >= MAX_TOKENS: flush()
            continue

        for s in safe_sentence_tokenize(seg):
            s = s.strip()
            if not s: continue
            stoks = num_tokens(s)
            if stoks > MAX_TOKENS:
                words = s.split()
                for i in range(0,len(words),HARD_SENT_WORD_SPLIT):
                    sub = " ".join(words[i:i+HARD_SENT_WORD_SPLIT])
                    if tok + num_tokens(sub) > MAX_TOKENS: flush()
                    buf.append(sub)
                    tok += num_tokens(sub)
                    if tok >= MAX_TOKENS: flush()
                continue
            if tok + stoks > MAX_TOKENS: flush()
            buf.append(s)
            tok += stoks
    if buf: flush()
    return [c for c in chunks if c.strip()]

def make_chunk_key(e): return (e.get("title") or "", e.get("parent_title") or "", e.get("source_file") or "")

# ---------- MAIN ----------
def main():
    all_chunks = []
    files = sorted(glob(os.path.join(CHAPTER_JSON_DIR, CHAPTER_FILE_GLOB)))
    print(f"📚 Processing {len(files)} chapter files...")

    for fpath in files:
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)

        data = [d for d in data if isinstance(d, dict) and d.get("content")]
        data.sort(key=lambda x: (x.get("parent_title") or "", x.get("title") or "", x.get("paragraph_index", 0)))

        for (title, parent, src), grp in groupby(data, key=make_chunk_key):
            paras = []
            seen = set()
            for p in grp:
                txt = clean_text_noise(p["content"])
                if txt and txt not in seen:
                    seen.add(txt)
                    paras.append(txt)
            merged = "\n".join(paras)
            if not merged.strip(): continue

            subs = chunk_by_tokens(merged)
            base = os.path.splitext(os.path.basename(fpath))[0]
            safe_title = (title or "section").replace(" ", "_")[:60]
            for i, ch in enumerate(subs, 1):
                all_chunks.append({
                    "chapter_file": os.path.basename(fpath),
                    "section": parent or None,
                    "subsection": title or None,
                    "chunk_id": f"{base}_{safe_title}_{i}",
                    "chunk_index": i,
                    "content": ch,
                    "token_count": num_tokens(ch),
                    "source_files": [src]
                })

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        json.dump(all_chunks, out, indent=2, ensure_ascii=False)

    if all_chunks:
        avg = sum(c["token_count"] for c in all_chunks)/len(all_chunks)
        print(f"✅ Created {len(all_chunks)} chunks → {OUTPUT_FILE}")
        print(f"📊 Avg tokens: {avg:.1f}, Max: {max(c['token_count'] for c in all_chunks)}")
    else:
        print("⚠️ No chunks produced.")

if __name__ == "__main__":
    main()
