# Universal Lyrics Parser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a universal lyrics parser supporting TTML, LRC, SRT, and plain text formats, auto-detecting the format based on file extension and/or content sniffing.

**Architecture:** Replace the existing TTML-only `useEffect` fetch in `FullPlayerModal.jsx` with a comprehensive fetch hook. Define nested helpers `parseTTML`, `parseLRC`, `parseSRT`, `parsePlainText`, and `detectFormat`. Also update the microphone button tooltip text to list the supported formats.

**Tech Stack:** React, JavaScript DOMParser, RegExp

## Global Constraints
- Make sure to keep the component working and compile-free.
- Commit all changes with message: `feat: add universal lyrics parser for TTML, LRC, SRT, and plain text formats`

---

### Task 1: Update FullPlayerModal lyrics parser and tooltip

**Files:**
- Modify: [FullPlayerModal.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/FullPlayerModal.jsx)

- [ ] **Step 1: Replace the lyrics loading useEffect**
  Modify [FullPlayerModal.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/FullPlayerModal.jsx#L24-L67) to include the new universal parser helper functions and fetch flow.

  Replacement code:
  ```jsx
  useEffect(() => {
    if (!displayTrack.lyricsUrl) {
      setLyrics([]);
      return;
    }

    const parseTTML = (text) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      const pTags = doc.getElementsByTagName('p');
      const parsed = [];
      const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length === 3) return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
        return parseFloat(timeStr);
      };
      for (let i = 0; i < pTags.length; i++) {
        const p = pTags[i];
        const begin = parseTime(p.getAttribute('begin'));
        const endStr = p.getAttribute('end');
        const end = endStr ? parseTime(endStr) : begin + 5;
        const text = p.textContent.trim();
        if (text) parsed.push({ begin, end, text });
      }
      return parsed;
    };

    const parseLRC = (text) => {
      // LRC format: [MM:SS.xx]Lyric line
      const lines = text.split('\n');
      const timeRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
      const parsed = [];
      const entries = [];
      for (const line of lines) {
        const matches = [...line.matchAll(timeRegex)];
        if (matches.length === 0) continue;
        const lyricText = line.replace(timeRegex, '').trim();
        if (!lyricText) continue;
        for (const match of matches) {
          const mins = parseInt(match[1], 10);
          const secs = parseInt(match[2], 10);
          const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
          const begin = mins * 60 + secs + ms / 1000;
          entries.push({ begin, text: lyricText });
        }
      }
      entries.sort((a, b) => a.begin - b.begin);
      for (let i = 0; i < entries.length; i++) {
        const end = entries[i + 1] ? entries[i + 1].begin : entries[i].begin + 5;
        parsed.push({ begin: entries[i].begin, end, text: entries[i].text });
      }
      return parsed;
    };

    const parseSRT = (text) => {
      // SRT format: index\nHH:MM:SS,ms --> HH:MM:SS,ms\nLyric text\n
      const parseTimestamp = (ts) => {
        const [hms, ms] = ts.split(',');
        const [h, m, s] = hms.split(':').map(Number);
        return h * 3600 + m * 60 + s + (parseInt(ms, 10) || 0) / 1000;
      };
      const blocks = text.trim().split(/\n\s*\n/);
      const parsed = [];
      for (const block of blocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) continue;
        // Skip index line if it's just a number
        let startLine = 0;
        if (/^\d+$/.test(lines[0])) startLine = 1;
        const timeLine = lines[startLine];
        if (!timeLine || !timeLine.includes('-->')) continue;
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
        const begin = parseTimestamp(startStr);
        const end = parseTimestamp(endStr);
        const lyricText = lines.slice(startLine + 1).join(' ').trim();
        if (lyricText) parsed.push({ begin, end, text: lyricText });
      }
      return parsed;
    };

    const parsePlainText = (text) => {
      // Plain text: no timestamps, display as static lyrics with even spacing
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return [];
      return lines.map((line, i) => ({ begin: i * 5, end: (i + 1) * 5, text: line }));
    };

    const detectFormat = (url, text) => {
      const lower = url.toLowerCase();
      if (lower.endsWith('.ttml') || lower.includes('.ttml')) return 'ttml';
      if (lower.endsWith('.lrc') || lower.includes('.lrc')) return 'lrc';
      if (lower.endsWith('.srt') || lower.includes('.srt')) return 'srt';
      // Content sniffing
      if (text.includes('<?xml') || text.includes('<tt') || text.includes('<body')) return 'ttml';
      if (text.match(/\[\d{1,2}:\d{2}/)) return 'lrc';
      if (text.match(/\d+\n\d{2}:\d{2}:\d{2},\d{3} -->/)) return 'srt';
      return 'plain';
    };

    fetch(displayTrack.lyricsUrl)
      .then(res => res.text())
      .then(text => {
        const format = detectFormat(displayTrack.lyricsUrl, text);
        let parsed = [];
        if (format === 'ttml') parsed = parseTTML(text);
        else if (format === 'lrc') parsed = parseLRC(text);
        else if (format === 'srt') parsed = parseSRT(text);
        else parsed = parsePlainText(text);
        setLyrics(parsed);
      })
      .catch(err => {
        console.error('Failed to load lyrics:', err);
        setLyrics([]);
      });
  }, [displayTrack.lyricsUrl]);
  ```

- [ ] **Step 2: Update the tooltip**
  Modify the microphone button's tooltip attribute in [FullPlayerModal.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/FullPlayerModal.jsx#L141):
  From:
  `title={displayTrack.lyricsUrl ? "Toggle Lyrics" : "No lyrics available"}`
  To:
  `title={displayTrack.lyricsUrl ? "Toggle Lyrics (TTML/LRC/SRT/TXT)" : "No lyrics available"}`

- [ ] **Step 3: Build the application to verify syntax/compilation**
  Run: `npm run build` in the `frontend` folder.

- [ ] **Step 4: Commit changes**
  Command:
  ```bash
  git add frontend/src/components/FullPlayerModal.jsx
  git commit -m "feat: add universal lyrics parser for TTML, LRC, SRT, and plain text formats"
  ```
