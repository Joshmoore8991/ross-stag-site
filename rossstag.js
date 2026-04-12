  const target = new Date('2026-05-03T06:10:00').getTime();
  function tick() {
    const cdEl = document.querySelector('.countdown');
    const diff = target - Date.now();
    if (diff < 0) {
      ['days','hours','mins','secs'].forEach(id => document.getElementById(id).textContent = '00');
      if (cdEl) { cdEl.classList.remove('trip-active'); cdEl.classList.add('trip-complete'); }
      return;
    }
    if (cdEl && diff < 7 * 864e5) { cdEl.classList.add('trip-active'); }
    document.getElementById('days').textContent = String(Math.floor(diff/864e5)).padStart(2,'0');
    document.getElementById('hours').textContent = String(Math.floor((diff%864e5)/36e5)).padStart(2,'0');
    document.getElementById('mins').textContent = String(Math.floor((diff%36e5)/6e4)).padStart(2,'0');
    document.getElementById('secs').textContent = String(Math.floor((diff%6e4)/1e3)).padStart(2,'0');
  }
  tick(); setInterval(tick, 1000);
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
    link.addEventListener('click', function () {
      closeOpenMenus(null);
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
    if (!insideNav) closeOpenMenus(null);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    const openGroup = navGroups.find(function (group) { return group.classList.contains('open'); });
    closeOpenMenus(null);
    if (openGroup) {
      const toggle = openGroup.querySelector('.nav-group-toggle');
      if (toggle) toggle.focus();
    }
  });

  document.addEventListener('focusin', function (event) {
    const insideNav = event.target && event.target.closest && event.target.closest('.top-nav');
    if (!insideNav) closeOpenMenus(null);
  });

  window.addEventListener('scroll', function () {
    closeOpenMenus(null);
  });

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
    document.getElementById('progress-fill').style.width = progress + '%';
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
  const crewNameByBday = {
    '170997': 'Ross',
    '160698': 'Joshua',
    '230997': 'Emmanuel',
    '270298': 'Kelan',
    '120398': 'Jack',
    '240598': 'Ciaran'
  };
  const crewMemberIdByBday = {
    '170997': 'ross',
    '160698': 'joshua',
    '230997': 'emmanuel',
    '270298': 'kelan',
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
      subtitle: 'Command center is unlocked. Approvals and chaos management are yours.',
      role: 'Best Man Controller'
    },
    '230997': {
      title: 'Emmanuel Is In',
      subtitle: 'Energy deployed. Keep the pace high and the stories better.',
      role: 'Vibes Captain'
    },
    '270298': {
      title: 'Kelan Has Joined The Crew',
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
    kelan: '270298',
    kelanboylan: '270298',
    jack: '120398',
    jackdoherty: '120398',
    ciaran: '240598',
    ciaranstone: '240598'
  };
  let crewAliasToCode = Object.assign({}, defaultCrewAliasToCode);
  let crewPersonalizationOverrides = loadJSON('crewPersonalizationOverrides', {});
  if (!crewPersonalizationOverrides || typeof crewPersonalizationOverrides !== 'object' || Array.isArray(crewPersonalizationOverrides)) {
    crewPersonalizationOverrides = {};
  }
  let crewBdayState = '';

  function getCrewDisplayName(bday) {
    const code = String(bday || '');
    return crewNameByBday[code] || 'Crew member';
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
  const supabaseUrl = 'https://ozfytroyziiihzzvzwky.supabase.co';
  const supabaseAnonKey = 'sb_publishable_UQ4qHzfw9LV833yGydpPtQ_bsm9sXEh';
  const supabaseChallengeStateTable = 'challenge_state';
  const supabaseCrewLoginTable = 'crew_login_profiles';
  const challengeCloudSyncEnabled = typeof window !== 'undefined'
    && /^https?:$/i.test(window.location.protocol || '')
    && !!supabaseUrl
    && !!supabaseAnonKey;
  let challengeSyncInFlight = false;
  let challengeSyncQueued = false;
  let challengeSyncTimer = null;
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
  let currentChallenge = null;
  let teamBattle = loadJSON('teamBattle', {
    nameA: 'Team A',
    nameB: 'Team B',
    scoreA: 0,
    scoreB: 0,
    currentAssignment: null
  });
  const crewMembers = ['Joshua', 'Emmanuel', 'Ross', 'Kelan', 'Jack', 'Ciaran'];
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
      hidden: !!item.hidden
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
      crewPersonalizationOverrides: sanitizeCrewOverrides(state.crewPersonalizationOverrides)
    };
  }

  function getCurrentCrewKey() {
    return getCrewBday();
  }

  function isAllowedCrewBday(bday) {
    const value = String(bday || '');
    return value === groomBday || allowedCrewBdays.has(value);
  }

  function saveChallengeData() {
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
    saveCrewPersonalizationOverrides();
    queueChallengeStateSync(false);
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
      crewPersonalizationOverrides: crewPersonalizationOverrides
    });
  }

  function hashChallengePayload(payload) {
    try {
      return JSON.stringify(payload);
    } catch (e) {
      return '';
    }
  }

  function applyChallengeStatePayload(payload) {
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
  }

  function refreshChallengeUiFromState() {
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
  }

  function getSupabaseChallengeEndpoint(query) {
    const cleanBase = String(supabaseUrl || '').replace(/\/$/, '');
    return cleanBase + '/rest/v1/' + supabaseChallengeStateTable + (query || '');
  }

  function getSupabaseCrewLoginEndpoint(query) {
    const cleanBase = String(supabaseUrl || '').replace(/\/$/, '');
    return cleanBase + '/rest/v1/' + supabaseCrewLoginTable + (query || '');
  }

  function getSupabaseHeaders() {
    return {
      apikey: supabaseAnonKey,
      Authorization: 'Bearer ' + supabaseAnonKey,
      'Content-Type': 'application/json'
    };
  }

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
    fetch(getSupabaseChallengeEndpoint(''), {
      method: 'POST',
      headers: Object.assign({}, getSupabaseHeaders(), {
        Prefer: 'resolution=merge-duplicates,return=representation'
      }),
      body: JSON.stringify([{ id: 1, state: payload }])
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Sync failed');
        return res.json();
      })
      .then(function (rows) {
        if (!Array.isArray(rows) || !rows.length || !rows[0] || !rows[0].state) return;
        applyChallengeStatePayload(rows[0].state);
        lastChallengeSyncHash = hashChallengePayload(getChallengeStatePayload());
      })
      .catch(function () {
        // Silent fallback to local-only behavior when cloud sync is unavailable.
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
      const res = await fetch(getSupabaseChallengeEndpoint('?id=eq.1&select=state'), {
        method: 'GET',
        headers: getSupabaseHeaders(),
        cache: 'no-store'
      });
      if (!res.ok) return false;
      const rows = await res.json();
      if (!Array.isArray(rows) || !rows.length || !rows[0] || !rows[0].state) return false;
      applyChallengeStatePayload(rows[0].state);
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
      saveCrewPersonalizationOverrides();
      refreshChallengeUiFromState();
      return true;
    } catch (e) {
      return false;
    }
  }

  async function loadCrewLoginProfilesFromCloud() {
    if (!challengeCloudSyncEnabled) return false;
    try {
      const res = await fetch(getSupabaseCrewLoginEndpoint('?active=eq.true&select=crew_code,aliases'), {
        method: 'GET',
        headers: getSupabaseHeaders(),
        cache: 'no-store'
      });
      if (!res.ok) return false;
      const rows = await res.json();
      if (!Array.isArray(rows) || !rows.length) return false;

      const fromDb = {};
      rows.forEach(function (row) {
        const crewCode = normalizeCrewCode(row && row.crew_code);
        if (!crewCode) return;
        allowedCrewBdays.add(crewCode);
        if (Array.isArray(row.aliases)) {
          row.aliases.forEach(function (alias) {
            const key = normalizeCrewNameKey(alias);
            if (key) fromDb[key] = crewCode;
          });
        }
      });

      if (Object.keys(fromDb).length) {
        crewAliasToCode = Object.assign({}, defaultCrewAliasToCode, fromDb);
        saveAllowedCrewCodes();
      }
      return true;
    } catch (e) {
      return false;
    }
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
    const teamA = document.getElementById('team-a-name').value.trim();
    const teamB = document.getElementById('team-b-name').value.trim();
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
    if (!currentChallenge) {
      msg.textContent = 'Generate a challenge before marking complete.';
      msg.style.color = '#C9382A';
      return;
    }
    const key = getChallengeKey(currentChallenge);
    if (completedChallengeIds.includes(key)) {
      msg.textContent = 'Already marked completed.';
      msg.style.color = '#C9382A';
      return;
    }
    completedChallengeIds.push(key);
    if (teamBattle.currentAssignment && teamBattle.currentAssignment.challengeKey === key) {
      if (teamBattle.currentAssignment.team === 'A') teamBattle.scoreA += 1;
      if (teamBattle.currentAssignment.team === 'B') teamBattle.scoreB += 1;
      teamBattle.currentAssignment = null;
      updateTeamBattleUI();
    }
    saveChallengeData();
    msg.textContent = 'Challenge marked complete.';
    msg.style.color = 'var(--gold)';
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
    punishmentHistory.unshift(chosen);
    punishmentHistory = punishmentHistory.slice(0, 5);
    document.getElementById('punishment-result').textContent = chosen;
    document.getElementById('punishment-history').textContent = 'Recent: ' + punishmentHistory.join(' | ');
    saveChallengeData();
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
      ['Pending Approval', String(pendingCount)],
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
      msg.style.color = '#C9382A';
      return;
    }
    if (crew === groomBday) {
      msg.textContent = 'Ross cannot submit suggestions.';
      msg.style.color = '#C9382A';
      return;
    }
    const title = sanitizeText(titleInput.value, 120);
    const notes = sanitizeText(notesInput.value, 300);
    const type = typeInput.value;
    const difficulty = difficultyInput.value;
    if (title.length < 3) {
      msg.textContent = 'Add a challenge title (at least 3 characters).';
      msg.style.color = '#C9382A';
      return;
    }
    const normalized = normalizeTitle(title);
    const duplicatePending = pendingChallenges.some(item => normalizeTitle(item.title) === normalized);
    const duplicateApproved = approvedChallenges.some(item => normalizeTitle(item.title) === normalized);
    if (duplicatePending || duplicateApproved) {
      msg.textContent = 'That challenge already exists.';
      msg.style.color = '#C9382A';
      return;
    }
    const todayKey = getTodayKey();
    const submissionKey = crew + ':' + todayKey;
    const submissionsToday = challengeSubmissionLog[submissionKey] || 0;
    if (submissionsToday >= 4) {
      msg.textContent = 'Daily limit reached (4 challenges per crew member).';
      msg.style.color = '#C9382A';
      return;
    }
    challengeSubmissionLog[submissionKey] = submissionsToday + 1;
    pendingChallenges.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      title,
      type,
      difficulty,
      notes,
      suggestedBy: crew,
      createdAt: Date.now(),
      votes: 0,
      reports: 0,
      hidden: false
    });
    saveChallengeData();
    msg.textContent = 'Challenge submitted for best man approval.';
    msg.style.color = 'var(--gold)';
    titleInput.value = '';
    notesInput.value = '';
    displayPendingChallenges();
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
      msg.style.color = '#C9382A';
      return;
    }
    if (crew === groomBday) {
      msg.textContent = 'Ross cannot submit suggestions.';
      msg.style.color = '#C9382A';
      return;
    }

    const title = sanitizeText(titleInput.value, 120);
    const day = sanitizeText(dayInput.value, 50);
    const time = sanitizeText(timeInput.value, 40);
    const details = sanitizeText(detailsInput.value, 320);
    const link = normalizeURL(linkInput.value);

    if (title.length < 3) {
      msg.textContent = 'Add a title (at least 3 characters).';
      msg.style.color = '#C9382A';
      return;
    }
    if (day.length < 2 || time.length < 2 || details.length < 3) {
      msg.textContent = 'Add day, time, and details before submitting.';
      msg.style.color = '#C9382A';
      return;
    }

    const normalized = normalizeTitle(title + '|' + day + '|' + time);
    const duplicatePending = pendingScheduleSuggestions.some(item => normalizeTitle(item.title + '|' + item.day + '|' + item.time) === normalized);
    const duplicateApproved = approvedScheduleSuggestions.some(item => normalizeTitle(item.title + '|' + item.day + '|' + item.time) === normalized);
    if (duplicatePending || duplicateApproved) {
      msg.textContent = 'That schedule item already exists.';
      msg.style.color = '#C9382A';
      return;
    }

    const todayKey = getTodayKey();
    const submissionKey = crew + ':' + todayKey;
    const submissionsToday = scheduleSubmissionLog[submissionKey] || 0;
    if (submissionsToday >= 4) {
      msg.textContent = 'Daily limit reached (4 schedule items per crew member).';
      msg.style.color = '#C9382A';
      return;
    }

    scheduleSubmissionLog[submissionKey] = submissionsToday + 1;
    pendingScheduleSuggestions.push({
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

    msg.textContent = 'Schedule suggestion submitted for best man approval.';
    msg.style.color = 'var(--gold)';
    titleInput.value = '';
    dayInput.value = '';
    timeInput.value = '';
    detailsInput.value = '';
    linkInput.value = '';

    displayPendingScheduleSuggestions();
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
      msg.style.color = '#C9382A';
      return;
    }
    if (crew === groomBday) {
      msg.textContent = 'Ross cannot submit suggestions.';
      msg.style.color = '#C9382A';
      return;
    }

    const sectionName = sanitizeText(sectionInput.value, 80) || 'Any Section';
    const title = sanitizeText(titleInput.value, 120);
    const details = sanitizeText(detailsInput.value, 400);
    const link = normalizeURL(linkInput.value);

    if (title.length < 3 || details.length < 6) {
      msg.textContent = 'Add a clear title and details before submitting.';
      msg.style.color = '#C9382A';
      return;
    }

    const normalized = normalizeTitle(sectionName + '|' + title + '|' + details);
    const duplicatePending = pendingSiteChangeSuggestions.some(item => normalizeTitle(item.sectionName + '|' + item.title + '|' + item.details) === normalized);
    const duplicateApproved = approvedSiteChangeSuggestions.some(item => normalizeTitle(item.sectionName + '|' + item.title + '|' + item.details) === normalized);
    if (duplicatePending || duplicateApproved) {
      msg.textContent = 'That site change suggestion already exists.';
      msg.style.color = '#C9382A';
      return;
    }

    const todayKey = getTodayKey();
    const submissionKey = crew + ':' + todayKey;
    const submissionsToday = siteChangeSubmissionLog[submissionKey] || 0;
    if (submissionsToday >= 6) {
      msg.textContent = 'Daily limit reached (6 site changes per crew member).';
      msg.style.color = '#C9382A';
      return;
    }

    siteChangeSubmissionLog[submissionKey] = submissionsToday + 1;
    pendingSiteChangeSuggestions.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      sectionName,
      title,
      details,
      link,
      suggestedBy: crew,
      createdAt: Date.now()
    });
    saveChallengeData();

    msg.textContent = 'Site change submitted for best man approval.';
    msg.style.color = 'var(--gold)';
    sectionInput.value = '';
    titleInput.value = '';
    detailsInput.value = '';
    linkInput.value = '';

    displayPendingSiteChangeSuggestions();
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
    const index = pendingSiteChangeSuggestions.findIndex(item => item.id === id);
    if (index === -1) return;
    const entry = pendingSiteChangeSuggestions.splice(index, 1)[0];
    approvedSiteChangeSuggestions.push(entry);
    saveChallengeData();
    displayPendingSiteChangeSuggestions();
    displayApprovedSiteChangeSuggestions();
  }

  function rejectSiteChangeSuggestion(id) {
    pendingSiteChangeSuggestions = pendingSiteChangeSuggestions.filter(item => item.id !== id);
    saveChallengeData();
    displayPendingSiteChangeSuggestions();
  }

  function displayApprovedSiteChangeSuggestions() {
    const container = document.getElementById('approved-site-change-suggestions');
    if (!container) return;
    clearElement(container);

    if (!approvedSiteChangeSuggestions.length) {
      container.innerHTML = '<p style="opacity:.6;">No approved site change suggestions yet.</p>';
      return;
    }

    const heading = document.createElement('h3');
    heading.textContent = 'Approved Site Change Suggestions';
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
      msg.style.color = '#C9382A';
      return;
    }
    if (crew === groomBday) {
      msg.textContent = 'Ross cannot submit suggestions.';
      msg.style.color = '#C9382A';
      return;
    }

    const title = sanitizeText(titleInput.value, 120);
    const details = sanitizeText(detailsInput.value, 400);
    const price = sanitizeText(priceInput.value, 80);
    const link = normalizeURL(linkInput.value);

    if (title.length < 3 || details.length < 6) {
      msg.textContent = 'Add a title (3+ chars) and details (6+ chars).';
      msg.style.color = '#C9382A';
      return;
    }

    const normalized = normalizeTitle(title);
    if (pendingActivitySuggestions.some(function (i) { return normalizeTitle(i.title) === normalized; }) ||
        approvedActivitySuggestions.some(function (i) { return normalizeTitle(i.title) === normalized; })) {
      msg.textContent = 'That activity suggestion already exists.';
      msg.style.color = '#C9382A';
      return;
    }

    const todayKey = getTodayKey();
    var submissionKey = crew + ':' + todayKey;
    var submissionsToday = activitySubmissionLog[submissionKey] || 0;
    if (submissionsToday >= 6) {
      msg.textContent = 'Daily limit reached (6 activity submissions).';
      msg.style.color = '#C9382A';
      return;
    }

    activitySubmissionLog[submissionKey] = submissionsToday + 1;
    pendingActivitySuggestions.push({
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

    msg.textContent = 'Activity submitted for Joshua to approve.';
    msg.style.color = 'var(--gold)';
    titleInput.value = '';
    detailsInput.value = '';
    priceInput.value = '';
    linkInput.value = '';
    displayPendingActivitySuggestions();
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
    const index = pendingScheduleSuggestions.findIndex(item => item.id === id);
    if (index === -1) return;
    const entry = pendingScheduleSuggestions.splice(index, 1)[0];
    approvedScheduleSuggestions.push(entry);
    saveChallengeData();
    displayPendingScheduleSuggestions();
    displayApprovedScheduleSuggestions();
  }

  function rejectScheduleSuggestion(id) {
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
    const crew = getCrewBday();
    if (crew !== bmBday) {
      showToast('Admin access is for Joshua only.', 3000);
      return;
    }
    document.getElementById('approval-panel').style.display = 'block';
    displayJoshuaApprovalList();
    displayPendingChallenges();
    displayPendingScheduleSuggestions();
    displayPendingSiteChangeSuggestions();
  }

  function displayJoshuaApprovalList() {
    const container = document.getElementById('joshua-approval-list');
    if (!container) return;
    clearElement(container);

    const rows = [
      { label: 'Joshua (Best Man Admin)', code: bmBday, note: 'Full approval access', removable: false },
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

      container.appendChild(row);
    });
  }

  function addCrewCodeByJoshua() {
    const crew = getCrewBday();
    if (crew !== bmBday) return;
    const input = document.getElementById('approval-new-code');
    const msg = document.getElementById('approval-code-msg');
    if (!input || !msg) return;

    const normalized = normalizeCrewCode(input.value);
    if (!normalized) {
      msg.textContent = 'Enter 6 digits or DDMMYYYY.';
      msg.style.color = '#C9382A';
      return;
    }
    if (normalized === bmBday || normalized === groomBday) {
      msg.textContent = 'That code is reserved.';
      msg.style.color = '#C9382A';
      return;
    }
    if (allowedCrewBdays.has(normalized)) {
      msg.textContent = 'Code already exists.';
      msg.style.color = '#C9382A';
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
    const crew = getCrewBday();
    const msg = document.getElementById('approval-code-msg');
    if (crew !== bmBday) return;
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
    const isAdmin = crewBday === bmBday;
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

  let loginFailCount = 0;
  let loginLockedUntil = 0;

  function registerLoginFailure() {
    loginFailCount += 1;
    if (loginFailCount < 3) return 0;
    const cooldownMs = Math.min(30000, Math.pow(2, loginFailCount - 3) * 1000);
    loginLockedUntil = Date.now() + cooldownMs;
    return cooldownMs;
  }

  function clearLoginFailures() {
    loginFailCount = 0;
    loginLockedUntil = 0;
  }

  function crewLogin() {
    const bdayField = document.getElementById('crew-login-bday');
    const bday = resolveCrewCredential(bdayField.value);
    const msg = document.getElementById('crew-login-msg');
    if (Date.now() < loginLockedUntil) {
      const waitSec = Math.ceil((loginLockedUntil - Date.now()) / 1000);
      msg.textContent = 'Too many attempts. Try again in ' + waitSec + ' seconds.';
      msg.style.color = '#C9382A';
      shakeLoginBox();
      return;
    }
    if (!bday) {
      registerLoginFailure();
      msg.textContent = 'Enter a valid crew password (name or DOB code).';
      msg.style.color = '#C9382A';
      shakeLoginBox();
      return;
    }
    if (!isAllowedCrewBday(bday)) {
      const cooldown = registerLoginFailure();
      msg.textContent = 'Access code not recognized. Ask Joshua to add it.';
      if (cooldown > 0) msg.textContent += ' Cooldown: ' + Math.ceil(cooldown / 1000) + 's.';
      msg.style.color = '#C9382A';
      shakeLoginBox();
      return;
    }
    clearLoginFailures();
    setCrewBday(bday);
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
    showWelcomeGreeting(getCrewDisplayName(bday));
    if (isAdmin) {
      showToast('Admin panel loaded — scroll to Best Man Approval', 4000);
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

  function crewLogout() {
    setCrewBday('');
    const msg = document.getElementById('crew-login-msg');
    if (msg) {
      msg.textContent = 'Crew section locked.';
      msg.style.color = '#C9382A';
    }
    updateCrewAccess();
  }

  updateCrewAccess();

  function makeCard() {
    const div = document.createElement('div');
    div.className = 'dynamic-card';
    return div;
  }

  function displayPendingChallenges() {
    const container = document.getElementById('pending-challenges');
    if (!container) return;
    clearElement(container);
    if (!pendingChallenges.length) {
      container.innerHTML = '<p style="opacity:.6;">No pending challenges.</p>';
      return;
    }
    pendingChallenges.forEach(item => {
      const div = makeCard();

      const title = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = item.title;
      title.appendChild(strong);
      div.appendChild(title);

      const meta = document.createElement('p');
      meta.className = 'dynamic-card-meta';
      meta.textContent = item.type + ' • ' + item.difficulty + ' • by ' + item.suggestedBy;
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

  function approveChallenge(id) {
    const index = pendingChallenges.findIndex(item => item.id === id);
    if (index === -1) return;
    const challenge = pendingChallenges.splice(index, 1)[0];
    approvedChallenges.push(challenge);
    saveChallengeData();
    displayPendingChallenges();
    displayApprovedChallenges();
  }

  function rejectChallenge(id) {
    pendingChallenges = pendingChallenges.filter(item => item.id !== id);
    saveChallengeData();
    displayPendingChallenges();
  }

  function displayApprovedChallenges() {
    const container = document.getElementById('approved-challenges');
    if (!container) return;
    const visibleChallenges = approvedChallenges
      .filter(item => !item.hidden && (item.reports || 0) < 3)
      .sort((a, b) => (b.votes || 0) - (a.votes || 0) || b.createdAt - a.createdAt);
    container.innerHTML = '<h3>Approved Challenges</h3>';
    if (!visibleChallenges.length) {
      container.innerHTML += '<p style="opacity:.6;">No approved challenges yet.</p>';
      return;
    }
    visibleChallenges.forEach(item => {
      const div = makeCard();

      const title = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = item.title;
      title.appendChild(strong);
      div.appendChild(title);

      const meta = document.createElement('p');
      meta.className = 'dynamic-card-meta';
      meta.textContent = item.type + ' • ' + item.difficulty + ' • by ' + item.suggestedBy;
      div.appendChild(meta);

      const notes = document.createElement('p');
      notes.className = 'dynamic-card-text';
      notes.textContent = item.notes || 'No extra notes.';
      div.appendChild(notes);

      const score = document.createElement('p');
      score.className = 'dynamic-card-score';
      score.textContent = 'Score: ' + (item.votes || 0) + ' • Reports: ' + (item.reports || 0);
      div.appendChild(score);

      const actions = document.createElement('div');
      actions.className = 'dynamic-card-actions';
      actions.appendChild(makeActionButton(
        '👍',
        'btn btn-gold btn-sm',
        function () { voteChallenge(item.id, 1); }
      ));
      actions.appendChild(makeActionButton(
        '👎',
        'btn btn-outline-light btn-sm',
        function () { voteChallenge(item.id, -1); }
      ));
      actions.appendChild(makeActionButton(
        'Report',
        'btn btn-danger btn-sm',
        function () { reportChallenge(item.id); }
      ));
      div.appendChild(actions);

      container.appendChild(div);
    });
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
      msg.style.color = '#C9382A';
      return;
    }
    if (!Number.isFinite(points) || points < 1 || points > 10) {
      msg.textContent = 'Points must be between 1 and 10.';
      msg.style.color = '#C9382A';
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
      msg.style.color = '#C9382A';
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
    let storedTheme = 'dark';
    if (supportsLocalStorage()) {
      try {
        const rawTheme = localStorage.getItem('theme');
        if (rawTheme === 'light' || rawTheme === 'dark') {
          storedTheme = rawTheme;
        } else {
          storedTheme = loadJSON('theme', 'dark');
        }
      } catch (e) {
        storedTheme = 'dark';
      }
    }
    setTheme(storedTheme === 'light' ? 'light' : 'dark', false);
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
    document.getElementById('drinking-challenge').textContent = random;
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
    const selectedType = document.getElementById('challenge-filter-type').value;
    const selectedDifficulty = document.getElementById('challenge-filter-difficulty').value;
    let pool = approvedChallenges.filter(item => !item.hidden && (item.reports || 0) < 3);
    if (selectedType !== 'all') pool = pool.filter(item => item.type === selectedType);
    if (selectedDifficulty !== 'all') pool = pool.filter(item => item.difficulty === selectedDifficulty);
    if (!includeShown) pool = pool.filter(item => !shownChallengeIds.includes(item.id));
    return pool;
  }

  function renderChallengeResult(challenge) {
    currentChallenge = challenge;
    document.getElementById('random-challenge').textContent = challenge.title;
    document.getElementById('random-challenge-meta').textContent = challenge.type + ' • ' + challenge.difficulty + (challenge.notes ? ' • ' + challenge.notes : '');
    const msg = document.getElementById('challenge-complete-msg');
    if (msg) msg.textContent = '';
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
    const random = pool[Math.floor(Math.random() * pool.length)];
    shownChallengeIds.push(random.id);
    renderChallengeResult(random);
  }

  function skipChallenge() {
    getChallenge();
  }

  // Packing Checklist
  const packingItems = [
    "Passport", "Flight tickets", "Hotel key", "Phone charger", "Toothbrush", "Deodorant", "Shirts", "Trousers", "Underwear", "Socks", "Shoes", "Jacket", "Sunglasses", "Hat", "Swimwear", "Towels", "Medications", "Cash/Euros", "Credit cards", "ID", "Good vibes"
  ];
  function initPackingList() {
    const container = document.getElementById('packing-list');
    if (!container) return;
    const checked = loadJSON('packingChecked', {});
    const total = packingItems.length;
    const doneCount = packingItems.filter(item => checked[item]).length;

    const progress = document.createElement('p');
    progress.className = 'packing-progress';
    progress.id = 'packing-progress';
    progress.textContent = doneCount + ' / ' + total + ' packed' + (doneCount === total ? ' — Ready to go!' : '');
    container.appendChild(progress);

    packingItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'packing-item' + (checked[item] ? ' checked' : '');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'pack-' + item.replace(/\s+/g, '-');
      checkbox.checked = checked[item] || false;
      checkbox.onchange = () => {
        checked[item] = checkbox.checked;
        div.classList.toggle('checked', checkbox.checked);
        saveJSON('packingChecked', checked);
        const updatedCount = packingItems.filter(i => checked[i]).length;
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
  loadCrewLoginProfilesFromCloud();
  loadChallengeStateFromCloud().then(function (loaded) {
    if (!loaded) return;
    updateCrewAccess();
  });

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
