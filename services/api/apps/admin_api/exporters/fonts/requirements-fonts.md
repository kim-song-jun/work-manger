# PDF Korean Font

The monthly report PDF (`apps/admin_api/exporters/pdf.py`) ships a Korean-aware
fallback. To enable proper hangul rendering, drop the OFL-licensed font at:

```
services/api/apps/admin_api/exporters/fonts/NotoSansKR-Regular.otf
```

Source (Google Fonts, OFL 1.1):

- https://fonts.google.com/noto/specimen/Noto+Sans+KR
- Direct: https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/Korean/NotoSansKR-Regular.otf

The binary is intentionally **not committed** (per build constraints). When the
file is absent the exporter renders romanized labels and a footer notice; PDFs
still validate and tests still pass.

For container builds add a `Dockerfile` step (or a `RUN curl -L … -o …`) so
production images contain the font. Verify the SHA256 if you pin it.
