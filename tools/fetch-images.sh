#!/bin/bash
# Fetch one image per article from Wikipedia/Commons.
# Each article slug maps to a Wikipedia article title; we pull that page's
# lead image, save it as public/images/<slug>.<ext>, and record attribution
# in public/images/credits.json.
#
# Idempotent: skips re-downloading images that already exist, but ALWAYS
# rebuilds credits.json from scratch so partial runs leave clean metadata.

set -uo pipefail

DEST="public/images"
mkdir -p "$DEST"
CREDITS="$DEST/credits.json"

# slug=wikipedia_title (URL-encoded as needed)
MAPPING=(
  "abu-zubaydah=Abu_Zubaydah"
  "asset-acquisition-cycle=Espionage"
  "benazir-bhutto=Benazir_Bhutto"
  "bill-casey=William_J._Casey"
  "bob-cia-hr=Central_Intelligence_Agency"
  "cia=Central_Intelligence_Agency"
  "cia-national-resources-division=Central_Intelligence_Agency"
  "cia-political-psychology-division=Central_Intelligence_Agency"
  "cold-cell=Solitary_confinement"
  "david-ransom=United_States_Department_of_State"
  "dgse=Directorate-General_for_External_Security"
  "enhanced-interrogation=Enhanced_interrogation_techniques"
  "five-eyes=Five_Eyes"
  "gerald-post=Jerrold_M._Post"
  "guantanamo-bay=Guantanamo_Bay_detention_camp"
  "gust-avrakotos=Gust_Avrakotos"
  "hummus=Hummus"
  "jeff-fahey=Jeff_Fahey"
  "john-brennan=John_O._Brennan"
  "john-kiriakou=John_Kiriakou"
  "jose-rodriguez=Jose_Rodriguez_(intelligence_officer)"
  "lincolns-last-turd=Ford%27s_Theatre"
  "mahmud=Al-Qaeda"
  "mitchell-and-jessen=James_Elmer_Mitchell"
  "mount-weather=Mount_Weather_Emergency_Operations_Center"
  "muhammad-atar=Ammar_al-Baluchi"
  "operating-directive=Diplomatic_cable"
  "pick-the-man-principle=Robert_H._Jackson"
  "ramzi-bin-al-shibh=Ramzi_bin_al-Shibh"
  "revolutionary-organization-17-november=Revolutionary_Organization_17_November"
  "richard-welch=Richard_Welch"
  "senate-torture-report=Senate_Intelligence_Committee_report_on_CIA_torture"
  "sleep-deprivation=Sleep_deprivation"
  "soylent-green-cable-easter-egg=Soylent_Green"
  "stephen-saunders=Stephen_Saunders_(British_Army_officer)"
  "strawberry-fields=Guantanamo_Bay"
  "surveillance-detection-route=Surveillance"
  "the-farm=Camp_Peary"
  "ticking-time-bomb=Ticking_time_bomb_scenario"
  "tyrell-vanto=Hollywood"
  "walling=Wall"
  "welch-45=M1911_pistol"
)

# Collect entries in a temp dir, assemble JSON at the end.
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

got=0
miss=0

fetch_credit() {
  local thumb="$1"
  local url_basename="${thumb##*/}"
  local file_for_meta="$url_basename"
  if [[ "$thumb" == *"/thumb/"* ]]; then
    file_for_meta=$(echo "$thumb" | sed -E 's|.*/thumb/[^/]+/[^/]+/([^/]+)/.*|\1|')
  fi

  local meta_json
  meta_json=$(curl -sL -A "KiriPedia/1.0" "https://commons.wikimedia.org/w/api.php?action=query&titles=File:${file_for_meta}&prop=imageinfo&iiprop=extmetadata&format=json" 2>/dev/null)
  local artist license
  artist=$(echo "$meta_json" | jq -r '.. | objects | .Artist?.value // empty' 2>/dev/null | head -1 | sed -E 's/<[^>]+>//g' | tr -d '\n' | head -c 200)
  license=$(echo "$meta_json" | jq -r '.. | objects | .LicenseShortName?.value // empty' 2>/dev/null | head -1 | tr -d '\n')
  [ -z "$artist" ] && artist="Unknown"
  [ -z "$license" ] && license="See Wikimedia Commons"
  echo "$artist|||$license"
}

