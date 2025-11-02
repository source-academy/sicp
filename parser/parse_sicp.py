import os
import re
import xml.etree.ElementTree as ET
import html
import json

# Path to chapter folders
SICP_XML_DIR = os.path.join(os.path.dirname(__file__), "..", "xml")

def parse_file(file_path, parent_title=None, depth=0):
    """
    Recursively parse any XML file (chapter, section, or subsection).
    """
    indent = "  " * depth  # for nice indentation in logs

    if not os.path.exists(file_path):
        print(f"{indent}⚠️ Missing file: {file_path}")
        return []

    print(f"{indent}📄 Parsing ({depth=}): {file_path}")

    # Parse and unescape
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
    except Exception as e:
        print(f"{indent}❌ XML parse error in {file_path}: {e}")
        return []

    xml_text = html.unescape(ET.tostring(root, encoding="unicode"))
    chunks = []

    # Identify tag type
    tag_type = root.tag.upper()
    if root.find("NAME") is not None:
        title = " ".join(root.find("NAME").itertext())
        title = re.sub(r"\s+", " ", title).strip()
    else:
        title = "Untitled"

    # Extract text paragraphs
    text_blocks = root.findall(".//TEXT")
    print(f"{indent}🧩 Found {len(text_blocks)} <TEXT> blocks in {os.path.basename(file_path)}")

    for i, t in enumerate(text_blocks, start=1):
        for bad_tag in ["INDEX", "LABEL", "CITATION", "FOOTNOTE", "COMMENT", "WEB_ONLY"]:
            for el in t.findall(f".//{bad_tag}"):
                el.clear()

        text_content = " ".join(t.itertext()).strip()
        text_content = re.sub(r"\s+", " ", text_content)

        if text_content:
            chunks.append({
                "source_file": os.path.basename(file_path),
                "tag_type": tag_type,
                "title": title,
                "parent_title": parent_title,
                "depth": depth,
                "paragraph_index": i,
                "content": text_content
            })

    # Look for section and subsection references
    section_refs = re.findall(r"&section([\d\.]+);", xml_text)
    subsection_refs = re.findall(r"&subsection([\d\.]+);", xml_text)

    if section_refs:
        print(f"{indent}🔍 Found {len(section_refs)} section ref(s): {section_refs}")
    if subsection_refs:
        print(f"{indent}  ↳ Found {len(subsection_refs)} subsection ref(s): {subsection_refs}")

    # Recurse into sections
    for ref in section_refs:
        section_folder = os.path.join(os.path.dirname(file_path), f"section{ref.split('.')[0]}")
        section_file = os.path.join(section_folder, f"section{ref.split('.')[0]}.xml")
        print(f"{indent}➡️  Going into section file: {section_file}")
        chunks.extend(parse_file(section_file, parent_title=title, depth=depth + 1))

    # Recurse into subsections
    for ref in subsection_refs:
        subsection_file = os.path.join(os.path.dirname(file_path), f"subsection{ref.split('.')[0]}.xml")
        print(f"{indent}➡️  Going into subsection file: {subsection_file}")
        chunks.extend(parse_file(subsection_file, parent_title=title, depth=depth + 1))

    print(f"{indent}✅ Done parsing {os.path.basename(file_path)}, total chunks so far: {len(chunks)}\n")
    return chunks

if __name__ == "__main__":
    print("🚀 Starting full SICP parse\n")

    # ✅ Automatically detect all chapter folders (chapter1, chapter2, ...)
    for chapter_dir in sorted(os.listdir(SICP_XML_DIR)):
        if not chapter_dir.startswith("chapter"):
            continue

        chapter_path = os.path.join(SICP_XML_DIR, chapter_dir, f"{chapter_dir}.xml")
        if not os.path.exists(chapter_path):
            print(f"⚠️ Skipping {chapter_dir}: main XML not found\n")
            continue

        print(f"\n==============================")
        print(f"📘 Parsing {chapter_dir}")
        print(f"==============================")

        all_chunks = parse_file(chapter_path)
        print(f"✅ Extracted {len(all_chunks)} chunks for {chapter_dir}\n")

        # Save separate JSON for each chapter
        out_path = os.path.join(os.path.dirname(__file__), f"{chapter_dir}_chunks.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(all_chunks, f, indent=2, ensure_ascii=False)

        print(f"💾 Saved {chapter_dir}_chunks.json ({len(all_chunks)} chunks)\n")

    print("🏁 All chapters processed successfully!")