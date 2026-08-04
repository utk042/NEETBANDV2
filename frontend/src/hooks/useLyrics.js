import { useState, useEffect } from 'react';

export function useLyrics(lyricsUrl, currentTime = 0) {
  const [lyrics, setLyrics] = useState([]);

  useEffect(() => {
    if (!lyricsUrl) {
      setLyrics([]);
      return;
    }

    const parseTTML = (text) => {
      const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length === 3) return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
        return parseFloat(timeStr);
      };

      const extractFromTags = (pTags) => {
        const parsed = [];
        for (let i = 0; i < pTags.length; i++) {
          const p = pTags[i];
          const beginAttr = p.getAttribute('begin');
          if (!beginAttr) continue;
          const begin = parseTime(beginAttr);
          const endStr = p.getAttribute('end');
          const end = endStr ? parseTime(endStr) : begin + 5;
          const textContent = p.textContent.trim();
          if (textContent) parsed.push({ begin, end, text: textContent });
        }
        return parsed;
      };

      let parsed = [];
      try {
        const parser = new DOMParser();
        let doc = parser.parseFromString(text, 'text/xml');
        let pTags = doc.getElementsByTagName('p');
        
        if (!pTags || pTags.length === 0) {
          doc = parser.parseFromString(text, 'text/html');
          pTags = doc.getElementsByTagName('p');
        }
        
        parsed = extractFromTags(pTags);
      } catch (e) {
        console.error("DOMParser error for TTML:", e);
      }

      if (parsed.length === 0) {
        const regex = /<p\s+[^>]*begin="([^"]+)"[^>]*>([\s\S]*?)<\/p>/gi;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const begin = parseTime(match[1]);
          const endMatch = match[0].match(/end="([^"]+)"/i);
          const endStr = endMatch ? endMatch[1] : null;
          const end = endStr ? parseTime(endStr) : begin + 5;
          let rawText = match[2].replace(/<[^>]+>/g, '').trim();
          rawText = rawText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          if (rawText) parsed.push({ begin, end, text: rawText });
        }
      }

      return parsed;
    };

    const parseLRC = (text) => {
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
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return [];
      return lines.map((line, i) => ({ begin: i * 5, end: (i + 1) * 5, text: line }));
    };

    const detectFormat = (url, text) => {
      const lower = url.toLowerCase();
      if (lower.endsWith('.ttml') || lower.includes('.ttml')) return 'ttml';
      if (lower.endsWith('.lrc') || lower.includes('.lrc')) return 'lrc';
      if (lower.endsWith('.srt') || lower.includes('.srt')) return 'srt';
      if (text.includes('<?xml') || text.includes('<tt') || text.includes('<body')) return 'ttml';
      if (text.match(/\[\d{1,2}:\d{2}/)) return 'lrc';
      if (text.match(/\d+\n\d{2}:\d{2}:\d{2},\d{3} -->/)) return 'srt';
      return 'plain';
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fullLyricsUrl = lyricsUrl.startsWith('http://') || lyricsUrl.startsWith('https://') || lyricsUrl.startsWith('blob:')
      ? lyricsUrl
      : `${API_URL}${lyricsUrl.startsWith('/') ? '' : '/'}${lyricsUrl}`;

    // AbortController: cancels the in-flight fetch when lyricsUrl changes or
    // the component unmounts, preventing stale setLyrics calls and memory leaks.
    const controller = new AbortController();

    fetch(fullLyricsUrl, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Lyrics file not found (status ${res.status})`);
        return res.text();
      })
      .then(text => {
        const format = detectFormat(lyricsUrl, text);
        let parsed = [];
        if (format === 'ttml') parsed = parseTTML(text);
        else if (format === 'lrc') parsed = parseLRC(text);
        else if (format === 'srt') parsed = parseSRT(text);
        else parsed = parsePlainText(text);
        setLyrics(parsed);
      })
      .catch(err => {
        // AbortError is expected on cleanup — not a real failure, suppress it.
        if (err.name === 'AbortError') return;
        console.warn('Failed to load lyrics:', err.message || err);
        setLyrics([]);
      });

    return () => {
      controller.abort();
    };
  }, [lyricsUrl]);

  const activeLyricIndex = lyrics.findIndex(l => currentTime >= l.begin && currentTime <= l.end);
  const activeLyric = lyrics[activeLyricIndex]?.text || '';

  return { lyrics, activeLyricIndex, activeLyric };
}
