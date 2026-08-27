# assets

`BricolageGrotesque-700-subset.ttf` is the face drawn into the Open Graph card
(`src/app/opengraph-image.tsx`). It is the display face the site uses for its
headings, instanced at weight 700 and cut down to Latin.

Any character missing from it silently falls back to a different face, so when
the card's copy changes, rebuild the subset:

```sh
curl -sL -o /tmp/bg.ttf \
  "https://github.com/google/fonts/raw/main/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf"
fonttools varLib.instancer /tmp/bg.ttf wght=700 opsz=48 wdth=100 -o /tmp/bg700.ttf

pyftsubset /tmp/bg700.ttf \
  --unicodes="U+0020-007E,U+00A0-00FF" \
  --output-file=assets/BricolageGrotesque-700-subset.ttf \
  --no-hinting --desubroutinize --layout-features=''
```