for entry in "${MAPPING[@]}"; do
  slug="${entry%%=*}"
  title="${entry#*=}"

  sleep 1.2

  # If image already exists, just rebuild the credits entry from Wikipedia/Commons.
  existing=$(ls "$DEST/$slug".* 2>/dev/null | head -1)
  if [ -n "$existing" ]; then
    ext="${existing##*.}"
    # Re-derive the thumb URL so we can fetch up-to-date Commons metadata.
    json=$(curl -sL -A "KiriPedia/1.0" "https://en.wikipedia.org/api/rest_v1/page/summary/$title" 2>/dev/null)
    thumb=$(echo "$json" | jq -r '.originalimage.source // .thumbnail.source // empty' 2>/dev/null)
    if [ -z "$thumb" ] || [ "$thumb" = "null" ]; then
      echo "→ $slug (image present, credit unavailable)"
      printf '{"file":"/images/%s.%s","source_article":%s,"artist":"Unknown","license":"See Wikimedia Commons","via":"Wikimedia Commons"}' \
        "$slug" "$ext" "$(echo "$title" | jq -Rs .)" > "$TMP/$slug.json"
      got=$((got + 1))
      continue
    fi
    IFS='|||' read -r artist _ _ license <<< "$(fetch_credit "$thumb")"
    printf '{"file":"/images/%s.%s","source_article":%s,"artist":%s,"license":%s,"via":"Wikimedia Commons"}' \
      "$slug" "$ext" "$(echo "$title" | jq -Rs .)" "$(echo "$artist" | jq -Rs .)" "$(echo "$license" | jq -Rs .)" > "$TMP/$slug.json"
    echo "→ $slug.$ext (credit refreshed: $license)"
    got=$((got + 1))
    continue
  fi

  # No image yet — fetch from Wikipedia (with one retry on empty response)
  json=$(curl -sL -A "KiriPedia/1.0" "https://en.wikipedia.org/api/rest_v1/page/summary/$title" 2>/dev/null)
  thumb=$(echo "$json" | jq -r '.originalimage.source // .thumbnail.source // empty' 2>/dev/null)
  if [ -z "$thumb" ] || [ "$thumb" = "null" ]; then
    sleep 2
    json=$(curl -sL -A "KiriPedia/1.0" "https://en.wikipedia.org/api/rest_v1/page/summary/$title" 2>/dev/null)
    thumb=$(echo "$json" | jq -r '.originalimage.source // .thumbnail.source // empty' 2>/dev/null)
  fi

  if [ -z "$thumb" ] || [ "$thumb" = "null" ]; then
    echo "✗ $slug ($title) — no lead image"
    miss=$((miss + 1))
    continue
  fi

  url_basename="${thumb##*/}"
  ext=$(echo "${url_basename##*.}" | tr '[:upper:]' '[:lower:]')
  out="$DEST/$slug.$ext"
  curl -sL -A "KiriPedia/1.0" -o "$out" "$thumb"
  if [ ! -s "$out" ]; then
    echo "✗ $slug — download empty"
    miss=$((miss + 1))
    continue
  fi

  IFS='|||' read -r artist _ _ license <<< "$(fetch_credit "$thumb")"
  printf '{"file":"/images/%s.%s","source_article":%s,"artist":%s,"license":%s,"via":"Wikimedia Commons"}' \
    "$slug" "$ext" "$(echo "$title" | jq -Rs .)" "$(echo "$artist" | jq -Rs .)" "$(echo "$license" | jq -Rs .)" > "$TMP/$slug.json"
  echo "✓ $slug.$ext ($license)"
  got=$((got + 1))
done

# Assemble credits.json
echo "{" > "$CREDITS"
first=true
for f in "$TMP"/*.json; do
  [ -e "$f" ] || continue
  slug=$(basename "$f" .json)
  if [ "$first" = false ]; then echo "," >> "$CREDITS"; fi
  first=false
  printf '  "%s": %s' "$slug" "$(cat "$f")" >> "$CREDITS"
done
echo "" >> "$CREDITS"
echo "}" >> "$CREDITS"

echo
echo "Summary: $got entries in credits.json, $miss missing images"
