#!/usr/bin/env python3
"""Chase an interviewer through their own feed.

The 2026-08-09 dig's most productive angle: Robert Scheer's feed carried twelve Kiriakou
episodes when the corpus held four. This generalises it — give it show names, it resolves
each to a real podcast feed (via the iTunes lookup API), walks every item, and prints the
ones matching the search term with date, duration and enclosure URL.

Diff the output against the corpus by DATE, not by title: the corpus files interviews under
the show's *publisher* name and under the YouTube upload date, so title and name greps miss
episodes the feed plainly lists.

Usage: feed-scan.py <show name> [<show name> ...]
       feed-scan.py --feed <feed url> [<feed url> ...]
Env:   KIR_TERM (regex, default matches Kiriakou and its common misspellings)
"""
import json
import os
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

TERM = re.compile(os.environ.get("KIR_TERM", r"kiriako|kiriaco|kyriako|kiriakow|kiriaku|curriac|kirakou|kiriacou"), re.I)
ITUNES = "https://itunes.apple.com/search"


def curl(url, timeout=60):
    r = subprocess.run(
        ["curl", "-sL", "--max-time", str(timeout), "-A", "Mozilla/5.0"],
        capture_output=True,
    ) if False else subprocess.run(
        ["curl", "-sL", "--max-time", str(timeout), "-A", "Mozilla/5.0", url],
        capture_output=True,
    )
    return r.stdout


def resolve_feeds(name):
    """Show name -> candidate feed URLs, best match first."""
    q = re.sub(r"\s+", "+", name.strip())
    raw = curl(f"{ITUNES}?media=podcast&limit=8&term={q}")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []
    out = []
    for r in data.get("results", []):
        feed = r.get("feedUrl")
        if feed:
            out.append((r.get("collectionName", "?"), feed))
    return out


def dur_minutes(it):
    for tag in ("{http://www.itunes.com/dtds/podcast-1.0/}duration", "duration"):
        v = it.findtext(tag)
        if v:
            v = v.strip()
            if v.isdigit():
                return int(v) // 60
            parts = v.split(":")
            try:
                parts = [int(p) for p in parts]
            except ValueError:
                return None
            if len(parts) == 3:
                return parts[0] * 60 + parts[1]
            if len(parts) == 2:
                return parts[0]
    enc = it.find("enclosure")
    if enc is not None and enc.get("length"):
        try:                       # rough: assume ~1 MB/min at podcast bitrates
            return int(enc.get("length")) // 1_000_000
        except ValueError:
            pass
    return None


def scan_feed(label, feed):
    raw = curl(feed, timeout=90)
    if not raw:
        print(f"  [no data] {feed}", file=sys.stderr)
        return 0
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as e:
        print(f"  [unparseable] {feed}: {e}", file=sys.stderr)
        return 0
    items = root.findall(".//item")
    hits = 0
    for it in items:
        title = it.findtext("title") or ""
        desc = (it.findtext("description") or "") + " " + (
            it.findtext("{http://purl.org/rss/1.0/modules/content/}encoded") or "")
        sub = it.findtext("{http://www.itunes.com/dtds/podcast-1.0/}subtitle") or ""
        if not TERM.search(title + " " + desc + " " + sub):
            continue
        enc = it.find("enclosure")
        url = enc.get("url") if enc is not None else "-"
        pub = it.findtext("pubDate") or ""
        try:
            d = parsedate_to_datetime(pub).strftime("%Y-%m-%d")
        except (TypeError, ValueError):
            d = "????-??-??"
        mn = dur_minutes(it)
        where = "TITLE" if TERM.search(title) else "desc"
        print(f"{d}\t{mn if mn is not None else '?'}m\t{where}\t{label}\t{title[:75]}\t{url}")
        hits += 1
    print(f"  [{label}] {len(items)} items, {hits} hits", file=sys.stderr)
    return hits


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__, file=sys.stderr)
        sys.exit(1)
    if args[0] == "--feed":
        for f in args[1:]:
            scan_feed(f.split("/")[2], f)
        return
    for name in args:
        feeds = resolve_feeds(name)
        if not feeds:
            print(f"  [no feed] {name}", file=sys.stderr)
            continue
        seen = set()
        for label, feed in feeds[:3]:
            if feed in seen:
                continue
            seen.add(feed)
            scan_feed(label, feed)


if __name__ == "__main__":
    main()
