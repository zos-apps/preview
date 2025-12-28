# 👁️ Preview

Quick Look file preview for zOS.

## Features

- **Image Preview** - View images with zoom controls
- **Video Player** - Play video files with controls
- **Audio Player** - Listen to audio files
- **PDF Viewer** - Read PDF documents
- **Code Viewer** - Syntax-highlighted code files
- **Text Preview** - View any text file
- **Drag & Drop** - Drop files to preview instantly

## Supported Formats

| Type | Extensions |
|------|------------|
| Images | PNG, JPG, GIF, SVG, WebP |
| Video | MP4, WebM, MOV |
| Audio | MP3, WAV, OGG, M4A |
| Documents | PDF |
| Code | JS, TS, TSX, JSX, PY, GO, RS, SH |
| Text | TXT, MD, JSON, HTML, CSS |

## Installation

```bash
npm install @anthropic/preview
```

## Usage

```tsx
import Preview from '@anthropic/preview';

<Preview onClose={() => setOpen(false)} />
```

## License

MIT
