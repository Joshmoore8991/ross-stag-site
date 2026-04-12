'use strict';

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

function normalizeCrewCode(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 6) return digits;
  if (digits.length === 8) return digits.slice(0, 4) + digits.slice(-2);
  if (digits.length < 6) return digits.padStart(6, '0');
  return '';
}

function parseAllowedReaderCodes() {
  const raw = String(process.env.CREW_READ_CODES || '').trim();
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

function parseTripDetails() {
  const fallback = {
    hotelBookingCode: 'Unavailable',
    transferBookingCode: 'Unavailable',
    tripCode: 'Unavailable',
    supportPhone: 'Unavailable',
    transferEmergencyPhone: 'Unavailable',
    transferEmergencyAltPhone: 'Unavailable'
  };

  const raw = process.env.TRIP_DETAILS_JSON;
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return {
      hotelBookingCode: sanitizeText(parsed.hotelBookingCode, 120) || fallback.hotelBookingCode,
      transferBookingCode: sanitizeText(parsed.transferBookingCode, 120) || fallback.transferBookingCode,
      tripCode: sanitizeText(parsed.tripCode, 120) || fallback.tripCode,
      supportPhone: sanitizeText(parsed.supportPhone, 60) || fallback.supportPhone,
      transferEmergencyPhone: sanitizeText(parsed.transferEmergencyPhone, 60) || fallback.transferEmergencyPhone,
      transferEmergencyAltPhone: sanitizeText(parsed.transferEmergencyAltPhone, 60) || fallback.transferEmergencyAltPhone
    };
  } catch (e) {
    return fallback;
  }
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { ok: false, error: 'Method not allowed' });
  }

  const allowedReaderCodes = parseAllowedReaderCodes();
  const requestCrewCode = getCrewCodeFromHeaders(event);
  if (!requestCrewCode || !allowedReaderCodes.has(requestCrewCode)) {
    return jsonResponse(403, { ok: false, error: 'Forbidden' });
  }

  return jsonResponse(200, {
    ok: true,
    details: parseTripDetails()
  });
};
