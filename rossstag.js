  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const DAYS_UNTIL_ACTIVE = 7;
  // 3 May 2026 06:10 BST (UTC+1) — Belfast International departure
  const target = Date.parse('2026-05-03T06:10:00+01:00');
  let lastAnnouncedDays = -1;
  function tick() {
    const cdEl = document.querySelector('.countdown');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('mins');
    const secsEl = document.getElementById('secs');
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;
    const diff = target - Date.now();
    const srEl = document.getElementById('countdown-sr');
    if (diff < 0) {
      [daysEl, hoursEl, minsEl, secsEl].forEach(function (el) { el.textContent = '00'; });
      if (cdEl) { cdEl.classList.remove('trip-active'); cdEl.classList.add('trip-complete'); }
      if (srEl && lastAnnouncedDays !== 0) { srEl.textContent = 'Trip has begun. Vamos!'; lastAnnouncedDays = 0; }
      return;
    }
    if (cdEl && diff < DAYS_UNTIL_ACTIVE * MS_PER_DAY) { cdEl.classList.add('trip-active'); }
    const days = Math.floor(diff / MS_PER_DAY);
    const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR);
    const mins = Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE);
    const secs = Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND);
    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
    // Throttle a11y announcements — only update when the day count changes.
    if (srEl && days !== lastAnnouncedDays) {
      srEl.textContent = days + ' day' + (days === 1 ? '' : 's') +
        ', ' + hours + ' hour' + (hours === 1 ? '' : 's') + ' until takeoff.';
      lastAnnouncedDays = days;
    }
  }
  tick();
  let countdownInterval = setInterval(tick, MS_PER_SECOND);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    } else if (!countdownInterval) {
      tick();
      countdownInterval = setInterval(tick, MS_PER_SECOND);
    }
  });
  window.addEventListener('pagehide', function () {
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
  });
  const obs = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold:.12 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  const navGroups = Array.from(document.querySelectorAll('.nav-group'));
  const navToggles = navGroups
    .map(function (group) { return group.querySelector('.nav-group-toggle'); })
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('.top-sub-link'));
  const navMap = navLinks
    .map(link => {
      const targetId = (link.getAttribute('href') || '').replace('#', '');
      const section = targetId ? document.getElementById(targetId) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  const hamburgerBtn = document.querySelector('.nav-hamburger');
  const topNavEl = document.querySelector('.top-nav');
  const navDrawerEl = document.getElementById('nav-drawer');

  function closeDrawer() {
    if (!topNavEl) return;
    topNavEl.classList.remove('drawer-open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    if (navDrawerEl) navDrawerEl.setAttribute('aria-hidden', 'true');
    syncTopNavHeightVar();
  }

  if (hamburgerBtn && topNavEl) {
    hamburgerBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      const isOpen = topNavEl.classList.toggle('drawer-open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (navDrawerEl) navDrawerEl.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      syncTopNavHeightVar();
    });
  }

  function setActiveNavLink(id) {
    navLinks.forEach(link => {
      const isActive = (link.getAttribute('href') || '') === '#' + id;
      link.classList.toggle('active', isActive);
    });
    navGroups.forEach(group => {
      const hasActive = !!group.querySelector('.top-sub-link.active');
      group.classList.toggle('active', hasActive);
    });
  }

  function closeOpenMenus(exceptGroup) {
    navGroups.forEach(group => {
      if (group !== exceptGroup) {
        group.classList.remove('open');
        const toggle = group.querySelector('.nav-group-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function openMenu(group) {
    if (!group) return;
    const toggle = group.querySelector('.nav-group-toggle');
    if (!toggle) return;
    closeOpenMenus(group);
    group.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function getGroupMenuLinks(group) {
    if (!group) return [];
    return Array.from(group.querySelectorAll('.nav-group-menu .top-sub-link'));
  }

  function focusToggleByOffset(currentToggle, offset) {
    if (!currentToggle || !navToggles.length) return;
    const currentIndex = navToggles.indexOf(currentToggle);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + offset + navToggles.length) % navToggles.length;
    const nextToggle = navToggles[nextIndex];
    if (!nextToggle) return;
    closeOpenMenus(null);
    nextToggle.focus();
  }

  navGroups.forEach(group => {
    const toggle = group.querySelector('.nav-group-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !group.classList.contains('open');
      closeOpenMenus(group);
      group.classList.toggle('open', willOpen);
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
    toggle.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openMenu(group);
        const links = getGroupMenuLinks(group);
        if (links.length) links[0].focus();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        focusToggleByOffset(toggle, 1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        focusToggleByOffset(toggle, -1);
      }
    });
  });

  navLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      const href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      const targetId = href.slice(1);
      const targetSection = targetId ? document.getElementById(targetId) : null;
      event.preventDefault();
      closeOpenMenus(null);

      closeDrawer();

      if (!targetSection) return;

      const computed = window.getComputedStyle(targetSection);
      const isHidden = computed.display === 'none' || computed.visibility === 'hidden';
      if (isHidden) {
        const loginOverlay = document.getElementById('login-overlay');
        if (loginOverlay && loginOverlay.style.display !== 'none') {
          const loginMsg = document.getElementById('crew-login-msg');
          if (loginMsg) {
            loginMsg.textContent = 'Log in to access that section.';
            loginMsg.style.color = 'var(--error)';
          }
          const loginInput = document.getElementById('crew-login-bday');
          if (loginInput) loginInput.focus();
          if (typeof shakeLoginBox === 'function') shakeLoginBox();
        }
        return;
      }

      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNavLink(targetId);

      if (window.location.hash !== '#' + targetId) {
        window.history.replaceState(null, '', '#' + targetId);
      }
    });
    link.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const parentGroup = link.closest('.nav-group');
      const parentToggle = parentGroup ? parentGroup.querySelector('.nav-group-toggle') : null;
      if (!parentToggle) return;
      event.preventDefault();
      focusToggleByOffset(parentToggle, event.key === 'ArrowRight' ? 1 : -1);
    });
  });

  document.addEventListener('click', function (event) {
    const insideNav = event.target && event.target.closest && event.target.closest('.top-nav');
    if (!insideNav) { closeOpenMenus(null); closeDrawer(); }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    const openGroup = navGroups.find(function (group) { return group.classList.contains('open'); });
    closeOpenMenus(null);
    closeDrawer();
    if (openGroup) {
      const toggle = openGroup.querySelector('.nav-group-toggle');
      if (toggle) toggle.focus();
    }
  });

  document.addEventListener('focusin', function (event) {
    const insideNav = event.target && event.target.closest && event.target.closest('.top-nav');
    if (!insideNav) closeOpenMenus(null);
  });

  function syncTopNavHeightVar() {
    const topNav = document.querySelector('.top-nav');
    if (!topNav) return;
    const height = Math.ceil(topNav.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--top-nav-height', height + 'px');
  }
  syncTopNavHeightVar();
  window.addEventListener('resize', syncTopNavHeightVar);

  if (navMap.length) {
    setActiveNavLink(navMap[0].section.id);
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) setActiveNavLink(visible[0].target.id);
    }, { threshold: [0.2, 0.45, 0.7], rootMargin: '-30% 0px -55% 0px' });

    navMap.forEach(item => navObserver.observe(item.section));
  }

  function updateProgress() {
    const start = new Date('2026-04-03T00:00:00').getTime();
    const end = new Date('2026-05-03T06:10:00').getTime();
    const now = Date.now();
    const progress = Math.min(100, Math.max(0, (now - start) / (end - start) * 100));
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = progress + '%';
    const progressText = document.getElementById('progress-text');
    if (!progressText) return;
    if (now < start) {
      const daysToStart = Math.ceil((start - now) / 864e5);
      progressText.textContent = 'Trip prep starts in ' + daysToStart + ' day' + (daysToStart === 1 ? '' : 's');
      return;
    }
    if (now >= end) {
      progressText.textContent = 'Trip complete. Time for the stories.';
      return;
    }
    const daysPassed = Math.floor((now - start) / 864e5);
    const daysLeft = Math.ceil((end - now) / 864e5);
    progressText.textContent = daysPassed + ' days down, ' + daysLeft + ' to go';
  }
  updateProgress();
  setInterval(updateProgress, 60000);

  const groomBday = '170997';
  const bmBday = '160698';
  const defaultCrewCodes = [
    bmBday,
    '230997',
    '270298',
    '120398',
    '240598'
  ];
  const legacyCrewCodes = [];
  var loadedCrew = loadJSON('allowedCrewBdays', defaultCrewCodes);
  if (!Array.isArray(loadedCrew)) loadedCrew = defaultCrewCodes;
  const allowedCrewBdays = new Set(
    loadedCrew
      .map(normalizeCrewCode)
      .filter(Boolean)
  );
  defaultCrewCodes.forEach(function (code) { allowedCrewBdays.add(code); });
  legacyCrewCodes.forEach(function (code) { allowedCrewBdays.add(code); });
  allowedCrewBdays.add(bmBday);
  const defaultCrewNameByBday = {
    '170997': 'Ross',
    '160698': 'Joshua',
    '230997': 'Emmanuel',
    '270298': 'Kealen',
    '120398': 'Jack',
    '240598': 'Ciaran'
  };
  const crewNameByBday = Object.assign({}, defaultCrewNameByBday);
  const lockedCrewNameByBday = Object.assign({}, defaultCrewNameByBday);
  const crewMemberIdByBday = {
    '170997': 'ross',
    '160698': 'joshua',
    '230997': 'emmanuel',
    '270298': 'kealen',
    '120398': 'jack',
    '240598': 'ciaran'
  };
  const crewPersonalizationByBday = {
    '170997': {
      title: 'Groom Mode: Ross In The Building',
      subtitle: 'All eyes on the groom. Keep him fed, watered, and on schedule.',
      role: 'The Main Character'
    },
    '160698': {
      title: 'Best Man Console: Joshua Online',
      subtitle: 'Command center is unlocked. Crew access and chaos management are yours.',
      role: 'Best Man Controller'
    },
    '230997': {
      title: 'Emmanuel Is In',
      subtitle: 'Energy deployed. Keep the pace high and the stories better.',
      role: 'Vibes Captain'
    },
    '270298': {
      title: 'Kealen Has Joined The Crew',
      subtitle: 'Challenge engine activated. Keep the lads moving.',
      role: 'Challenge Specialist'
    },
    '120398': {
      title: 'Jack Has Checked In',
      subtitle: 'Route planner status: active. Keep everyone where they need to be.',
      role: 'Logistics Lad'
    },
    '240598': {
      title: 'Ciaran Has Entered Crew Mode',
      subtitle: 'Morale and momentum are now your responsibility.',
      role: 'Momentum Manager'
    }
  };
  const defaultCrewAliasToCode = {
    joshua: '160698',
    joshuamoore: '160698',
    josh: '160698',
    emmanuel: '230997',
    emmanuelpascual: '230997',
    ross: '170997',
    rosswightman: '170997',
    kealen: '270298',
    kealenboylan: '270298',
    jack: '120398',
    jackdoherty: '120398',
    ciaran: '240598',
    ciaranstone: '240598'
  };
  let crewAliasToCode = Object.assign({}, defaultCrewAliasToCode);
  let crewNameOverrides = loadJSON('crewNameOverrides', {});
  if (!crewNameOverrides || typeof crewNameOverrides !== 'object' || Array.isArray(crewNameOverrides)) {
    crewNameOverrides = {};
  }
  function normalizeCrewDisplayNameByCode(code, name) {
    const normalizedCode = normalizeCrewCode(code);
    const sanitized = sanitizeText(name, 40);
    if (!sanitized) return '';
    if (lockedCrewNameByBday[normalizedCode]) {
      return lockedCrewNameByBday[normalizedCode];
    }
    return sanitized;
  }
  Object.keys(crewNameOverrides).forEach(function (code) {
    const normalizedCode = normalizeCrewCode(code);
    const name = normalizeCrewDisplayNameByCode(normalizedCode, crewNameOverrides[code]);
    if (!normalizedCode || !name) return;
    crewNameByBday[normalizedCode] = name;
  });
  let crewPersonalizationOverrides = loadJSON('crewPersonalizationOverrides', {});
  if (!crewPersonalizationOverrides || typeof crewPersonalizationOverrides !== 'object' || Array.isArray(crewPersonalizationOverrides)) {
    crewPersonalizationOverrides = {};
  }
  let crewBdayState = '';

  function getCrewDisplayName(bday) {
    const code = String(bday || '');
    return crewNameByBday[code] || 'Crew member';
  }

  function saveCrewNameOverrides() {
    saveJSON('crewNameOverrides', crewNameByBday);
  }

  function supportsLocalStorage() {
    try { return typeof localStorage !== 'undefined' && localStorage !== null; } catch (e) { return false; }
  }

  function safeJSONParse(raw, fallback) {
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function makeActionButton(label, styleOrClass, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    if (styleOrClass && styleOrClass.indexOf(':') !== -1) {
      button.style.cssText = styleOrClass;
    } else if (styleOrClass) {
      styleOrClass.split(' ').forEach(function (c) { if (c) button.classList.add(c); });
    }
    button.addEventListener('click', onClick);
    return button;
  }

  function loadJSON(key, fallback) {
    if (!supportsLocalStorage()) return fallback;
    let item = null;
    try {
      item = localStorage.getItem(key);
    } catch (e) {
      return fallback;
    }
    return safeJSONParse(item, fallback);
  }

  function saveJSON(key, value) {
    if (!supportsLocalStorage()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Ignore storage write failures so UI continues working.
    }
  }

  function saveAllowedCrewCodes() {
    saveJSON('allowedCrewBdays', Array.from(allowedCrewBdays).sort());
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
    if (digits.length < 6) return digits.padStart(6, '0');
    if (digits.length === 8) return digits.slice(0, 4) + digits.slice(-2);
    if (digits.length === 7) {
      const padded = digits.padStart(8, '0');
      return padded.slice(0, 4) + padded.slice(-2);
    }
    return '';
  }

  function normalizeCrewNameKey(value) {
    return String(value || '').toLowerCase().replace(/[^a-z]/g, '');
  }

  function resolveCrewCredential(value) {
    const normalizedCode = normalizeCrewCode(value);
    if (normalizedCode) return normalizedCode;

    const nameKey = normalizeCrewNameKey(value);
    if (!nameKey) return '';
    return crewAliasToCode[nameKey] || '';
  }

  function getCrewBday() {
    // Keep access state in-memory only to reduce persistence abuse.
    return crewBdayState;
  }

  function setCrewBday(value) {
    crewBdayState = value || '';
  }

  function getBaseCrewPersonalization(code) {
    return crewPersonalizationByBday[code] || {
      title: 'Welcome Back, ' + getCrewDisplayName(code),
      subtitle: 'Crew mode is active. Keep the lads moving.',
      role: 'Crew Member'
    };
  }

  function getCrewPersonalization(code) {
    const base = getBaseCrewPersonalization(code);
    const override = crewPersonalizationOverrides[code] || {};
    return {
      title: sanitizeText(override.title || base.title, 90) || base.title,
      subtitle: sanitizeText(override.subtitle || base.subtitle, 180) || base.subtitle,
      role: sanitizeText(override.role || base.role, 40) || base.role
    };
  }

  function saveCrewPersonalizationOverrides() {
    saveJSON('crewPersonalizationOverrides', crewPersonalizationOverrides);
    queueChallengeStateSync(false);
  }

  let pendingChallenges = loadJSON('pendingChallenges', []);
  let approvedChallenges = loadJSON('approvedChallenges', []);
  let challengeVoteLog = loadJSON('challengeVoteLog', {});
  let challengeReportLog = loadJSON('challengeReportLog', {});
  let challengeSubmissionLog = loadJSON('challengeSubmissionLog', {});
  let challengeFeedFilter = { search: '', type: 'all', difficulty: 'all', sort: 'top' };
  let lastChallengeFeedCount = 0;
  const supabaseUrlMeta = document.querySelector('meta[name="supabase-url"]');
  const supabaseAnonKeyMeta = document.querySelector('meta[name="supabase-anon-key"]');
  const supabaseUrlRaw = (typeof window !== 'undefined' && window.__SUPABASE_URL)
    || (supabaseUrlMeta ? supabaseUrlMeta.getAttribute('content') : '')
    || '';
  const supabaseAnonKeyRaw = (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY)
    || (supabaseAnonKeyMeta ? supabaseAnonKeyMeta.getAttribute('content') : '')
    || '';
  const supabaseUrl = sanitizeText(supabaseUrlRaw, 300).replace(/\/+$/, '');
  const supabaseAnonKey = sanitizeText(supabaseAnonKeyRaw, 600);
  const supabaseRestBase = supabaseUrl ? (supabaseUrl + '/rest/v1') : '';
  const challengeCloudSyncEnabled = typeof window !== 'undefined'
    && /^https?:$/i.test(window.location.protocol || '')
    && !!supabaseRestBase
    && !!supabaseAnonKey;
  const challengeCloudPollIntervalMs = 4000;
  let challengeSyncInFlight = false;
  let challengeSyncQueued = false;
  let challengeSyncTimer = null;
  let challengeCloudPollTimer = null;
  let lastChallengeSyncHash = '';
  let scheduleSubmissionLog = loadJSON('scheduleSubmissionLog', {});
  let siteChangeSubmissionLog = loadJSON('siteChangeSubmissionLog', {});
  let pendingScheduleSuggestions = loadJSON('pendingScheduleSuggestions', []);
  let approvedScheduleSuggestions = loadJSON('approvedScheduleSuggestions', []);
  let pendingSiteChangeSuggestions = loadJSON('pendingSiteChangeSuggestions', []);
  let approvedSiteChangeSuggestions = loadJSON('approvedSiteChangeSuggestions', []);
  let pendingActivitySuggestions = loadJSON('pendingActivitySuggestions', []);
  let approvedActivitySuggestions = loadJSON('approvedActivitySuggestions', []);
  let activitySubmissionLog = loadJSON('activitySubmissionLog', {});
  let activityVoteLog = loadJSON('activityVoteLog', {});
  let shownChallengeIds = [];
  let completedChallengeIds = loadJSON('completedChallengeIds', []);
  let punishmentHistory = loadJSON('punishmentHistory', []);
  let crewPresence = loadJSON('crewPresence', {});
  if (!crewPresence || typeof crewPresence !== 'object' || Array.isArray(crewPresence)) crewPresence = {};
  let crewLocations = loadJSON('crewLocations', {});
  if (!crewLocations || typeof crewLocations !== 'object' || Array.isArray(crewLocations)) crewLocations = {};
  let challengeMetrics = loadJSON('challengeMetrics', {
    generated: 0,
    completed: 0,
    skipped: 0,
    expired: 0
  });
  let challengeHistory = loadJSON('challengeHistory', []);
  let packingChecked = loadJSON('packingChecked', {});
  let currentChallenge = null;
  let currentChallengeOutcome = '';
  let currentChallengeDeadline = 0;
  let currentChallengeLimitMinutes = 0;
  let challengeTimerInterval = null;
  let challengeTimerWarningSent = false;
  let challengeTimerExpiredSent = false;
  let challengeNotificationPermissionAttempted = false;
  const challengeAutoTimeByDifficulty = {
    Easy: 15,
    Medium: 10,
    Chaos: 7
  };
  let teamBattle = loadJSON('teamBattle', {
    nameA: 'Team A',
    nameB: 'Team B',
    scoreA: 0,
    scoreB: 0,
    currentAssignment: null
  });
  const crewMembers = ['Joshua', 'Emmanuel', 'Ross', 'Kealen', 'Jack', 'Ciaran'];
  let missionBoard = loadJSON('missionBoard', []);
  let expenseEntries = loadJSON('expenseEntries', []);
  let pollBoard = loadJSON('pollBoard', {
    selected: 'favorite',
    polls: {
      favorite: {
        question: "What's your favorite part of stag dos?",
        options: {
          drinking: { label: 'Drinking Games', votes: 0 },
          adventures: { label: 'Adventures & Activities', votes: 0 },
          bonding: { label: 'Lads Bonding', votes: 0 },
          surprises: { label: 'Surprises', votes: 0 }
        }
      },
      dinner: {
        question: 'Preferred main dinner style?',
        options: {
          tapas: { label: 'Tapas Crawl', votes: 0 },
          steak: { label: 'Steakhouse', votes: 0 },
          seafood: { label: 'Seafood Spot', votes: 0 },
          quick: { label: 'Quick Pizza Then Bars', votes: 0 }
        }
      },
      kickoff: {
        question: 'Best first-night kickoff plan?',
        options: {
          rooftop: { label: 'Rooftop Drinks', votes: 0 },
          barhop: { label: 'Bar Hop', votes: 0 },
          beach: { label: 'Beachfront Start', votes: 0 },
          chill: { label: 'Chill Start, Late Finish', votes: 0 }
        }
      }
    }
  });

  function normalizeTitle(value) {
    return String(value || '').toLowerCase().trim().replace(/\s+/g, ' ');
  }

  function normalizeURL(value) {
    const raw = sanitizeText(value, 300);
    if (!raw) return '';
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
    try {
      const parsed = new URL(withProtocol);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
      return parsed.toString();
    } catch (e) {
      return '';
    }
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  const MAX_SYNC_ITEMS = 400;
  const MAX_SYNC_LOG_KEYS = 5000;

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function sanitizeLogMap(value, numeric) {
    const out = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
    Object.entries(value).slice(0, MAX_SYNC_LOG_KEYS).forEach(function (entry) {
      const key = sanitizeText(entry[0], 140);
      if (!key) return;
      out[key] = numeric ? clampNumber(entry[1], -999999, 999999, 0) : !!entry[1];
    });
    return out;
  }

  function sanitizeChallengeEntry(item) {
    if (!item || typeof item !== 'object') return null;
    const title = sanitizeText(item.title, 120);
    if (title.length < 3) return null;
    let completions = Array.isArray(item.completions) ? item.completions : [];
    completions = completions
      .map(function (c) { return sanitizeText(c, 24); })
      .filter(function (c) { return c && c.length >= 2; })
      .slice(0, 32);
    // De-dupe while keeping order.
    var seenComp = {};
    completions = completions.filter(function (c) { if (seenComp[c]) return false; seenComp[c] = true; return true; });
    return {
      id: sanitizeText(item.id, 64) || (Date.now().toString() + Math.random().toString(36).slice(2, 7)),
      title: title,
      type: sanitizeText(item.type, 24) || 'Chill',
      difficulty: sanitizeText(item.difficulty, 24) || 'Easy',
      notes: sanitizeText(item.notes, 300),
      suggestedBy: sanitizeText(item.suggestedBy, 24) || 'Crew',
      createdAt: clampNumber(item.createdAt, 0, 9999999999999, Date.now()),
      votes: clampNumber(item.votes, -9999, 9999, 0),
      reports: clampNumber(item.reports, 0, 9999, 0),
      hidden: !!item.hidden,
      completions: completions
    };
  }

  function sanitizeScheduleEntry(item) {
    if (!item || typeof item !== 'object') return null;
    const title = sanitizeText(item.title, 120);
    const day = sanitizeText(item.day, 50);
    const time = sanitizeText(item.time, 40);
    const details = sanitizeText(item.details, 320);
    if (title.length < 3 || day.length < 2 || time.length < 1 || details.length < 3) return null;
    return {
      id: sanitizeText(item.id, 64) || (Date.now().toString() + Math.random().toString(36).slice(2, 7)),
      title: title,
      day: day,
      time: time,
      details: details,
      link: normalizeURL(item.link),
      suggestedBy: sanitizeText(item.suggestedBy, 24) || 'Crew',
      createdAt: clampNumber(item.createdAt, 0, 9999999999999, Date.now())
    };
  }

  function sanitizeSiteChangeEntry(item) {
    if (!item || typeof item !== 'object') return null;
    const sectionName = sanitizeText(item.sectionName, 80) || 'Any Section';
    const title = sanitizeText(item.title, 120);
    const details = sanitizeText(item.details, 400);
    if (title.length < 3 || details.length < 6) return null;
    return {
      id: sanitizeText(item.id, 64) || (Date.now().toString() + Math.random().toString(36).slice(2, 7)),
      sectionName: sectionName,
      title: title,
      details: details,
      link: normalizeURL(item.link),
      suggestedBy: sanitizeText(item.suggestedBy, 24) || 'Crew',
      createdAt: clampNumber(item.createdAt, 0, 9999999999999, Date.now())
    };
  }

  function sanitizeActivityEntry(item) {
    if (!item || typeof item !== 'object') return null;
    const title = sanitizeText(item.title, 120);
    const details = sanitizeText(item.details, 400);
    if (title.length < 3 || details.length < 6) return null;
    return {
      id: sanitizeText(item.id, 64) || (Date.now().toString() + Math.random().toString(36).slice(2, 7)),
      title: title,
      details: details,
      price: sanitizeText(item.price, 80),
      link: normalizeURL(item.link),
      suggestedBy: sanitizeText(item.suggestedBy, 24) || 'Crew',
      createdAt: clampNumber(item.createdAt, 0, 9999999999999, Date.now()),
      votes: clampNumber(item.votes, -9999, 9999, 0),
      reports: clampNumber(item.reports, 0, 9999, 0),
      hidden: !!item.hidden
    };
  }

  function sanitizeMissionEntry(item) {
    if (!item || typeof item !== 'object') return null;
    const title = sanitizeText(item.title, 140);
    const team = item.team === 'B' ? 'B' : 'A';
    const points = clampNumber(item.points, 1, 10, 1);
    if (title.length < 3) return null;
    return {
      id: sanitizeText(item.id, 64) || (Date.now().toString() + Math.random().toString(36).slice(2, 7)),
      title: title,
      points: points,
      team: team,
      completed: !!item.completed,
      createdAt: clampNumber(item.createdAt, 0, 9999999999999, Date.now())
    };
  }

  function sanitizeExpenseEntry(item) {
    if (!item || typeof item !== 'object') return null;
    const payerRaw = sanitizeText(item.payer, 40);
    const payer = crewMembers.includes(payerRaw) ? payerRaw : crewMembers[0];
    const amount = clampNumber(item.amount, 0.01, 100000, 0);
    if (!amount) return null;
    return {
      id: sanitizeText(item.id, 64) || (Date.now().toString() + Math.random().toString(36).slice(2, 7)),
      payer: payer,
      amount: Math.round(amount * 100) / 100,
      note: sanitizeText(item.note, 140) || 'General',
      createdAt: clampNumber(item.createdAt, 0, 9999999999999, Date.now())
    };
  }

  function sanitizeCompletedChallenges(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    const seen = new Set();
    list.forEach(function (item) {
      const key = sanitizeText(item, 96);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(key);
    });
    return out.slice(0, MAX_SYNC_LOG_KEYS);
  }

  function sanitizeChallengeMetrics(value) {
    var source = value && typeof value === 'object' ? value : {};
    return {
      generated: clampNumber(source.generated, 0, 999999, 0),
      completed: clampNumber(source.completed, 0, 999999, 0),
      skipped: clampNumber(source.skipped, 0, 999999, 0),
      expired: clampNumber(source.expired, 0, 999999, 0)
    };
  }

  function sanitizeChallengeHistory(list) {
    if (!Array.isArray(list)) return [];
    return list
      .map(function (item) {
        if (!item || typeof item !== 'object') return null;
        return {
          title: sanitizeText(item.title, 120),
          outcome: sanitizeText(item.outcome, 20).toLowerCase(),
          when: clampNumber(item.when, 0, 9999999999999, Date.now())
        };
      })
      .filter(function (item) { return item && item.title; })
      .slice(0, 12);
  }

  function sanitizePunishmentHistory(list) {
    if (!Array.isArray(list)) return [];
    return list
      .map(function (item) { return sanitizeText(item, 220); })
      .filter(Boolean)
      .slice(0, 25);
  }

  function sanitizeTeamBattle(value) {
    const state = value && typeof value === 'object' ? value : {};
    const assignment = state.currentAssignment && typeof state.currentAssignment === 'object'
      ? state.currentAssignment
      : null;
    const cleanAssignment = assignment
      ? {
        team: assignment.team === 'B' ? 'B' : 'A',
        teamName: sanitizeText(assignment.teamName, 40),
        challengeKey: sanitizeText(assignment.challengeKey, 96),
        challengeTitle: sanitizeText(assignment.challengeTitle, 140)
      }
      : null;
    return {
      nameA: sanitizeText(state.nameA, 40) || 'Team A',
      nameB: sanitizeText(state.nameB, 40) || 'Team B',
      scoreA: clampNumber(state.scoreA, 0, 9999, 0),
      scoreB: clampNumber(state.scoreB, 0, 9999, 0),
      currentAssignment: cleanAssignment
    };
  }

  function sanitizePollBoardState(value) {
    const fallback = {
      selected: 'favorite',
      polls: {
        favorite: {
          question: "What's your favorite part of stag dos?",
          options: {
            drinking: { label: 'Drinking Games', votes: 0 },
            adventures: { label: 'Adventures & Activities', votes: 0 },
            bonding: { label: 'Lads Bonding', votes: 0 },
            surprises: { label: 'Surprises', votes: 0 }
          }
        }
      }
    };
    const source = value && typeof value === 'object' ? value : {};
    const sourcePolls = source.polls && typeof source.polls === 'object' ? source.polls : {};
    const outPolls = {};
    Object.entries(sourcePolls).slice(0, 15).forEach(function (entry) {
      const pollKey = sanitizeText(entry[0], 40).toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const poll = entry[1] && typeof entry[1] === 'object' ? entry[1] : null;
      if (!pollKey || !poll) return;
      const options = {};
      const optionEntries = poll.options && typeof poll.options === 'object' ? Object.entries(poll.options) : [];
      optionEntries.slice(0, 12).forEach(function (optEntry) {
        const optionKey = sanitizeText(optEntry[0], 40).toLowerCase().replace(/[^a-z0-9_-]/g, '');
        const option = optEntry[1] && typeof optEntry[1] === 'object' ? optEntry[1] : null;
        if (!optionKey || !option) return;
        const label = sanitizeText(option.label, 80);
        if (!label) return;
        options[optionKey] = {
          label: label,
          votes: clampNumber(option.votes, 0, 100000, 0)
        };
      });
      if (!Object.keys(options).length) return;
      outPolls[pollKey] = {
        question: sanitizeText(poll.question, 180) || 'Crew Poll',
        options: options
      };
    });
    const polls = Object.keys(outPolls).length ? outPolls : fallback.polls;
    const selected = sanitizeText(source.selected, 40).toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return {
      selected: polls[selected] ? selected : Object.keys(polls)[0],
      polls: polls
    };
  }

  function sanitizeCrewOverrides(value) {
    const map = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const out = {};
    Object.entries(map).forEach(function (entry) {
      const code = normalizeCrewCode(entry[0]);
      const data = entry[1] && typeof entry[1] === 'object' ? entry[1] : null;
      if (!code || !isAllowedCrewBday(code) || !data) return;
      out[code] = {
        title: sanitizeText(data.title, 90),
        subtitle: sanitizeText(data.subtitle, 180),
        role: sanitizeText(data.role, 40)
      };
    });
    return out;
  }

  function sanitizePackingState(value) {
    const out = {};
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    packingItems.forEach(function (item) {
      out[item] = !!source[item];
    });
    return out;
  }

  function sanitizeList(list, sanitizer) {
    if (!Array.isArray(list)) return [];
    const out = [];
    const seen = new Set();
    list.forEach(function (item) {
      const clean = sanitizer(item);
      if (!clean || seen.has(clean.id)) return;
      seen.add(clean.id);
      out.push(clean);
    });
    return out.slice(0, MAX_SYNC_ITEMS);
  }

  function sanitizeCrewPresence(value) {
    const out = {};
    if (!value || typeof value !== 'object') return out;
    const cutoff = Date.now() - (30 * 60 * 1000); // drop entries older than 30 min
    Object.keys(value).slice(0, 32).forEach(function (code) {
      const entry = value[code];
      if (!entry || typeof entry !== 'object') return;
      const ts = Number(entry.lastSeen);
      if (!Number.isFinite(ts) || ts < cutoff) return;
      out[String(code).slice(0, 32)] = {
        lastSeen: ts,
        name: sanitizeText(entry.name, 40) || ''
      };
    });
    return out;
  }
  function sanitizeCrewLocations(value) {
    const out = {};
    if (!value || typeof value !== 'object') return out;
    const cutoff = Date.now() - (30 * 60 * 1000); // 30-min expiry
    Object.keys(value).slice(0, 32).forEach(function (code) {
      const entry = value[code];
      if (!entry || typeof entry !== 'object') return;
      const ts = Number(entry.ts);
      const lat = Number(entry.lat);
      const lng = Number(entry.lng);
      if (!Number.isFinite(ts) || ts < cutoff) return;
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) return;
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) return;
      out[String(code).slice(0, 32)] = { lat: lat, lng: lng, ts: ts };
    });
    return out;
  }

  function sanitizeCloudState(payload) {
    const state = payload && typeof payload === 'object' ? payload : {};
    return {
      pendingChallenges: sanitizeList(state.pendingChallenges, sanitizeChallengeEntry),
      approvedChallenges: sanitizeList(state.approvedChallenges, sanitizeChallengeEntry),
      challengeVoteLog: sanitizeLogMap(state.challengeVoteLog, true),
      challengeReportLog: sanitizeLogMap(state.challengeReportLog, false),
      challengeSubmissionLog: sanitizeLogMap(state.challengeSubmissionLog, true),
      scheduleSubmissionLog: sanitizeLogMap(state.scheduleSubmissionLog, true),
      siteChangeSubmissionLog: sanitizeLogMap(state.siteChangeSubmissionLog, true),
      pendingScheduleSuggestions: sanitizeList(state.pendingScheduleSuggestions, sanitizeScheduleEntry),
      approvedScheduleSuggestions: sanitizeList(state.approvedScheduleSuggestions, sanitizeScheduleEntry),
      pendingSiteChangeSuggestions: sanitizeList(state.pendingSiteChangeSuggestions, sanitizeSiteChangeEntry),
      approvedSiteChangeSuggestions: sanitizeList(state.approvedSiteChangeSuggestions, sanitizeSiteChangeEntry),
      pendingActivitySuggestions: sanitizeList(state.pendingActivitySuggestions, sanitizeActivityEntry),
      approvedActivitySuggestions: sanitizeList(state.approvedActivitySuggestions, sanitizeActivityEntry),
      activitySubmissionLog: sanitizeLogMap(state.activitySubmissionLog, true),
      activityVoteLog: sanitizeLogMap(state.activityVoteLog, true),
      completedChallengeIds: sanitizeCompletedChallenges(state.completedChallengeIds),
      punishmentHistory: sanitizePunishmentHistory(state.punishmentHistory),
      teamBattle: sanitizeTeamBattle(state.teamBattle),
      missionBoard: sanitizeList(state.missionBoard, sanitizeMissionEntry),
      expenseEntries: sanitizeList(state.expenseEntries, sanitizeExpenseEntry),
      pollBoard: sanitizePollBoardState(state.pollBoard),
      crewPersonalizationOverrides: sanitizeCrewOverrides(state.crewPersonalizationOverrides),
      challengeMetrics: sanitizeChallengeMetrics(state.challengeMetrics),
      challengeHistory: sanitizeChallengeHistory(state.challengeHistory),
      packingChecked: sanitizePackingState(state.packingChecked),
      crewPresence: sanitizeCrewPresence(state.crewPresence),
      crewLocations: sanitizeCrewLocations(state.crewLocations)
    };
  }

  function mergeLiveSuggestions(liveList, queuedList, getKey) {
    const merged = Array.isArray(liveList) ? liveList.slice(0, MAX_SYNC_ITEMS) : [];
    const queued = Array.isArray(queuedList) ? queuedList : [];
    const seen = new Set();
    let changed = false;

    merged.forEach(function (item) {
      const key = getKey(item);
      if (key) seen.add(key);
    });

    queued.forEach(function (item) {
      const key = getKey(item);
      if (!key || seen.has(key)) {
        changed = true;
        return;
      }
      seen.add(key);
      merged.push(item);
      changed = true;
    });

    return {
      list: merged.slice(0, MAX_SYNC_ITEMS),
      changed: changed
    };
  }

  function normalizeSubmissionQueues() {
    let changed = false;
    let merged = mergeLiveSuggestions(approvedChallenges, pendingChallenges, function (item) {
      return normalizeTitle(item && item.title);
    });
    approvedChallenges = merged.list;
    changed = changed || merged.changed || pendingChallenges.length > 0;
    pendingChallenges = [];

    merged = mergeLiveSuggestions(approvedScheduleSuggestions, pendingScheduleSuggestions, function (item) {
      return normalizeTitle((item && item.title) + '|' + (item && item.day) + '|' + (item && item.time));
    });
    approvedScheduleSuggestions = merged.list;
    changed = changed || merged.changed || pendingScheduleSuggestions.length > 0;
    pendingScheduleSuggestions = [];

    merged = mergeLiveSuggestions(approvedSiteChangeSuggestions, pendingSiteChangeSuggestions, function (item) {
      return normalizeTitle((item && item.sectionName) + '|' + (item && item.title) + '|' + (item && item.details));
    });
    approvedSiteChangeSuggestions = merged.list;
    changed = changed || merged.changed || pendingSiteChangeSuggestions.length > 0;
    pendingSiteChangeSuggestions = [];

    merged = mergeLiveSuggestions(approvedActivitySuggestions, pendingActivitySuggestions, function (item) {
      return normalizeTitle(item && item.title);
    });
    approvedActivitySuggestions = merged.list;
    changed = changed || merged.changed || pendingActivitySuggestions.length > 0;
    pendingActivitySuggestions = [];

    return changed;
  }

  function getCurrentCrewKey() {
    return getCrewBday();
  }

  function isAllowedCrewBday(bday) {
    const value = String(bday || '');
    return value === groomBday || allowedCrewBdays.has(value);
  }

  let lastLocalEditAt = 0;
  const LOCAL_EDIT_GUARD_MS = 2500;

  function saveChallengeData() {
    normalizeSubmissionQueues();
    lastLocalEditAt = Date.now();
    saveJSON('pendingChallenges', pendingChallenges);
    saveJSON('approvedChallenges', approvedChallenges);
    saveJSON('challengeVoteLog', challengeVoteLog);
    saveJSON('challengeReportLog', challengeReportLog);
    saveJSON('challengeSubmissionLog', challengeSubmissionLog);
    saveJSON('scheduleSubmissionLog', scheduleSubmissionLog);
    saveJSON('siteChangeSubmissionLog', siteChangeSubmissionLog);
    saveJSON('pendingScheduleSuggestions', pendingScheduleSuggestions);
    saveJSON('approvedScheduleSuggestions', approvedScheduleSuggestions);
    saveJSON('pendingSiteChangeSuggestions', pendingSiteChangeSuggestions);
    saveJSON('approvedSiteChangeSuggestions', approvedSiteChangeSuggestions);
    saveJSON('pendingActivitySuggestions', pendingActivitySuggestions);
    saveJSON('approvedActivitySuggestions', approvedActivitySuggestions);
    saveJSON('activitySubmissionLog', activitySubmissionLog);
    saveJSON('activityVoteLog', activityVoteLog);
    saveJSON('completedChallengeIds', completedChallengeIds);
    saveJSON('punishmentHistory', punishmentHistory);
    saveJSON('teamBattle', teamBattle);
    saveJSON('missionBoard', missionBoard);
    saveJSON('expenseEntries', expenseEntries);
    saveJSON('pollBoard', pollBoard);
    saveJSON('challengeMetrics', sanitizeChallengeMetrics(challengeMetrics));
    saveJSON('challengeHistory', sanitizeChallengeHistory(challengeHistory));
    saveJSON('packingChecked', packingChecked);
    saveJSON('crewPresence', crewPresence);
    saveJSON('crewLocations', crewLocations);
    saveCrewPersonalizationOverrides();
    queueChallengeStateSync(false);
  }

  if (normalizeSubmissionQueues()) {
    saveChallengeData();
  }

  function getChallengeStatePayload() {
    return sanitizeCloudState({
      pendingChallenges: pendingChallenges,
      approvedChallenges: approvedChallenges,
      challengeVoteLog: challengeVoteLog,
      challengeReportLog: challengeReportLog,
      challengeSubmissionLog: challengeSubmissionLog,
      scheduleSubmissionLog: scheduleSubmissionLog,
      siteChangeSubmissionLog: siteChangeSubmissionLog,
      pendingScheduleSuggestions: pendingScheduleSuggestions,
      approvedScheduleSuggestions: approvedScheduleSuggestions,
      pendingSiteChangeSuggestions: pendingSiteChangeSuggestions,
      approvedSiteChangeSuggestions: approvedSiteChangeSuggestions,
      pendingActivitySuggestions: pendingActivitySuggestions,
      approvedActivitySuggestions: approvedActivitySuggestions,
      activitySubmissionLog: activitySubmissionLog,
      activityVoteLog: activityVoteLog,
      completedChallengeIds: completedChallengeIds,
      punishmentHistory: punishmentHistory,
      teamBattle: teamBattle,
      missionBoard: missionBoard,
      expenseEntries: expenseEntries,
      pollBoard: pollBoard,
      crewPersonalizationOverrides: crewPersonalizationOverrides,
      challengeMetrics: challengeMetrics,
      challengeHistory: challengeHistory,
      packingChecked: packingChecked,
      crewPresence: crewPresence,
      crewLocations: crewLocations
    });
  }

  function hashChallengePayload(payload) {
    try {
      return JSON.stringify(payload);
    } catch (e) {
      return '';
    }
  }

  function applyChallengeStatePayload(payload, options) {
    // Skip applying remote state if the user has edited within the last
    // LOCAL_EDIT_GUARD_MS — prevents remote snapshots from clobbering
    // in-flight local edits.  Forced applies (options.force) bypass this.
    const force = options && options.force;
    if (!force && Date.now() - lastLocalEditAt < LOCAL_EDIT_GUARD_MS) {
      // Re-queue a sync so our local edits get pushed promptly.
      if (typeof queueChallengeStateSync === 'function') queueChallengeStateSync(false);
      return;
    }
    const safe = sanitizeCloudState(payload);
    pendingChallenges = safe.pendingChallenges;
    approvedChallenges = safe.approvedChallenges;
    challengeVoteLog = safe.challengeVoteLog;
    challengeReportLog = safe.challengeReportLog;
    challengeSubmissionLog = safe.challengeSubmissionLog;
    scheduleSubmissionLog = safe.scheduleSubmissionLog;
    siteChangeSubmissionLog = safe.siteChangeSubmissionLog;
    pendingScheduleSuggestions = safe.pendingScheduleSuggestions;
    approvedScheduleSuggestions = safe.approvedScheduleSuggestions;
    pendingSiteChangeSuggestions = safe.pendingSiteChangeSuggestions;
    approvedSiteChangeSuggestions = safe.approvedSiteChangeSuggestions;
    pendingActivitySuggestions = safe.pendingActivitySuggestions;
    approvedActivitySuggestions = safe.approvedActivitySuggestions;
    activitySubmissionLog = safe.activitySubmissionLog;
    activityVoteLog = safe.activityVoteLog;
    completedChallengeIds = safe.completedChallengeIds;
    punishmentHistory = safe.punishmentHistory;
    teamBattle = safe.teamBattle;
    missionBoard = safe.missionBoard;
    expenseEntries = safe.expenseEntries;
    pollBoard = safe.pollBoard;
    crewPersonalizationOverrides = safe.crewPersonalizationOverrides;
    challengeMetrics = safe.challengeMetrics;
    challengeHistory = safe.challengeHistory;
    packingChecked = safe.packingChecked;
    // Merge our own presence/location entry back in so it isn't dropped by
    // someone else's write that happened before we last updated ours.
    const localCrew = getCurrentCrewKey();
    const mergedPresence = Object.assign({}, safe.crewPresence);
    const mergedLocations = Object.assign({}, safe.crewLocations);
    if (localCrew && crewPresence[localCrew]) {
      const existing = mergedPresence[localCrew];
      const ours = crewPresence[localCrew];
      if (!existing || (Number(ours.lastSeen) || 0) > (Number(existing.lastSeen) || 0)) {
        mergedPresence[localCrew] = ours;
      }
    }
    if (localCrew && crewLocations[localCrew]) {
      const existingL = mergedLocations[localCrew];
      const oursL = crewLocations[localCrew];
      if (!existingL || (Number(oursL.ts) || 0) > (Number(existingL.ts) || 0)) {
        mergedLocations[localCrew] = oursL;
      }
    }
    // Detect new items for toast notifications (only after first load).
    try {
      if (typeof notifyOfNewSubmissions === 'function') {
        notifyOfNewSubmissions({
          prevChallenges: approvedChallenges,
          nextChallenges: safe.approvedChallenges,
          prevActivities: approvedActivitySuggestions,
          nextActivities: safe.approvedActivitySuggestions,
          prevSchedule: approvedScheduleSuggestions,
          nextSchedule: safe.approvedScheduleSuggestions,
          prevSiteChanges: approvedSiteChangeSuggestions,
          nextSiteChanges: safe.approvedSiteChangeSuggestions
        });
      }
    } catch (_) { /* ignore */ }
    crewPresence = mergedPresence;
    crewLocations = mergedLocations;
    normalizeSubmissionQueues();
    try {
      if (typeof renderCrewPresence === 'function') renderCrewPresence();
      if (typeof renderLeaderboard === 'function') renderLeaderboard();
    if (typeof renderCrewActivityFeed === 'function') renderCrewActivityFeed();
      if (typeof renderCrewLocationMap === 'function') renderCrewLocationMap();
    } catch (_) { /* ignore */ }
  }

  function refreshChallengeUiFromState() {
    refreshPendingChallengeViews();
    displayApprovedChallenges();
    updateTeamBattleUI();
    renderMissionBoard();
    populateExpensePayerOptions();
    renderExpenseBoard();
    renderPollBoard();
    updateLadsPersonalization();
    const result = document.getElementById('punishment-result');
    const history = document.getElementById('punishment-history');
    if (result) result.textContent = punishmentHistory.length ? punishmentHistory[0] : '';
    if (history) history.textContent = punishmentHistory.length ? ('Recent: ' + punishmentHistory.join(' | ')) : '';
    renderChallengeInsights();
    initPackingList();
    if (typeof renderCrewActivityFeed === 'function') renderCrewActivityFeed();
    if (typeof updateActivityBadge === 'function') updateActivityBadge();
  }

  function getSupabaseHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: 'Bearer ' + supabaseAnonKey
    };
    return headers;
  }

  function getNoStoreHeaders() {
    return {
      'Cache-Control': 'no-store'
    };
  }

  function normalizePhoneHref(value) {
    const text = sanitizeText(value, 60);
    if (!text) return '';
    const digits = text.replace(/[^\d+]/g, '');
    if (!digits) return '';
    return digits.charAt(0) === '+' ? digits : '+' + digits;
  }

  function setTripDetailText(id, value, fallback) {
    const el = document.getElementById(id);
    if (!el) return;
    const safe = sanitizeText(value, 120) || fallback;
    el.textContent = safe;
  }

  function setTripDetailPhone(id, value, fallback) {
    const el = document.getElementById(id);
    if (!el) return;
    const safe = sanitizeText(value, 60) || fallback;
    const phoneHref = normalizePhoneHref(safe);
    el.textContent = safe;
    el.setAttribute('href', phoneHref ? ('tel:' + phoneHref) : '#');
  }

  function applyTripDetails(details) {
    const data = details && typeof details === 'object' ? details : {};
    setTripDetailText('hotel-booking-code', data.hotelBookingCode, 'Unavailable');
    setTripDetailText('transfer-booking-code', data.transferBookingCode, 'Unavailable');
    setTripDetailText('trip-code', data.tripCode, 'Unavailable');
    const transferEmergencyPhone = sanitizeText(data.transferEmergencyPhone, 60) || 'Unavailable';
    setTripDetailText('transfer-emergency-number', transferEmergencyPhone, 'Unavailable');
    setTripDetailPhone('support-phone-link', data.supportPhone, 'Unavailable');
    setTripDetailPhone('transfer-emergency-link', transferEmergencyPhone, 'Unavailable');
    setTripDetailPhone('transfer-emergency-alt-link', data.transferEmergencyAltPhone, 'Unavailable');
  }

  async function loadTripDetailsFromCloud() {
    applyTripDetails({});
    if (!challengeCloudSyncEnabled) return false;
    try {
      const res = await fetch(supabaseRestBase + '/trip_details?id=eq.1&select=details', {
        method: 'GET',
        headers: Object.assign({}, getNoStoreHeaders(), getSupabaseHeaders()),
        cache: 'no-store'
      });
      if (!res.ok) return false;
      const payload = await res.json();
      const row = Array.isArray(payload) ? payload[0] : null;
      if (!row || !row.details || typeof row.details !== 'object') return false;
      applyTripDetails(row.details);
      return true;
    } catch (e) {
      return false;
    }
  }

  let offlineIndicatorVisible = false;
  function ensureOfflineIndicator() {
    let el = document.getElementById('offline-indicator');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'offline-indicator';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = 'Offline — changes will sync when back online';
    el.style.cssText = [
      'position:fixed', 'bottom:12px', 'left:50%',
      'transform:translateX(-50%) translateY(20px)',
      'background:rgba(201,56,42,.95)', 'color:#fff',
      'padding:8px 16px', 'border-radius:20px',
      'font-size:13px', 'font-weight:600', 'letter-spacing:.03em',
      'box-shadow:0 6px 20px rgba(0,0,0,.4)',
      'z-index:9999', 'opacity:0',
      'transition:opacity .3s ease, transform .3s ease',
      'pointer-events:none'
    ].join(';');
    document.body.appendChild(el);
    return el;
  }
  function setOfflineIndicator(isOffline) {
    if (isOffline === offlineIndicatorVisible) return;
    offlineIndicatorVisible = isOffline;
    const el = ensureOfflineIndicator();
    if (isOffline) {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    } else {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
    }
  }
  window.addEventListener('online', function () {
    setOfflineIndicator(false);
    // Attempt to flush any pending local edits now that we're back online.
    if (typeof queueChallengeStateSync === 'function') {
      try { queueChallengeStateSync(true); } catch (_) { /* ignore */ }
    }
  });
  window.addEventListener('offline', function () { setOfflineIndicator(true); });

  function queueChallengeStateSync(force) {
    if (!challengeCloudSyncEnabled) return;
    if (!force) {
      if (challengeSyncTimer) clearTimeout(challengeSyncTimer);
      challengeSyncTimer = setTimeout(function () {
        challengeSyncTimer = null;
        queueChallengeStateSync(true);
      }, 1200);
      return;
    }
    if (challengeSyncTimer) {
      clearTimeout(challengeSyncTimer);
      challengeSyncTimer = null;
    }
    const payload = getChallengeStatePayload();
    const payloadHash = hashChallengePayload(payload);
    if (!force && payloadHash && payloadHash === lastChallengeSyncHash) return;
    if (challengeSyncInFlight) {
      challengeSyncQueued = true;
      return;
    }
    challengeSyncInFlight = true;
    fetch(supabaseRestBase + '/challenge_state?id=eq.1', {
      method: 'PATCH',
      headers: Object.assign({}, getNoStoreHeaders(), getSupabaseHeaders(), {
        Prefer: 'return=representation'
      }),
      body: JSON.stringify({
        state: payload,
        updated_at: new Date().toISOString()
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Sync failed');
        return res.json();
      })
      .then(function (body) {
        const row = Array.isArray(body) ? body[0] : null;
        if (!row || !row.state || typeof row.state !== 'object') return;
        applyChallengeStatePayload(row.state);
        lastChallengeSyncHash = hashChallengePayload(getChallengeStatePayload());
        setOfflineIndicator(false);
      })
      .catch(function () {
        // Silent fallback to local-only behavior when cloud sync is unavailable.
        setOfflineIndicator(true);
      })
      .finally(function () {
        challengeSyncInFlight = false;
        if (!challengeSyncQueued) return;
        challengeSyncQueued = false;
        queueChallengeStateSync(true);
      });
  }

  async function loadChallengeStateFromCloud() {
    if (!challengeCloudSyncEnabled) return false;
    try {
      const res = await fetch(supabaseRestBase + '/challenge_state?id=eq.1&select=state', {
        method: 'GET',
        headers: Object.assign({}, getNoStoreHeaders(), getSupabaseHeaders()),
        cache: 'no-store'
      });
      if (!res.ok) return false;
      const body = await res.json();
      const row = Array.isArray(body) ? body[0] : null;
      if (!row || !row.state || typeof row.state !== 'object') return false;
      applyChallengeStatePayload(row.state, { force: true });
      lastChallengeSyncHash = hashChallengePayload(getChallengeStatePayload());
      saveJSON('pendingChallenges', pendingChallenges);
      saveJSON('approvedChallenges', approvedChallenges);
      saveJSON('challengeVoteLog', challengeVoteLog);
      saveJSON('challengeReportLog', challengeReportLog);
      saveJSON('challengeSubmissionLog', challengeSubmissionLog);
      saveJSON('scheduleSubmissionLog', scheduleSubmissionLog);
      saveJSON('siteChangeSubmissionLog', siteChangeSubmissionLog);
      saveJSON('pendingScheduleSuggestions', pendingScheduleSuggestions);
      saveJSON('approvedScheduleSuggestions', approvedScheduleSuggestions);
      saveJSON('pendingSiteChangeSuggestions', pendingSiteChangeSuggestions);
      saveJSON('approvedSiteChangeSuggestions', approvedSiteChangeSuggestions);
      saveJSON('pendingActivitySuggestions', pendingActivitySuggestions);
      saveJSON('approvedActivitySuggestions', approvedActivitySuggestions);
      saveJSON('activitySubmissionLog', activitySubmissionLog);
      saveJSON('activityVoteLog', activityVoteLog);
      saveJSON('completedChallengeIds', completedChallengeIds);
      saveJSON('punishmentHistory', punishmentHistory);
      saveJSON('teamBattle', teamBattle);
      saveJSON('missionBoard', missionBoard);
      saveJSON('expenseEntries', expenseEntries);
      saveJSON('pollBoard', pollBoard);
      saveJSON('challengeMetrics', challengeMetrics);
      saveJSON('challengeHistory', challengeHistory);
      saveJSON('packingChecked', packingChecked);
      saveCrewPersonalizationOverrides();
      refreshChallengeUiFromState();
      if (getCrewBday() && !isAllowedCrewBday(getCrewBday())) {
        setCrewBday('');
      }
      updateCrewAccess();
      return true;
    } catch (e) {
      return false;
    }
  }

  async function loadCrewLoginProfilesFromCloud() {
    if (!challengeCloudSyncEnabled) return false;
    try {
      const res = await fetch(supabaseRestBase + '/crew_login_profiles?select=crew_code,aliases,active', {
        method: 'GET',
        headers: Object.assign({}, getNoStoreHeaders(), getSupabaseHeaders()),
        cache: 'no-store'
      });
      if (!res.ok) return false;
      const rows = await res.json();
      if (!Array.isArray(rows)) return false;
      const nextAliasMap = Object.assign({}, defaultCrewAliasToCode);
      rows.forEach(function (row) {
        if (!row || row.active === false) return;
        const code = normalizeCrewCode(row.crew_code);
        if (!code || !isAllowedCrewBday(code)) return;
        const aliases = Array.isArray(row.aliases) ? row.aliases : [];
        aliases.forEach(function (alias) {
          const key = normalizeCrewNameKey(alias);
          if (!key) return;
          nextAliasMap[key] = code;
        });
      });
      crewAliasToCode = nextAliasMap;
      if (getCrewBday() && !isAllowedCrewBday(getCrewBday())) {
        setCrewBday('');
      }
      updateCrewAccess();
      return true;
    } catch (e) {
      return false;
    }
  }

  function startChallengeCloudPolling() {
    if (!challengeCloudSyncEnabled) return;
    if (challengeCloudPollTimer) return;
    challengeCloudPollTimer = setInterval(function () {
      if (challengeSyncInFlight) return;
      loadChallengeStateFromCloud();
    }, challengeCloudPollIntervalMs);
  }

  function getChallengeKey(challenge) {
    if (!challenge) return '';
    return challenge.id || ('fallback:' + normalizeTitle(challenge.title));
  }

  function updateTeamBattleUI() {
    const teamAInput = document.getElementById('team-a-name');
    const teamBInput = document.getElementById('team-b-name');
    const scoreboard = document.getElementById('team-scoreboard');
    const assignment = document.getElementById('team-assignment');
    if (teamAInput) teamAInput.value = teamBattle.nameA;
    if (teamBInput) teamBInput.value = teamBattle.nameB;
    if (scoreboard) {
      scoreboard.textContent = teamBattle.nameA + ': ' + teamBattle.scoreA + ' | ' + teamBattle.nameB + ': ' + teamBattle.scoreB;
    }
    if (assignment) {
      assignment.textContent = teamBattle.currentAssignment
        ? 'Assigned: ' + teamBattle.currentAssignment.teamName + ' -> ' + teamBattle.currentAssignment.challengeTitle
        : 'No challenge assigned yet.';
    }
  }

  function saveTeamNames() {
    const teamAInput = document.getElementById('team-a-name');
    const teamBInput = document.getElementById('team-b-name');
    const teamA = teamAInput ? teamAInput.value.trim() : '';
    const teamB = teamBInput ? teamBInput.value.trim() : '';
    if (teamA) teamBattle.nameA = teamA;
    if (teamB) teamBattle.nameB = teamB;
    saveChallengeData();
    updateTeamBattleUI();
  }

  function addTeamPoint(team) {
    if (team === 'A') teamBattle.scoreA += 1;
    if (team === 'B') teamBattle.scoreB += 1;
    saveChallengeData();
    updateTeamBattleUI();
  }

  function resetTeamScores() {
    teamBattle.scoreA = 0;
    teamBattle.scoreB = 0;
    teamBattle.currentAssignment = null;
    saveChallengeData();
    updateTeamBattleUI();
  }

  function assignCurrentChallengeToRandomTeam() {
    if (!currentChallenge) {
      const assignment = document.getElementById('team-assignment');
      if (assignment) assignment.textContent = 'Generate a challenge first.';
      return;
    }
    const pickA = Math.random() < 0.5;
    const teamName = pickA ? teamBattle.nameA : teamBattle.nameB;
    teamBattle.currentAssignment = {
      team: pickA ? 'A' : 'B',
      teamName,
      challengeKey: getChallengeKey(currentChallenge),
      challengeTitle: currentChallenge.title
    };
    saveChallengeData();
    updateTeamBattleUI();
  }

  function markChallengeComplete() {
    const msg = document.getElementById('challenge-complete-msg');
    if (!msg) return;
    if (!currentChallenge) {
      msg.textContent = 'Generate a challenge before marking complete.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (currentChallengeDeadline && Date.now() > currentChallengeDeadline) {
      msg.textContent = 'Time limit expired. Generate a new challenge.';
      msg.style.color = 'var(--error)';
      updateChallengeTimerDisplay();
      return;
    }
    const key = getChallengeKey(currentChallenge);
    if (completedChallengeIds.includes(key)) {
      msg.textContent = 'Already marked completed.';
      msg.style.color = 'var(--error)';
      return;
    }
    completedChallengeIds.push(key);
    if (teamBattle.currentAssignment && teamBattle.currentAssignment.challengeKey === key) {
      if (teamBattle.currentAssignment.team === 'A') teamBattle.scoreA += 1;
      if (teamBattle.currentAssignment.team === 'B') teamBattle.scoreB += 1;
      teamBattle.currentAssignment = null;
      updateTeamBattleUI();
    }
    recordChallengeOutcome('completed', currentChallenge);
    saveChallengeData();
    msg.textContent = 'Challenge marked complete.';
    msg.style.color = 'var(--gold)';
    stopChallengeTimer('Challenge completed. Generate the next one.');
  }

  function spinPunishmentWheel() {
    const punishments = [
      'Buy the next two rounds: one now, one later.',
      'Do 30 bodyweight squats in under 90 seconds.',
      'Finish your current drink, then hold a 60-second plank.',
      'Deliver a 60-second wedding speech with no filler words.',
      'You are the DJ for 3 songs and must dance through all of them.',
      'Swap your top with the nearest lad for the next full venue.',
      'Order chips or snacks for the full table immediately.',
      'Keep one hand on your drink for 15 minutes or restart the timer.',
      'Do a wall sit for 90 seconds while the lads count down.',
      'Take a group selfie with 3 strangers photobombing in frame.',
      'Speak only in dramatic commentator voice for 10 minutes.',
      'Serenade the groom with a full chorus and eye contact.',
      'Give piggyback transport to one lad for 40 metres.',
      'No phone for 30 minutes. Another lad is your camera operator.',
      'Learn and perform an 8-count dance move chosen by the group.',
      'Down a full glass of water, then lead a loud team chant.'
    ];
    const chosen = punishments[Math.floor(Math.random() * punishments.length)];
    const result = document.getElementById('punishment-result');
    const history = document.getElementById('punishment-history');
    const wheel = document.getElementById('punishment-wheel');
    const button = document.querySelector('[data-action="spinPunishmentWheel"]');
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function reveal() {
      punishmentHistory.unshift(chosen);
      punishmentHistory = punishmentHistory.slice(0, 5);
      if (result) {
        result.textContent = chosen;
        result.classList.remove('punishment-reveal');
        // Force reflow so the animation restarts on every spin.
        void result.offsetWidth;
        result.classList.add('punishment-reveal');
      }
      if (history) history.textContent = 'Recent: ' + punishmentHistory.join(' | ');
      if (button) button.disabled = false;
      saveChallengeData();
      if (wheel) wheel.classList.remove('spinning');
    }
    if (wheel && !reducedMotion) {
      if (button) button.disabled = true;
      // Randomised end-rotation for visual variety while keeping duration fixed.
      const extraTurns = 5 + Math.floor(Math.random() * 4);
      const endDeg = extraTurns * 360 + Math.floor(Math.random() * 360);
      wheel.style.setProperty('--spin-end', endDeg + 'deg');
      wheel.classList.remove('spinning');
      void wheel.offsetWidth;
      wheel.classList.add('spinning');
      setTimeout(reveal, 2100);
    } else {
      reveal();
    }
  }

  function generateWrapUp() {
    const wrap = document.getElementById('wrap-output');
    const approvedCount = approvedChallenges.filter(item => !item.hidden).length;
    const completedCount = completedChallengeIds.length;
    const pendingCount = pendingChallenges.length;
    const topChallenge = approvedChallenges
      .filter(item => !item.hidden)
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
    const winningTeam = teamBattle.scoreA === teamBattle.scoreB
      ? 'Draw'
      : (teamBattle.scoreA > teamBattle.scoreB ? teamBattle.nameA : teamBattle.nameB);
    const submitters = {};
    approvedChallenges.forEach(item => {
      submitters[item.suggestedBy] = (submitters[item.suggestedBy] || 0) + 1;
    });
    let topSubmitter = 'N/A';
    let topSubmitterCount = 0;
    Object.entries(submitters).forEach(([name, count]) => {
      if (count > topSubmitterCount) {
        topSubmitter = name;
        topSubmitterCount = count;
      }
    });
    const lines = [
      ['Approved Challenges', String(approvedCount)],
      ['Completed Challenges', String(completedCount)],
      ['Pending Queue', String(pendingCount)],
      ['Top Voted Challenge', topChallenge ? topChallenge.title + ' (' + (topChallenge.votes || 0) + ')' : 'N/A'],
      ['Winning Team', winningTeam + ' (' + teamBattle.scoreA + '-' + teamBattle.scoreB + ')'],
      ['Top Contributor', topSubmitter + ' (' + topSubmitterCount + ')']
    ];
    clearElement(wrap);
    lines.forEach(([label, value]) => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = label + ':';
      p.appendChild(strong);
      p.appendChild(document.createTextNode(' ' + value));
      wrap.appendChild(p);
    });
  }

  function suggestChallenge() {
    const titleInput = document.getElementById('challenge-title');
    const notesInput = document.getElementById('challenge-notes');
    const typeInput = document.getElementById('challenge-type');
    const difficultyInput = document.getElementById('challenge-difficulty');
    const msg = document.getElementById('challenge-msg');
    const crew = getCurrentCrewKey();
    if (!crew) {
      msg.textContent = 'Log in with your crew access code to submit challenges.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (crew === groomBday) {
      msg.textContent = 'Ross cannot submit suggestions.';
      msg.style.color = 'var(--error)';
      return;
    }
    const title = sanitizeText(titleInput.value, 120);
    const notes = sanitizeText(notesInput.value, 300);
    const type = typeInput.value;
    const difficulty = difficultyInput.value;
    if (title.length < 3) {
      msg.textContent = 'Add a challenge title (at least 3 characters).';
      msg.style.color = 'var(--error)';
      return;
    }
    const normalized = normalizeTitle(title);
    const duplicatePending = pendingChallenges.some(item => normalizeTitle(item.title) === normalized);
    const duplicateApproved = approvedChallenges.some(item => normalizeTitle(item.title) === normalized);
    if (duplicatePending || duplicateApproved) {
      msg.textContent = 'That challenge already exists.';
      msg.style.color = 'var(--error)';
      return;
    }
    const todayKey = getTodayKey();
    const submissionKey = crew + ':' + todayKey;
    const submissionsToday = challengeSubmissionLog[submissionKey] || 0;
    challengeSubmissionLog[submissionKey] = submissionsToday + 1;
    const newId = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    approvedChallenges.push({
      id: newId,
      title,
      type,
      difficulty,
      notes,
      suggestedBy: crew,
      createdAt: Date.now(),
      votes: 0,
      reports: 0,
      hidden: false,
      completions: []
    });
    saveChallengeData();
    buzz([14, 30, 14]);
    msg.textContent = 'Challenge submitted and now live for the crew.';
    msg.style.color = 'var(--gold)';
    titleInput.value = '';
    notesInput.value = '';
    refreshPendingChallengeViews();
    displayApprovedChallenges();
    // Scroll to the new card and flash-highlight it.
    setTimeout(function () {
      const card = document.querySelector('[data-challenge-id="' + newId + '"]');
      if (card) {
        try { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) { card.scrollIntoView(); }
        card.classList.add('just-submitted');
        setTimeout(function () { card.classList.remove('just-submitted'); }, 2500);
      }
    }, 50);
  }

  function suggestScheduleItem() {
    const titleInput = document.getElementById('schedule-title');
    const dayInput = document.getElementById('schedule-day');
    const timeInput = document.getElementById('schedule-time');
    const detailsInput = document.getElementById('schedule-details');
    const linkInput = document.getElementById('schedule-link');
    const msg = document.getElementById('schedule-suggestion-msg');
    const crew = getCurrentCrewKey();

    if (!crew) {
      msg.textContent = 'Log in with your crew access code to submit schedule items.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (crew === groomBday) {
      msg.textContent = 'Ross cannot submit suggestions.';
      msg.style.color = 'var(--error)';
      return;
    }

    const title = sanitizeText(titleInput.value, 120);
    const day = sanitizeText(dayInput.value, 50);
    const time = sanitizeText(timeInput.value, 40);
    const details = sanitizeText(detailsInput.value, 320);
    const link = normalizeURL(linkInput.value);

    if (title.length < 3) {
      msg.textContent = 'Add a title (at least 3 characters).';
      msg.style.color = 'var(--error)';
      return;
    }
    if (day.length < 2 || time.length < 2 || details.length < 3) {
      msg.textContent = 'Add day, time, and details before submitting.';
      msg.style.color = 'var(--error)';
      return;
    }

    const normalized = normalizeTitle(title + '|' + day + '|' + time);
    const duplicatePending = pendingScheduleSuggestions.some(item => normalizeTitle(item.title + '|' + item.day + '|' + item.time) === normalized);
    const duplicateApproved = approvedScheduleSuggestions.some(item => normalizeTitle(item.title + '|' + item.day + '|' + item.time) === normalized);
    if (duplicatePending || duplicateApproved) {
      msg.textContent = 'That schedule item already exists.';
      msg.style.color = 'var(--error)';
      return;
    }

    const todayKey = getTodayKey();
    const submissionKey = crew + ':' + todayKey;
    scheduleSubmissionLog[submissionKey] = (scheduleSubmissionLog[submissionKey] || 0) + 1;
    approvedScheduleSuggestions.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      title,
      day,
      time,
      details,
      link,
      suggestedBy: crew,
      createdAt: Date.now()
    });
    saveChallengeData();

    msg.textContent = 'Schedule suggestion submitted and added live.';
    msg.style.color = 'var(--gold)';
    titleInput.value = '';
    dayInput.value = '';
    timeInput.value = '';
    detailsInput.value = '';
    linkInput.value = '';

    displayApprovedScheduleSuggestions();
  }

  function suggestSiteChange() {
    const sectionInput = document.getElementById('site-change-section');
    const titleInput = document.getElementById('site-change-title');
    const detailsInput = document.getElementById('site-change-details');
    const linkInput = document.getElementById('site-change-link');
    const msg = document.getElementById('site-change-msg');
    const crew = getCurrentCrewKey();

    if (!crew) {
      msg.textContent = 'Log in with your crew access code to submit site changes.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (crew === groomBday) {
      msg.textContent = 'Ross cannot submit suggestions.';
      msg.style.color = 'var(--error)';
      return;
    }

    const sectionName = sanitizeText(sectionInput.value, 80) || 'Any Section';
    const title = sanitizeText(titleInput.value, 120);
    const details = sanitizeText(detailsInput.value, 400);
    const link = normalizeURL(linkInput.value);

    if (title.length < 3 || details.length < 6) {
      msg.textContent = 'Add a clear title and details before submitting.';
      msg.style.color = 'var(--error)';
      return;
    }

    const normalized = normalizeTitle(sectionName + '|' + title + '|' + details);
    const duplicatePending = pendingSiteChangeSuggestions.some(item => normalizeTitle(item.sectionName + '|' + item.title + '|' + item.details) === normalized);
    const duplicateApproved = approvedSiteChangeSuggestions.some(item => normalizeTitle(item.sectionName + '|' + item.title + '|' + item.details) === normalized);
    if (duplicatePending || duplicateApproved) {
      msg.textContent = 'That site change suggestion already exists.';
      msg.style.color = 'var(--error)';
      return;
    }

    const todayKey = getTodayKey();
    const submissionKey = crew + ':' + todayKey;
    siteChangeSubmissionLog[submissionKey] = (siteChangeSubmissionLog[submissionKey] || 0) + 1;
    approvedSiteChangeSuggestions.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      sectionName,
      title,
      details,
      link,
      suggestedBy: crew,
      createdAt: Date.now()
    });
    saveChallengeData();

    msg.textContent = 'Site change submitted and visible to the crew.';
    msg.style.color = 'var(--gold)';
    sectionInput.value = '';
    titleInput.value = '';
    detailsInput.value = '';
    linkInput.value = '';

    displayApprovedSiteChangeSuggestions();
  }

  function displayPendingSiteChangeSuggestions() {
    const container = document.getElementById('pending-site-change-suggestions');
    if (!container) return;
    clearElement(container);

    if (!pendingSiteChangeSuggestions.length) {
      container.innerHTML = '<p style="opacity:.6;">No pending site change suggestions.</p>';
      return;
    }

    pendingSiteChangeSuggestions
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach(item => {
        const div = makeCard();

        const title = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = item.title;
        title.appendChild(strong);
        div.appendChild(title);

        const sectionLine = document.createElement('p');
        sectionLine.className = 'dynamic-card-meta';
        sectionLine.textContent = 'Section: ' + item.sectionName + ' • by ' + item.suggestedBy;
        div.appendChild(sectionLine);

        const details = document.createElement('p');
        details.className = 'dynamic-card-text';
        details.textContent = item.details;
        div.appendChild(details);

        if (item.link) {
          const linkWrap = document.createElement('p');
          const a = document.createElement('a');
          a.href = item.link;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = 'Open link';
          linkWrap.appendChild(a);
          div.appendChild(linkWrap);
        }

        const actions = document.createElement('div');
        actions.className = 'dynamic-card-actions';
        actions.appendChild(makeActionButton(
          'Approve',
          'btn btn-approve btn-sm',
          function () { approveSiteChangeSuggestion(item.id); }
        ));
        actions.appendChild(makeActionButton(
          'Reject',
          'btn btn-danger btn-sm',
          function () { rejectSiteChangeSuggestion(item.id); }
        ));
        div.appendChild(actions);

        container.appendChild(div);
      });
  }

  function approveSiteChangeSuggestion(id) {
    if (!requireAdminSession()) return;
    const index = pendingSiteChangeSuggestions.findIndex(item => item.id === id);
    if (index === -1) return;
    const entry = pendingSiteChangeSuggestions.splice(index, 1)[0];
    approvedSiteChangeSuggestions.push(entry);
    saveChallengeData();
    displayPendingSiteChangeSuggestions();
    displayApprovedSiteChangeSuggestions();
  }

  function rejectSiteChangeSuggestion(id) {
    if (!requireAdminSession()) return;
    if (!confirmModerationAction('Reject this site change suggestion?')) return;
    pendingSiteChangeSuggestions = pendingSiteChangeSuggestions.filter(item => item.id !== id);
    saveChallengeData();
    displayPendingSiteChangeSuggestions();
  }

  function displayApprovedSiteChangeSuggestions() {
    const container = document.getElementById('approved-site-change-suggestions');
    if (!container) return;
    clearElement(container);

    if (!approvedSiteChangeSuggestions.length) {
      container.innerHTML = '<p style="opacity:.6;">No crew site change suggestions yet.</p>';
      return;
    }

    const heading = document.createElement('h3');
    heading.textContent = 'Crew Site Change Suggestions';
    container.appendChild(heading);

    approvedSiteChangeSuggestions
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach(item => {
        const card = makeCard();

        const title = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = item.title;
        title.appendChild(strong);
        card.appendChild(title);

        const sectionLine = document.createElement('p');
        sectionLine.className = 'dynamic-card-meta';
        sectionLine.textContent = 'Section: ' + item.sectionName + ' • by ' + item.suggestedBy;
        card.appendChild(sectionLine);

        const details = document.createElement('p');
        details.className = 'dynamic-card-text';
        details.textContent = item.details;
        card.appendChild(details);

        if (item.link) {
          const linkP = document.createElement('p');
          const a = document.createElement('a');
          a.href = item.link;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = 'View link';
          linkP.appendChild(a);
          card.appendChild(linkP);
        }

        container.appendChild(card);
      });
  }

  function suggestActivity() {
    const titleInput = document.getElementById('activity-suggest-title');
    const detailsInput = document.getElementById('activity-suggest-details');
    const priceInput = document.getElementById('activity-suggest-price');
    const linkInput = document.getElementById('activity-suggest-link');
    const msg = document.getElementById('activity-suggest-msg');
    const crew = getCurrentCrewKey();

    if (!crew) {
      msg.textContent = 'Log in with your crew access code first.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (crew === groomBday) {
      msg.textContent = 'Ross cannot submit suggestions.';
      msg.style.color = 'var(--error)';
      return;
    }

    const title = sanitizeText(titleInput.value, 120);
    const details = sanitizeText(detailsInput.value, 400);
    const price = sanitizeText(priceInput.value, 80);
    const link = normalizeURL(linkInput.value);

    if (title.length < 3 || details.length < 6) {
      msg.textContent = 'Add a title (3+ chars) and details (6+ chars).';
      msg.style.color = 'var(--error)';
      return;
    }

    const normalized = normalizeTitle(title);
    if (pendingActivitySuggestions.some(function (i) { return normalizeTitle(i.title) === normalized; }) ||
        approvedActivitySuggestions.some(function (i) { return normalizeTitle(i.title) === normalized; })) {
      msg.textContent = 'That activity suggestion already exists.';
      msg.style.color = 'var(--error)';
      return;
    }

    const todayKey = getTodayKey();
    var submissionKey = crew + ':' + todayKey;
    activitySubmissionLog[submissionKey] = (activitySubmissionLog[submissionKey] || 0) + 1;
    approvedActivitySuggestions.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      title: title,
      details: details,
      price: price,
      link: link,
      suggestedBy: crew,
      createdAt: Date.now(),
      votes: 0
    });
    saveChallengeData();

    msg.textContent = 'Activity submitted and now open for crew voting.';
    msg.style.color = 'var(--gold)';
    titleInput.value = '';
    detailsInput.value = '';
    priceInput.value = '';
    linkInput.value = '';
    displayApprovedActivitySuggestions();
  }

  function displayPendingActivitySuggestions() {
    var container = document.getElementById('pending-activity-suggestions');
    if (!container) return;
    clearElement(container);

    if (!pendingActivitySuggestions.length) {
      container.innerHTML = '<p style="opacity:.6;">No pending activity suggestions.</p>';
      return;
    }

    pendingActivitySuggestions
      .sort(function (a, b) { return b.createdAt - a.createdAt; })
      .forEach(function (item) {
        var div = makeCard();

        var title = document.createElement('p');
        var strong = document.createElement('strong');
        strong.textContent = item.title;
        title.appendChild(strong);
        div.appendChild(title);

        var meta = document.createElement('p');
        meta.className = 'dynamic-card-meta';
        meta.textContent = (item.price ? item.price + ' • ' : '') + 'by ' + getCrewDisplayName(item.suggestedBy);
        div.appendChild(meta);

        var details = document.createElement('p');
        details.className = 'dynamic-card-text';
        details.textContent = item.details;
        div.appendChild(details);

        if (item.link) {
          var linkWrap = document.createElement('p');
          var a = document.createElement('a');
          a.href = item.link;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = 'Open link';
          linkWrap.appendChild(a);
          div.appendChild(linkWrap);
        }

        var actions = document.createElement('div');
        actions.className = 'dynamic-card-actions';
        actions.appendChild(makeActionButton('Approve', 'btn btn-approve btn-sm', function () { approveActivitySuggestion(item.id); }));
        actions.appendChild(makeActionButton('Reject', 'btn btn-danger btn-sm', function () { rejectActivitySuggestion(item.id); }));
        div.appendChild(actions);

        container.appendChild(div);
      });
  }

  function approveActivitySuggestion(id) {
    if (!requireAdminSession()) return;
    var index = pendingActivitySuggestions.findIndex(function (i) { return i.id === id; });
    if (index === -1) return;
    var entry = pendingActivitySuggestions.splice(index, 1)[0];
    approvedActivitySuggestions.push(entry);
    saveChallengeData();
    displayPendingActivitySuggestions();
    displayApprovedActivitySuggestions();
    showToast('Activity approved!', 2500);
  }

  function rejectActivitySuggestion(id) {
    if (!requireAdminSession()) return;
    if (!confirmModerationAction('Reject this activity suggestion?')) return;
    pendingActivitySuggestions = pendingActivitySuggestions.filter(function (i) { return i.id !== id; });
    saveChallengeData();
    displayPendingActivitySuggestions();
  }

  function voteActivity(id, delta) {
    var crew = getCurrentCrewKey();
    if (!crew) return;
    var item = approvedActivitySuggestions.find(function (i) { return i.id === id; });
    if (!item) return;
    var voteKey = crew + ':' + id;
    var previous = activityVoteLog[voteKey] || 0;
    if (previous === delta) return;
    item.votes = (item.votes || 0) + (delta - previous);
    activityVoteLog[voteKey] = delta;
    saveChallengeData();
    displayApprovedActivitySuggestions();
  }

  function displayApprovedActivitySuggestions() {
    var container = document.getElementById('approved-activity-suggestions');
    if (!container) return;
    clearElement(container);

    if (!approvedActivitySuggestions.length) return;

    var heading = document.createElement('h3');
    heading.textContent = 'Crew-Suggested Activities';
    heading.style.marginBottom = '10px';
    container.appendChild(heading);

    var crew = getCurrentCrewKey();

    approvedActivitySuggestions
      .slice()
      .sort(function (a, b) { return (b.votes || 0) - (a.votes || 0); })
      .forEach(function (item) {
        var card = makeCard();
        card.style.position = 'relative';

        var title = document.createElement('p');
        var strong = document.createElement('strong');
        strong.textContent = item.title;
        title.appendChild(strong);
        card.appendChild(title);

        var meta = document.createElement('p');
        meta.className = 'dynamic-card-meta';
        meta.textContent = (item.price ? item.price + ' • ' : '') + 'Suggested by ' + getCrewDisplayName(item.suggestedBy);
        card.appendChild(meta);

        var details = document.createElement('p');
        details.className = 'dynamic-card-text';
        details.textContent = item.details;
        card.appendChild(details);

        if (item.link) {
          var linkP = document.createElement('p');
          var a = document.createElement('a');
          a.href = item.link;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = 'View link';
          a.style.color = 'var(--gold)';
          linkP.appendChild(a);
          card.appendChild(linkP);
        }

        var voteRow = document.createElement('div');
        voteRow.className = 'dynamic-card-actions';

        var myVote = crew ? (activityVoteLog[crew + ':' + item.id] || 0) : 0;

        var upBtn = makeActionButton(
          myVote === 1 ? '👍 Upvoted' : '👍 Upvote',
          myVote === 1 ? 'btn btn-gold btn-sm' : 'btn btn-outline-gold btn-sm',
          function () { voteActivity(item.id, myVote === 1 ? 0 : 1); }
        );
        voteRow.appendChild(upBtn);

        var downBtn = makeActionButton(
          myVote === -1 ? '👎 Downvoted' : '👎 Downvote',
          myVote === -1 ? 'btn btn-danger btn-sm' : 'btn btn-outline-light btn-sm',
          function () { voteActivity(item.id, myVote === -1 ? 0 : -1); }
        );
        voteRow.appendChild(downBtn);

        var scoreSpan = document.createElement('span');
        scoreSpan.className = 'dynamic-card-score';
        scoreSpan.textContent = (item.votes > 0 ? '+' : '') + (item.votes || 0) + ' votes';
        scoreSpan.style.marginLeft = '8px';
        voteRow.appendChild(scoreSpan);

        card.appendChild(voteRow);
        container.appendChild(card);
      });
  }

  function displayPendingScheduleSuggestions() {
    const container = document.getElementById('pending-schedule-suggestions');
    if (!container) return;
    clearElement(container);

    if (!pendingScheduleSuggestions.length) {
      container.innerHTML = '<p style="opacity:.6;">No pending schedule suggestions.</p>';
      return;
    }

    pendingScheduleSuggestions
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach(item => {
        const div = makeCard();

        const title = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = item.title;
        title.appendChild(strong);
        div.appendChild(title);

        const meta = document.createElement('p');
        meta.className = 'dynamic-card-meta';
        meta.textContent = item.day + ' • ' + item.time + ' • by ' + item.suggestedBy;
        div.appendChild(meta);

        const details = document.createElement('p');
        details.className = 'dynamic-card-text';
        details.textContent = item.details;
        div.appendChild(details);

        if (item.link) {
          const linkWrap = document.createElement('p');
          const a = document.createElement('a');
          a.href = item.link;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = 'Open link';
          linkWrap.appendChild(a);
          div.appendChild(linkWrap);
        }

        const actions = document.createElement('div');
        actions.className = 'dynamic-card-actions';
        actions.appendChild(makeActionButton(
          'Approve',
          'btn btn-approve btn-sm',
          function () { approveScheduleSuggestion(item.id); }
        ));
        actions.appendChild(makeActionButton(
          'Reject',
          'btn btn-danger btn-sm',
          function () { rejectScheduleSuggestion(item.id); }
        ));
        div.appendChild(actions);

        container.appendChild(div);
      });
  }

  function approveScheduleSuggestion(id) {
    if (!requireAdminSession()) return;
    const index = pendingScheduleSuggestions.findIndex(item => item.id === id);
    if (index === -1) return;
    const entry = pendingScheduleSuggestions.splice(index, 1)[0];
    approvedScheduleSuggestions.push(entry);
    saveChallengeData();
    displayPendingScheduleSuggestions();
    displayApprovedScheduleSuggestions();
  }

  function rejectScheduleSuggestion(id) {
    if (!requireAdminSession()) return;
    if (!confirmModerationAction('Reject this schedule suggestion?')) return;
    pendingScheduleSuggestions = pendingScheduleSuggestions.filter(item => item.id !== id);
    saveChallengeData();
    displayPendingScheduleSuggestions();
  }

  function displayApprovedScheduleSuggestions() {
    const container = document.getElementById('approved-schedule-items');
    if (!container) return;
    clearElement(container);

    if (!approvedScheduleSuggestions.length) return;

    approvedScheduleSuggestions
      .sort((a, b) => a.createdAt - b.createdAt)
      .forEach(item => {
        const row = document.createElement('div');
        row.className = 'schedule-item fade-in visible';

        const timeCol = document.createElement('div');
        timeCol.className = 'schedule-time';
        timeCol.textContent = item.day + '\n' + item.time;
        timeCol.style.whiteSpace = 'pre-line';

        const infoCol = document.createElement('div');
        infoCol.className = 'schedule-info';

        const h3 = document.createElement('h3');
        h3.textContent = item.title;
        infoCol.appendChild(h3);

        const p = document.createElement('p');
        p.textContent = item.details;
        infoCol.appendChild(p);

        if (item.link) {
          const linkP = document.createElement('p');
          const a = document.createElement('a');
          a.href = item.link;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = 'View link';
          linkP.appendChild(a);
          infoCol.appendChild(linkP);
        }

        row.appendChild(timeCol);
        row.appendChild(infoCol);
        container.appendChild(row);
      });
  }

  function accessApproval() {
    if (!isAdminSessionActive()) {
      showToast('Admin access is for Joshua only.', 3000);
      return;
    }
    const approvalPanel = document.getElementById('approval-panel');
    if (approvalPanel) approvalPanel.style.display = 'block';
    displayJoshuaApprovalList();
    displayPendingChallenges();
    displayPendingScheduleSuggestions();
    displayPendingSiteChangeSuggestions();
  }

  function isAdminSessionActive() {
    const crew = getCrewBday();
    return crew === bmBday && isAllowedCrewBday(crew);
  }

  function requireAdminSession() {
    if (isAdminSessionActive()) return true;
    showToast('Admin access is for Joshua only.', 3000);
    return false;
  }

  function confirmModerationAction(message) {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') return true;
    return window.confirm(message);
  }

  function displayJoshuaApprovalList() {
    if (!isAdminSessionActive()) return;
    const container = document.getElementById('joshua-approval-list');
    if (!container) return;
    clearElement(container);

    const rows = [
      { label: 'Joshua (Best Man Admin)', code: bmBday, note: 'Full admin access', removable: false },
      { label: 'Ross (Groom)', code: groomBday, note: 'Login allowed, schedule hidden', removable: false }
    ];

    Array.from(allowedCrewBdays)
      .filter(code => code !== bmBday)
      .sort()
      .forEach(code => {
        var name = getCrewDisplayName(code);
        var label = (name && name !== 'Crew') ? name : 'Crew Member';
        rows.push({ label: label, code: code, note: 'Crew access', removable: true });
      });

    rows.forEach(item => {
      const row = makeCard();
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';

      const text = document.createElement('span');
      text.textContent = item.label + ': ' + item.code + ' - ' + item.note;
      row.appendChild(text);

      if (item.removable) {
        row.appendChild(makeActionButton(
          'Remove',
          'btn btn-danger btn-sm',
          function () { removeCrewCodeByJoshua(item.code); }
        ));
      }

      row.appendChild(makeActionButton(
        'Edit Name',
        'btn btn-outline-gold btn-sm',
        function () { primeCrewNameEditor(item.code); }
      ));

      container.appendChild(row);
    });
  }

  function primeCrewNameEditor(code) {
    if (!requireAdminSession()) return;
    const codeInput = document.getElementById('approval-name-code');
    const nameInput = document.getElementById('approval-name-value');
    const msg = document.getElementById('approval-name-msg');
    if (!codeInput || !nameInput) return;
    const normalized = normalizeCrewCode(code);
    if (!normalized) return;
    codeInput.value = normalized;
    nameInput.value = getCrewDisplayName(normalized);
    if (msg) {
      msg.textContent = 'Editing name for ' + normalized + '.';
      msg.style.color = 'var(--gold)';
    }
  }

  function saveCrewNameByJoshua() {
    if (!requireAdminSession()) return;
    const codeInput = document.getElementById('approval-name-code');
    const nameInput = document.getElementById('approval-name-value');
    const msg = document.getElementById('approval-name-msg');
    if (!codeInput || !nameInput || !msg) return;

    const normalizedCode = normalizeCrewCode(codeInput.value);
    const normalizedName = normalizeCrewDisplayNameByCode(codeInput.value, nameInput.value);

    if (!normalizedCode) {
      msg.textContent = 'Enter a valid crew code first.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (!normalizedName || normalizedName.length < 2) {
      msg.textContent = 'Enter a display name with at least 2 characters.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (normalizedCode !== groomBday && !allowedCrewBdays.has(normalizedCode)) {
      msg.textContent = 'Code must exist in the crew access list first.';
      msg.style.color = 'var(--error)';
      return;
    }

    crewNameByBday[normalizedCode] = normalizedName;
    saveCrewNameOverrides();
    updateLadsPersonalization();
    displayJoshuaApprovalList();
    displayPendingChallenges();
    displayPendingScheduleSuggestions();
    displayPendingSiteChangeSuggestions();
    displayPendingActivitySuggestions();
    displayPublicPendingChallenges(!!getCrewBday());
    displayApprovedChallenges();
    displayApprovedScheduleSuggestions();
    displayApprovedSiteChangeSuggestions();
    displayApprovedActivitySuggestions();

    msg.textContent = 'Saved name for ' + normalizedCode + ': ' + normalizedName;
    msg.style.color = 'var(--gold)';
  }

  function addCrewCodeByJoshua() {
    if (!requireAdminSession()) return;
    const input = document.getElementById('approval-new-code');
    const msg = document.getElementById('approval-code-msg');
    if (!input || !msg) return;

    const normalized = normalizeCrewCode(input.value);
    if (!normalized) {
      msg.textContent = 'Enter 6 digits or DDMMYYYY.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (normalized === bmBday || normalized === groomBday) {
      msg.textContent = 'That code is reserved.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (allowedCrewBdays.has(normalized)) {
      msg.textContent = 'Code already exists.';
      msg.style.color = 'var(--error)';
      return;
    }

    allowedCrewBdays.add(normalized);
    saveAllowedCrewCodes();
    input.value = '';
    msg.textContent = 'Crew code added.';
    msg.style.color = 'var(--gold)';
    displayJoshuaApprovalList();
  }

  function removeCrewCodeByJoshua(code) {
    const msg = document.getElementById('approval-code-msg');
    if (!requireAdminSession()) return;
    if (!allowedCrewBdays.has(code)) return;
    allowedCrewBdays.delete(code);
    saveAllowedCrewCodes();
    if (msg) {
      msg.textContent = 'Crew code removed.';
      msg.style.color = 'var(--gold)';
    }
    displayJoshuaApprovalList();
    updateCrewAccess();
  }

  function resetChallengeScoresByJoshua() {
    if (!requireAdminSession()) return;
    if (!confirmModerationAction(
      'Reset all challenge scores to 0?\n\nThis deletes every submitted challenge, clears completion marks, and wipes challenge votes. Activities, schedule, expenses, and team battle are untouched.'
    )) return;

    pendingChallenges = [];
    approvedChallenges = [];
    challengeVoteLog = {};
    challengeReportLog = {};
    challengeSubmissionLog = {};
    completedChallengeIds = [];

    saveChallengeData();
    queueChallengeStateSync(true);

    displayPendingChallenges();
    displayApprovedChallenges();
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
    if (typeof renderCrewActivityFeed === 'function') renderCrewActivityFeed();
    if (typeof updateActivityBadge === 'function') updateActivityBadge();

    const msg = document.getElementById('approval-code-msg');
    if (msg) {
      msg.textContent = 'Challenge scores reset to 0.';
      msg.style.color = 'var(--gold)';
    }
    showToast('Challenge scores reset.', 2600);
    buzz([40, 30, 40]);
  }

  function updateLadsPersonalization() {
    const titleEl = document.getElementById('lads-title');
    const subtitleEl = document.getElementById('lads-subtitle');
    const customizer = document.getElementById('lads-customizer');
    const titleInput = document.getElementById('lads-custom-title');
    const subtitleInput = document.getElementById('lads-custom-subtitle');
    const roleInput = document.getElementById('lads-custom-role');
    const customizerMsg = document.getElementById('lads-customizer-msg');
    const cards = Array.from(document.querySelectorAll('.lad-card[data-member]'));
    const activeCode = getCrewBday();
    const activeMemberId = crewMemberIdByBday[activeCode] || '';

    cards.forEach(function (card) {
      card.classList.remove('current-user');
      const roleEl = card.querySelector('.lad-role');
      const defaultRole = card.getAttribute('data-default-role') || '';
      if (roleEl && defaultRole) roleEl.textContent = defaultRole;
    });

    if (!activeCode) {
      if (titleEl) titleEl.textContent = 'The Lads';
      if (subtitleEl) subtitleEl.textContent = 'Crew roll call is locked until login.';
      if (customizer) customizer.style.display = 'none';
      if (customizerMsg) {
        customizerMsg.textContent = '';
        customizerMsg.removeAttribute('data-code');
      }
      return;
    }

    const profile = getCrewPersonalization(activeCode);

    if (titleEl) titleEl.textContent = profile.title;
    if (subtitleEl) subtitleEl.textContent = profile.subtitle;
    if (customizer) customizer.style.display = 'block';
    if (titleInput && document.activeElement !== titleInput) titleInput.value = profile.title;
    if (subtitleInput && document.activeElement !== subtitleInput) subtitleInput.value = profile.subtitle;
    if (roleInput && document.activeElement !== roleInput) roleInput.value = profile.role;
    if (customizerMsg && customizerMsg.getAttribute('data-code') !== activeCode) {
      customizerMsg.textContent = '';
      customizerMsg.removeAttribute('data-code');
    }

    const activeCard = activeMemberId ? document.querySelector('.lad-card[data-member="' + activeMemberId + '"]') : null;
    if (!activeCard) return;

    activeCard.classList.add('current-user');
    const roleEl = activeCard.querySelector('.lad-role');
    if (roleEl && profile.role) roleEl.textContent = profile.role;
  }

  function saveMyCrewPersonalization() {
    const activeCode = getCrewBday();
    if (!activeCode) return;
    const titleInput = document.getElementById('lads-custom-title');
    const subtitleInput = document.getElementById('lads-custom-subtitle');
    const roleInput = document.getElementById('lads-custom-role');
    const msg = document.getElementById('lads-customizer-msg');
    const base = getBaseCrewPersonalization(activeCode);

    const title = sanitizeText(titleInput ? titleInput.value : '', 90) || base.title;
    const subtitle = sanitizeText(subtitleInput ? subtitleInput.value : '', 180) || base.subtitle;
    const role = sanitizeText(roleInput ? roleInput.value : '', 40) || base.role;

    crewPersonalizationOverrides[activeCode] = {
      title: title,
      subtitle: subtitle,
      role: role
    };
    saveCrewPersonalizationOverrides();
    updateLadsPersonalization();
    if (msg) {
      msg.textContent = 'Saved. This profile will load every time you log in.';
      msg.style.color = 'var(--gold)';
      msg.setAttribute('data-code', activeCode);
    }
  }

  function resetMyCrewPersonalization() {
    const activeCode = getCrewBday();
    if (!activeCode) return;
    const msg = document.getElementById('lads-customizer-msg');
    if (Object.prototype.hasOwnProperty.call(crewPersonalizationOverrides, activeCode)) {
      delete crewPersonalizationOverrides[activeCode];
      saveCrewPersonalizationOverrides();
    }
    updateLadsPersonalization();
    if (msg) {
      msg.textContent = 'Reset to default profile for this crew member.';
      msg.style.color = 'var(--gold)';
      msg.setAttribute('data-code', activeCode);
    }
  }

  var groomCountdownInterval = null;
  function startGroomCountdown(unlockTime) {
    if (groomCountdownInterval) clearInterval(groomCountdownInterval);
    function update() {
      var now = Date.now();
      var diff = unlockTime - now;
      if (diff <= 0) {
        clearInterval(groomCountdownInterval);
        groomCountdownInterval = null;
        var dEl = document.getElementById('groom-days');
        var hEl = document.getElementById('groom-hours');
        var mEl = document.getElementById('groom-mins');
        var sEl = document.getElementById('groom-secs');
        if (dEl) dEl.textContent = '0';
        if (hEl) hEl.textContent = '0';
        if (mEl) mEl.textContent = '0';
        if (sEl) sEl.textContent = '0';
        updateCrewAccess();
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      var dEl = document.getElementById('groom-days');
      var hEl = document.getElementById('groom-hours');
      var mEl = document.getElementById('groom-mins');
      var sEl = document.getElementById('groom-secs');
      if (dEl) dEl.textContent = d;
      if (hEl) hEl.textContent = h;
      if (mEl) mEl.textContent = m;
      if (sEl) sEl.textContent = s;
    }
    update();
    groomCountdownInterval = setInterval(update, 1000);
  }

  function updateCrewAccess() {
    let crewBday = getCrewBday();
    const suggestionSection = document.getElementById('suggestion-section');
    const bestmanSection = document.getElementById('bestman-approval-section');
    const scheduleSection = document.getElementById('trip-schedule-section');
    const itinerarySection = document.getElementById('itinerary-section');
    const secretOptional = document.getElementById('crew-only-optional');
    const loginOverlay = document.getElementById('login-overlay');
    const logoutButton = document.getElementById('crew-logout-btn');
    if (!isAllowedCrewBday(crewBday)) {
      setCrewBday('');
      crewBday = '';
    }
    const loggedIn = crewBday && crewBday !== '';
    const isGroom = crewBday === groomBday;
    const isAdmin = isAdminSessionActive();
    const groomUnlockDate = new Date('2026-05-03T09:50:00').getTime();
    const groomUnlocked = isGroom && Date.now() >= groomUnlockDate;
    const canViewSchedule = !!loggedIn && (isAdmin || !isGroom || groomUnlocked);
    const groomTeaseSection = document.getElementById('groom-schedule-tease');
    if (suggestionSection) suggestionSection.style.display = (loggedIn && !isGroom) ? 'block' : 'none';
    if (bestmanSection) bestmanSection.style.display = isAdmin ? 'block' : 'none';
    if (scheduleSection) scheduleSection.style.display = canViewSchedule ? 'block' : 'none';
    if (itinerarySection) itinerarySection.style.display = canViewSchedule ? 'block' : 'none';
    if (secretOptional) secretOptional.style.display = canViewSchedule ? 'block' : 'none';
    if (groomTeaseSection) groomTeaseSection.style.display = (loggedIn && isGroom && !groomUnlocked) ? 'block' : 'none';
    if (loggedIn && isGroom && !groomUnlocked) startGroomCountdown(groomUnlockDate);
    if (loginOverlay) loginOverlay.style.display = loggedIn ? 'none' : 'flex';
    if (logoutButton) logoutButton.style.display = loggedIn ? 'block' : 'none';
    document.body.classList.toggle('overlay-active', !loggedIn);
    updateLadsPersonalization();
    const approvalPanel = document.getElementById('approval-panel');
    if (isAdmin) {
      if (approvalPanel) approvalPanel.style.display = 'block';
      displayJoshuaApprovalList();
      displayPendingChallenges();
      displayPendingScheduleSuggestions();
      displayPendingSiteChangeSuggestions();
      displayPendingActivitySuggestions();
      document.body.classList.add('admin-mode');
      setTimeout(function () {
        var adminSec = document.getElementById('bestman-approval-section');
        if (adminSec) adminSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    } else {
      if (approvalPanel) approvalPanel.style.display = 'none';
      document.body.classList.remove('admin-mode');
    }
    displayPublicPendingChallenges(loggedIn);
    if (loggedIn) displayApprovedChallenges();
    displayApprovedScheduleSuggestions();
    displayApprovedSiteChangeSuggestions();
    displayApprovedActivitySuggestions();
  }

  function shakeLoginBox() {
    var box = document.querySelector('#login-overlay .login-box');
    if (!box) return;
    box.classList.add('login-shake');
    setTimeout(function () { box.classList.remove('login-shake'); }, 500);
  }

  function toggleCodeVisibility() {
    var input = document.getElementById('crew-login-bday');
    var btn = document.getElementById('toggle-code-vis');
    if (!input || !btn) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = '&#x1F441;&#x200D;&#x1F5E8;';
      btn.setAttribute('aria-label', 'Hide code');
    } else {
      input.type = 'password';
      btn.innerHTML = '&#x1F441;';
      btn.setAttribute('aria-label', 'Show code');
    }
  }

  const LOGIN_LOCK_KEY = 'ross_login_lock_v1';
  let loginFailCount = 0;
  let loginLockedUntil = 0;
  try {
    const stored = localStorage.getItem(LOGIN_LOCK_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.until === 'number' && parsed.until > Date.now()) {
        loginLockedUntil = parsed.until;
        loginFailCount = parsed.fails || 0;
      } else {
        localStorage.removeItem(LOGIN_LOCK_KEY);
      }
    }
  } catch (_) { /* ignore */ }

  function persistLoginLock() {
    try {
      if (loginLockedUntil > Date.now()) {
        localStorage.setItem(LOGIN_LOCK_KEY, JSON.stringify({ until: loginLockedUntil, fails: loginFailCount }));
      } else {
        localStorage.removeItem(LOGIN_LOCK_KEY);
      }
    } catch (_) { /* ignore quota/private-mode errors */ }
  }

  function registerLoginFailure() {
    loginFailCount += 1;
    if (loginFailCount < 3) return 0;
    const cooldownMs = Math.min(30000, Math.pow(2, loginFailCount - 3) * 1000);
    loginLockedUntil = Date.now() + cooldownMs;
    persistLoginLock();
    return cooldownMs;
  }

  function clearLoginFailures() {
    loginFailCount = 0;
    loginLockedUntil = 0;
    persistLoginLock();
  }

  function crewLogin() {
    const bdayField = document.getElementById('crew-login-bday');
    const bday = resolveCrewCredential(bdayField.value);
    const msg = document.getElementById('crew-login-msg');
    if (Date.now() < loginLockedUntil) {
      const waitSec = Math.ceil((loginLockedUntil - Date.now()) / 1000);
      msg.textContent = 'Too many attempts. Try again in ' + waitSec + ' seconds.';
      msg.style.color = 'var(--error)';
      shakeLoginBox();
      return;
    }
    if (!bday) {
      registerLoginFailure();
      msg.textContent = 'Enter a valid crew password (name or DOB code).';
      msg.style.color = 'var(--error)';
      shakeLoginBox();
      return;
    }
    if (!isAllowedCrewBday(bday)) {
      const cooldown = registerLoginFailure();
      msg.textContent = 'Access code not recognized. Ask Joshua to add it.';
      if (cooldown > 0) msg.textContent += ' Cooldown: ' + Math.ceil(cooldown / 1000) + 's.';
      msg.style.color = 'var(--error)';
      shakeLoginBox();
      return;
    }
    clearLoginFailures();
    setCrewBday(bday);
    if (!isAllowedCrewBday(getCrewBday())) {
      setCrewBday('');
      msg.textContent = 'Access code not recognized. Ask Joshua to add it.';
      msg.style.color = 'var(--error)';
      shakeLoginBox();
      return;
    }
    bdayField.value = '';
    var isAdmin = bday === bmBday;
    if (bday === groomBday) {
      msg.textContent = 'Welcome, Ross. Schedule stays hidden for you.';
    } else if (isAdmin) {
      msg.textContent = 'Admin mode activated. Welcome, Joshua.';
    } else {
      msg.textContent = 'Welcome, ' + getCrewDisplayName(bday) + '. Schedule unlocked.';
    }
    msg.style.color = 'var(--gold)';
    updateCrewAccess();
    loadTripDetailsFromCloud();
    showWelcomeGreeting(getCrewDisplayName(bday));
    if (isAdmin) {
      showToast('Admin panel loaded — scroll to Best Man Admin', 4000);
    }
  }

  const crewLoginInput = document.getElementById('crew-login-bday');
  if (crewLoginInput) {
    crewLoginInput.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      crewLogin();
    });
  }

  // Focus trap for the login modal — it has no dismiss affordance, so we keep
  // focus inside until the user successfully logs in.
  (function wireLoginFocusTrap() {
    const overlay = document.getElementById('login-overlay');
    if (!overlay) return;
    function focusable() {
      return Array.from(overlay.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    }
    overlay.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    // Auto-focus the input when the overlay is visible.
    const ensureFocus = function () {
      if (overlay.style.display === 'none') return;
      if (crewLoginInput && document.activeElement !== crewLoginInput) {
        try { crewLoginInput.focus({ preventScroll: true }); } catch (_) { crewLoginInput.focus(); }
      }
    };
    setTimeout(ensureFocus, 50);
    const mo = new MutationObserver(ensureFocus);
    mo.observe(overlay, { attributes: true, attributeFilter: ['style'] });
  })();

  function crewLogout() {
    const activeCode = getCrewBday();
    if (activeCode) {
      Object.keys(challengeVoteLog).forEach(function (key) {
        if (key.indexOf(activeCode + ':') === 0) delete challengeVoteLog[key];
      });
      Object.keys(challengeReportLog).forEach(function (key) {
        if (key.indexOf(activeCode + ':') === 0) delete challengeReportLog[key];
      });
      Object.keys(activityVoteLog).forEach(function (key) {
        if (key.indexOf(activeCode + ':') === 0) delete activityVoteLog[key];
      });
      saveChallengeData();
    }
    setCrewBday('');
    applyTripDetails({});
    const msg = document.getElementById('crew-login-msg');
    if (msg) {
      msg.textContent = 'Crew section locked.';
      msg.style.color = 'var(--error)';
    }
    updateCrewAccess();
  }

  updateCrewAccess();

  function makeCard() {
    const div = document.createElement('div');
    div.className = 'dynamic-card';
    return div;
  }

  function formatRelativeTime(timestamp) {
    const ts = Number(timestamp) || 0;
    if (!ts) return '';
    const diffMs = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    return days + 'd ago';
  }

  function refreshPendingChallengeViews() {
    displayPendingChallenges();
    displayPublicPendingChallenges(!!getCrewBday());
  }

  function displayPendingChallenges() {
    const container = document.getElementById('pending-challenges');
    if (!container) return;
    clearElement(container);
    if (!pendingChallenges.length) {
      container.innerHTML = '<p style="opacity:.6;">No pending challenges.</p>';
      return;
    }
    pendingChallenges
      .slice()
      .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); })
      .forEach(function (item) {
      const div = makeCard();

      const title = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = item.title;
      title.appendChild(strong);
      div.appendChild(title);

      const meta = document.createElement('p');
      meta.className = 'dynamic-card-meta';
      meta.textContent = item.type + ' • ' + item.difficulty + ' • by ' + getCrewDisplayName(item.suggestedBy);
      div.appendChild(meta);

      const notes = document.createElement('p');
      notes.className = 'dynamic-card-text';
      notes.textContent = item.notes || 'No extra notes.';
      div.appendChild(notes);

      const actions = document.createElement('div');
      actions.className = 'dynamic-card-actions';
      actions.appendChild(makeActionButton(
        'Approve',
        'btn btn-approve btn-sm',
        function () { approveChallenge(item.id); }
      ));
      actions.appendChild(makeActionButton(
        'Reject',
        'btn btn-danger btn-sm',
        function () { rejectChallenge(item.id); }
      ));
      div.appendChild(actions);

      container.appendChild(div);
    });
  }

  function displayPublicPendingChallenges(loggedIn) {
    const container = document.getElementById('pending-challenges-public');
    const summary = document.getElementById('pending-challenges-public-summary');
    const updated = document.getElementById('pending-challenges-public-updated');
    const recentChallenges = approvedChallenges
      .filter(function (item) { return !item.hidden && (item.reports || 0) < 3; })
      .slice()
      .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    if (!container) return;
    clearElement(container);
    if (summary) summary.textContent = '';
    if (updated) updated.textContent = '';
    if (!loggedIn) {
      container.innerHTML = '<p style="opacity:.6;">Log in to view the latest challenge suggestions.</p>';
      return;
    }
    if (!recentChallenges.length) {
      if (summary) summary.textContent = '0 live suggestions';
      container.innerHTML = '<p style="opacity:.6;">No live challenges right now.</p>';
      return;
    }
    const sorted = recentChallenges;
    const latest = sorted[0];
    const latestBy = latest ? getCrewDisplayName(latest.suggestedBy) : 'Crew';
    if (summary) {
      summary.textContent = String(sorted.length) + ' live suggestions • latest from ' + latestBy;
    }
    if (updated) {
      updated.textContent = latest && latest.createdAt
        ? 'Last submission: ' + formatRelativeTime(latest.createdAt)
        : 'Last submission: unknown';
    }
    sorted.forEach(function (item) {
        const div = makeCard();

        const title = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = item.title;
        title.appendChild(strong);
        div.appendChild(title);

        const meta = document.createElement('p');
        meta.className = 'dynamic-card-meta';
        meta.textContent = item.type + ' • ' + item.difficulty + ' • suggested by ' + getCrewDisplayName(item.suggestedBy);
        div.appendChild(meta);

        const notes = document.createElement('p');
        notes.className = 'dynamic-card-text';
        notes.textContent = item.notes || 'No extra notes.';
        div.appendChild(notes);

        container.appendChild(div);
      });
  }

  function approveChallenge(id) {
    if (!requireAdminSession()) return;
    const index = pendingChallenges.findIndex(item => item.id === id);
    if (index === -1) return;
    const challenge = pendingChallenges.splice(index, 1)[0];
    approvedChallenges.push(challenge);
    saveChallengeData();
    refreshPendingChallengeViews();
    displayApprovedChallenges();
  }

  function rejectChallenge(id) {
    if (!requireAdminSession()) return;
    if (!confirmModerationAction('Reject this challenge suggestion?')) return;
    pendingChallenges = pendingChallenges.filter(item => item.id !== id);
    saveChallengeData();
    refreshPendingChallengeViews();
  }

  function displayApprovedChallenges() {
    const container = document.getElementById('approved-challenges');
    if (!container) return;
    const currentCrew = getCurrentCrewKey();
    const allVisible = approvedChallenges
      .filter(item => !item.hidden && (item.reports || 0) < 3);
    const search = (challengeFeedFilter.search || '').toLowerCase().trim();
    const wantType = challengeFeedFilter.type || 'all';
    const wantDiff = challengeFeedFilter.difficulty || 'all';
    const filtered = allVisible.filter(function (item) {
      if (wantType !== 'all' && (item.type || '').toLowerCase() !== wantType) return false;
      if (wantDiff !== 'all' && (item.difficulty || '').toLowerCase() !== wantDiff) return false;
      if (search) {
        const hay = ((item.title || '') + ' ' + (item.notes || '') + ' ' + getCrewDisplayName(item.suggestedBy)).toLowerCase();
        if (hay.indexOf(search) === -1) return false;
      }
      return true;
    });
    const sort = challengeFeedFilter.sort || 'top';
    filtered.sort(function (a, b) {
      if (sort === 'new') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sort === 'done') return (b.completions || []).length - (a.completions || []).length
        || (b.votes || 0) - (a.votes || 0);
      // default 'top'
      return (b.votes || 0) - (a.votes || 0) || (b.createdAt || 0) - (a.createdAt || 0);
    });
    container.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = 'Live Crew Challenges';
    container.appendChild(heading);
    // Today-focused mini stats.
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();
    let submittedToday = 0, doneTotal = 0;
    allVisible.forEach(function (c) {
      if ((c.createdAt || 0) >= dayStartMs) submittedToday += 1;
      if (Array.isArray(c.completions)) doneTotal += c.completions.length;
    });
    const stats = document.createElement('div');
    stats.className = 'feed-stats';
    stats.innerHTML = '<span class="feed-stat"><strong>' + allVisible.length + '</strong> live</span>'
      + '<span class="feed-stat"><strong>' + submittedToday + '</strong> today</span>'
      + '<span class="feed-stat"><strong>' + doneTotal + '</strong> completions</span>';
    container.appendChild(stats);
    const summary = document.createElement('p');
    summary.className = 'feed-summary';
    summary.textContent = 'Showing ' + filtered.length + ' of ' + allVisible.length + ' live challenge' + (allVisible.length === 1 ? '' : 's') + '. Tap Refresh to pull the latest from Supabase.';
    container.appendChild(summary);
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.style.opacity = '.6';
      empty.textContent = allVisible.length
        ? 'No challenges match that filter. Try a different search or clear filters.'
        : 'No live challenges yet. Submit one above to get started.';
      container.appendChild(empty);
      lastChallengeFeedCount = approvedChallenges.length;
      return;
    }
    filtered.forEach(function (item) {
      const div = makeCard();
      div.classList.add('challenge-card');
      div.setAttribute('data-challenge-id', item.id);

      const titleRow = document.createElement('div');
      titleRow.className = 'challenge-title-row';
      const strong = document.createElement('strong');
      strong.textContent = item.title;
      titleRow.appendChild(strong);
      const diffBadge = document.createElement('span');
      diffBadge.className = 'difficulty-badge difficulty-' + (item.difficulty || 'Easy').toLowerCase();
      diffBadge.textContent = item.difficulty || 'Easy';
      titleRow.appendChild(diffBadge);
      div.appendChild(titleRow);

      const meta = document.createElement('p');
      meta.className = 'dynamic-card-meta';
      const createdAgo = humanTimeAgo(item.createdAt);
      meta.textContent = item.type + ' • by ' + getCrewDisplayName(item.suggestedBy) + (createdAgo ? ' • ' + createdAgo : '');
      div.appendChild(meta);

      const notes = document.createElement('p');
      notes.className = 'dynamic-card-text';
      notes.textContent = item.notes || 'No extra notes.';
      div.appendChild(notes);

      const completions = Array.isArray(item.completions) ? item.completions : [];
      const score = document.createElement('p');
      score.className = 'dynamic-card-score';
      const doneNames = completions.slice(0, 4).map(getCrewDisplayName).join(', ');
      const doneTail = completions.length > 4 ? ' +' + (completions.length - 4) + ' more' : '';
      score.textContent = 'Score: ' + (item.votes || 0)
        + ' • Completed: ' + completions.length
        + (completions.length ? ' (' + doneNames + doneTail + ')' : '')
        + ' • Reports: ' + (item.reports || 0);
      div.appendChild(score);

      const actions = document.createElement('div');
      actions.className = 'dynamic-card-actions';
      const userVote = currentCrew ? (challengeVoteLog[currentCrew + ':' + item.id] || 0) : 0;
      const upBtn = makeActionButton(
        userVote === 1 ? '👍 Voted' : '👍',
        'btn btn-gold btn-sm' + (userVote === 1 ? ' is-active' : ''),
        function () { voteChallenge(item.id, 1); }
      );
      actions.appendChild(upBtn);
      actions.appendChild(makeActionButton(
        '👎',
        'btn btn-outline-light btn-sm' + (userVote === -1 ? ' is-active' : ''),
        function () { voteChallenge(item.id, -1); }
      ));
      const alreadyDone = currentCrew && completions.indexOf(currentCrew) !== -1;
      actions.appendChild(makeActionButton(
        alreadyDone ? '✅ Done' : '✅ Mark Done',
        'btn btn-outline-gold btn-sm' + (alreadyDone ? ' is-active' : ''),
        function () { completeLiveChallenge(item.id); }
      ));
      actions.appendChild(makeActionButton(
        '📤 Share',
        'btn btn-outline-light btn-sm',
        function () { shareLiveChallenge(item.id); }
      ));
      actions.appendChild(makeActionButton(
        'Report',
        'btn btn-danger btn-sm',
        function () { reportChallenge(item.id); }
      ));
      div.appendChild(actions);

      container.appendChild(div);
    });
    lastChallengeFeedCount = approvedChallenges.length;
  }

  function humanTimeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    if (diff < 0 || diff > 1000 * 60 * 60 * 24 * 365) return '';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    return days + 'd ago';
  }

  function setChallengeFilter(key, value) {
    if (!key) return;
    challengeFeedFilter[key] = (value == null ? '' : String(value));
    displayApprovedChallenges();
  }

  function onChallengeSearchInput(eventOrValue) {
    var input = document.getElementById('live-feed-search');
    var v = input ? input.value : (typeof eventOrValue === 'string' ? eventOrValue : '');
    challengeFeedFilter.search = sanitizeText(v, 80);
    displayApprovedChallenges();
  }

  function onChallengeTypeChange() {
    var el = document.getElementById('live-feed-type');
    if (!el) return;
    setChallengeFilter('type', (el.value || 'all').toLowerCase());
  }
  function onChallengeDifficultyChange() {
    var el = document.getElementById('live-feed-difficulty');
    if (!el) return;
    setChallengeFilter('difficulty', (el.value || 'all').toLowerCase());
  }
  function onChallengeSortChange() {
    var el = document.getElementById('live-feed-sort');
    if (!el) return;
    setChallengeFilter('sort', el.value);
  }
  function forceLiveFeedRefresh() {
    const btn = document.getElementById('live-feed-refresh');
    if (btn) { btn.disabled = true; btn.classList.add('is-loading'); }
    const done = function () {
      if (btn) { btn.disabled = false; btn.classList.remove('is-loading'); }
    };
    if (typeof loadChallengeStateFromCloud === 'function' && challengeCloudSyncEnabled) {
      loadChallengeStateFromCloud()
        .then(function (ok) {
          displayApprovedChallenges();
          if (typeof renderCrewActivityFeed === 'function') renderCrewActivityFeed();
          if (typeof renderLeaderboard === 'function') renderLeaderboard();
          if (typeof showToast === 'function') showToast(ok ? 'Live feed refreshed.' : 'Refreshed from local data.');
        })
        .catch(function () { if (typeof showToast === 'function') showToast('Refresh failed — check connection.'); })
        .finally(done);
    } else {
      displayApprovedChallenges();
      if (typeof renderCrewActivityFeed === 'function') renderCrewActivityFeed();
      if (typeof showToast === 'function') showToast('Refreshed from local data.');
      done();
    }
  }

  function clearChallengeFilters() {
    challengeFeedFilter = { search: '', type: 'all', difficulty: 'all', sort: 'top' };
    var s = document.getElementById('live-feed-search');
    if (s) s.value = '';
    var t = document.getElementById('live-feed-type');
    if (t) t.value = 'all';
    var d = document.getElementById('live-feed-difficulty');
    if (d) d.value = 'all';
    var so = document.getElementById('live-feed-sort');
    if (so) so.value = 'top';
    displayApprovedChallenges();
  }

  function completeLiveChallenge(id) {
    const crew = getCurrentCrewKey();
    if (!crew) { showToast && showToast('Log in with your crew code to mark challenges done.', 'warn'); return; }
    const challenge = approvedChallenges.find(item => item.id === id);
    if (!challenge) return;
    if (!Array.isArray(challenge.completions)) challenge.completions = [];
    const already = challenge.completions.indexOf(crew) !== -1;
    if (already) {
      challenge.completions = challenge.completions.filter(function (c) { return c !== crew; });
      buzz(10);
      showToast && showToast('Completion removed.', 'info');
    } else {
      challenge.completions.push(crew);
      buzz([18, 40, 18]);
      showToast && showToast('Nice one — challenge marked done.', 'success');
    }
    saveChallengeData();
    displayApprovedChallenges();
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
    if (typeof renderCrewActivityFeed === 'function') renderCrewActivityFeed();
    if (typeof updateActivityBadge === 'function') updateActivityBadge();
  }

  function shareLiveChallenge(id) {
    const challenge = approvedChallenges.find(item => item.id === id);
    if (!challenge) return;
    const who = getCrewDisplayName(challenge.suggestedBy) || 'Crew';
    const text = '🦌 Stag Challenge: "' + challenge.title + '" — ' + challenge.type + ' / ' + challenge.difficulty
      + (challenge.notes ? '. ' + challenge.notes : '') + ' (by ' + who + ')';
    const url = (typeof window !== 'undefined' && window.location)
      ? window.location.origin + window.location.pathname + '#suggestion-section'
      : '';
    const payload = url ? (text + ' ' + url) : text;
    buzz(12);
    if (navigator && navigator.share) {
      navigator.share({ title: 'Barcelona Stag Challenge', text: text, url: url || undefined })
        .then(function () { showToast && showToast('Shared!', 'success'); })
        .catch(function () { fallbackCopyChallenge(payload); });
      return;
    }
    fallbackCopyChallenge(payload);
  }

  function fallbackCopyChallenge(text) {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () { showToast && showToast('Challenge copied to clipboard.', 'success'); })
        .catch(function () { showToast && showToast('Unable to share — copy manually: ' + text, 'warn'); });
    } else {
      showToast && showToast('Copy manually: ' + text, 'info');
    }
  }

  function voteChallenge(id, delta) {
    const crew = getCurrentCrewKey();
    if (!crew) return;
    const challenge = approvedChallenges.find(item => item.id === id);
    if (!challenge) return;
    const voteKey = crew + ':' + id;
    const previousVote = challengeVoteLog[voteKey] || 0;
    if (previousVote === delta) return;
    challenge.votes = (challenge.votes || 0) + (delta - previousVote);
    challengeVoteLog[voteKey] = delta;
    saveChallengeData();
    displayApprovedChallenges();
  }

  function reportChallenge(id) {
    const crew = getCurrentCrewKey();
    if (!crew) return;
    const challenge = approvedChallenges.find(item => item.id === id);
    if (!challenge) return;
    const reportKey = crew + ':' + id;
    if (challengeReportLog[reportKey]) return;
    challengeReportLog[reportKey] = true;
    challenge.reports = (challenge.reports || 0) + 1;
    if (challenge.reports >= 3) challenge.hidden = true;
    saveChallengeData();
    displayApprovedChallenges();
  }

  displayApprovedChallenges();

  function addMission() {
    const titleField = document.getElementById('mission-title');
    const pointsField = document.getElementById('mission-points');
    const teamField = document.getElementById('mission-team');
    const msg = document.getElementById('mission-msg');
    if (!titleField || !pointsField || !teamField || !msg) return;
    const title = titleField.value.trim();
    const points = Number(pointsField.value);
    const team = teamField.value;
    if (title.length < 3) {
      msg.textContent = 'Mission title must be at least 3 characters.';
      msg.style.color = 'var(--error)';
      return;
    }
    if (!Number.isFinite(points) || points < 1 || points > 10) {
      msg.textContent = 'Points must be between 1 and 10.';
      msg.style.color = 'var(--error)';
      return;
    }
    missionBoard.unshift({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      title,
      points,
      team,
      completed: false,
      createdAt: Date.now()
    });
    saveChallengeData();
    titleField.value = '';
    pointsField.value = '1';
    msg.textContent = 'Mission added.';
    msg.style.color = 'var(--gold)';
    renderMissionBoard();
  }

  function completeMission(id) {
    const mission = missionBoard.find(item => item.id === id);
    if (!mission || mission.completed) return;
    mission.completed = true;
    if (mission.team === 'A') teamBattle.scoreA += mission.points;
    if (mission.team === 'B') teamBattle.scoreB += mission.points;
    saveChallengeData();
    updateTeamBattleUI();
    renderMissionBoard();
  }

  function resetMissions() {
    missionBoard = [];
    saveChallengeData();
    renderMissionBoard();
  }

  function renderMissionBoard() {
    const board = document.getElementById('mission-board');
    if (!board) return;
    clearElement(board);
    const pending = missionBoard.filter(item => !item.completed);
    const done = missionBoard.filter(item => item.completed);

    const lead = document.createElement('p');
    lead.style.fontWeight = '600';
    lead.style.marginBottom = '10px';
    lead.textContent = 'Leaderboard: ' + teamBattle.nameA + ' ' + teamBattle.scoreA + ' - ' + teamBattle.scoreB + ' ' + teamBattle.nameB;
    board.appendChild(lead);

    const pendingTitle = document.createElement('p');
    pendingTitle.className = 'dynamic-card-text';
    pendingTitle.textContent = 'Pending Missions';
    board.appendChild(pendingTitle);
    if (!pending.length) {
      const none = document.createElement('p');
      none.style.opacity = '.6';
      none.textContent = 'No pending missions.';
      board.appendChild(none);
    }
    pending.forEach(item => {
      const row = makeCard();
      const t = document.createElement('p');
      const titleStrong = document.createElement('strong');
      titleStrong.textContent = item.title;
      t.appendChild(titleStrong);
      t.appendChild(document.createTextNode(' (' + item.points + ' pts)'));
      row.appendChild(t);
      const m = document.createElement('p');
      m.className = 'dynamic-card-meta';
      m.textContent = 'Assigned to ' + (item.team === 'A' ? teamBattle.nameA : teamBattle.nameB);
      row.appendChild(m);
      row.appendChild(makeActionButton(
        'Mark Complete',
        'btn btn-gold btn-sm',
        function () { completeMission(item.id); }
      ));
      board.appendChild(row);
    });

    const doneTitle = document.createElement('p');
    doneTitle.className = 'dynamic-card-text';
    doneTitle.style.marginTop = '10px';
    doneTitle.textContent = 'Completed Missions';
    board.appendChild(doneTitle);
    if (!done.length) {
      const noneDone = document.createElement('p');
      noneDone.style.opacity = '.6';
      noneDone.textContent = 'No completed missions yet.';
      board.appendChild(noneDone);
      return;
    }
    done.slice(0, 8).forEach(item => {
      const row = document.createElement('p');
      row.className = 'dynamic-card-score';
      row.textContent = '✓ ' + item.title + ' (' + item.points + ' pts to ' + (item.team === 'A' ? teamBattle.nameA : teamBattle.nameB) + ')';
      board.appendChild(row);
    });
  }

  function populateExpensePayerOptions() {
    const select = document.getElementById('expense-payer');
    if (!select) return;
    clearElement(select);
    crewMembers.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
  }

  function addExpense() {
    const payer = document.getElementById('expense-payer');
    const amount = document.getElementById('expense-amount');
    const note = document.getElementById('expense-note');
    const msg = document.getElementById('expense-msg');
    if (!payer || !amount || !note || !msg) return;
    const numericAmount = Number(amount.value);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      msg.textContent = 'Enter an amount greater than 0.';
      msg.style.color = 'var(--error)';
      return;
    }
    expenseEntries.unshift({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      payer: payer.value,
      amount: Math.round(numericAmount * 100) / 100,
      note: note.value.trim() || 'General',
      createdAt: Date.now()
    });
    saveChallengeData();
    amount.value = '';
    note.value = '';
    msg.textContent = 'Expense saved.';
    msg.style.color = 'var(--gold)';
    renderExpenseBoard();
  }

  function removeExpense(id) {
    expenseEntries = expenseEntries.filter(item => item.id !== id);
    saveChallengeData();
    renderExpenseBoard();
  }

  function clearExpenses() {
    expenseEntries = [];
    saveChallengeData();
    renderExpenseBoard();
  }

  function renderExpenseBoard() {
    const summary = document.getElementById('expense-summary');
    const list = document.getElementById('expense-list');
    if (!summary || !list) return;
    clearElement(summary);
    clearElement(list);

    const total = expenseEntries.reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
    const perHead = crewMembers.length ? (total / crewMembers.length) : 0;
    const balances = {};
    crewMembers.forEach(function (name) {
      balances[name] = -perHead;
    });
    expenseEntries.forEach(function (item) {
      balances[item.payer] = (balances[item.payer] || 0) + Number(item.amount || 0);
    });

    const headline = document.createElement('p');
    headline.style.fontWeight = '600';
    headline.textContent = 'Total: £' + total.toFixed(2) + ' | Split each: £' + perHead.toFixed(2);
    summary.appendChild(headline);

    crewMembers.forEach(function (name) {
      const val = Number(balances[name] || 0);
      const row = document.createElement('p');
      row.className = 'dynamic-card-text';
      row.textContent = name + ': ' + (val >= 0 ? 'gets back £' : 'owes £') + Math.abs(val).toFixed(2);
      summary.appendChild(row);
    });

    // Suggest minimum-flow settlements: match biggest debtor with biggest creditor.
    const owes = [];
    const owed = [];
    crewMembers.forEach(function (name) {
      const val = Math.round(Number(balances[name] || 0) * 100) / 100;
      if (val < -0.005) owes.push({ name: name, amount: -val });
      else if (val > 0.005) owed.push({ name: name, amount: val });
    });
    owes.sort(function (a, b) { return b.amount - a.amount; });
    owed.sort(function (a, b) { return b.amount - a.amount; });
    const transfers = [];
    let i = 0, j = 0;
    let guard = 0;
    while (i < owes.length && j < owed.length && guard < 100) {
      guard += 1;
      const debtor = owes[i];
      const creditor = owed[j];
      const pay = Math.min(debtor.amount, creditor.amount);
      if (pay > 0.005) {
        transfers.push({ from: debtor.name, to: creditor.name, amount: pay });
      }
      debtor.amount -= pay;
      creditor.amount -= pay;
      if (debtor.amount < 0.005) i += 1;
      if (creditor.amount < 0.005) j += 1;
    }
    if (expenseEntries.length && transfers.length) {
      const settleHeader = document.createElement('p');
      settleHeader.style.fontWeight = '600';
      settleHeader.style.marginTop = '10px';
      settleHeader.textContent = 'Settle up (' + transfers.length + ' transfer' + (transfers.length === 1 ? '' : 's') + ')';
      summary.appendChild(settleHeader);
      transfers.forEach(function (t) {
        const row = document.createElement('p');
        row.className = 'dynamic-card-text';
        row.textContent = t.from + ' → ' + t.to + ': £' + t.amount.toFixed(2);
        summary.appendChild(row);
      });
    } else if (expenseEntries.length) {
      const settled = document.createElement('p');
      settled.style.opacity = '.7';
      settled.style.marginTop = '10px';
      settled.textContent = 'All settled up.';
      summary.appendChild(settled);
    }

    if (!expenseEntries.length) {
      const empty = document.createElement('p');
      empty.style.opacity = '.6';
      empty.style.marginTop = '8px';
      empty.textContent = 'No expenses added yet.';
      list.appendChild(empty);
      return;
    }

    expenseEntries.slice(0, 20).forEach(function (item) {
      const row = makeCard();
      const text = document.createElement('p');
      const payerStrong = document.createElement('strong');
      payerStrong.textContent = item.payer;
      text.appendChild(payerStrong);
      text.appendChild(document.createTextNode(' paid £' + Number(item.amount).toFixed(2) + ' for ' + item.note));
      row.appendChild(text);
      row.appendChild(makeActionButton(
        'Remove',
        'btn btn-danger btn-sm',
        function () { removeExpense(item.id); }
      ));
      list.appendChild(row);
    });
  }

  function selectPollTopic() {
    const select = document.getElementById('poll-topic');
    if (!select) return;
    pollBoard.selected = select.value;
    saveChallengeData();
    renderPollBoard();
  }

  function vote(optionKey) {
    const selectedPoll = pollBoard.polls[pollBoard.selected];
    if (!selectedPoll || !selectedPoll.options[optionKey]) return;
    selectedPoll.options[optionKey].votes += 1;
    saveChallengeData();
    renderPollBoard();
  }

  function renderPollBoard() {
    const select = document.getElementById('poll-topic');
    const question = document.getElementById('poll-question');
    const optionsWrap = document.getElementById('poll-options');
    const results = document.getElementById('results');
    if (!select || !question || !optionsWrap || !results) return;

    clearElement(select);
    Object.keys(pollBoard.polls).forEach(function (key) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ' Poll';
      if (pollBoard.selected === key) option.selected = true;
      select.appendChild(option);
    });

    const selectedPoll = pollBoard.polls[pollBoard.selected] || pollBoard.polls.favorite;
    question.textContent = selectedPoll.question;
    clearElement(optionsWrap);
    clearElement(results);

    Object.keys(selectedPoll.options).forEach(function (key) {
      const opt = selectedPoll.options[key];
      optionsWrap.appendChild(makeActionButton(
        opt.label,
        'btn btn-gold',
        function () { vote(key); }
      ));
    });

    const total = Object.keys(selectedPoll.options).reduce(function (sum, key) {
      return sum + Number(selectedPoll.options[key].votes || 0);
    }, 0);

    Object.keys(selectedPoll.options).forEach(function (key) {
      const opt = selectedPoll.options[key];
      const count = Number(opt.votes || 0);
      const percent = total ? Math.round((count / total) * 100) : 0;

      const row = document.createElement('div');
      row.className = 'poll-row';
      const header = document.createElement('div');
      header.className = 'poll-row-header';

      const label = document.createElement('span');
      label.textContent = opt.label;
      const voteLabel = document.createElement('span');
      voteLabel.textContent = count + ' vote' + (count === 1 ? '' : 's') + ' (' + percent + '%)';
      header.appendChild(label);
      header.appendChild(voteLabel);

      const track = document.createElement('div');
      track.className = 'poll-bar-track';
      const fill = document.createElement('div');
      fill.className = 'poll-bar-fill';
      requestAnimationFrame(function () { fill.style.width = percent + '%'; });
      track.appendChild(fill);

      row.appendChild(header);
      row.appendChild(track);
      results.appendChild(row);
    });
  }

  // Theme Toggle
  function setTheme(mode, persist) {
    const isLight = mode === 'light';
    const button = document.getElementById('theme-toggle');
    document.body.classList.toggle('light-theme', isLight);
    if (button) {
      button.textContent = isLight ? '☀️' : '🌙';
      button.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
      button.setAttribute('title', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    }
    if (!persist) return;
    saveJSON('theme', isLight ? 'light' : 'dark');
  }

  function toggleTheme() {
    const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
    setTheme(nextTheme, true);
  }

  function initTheme() {
    // Honor OS preference on first visit; persisted choice always wins.
    const mq = (typeof window !== 'undefined' && window.matchMedia)
      ? window.matchMedia('(prefers-color-scheme: light)')
      : null;
    let hasStored = false;
    let storedTheme = mq && mq.matches ? 'light' : 'dark';
    if (supportsLocalStorage()) {
      try {
        const rawTheme = localStorage.getItem('theme');
        if (rawTheme === 'light' || rawTheme === 'dark') {
          storedTheme = rawTheme;
          hasStored = true;
        }
      } catch (e) { /* ignore */ }
    }
    setTheme(storedTheme === 'light' ? 'light' : 'dark', false);
    // Live-react to OS theme changes until the user picks explicitly.
    if (mq && !hasStored && typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', function (e) {
        let stillAuto = true;
        try {
          const raw = localStorage.getItem('theme');
          if (raw === 'light' || raw === 'dark') stillAuto = false;
        } catch (_) { /* ignore */ }
        if (stillAuto) setTheme(e.matches ? 'light' : 'dark', false);
      });
    }
  }

  initTheme();

  // Drinking Game
  const drinkingChallenges = [
    "Power Hour opener: everyone takes one sip every minute for 10 minutes.",
    "Take 10 push-ups, then finish with a loud 'VAMOS' before your next sip.",
    "Tell the most chaotic groom story you know. Group scores it 1-10.",
    "If you have ever missed a flight alarm, finish your drink and refill.",
    "Choose a rival lad for a stare-down. Loser takes two sips.",
    "Nominate one player for a mystery penalty sip every 5 minutes for 20 minutes.",
    "Dance battle for 30 seconds. Crowd picks loser for a double sip.",
    "Everyone points at who gets lost first tonight. Most votes takes two sips.",
    "Accent round: speak only Spanish accent English for 5 minutes or drink.",
    "Groom spotlight: everyone drinks while Ross tells one true and one fake story.",
    "Last person to touch their shoe takes a full drink penalty.",
    "Name 5 Barcelona landmarks in 15 seconds. Fail and drink.",
    "No names challenge: first person to say a real name drinks.",
    "Impression duel: best groom impression stays safe, loser drinks.",
    "Phone roulette: show your last emoji-only text or take a drink.",
    "Final whistle: everyone stands, toasts the groom, and takes one full sip together."
  ];
  function getDrinkingChallenge() {
    const random = drinkingChallenges[Math.floor(Math.random() * drinkingChallenges.length)];
    const output = document.getElementById('drinking-challenge');
    if (output) output.textContent = random;
  }

  // Challenge Generator
  const fallbackChallenges = [
    { title: "Lead a one-minute bar chant and get 5 strangers to join in.", type: "Dares", difficulty: "Chaos", notes: "Volume and confidence decide success." },
    { title: "Sing a full chorus chosen by the lads from memory only.", type: "Dares", difficulty: "Medium", notes: "No phone, no lyrics." },
    { title: "Team relay: 25 squats each, no breaks between players.", type: "Team", difficulty: "Chaos", notes: "Clock starts when first rep drops." },
    { title: "Call a contact and deliver a dramatic wedding invitation voice note.", type: "Dares", difficulty: "Medium", notes: "Group approves the performance." },
    { title: "Spicy gauntlet: finish spicy snack, then recite the crew names backward.", type: "Drinking", difficulty: "Chaos", notes: "No water until finished." },
    { title: "Rapid-fire joke round: make three lads laugh in 60 seconds.", type: "Chill", difficulty: "Easy", notes: "Fail means instant retry with accents." },
    { title: "Wardrobe swap: trade one key clothing item for the next round.", type: "Team", difficulty: "Medium", notes: "Commit fully to the bit." },
    { title: "Deliver a best-man style toast with one made-up memory and one real one.", type: "Chill", difficulty: "Easy", notes: "Crew guesses which is fake." },
    { title: "Photo hunt: capture a group selfie with a birthday crew nearby.", type: "Dares", difficulty: "Medium", notes: "Ask politely and keep it friendly." },
    { title: "Carry challenge: piggyback your teammate for 60 metres total.", type: "Team", difficulty: "Chaos", notes: "Switch halfway if needed." },
    { title: "Recreate an iconic film scene in public with full commitment.", type: "Dares", difficulty: "Chaos", notes: "30-second performance minimum." },
    { title: "Order a full round in Spanish with no English fallback.", type: "Chill", difficulty: "Medium", notes: "Accent points are bonus points." },
    { title: "Start a conga line and keep it alive for 45 seconds.", type: "Team", difficulty: "Medium", notes: "Minimum 6 participants." },
    { title: "Freestyle challenge: 8 bars about the groom, no repeated words.", type: "Dares", difficulty: "Chaos", notes: "Beatbox backing from the crew." },
    { title: "Dance battle finals: winner safe, loser completes a forfeit.", type: "Team", difficulty: "Chaos", notes: "Crowd vote decides." },
    { title: "Iron core: hold a plank while each lad gives one travel rule.", type: "Team", difficulty: "Chaos", notes: "Drop early and restart once." }
  ];

  function getFilteredApprovedChallenges(includeShown) {
    const selectedTypeEl = document.getElementById('challenge-filter-type');
    const selectedDifficultyEl = document.getElementById('challenge-filter-difficulty');
    const selectedType = selectedTypeEl ? selectedTypeEl.value : 'all';
    const selectedDifficulty = selectedDifficultyEl ? selectedDifficultyEl.value : 'all';
    let pool = approvedChallenges.filter(item => !item.hidden && (item.reports || 0) < 3);
    if (selectedType !== 'all') pool = pool.filter(item => item.type === selectedType);
    if (selectedDifficulty !== 'all') pool = pool.filter(item => item.difficulty === selectedDifficulty);
    if (!includeShown) pool = pool.filter(item => !shownChallengeIds.includes(item.id));
    return pool;
  }

  function supportsBrowserNotifications() {
    return typeof window !== 'undefined' && typeof Notification !== 'undefined';
  }

  function requestChallengeNotificationPermission() {
    if (!supportsBrowserNotifications()) return;
    if (Notification.permission !== 'default') return;
    if (challengeNotificationPermissionAttempted) return;
    challengeNotificationPermissionAttempted = true;
    Notification.requestPermission().catch(function () {
      // Ignore permission request failures and continue with in-page toasts.
    });
  }

  function notifyChallengeTimer(title, body, tag) {
    if (supportsBrowserNotifications() && Notification.permission === 'granted') {
      try {
        var note = new Notification(title, {
          body: body,
          tag: tag,
          renotify: true,
          silent: false
        });
        note.onclick = function () {
          try {
            window.focus();
          } catch (e) {
            // Focus may fail in some contexts.
          }
          note.close();
        };
        return;
      } catch (e) {
        // Fall through to toast fallback.
      }
    }
    if (typeof showToast === 'function') showToast(body, 3500);
  }

  function getSelectedChallengeLimitMinutes(challenge) {
    const limitSelect = document.getElementById('challenge-time-limit');
    const selected = limitSelect ? String(limitSelect.value || 'auto') : 'auto';
    if (selected !== 'auto') {
      const direct = Number(selected);
      if (Number.isFinite(direct) && direct > 0) return direct;
    }
    const difficulty = sanitizeText(challenge && challenge.difficulty, 24);
    return challengeAutoTimeByDifficulty[difficulty] || 10;
  }

  function formatChallengeTimer(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function setChallengeTimerText(text, className) {
    const el = document.getElementById('challenge-timer');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('challenge-timer-idle', 'challenge-timer-active', 'challenge-timer-warning', 'challenge-timer-expired');
    el.classList.add(className || 'challenge-timer-idle');
  }

  function updateChallengeTimerBar(percent, state) {
    const bar = document.getElementById('challenge-timer-bar');
    const fill = document.getElementById('challenge-timer-bar-fill');
    if (!bar || !fill) return;
    if (state === 'hidden') {
      bar.classList.remove('visible');
      fill.classList.remove('warning', 'expired');
      fill.style.width = '100%';
      return;
    }
    bar.classList.add('visible');
    fill.classList.remove('warning', 'expired');
    if (state === 'warning') fill.classList.add('warning');
    if (state === 'expired') fill.classList.add('expired');
    const clamped = Math.max(0, Math.min(100, percent));
    fill.style.width = clamped + '%';
  }

  let sharedAudioCtx = null;
  function getAudioContext() {
    if (sharedAudioCtx) return sharedAudioCtx;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      sharedAudioCtx = new Ctx();
      return sharedAudioCtx;
    } catch (e) { return null; }
  }

  function primeAudioContext() {
    // Resume AudioContext on first user gesture — required for iOS Safari.
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended' && ctx.resume) {
      try { ctx.resume(); } catch (_) { /* ignore */ }
    }
  }

  (function wireAudioPriming() {
    const handler = function () {
      primeAudioContext();
      document.removeEventListener('pointerdown', handler, true);
      document.removeEventListener('keydown', handler, true);
      document.removeEventListener('touchstart', handler, true);
    };
    document.addEventListener('pointerdown', handler, true);
    document.addEventListener('keydown', handler, true);
    document.addEventListener('touchstart', handler, true);
  })();

  function playChallengeTimerBeep() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended' && ctx.resume) {
        try { ctx.resume(); } catch (_) { /* ignore */ }
      }
      const start = ctx.currentTime;
      [0, 0.25, 0.5].forEach(function (offset) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, start + offset);
        gain.gain.setValueAtTime(0.0001, start + offset);
        gain.gain.exponentialRampToValueAtTime(0.2, start + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start + offset);
        osc.stop(start + offset + 0.23);
      });
    } catch (e) { /* Audio not available, ignore. */ }
    if (navigator.vibrate) {
      try { navigator.vibrate([200, 100, 200]); } catch (e) { /* Ignore vibration errors. */ }
    }
  }

  function stopChallengeTimer(idleText) {
    if (challengeTimerInterval) {
      clearInterval(challengeTimerInterval);
      challengeTimerInterval = null;
    }
    currentChallengeDeadline = 0;
    currentChallengeLimitMinutes = 0;
    challengeTimerWarningSent = false;
    challengeTimerExpiredSent = false;
    setChallengeTimerText(idleText || 'No active challenge timer.', 'challenge-timer-idle');
    updateChallengeTimerBar(100, 'hidden');
  }

  function formatOutcomeLabel(outcome) {
    if (outcome === 'completed') return 'Completed';
    if (outcome === 'skipped') return 'Skipped';
    if (outcome === 'expired') return 'Expired';
    return 'Updated';
  }

  function recordChallengeOutcome(outcome, challenge) {
    if (!challenge || !outcome) return;
    if (currentChallengeOutcome) return;
    currentChallengeOutcome = outcome;

    if (outcome === 'completed') challengeMetrics.completed += 1;
    if (outcome === 'skipped') challengeMetrics.skipped += 1;
    if (outcome === 'expired') challengeMetrics.expired += 1;

    challengeHistory.unshift({
      title: challenge.title,
      outcome: outcome,
      when: Date.now()
    });
    challengeHistory = sanitizeChallengeHistory(challengeHistory);
    saveChallengeData();
    renderChallengeInsights();
  }

  function renderChallengeInsights() {
    challengeMetrics = sanitizeChallengeMetrics(challengeMetrics);
    challengeHistory = sanitizeChallengeHistory(challengeHistory);

    const insights = document.getElementById('challenge-insights');
    const history = document.getElementById('challenge-history');
    if (!insights || !history) return;

    const generated = challengeMetrics.generated || 0;
    const completed = challengeMetrics.completed || 0;
    const skipped = challengeMetrics.skipped || 0;
    const expired = challengeMetrics.expired || 0;
    const resolved = completed + skipped + expired;
    const completionRate = resolved ? Math.round((completed / resolved) * 100) : 0;

    clearElement(insights);
    var line1 = document.createElement('p');
    line1.textContent = 'Generated: ' + generated + ' • Completed: ' + completed + ' • Completion rate: ' + completionRate + '%';
    insights.appendChild(line1);
    var line2 = document.createElement('p');
    line2.textContent = 'Skipped: ' + skipped + ' • Expired: ' + expired;
    insights.appendChild(line2);

    clearElement(history);
    var heading = document.createElement('div');
    heading.className = 'challenge-history-title';
    heading.textContent = 'Recent Outcomes';
    history.appendChild(heading);

    if (!challengeHistory.length) {
      var empty = document.createElement('p');
      empty.style.opacity = '.6';
      empty.textContent = 'No challenge outcomes yet.';
      history.appendChild(empty);
      return;
    }

    challengeHistory.slice(0, 5).forEach(function (entry) {
      var p = document.createElement('p');
      p.textContent = formatOutcomeLabel(entry.outcome) + ': ' + entry.title;
      history.appendChild(p);
    });
  }

  function updateChallengeTimerDisplay() {
    if (!currentChallenge || !currentChallengeDeadline) {
      setChallengeTimerText('No active challenge timer.', 'challenge-timer-idle');
      updateChallengeTimerBar(100, 'hidden');
      return;
    }
    const totalMs = Math.max(1, (currentChallengeLimitMinutes || 0) * 60000);
    const msLeft = currentChallengeDeadline - Date.now();
    if (msLeft <= 0) {
      setChallengeTimerText('Time expired for this challenge.', 'challenge-timer-expired');
      updateChallengeTimerBar(100, 'expired');
      if (!challengeTimerExpiredSent) {
        challengeTimerExpiredSent = true;
        recordChallengeOutcome('expired', currentChallenge);
        notifyChallengeTimer('Challenge timer expired', 'Time is up for: ' + currentChallenge.title, 'challenge-expired');
        playChallengeTimerBeep();
      }
      return;
    }

    if (msLeft <= 60000 && !challengeTimerWarningSent) {
      challengeTimerWarningSent = true;
      notifyChallengeTimer('Challenge timer warning', '1 minute left: ' + currentChallenge.title, 'challenge-warning');
    }

    const formatted = formatChallengeTimer(msLeft);
    const percentLeft = (msLeft / totalMs) * 100;
    if (msLeft <= 60000) {
      setChallengeTimerText('Time left: ' + formatted + ' (final minute)', 'challenge-timer-warning');
      updateChallengeTimerBar(percentLeft, 'warning');
      return;
    }
    setChallengeTimerText('Time left: ' + formatted, 'challenge-timer-active');
    updateChallengeTimerBar(percentLeft, 'active');
  }

  function startChallengeTimer(challenge) {
    if (challengeTimerInterval) {
      clearInterval(challengeTimerInterval);
      challengeTimerInterval = null;
    }
    currentChallengeLimitMinutes = getSelectedChallengeLimitMinutes(challenge);
    currentChallengeDeadline = Date.now() + currentChallengeLimitMinutes * 60000;
    currentChallengeOutcome = '';
    challengeTimerWarningSent = false;
    challengeTimerExpiredSent = false;
    requestChallengeNotificationPermission();
    updateChallengeTimerDisplay();
    challengeTimerInterval = setInterval(updateChallengeTimerDisplay, 1000);
  }

  function renderChallengeResult(challenge) {
    if (currentChallenge && !currentChallengeOutcome && currentChallengeDeadline && Date.now() < currentChallengeDeadline) {
      recordChallengeOutcome('skipped', currentChallenge);
    }
    currentChallenge = challenge;
    challengeMetrics.generated += 1;
    saveChallengeData();
    startChallengeTimer(challenge);
    const randomChallengeEl = document.getElementById('random-challenge');
    const randomMetaEl = document.getElementById('random-challenge-meta');
    if (randomChallengeEl) randomChallengeEl.textContent = challenge.title;
    if (randomMetaEl) {
      randomMetaEl.textContent = challenge.type + ' • ' + challenge.difficulty + ' • ' + currentChallengeLimitMinutes + ' min limit' + (challenge.notes ? ' • ' + challenge.notes : '');
    }
    const msg = document.getElementById('challenge-complete-msg');
    if (msg) msg.textContent = '';
    renderChallengeInsights();
  }

  function getChallengeWeight(challenge) {
    var votes = Number(challenge && challenge.votes || 0);
    var key = getChallengeKey(challenge);
    var completedBoost = completedChallengeIds.includes(key) ? 0.7 : 1.2;
    var voteBoost = Math.max(0.5, 1 + (votes * 0.2));
    var difficultyBoost = challenge && challenge.difficulty === 'Chaos' ? 1.05 : 1;
    return Math.max(0.2, voteBoost * completedBoost * difficultyBoost);
  }

  function pickWeightedChallenge(pool) {
    if (!pool.length) return null;
    var totalWeight = 0;
    var weighted = pool.map(function (item) {
      var weight = getChallengeWeight(item);
      totalWeight += weight;
      return { item: item, weight: weight };
    });
    if (totalWeight <= 0) return pool[Math.floor(Math.random() * pool.length)];
    var pick = Math.random() * totalWeight;
    for (var i = 0; i < weighted.length; i++) {
      pick -= weighted[i].weight;
      if (pick <= 0) return weighted[i].item;
    }
    return weighted[weighted.length - 1].item;
  }

  function getChallenge() {
    let pool = getFilteredApprovedChallenges(false);
    if (!pool.length) {
      shownChallengeIds = [];
      pool = getFilteredApprovedChallenges(true);
    }
    if (!pool.length) {
      const fallback = fallbackChallenges[Math.floor(Math.random() * fallbackChallenges.length)];
      renderChallengeResult(fallback);
      return;
    }
    const random = pickWeightedChallenge(pool);
    shownChallengeIds.push(random.id);
    renderChallengeResult(random);
  }

  function skipChallenge() {
    if (currentChallenge && !currentChallengeOutcome && currentChallengeDeadline && Date.now() < currentChallengeDeadline) {
      recordChallengeOutcome('skipped', currentChallenge);
    }
    getChallenge();
  }

  // Packing Checklist
  const packingItems = [
    "Passport", "Flight tickets", "Hotel key", "Phone charger", "Toothbrush", "Deodorant", "Shirts", "Trousers", "Underwear", "Socks", "Shoes", "Jacket", "Sunglasses", "Hat", "Swimwear", "Towels", "Medications", "Cash/Euros", "Credit cards", "ID", "Good vibes"
  ];
  function initPackingList() {
    const container = document.getElementById('packing-list');
    if (!container) return;
    clearElement(container);
    packingChecked = sanitizePackingState(packingChecked);
    const total = packingItems.length;
    const doneCount = packingItems.filter(item => packingChecked[item]).length;

    const progress = document.createElement('p');
    progress.className = 'packing-progress';
    progress.id = 'packing-progress';
    progress.textContent = doneCount + ' / ' + total + ' packed' + (doneCount === total ? ' — Ready to go!' : '');
    container.appendChild(progress);

    packingItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'packing-item' + (packingChecked[item] ? ' checked' : '');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'pack-' + item.replace(/\s+/g, '-');
      checkbox.checked = packingChecked[item] || false;
      checkbox.onchange = () => {
        packingChecked[item] = checkbox.checked;
        div.classList.toggle('checked', checkbox.checked);
        saveChallengeData();
        const updatedCount = packingItems.filter(i => packingChecked[i]).length;
        const prog = document.getElementById('packing-progress');
        if (prog) prog.textContent = updatedCount + ' / ' + total + ' packed' + (updatedCount === total ? ' — Ready to go!' : '');
      };
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = item;
      div.appendChild(checkbox);
      div.appendChild(label);
      container.appendChild(div);
    });
  }
  initPackingList();
  refreshChallengeUiFromState();
  loadTripDetailsFromCloud();
  loadCrewLoginProfilesFromCloud();
  loadChallengeStateFromCloud().then(function (loaded) {
    if (!loaded) return;
    updateCrewAccess();
  });
  startChallengeCloudPolling();

  window.addEventListener('beforeunload', function () {
    queueChallengeStateSync(true);
  });

  // ── Scroll-to-top button ──
  (function () {
    var scrollBtn = document.getElementById('scroll-top-btn');
    if (!scrollBtn) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        scrollBtn.classList.toggle('visible', window.scrollY > 600);
        ticking = false;
      });
    }, { passive: true });
  })();

  // ── Toast notification system ──
  function showToast(message, duration) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('toast-out');
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
    }, duration || 3000);
  }

  // ── Haptic buzz (mobile-only, no-op on desktop/unsupported) ───────────
  function buzz(pattern) {
    try {
      if (navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch (_) { /* ignore */ }
  }

  // ── Offline / online indicator banner ─────────────────────────────────
  function ensureConnectivityBanner() {
    var bar = document.getElementById('connectivity-banner');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'connectivity-banner';
      bar.className = 'connectivity-banner';
      bar.setAttribute('role', 'status');
      bar.setAttribute('aria-live', 'polite');
      document.body.appendChild(bar);
    }
    return bar;
  }
  function updateConnectivityState() {
    var online = (typeof navigator !== 'undefined') ? navigator.onLine !== false : true;
    var bar = ensureConnectivityBanner();
    if (online) {
      if (bar.classList.contains('is-offline')) {
        bar.textContent = 'Back online — syncing crew state…';
        bar.classList.remove('is-offline');
        bar.classList.add('is-reconnected');
        setTimeout(function () { bar.classList.remove('visible'); bar.classList.remove('is-reconnected'); }, 2200);
        try { if (typeof queueChallengeStateSync === 'function') queueChallengeStateSync(true); } catch (_) {}
      } else {
        bar.classList.remove('visible');
      }
    } else {
      bar.textContent = 'Offline — submissions will sync when you reconnect.';
      bar.classList.add('visible');
      bar.classList.add('is-offline');
    }
  }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', updateConnectivityState);
    window.addEventListener('offline', updateConnectivityState);
    setTimeout(updateConnectivityState, 400);
  }

  // ── Auto-grow textareas ───────────────────────────────────────────────
  function autoGrowTextarea(el) {
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 360) + 'px';
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('input', function (e) {
      if (e.target && e.target.tagName === 'TEXTAREA' && e.target.classList.contains('form-input')) {
        autoGrowTextarea(e.target);
      }
    });
    document.addEventListener('focusin', function (e) {
      if (e.target && e.target.tagName === 'TEXTAREA' && e.target.classList.contains('form-input')) {
        autoGrowTextarea(e.target);
      }
    });
  }

  // ── Scroll to challenge submit form (mobile FAB target) ──────────────
  function scrollToChallengeForm() {
    buzz(15);
    var sec = document.getElementById('suggestion-section');
    var input = document.getElementById('challenge-title');
    if (sec && sec.style.display === 'none') {
      // Not visible (logged out). Show toast.
      if (typeof showToast === 'function') showToast('Log in with your crew code first to submit a challenge.');
      return;
    }
    if (input) {
      try { input.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) { input.scrollIntoView(); }
      setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); } }, 400);
    } else if (sec) {
      try { sec.scrollIntoView({ behavior: 'smooth' }); } catch (_) { sec.scrollIntoView(); }
    }
  }

  // ── PWA install prompt (Android/Chromium) ─────────────────────────────
  var deferredInstallPrompt = null;
  var INSTALL_DISMISSED_KEY = 'stagInstallDismissedAt';
  function isInstallDismissed() {
    try {
      var ts = parseInt(localStorage.getItem(INSTALL_DISMISSED_KEY) || '0', 10);
      if (!ts) return false;
      // Re-show after 14 days.
      return (Date.now() - ts) < (14 * 24 * 60 * 60 * 1000);
    } catch (_) { return false; }
  }
  function setInstallDismissed() {
    try { localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now())); } catch (_) {}
  }
  function showInstallHint() {
    if (document.getElementById('install-hint')) return;
    if (isInstallDismissed()) return;
    var isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
      || window.navigator.standalone === true;
    if (isStandalone) return;
    var hint = document.createElement('div');
    hint.id = 'install-hint';
    hint.className = 'install-hint';
    hint.setAttribute('role', 'dialog');
    hint.setAttribute('aria-label', 'Install the Stag HQ app');
    hint.innerHTML = '<span class="install-hint-icon" aria-hidden="true">\uD83C\uDDEA\uD83C\uDDF8</span>'
      + '<span class="install-hint-text">Add Stag HQ to your home screen for one-tap access.</span>'
      + '<button type="button" class="btn btn-gold btn-sm install-hint-yes">Install</button>'
      + '<button type="button" class="install-hint-close" aria-label="Dismiss">\u2715</button>';
    document.body.appendChild(hint);
    setTimeout(function () { hint.classList.add('visible'); }, 60);
    hint.querySelector('.install-hint-yes').addEventListener('click', function () {
      buzz(12);
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(function (choice) {
          if (choice && choice.outcome === 'accepted') {
            if (typeof showToast === 'function') showToast('Installed — launch Stag HQ from your home screen.');
          }
          setInstallDismissed();
          hideInstallHint();
          deferredInstallPrompt = null;
        }).catch(function () { hideInstallHint(); });
      } else {
        // iOS / no beforeinstallprompt support — give instructions.
        if (typeof showToast === 'function') showToast('On iPhone: tap Share → "Add to Home Screen".');
        setInstallDismissed();
        hideInstallHint();
      }
    });
    hint.querySelector('.install-hint-close').addEventListener('click', function () {
      buzz(8);
      setInstallDismissed();
      hideInstallHint();
    });
  }
  function hideInstallHint() {
    var hint = document.getElementById('install-hint');
    if (!hint) return;
    hint.classList.remove('visible');
    setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 320);
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    setTimeout(showInstallHint, 4000);
  });
  window.addEventListener('appinstalled', function () {
    setInstallDismissed();
    hideInstallHint();
  });
  // Fallback for iOS Safari (no beforeinstallprompt): show after a delay if mobile.
  setTimeout(function () {
    if (deferredInstallPrompt) return; // Android path will fire its own timer.
    var ua = (navigator.userAgent || '').toLowerCase();
    var isIOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    if (isIOS) showInstallHint();
  }, 6000);

  // ── Pull-to-refresh on the live feed ──────────────────────────────────
  (function wirePullToRefresh() {
    var feed, ptrEl, startY = 0, pulling = false, dist = 0;
    var PULL_TRIGGER = 62;
    function getFeed() { return document.getElementById('approved-challenges'); }
    function ensurePtr() {
      if (ptrEl && ptrEl.parentNode) return ptrEl;
      ptrEl = document.createElement('div');
      ptrEl.className = 'ptr-indicator';
      ptrEl.innerHTML = '<span class="ptr-arrow">\u21BB</span> <span class="ptr-text">Pull to refresh</span>';
      return ptrEl;
    }
    function touchstart(e) {
      feed = getFeed();
      if (!feed || !e.touches || !e.touches.length) return;
      // Only trigger when the user is near the top of the page.
      if ((window.scrollY || window.pageYOffset || 0) > 8) return;
      startY = e.touches[0].clientY;
      pulling = true; dist = 0;
    }
    function touchmove(e) {
      if (!pulling || !e.touches || !e.touches.length) return;
      var y = e.touches[0].clientY;
      dist = y - startY;
      if (dist <= 0) return;
      // Guard: if they're scrolling normally after a downward flick, bail.
      if ((window.scrollY || window.pageYOffset || 0) > 8) { pulling = false; return; }
      e.preventDefault && e.preventDefault();
      var ptr = ensurePtr();
      if (!ptr.parentNode && feed && feed.parentNode) feed.parentNode.insertBefore(ptr, feed);
      var clamped = Math.min(dist, 120);
      ptr.style.height = clamped + 'px';
      ptr.classList.toggle('ready', clamped >= PULL_TRIGGER);
      ptr.querySelector('.ptr-text').textContent = clamped >= PULL_TRIGGER ? 'Release to refresh' : 'Pull to refresh';
    }
    function touchend() {
      if (!pulling) return;
      pulling = false;
      var ptr = ptrEl;
      if (dist >= PULL_TRIGGER) {
        buzz(18);
        if (ptr) { ptr.style.height = '40px'; ptr.classList.add('loading'); ptr.querySelector('.ptr-text').textContent = 'Refreshing…'; }
        if (typeof forceLiveFeedRefresh === 'function') forceLiveFeedRefresh();
        setTimeout(function () {
          if (ptr) { ptr.style.height = '0'; ptr.classList.remove('loading'); ptr.classList.remove('ready'); }
          setTimeout(function () { if (ptr && ptr.parentNode) ptr.parentNode.removeChild(ptr); ptrEl = null; }, 350);
        }, 900);
      } else {
        if (ptr) {
          ptr.style.height = '0';
          setTimeout(function () { if (ptr && ptr.parentNode) ptr.parentNode.removeChild(ptr); ptrEl = null; }, 350);
        }
      }
      dist = 0;
    }
    document.addEventListener('touchstart', touchstart, { passive: true });
    document.addEventListener('touchmove', touchmove, { passive: false });
    document.addEventListener('touchend', touchend, { passive: true });
    document.addEventListener('touchcancel', touchend, { passive: true });
  })();

  // ── Activity-feed unread badge ────────────────────────────────────────
  var ACTIVITY_SEEN_KEY = 'stagActivitySeenTs';
  function getLastSeenActivityTs() {
    try { return parseInt(localStorage.getItem(ACTIVITY_SEEN_KEY) || '0', 10) || 0; } catch (_) { return 0; }
  }
  function setLastSeenActivityTs(ts) {
    try { localStorage.setItem(ACTIVITY_SEEN_KEY, String(ts)); } catch (_) {}
  }
  function collectActivityTimestamps() {
    var tss = [];
    approvedChallenges.forEach(function (c) {
      if (!c || c.hidden) return;
      if (c.createdAt) tss.push(c.createdAt);
      if (Array.isArray(c.completions)) {
        c.completions.forEach(function (_, idx) { tss.push((c.createdAt || 0) + ((idx + 1) * 1000)); });
      }
    });
    [approvedActivitySuggestions, approvedScheduleSuggestions, approvedSiteChangeSuggestions].forEach(function (arr) {
      (arr || []).forEach(function (i) { if (i && i.createdAt) tss.push(i.createdAt); });
    });
    return tss;
  }
  function updateActivityBadge() {
    var lastSeen = getLastSeenActivityTs();
    var tss = collectActivityTimestamps();
    var unread = tss.filter(function (t) { return t > lastSeen; }).length;
    var badges = document.querySelectorAll('[data-activity-badge]');
    badges.forEach(function (node) {
      node.setAttribute('data-count', String(unread));
      if (unread > 0) {
        node.classList.add('has-unread');
        node.textContent = unread > 99 ? '99+' : String(unread);
      } else {
        node.classList.remove('has-unread');
        node.textContent = '';
      }
    });
  }
  function markActivitySeen() {
    var tss = collectActivityTimestamps();
    var max = tss.length ? Math.max.apply(null, tss) : Date.now();
    setLastSeenActivityTs(max);
    updateActivityBadge();
  }
  // Clear badge when the activity section scrolls into view.
  if ('IntersectionObserver' in window) {
    var _obsTimer = setTimeout(function () {
      var sec = document.getElementById('activity-feed-section');
      if (!sec) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) markActivitySeen(); });
      }, { threshold: 0.3 });
      io.observe(sec);
    }, 1200);
  }

  // ── Quick challenge presets ───────────────────────────────────────────
  var QUICK_CHALLENGE_PRESETS = {
    'drinking-easy': {
      type: 'Drinking', difficulty: 'Easy',
      titles: ['Cheers in Catalan before every drink', 'Order the next round in Spanish only', 'Match the groom sip-for-sip for this round', 'Take a drink every time someone says "Ross"']
    },
    'drinking-chaos': {
      type: 'Drinking', difficulty: 'Chaos',
      titles: ['Chug-off: last one to finish buys the next round', 'Shots roulette — the lad on your left picks', 'Drink swap with a stranger at the bar', 'Beer + shot combo every bar stop for the next hour']
    },
    'dares-chaos': {
      type: 'Dares', difficulty: 'Chaos',
      titles: ['Convince a stranger you\'re the groom for 2 minutes', 'Serenade the groom in the middle of the bar', 'Get a high-five from every bartender in the next venue', 'Propose a toast in broken Spanish to the whole room']
    },
    'team-medium': {
      type: 'Team', difficulty: 'Medium',
      titles: ['Team photo with a live flamenco dancer', 'Get 3 locals to join our round of cheers', 'Coordinate a 6-man conga line through the next bar', 'Team karaoke — a full verse each before we leave']
    },
    'chill-easy': {
      type: 'Chill', difficulty: 'Easy',
      titles: ['Rate the best tapa of the day', 'Share one embarrassing Ross story', 'Post a group photo to the crew chat', 'Describe the day in exactly 3 emojis']
    }
  };
  function applyQuickPreset(key) {
    var p = QUICK_CHALLENGE_PRESETS[key];
    if (!p) return;
    var titleInput = document.getElementById('challenge-title');
    var typeInput = document.getElementById('challenge-type');
    var diffInput = document.getElementById('challenge-difficulty');
    var notesInput = document.getElementById('challenge-notes');
    if (!titleInput || !typeInput || !diffInput) return;
    var randomTitle = p.titles[Math.floor(Math.random() * p.titles.length)];
    titleInput.value = randomTitle;
    typeInput.value = p.type;
    diffInput.value = p.difficulty;
    if (notesInput && !notesInput.value) notesInput.value = '';
    buzz(12);
    try { titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
    setTimeout(function () { try { titleInput.focus({ preventScroll: true }); } catch (_) { titleInput.focus(); } }, 400);
    if (typeof showToast === 'function') showToast('Preset loaded — tweak and submit.');
  }

  // ── Swipe-left on challenge card to share ─────────────────────────────
  (function wireSwipeToShare() {
    var startX = 0, startY = 0, currentCard = null, tracking = false, suppressed = false;
    function touchstart(e) {
      if (!e.touches || !e.touches.length) return;
      var card = e.target.closest && e.target.closest('.challenge-card');
      if (!card) return;
      // Ignore if the touch began on a button/input.
      if (e.target.closest('button, a, input, textarea, select')) { suppressed = true; return; }
      suppressed = false;
      currentCard = card;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
      currentCard.classList.add('swiping');
    }
    function touchmove(e) {
      if (!tracking || suppressed || !currentCard || !e.touches || !e.touches.length) return;
      var dx = e.touches[0].clientX - startX;
      var dy = Math.abs(e.touches[0].clientY - startY);
      // If vertical scroll dominates, stop tracking.
      if (dy > 18 && Math.abs(dx) < dy) {
        currentCard.style.transform = '';
        currentCard.classList.remove('swiping');
        currentCard.classList.remove('swipe-ready');
        tracking = false;
        return;
      }
      if (dx >= 0) { currentCard.style.transform = ''; currentCard.classList.remove('swipe-ready'); return; }
      var offset = Math.max(dx, -140);
      currentCard.style.transform = 'translateX(' + offset + 'px)';
      currentCard.classList.toggle('swipe-ready', offset <= -80);
    }
    function touchend(e) {
      if (!tracking || suppressed || !currentCard) { tracking = false; suppressed = false; return; }
      var ready = currentCard.classList.contains('swipe-ready');
      currentCard.style.transition = 'transform .22s ease';
      currentCard.style.transform = '';
      currentCard.classList.remove('swipe-ready');
      var id = currentCard.getAttribute('data-challenge-id');
      setTimeout(function () { if (currentCard) currentCard.style.transition = ''; }, 240);
      currentCard.classList.remove('swiping');
      tracking = false;
      var targetCard = currentCard;
      currentCard = null;
      if (ready && id && typeof shareLiveChallenge === 'function') {
        buzz(22);
        shareLiveChallenge(id);
      }
    }
    document.addEventListener('touchstart', touchstart, { passive: true });
    document.addEventListener('touchmove', touchmove, { passive: true });
    document.addEventListener('touchend', touchend, { passive: true });
    document.addEventListener('touchcancel', touchend, { passive: true });
  })();

  // ── Welcome greeting bar ──
  function showWelcomeGreeting(name) {
    var existing = document.querySelector('.welcome-greeting');
    if (existing) existing.parentNode.removeChild(existing);
    var bar = document.createElement('div');
    bar.className = 'welcome-greeting';
    bar.textContent = 'Welcome aboard, ' + (name || 'Crew Member') + '! VAMOS BARCELONA \uD83C\uDDEA\uD83C\uDDF8';
    document.body.appendChild(bar);
    setTimeout(function () {
      bar.classList.add('greeting-out');
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 500);
    }, 3500);
  }

  // ── Confetti burst for RSVP ──
  function celebrateRSVP() {
    showToast('VAMOS! See you at BFS, 4am sharp!', 4000);
    launchConfetti();
  }

  function launchConfetti() {
    // Respect user's reduced-motion preference — skip the animation entirely.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    var canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var pieces = [];
    var colors = ['#D4A843', '#C9382A', '#F4A423', '#F5F0E8', '#FFD700', '#FF6347'];
    for (var i = 0; i < 120; i++) {
      pieces.push({
        x: canvas.width * Math.random(),
        y: canvas.height * Math.random() * 0.4 - canvas.height * 0.1,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }
    var frame = 0;
    var maxFrames = 120;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame > maxFrames) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      pieces.forEach(function (p) {
        p.x += p.vx;
        p.vy += 0.12;
        p.y += p.vy;
        p.rot += p.rv;
        if (frame > maxFrames * 0.6) p.opacity = Math.max(0, p.opacity - 0.03);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ── Animate section titles on scroll ──
  document.querySelectorAll('.section-title').forEach(function (el) {
    if (!el.classList.contains('fade-in')) {
      obs.observe(el);
    }
  });

  // ── Data-action delegation (replaces inline onclick for CSP) ──
  (function wireDataActionDelegation() {
    function scrollToTop() {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
      catch (_) { window.scrollTo(0, 0); }
    }
    // Whitelist of actions callable from data-action attributes.
    const actions = {
      toggleCodeVisibility: typeof toggleCodeVisibility === 'function' ? toggleCodeVisibility : null,
      crewLogin: typeof crewLogin === 'function' ? crewLogin : null,
      crewLogout: typeof crewLogout === 'function' ? crewLogout : null,
      toggleTheme: typeof toggleTheme === 'function' ? toggleTheme : null,
      saveMyCrewPersonalization: typeof saveMyCrewPersonalization === 'function' ? saveMyCrewPersonalization : null,
      resetMyCrewPersonalization: typeof resetMyCrewPersonalization === 'function' ? resetMyCrewPersonalization : null,
      suggestChallenge: typeof suggestChallenge === 'function' ? suggestChallenge : null,
      suggestScheduleItem: typeof suggestScheduleItem === 'function' ? suggestScheduleItem : null,
      suggestSiteChange: typeof suggestSiteChange === 'function' ? suggestSiteChange : null,
      suggestActivity: typeof suggestActivity === 'function' ? suggestActivity : null,
      addCrewCodeByJoshua: typeof addCrewCodeByJoshua === 'function' ? addCrewCodeByJoshua : null,
      resetChallengeScoresByJoshua: typeof resetChallengeScoresByJoshua === 'function' ? resetChallengeScoresByJoshua : null,
      getDrinkingChallenge: typeof getDrinkingChallenge === 'function' ? getDrinkingChallenge : null,
      getChallenge: typeof getChallenge === 'function' ? getChallenge : null,
      skipChallenge: typeof skipChallenge === 'function' ? skipChallenge : null,
      markChallengeComplete: typeof markChallengeComplete === 'function' ? markChallengeComplete : null,
      saveTeamNames: typeof saveTeamNames === 'function' ? saveTeamNames : null,
      addTeamPoint: typeof addTeamPoint === 'function' ? addTeamPoint : null,
      resetTeamScores: typeof resetTeamScores === 'function' ? resetTeamScores : null,
      assignCurrentChallengeToRandomTeam: typeof assignCurrentChallengeToRandomTeam === 'function' ? assignCurrentChallengeToRandomTeam : null,
      addMission: typeof addMission === 'function' ? addMission : null,
      resetMissions: typeof resetMissions === 'function' ? resetMissions : null,
      addExpense: typeof addExpense === 'function' ? addExpense : null,
      clearExpenses: typeof clearExpenses === 'function' ? clearExpenses : null,
      spinPunishmentWheel: typeof spinPunishmentWheel === 'function' ? spinPunishmentWheel : null,
      selectPollTopic: typeof selectPollTopic === 'function' ? selectPollTopic : null,
      generateWrapUp: typeof generateWrapUp === 'function' ? generateWrapUp : null,
      celebrateRSVP: typeof celebrateRSVP === 'function' ? celebrateRSVP : null,
      scrollToTop: scrollToTop,
      shareStagProgress: typeof shareStagProgress === 'function' ? shareStagProgress : null,
      downloadStagIcs: typeof downloadStagIcs === 'function' ? downloadStagIcs : null,
      copyTripCode: typeof copyTripCode === 'function' ? copyTripCode : null,
      copyHotelAddress: typeof copyHotelAddress === 'function' ? copyHotelAddress : null,
      openHotelMaps: typeof openHotelMaps === 'function' ? openHotelMaps : null,
      shareStagSite: typeof shareStagSite === 'function' ? shareStagSite : null,
      refreshWeather: typeof refreshWeather === 'function' ? refreshWeather : null,
      shareMyLocation: typeof shareMyLocation === 'function' ? shareMyLocation : null,
      clearMyLocation: typeof clearMyLocation === 'function' ? clearMyLocation : null,
      toggleNightlifeMap: typeof toggleNightlifeMap === 'function' ? toggleNightlifeMap : null,
      shareLiveChallenge: typeof shareLiveChallenge === 'function' ? shareLiveChallenge : null,
      completeLiveChallenge: typeof completeLiveChallenge === 'function' ? completeLiveChallenge : null,
      clearChallengeFilters: typeof clearChallengeFilters === 'function' ? clearChallengeFilters : null,
      onChallengeSearchInput: typeof onChallengeSearchInput === 'function' ? onChallengeSearchInput : null,
      onChallengeTypeChange: typeof onChallengeTypeChange === 'function' ? onChallengeTypeChange : null,
      onChallengeDifficultyChange: typeof onChallengeDifficultyChange === 'function' ? onChallengeDifficultyChange : null,
      onChallengeSortChange: typeof onChallengeSortChange === 'function' ? onChallengeSortChange : null,
      forceLiveFeedRefresh: typeof forceLiveFeedRefresh === 'function' ? forceLiveFeedRefresh : null,
      scrollToChallengeForm: typeof scrollToChallengeForm === 'function' ? scrollToChallengeForm : null,
      applyQuickPreset: typeof applyQuickPreset === 'function' ? applyQuickPreset : null
    };
    function dispatch(attr, event) {
      const el = event.target.closest('[' + attr + ']');
      if (!el) return;
      const name = el.getAttribute(attr);
      const fn = actions[name];
      if (typeof fn !== 'function') return;
      const arg = el.getAttribute('data-action-arg');
      if (el.tagName === 'A' && attr === 'data-action') event.preventDefault();
      try { arg ? fn(arg) : fn(); }
      catch (err) { /* swallow to avoid halting page on handler error */ }
    }
    document.addEventListener('click', function (e) { dispatch('data-action', e); });
    document.addEventListener('change', function (e) { dispatch('data-change-action', e); });
    document.addEventListener('input', function (e) { dispatch('data-input-action', e); });

    // ── Keyboard shortcuts for the Challenge Generator ──
    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;
      if (e.key === 'g' && actions.getChallenge) { e.preventDefault(); actions.getChallenge(); }
      else if (e.key === 's' && actions.skipChallenge) { e.preventDefault(); actions.skipChallenge(); }
      else if (e.key === 'c' && actions.markChallengeComplete) { e.preventDefault(); actions.markChallengeComplete(); }
      else if (e.key === '?' || (e.shiftKey && e.key === '/')) { e.preventDefault(); showShortcutHelp(); }
      else if (e.key === 'Escape') {
        const panel = document.getElementById('shortcut-help-panel');
        if (panel && panel.classList.contains('visible')) { panel.classList.remove('visible'); }
      }
    });
  })();

  function showShortcutHelp() {
    let panel = document.getElementById('shortcut-help-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'shortcut-help-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Keyboard shortcuts');
      panel.innerHTML = '<h3>Keyboard Shortcuts</h3>' +
        '<dl>' +
        '<dt>G</dt><dd>Generate a challenge</dd>' +
        '<dt>S</dt><dd>Skip current challenge</dd>' +
        '<dt>C</dt><dd>Mark challenge complete</dd>' +
        '<dt>?</dt><dd>Toggle this help</dd>' +
        '<dt>Esc</dt><dd>Close this help</dd>' +
        '</dl>' +
        '<button type="button" class="shortcut-close" aria-label="Close">Close</button>';
      document.body.appendChild(panel);
      panel.querySelector('.shortcut-close').addEventListener('click', function () {
        panel.classList.remove('visible');
      });
      panel.addEventListener('click', function (e) {
        if (e.target === panel) panel.classList.remove('visible');
      });
    }
    panel.classList.toggle('visible');
  }

  // ── Calendar ICS download ──
  function downloadStagIcs() {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Barcelona Stag 2026//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:ross-stag-2026@barcelona',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:20260503T061000',
      'DTEND:20260506T120000',
      'SUMMARY:Ross\'s Stag Do - Barcelona',
      'DESCRIPTION:3 nights\\, 6 lads\\, maximum fun. Belfast International 4am sharp.',
      'LOCATION:Barcelona\\, Spain',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ross-stag-barcelona-2026.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }
  window.downloadStagIcs = downloadStagIcs;

  // ── Share stag progress ──
  function shareStagProgress() {
    const target = new Date('2026-05-03T06:10:00').getTime();
    const diff = target - Date.now();
    const days = Math.max(0, Math.floor(diff / 86400000));
    const text = 'Only ' + days + ' days until Ross\'s Barcelona Stag. Vamos!';
    if (navigator.share) {
      navigator.share({ title: 'Barcelona Stag 2026', text: text, url: location.href })
        .catch(function () { /* user cancelled */ });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text + ' ' + location.href)
        .then(function () { if (typeof showToast === 'function') showToast('Copied to clipboard!', 3000); })
        .catch(function () { /* ignore */ });
    }
  }
  window.shareStagProgress = shareStagProgress;

  // ── Haptic feedback helper ──
  function hapticTap(pattern) {
    if (!navigator.vibrate) return;
    try { navigator.vibrate(pattern || 18); } catch (_) { /* ignore */ }
  }
  window.hapticTap = hapticTap;

  // Haptic feedback on key primary actions via event delegation. Done here
  // so it doesn't require editing every function's internals.
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.getAttribute('data-action');
    if (!action) return;
    if (action === 'getChallenge' || action === 'markChallengeComplete' ||
        action === 'skipChallenge' || action === 'addTeamPoint' ||
        action === 'spinPunishmentWheel' || action === 'celebrateRSVP') {
      hapticTap(action === 'celebrateRSVP' ? [30, 40, 30] : 18);
    }
  });

  // ── Scroll-to-top button visibility ──
  (function wireScrollTopVisibility() {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return;
    let raf = 0;
    function update() {
      raf = 0;
      btn.classList.toggle('visible', window.scrollY > 400);
    }
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  })();

  // ── Click-to-copy for booking/trip codes ──
  (function wireCodeCopy() {
    const ids = ['hotel-booking-code', 'transfer-booking-code', 'trip-code'];
    function copyText(text) {
      if (!text) return Promise.reject();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(ta);
          ok ? resolve() : reject();
        } catch (e) { reject(); }
      });
    }
    function attach(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.cursor = 'pointer';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('title', 'Click to copy');
      el.setAttribute('aria-label', 'Click to copy code');
      const trigger = function () {
        const text = (el.textContent || '').trim();
        if (!text || text === 'Loading...' || text === 'Unavailable') return;
        copyText(text)
          .then(function () { if (typeof showToast === 'function') showToast('Code copied!', 2000); })
          .catch(function () { if (typeof showToast === 'function') showToast('Copy failed', 2000); });
      };
      el.addEventListener('click', trigger);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
      });
    }
    ids.forEach(attach);
  })();

  // ── Service worker registration (best effort) ──
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* ignore */ });
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // New features: quick actions, presence, toasts-on-new, leaderboard,
  // nightlife map + group location ping, weather, flight countdown.
  // ─────────────────────────────────────────────────────────────────────

  // Trip + hotel reference data (used by quick actions, map, countdowns).
  const HOTEL_INFO = {
    name: 'Htop BCN City',
    address: 'Carrer de Balmes 144, 08008 Barcelona, Spain',
    lat: 41.3958,
    lng: 2.1555
  };
  const OUTBOUND_DEPART_MS = Date.parse('2026-05-03T06:10:00+01:00');
  const RETURN_DEPART_MS = Date.parse('2026-05-06T14:00:00+02:00');

  function copyToClipboard(text) {
    if (!text) return Promise.reject();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (_) { reject(); }
    });
  }

  // ── Hero quick-action buttons ─────────────────────────────────────────
  function copyTripCode() {
    const el = document.getElementById('trip-code');
    const text = el ? (el.textContent || '').trim() : '';
    if (!text || text === 'Loading...' || text === 'Unavailable') {
      showToast('Trip code not ready yet.', 2500);
      return;
    }
    copyToClipboard(text)
      .then(function () { showToast('Trip code copied', 2000); })
      .catch(function () { showToast('Copy failed', 2000); });
  }
  function copyHotelAddress() {
    copyToClipboard(HOTEL_INFO.name + ', ' + HOTEL_INFO.address)
      .then(function () { showToast('Hotel address copied', 2200); })
      .catch(function () { showToast('Copy failed', 2000); });
  }
  function openHotelMaps() {
    const q = encodeURIComponent(HOTEL_INFO.name + ' ' + HOTEL_INFO.address);
    window.open('https://www.google.com/maps/search/?api=1&query=' + q, '_blank', 'noopener');
  }
  function shareStagSite() {
    const text = 'Ross\'s Barcelona Stag HQ — schedule, challenges, lads.';
    if (navigator.share) {
      navigator.share({ title: 'Barcelona Stag 2026', text: text, url: location.href })
        .catch(function () { /* user cancelled */ });
    } else {
      copyToClipboard(location.href)
        .then(function () { showToast('Link copied', 2000); })
        .catch(function () { showToast('Copy failed', 2000); });
    }
  }

  // ── Crew presence (who's online) ──────────────────────────────────────
  const PRESENCE_FRESH_MS = 2 * 60 * 1000;   // green dot within 2 minutes
  const PRESENCE_IDLE_MS  = 10 * 60 * 1000;  // amber dot within 10 minutes
  const PRESENCE_BEACON_MS = 30 * 1000;      // update own beacon every 30s
  let presenceBeaconTimer = null;

  function writeOwnPresence() {
    const crew = getCurrentCrewKey();
    if (!crew) return;
    const nowTs = Date.now();
    const prev = crewPresence[crew];
    if (prev && Math.abs(nowTs - (Number(prev.lastSeen) || 0)) < 15000) return;
    crewPresence[crew] = { lastSeen: nowTs, name: getCrewDisplayName(crew) };
    renderCrewPresence();
    lastLocalEditAt = nowTs;
    saveJSON('crewPresence', crewPresence);
    queueChallengeStateSync(false);
  }

  function startPresenceBeacon() {
    if (!challengeCloudSyncEnabled) return;
    writeOwnPresence();
    if (presenceBeaconTimer) return;
    presenceBeaconTimer = setInterval(function () {
      if (document.hidden) return;
      writeOwnPresence();
    }, PRESENCE_BEACON_MS);
    // Refresh dots as timestamps age even without new data.
    setInterval(renderCrewPresence, 60000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) writeOwnPresence();
    });
  }

  function renderCrewPresence() {
    const cards = document.querySelectorAll('.lad-card[data-member]');
    if (!cards.length) return;
    const now = Date.now();
    const codeByMember = { joshua: '160698', emmanuel: '230997', ross: '170997', kealen: '270298', jack: '120398', ciaran: '240598' };
    let onlineCount = 0;
    cards.forEach(function (card) {
      const member = card.getAttribute('data-member');
      const code = codeByMember[member];
      const entry = code ? crewPresence[code] : null;
      const age = entry ? (now - (Number(entry.lastSeen) || 0)) : Infinity;
      let dot = card.querySelector('.presence-dot');
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'presence-dot';
        dot.setAttribute('aria-hidden', 'true');
        card.appendChild(dot);
      }
      let label = card.querySelector('.presence-label');
      if (!label) {
        label = document.createElement('span');
        label.className = 'presence-label';
        card.appendChild(label);
      }
      dot.classList.remove('presence-online', 'presence-idle', 'presence-offline');
      if (age < PRESENCE_FRESH_MS) {
        dot.classList.add('presence-online');
        label.textContent = 'Online now';
        onlineCount += 1;
      } else if (age < PRESENCE_IDLE_MS) {
        dot.classList.add('presence-idle');
        label.textContent = 'Idle';
        onlineCount += 1;
      } else {
        dot.classList.add('presence-offline');
        label.textContent = entry ? 'Last seen ' + formatRelativeTime(Number(entry.lastSeen) || 0) : 'Offline';
      }
    });
    const summary = document.getElementById('crew-online-summary');
    if (summary) {
      summary.textContent = onlineCount === 0
        ? 'No lads online right now.'
        : (onlineCount + ' lad' + (onlineCount === 1 ? '' : 's') + ' active');
    }
  }

  // ── Toast notifications for new submissions from other lads ───────────
  // Snapshot taken after first successful load so we don't spam toasts for
  // the initial batch of existing items.
  let notificationsReady = false;
  let knownChallengeIds = new Set();
  let knownActivityIds = new Set();
  let knownScheduleIds = new Set();
  let knownSiteChangeIds = new Set();
  function idSet(list) {
    const out = new Set();
    if (!Array.isArray(list)) return out;
    list.forEach(function (item) { if (item && item.id) out.add(item.id); });
    return out;
  }
  function primeNotificationBaselines() {
    knownChallengeIds = idSet(approvedChallenges);
    knownActivityIds = idSet(approvedActivitySuggestions);
    knownScheduleIds = idSet(approvedScheduleSuggestions);
    knownSiteChangeIds = idSet(approvedSiteChangeSuggestions);
    notificationsReady = true;
  }
  function notifyOfNewSubmissions(snap) {
    if (!notificationsReady) return;
    const currentCrew = getCurrentCrewKey();
    function announce(prevIds, nextList, label) {
      if (!Array.isArray(nextList)) return;
      nextList.forEach(function (item) {
        if (!item || !item.id || prevIds.has(item.id)) return;
        // Don't toast our own submissions.
        if (currentCrew && item.suggestedBy === currentCrew) return;
        const by = getCrewDisplayName(item.suggestedBy);
        const title = sanitizeText(item.title, 60) || 'something new';
        showToast(by + ' added a ' + label + ': ' + title, 4200);
      });
    }
    announce(knownChallengeIds, snap.nextChallenges, 'challenge');
    announce(knownActivityIds, snap.nextActivities, 'activity');
    announce(knownScheduleIds, snap.nextSchedule, 'schedule item');
    announce(knownSiteChangeIds, snap.nextSiteChanges, 'site change');
    knownChallengeIds = idSet(snap.nextChallenges);
    knownActivityIds = idSet(snap.nextActivities);
    knownScheduleIds = idSet(snap.nextSchedule);
    knownSiteChangeIds = idSet(snap.nextSiteChanges);
  }

  // ── Crew leaderboard ──────────────────────────────────────────────────
  function renderCrewActivityFeed() {
    const container = document.getElementById('crew-activity-feed');
    if (!container) return;
    const events = [];
    approvedChallenges.forEach(function (item) {
      if (!item || item.hidden || (item.reports || 0) >= 3) return;
      events.push({
        kind: 'challenge',
        label: 'submitted challenge',
        title: item.title,
        by: item.suggestedBy,
        ts: item.createdAt || 0,
        id: item.id
      });
      (item.completions || []).forEach(function (code, idx) {
        events.push({
          kind: 'done',
          label: 'marked done',
          title: item.title,
          by: code,
          // No per-completion timestamp stored; stagger by index so order is stable.
          ts: (item.createdAt || 0) + ((idx + 1) * 1000),
          id: item.id
        });
      });
    });
    approvedActivitySuggestions.forEach(function (item) {
      if (!item) return;
      events.push({
        kind: 'activity',
        label: 'suggested an activity',
        title: item.title,
        by: item.suggestedBy,
        ts: item.createdAt || 0,
        id: item.id
      });
    });
    approvedScheduleSuggestions.forEach(function (item) {
      if (!item) return;
      events.push({
        kind: 'schedule',
        label: 'pitched a plan',
        title: item.title + (item.day ? ' (' + item.day + ')' : ''),
        by: item.suggestedBy,
        ts: item.createdAt || 0,
        id: item.id
      });
    });
    approvedSiteChangeSuggestions.forEach(function (item) {
      if (!item) return;
      events.push({
        kind: 'site',
        label: 'requested a site tweak',
        title: (item.sectionName ? item.sectionName + ': ' : '') + item.title,
        by: item.suggestedBy,
        ts: item.createdAt || 0,
        id: item.id
      });
    });
    events.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    const top = events.slice(0, 20);
    clearElement(container);
    if (!top.length) {
      const empty = document.createElement('p');
      empty.style.opacity = '.6';
      empty.textContent = 'No crew activity yet — be the first to submit something.';
      container.appendChild(empty);
      return;
    }
    const icons = { challenge: '🎯', done: '✅', activity: '🎉', schedule: '🗓️', site: '🛠️' };
    const list = document.createElement('ul');
    list.className = 'activity-feed-list';
    top.forEach(function (ev) {
      const li = document.createElement('li');
      li.className = 'activity-feed-item activity-' + ev.kind;
      const icon = document.createElement('span');
      icon.className = 'activity-feed-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = icons[ev.kind] || '•';
      li.appendChild(icon);
      const body = document.createElement('div');
      body.className = 'activity-feed-body';
      const head = document.createElement('div');
      head.className = 'activity-feed-head';
      const who = document.createElement('strong');
      who.textContent = getCrewDisplayName(ev.by) || 'Crew';
      head.appendChild(who);
      head.appendChild(document.createTextNode(' ' + ev.label));
      body.appendChild(head);
      const title = document.createElement('div');
      title.className = 'activity-feed-title';
      title.textContent = '"' + ev.title + '"';
      body.appendChild(title);
      const ago = document.createElement('div');
      ago.className = 'activity-feed-time';
      ago.textContent = humanTimeAgo(ev.ts) || '';
      body.appendChild(ago);
      li.appendChild(body);
      list.appendChild(li);
    });
    container.appendChild(list);
  }

  function renderLeaderboard() {
    const container = document.getElementById('crew-leaderboard');
    if (!container) return;
    const codeByMember = { joshua: '160698', emmanuel: '230997', kealen: '270298', jack: '120398', ciaran: '240598' };
    const board = [];
    Object.keys(codeByMember).forEach(function (m) {
      const code = codeByMember[m];
      const name = getCrewDisplayName(code);
      let challenges = 0, activities = 0, schedule = 0, votesCast = 0, completed = 0, spend = 0;
      approvedChallenges.forEach(function (item) {
        if (!item) return;
        if (item.suggestedBy === code) challenges += 1;
        if (Array.isArray(item.completions) && item.completions.indexOf(code) !== -1) completed += 1;
      });
      approvedActivitySuggestions.forEach(function (item) { if (item && item.suggestedBy === code) activities += 1; });
      approvedScheduleSuggestions.forEach(function (item) { if (item && item.suggestedBy === code) schedule += 1; });
      Object.keys(challengeVoteLog || {}).forEach(function (k) {
        if (k.indexOf(code + ':') === 0) votesCast += 1;
      });
      Object.keys(activityVoteLog || {}).forEach(function (k) {
        if (k.indexOf(code + ':') === 0) votesCast += 1;
      });
      expenseEntries.forEach(function (e) { if (e && e.payer === name) spend += Number(e.amount || 0); });
      const points = (challenges * 3) + (activities * 3) + (schedule * 2) + (votesCast * 1) + (completed * 4);
      board.push({ name: name, code: code, points: points, challenges: challenges, activities: activities, schedule: schedule, votesCast: votesCast, completed: completed, spend: spend });
    });
    board.sort(function (a, b) { return b.points - a.points; });
    clearElement(container);
    const maxPts = Math.max(1, board[0] ? board[0].points : 0);
    board.forEach(function (entry, idx) {
      const row = document.createElement('div');
      row.className = 'leader-row';
      const head = document.createElement('div');
      head.className = 'leader-row-head';
      const rank = document.createElement('span');
      rank.className = 'leader-rank';
      rank.textContent = '#' + (idx + 1);
      const nm = document.createElement('span');
      nm.className = 'leader-name';
      nm.textContent = entry.name;
      const pts = document.createElement('span');
      pts.className = 'leader-points';
      pts.textContent = entry.points + ' pts';
      head.appendChild(rank); head.appendChild(nm); head.appendChild(pts);
      row.appendChild(head);
      const bar = document.createElement('div');
      bar.className = 'leader-bar';
      const fill = document.createElement('div');
      fill.className = 'leader-bar-fill';
      fill.style.width = (Math.round((entry.points / maxPts) * 100)) + '%';
      bar.appendChild(fill);
      row.appendChild(bar);
      const meta = document.createElement('div');
      meta.className = 'leader-meta';
      meta.textContent = entry.challenges + ' challenges · ' + entry.completed + ' done · ' + entry.activities + ' activities · ' + entry.schedule + ' plans · ' + entry.votesCast + ' votes · £' + entry.spend.toFixed(0) + ' covered';
      row.appendChild(meta);
      container.appendChild(row);
    });
  }

  // ── Flight countdown card ─────────────────────────────────────────────
  function formatHMS(ms) {
    if (ms <= 0) return '0d 0h 0m';
    const d = Math.floor(ms / MS_PER_DAY);
    const h = Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR);
    const m = Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE);
    return d + 'd ' + h + 'h ' + m + 'm';
  }
  function updateFlightTicker() {
    const out = document.getElementById('flight-ticker-out');
    const back = document.getElementById('flight-ticker-ret');
    const note = document.getElementById('flight-ticker-note');
    if (!out && !back) return;
    const now = Date.now();
    const outbound = OUTBOUND_DEPART_MS - now;
    const retbound = RETURN_DEPART_MS - now;
    if (out) {
      if (outbound > 0) {
        out.textContent = 'EZY3001 (BFS → BCN): T-' + formatHMS(outbound);
      } else if (outbound > -3 * MS_PER_HOUR) {
        out.textContent = 'EZY3001 in the air — vamos!';
      } else {
        out.textContent = 'EZY3001 complete. You made it.';
      }
    }
    if (back) {
      if (retbound > 0 && outbound < 0) {
        back.textContent = 'EZY3002 (BCN → BFS): T-' + formatHMS(retbound);
      } else if (retbound > 0) {
        back.textContent = 'Return EZY3002 departs 14:00 on 6 May.';
      } else {
        back.textContent = 'Return EZY3002 complete. Home safe.';
      }
    }
    if (note) {
      if (outbound > 0) {
        const hrs = outbound / MS_PER_HOUR;
        note.textContent = hrs < 24
          ? 'Final hours. Boarding pass, passport, hand-bag only.'
          : (hrs < 72 ? 'Packing window. Hand luggage only.' : 'Trip is locked in.');
      } else if (retbound > 0) {
        note.textContent = 'You\'re in Barcelona. Stay hydrated.';
      } else {
        note.textContent = 'Mission accomplished.';
      }
    }
  }
  setInterval(updateFlightTicker, 30000);

  // ── Open-Meteo weather widget ─────────────────────────────────────────
  const WEATHER_CACHE_KEY = 'weatherCacheV1';
  const WEATHER_CACHE_MS = 30 * 60 * 1000;
  function weatherIcon(code) {
    if (code === 0) return '\u2600\uFE0F';
    if (code >= 1 && code <= 2) return '\u26C5';
    if (code === 3) return '\u2601\uFE0F';
    if (code >= 45 && code <= 48) return '\uD83C\uDF2B\uFE0F';
    if (code >= 51 && code <= 67) return '\uD83C\uDF27\uFE0F';
    if (code >= 71 && code <= 77) return '\u2744\uFE0F';
    if (code >= 80 && code <= 82) return '\uD83C\uDF26\uFE0F';
    if (code >= 95) return '\u26C8\uFE0F';
    return '\uD83C\uDF24\uFE0F';
  }
  function renderWeatherData(data) {
    const body = document.getElementById('weather-body');
    const updated = document.getElementById('weather-updated');
    if (!body) return;
    clearElement(body);
    if (!data || !data.daily || !Array.isArray(data.daily.time)) {
      body.textContent = 'Weather unavailable. Try again later.';
      return;
    }
    const times = data.daily.time;
    const codes = data.daily.weathercode || [];
    const hi = data.daily.temperature_2m_max || [];
    const lo = data.daily.temperature_2m_min || [];
    const precip = data.daily.precipitation_probability_max || [];
    times.forEach(function (iso, idx) {
      const d = new Date(iso + 'T12:00:00');
      const card = document.createElement('div');
      card.className = 'weather-day';
      const lbl = document.createElement('div');
      lbl.className = 'weather-day-label';
      lbl.textContent = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
      const ic = document.createElement('div');
      ic.className = 'weather-icon';
      ic.textContent = weatherIcon(codes[idx] || 0);
      const temp = document.createElement('div');
      temp.className = 'weather-temp';
      temp.textContent = Math.round(hi[idx]) + '° / ' + Math.round(lo[idx]) + '°';
      const rain = document.createElement('div');
      rain.className = 'weather-rain';
      rain.textContent = (precip[idx] != null ? precip[idx] : '—') + '% rain';
      card.appendChild(lbl); card.appendChild(ic); card.appendChild(temp); card.appendChild(rain);
      body.appendChild(card);
    });
    if (updated) updated.textContent = 'Updated ' + new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  function refreshWeather(force) {
    const body = document.getElementById('weather-body');
    const updated = document.getElementById('weather-updated');
    if (!body) return;
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || 'null'); } catch (_) { cached = null; }
    const fresh = cached && cached.ts && (Date.now() - cached.ts) < WEATHER_CACHE_MS;
    if (cached && cached.data) renderWeatherData(cached.data);
    if (fresh && !force) return;

    // Trip runs 3-6 May 2026. Open-Meteo's forecast window is ~16 days,
    // so if the trip is outside the window show the next 7 days instead
    // and label the card as a "preview".
    const TRIP_START = '2026-05-03';
    const TRIP_END = '2026-05-06';
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const tripStartMs = new Date(TRIP_START + 'T00:00:00Z').getTime();
    const tripEndMs = new Date(TRIP_END + 'T23:59:59Z').getTime();
    const sixteenDaysMs = 16 * 24 * 60 * 60 * 1000;
    const tripInRange = (tripStartMs - today.getTime()) <= sixteenDaysMs && today.getTime() <= tripEndMs;

    let startDate, endDate, isTripWindow;
    if (tripInRange) {
      startDate = today.getTime() > tripStartMs ? todayIso : TRIP_START;
      endDate = TRIP_END;
      isTripWindow = true;
    } else {
      // Preview: show today + 6 days ahead until we're close enough to forecast the trip itself.
      const endMs = today.getTime() + 6 * 24 * 60 * 60 * 1000;
      startDate = todayIso;
      endDate = new Date(endMs).toISOString().slice(0, 10);
      isTripWindow = false;
    }
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=41.3874&longitude=2.1686'
      + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
      + '&timezone=Europe%2FMadrid'
      + '&start_date=' + startDate + '&end_date=' + endDate;
    body.setAttribute('data-loading', '1');
    fetch(url, { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (json) {
        if (!json) { if (!cached) body.textContent = 'Weather unavailable.'; return; }
        renderWeatherData(json);
        if (updated) {
          const mode = isTripWindow ? 'Trip window • ' : 'Barcelona preview • ';
          updated.textContent = mode + 'Updated ' + new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        }
        try { localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: json })); } catch (_) { /* ignore */ }
      })
      .catch(function () { if (!cached) body.textContent = 'Weather unavailable.'; })
      .finally(function () { body.removeAttribute('data-loading'); });
  }

  // ── Nightlife map (Leaflet) + group location ping ─────────────────────
  const BARCELONA_VENUES = [
    { name: 'Sips', kind: 'Cocktail', lat: 41.3912, lng: 2.1567, note: 'Top-tier cocktail bar — strong first stop.' },
    { name: 'Paradiso', kind: 'Speakeasy', lat: 41.3845, lng: 2.1843, note: 'Hidden-door speakeasy behind the pastrami shop.' },
    { name: 'Two Schmucks', kind: 'Dive', lat: 41.3803, lng: 2.1686, note: 'Relaxed dive-bar energy for groups.' },
    { name: 'Dr. Stravinsky', kind: 'Cocktail', lat: 41.3846, lng: 2.1830, note: 'Creative cocktails with a late-night vibe.' },
    { name: "Bobby's Free", kind: 'Speakeasy', lat: 41.3906, lng: 2.1678, note: 'Speakeasy-style venue with fun group atmosphere.' },
    { name: 'Hemingway Gin & Cocktail Bar', kind: 'Cocktail', lat: 41.3843, lng: 2.1740, note: 'Central and lively for bar-hopping.' },
    { name: 'Caribbean Club', kind: 'Rum', lat: 41.3823, lng: 2.1744, note: 'Rum-focused hideaway near the old town.' },
    { name: 'Bar Marsella', kind: 'Historic', lat: 41.3788, lng: 2.1693, note: 'Historic absinthe stop for a unique Barca night.' },
    { name: 'The Michael Collins', kind: 'Irish', lat: 41.4035, lng: 2.1745, note: 'Proper pints on Plaça Sagrada Familia.' },
    { name: "Flaherty's Irish Pub", kind: 'Irish', lat: 41.3792, lng: 2.1760, note: 'Right off La Rambla, live music most nights.' },
    { name: 'The George Payne', kind: 'Irish', lat: 41.3879, lng: 2.1685, note: 'Massive Irish pub in Eixample.' },
    { name: "Dunne's Irish Bar", kind: 'Irish', lat: 41.3822, lng: 2.1770, note: 'Gothic Quarter spot with good craic.' },
    { name: 'Shenanigans Irish Pub', kind: 'Irish', lat: 41.3863, lng: 2.1699, note: 'Near Plaça Catalunya — good for late sessions.' },
    { name: 'Htop BCN City (Hotel)', kind: 'Hotel', lat: HOTEL_INFO.lat, lng: HOTEL_INFO.lng, note: 'The base. Walking distance to Eixample venues.' }
  ];
  let leafletLoading = null;
  let leafletMap = null;
  let crewMarkerLayer = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletLoading) return leafletLoading;
    leafletLoading = new Promise(function (resolve, reject) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      css.crossOrigin = '';
      document.head.appendChild(css);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = function () { resolve(window.L); };
      script.onerror = function () { reject(new Error('Leaflet failed to load')); };
      document.head.appendChild(script);
    });
    return leafletLoading;
  }
  function ensureNightlifeMap() {
    const host = document.getElementById('nightlife-map');
    if (!host) return Promise.reject();
    if (leafletMap) return Promise.resolve(leafletMap);
    return loadLeaflet().then(function (L) {
      if (leafletMap) return leafletMap;
      leafletMap = L.map(host, { scrollWheelZoom: false }).setView([HOTEL_INFO.lat, HOTEL_INFO.lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(leafletMap);
      const bounds = [];
      BARCELONA_VENUES.forEach(function (v) {
        const isHotel = v.kind === 'Hotel';
        const color = isHotel ? '#D4A843' : (v.kind === 'Irish' ? '#22A06B' : (v.kind === 'Speakeasy' ? '#8B5CF6' : '#C9382A'));
        const marker = L.circleMarker([v.lat, v.lng], {
          radius: isHotel ? 10 : 7,
          color: color, weight: 2, fillColor: color, fillOpacity: isHotel ? 0.85 : 0.6
        }).addTo(leafletMap);
        marker.bindPopup('<strong>' + v.name + '</strong><br><span style="opacity:.7">' + v.kind + '</span><br>' + v.note
          + '<br><a href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v.name + ' Barcelona') + '" target="_blank" rel="noopener">Open in Maps</a>');
        bounds.push([v.lat, v.lng]);
      });
      if (bounds.length) leafletMap.fitBounds(bounds, { padding: [30, 30] });
      crewMarkerLayer = L.layerGroup().addTo(leafletMap);
      renderCrewLocationMap();
      return leafletMap;
    });
  }
  function toggleNightlifeMap() {
    const section = document.getElementById('nightlife-map-section');
    if (!section) return;
    const wasHidden = section.classList.contains('map-collapsed');
    section.classList.toggle('map-collapsed');
    if (wasHidden) {
      ensureNightlifeMap().then(function () {
        setTimeout(function () { if (leafletMap) leafletMap.invalidateSize(); }, 120);
      }).catch(function () {
        const host = document.getElementById('nightlife-map');
        if (host) host.textContent = 'Map failed to load. Check connection.';
      });
    }
  }
  function renderCrewLocationMap() {
    if (!leafletMap || !window.L || !crewMarkerLayer) return;
    crewMarkerLayer.clearLayers();
    const now = Date.now();
    Object.keys(crewLocations).forEach(function (code) {
      const entry = crewLocations[code];
      if (!entry) return;
      const age = now - (Number(entry.ts) || 0);
      if (age > 30 * 60 * 1000) return;
      const name = getCrewDisplayName(code);
      const marker = window.L.circleMarker([entry.lat, entry.lng], {
        radius: 9, color: '#60a5fa', weight: 3, fillColor: '#60a5fa', fillOpacity: 0.75
      });
      marker.bindPopup('<strong>' + name + '</strong><br>Pinged ' + formatRelativeTime(Number(entry.ts)));
      marker.addTo(crewMarkerLayer);
    });
  }
  function shareMyLocation() {
    const crew = getCurrentCrewKey();
    if (!crew) { showToast('Log in before sharing location.', 2500); return; }
    if (!navigator.geolocation) { showToast('Location not supported on this device.', 2500); return; }
    showToast('Requesting location…', 1800);
    navigator.geolocation.getCurrentPosition(function (pos) {
      crewLocations[crew] = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        ts: Date.now()
      };
      lastLocalEditAt = Date.now();
      saveJSON('crewLocations', crewLocations);
      queueChallengeStateSync(false);
      ensureNightlifeMap().then(function () {
        renderCrewLocationMap();
        if (leafletMap) leafletMap.setView([pos.coords.latitude, pos.coords.longitude], 15);
        showToast('Location shared for 30 min.', 2500);
      }).catch(function () {
        showToast('Location shared (map unavailable).', 2500);
      });
    }, function (err) {
      showToast(err && err.code === 1 ? 'Location permission denied.' : 'Could not get location.', 2800);
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  }
  function clearMyLocation() {
    const crew = getCurrentCrewKey();
    if (!crew) return;
    if (!crewLocations[crew]) { showToast('No active location to clear.', 1800); return; }
    delete crewLocations[crew];
    lastLocalEditAt = Date.now();
    saveJSON('crewLocations', crewLocations);
    queueChallengeStateSync(false);
    renderCrewLocationMap();
    showToast('Location cleared.', 1800);
  }

  // ── Boot sequence for the new features ────────────────────────────────
  function bootExtras() {
    renderCrewPresence();
    renderLeaderboard();
    renderCrewActivityFeed();
    updateFlightTicker();
    refreshWeather(false);
    primeNotificationBaselines();
    if (getCurrentCrewKey()) startPresenceBeacon();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootExtras);
  } else {
    bootExtras();
  }
  // Poll for login state so presence beacon starts right after login and
  // presence/leaderboard stay fresh as other clients submit data.
  setInterval(function () {
    try {
      if (getCurrentCrewKey()) startPresenceBeacon();
      renderCrewPresence();
    } catch (_) { /* ignore */ }
  }, 10000);

