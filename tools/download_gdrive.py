import argparse
import csv
import os
import re
import shutil
import sys
import tempfile
from typing import List, Tuple, Optional


def ensure_gdown_installed() -> None:
    try:
        import gdown  # noqa: F401
    except Exception as exc:  # pragma: no cover
        print(
            "[ERROR] Thư viện 'gdown' chưa được cài. Hãy chạy: py -m pip install --user gdown",
            file=sys.stderr,
        )
        raise


def list_card_subdirs(card_dir: str) -> List[str]:
    if not os.path.isdir(card_dir):
        raise FileNotFoundError(f"Không tìm thấy thư mục: {card_dir}")
    all_entries = [
        name for name in os.listdir(card_dir)
        if os.path.isdir(os.path.join(card_dir, name))
    ]
    return sorted(all_entries)


def read_links(path: str) -> List[str]:
    links: List[str] = []
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue
            if line.startswith("#"):
                continue
            links.append(line)
    return links


def read_map_csv(path: str) -> List[Tuple[str, str, Optional[str]]]:
    rows: List[Tuple[str, str, Optional[str]]] = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row:
                continue
            if row[0].strip().startswith("#"):
                continue
            folder = row[0].strip()
            url = row[1].strip() if len(row) > 1 else ""
            filename = row[2].strip() if len(row) > 2 and row[2].strip() != "" else None
            if not folder or not url:
                continue
            rows.append((folder, url, filename))
    return rows


def safe_move(src_path: str, dst_dir: str, desired_name: Optional[str] = None, overwrite: bool = False) -> str:
    os.makedirs(dst_dir, exist_ok=True)
    base_name = desired_name if desired_name else os.path.basename(src_path)
    target_path = os.path.join(dst_dir, base_name)

    if overwrite:
        return shutil.move(src_path, target_path)

    if not os.path.exists(target_path):
        return shutil.move(src_path, target_path)

    name, ext = os.path.splitext(base_name)
    counter = 1
    while True:
        candidate = os.path.join(dst_dir, f"{name}_{counter}{ext}")
        if not os.path.exists(candidate):
            return shutil.move(src_path, candidate)
        counter += 1


def extract_drive_id(url: str) -> Optional[str]:
    # Supports: https://drive.google.com/file/d/<ID>/view, .../u/0/uc?id=<ID>&export=download, etc.
    patterns = [
        r"/d/([a-zA-Z0-9_-]{10,})/",
        r"[?&]id=([a-zA-Z0-9_-]{10,})",
    ]
    for pat in patterns:
        m = re.search(pat, url)
        if m:
            return m.group(1)
    return None


def is_drive_folder_url(url: str) -> bool:
    # Heuristics for folder links
    return (
        "drive.google.com/drive/folders/" in url
        or ("folders" in url and "drive.google.com" in url)
        or ("usp=drive_link" in url and "/folders/" in url)
    )


def download_with_gdown(url: str, dst_dir: str, desired_name: Optional[str] = None, overwrite: bool = False) -> str:
    import gdown

    # Use a temp dir to let gdown pick the server-provided filename, then move
    with tempfile.TemporaryDirectory() as tmp:
        cwd = os.getcwd()
        os.chdir(tmp)
        try:
            if is_drive_folder_url(url):
                # Tải cả thư mục; gdown trả về danh sách file đã tải.
                files = gdown.download_folder(url=url, quiet=False, use_cookies=False)
                if not files:
                    raise RuntimeError(f"Tải thư mục thất bại: {url}")
                # Di chuyển toàn bộ nội dung temp vào đích (giữ cấu trúc)
                os.makedirs(dst_dir, exist_ok=True)
                moved_count = 0
                for root, dirs, files_in_dir in os.walk(tmp):
                    rel = os.path.relpath(root, tmp)
                    target_root = dst_dir if rel == "." else os.path.join(dst_dir, rel)
                    os.makedirs(target_root, exist_ok=True)
                    for d in dirs:
                        os.makedirs(os.path.join(target_root, d), exist_ok=True)
                    for f in files_in_dir:
                        srcp = os.path.join(root, f)
                        # Ghi đè nếu cần, nếu không thì tạo tên mới
                        safe_move(srcp, target_root, desired_name=None, overwrite=overwrite)
                        moved_count += 1
                return os.path.join(dst_dir, f"<folder> ({moved_count} files)")
            else:
                # fuzzy=True giúp xử lý nhiều dạng link Drive khác nhau
                out_path = gdown.download(url=url, output=None, quiet=False, fuzzy=True)
                if not out_path:
                    raise RuntimeError(f"Tải thất bại: {url}")
                final_path = safe_move(out_path, dst_dir, desired_name=desired_name, overwrite=overwrite)
                return final_path
        finally:
            os.chdir(cwd)


def run_order_mode(card_dir: str, links_file: str, start_index: int, overwrite: bool) -> None:
    raise RuntimeError("Hàm cũ không còn dùng. Xem run_order_mode2.")


