#!/usr/bin/env python3
"""
对比 llm_release_timeline CSV, README.md 和 llm_release_timeline_2022-11_to_2026-04.md 表格中每个单元格的内容一致性
每个单元格可能有多个项目（用 + 分隔），需要分别解析并对比
"""

import csv
import re
import json
from pathlib import Path


def parse_readme_table(readme_path):
    """解析 README.md 中的表格，返回 {month: {vendor: set([items...])}}"""
    with open(readme_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # 找到表格开始位置
    table_start = -1
    for i, line in enumerate(lines):
        if line.startswith("| Month |"):
            table_start = i
            break

    if table_start == -1:
        raise ValueError("README.md 中未找到表格")

    # 提取表头
    header_line = lines[table_start]
    headers = [h.strip() for h in header_line.split("|")[1:-1]]

    # 解析每一行数据
    data = {}
    months_set = set()

    for line in lines[table_start + 2 :]:
        line = line.strip()
        if not line or line.startswith("|---"):
            continue
        if line.startswith("|"):
            cells = [c.strip() for c in line.split("|")[1:-1]]
            if len(cells) < 2:
                continue
            month = cells[0]
            months_set.add(month)

            data[month] = {}
            for i, cell in enumerate(cells[1:], start=1):
                if i - 1 < len(headers):
                    vendor = headers[i - 1]
                    items = parse_cell_items(cell)
                    data[month][vendor] = items

    return data, headers, months_set


def parse_md_table(md_path):
    """解析 llm_release_timeline_2022-11_to_2026-04.md 中的表格"""
    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # 找到表格开始位置
    table_start = -1
    for i, line in enumerate(lines):
        if "Month" in line and "|" in line and "Open-Source" in line:
            table_start = i
            break

    if table_start == -1:
        raise ValueError("MD 文件中未找到表格")

    # 提取表头
    header_line = lines[table_start]
    raw_headers = header_line.split("|")[1:-1]
    headers = [h.strip() for h in raw_headers]

    # 跳过第一个 header (Month) 因为它是行标签不是 vendor
    if headers and headers[0] == "Month":
        headers = headers[1:]

    # 解析每一行数据
    data = {}
    months_set = set()

    for line in lines[table_start + 2 :]:
        line = line.strip()
        if not line or line.startswith("|---"):
            continue
        if line.startswith("|"):
            cells = [c.strip() for c in line.split("|")[1:-1]]
            if len(cells) < 2:
                continue
            month = cells[0]
            months_set.add(month)

            data[month] = {}
            # 从 cells[1:] 开始，因为 cells[0] 是月份
            for i, cell in enumerate(cells[1:], start=1):
                if i - 1 < len(headers):
                    vendor = headers[i - 1]
                    items = parse_cell_items(cell)
                    data[month][vendor] = items

    return data, headers, months_set


def parse_cell_items(cell):
    """解析单元格内容，提取各个项目名称"""
    if not cell or cell == "":
        return set()

    items = set()
    parts = cell.split("+")

    for part in parts:
        part = part.strip()
        if not part:
            continue
        match = re.match(r"\[([^\]]+)\]", part)
        if match:
            items.add(match.group(1).strip())
        else:
            items.add(part.strip())

    return items


def parse_csv(csv_path):
    """解析 CSV 文件，返回 {month: {vendor: set([items...])}}"""
    data = {}
    headers = []
    months_set = set()

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if len(rows) < 2:
        raise ValueError("CSV 文件行数不足")

    headers = [h.strip() for h in rows[0]]

    for row in rows[1:]:
        if len(row) < 2:
            continue
        month = row[0].strip()
        months_set.add(month)

        data[month] = {}
        for i, cell in enumerate(row[1:], start=1):
            if i - 1 < len(headers):
                vendor = headers[i - 1]
                items = parse_csv_cell_items(cell)
                data[month][vendor] = items

    return data, headers, months_set


def parse_csv_cell_items(cell):
    """解析 CSV 单元格内容"""
    if not cell or cell.strip() == "":
        return set()

    items = set()
    parts = cell.split("+")

    for part in parts:
        part = part.strip()
        if part:
            items.add(part)

    return items


def normalize_month(month):
    """将月份格式标准化为 YYYY-MM 格式"""
    month = month.strip()
    if re.match(r"^\d{4}-\d{2}$", month):
        return month  # Already in correct format
    # Handle 22-Nov -> 2022-11, etc.
    if re.match(r"^\d{2}-[A-Za-z]{3}$", month):
        year_short, mon_abbr = month.split("-")
        year = "20" + year_short
        month_num = {
            "Jan": "01",
            "Feb": "02",
            "Mar": "03",
            "Apr": "04",
            "May": "05",
            "Jun": "06",
            "Jul": "07",
            "Aug": "08",
            "Sep": "09",
            "Oct": "10",
            "Nov": "11",
            "Dec": "12",
        }
        return f"{year}-{month_num.get(mon_abbr.capitalize(), mon_abbr)}"
    return month


def compare_all_three(csv_path, readme_path, md_path):
    """对比 CSV, README.md 和 MD 三个文件"""
    csv_data, csv_headers, csv_months = parse_csv(csv_path)
    readme_data, readme_headers, readme_months = parse_readme_table(readme_path)
    md_data, md_headers, md_months = parse_md_table(md_path)

    # 标准化月份并创建映射
    csv_month_map = {normalize_month(m): m for m in csv_months}
    readme_month_map = {normalize_month(m): m for m in readme_months}
    md_month_map = {normalize_month(m): m for m in md_months}

    all_months_norm = (
        set(csv_month_map.keys())
        | set(readme_month_map.keys())
        | set(md_month_map.keys())
    )
    all_vendors = set(csv_headers[1:]) | set(readme_headers[1:]) | set(md_headers[1:])

    differences = []

    print("=" * 80)
    print("Start comparing 3 files: CSV, README.md, and MD")
    print("=" * 80)

    # 统计信息
    print(f"\nFile structures:")
    print(f"  CSV: {len(csv_months)} months, {len(csv_headers) - 1} vendors")
    print(
        f"  README.md: {len(readme_months)} months, {len(readme_headers) - 1} vendors"
    )
    print(f"  MD: {len(md_months)} months, {len(md_headers) - 1} vendors")

    # 对比每个月份
    for month_norm in sorted(all_months_norm):
        # 获取原始月份表示
        csv_month_orig = csv_month_map.get(month_norm)
        readme_month_orig = readme_month_map.get(month_norm)
        md_month_orig = md_month_map.get(month_norm)

        csv_month_data = csv_data.get(csv_month_orig, {}) if csv_month_orig else {}
        readme_month_data = (
            readme_data.get(readme_month_orig, {}) if readme_month_orig else {}
        )
        md_month_data = md_data.get(md_month_orig, {}) if md_month_orig else {}

        # 对比每个厂商
        for vendor in sorted(all_vendors):
            csv_items = csv_month_data.get(vendor, set())
            readme_items = readme_month_data.get(vendor, set())
            md_items = md_month_data.get(vendor, set())

            # CSV vs README
            if csv_items != readme_items:
                csv_only = csv_items - readme_items
                readme_only = readme_items - csv_items
                if csv_only or readme_only:
                    differences.append(
                        {
                            "pair": "CSV vs README",
                            "month": month_norm,
                            "vendor": vendor,
                            "csv_only": sorted(csv_only),
                            "readme_only": sorted(readme_only),
                        }
                    )

            # CSV vs MD
            if csv_items != md_items:
                csv_only = csv_items - md_items
                md_only = md_items - csv_items
                if csv_only or md_only:
                    differences.append(
                        {
                            "pair": "CSV vs MD",
                            "month": month_norm,
                            "vendor": vendor,
                            "csv_only": sorted(csv_only),
                            "md_only": sorted(md_only),
                        }
                    )

            # README vs MD
            if readme_items != md_items:
                readme_only = readme_items - md_items
                md_only = md_items - readme_items
                if readme_only or md_only:
                    differences.append(
                        {
                            "pair": "README vs MD",
                            "month": month_norm,
                            "vendor": vendor,
                            "readme_only": sorted(readme_only),
                            "md_only": sorted(md_only),
                        }
                    )

    print(f"\nFound {len(differences)} inconsistencies total\n")

    # 按月份分组显示
    if differences:
        by_month = {}
        for d in differences:
            m = d["month"]
            if m not in by_month:
                by_month[m] = []
            by_month[m].append(d)

        for month in sorted(by_month.keys()):
            print("-" * 80)
            print(f"Month: {month}")
            print("-" * 80)
            for diff in by_month[month]:
                pair = diff["pair"]
                vendor = diff["vendor"]
                print(f"\n  [{pair}] {vendor}:")
                if "csv_only" in diff and diff["csv_only"]:
                    print(f"    CSV only: {diff['csv_only']}")
                if "readme_only" in diff and diff["readme_only"]:
                    print(f"    README only: {diff['readme_only']}")
                if "md_only" in diff and diff["md_only"]:
                    print(f"    MD only: {diff['md_only']}")
    else:
        print("\n[OK] All cells are perfectly consistent across all 3 files!")

    return differences


def main():
    base_path = Path(__file__).parent
    csv_path = base_path / "llm_release_timeline_2022-11_to_2026-04.csv"
    readme_path = base_path / "README.md"
    md_path = base_path / "llm_release_timeline_2022-11_to_2026-04.md"

    if not csv_path.exists():
        print(f"Error: CSV file not found {csv_path}")
        return

    if not readme_path.exists():
        print(f"Error: README file not found {readme_path}")
        return

    if not md_path.exists():
        print(f"Error: MD file not found {md_path}")
        return

    differences = compare_all_three(csv_path, readme_path, md_path)

    # JSON output
    if differences:
        print("\n" + "=" * 80)
        print("JSON format result:")
        print("=" * 80)
        print(json.dumps(differences, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
