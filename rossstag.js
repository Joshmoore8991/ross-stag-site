  const target = new Date('2026-05-03T06:10:00').getTime();
  function tick() {
    const diff = target - Date.now();
    if (diff < 0) { ['days','hours','mins','secs'].forEach(id => document.getElementById(id).textContent = '00'); return; }
    document.getElementById('days').textContent = String(Math.floor(diff/864e5)).padStart(2,'0');
    document.getElementById('hours').textContent = String(Math.floor((diff%864e5)/36e5)).padStart(2,'0');
    document.getElementById('mins').textContent = String(Math.floor((diff%36e5)/6e4)).padStart(2,'0');
    document.getElementById('secs').textContent = String(Math.floor((diff%6e4)/1e3)).padStart(2,'0');
  }
  tick(); setInterval(tick, 1000);
  const obs = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold:.12 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  const navGroups = Array.from(document.querySelectorAll('.nav-group'));
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
  });

  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      closeOpenMenus(null);
    });
  });

  document.addEventListener('click', function (event) {
    const insideNav = event.target && event.target.closest && event.target.closest('.top-nav');
    if (!insideNav) closeOpenMenus(null);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeOpenMenus(null);
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
  const bmBday = '180997';
  const defaultCrewCodes = [
    bmBday,
    '230997',
    '270298',
    '120398',
    '201197',
    '080997',
    '240598',
    '220997'
  ];
  const legacyCrewCodes = ['160698', '270597', '140697'];
  const allowedCrewBdays = new Set(
    loadJSON('allowedCrewBdays', defaultCrewCodes)
      .map(normalizeCrewCode)
      .filter(Boolean)
  );
  defaultCrewCodes.forEach(function (code) { allowedCrewBdays.add(code); });
  legacyCrewCodes.forEach(function (code) { allowedCrewBdays.add(code); });
  allowedCrewBdays.add(bmBday);
  const crewNameByBday = {
    '170997': 'Ross',
    '180997': 'Joshua',
    '230997': 'Emmanuel',
    '270298': 'Kelan',
    '120398': 'Jack',
    '240598': 'Ciaran'
  };
  const crewPersonalizationByBday = {
    '170997': {
      title: 'Groom Mode: Ross In The Building',
      subtitle: 'All eyes on the groom. Keep him fed, watered, and on schedule.',
      role: 'The Main Character'
    },
    '180997': {
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

  function makeActionButton(label, styleText, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = styleText;
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
  }

  let pendingChallenges = loadJSON('pendingChallenges', []);
  let approvedChallenges = loadJSON('approvedChallenges', []);
  let challengeVoteLog = loadJSON('challengeVoteLog', {});
  let challengeReportLog = loadJSON('challengeReportLog', {});
  let challengeSubmissionLog = loadJSON('challengeSubmissionLog', {});
  let scheduleSubmissionLog = loadJSON('scheduleSubmissionLog', {});
  let siteChangeSubmissionLog = loadJSON('siteChangeSubmissionLog', {});
  let pendingScheduleSuggestions = loadJSON('pendingScheduleSuggestions', []);
  let approvedScheduleSuggestions = loadJSON('approvedScheduleSuggestions', []);
  let pendingSiteChangeSuggestions = loadJSON('pendingSiteChangeSuggestions', []);
  let approvedSiteChangeSuggestions = loadJSON('approvedSiteChangeSuggestions', []);
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
    saveJSON('completedChallengeIds', completedChallengeIds);
    saveJSON('punishmentHistory', punishmentHistory);
    saveJSON('teamBattle', teamBattle);
    saveJSON('missionBoard', missionBoard);
    saveJSON('expenseEntries', expenseEntries);
    saveJSON('pollBoard', pollBoard);
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
      'Buy the next round.',
      'Do 15 squats right now.',
      'Finish your drink in one go.',
      'Sing one full chorus chosen by the lads.',
      'Give a 30-second speech about the groom.',
      'Swap seats with the person opposite for 10 minutes.',
      'Hand over your phone for one playlist song.',
      'Order chips for the table.'
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
        const div = document.createElement('div');
        div.style.border = '1px solid rgba(212,168,67,.3)';
        div.style.padding = '12px';
        div.style.margin = '8px 0';
        div.style.background = 'var(--dark)';

        const title = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = item.title;
        title.appendChild(strong);
        div.appendChild(title);

        const sectionLine = document.createElement('p');
        sectionLine.style.opacity = '.75';
        sectionLine.textContent = 'Section: ' + item.sectionName + ' • by ' + item.suggestedBy;
        div.appendChild(sectionLine);

        const details = document.createElement('p');
        details.style.opacity = '.75';
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

        div.appendChild(makeActionButton(
          'Approve',
          'margin-right:10px; padding:6px 12px; background:var(--gold); color:var(--black); border:none; cursor:pointer;',
          function () { approveSiteChangeSuggestion(item.id); }
        ));

        div.appendChild(makeActionButton(
          'Reject',
          'padding:6px 12px; background:#C9382A; color:white; border:none; cursor:pointer;',
          function () { rejectSiteChangeSuggestion(item.id); }
        ));

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
        const card = document.createElement('div');
        card.style.border = '1px solid rgba(212,168,67,.2)';
        card.style.padding = '12px';
        card.style.margin = '8px 0';
        card.style.background = 'var(--dark)';

        const title = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = item.title;
        title.appendChild(strong);
        card.appendChild(title);

        const sectionLine = document.createElement('p');
        sectionLine.style.opacity = '.75';
        sectionLine.textContent = 'Section: ' + item.sectionName + ' • by ' + item.suggestedBy;
        card.appendChild(sectionLine);

        const details = document.createElement('p');
        details.style.opacity = '.75';
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
        const div = document.createElement('div');
        div.style.border = '1px solid rgba(212,168,67,.3)';
        div.style.padding = '12px';
        div.style.margin = '8px 0';
        div.style.background = 'var(--dark)';

        const title = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = item.title;
        title.appendChild(strong);
        div.appendChild(title);

        const meta = document.createElement('p');
        meta.style.opacity = '.7';
        meta.style.fontSize = '12px';
        meta.textContent = item.day + ' • ' + item.time + ' • by ' + item.suggestedBy;
        div.appendChild(meta);

        const details = document.createElement('p');
        details.style.opacity = '.75';
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

        div.appendChild(makeActionButton(
          'Approve',
          'margin-right:10px; padding:6px 12px; background:var(--gold); color:var(--black); border:none; cursor:pointer;',
          function () { approveScheduleSuggestion(item.id); }
        ));

        div.appendChild(makeActionButton(
          'Reject',
          'padding:6px 12px; background:#C9382A; color:white; border:none; cursor:pointer;',
          function () { rejectScheduleSuggestion(item.id); }
        ));

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
      alert('Admin access is for Joshua only.');
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
      .forEach(code => rows.push({ label: 'Crew Member', code: code, note: 'Crew access', removable: true }));

    rows.forEach(item => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.margin = '6px 0';
      row.style.opacity = '.88';

      const text = document.createElement('span');
      text.textContent = item.label + ': ' + item.code + ' - ' + item.note;
      row.appendChild(text);

      if (item.removable) {
        row.appendChild(makeActionButton(
          'Remove',
          'padding:4px 8px; background:#C9382A; color:white; border:none; cursor:pointer; border-radius:2px;',
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
    const cards = Array.from(document.querySelectorAll('.lad-card[data-code]'));
    const activeCode = getCrewBday();

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

    const activeCard = document.querySelector('.lad-card[data-code="' + activeCode + '"]');
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

  function updateCrewAccess() {
    let crewBday = getCrewBday();
    const suggestionSection = document.getElementById('suggestion-section');
    const bestmanSection = document.getElementById('bestman-approval-section');
    const scheduleSection = document.getElementById('trip-schedule-section');
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
    if (suggestionSection) suggestionSection.style.display = (loggedIn && !isGroom) ? 'block' : 'none';
    if (bestmanSection) bestmanSection.style.display = isAdmin ? 'block' : 'none';
    if (scheduleSection) scheduleSection.style.display = (loggedIn && !isGroom) ? 'block' : 'none';
    if (secretOptional) secretOptional.style.display = (loggedIn && !isGroom) ? 'block' : 'none';
    if (loginOverlay) loginOverlay.style.display = loggedIn ? 'none' : 'flex';
    if (logoutButton) logoutButton.style.display = loggedIn ? 'block' : 'none';
    document.body.classList.toggle('overlay-active', !loggedIn);
    updateLadsPersonalization();
    if (isAdmin) {
      document.getElementById('approval-panel').style.display = 'block';
      displayJoshuaApprovalList();
      displayPendingChallenges();
      displayPendingScheduleSuggestions();
      displayPendingSiteChangeSuggestions();
    } else {
      document.getElementById('approval-panel').style.display = 'none';
    }
    if (loggedIn) displayApprovedChallenges();
    displayApprovedScheduleSuggestions();
    displayApprovedSiteChangeSuggestions();
  }

  function crewLogin() {
    const bdayField = document.getElementById('crew-login-bday');
    const bday = normalizeCrewCode(bdayField.value);
    const msg = document.getElementById('crew-login-msg');
    if (!bday) {
      msg.textContent = 'Enter a valid access code (6 digits or DDMMYYYY).';
      msg.style.color = '#C9382A';
      return;
    }
    if (!isAllowedCrewBday(bday)) {
      msg.textContent = 'Access code not recognized. Ask Joshua to add it.';
      msg.style.color = '#C9382A';
      return;
    }
    setCrewBday(bday);
    bdayField.value = '';
    msg.textContent = (bday === groomBday)
      ? 'Hello Ross. You are logged in, but the schedule stays hidden for you.'
      : 'Hello ' + getCrewDisplayName(bday) + '. Welcome, secret schedule unlocked.';
    msg.style.color = 'var(--gold)';
    updateCrewAccess();
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

  function displayPendingChallenges() {
    const container = document.getElementById('pending-challenges');
    if (!container) return;
    clearElement(container);
    if (!pendingChallenges.length) {
      container.innerHTML = '<p style="opacity:.6;">No pending challenges.</p>';
      return;
    }
    pendingChallenges.forEach(item => {
      const div = document.createElement('div');
      div.style.border = '1px solid rgba(212,168,67,.3)';
      div.style.padding = '12px';
      div.style.margin = '8px 0';
      div.style.background = 'var(--dark)';

      const title = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = item.title;
      title.appendChild(strong);
      div.appendChild(title);

      const meta = document.createElement('p');
      meta.style.opacity = '.7';
      meta.style.fontSize = '12px';
      meta.textContent = item.type + ' • ' + item.difficulty + ' • by ' + item.suggestedBy;
      div.appendChild(meta);

      const notes = document.createElement('p');
      notes.style.opacity = '.75';
      notes.textContent = item.notes || 'No extra notes.';
      div.appendChild(notes);

      div.appendChild(makeActionButton(
        'Approve',
        'margin-right:10px; padding:6px 12px; background:var(--gold); color:var(--black); border:none; cursor:pointer;',
        function () { approveChallenge(item.id); }
      ));

      div.appendChild(makeActionButton(
        'Reject',
        'padding:6px 12px; background:#C9382A; color:white; border:none; cursor:pointer;',
        function () { rejectChallenge(item.id); }
      ));

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
      const div = document.createElement('div');
      div.style.border = '1px solid rgba(212,168,67,.3)';
      div.style.padding = '12px';
      div.style.margin = '8px 0';
      div.style.background = 'var(--dark)';

      const title = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = item.title;
      title.appendChild(strong);
      div.appendChild(title);

      const meta = document.createElement('p');
      meta.style.opacity = '.7';
      meta.style.fontSize = '12px';
      meta.textContent = item.type + ' • ' + item.difficulty + ' • by ' + item.suggestedBy;
      div.appendChild(meta);

      const notes = document.createElement('p');
      notes.style.opacity = '.75';
      notes.textContent = item.notes || 'No extra notes.';
      div.appendChild(notes);

      const score = document.createElement('p');
      score.style.opacity = '.75';
      score.style.marginBottom = '8px';
      score.textContent = 'Score: ' + (item.votes || 0) + ' • Reports: ' + (item.reports || 0);
      div.appendChild(score);

      div.appendChild(makeActionButton(
        '👍',
        'margin-right:8px; padding:6px 10px; background:var(--gold); color:var(--black); border:none; cursor:pointer;',
        function () { voteChallenge(item.id, 1); }
      ));

      div.appendChild(makeActionButton(
        '👎',
        'margin-right:8px; padding:6px 10px; background:transparent; color:var(--cream); border:1px solid rgba(255,255,255,.3); cursor:pointer;',
        function () { voteChallenge(item.id, -1); }
      ));

      div.appendChild(makeActionButton(
        'Report',
        'padding:6px 10px; background:#C9382A; color:white; border:none; cursor:pointer;',
        function () { reportChallenge(item.id); }
      ));

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
    pendingTitle.style.opacity = '.8';
    pendingTitle.textContent = 'Pending Missions';
    board.appendChild(pendingTitle);
    if (!pending.length) {
      const none = document.createElement('p');
      none.style.opacity = '.6';
      none.textContent = 'No pending missions.';
      board.appendChild(none);
    }
    pending.forEach(item => {
      const row = document.createElement('div');
      row.style.border = '1px solid rgba(212,168,67,.25)';
      row.style.padding = '10px';
      row.style.margin = '8px 0';
      row.style.background = 'var(--dark)';
      const t = document.createElement('p');
      const titleStrong = document.createElement('strong');
      titleStrong.textContent = item.title;
      t.appendChild(titleStrong);
      t.appendChild(document.createTextNode(' (' + item.points + ' pts)'));
      row.appendChild(t);
      const m = document.createElement('p');
      m.style.opacity = '.7';
      m.style.fontSize = '12px';
      m.textContent = 'Assigned to ' + (item.team === 'A' ? teamBattle.nameA : teamBattle.nameB);
      row.appendChild(m);
      row.appendChild(makeActionButton(
        'Mark Complete',
        'padding:6px 12px; background:var(--gold); color:var(--black); border:none; cursor:pointer;',
        function () { completeMission(item.id); }
      ));
      board.appendChild(row);
    });

    const doneTitle = document.createElement('p');
    doneTitle.style.opacity = '.8';
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
      row.style.opacity = '.7';
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
      row.style.opacity = '.75';
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
      const row = document.createElement('div');
      row.style.border = '1px solid rgba(212,168,67,.2)';
      row.style.padding = '10px';
      row.style.margin = '8px 0';
      row.style.background = 'var(--dark)';
      const text = document.createElement('p');
      const payerStrong = document.createElement('strong');
      payerStrong.textContent = item.payer;
      text.appendChild(payerStrong);
      text.appendChild(document.createTextNode(' paid £' + Number(item.amount).toFixed(2) + ' for ' + item.note));
      row.appendChild(text);
      row.appendChild(makeActionButton(
        'Remove',
        'padding:6px 10px; background:#C9382A; color:white; border:none; cursor:pointer;',
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
        'margin:5px; padding:10px 20px; background:var(--gold); color:var(--black); border:none; cursor:pointer; border-radius:2px;',
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
      row.style.margin = '8px 0';
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.fontSize = '13px';
      header.style.opacity = '.8';
      header.style.marginBottom = '4px';

      const label = document.createElement('span');
      label.textContent = opt.label;
      const voteLabel = document.createElement('span');
      voteLabel.textContent = count + ' vote' + (count === 1 ? '' : 's');
      header.appendChild(label);
      header.appendChild(voteLabel);

      const track = document.createElement('div');
      track.style.height = '10px';
      track.style.width = '100%';
      track.style.background = 'rgba(255,255,255,.08)';
      track.style.borderRadius = '5px';
      const fill = document.createElement('div');
      fill.style.height = '100%';
      fill.style.width = percent + '%';
      fill.style.background = 'var(--gold)';
      fill.style.borderRadius = '5px';
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
    "Take a shot for every lad who's been to Barcelona before.",
    "Do 5 push-ups while singing the stag anthem.",
    "Tell an embarrassing story about the groom.",
    "Down your drink if you've ever lost your phone on a night out.",
    "High-five everyone and say 'Vamos!'",
    "Order a round for the table.",
    "Dance like nobody's watching for 30 seconds.",
    "Share your worst hangover story."
  ];
  function getDrinkingChallenge() {
    const random = drinkingChallenges[Math.floor(Math.random() * drinkingChallenges.length)];
    document.getElementById('drinking-challenge').textContent = random;
  }

  // Challenge Generator
  const fallbackChallenges = [
    { title: "Run around the block in your underwear.", type: "Dares", difficulty: "Chaos", notes: "Old school classic." },
    { title: "Sing a song chosen by the group at the top of your lungs.", type: "Dares", difficulty: "Medium", notes: "No backing track." },
    { title: "Do 20 burpees in the hotel lobby.", type: "Team", difficulty: "Chaos", notes: "Fast reps only." },
    { title: "Call a random contact and say 'I'm getting married!'.", type: "Dares", difficulty: "Medium", notes: "Speaker mode mandatory." },
    { title: "Eat something spicy without drinking water.", type: "Drinking", difficulty: "Medium", notes: "No tap-out." },
    { title: "Tell a joke that makes everyone laugh.", type: "Chill", difficulty: "Easy", notes: "Crowd decides." },
    { title: "Switch clothes with someone for 10 minutes.", type: "Team", difficulty: "Easy", notes: "Full swap." },
    { title: "Propose a toast to the groom.", type: "Chill", difficulty: "Easy", notes: "Keep it heartfelt." }
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

  // Random Quote
  const quotes = [
    "\"A stag do is not complete without chaos.\"",
    "\"Barcelona: Where the party never stops.\"",
    "\"Friends that stag together, stay together.\"",
    "\"May your last night of freedom be legendary.\"",
    "\"Barcelona nights, unforgettable sights.\"",
    "\"The groom's wallet is off-limits!\"",
    "\"Lads on tour: Maximum fun, zero regrets.\"",
    "\"From Belfast to Barcelona: Let's go!\""
  ];
  function getQuote() {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('random-quote').textContent = random;
  }

  // Packing Checklist
  const packingItems = [
    "Passport", "Flight tickets", "Hotel key", "Phone charger", "Toothbrush", "Deodorant", "Shirts", "Trousers", "Underwear", "Socks", "Shoes", "Jacket", "Sunglasses", "Hat", "Swimwear", "Towels", "Medications", "Cash/Euros", "Credit cards", "ID", "Good vibes"
  ];
  function initPackingList() {
    const container = document.getElementById('packing-list');
    if (!container) return;
    const checked = loadJSON('packingChecked', {});
    packingItems.forEach(item => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.margin = '5px 0';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = item;
      checkbox.checked = checked[item] || false;
      checkbox.onchange = () => {
        checked[item] = checkbox.checked;
        saveJSON('packingChecked', checked);
      };
      const label = document.createElement('label');
      label.htmlFor = item;
      label.textContent = item;
      label.style.marginLeft = '10px';
      div.appendChild(checkbox);
      div.appendChild(label);
      container.appendChild(div);
    });
  }
  initPackingList();
  updateTeamBattleUI();
  renderMissionBoard();
  populateExpensePayerOptions();
  renderExpenseBoard();
  renderPollBoard();
  if (punishmentHistory.length) {
    const result = document.getElementById('punishment-result');
    const history = document.getElementById('punishment-history');
    if (result) result.textContent = punishmentHistory[0];
    if (history) history.textContent = 'Recent: ' + punishmentHistory.join(' | ');
  }