def run_order_mode2(
    card_dir: str,
    links_file: str,
    start_index: int,
    overwrite: bool,
    allow_mismatch: bool,
    skip_token: Optional[str],
    overflow_dir: Optional[str],
) -> None:
    subdirs = list_card_subdirs(card_dir)
    links = read_links(links_file)
    if start_index < 0 or start_index >= len(subdirs):
        raise ValueError(f"start-index ngoài phạm vi: {start_index}")
    subdirs = subdirs[start_index:]

    if not allow_mismatch and len(links) != len(subdirs):
        raise ValueError(
            (
                "Số link (%d) không khớp số thư mục còn lại (%d).\n"
                "- Dùng --allow-mismatch để map theo số ít hơn, hoặc --export-template để tạo CSV mẫu.\n"
                "- Thư mục từ vị trí %d: %s%s"
            )
            % (
                len(links),
                len(subdirs),
                start_index,
                subdirs[:5],
                "..." if len(subdirs) > 5 else "",
            )
        )

    pair_count = min(len(links), len(subdirs))
    print(
        "Sẽ xử lý %d cặp (links vs folders). Còn thừa: links=%d, folders=%d"
        % (pair_count, max(0, len(links) - pair_count), max(0, len(subdirs) - pair_count))
    )

    for i in range(pair_count):
        folder_name = subdirs[i]
        url = links[i]
        if skip_token and url.strip().lower() == skip_token.strip().lower():
            print(f"[-] Bỏ qua {folder_name} (skip token: {skip_token})")
            continue
        dst_dir = os.path.join(card_dir, folder_name)
        print(f"\n[+] {folder_name} ← {url}")
        try:
            saved = download_with_gdown(url, dst_dir, desired_name=None, overwrite=overwrite)
            print(f"    Đã lưu: {saved}")
        except Exception as e:
            print(f"    [LỖI] {e}")

    # Nếu còn link dư và người dùng muốn "bỏ ra ngoài": tải vào overflow_dir
    remaining_links = links[pair_count:]
    if remaining_links:
        target_overflow_dir = overflow_dir or os.path.join(os.getcwd(), "downloads_overflow")
        os.makedirs(target_overflow_dir, exist_ok=True)
        print(f"\n[=] Có {len(remaining_links)} link dư. Sẽ tải vào: {target_overflow_dir}")
        for url in remaining_links:
            if skip_token and url.strip().lower() == skip_token.strip().lower():
                print("[-] Bỏ qua 1 link dư (skip token)")
                continue
            try:
                saved = download_with_gdown(url, target_overflow_dir, desired_name=None, overwrite=overwrite)
                print(f"    Đã lưu: {saved}")
            except Exception as e:
                print(f"    [LỖI] {e}")


def run_map_mode(card_dir: str, map_csv: str, overwrite: bool) -> None:
    rows = read_map_csv(map_csv)
    print(f"Sẽ tải {len(rows)} file theo bảng ánh xạ trong: {map_csv}")
    for folder_name, url, filename in rows:
        dst_dir = os.path.join(card_dir, folder_name)
        print(f"\n[+] {folder_name} ({filename or 'giữ tên gốc'}) ← {url}")
        try:
            saved = download_with_gdown(url, dst_dir, desired_name=filename, overwrite=overwrite)
            print(f"    Đã lưu: {saved}")
        except Exception as e:
            print(f"    [LỖI] {e}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Tải hàng loạt file Google Drive và đặt vào thư mục con trong card/."
    )
    parser.add_argument("--card-dir", default="card", help="Thư mục gốc chứa các thư mục con (mặc định: card)")
    parser.add_argument("--list", dest="links_file", help="Đường dẫn file .txt chứa danh sách link (mỗi dòng 1 link)")
    parser.add_argument("--map", dest="map_csv", help="Đường dẫn file CSV: folder,url[,filename]")
    parser.add_argument("--start-index", type=int, default=0, help="Bắt đầu ánh xạ từ thư mục thứ N (0-based) ở chế độ --list")
    parser.add_argument("--overwrite", action="store_true", help="Ghi đè nếu trùng tên file")
    parser.add_argument("--print-folders", action="store_true", help="Chỉ in ra thứ tự thư mục trong card/ rồi thoát")
    parser.add_argument("--export-template", dest="export_template", help="Xuất CSV mẫu liệt kê toàn bộ thư mục trong card/")
    parser.add_argument("--allow-mismatch", action="store_true", help="Cho phép số link khác số thư mục (sẽ map theo số ít hơn)")
    parser.add_argument("--skip-token", default=None, help="Nếu một dòng link đúng bằng token này, sẽ bỏ qua thư mục tương ứng (vd: -)")
    parser.add_argument("--overflow-dir", default=None, help="Thư mục để lưu link dư nếu danh sách link dài hơn số thư mục (mặc định: downloads_overflow ở project root)")

    args = parser.parse_args()

    if args.print_folders:
        subdirs = list_card_subdirs(args.card_dir)
        print(f"Có {len(subdirs)} thư mục trong '{args.card_dir}' (đã sắp xếp alpha):")
        for i, name in enumerate(subdirs):
            print(f"{i:3d}: {name}")
        return

    if args.export_template:
        subdirs = list_card_subdirs(args.card_dir)
        out_path = args.export_template
        os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
        with open(out_path, "w", encoding="utf-8", newline="") as f:
            f.write("folder,url,filename\n")
            for name in subdirs:
                f.write(f"{name},,\n")
        print(f"Đã xuất mẫu CSV ({len(subdirs)} dòng) đến: {out_path}")
        return

    if not args.links_file and not args.map_csv:
        parser.error("Cần cung cấp --list hoặc --map")

    ensure_gdown_installed()

    if args.map_csv:
        run_map_mode(args.card_dir, args.map_csv, overwrite=args.overwrite)
    else:
        run_order_mode2(
            args.card_dir,
            args.links_file,
            start_index=args.start_index,
            overwrite=args.overwrite,
            allow_mismatch=args.allow_mismatch,
            skip_token=args.skip_token,
            overflow_dir=args.overflow_dir,
        )


if __name__ == "__main__":
    main()


