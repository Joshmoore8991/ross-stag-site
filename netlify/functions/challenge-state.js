'use strict';

const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'rossstag';
const STATE_KEY = 'challenge-state-v1';
const MAX_CHALLENGES = 400;
const MAX_LOG_KEYS = 5000;

function normalizeCrewCode(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 6) return digits;
  if (digits.length === 8) return digits.slice(0, 4) + digits.slice(-2);
  if (digits.length < 6) return digits.padStart(6, '0');
  return '';
}

function parseAllowedWriterCodes() {
  const raw = String(process.env.CREW_WRITE_CODES || '').trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((item) => normalizeCrewCode(item))
      .filter(Boolean)
  );
}

function getCrewCodeFromHeaders(event) {
  const headers = event && event.headers ? event.headers : {};
  return normalizeCrewCode(
    headers['x-crew-code']
    || headers['X-Crew-Code']
    || headers['x-crew-bday']
    || headers['X-Crew-Bday']
  );
}

function jsonResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function sanitizeText(value, maxLength) {
  const stripped = String(value || '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!maxLength || maxLength < 1) return stripped;
  return stripped.slice(0, maxLength);
}

function sanitizeChallengeItem(item) {
  if (!item || typeof item !== 'object') return null;
  const title = sanitizeText(item.title, 120);
  if (title.length < 3) return null;
  return {
    id: sanitizeText(item.id, 64) || (Date.now().toString() + Math.random().toString(36).slice(2, 7)),
    title: title,
    type: sanitizeText(item.type, 24) || 'Chill',
    difficulty: sanitizeText(item.difficulty, 24) || 'Easy',
    notes: sanitizeText(item.notes, 300),
    suggestedBy: sanitizeText(item.suggestedBy, 24) || 'Crew',
    createdAt: Number(item.createdAt) || Date.now(),
    votes: Number(item.votes) || 0,
    reports: Number(item.reports) || 0,
    hidden: Boolean(item.hidden)
  };
}

function sanitizeChallengeList(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const item of list) {
    const clean = sanitizeChallengeItem(item);
    if (!clean) continue;
    if (seen.has(clean.id)) continue;
    seen.add(clean.id);
    out.push(clean);
    if (out.length >= MAX_CHALLENGES) break;
  }
  return out;
}

function sanitizeLogMap(logMap, allowNumeric) {
  const safe = {};
  if (!logMap || typeof logMap !== 'object' || Array.isArray(logMap)) return safe;
  const entries = Object.entries(logMap).slice(0, MAX_LOG_KEYS);
  entries.forEach(([key, value]) => {
    const cleanKey = sanitizeText(key, 140);
    if (!cleanKey) return;
    if (allowNumeric) {
      safe[cleanKey] = Number(value) || 0;
    } else {
      safe[cleanKey] = Boolean(value);
    }
  });
  return safe;
}

function sanitizeState(raw) {
  const state = raw && typeof raw === 'object' ? raw : {};
  return {
    pendingChallenges: sanitizeChallengeList(state.pendingChallenges),
    approvedChallenges: sanitizeChallengeList(state.approvedChallenges),
    challengeVoteLog: sanitizeLogMap(state.challengeVoteLog, true),
    challengeReportLog: sanitizeLogMap(state.challengeReportLog, false),
    challengeSubmissionLog: sanitizeLogMap(state.challengeSubmissionLog, true)
  };
}

async function loadState(store) {
  const stored = await store.get(STATE_KEY, { type: 'json' });
  return sanitizeState(stored);
}

async function saveState(store, state) {
  await store.set(STATE_KEY, JSON.stringify(state));
}

exports.handler = async function (event) {
  const store = getStore(STORE_NAME);

  if (event.httpMethod === 'GET') {
    const state = await loadState(store);
    return jsonResponse(200, { ok: true, state: state });
  }

  if (event.httpMethod === 'POST') {
    const allowedWriterCodes = parseAllowedWriterCodes();
    const requestCrewCode = getCrewCodeFromHeaders(event);
    if (!requestCrewCode || !allowedWriterCodes.has(requestCrewCode)) {
      return jsonResponse(403, { ok: false, error: 'Forbidden' });
    }
    let incoming = {};
    try {
      incoming = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      return jsonResponse(400, { ok: false, error: 'Invalid JSON body' });
    }
    const sanitized = sanitizeState(incoming);
    await saveState(store, sanitized);
    return jsonResponse(200, { ok: true, state: sanitized });
  }

  return jsonResponse(405, { ok: false, error: 'Method not allowed' });
};
