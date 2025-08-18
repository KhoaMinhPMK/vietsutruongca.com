import json
import re
from pathlib import Path


def load_records(json_path: Path):
    with json_path.open('r', encoding='utf-8') as f:
        return json.load(f)


def split_paragraphs(raw_text: str):
    if not raw_text:
        return []
    text = raw_text.replace('\r\n', '\n').replace('\r', '\n').strip()
    # Split by blank lines into paragraphs
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n+", text) if p.strip()]
    return paragraphs


def paragraph_to_html(paragraph: str) -> str:
    if '\n' in paragraph:
        inner = '<br/>'.join(map(str.strip, paragraph.split('\n')))
        return f'<p class="memorial-description">{inner}</p>'
    return f'<p class="memorial-description">{paragraph}</p>'


def build_block(paragraphs):
    start_marker = '<!-- DSQR:START -->'
    end_marker = '<!-- DSQR:END -->'
    if paragraphs:
        paras_html = "\n                ".join(paragraph_to_html(p) for p in paragraphs)
    else:
        paras_html = '<p class="memorial-description"></p>'
    block = f"""
{start_marker}
            <section class=\"memorial-section fade-in-up\">
                <i class=\"fas fa-scroll memorial-icon\"></i>
                <h2 class=\"memorial-title\">Tổng quan</h2>
                {paras_html}
            </section>
{end_marker}
""".strip('\n')
    return block, start_marker, end_marker


def slug_to_display_name(slug: str) -> str:
    base = (slug or '').strip().replace('-', ' ').replace('_', ' ')
    tokens = [t for t in base.split(' ') if t]
    return ' '.join(t.capitalize() for t in tokens) if tokens else slug


def apply_header_customization(content: str, display_name: str) -> tuple[str, bool]:
    changed = False
    # Update <title> if it looks like the default
    title_pattern = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
    m = title_pattern.search(content)
    if m:
        current_title = m.group(1).strip()
        if current_title == 'Hùng Vương - Quốc Tổ Dân Tộc Việt Nam':
            new_title = f"{display_name} - Việt Sử Trường Ca"
            content = title_pattern.sub(f"<title>{new_title}</title>", content)
            changed = True

    # Update hero-title if it is the default text
    hero_title_pattern = re.compile(r"(<h1\s+class=\"hero-title\"[^>]*>)(.*?)(</h1>)", re.IGNORECASE | re.DOTALL)
    m = hero_title_pattern.search(content)
    if m:
        current_hero = m.group(2).strip()
        if current_hero == 'HÙNG VƯƠNG':
            new_hero = display_name.upper()
            content = hero_title_pattern.sub(rf"\1{new_hero}\3", content)
            changed = True

    # Update hero-subtitle if it is the default text
    hero_sub_pattern = re.compile(r"(<p\s+class=\"hero-subtitle\"[^>]*>)(.*?)(</p>)", re.IGNORECASE | re.DOTALL)
    m = hero_sub_pattern.search(content)
    if m:
        current_sub = m.group(2).strip()
        if current_sub == 'Quốc Tổ Dân Tộc Việt Nam':
            new_sub = 'Chủ đề lịch sử Việt Nam'
            content = hero_sub_pattern.sub(rf"\1{new_sub}\3", content)
            changed = True

    # Optionally adjust hero-period if it is the exact default
    hero_period_pattern = re.compile(r"(<div\s+class=\"hero-period\"[^>]*>)(.*?)(</div>)", re.IGNORECASE | re.DOTALL)
    m = hero_period_pattern.search(content)
    if m:
        current_period = m.group(2).strip()
        if current_period == 'Triều đại Hùng Vương - Nước Văn Lang':
            new_period = 'Tư liệu tổng quan'
            content = hero_period_pattern.sub(rf"\1{new_period}\3", content)
            changed = True

    return content, changed


def ensure_meta_dsqr_id(content: str, dsqr_id: int) -> tuple[str, bool]:
    changed = False
    # Replace existing meta if present
    meta_pattern = re.compile(r'<meta\s+name="dsqr-id"\s+content="[^"]*"\s*/?>', re.IGNORECASE)
    new_meta = f'<meta name="dsqr-id" content="{dsqr_id}">'
    if meta_pattern.search(content):
        new_content = meta_pattern.sub(new_meta, content)
        if new_content != content:
            changed = True
            content = new_content
    else:
        # Insert right after <head>
        head_open = re.search(r"<head[^>]*>", content, flags=re.IGNORECASE)
        if head_open:
            insert_idx = head_open.end()
            prefix = content[:insert_idx]
            suffix = content[insert_idx:]
            content = prefix + "\n    " + new_meta + "\n" + suffix
            changed = True
    return content, changed


def update_html_file(html_path: Path, overview_text: str, dsqr_id: int) -> bool:
    content = html_path.read_text(encoding='utf-8')
    # Header customization based on slug-derived display name (only if using defaults)
    display_name = slug_to_display_name(html_path.parent.name)
    content, header_changed = apply_header_customization(content, display_name)
    paragraphs = split_paragraphs(overview_text)
    block, start_marker, end_marker = build_block(paragraphs)

    # Ensure meta dsqr-id first
    content, meta_changed = ensure_meta_dsqr_id(content, dsqr_id)

    # Replace existing block if present
    if start_marker in content and end_marker in content:
        new_content = re.sub(r"<!-- DSQR:START -->(.|\n|\r)*?<!-- DSQR:END -->", block, content)
        if new_content != content:
            html_path.write_text(new_content, encoding='utf-8')
            return True
        if meta_changed or header_changed:
            html_path.write_text(content, encoding='utf-8')
            return True
        return False

    # Insert before Timeline anchor if exists
    insert_anchor = '<!-- Timeline -->'
    if insert_anchor in content:
        new_content = content.replace(insert_anchor, f"{block}\n\n            {insert_anchor}")
        html_path.write_text(new_content, encoding='utf-8')
        return True

    # Fallback: insert before </main>
    match = re.search(r"</main>", content)
    if match:
        idx = match.start()
        new_content = content[:idx] + block + "\n\n" + content[idx:]
        html_path.write_text(new_content, encoding='utf-8')
        return True

    return False


def main():
    repo_root = Path(__file__).resolve().parents[1]
    json_path = repo_root / 'tools' / 'examples' / 'dsqr_3cols.json'
    if not json_path.exists():
        print('ERROR: JSON data not found:', json_path)
        return

    records = load_records(json_path)
    updated = []
    skipped = []

    # Map certain combined slugs to additional target folders
    aliases = {
        # Use the shared content for both individual pages
        'leloi-vualethaito': ['vualethaito', 'leloi'],
    }

    for rec in records:
        slug = (rec.get('slug') or '').strip()
        overview = rec.get('text') or ''
        if not slug:
            continue
        target_slugs = [slug] + aliases.get(slug, [])
        for target_slug in target_slugs:
            html_path = repo_root / 'card' / target_slug / 'index.html'
            if not html_path.exists():
                if target_slug == slug:
                    skipped.append(slug)
                continue
            try:
                if update_html_file(html_path, overview, int(rec.get('id') or 0)):
                    updated.append(target_slug)
            except Exception as exc:
                print('ERROR updating', target_slug, '-', exc)
                if target_slug == slug:
                    skipped.append(target_slug)

    print('UPDATED:', len(updated))
    if updated:
        print('Updated slugs:', ','.join(updated))
    print('SKIPPED (missing or failed):', len(skipped))
    if skipped:
        print('Skipped slugs:', ','.join(skipped))


if __name__ == '__main__':
    main()


