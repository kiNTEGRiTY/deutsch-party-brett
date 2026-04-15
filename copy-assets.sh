#!/bin/bash
# Copy character illustrations from brain directory to project assets
# Run this script from Terminal with: bash copy-assets.sh

BRAIN="/Users/ralfkirchner/.gemini/antigravity/brain/e859a019-709f-4d79-8e59-4fff0f51f150"
DEST="/Users/ralfkirchner/.gemini/antigravity/scratch/deutsch-party-brett/assets/img"

mkdir -p "$DEST"

echo "Kopiere Charakter-Illustrationen..."
cp "$BRAIN/char_fox_1775355844836.png" "$DEST/fox.png" 2>/dev/null && echo "  ✓ Fuchs" || echo "  ✗ Fuchs"
cp "$BRAIN/char_penguin_1775355859738.png" "$DEST/penguin.png" 2>/dev/null && echo "  ✓ Pinguin" || echo "  ✗ Pinguin"
cp "$BRAIN/char_bunny_1775355871659.png" "$DEST/bunny.png" 2>/dev/null && echo "  ✓ Hase" || echo "  ✗ Hase"
cp "$BRAIN/char_bear_1775355921294.png" "$DEST/bear.png" 2>/dev/null && echo "  ✓ Bär" || echo "  ✗ Bär"
cp "$BRAIN/char_deer_1775355933484.png" "$DEST/deer.png" 2>/dev/null && echo "  ✓ Reh" || echo "  ✗ Reh"
cp "$BRAIN/char_elephant_*.png" "$DEST/elephant.png" 2>/dev/null && echo "  ✓ Elefant" || echo "  ✗ Elefant"
cp "$BRAIN/char_cat_*.png" "$DEST/cat.png" 2>/dev/null && echo "  ✓ Steph (Katze)" || echo "  ✗ Steph (Katze)"

echo ""
echo "Kopiere Hintergründe..."
cp "$BRAIN/bg_start_*.png" "$DEST/bg-start.png" 2>/dev/null && echo "  ✓ Start-Background"
cp "$BRAIN/bg_board_*.png" "$DEST/bg-board.png" 2>/dev/null && echo "  ✓ Board-Background"

echo ""
echo "Fertig! Die Bilder sind jetzt in: $DEST"
echo "Starte den Server neu: python3 -m http.server 8091"
