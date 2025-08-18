import argparse
import csv
import re
from pathlib import Path


START_MARK = "<!-- DSQR:START -->"
END_MARK = "<!-- DSQR:END -->"


def read_rows(csv_path: Path, start: int, count: int):
    rows = []
    with csv_path.open('r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        all_rows = list(reader)
        # 1-based indexing from CSV id order
        sl = slice(max(0, start - 1), max(0, start - 1) + count)
        rows = all_rows[sl]
    return rows


def paragraphs_from_text(raw: str):
    if not raw:
        return []
    text = raw.replace('\r\n', '\n').replace('\r', '\n').strip()
    parts = [p.strip() for p in re.split(r"\n\s*\n+", text) if p.strip()]
    return parts if parts else [text]


def to_block(paragraphs):
    if paragraphs:
        para_html = "\n                ".join(
            '<p class="memorial-description">' + (p.replace('\n', '<br/>')) + '</p>'
            for p in paragraphs
        )
    else:
        para_html = '<p class="memorial-description"></p>'
    return (
        f"{START_MARK}\n"
        f"            <section class=\"memorial-section fade-in-up\">\n"
        f"                <i class=\"fas fa-scroll memorial-icon\"></i>\n"
        f"                <h2 class=\"memorial-title\">Tổng quan</h2>\n"
        f"                {para_html}\n"
        f"            </section>\n"
        f"{END_MARK}"
    )


def ensure_meta(content: str, dsqr_id: str) -> tuple[str, bool]:
    changed = False
    meta_pattern = re.compile(r'<meta\s+name="dsqr-id"\s+content="[^"]*"\s*/?>', re.IGNORECASE)
    new_meta = f'<meta name="dsqr-id" content="{dsqr_id}">'
    if meta_pattern.search(content):
        new_content = meta_pattern.sub(new_meta, content)
        if new_content != content:
            content = new_content
            changed = True
    else:
        head_open = re.search(r"<head[^>]*>", content, flags=re.IGNORECASE)
        if head_open:
            insert_idx = head_open.end()
            content = content[:insert_idx] + "\n    " + new_meta + "\n" + content[insert_idx:]
            changed = True
    return content, changed


def insert_block(content: str, block: str) -> tuple[str, bool]:
    # Replace existing block
    if START_MARK in content and END_MARK in content:
        new_content = re.sub(r"<!-- DSQR:START -->(.|\n|\r)*?<!-- DSQR:END -->", block, content)
        return new_content, new_content != content
    # Insert before Timeline marker if present
    anchor = '<!-- Timeline -->'
    if anchor in content:
        return content.replace(anchor, f"{block}\n\n            {anchor}"), True
    # Fallback: before </main>
    m = re.search(r"</main>", content)
    if m:
        idx = m.start()
        return content[:idx] + block + "\n\n" + content[idx:], True
    return content, False


def process_batch(repo_root: Path, start: int, count: int):
    csv_path = repo_root / 'tools' / 'examples' / 'dsqr_3cols.csv'
    rows = read_rows(csv_path, start, count)
    updated, skipped = [], []
    for row in rows:
        slug = (row.get('slug') or '').strip()
        dsqr_id = (row.get('id') or '').strip()
        text = row.get('text') or ''
        if not slug:
            continue
        html_path = repo_root / 'card' / slug / 'index.html'
        if not html_path.exists():
            skipped.append(slug)
            continue
        content = html_path.read_text(encoding='utf-8')
        content, meta_changed = ensure_meta(content, dsqr_id)
        block = to_block(paragraphs_from_text(text))
        content2, block_changed = insert_block(content, block)
        if meta_changed or block_changed:
            html_path.write_text(content2, encoding='utf-8')
            updated.append(slug)
    return updated, skipped


def main():
    parser = argparse.ArgumentParser(description='Update cards from CSV in small batches.')
    parser.add_argument('--start', type=int, default=1, help='1-based index of first row to process (default: 1)')
    parser.add_argument('--count', type=int, default=5, help='How many rows to process (default: 5)')
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    updated, skipped = process_batch(repo_root, args.start, args.count)
    print('UPDATED:', len(updated), updated)
    print('SKIPPED:', len(skipped), skipped)


if __name__ == '__main__':
    main()


