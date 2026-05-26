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

  # ===== Wiki-trust batch — 2026-05 =====
  # People (obvious 1:1)
  "rudy-giuliani=Rudy_Giuliani"
  "saddam-hussein=Saddam_Hussein"
  "jonathan-pollard=Jonathan_Pollard"
  "sebastian-gorka=Sebastian_Gorka"
  "joe-biden=Joe_Biden"
  "john-kerry=John_Kerry"
  "john-mccain=John_McCain"
  "karl-rove=Karl_Rove"
  "peter-thiel=Peter_Thiel"
  "alex-karp=Alex_Karp"
  "anwar-al-awlaki=Anwar_al-Awlaki"
  "hassan-nasrallah=Hassan_Nasrallah"
  "imran-khan=Imran_Khan"
  "joko-widodo=Joko_Widodo"
  "khaled-mashal=Khaled_Mashal"
  "trita-parsi=Trita_Parsi"
  "michael-hastings=Michael_Hastings_(journalist)"
  "jason-leopold=Jason_Leopold"
  "ted-rall=Ted_Rall"
  "roger-waters=Roger_Waters"
  "ken-dilanian=Ken_Dilanian"
  "jamaal-bowman=Jamaal_Bowman"
  "cori-bush=Cori_Bush"
  "josh-shapiro=Josh_Shapiro"
  "bill-richardson=Bill_Richardson"
  "joshua-schulte=Joshua_Schulte"
  "mike-baker=Mike_Baker_(intelligence_officer)"
  "mike-spann=Johnny_Micheal_Spann"
  "john-walker-lindh=John_Walker_Lindh"
  "prince-muhammad-bin-naif=Mohammed_bin_Nayef"
  "mahmoud-al-mabhouh=Mahmoud_al-Mabhouh"
  "khalid-sheikh-mohammed=Khalid_Sheikh_Mohammed"
  "mohammed-atef=Mohammed_Atef"
  "ali-soufan=Ali_Soufan"
  "john-oneill=John_P._O'Neill"
  "robert-mueller=Robert_Mueller"
  "robert-hanssen=Robert_Hanssen"
  "brian-kelly=Brian_J._Kelley"
  "george-tenet=George_Tenet"
  "william-webster=William_H._Webster"
  "cofer-black=Cofer_Black"
  "gina-haspel=Gina_Haspel"
  "mike-scheuer=Michael_Scheuer"
  "dick-clarke=Richard_A._Clarke"
  "sandy-berger=Sandy_Berger"
  "bob-baer=Robert_Baer"
  "jim-pavitt=James_L._Pavitt"
  "steve-kappes=Stephen_Kappes"
  "james-angleton=James_Jesus_Angleton"
  "admiral-crowe=William_J._Crowe"
  "norman-schwarzkopf=Norman_Schwarzkopf_Jr."
  "wesley-clark=Wesley_Clark"
  "general-dostum=Abdul_Rashid_Dostum"
  "uday-hussein=Uday_Hussein"
  "hussein-kamel=Hussein_Kamel_al-Majid"
  "ali-hassan-al-majid=Ali_Hassan_al-Majid"
  "ahmed-khatib=Ahmed_al-Khatib"
  "ahmed-chalabi=Ahmed_Chalabi"
  "george-habash=George_Habash"
  "april-glaspie=April_Glaspie"
  "sheikh-jaber-al-ahmad=Jaber_Al-Ahmad_Al-Sabah"
  "sheikh-saad-al-abdullah=Saad_Al-Abdullah_Al-Salim_Al-Sabah"
  "saud-nasir-al-sabah=Saud_Nasir_Al-Sabah"
  "skip-gnehm=Edward_W._Gnehm"
  "louis-farrakhan=Louis_Farrakhan"
  "pete-seeger=Pete_Seeger"
  "jeffrey-epstein=Jeffrey_Epstein"
  "mort-halperin=Morton_Halperin"
  "bernie-kerik=Bernard_Kerik"
  "noelle-dunphy=Rudy_Giuliani"
  "bruce-fine=Bruce_Fein"
  "robert-maclean=Robert_MacLean_(whistleblower)"
  "heather-saunders=Stephen_Saunders_(British_Army_officer)"
  "gerald-bull=Gerald_Bull"
  "erik-prince=Erik_Prince"
  "john-rendon=John_Rendon"
  "mack-mclarty=Mack_McLarty"
  "john-mccone=John_A._McCone"
  "jean-gately=Bay_of_Pigs_Invasion"
  "sharon-scranage=Sharon_Scranage"

  # Events
  "jfk-assassination=Assassination_of_John_F._Kennedy"
  "1993-bush-assassination-plot=Attempted_assassination_of_George_H._W._Bush_in_Kuwait_in_1993"
  "abu-zubaydah-capture=Abu_Zubaydah"
  "qala-i-jangi-uprising=Battle_of_Qala-i-Jangi"
  "kuwait-liberation-day=Liberation_of_Kuwait"
  "kuwait-oil-fires=Kuwaiti_oil_fires"
  "dasht-i-leili-massacre=Dasht-i-Leili_massacre"
  "iran-12-day-war=Iran–Israel_war"
  "bojinka-plot=Bojinka_plot"
  "kiki-camarena-case=Enrique_Camarena"
  "three-saudi-princes=Abu_Zubaydah"
  "yellowcake-niger-forgery=Niger_uranium_forgeries"
  "yemen=Yemen"

  # Organizations
  "aipac=American_Israel_Public_Affairs_Committee"
  "mossad=Mossad"
  "blackwater=Academi"
  "palantir=Palantir_Technologies"
  "in-q-tel=In-Q-Tel"
  "vault-7=Vault_7"
  "mk-ultra=MKUltra"
  "operation-mockingbird=Operation_Mockingbird"
  "pflp=Popular_Front_for_the_Liberation_of_Palestine"
  "special-activities-division=Special_Activities_Center"
  "ground-branch=Special_Activities_Center"
  "grs-global-response-staff=Global_Response_Staff"
  "petra-bank=Petra_Bank"
  "black-cube=Black_Cube"
  "the-farm=Camp_Peary"
  "fci-loretto=FCI_Loretto"
  "bluffdale-nsa-facility=Utah_Data_Center"
  "drone-base-balochistan=Shamsi_Airfield"
  "falls-church-mosque=Dar_Al-Hijrah_Islamic_Center"
  "analysis-corporation=The_Analysis_Corporation"

  # Concepts / Procedures
  "mad-minute=Espionage"
  "hawala-system=Hawala"
  "cia-cable-priority-levels=Diplomatic_cable"
  "executive-order-12333=Executive_Order_12333"
  "title-10-vs-title-50=United_States_Code"
  "tuesday-morning-kill-list=Disposition_Matrix"
  "ninth-circuit-contractor-ruling-2025=United_States_Court_of_Appeals_for_the_Ninth_Circuit"
  "national-endowment-for-democracy=National_Endowment_for_Democracy"

  # ===== Wiki-trust batch — 2026-05 (round 2: post-Cleared Hot + post-Covert Ops + retries) =====
  # Cleared Hot ingest
  "mohamedou-ould-slahi=Mohamedou_Ould_Slahi"
  "maher-arar=Maher_Arar"
  "khaled-el-masri=Khalid_El-Masri"
  "carlos-the-jackal=Carlos_the_Jackal"
  "mike-hayden=Michael_Hayden_(general)"
  "tom-drake=Thomas_Andrews_Drake"
  "section-702=Section_702_of_the_Foreign_Intelligence_Surveillance_Act"
  "sarah-jane-moore=Sara_Jane_Moore"
  "mike-mastrovito=Gerald_Ford_assassination_attempt_in_San_Francisco"
  "francis-gary-powers=Francis_Gary_Powers"
  "leon-panetta=Leon_Panetta"

  # Covert Operations Insight ingest
  "ai-weiwei=Ai_Weiwei"
  "andres-serrano=Andres_Serrano"
  "afghan-heroin-policy=Opium_production_in_Afghanistan"
  "harold-james-nicholson=Harold_James_Nicholson"
  "eric-oneill=Eric_O'Neill_(spy)"
  "scholar-in-residence-program=Central_Intelligence_Agency"

  # Retries with alternate titles for previously-failed
  "grs-global-response-staff=United_States_diplomatic_security"
  "fci-loretto=Federal_Correctional_Institution,_Loretto"
  "stephen-saunders=Stephen_Saunders_(British_Army_officer)"
  "robert-maclean=Robert_MacLean_(whistleblower)"
  "sandy-berger=Samuel_R._Berger"
  "bob-baer=Robert_Baer_(CIA)"
  "dick-clarke=Richard_A._Clarke"
  "mike-baker=Michael_Baker_(former_CIA_officer)"
  "brian-kelly=Brian_J._Kelley"
  "john-mccone=John_A._McCone"
  "george-tenet=George_Tenet"
  "william-webster=William_H._Webster"
  "mort-halperin=Morton_Halperin"
  "gerald-bull=Gerald_Bull"
  "april-glaspie=April_Glaspie"
  "skip-gnehm=Edward_W._Gnehm"
  "jonathan-pollard=Jonathan_Pollard"
  "louis-farrakhan=Louis_Farrakhan"
  "pete-seeger=Pete_Seeger"
  "jeffrey-epstein=Jeffrey_Epstein"
  "ahmed-chalabi=Ahmed_Chalabi"
  "george-habash=George_Habash"
  "ahmed-khatib=Ahmed_al-Khatib_(Kuwaiti_doctor)"
  "kuwait-oil-fires=Kuwaiti_oil_fires"
  "kuwait-liberation-day=Liberation_Day_(Kuwait)"
  "qala-i-jangi-uprising=Battle_of_Qala-i-Jangi"
  "iran-12-day-war=2025_Iran–Israel_war"
  "1993-bush-assassination-plot=April_1993_George_H._W._Bush_assassination_attempt"
  "kiki-camarena-case=Enrique_Camarena"
  "bojinka-plot=Bojinka_plot"
  "dasht-i-leili-massacre=Dasht-i-Leili_massacre"
  "jfk-assassination=Assassination_of_John_F._Kennedy"
  "heather-saunders=Stephen_Saunders_(British_Army_officer)"
  "imran-khan=Imran_Khan"
  "joko-widodo=Joko_Widodo"
  "jamaal-bowman=Jamaal_Bowman"
  "cori-bush=Cori_Bush"
  "josh-shapiro=Josh_Shapiro"
  "bill-richardson=Bill_Richardson"
  "michael-hastings=Michael_Hastings_(journalist)"
  "ted-rall=Ted_Rall"
  "ken-dilanian=Ken_Dilanian"
  "khaled-mashal=Khaled_Mashal"
  "jim-pavitt=James_L._Pavitt"
  "steve-kappes=Stephen_Kappes"
  "jason-leopold=Jason_Leopold"
  "mike-scheuer=Michael_Scheuer"
  "john-oneill=John_P._O'Neill"
  "bill-buckley=William_Francis_Buckley_(CIA_officer)"
  "saud-nasir-al-sabah=Saud_Nasir_Al-Sabah"
  "sheikh-saad-al-abdullah=Saad_Al-Abdullah_Al-Salim_Al-Sabah"
  "gerald-post=Jerrold_Post"
  "mitchell-and-jessen=James_Elmer_Mitchell"
  "vault-7=Vault_7"
  "palantir=Palantir_Technologies"
  "operation-mockingbird=Operation_Mockingbird"
  "in-q-tel=In-Q-Tel"
  "pflp=Popular_Front_for_the_Liberation_of_Palestine"
  "petra-bank=Petra_Bank"
  "black-cube=Black_Cube"
  "the-farm=Camp_Peary"
  "national-endowment-for-democracy=National_Endowment_for_Democracy"
  "enhanced-interrogation=Enhanced_interrogation_techniques"
  "senate-torture-report=Senate_Intelligence_Committee_report_on_CIA_torture"
  "welch-45=M1911_pistol"
  "walling=Wall"
  "ticking-time-bomb=Ticking_time_bomb_scenario"
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
