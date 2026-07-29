#!/usr/bin/env python3
"""Resolve the best-matching episode MP3 enclosure from a podcast RSS feed.

Usage: rss-pick.py <feed_url> <worklist_title> [<minutes>]
Prints one line: <mp3_url>\t<pubdate YYYYMMDD or ->>\t<item_title>
Exit 1 if nothing usable found. Uses curl (Python urllib fails SSL on this Mac).
"""
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from difflib import SequenceMatcher


def curl(url):
    r = subprocess.run(
        ["curl", "-sL", "--max-time", "60", "-A", "Mozilla/5.0", url],
        capture_output=True,
    )
    return r.stdout


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", (s or "").lower()).strip()


def parse_dur(s):
    if not s:
        return None
    s = s.strip()
    if s.isdigit():
        return int(s) / 60.0
    parts = s.split(":")
    try:
        parts = [int(p) for p in parts]
    except ValueError:
        return None
    if len(parts) == 3:
        return parts[0] * 60 + parts[1] + parts[2] / 60.0
    if len(parts) == 2:
        return parts[0] + parts[1] / 60.0
    return None


def pubdate(s):
    if not s:
        return "-"
    months = {m: i for i, m in enumerate(
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
         "Aug", "Sep", "Oct", "Nov", "Dec"], 1)}
    m = re.search(r"(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})", s)
    if m:
        d, mon, y = int(m.group(1)), months.get(m.group(2)[:3], 0), int(m.group(3))
        if mon:
            return f"{y:04d}{mon:02d}{d:02d}"
    return "-"


def main():
    feed = sys.argv[1]
    want_title = sys.argv[2] if len(sys.argv) > 2 else ""
    want_min = float(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3].replace(".", "").isdigit() else None

    data = curl(feed)
    if not data:
        print("ERR: empty feed", file=sys.stderr)
        sys.exit(1)
    try:
        root = ET.fromstring(data)
    except ET.ParseError as e:
        print(f"ERR: xml parse {e}", file=sys.stderr)
        sys.exit(1)

    ns = {"itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"}
    items = root.findall(".//item")
    if not items:
        print("ERR: no items", file=sys.stderr)
        sys.exit(1)

    wt = norm(want_title)
    cands = []
    for it in items:
        title = (it.findtext("title") or "").strip()
        desc = (it.findtext("description") or "")
        enc = it.find("enclosure")
        url = enc.get("url") if enc is not None else None
        if not url:
            continue
        durtxt = it.findtext("itunes:duration", default="", namespaces=ns)
        dur = parse_dur(durtxt)
        pd = pubdate(it.findtext("pubDate"))
        # scoring
        title_sim = SequenceMatcher(None, wt, norm(title)).ratio() if wt else 0
        has_kir = 1 if "kiriakou" in norm(title + " " + desc) else 0
        dur_score = 0
        if want_min and dur:
            dur_score = max(0, 1 - abs(dur - want_min) / max(want_min, 1))
        score = title_sim * 2 + has_kir * 1.5 + dur_score
        cands.append((score, title_sim, has_kir, url, pd, title))

    if not cands:
        print("ERR: no enclosures", file=sys.stderr)
        sys.exit(1)

    cands.sort(reverse=True)
    best = cands[0]
    # Guard: if title match is weak, require a Kiriakou signal or a single-item feed
    if best[1] < 0.55 and best[2] == 0 and len(items) > 1:
        # try any kiriakou item
        kir = [c for c in cands if c[2] == 1]
        if kir:
            best = kir[0]
        else:
            print("ERR: no confident match", file=sys.stderr)
            sys.exit(1)
    print(f"{best[3]}\t{best[4]}\t{best[5]}")


if __name__ == "__main__":
    main()
