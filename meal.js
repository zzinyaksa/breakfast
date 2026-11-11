const $ = (id) => document.getElementById(id);
const STORE_KEY = 'zzin-meal-v1';

// ---- storage (아이별) ----
function loadAll() {
  let a;
  try { a = JSON.parse(localStorage.getItem(STORE_KEY)); } catch { a = null; }
  if (!a) a = { kids: [], cur: null };
  return a;
}
function saveAll(a) { try { localStorage.setItem(STORE_KEY, JSON.stringify(a)); } catch {} }
function load() {
  const a = loadAll();
  return a.kids.find((x) => x.id === a.cur) || {};
}
function save(kid) {
  const a = loadAll();
  kid.id = kid.id || a.cur || 'k' + Date.now();
  a.cur = kid.id;
  const i = a.kids.findIndex((x) => x.id === kid.id);
  if (i >= 0) a.kids[i] = kid; else a.kids.push(kid);
  saveAll(a);
}
function update(fn) { const s = load(); fn(s); save(s); return s; }

// ---- dates ----
function isoDate(d) { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); }
function today() { return isoDate(new Date()); }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return isoDate(d); }
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
function ageYears() {
  const p = load().profile;
  return p && p.birth ? daysBetween(p.birth, today()) / 365.25 : null;
}
// 나이: 생년월일이 있으면 그걸로, 없으면 빠른 선택한 연령대의 대표 나이
function bandOf(age) { return AGE_BANDS.find((b) => age < b.max) || AGE_BANDS[2]; }
function calcAge(s) {
  if (s.profile && s.profile.birth) return daysBetween(s.profile.birth, today()) / 365.25;
  const b = AGE_BANDS.find((x) => x.id === s.band);
  return b ? b.age : null;
}
function childName(p) {
  if (p && p.nick) return p.nick;
  if (p) return p.sex === 'female' ? '우리 딸' : '우리 아들';
  return '우리 아이';
}

// ---- 아이 정보 ----
let sex = 'male';
let adding = false;
function setSex(s) {
  sex = s;
  document.querySelectorAll('.seg [data-sex]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sex === s)));
}
document.querySelectorAll('.seg [data-sex]').forEach((b) => b.addEventListener('click', () => setSex(b.dataset.sex)));
function renderKids() {
  const a = loadAll();
  $('kids').hidden = !a.kids.length;
  $('kids').innerHTML = a.kids.map((k) => `<button type="button" data-kid="${k.id}" aria-pressed="${k.id === a.cur}">${((k.profile && k.profile.sex) || k.qsex) === 'female' ? '👧' : '👦'} ${childName(k.profile)}</button>`).join('')
    + '<button type="button" data-kid="new">＋ 아이 추가</button>';
  $('kids').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.kid === 'new') { adding = true; openProfile(true); }
    else { const x = loadAll(); x.cur = b.dataset.kid; saveAll(x); refresh(); }
  }));
}
function renderProfile() {
  const s = load(); const p = s.profile;
  const w = (s.records || []).filter((r) => r.w).slice(-1)[0];
  if (p) {
    const band = p.birth ? bandOf(ageYears()) : null;
    $('profileLine').innerHTML = `${p.sex === 'female' ? '👧' : '👦'} <b>${childName(p)}</b> · ${p.birth ? (ageYears() < 1 ? `생후 ${Math.max(0, Math.floor(ageYears() * 12))}개월 (돌 전)` : `만 ${Math.floor(ageYears())}세 (${band.name})`) : '나이 미입력'}${w ? ` · ${w.w}kg` : ''} <button class="linkbtn" id="editP" type="button">수정</button>`;
  } else {
    $('profileLine').innerHTML = `<div class="step" style="margin:0 0 8px">우리 아이는 몇 살인가요? <small>나이에 맞춰 분량·목표가 달라져요</small></div>
      <div class="bands">${AGE_BANDS.map((b) => `<button type="button" data-band="${b.id}" aria-pressed="${s.band === b.id}"><span>${b.emo}</span><b>${b.name}</b><small>${b.range}</small></button>`).join('')}</div>
      <p class="hint" style="margin:8px 0 0">이름·생년월일까지 넣으려면 <button class="linkbtn" id="editP" type="button">자세히 입력</button></p>`;
    $('profileLine').querySelectorAll('[data-band]').forEach((b) => b.addEventListener('click', () => { update((x) => { x.band = b.dataset.band; }); refresh(); }));
    // 청소년은 아들·딸에 따라 열량·철분 기준이 크게 달라 빠른 선택에서도 고르게 한다
    $('profileLine').insertAdjacentHTML('beforeend', '<p class="hint" style="margin:6px 0 0">👶 돌 전 아기는 \'자세히 입력\'에서 생년월일을 넣어 주세요 (이유식 기준으로 바뀌어요)</p>');
    if (s.band) {
      $('profileLine').insertAdjacentHTML('beforeend', `<div class="qopt">아이는 <button type="button" data-qsex="male" aria-pressed="${(s.qsex || 'male') === 'male'}">👦 아들</button><button type="button" data-qsex="female" aria-pressed="${s.qsex === 'female'}">👧 딸</button></div>`);
      $('profileLine').querySelectorAll('[data-qsex]').forEach((b) => b.addEventListener('click', () => { update((x) => { x.qsex = b.dataset.qsex; }); refresh(); }));
    }
  }
  const ageP = calcAge(s);
  if (ageP != null && ageP >= 13) {
    $('profileLine').insertAdjacentHTML('beforeend', `<div class="qopt"><button type="button" data-active aria-pressed="${!!s.active}">⚽ 운동을 많이 해요</button><small>열량·단백질 목표가 올라가요</small></div>`);
    $('profileLine').querySelector('[data-active]').addEventListener('click', () => { update((x) => { x.active = !x.active; }); refresh(); });
  }
  // 연령별 팁은 카드 대신 프로필 아래 한 줄로, 날마다 바꿔 보여 준다
  const tb = p && p.birth ? bandOf(ageYears()) : AGE_BANDS.find((b) => b.id === s.band);
  if (tb) {
    const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    const tips = tb.tips.filter((t) => !t.startsWith('여아') || kidSex(s) === 'female'); // 아들에게 여아 팁은 빼기
    $('profileLine').insertAdjacentHTML('beforeend', `<p class="agetip">💡 <b>오늘의 ${tb.name} 팁</b> <small>(매일 바뀌어요)</small><br>${tips[day % tips.length]}</p>`);
  }
  $('editP').addEventListener('click', () => openProfile(false));
}
function openProfile(isNew) {
  const s = isNew ? {} : load(); const p = s.profile || {};
  $('pfTitle').textContent = isNew ? '👶 새 아이 추가' : (load().profile ? '✏️ 아이 정보 수정' : '✏️ 아이 정보 입력');
  $('profileLine').hidden = !!isNew;
  const w = (s.records || []).filter((r) => r.w).slice(-1)[0];
  $('nick').value = p.nick || ''; $('birth').value = p.birth || ''; $('weight').value = w ? w.w : '';
  setSex(p.sex || (!isNew && s.qsex) || 'male');
  $('profileForm').hidden = false; $('scoreBar').hidden = true;
  $('nick').focus();
}
$('saveP').addEventListener('click', () => {
  const nick = $('nick').value.trim(), birth = $('birth').value;
  const w = parseFloat(String($('weight').value).replace(',', '.'));
  if (!birth) { $('perr').textContent = '생년월일을 넣어 주세요.'; return; }
  $('perr').textContent = '';
  const a = loadAll();
  if (adding || !a.cur) { a.cur = 'k' + Date.now(); saveAll(a); adding = false; }
  update((x) => {
    x.profile = { ...(x.profile || {}), nick, sex, birth };
    if (Number.isFinite(w) && w > 2 && w < 150) { x.records = (x.records || []).filter((r) => r.date !== today()); x.records.push({ date: today(), w }); }
  });
  $('profileForm').hidden = true; $('profileLine').hidden = false;
  refresh(); window.scrollTo(0, 0);
});
$('cancelP').addEventListener('click', () => {
  adding = false;
  $('profileForm').hidden = true; $('profileLine').hidden = false; refresh();
});

// ---- tabs ----
document.querySelectorAll('nav.tabs button').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
function showTab(tab) {
  document.querySelectorAll('nav.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  document.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== tab; });
  document.body.dataset.tab = tab;
  if (tab === 'gb') renderGb();
  window.scrollTo(0, 0);
  updateScoreBar();
}
// 결과 카드 안의 '공구 일정 보기' 버튼 (다시 그려져도 동작하게 위임)
document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) showTab(b.dataset.go); });

// ---- 카드 그리기 공통 ----
const UA = navigator.userAgent;
const IN_APP = /Instagram|FBAN|FBAV|KAKAOTALK|NAVER|Line\//i.test(UA);
const FONT = '"Apple SD Gothic Neo","Pretendard","Noto Sans KR",sans-serif';
const C = { bg: '#f7f1ea', card: '#ffffff', ink: '#2b2522', muted: '#7a6f68', accent: '#e2725b', soft: '#fbe3dc', line: '#eadfd4', r: '#d4493b', y: '#d18b1f', g: '#3f9a6b', rs: '#fbe1de', ys: '#fbefd9', gs: '#e3f3ea' };
function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function canvasCard(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = C.bg; g.fillRect(0, 0, w, h);
  g.fillStyle = C.card; roundRect(g, 50, 50, w - 100, h - 100, 48); g.fill();
  return { c, g };
}
function txt(g, s, x, y, size, color, weight = 500, align = 'left') {
  g.font = `${weight} ${size}px ${FONT}`; g.fillStyle = color; g.textAlign = align; g.fillText(s, x, y);
}
function footer(g, w, h, line) {
  txt(g, line, w / 2, h - 150, 34, C.muted, 500, 'center');
  txt(g, '@zzin__yaksa', w / 2, h - 96, 40, C.accent, 700, 'center');
}
async function shareCanvas(c, filename, title) {
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  const file = new File([blob], filename, { type: 'image/png' });
  // 인스타그램·카카오톡 등 인앱 브라우저는 공유·다운로드가 막혀 있어 이미지를 길게 눌러 저장하게 한다
  if (!IN_APP && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const src = c.toDataURL('image/png');
  $('cardImg').src = src; $('cardDl').href = src; $('cardDl').download = filename; $('cardDl').hidden = IN_APP;
  $('cardModal').hidden = false;
}
document.querySelectorAll('.modal').forEach((m) => {
  m.addEventListener('click', (e) => { if (e.target === m || e.target.hasAttribute('data-close')) m.hidden = true; });
});


// ---- 공동구매 일정 (groupbuy.js) ----
const WD = ['일', '월', '화', '수', '목', '금', '토'];
function md(iso) { const d = new Date(iso + 'T00:00:00'); return `${d.getMonth() + 1}/${d.getDate()}(${WD[d.getDay()]})`; }
function dDiff(iso) { return Math.round((new Date(iso + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000); }
// 제품의 공구 상태: 진행 중(on) → 가장 가까운 예정(soon) → 없음(none)
function gbStatus(id) {
  const t = today();
  const list = (typeof GROUPBUY === 'undefined' ? [] : GROUPBUY).filter((g) => g.id === id && g.end >= t).sort((a, b) => a.start.localeCompare(b.start));
  const on = list.find((g) => g.start <= t);
  if (on) return { state: 'on', g: on };
  return list.length ? { state: 'soon', g: list[0] } : { state: 'none' };
}
function gbBadge(id) {
  const st = gbStatus(id);
  if (st.state === 'on') { const left = dDiff(st.g.end); return `<em class="gb on">🔥 공구 중 · ${left ? `${left}일 남음` : '오늘 마감'}</em>`; }
  if (st.state === 'soon') { const d = dDiff(st.g.start); return `<em class="gb soon">📅 ${md(st.g.start)} 공구 오픈${d <= 7 ? ` · D-${d}` : ''}</em>`; }
  return '<em class="gb none">공구 미정</em>';
}
function ageRange(x) {
  const from = x.minAge === 0 ? '' : x.minAge < 1 ? `생후 ${Math.round(x.minAge * 12)}개월` : x.minAge === 1 ? '돌' : `만 ${x.minAge}세`;
  if (!from) return x.maxAge ? `만 ${x.maxAge}세까지` : '전 연령';
  return x.maxAge ? `${from}~만 ${x.maxAge}세` : `${from} 이상`;
}
const DM_URL = 'https://ig.me/m/zzin__yaksa';
function renderGb() {
  const order = { on: 0, soon: 1, none: 2 };
  const ka = calcAge(load());
  const fitKid = (x) => ka == null || (ka >= (x.minAge || 0) && Math.floor(ka) <= (x.maxAge ?? 99));
  const items = Object.keys(PRODUCTS).map((id) => ({ id, x: PRODUCTS[id], st: gbStatus(id), fit: fitKid(PRODUCTS[id]) }))
    .sort((a, b) => (b.fit - a.fit) || order[a.st.state] - order[b.st.state] || (a.st.g && b.st.g ? a.st.g.start.localeCompare(b.st.g.start) : 0));
  const any = items.some((i) => i.st.state !== 'none');
  $('gbList').innerHTML = `${any ? '' : `<div class="cc y"><div class="tt" style="margin:0;font-size:16px">지금은 잡힌 공구가 없어요</div><div class="row2">공구 오픈은 @zzin__yaksa 인스타 스토리로 가장 먼저 알려드려요. 팔로우해 두면 놓치지 않아요.</div><div class="gbtop"><a class="gbbtn" href="https://www.instagram.com/zzin__yaksa/" target="_blank" rel="noopener">📲 팔로우하기</a><a class="gbbtn ask" href="${DM_URL}" target="_blank" rel="noopener">💬 제품 문의하기</a></div></div>`}
    <ul class="list gblist">${items.map(({ id, x, st, fit }) => {
      const pic = x.img ? `<img class="pimg" src="${x.img}" alt="${x.name}">` : `<div class="emo">${x.emo}</div>`;
      const when = st.state === 'on' ? `<b class="gbw on">🔥 공구 진행 중</b> ${md(st.g.start)} ~ ${md(st.g.end)} · ${dDiff(st.g.end) ? `${dDiff(st.g.end)}일 남음` : '오늘 마감'}`
        : st.state === 'soon' ? `<b class="gbw soon">📅 공구 예정</b> ${md(st.g.start)} ~ ${md(st.g.end)} · D-${dDiff(st.g.start)}`
        : '<b class="gbw">공구 미정</b>';
      const btn = st.state === 'on' && st.g.link ? `<a class="gbbtn" href="${st.g.link}" target="_blank" rel="noopener">공구 참여하기</a>`
        : '';
      return `<li class="${fit ? '' : 'nofit'}">${pic}<div><b>${x.name}</b><span>${x.kind} · ${ageRange(x)}${PRODUCT_NOTE[id] ? ` · ${PRODUCT_NOTE[id]}` : ''}</span><div class="gbwhen">${when}${fit ? '' : ' · 우리 아이 나이엔 안 맞아요'}</div>${btn}</div></li>`;
    }).join('')}</ul>`;
}

// ---- 추천 영양제 (공동구매 제품) ----
// keys: 부족한 영양소 키들, names: 키 → 표시 이름
// age: 아이 나이(만). 만 4세 미만은 제품 대신 소아과 상담 안내, 그 위로는 제품마다 정한 최소 나이를 지킨다
function productHtml(keys, names, age) {
  const a = age == null ? 7 : age;
  const byProd = {};
  const fits = (id) => a >= (PRODUCTS[id].minAge || 0) && Math.floor(a) <= (PRODUCTS[id].maxAge ?? 99); // '만 10세까지'는 10세 11개월까지
  keys.forEach((k) => { const id = (NUTRIENT_PRODUCT[k] || []).find(fits); if (id) (byProd[id] = byProd[id] || []).push(names(k)); });
  const ids = Object.keys(byProd);
  if (!ids.length) {
    // 맞는 제품이 없는 어린 아기는 비워 두지 않고 상담 안내를 보여 준다
    return keys.length && a < 1 ? '<div class="cc g prod"><div class="q">💊 영양제는요</div><div class="tt">돌 전 아기는 이유식이 먼저예요</div><div class="row2">비타민 D 드롭(하루 400IU) 말고 다른 영양제는 소아청소년과와 상담한 뒤 정해 주세요.</div></div>' : '';
  }
  return `<div class="cc g prod"><div class="q">💊 잘 안 먹는다면<span class="pill">찐약사 공동구매</span></div><div class="tt">이런 영양제가 도움될 수 있어요</div>
    <ul class="list">${ids.map((id) => { const x = PRODUCTS[id]; const name = x.url ? `<a href="${x.url}" target="_blank" rel="noopener">${x.name}</a>` : x.name;
      const pic = x.img ? `<img class="pimg" src="${x.img}" alt="${x.name}">` : `<div class="emo">${x.emo}</div>`;
      const st = gbStatus(id); const buy = st.state === 'on' && st.g.link ? `<a class="gbbtn" href="${st.g.link}" target="_blank" rel="noopener">공구 참여하기</a>` : '';
      return `<li>${pic}<div><b>${name}</b>${gbBadge(id)}<span>${x.kind} · 부족: ${[...new Set(byProd[id])].join('·')}${PRODUCT_NOTE[id] ? `<br>${PRODUCT_NOTE[id]}` : ''}</span>${buy}</div></li>`; }).join('')}</ul>
    <button class="linkbtn gblink" type="button" data-go="gb">📅 공구 일정 보기 →</button>
    <p class="fine">음식이 먼저예요. 건강기능식품은 질병의 예방·치료를 위한 의약품이 아니에요. 찐약사가 판매에 참여하는 공동구매 제품이에요.</p></div>`;
}

// ---- 영양 체크 ----
function kidSex(s) { return (s.profile && s.profile.sex) || s.qsex || 'male'; }
const INFANT_HTML = '<div class="cc y infant"><div class="tt" style="margin:0;font-size:16px">👶 돌 전 아기는 참고용이에요</div><div class="row2">모유·분유·이유식이 중심인 시기라 점수는 만 1~3세 기준으로 계산해요. 생우유는 돌이 지나서, 이유식 양과 영양제는 소아청소년과 기준을 따라 주세요.</div></div>';
function renderNutri() {
  const s = load();
  const nc = s.nutri || { foods: {}, signs: {} };
  const ageN = calcAge(s);
  const signs = SIGNS.filter((x) => (ageN == null || ageN >= (x.minAge || 0)) && (!x.sex || x.sex === kidSex(s)));
  const chips = (arr, sel, kind) => arr.map((x) => `<button type="button" data-kind="${kind}" data-id="${x.id}" aria-pressed="${!!sel[x.id]}">${x.emo ? x.emo + ' ' : ''}${x.name}</button>`).join('');
  $('foodChips').innerHTML = chips(FOODS, nc.foods, 'foods');
  $('signChips').innerHTML = chips(signs, nc.signs, 'signs');
  document.querySelectorAll('#foodChips button, #signChips button').forEach((b) => b.addEventListener('click', () => {
    update((x) => { x.nutri = x.nutri || { foods: {}, signs: {} }; const g = x.nutri[b.dataset.kind]; g[b.dataset.id] = !g[b.dataset.id]; });
    renderNutri();
  }));

  const score = {}, why = {};
  for (const k in NUTRIENTS) { score[k] = 0; why[k] = { foods: [], signs: [] }; }
  const m = new Date().getMonth() + 1;
  score.d += 1 + (m >= 11 || m <= 2 ? 1 : 0);
  FOODS.filter((f) => nc.foods[f.id]).forEach((f) => { for (const k in f.n) { score[k] += f.n[k]; why[k].foods.push(f.name); } });
  signs.filter((g) => nc.signs[g.id]).forEach((g) => { for (const k in g.n) { score[k] += g.n[k]; why[k].signs.push(g.name); } });

  const touched = Object.values(nc.foods).some(Boolean) || signs.some((g) => nc.signs[g.id]);
  const need = Object.keys(NUTRIENTS).filter((k) => score[k] >= 1.5).sort((a, b) => score[b] - score[a]);
  if (!touched) { $('nutriResult').innerHTML = '<p class="note">음식과 신호를 고르면 우리 아이에게 필요한 영양소를 알려드려요.</p>'; lastNutri = null; return; }

  const cards = need.map((k) => {
    const n = NUTRIENTS[k], w = why[k];
    const fk = { iron: 'fe', zinc: 'zn', omega: 'om', vitc: 'vc', protein: 'p', ca: 'ca', mg: 'mg' }[k];
    const food = fk && ageN != null && ageN < 4 ? fixFood(fk, ageN) : n.food;
    const supp = ageN != null && ageN < 1 ? (k === 'd' ? '돌 전 아기는 비타민 D 드롭 하루 400IU' : k === 'iron' ? '생후 6개월부터 철분이 부족해지기 쉬워요 · 먹이는 양은 소아청소년과와 상담해 주세요' : '돌 전 아기는 영양제보다 이유식이 먼저예요')
      : ageN != null && ageN < 4 && k === 'd' ? '비타민 D 드롭 하루 600IU' : n.supp;
    const lv = score[k] >= 3 ? 'r' : 'y';
    const label = lv === 'r' ? '부족할 수 있어요' : '챙겨 보세요';
    const reason = [w.foods.length && `잘 안 먹음: ${w.foods.join(', ')}`, w.signs.length && `신호: ${w.signs.join(', ')}`, k === 'd' && '우리나라 아이 70~80%가 부족해요' + (m >= 11 || m <= 2 ? ' · 겨울엔 햇볕으로 거의 안 만들어져요' : '')].filter(Boolean).join('<br>');
    return `<div class="cc ${lv}"><div class="q">${n.emo} ${n.role}<span class="pill">${label}</span></div>`
      + `<div class="tt">${n.name}${w.signs.length ? `<span class="sigs">부족 신호 ${w.signs.length}개</span>` : ''}</div>`
      + `<div class="row2"><b>왜?</b>${reason}</div><div class="row2"><b>음식으로</b>${food}</div><div class="row2"><b>영양제</b>${supp}</div>`
      + `</div>`;
  });
  const immune = ['d', 'zinc', 'vita', 'vitc'].filter((k) => need.includes(k));
  const immuneHtml = nc.signs.cold && signs.some((g) => g.id === 'cold')
    ? `<div class="cc y"><div class="q">🛡️ 감기 잦은 아이라면<span class="pill">면역 성분</span></div><div class="tt">비타민 D · 아연 · 비타민 A · 비타민 C</div>`
      + `<ul><li>비타민 D: 면역세포가 병원균과 싸우는 힘을 키워요</li><li>아연: 면역세포를 훈련시키는 "T세포의 교육자"</li><li>비타민 A: "항감염 비타민"이라 불려요</li><li>비타민 C: 백혈구 기능을 도와요</li></ul>`
      + `<div class="row2" style="margin-top:8px">자주 아프면 성장에 쓸 에너지가 줄어요. 면역 관리도 성장 관리예요.</div></div>` : '';
  lastNutri = { need, score, why, immune: !!immuneHtml };
  $('nutriResult').innerHTML = `${ageN != null && ageN < 1 ? INFANT_HTML : ''}<p class="step" style="margin-top:18px">🔎 챙겨야 할 영양소 ${need.length}개</p><div class="cards">${cards.join('')}${immuneHtml}${productHtml(need, (k) => NUTRIENTS[k].name, ageN)}</div>`
    + '<button class="btn" id="nutriShare" type="button">영양 체크 결과 카드 공유하기</button>'
    + '<p class="note">⚠️ 부족 신호는 다른 원인일 수도 있어요. 신호가 여러 개거나 오래가면 소아청소년과에서 검사를 받아 보세요. 철분·칼슘·아연 영양제는 서로 2시간 띄워서 주세요.</p>';
  $('nutriShare').addEventListener('click', shareNutri);
}


// ---- 1. 영양 체크 공유 카드 ----
let lastNutri = null;
function shareNutri() {
  if (!lastNutri) return;
  const name = childName(load().profile);
  const list = lastNutri.need.slice(0, 5);
  const W = 1080, H = 1350;
  const { c, g } = canvasCard(W, H);
  txt(g, '우리 아이 영양 체크', W / 2, 190, 40, C.accent, 700, 'center');
  txt(g, `${name}, 챙겨야 할 영양소 ${lastNutri.need.length}개`, W / 2, 270, 52, C.ink, 800, 'center');
  let y = 340;
  list.forEach((k) => {
    const n = NUTRIENTS[k], lv = lastNutri.score[k] >= 3 ? 'r' : 'y';
    g.fillStyle = C[lv + 's']; roundRect(g, 120, y, W - 240, 112, 28); g.fill();
    g.fillStyle = C[lv]; roundRect(g, 120, y, 14, 112, 7); g.fill();
    txt(g, n.name, 170, y + 70, 44, C.ink, 800);
    const sig = lastNutri.why[k].signs.length;
    txt(g, sig ? `부족 신호 ${sig}개` : (lv === 'r' ? '부족할 수 있어요' : '챙겨 보세요'), W - 160, y + 70, 34, C[lv], 700, 'right');
    y += 130;
  });
  // 아래 문구는 목록 끝에서부터 차례로 내려 그려 서로 겹치지 않게 한다 (목록은 최대 5개라 y ≤ 990)
  let ly = y + 40;
  if (lastNutri.need.length > list.length) { txt(g, `외 ${lastNutri.need.length - list.length}개는 @zzin__yaksa 프로필 링크에서`, W / 2, ly, 30, C.muted, 600, 'center'); ly += 50; }
  if (lastNutri.immune) { txt(g, '🛡️ 면역 성분도 함께 챙겨요', W / 2, ly, 34, C.ink, 700, 'center'); }
  txt(g, '『자란다』 기준 · 참고용', W / 2, H - 205, 28, C.muted, 500, 'center');
  footer(g, W, H, '우리 아이 부족 신호, 1분이면 체크해요');
  shareCanvas(c, 'nutrition-check.png', '우리 아이 영양 체크');
}


// ---- 오늘 아침밥 체크 ----
let lastBf = null;
function shareBreakfast() {
  if (!lastBf) return;
  const B = lastBf;
  const W = 1080, H = 1350;
  const { c, g } = canvasCard(W, H);
  txt(g, `${md(today())} 아침밥 체크`, W / 2, 175, 40, C.accent, 700, 'center');
  txt(g, `${childName(load().profile)} 아침 영양 점수`, W / 2, 250, 46, C.ink, 700, 'center');
  if (B.infant) { g.fillStyle = C.ys; roundRect(g, W / 2 - 170, 270, 340, 50, 25); g.fill(); txt(g, '👶 돌 전 · 참고용', W / 2, 306, 30, C.y, 700, 'center'); }
  txt(g, `${B.total}점`, W / 2, B.infant ? 420 : 380, 130, C.ink, 800, 'center');
  const parts = (B.suppPts > 0 || B.sugPen > 0) ? `음식 ${B.foodScore}점${B.suppPts > 0 ? ` + 영양제 ${B.suppPts}점` : ''}${B.sugPen > 0 ? ` − 당류 ${B.sugPen}점` : ''}` : '';
  if (parts) txt(g, parts, W / 2, B.infant ? 470 : 430, 32, '#2f8fc4', 700, 'center');
  txt(g, `약 ${Math.round(B.sum.kcal)}kcal · ${B.amountMsg[1]}`, W / 2, B.infant ? (parts ? 520 : 480) : parts ? 475 : 450, 34, C.muted, 600, 'center');
  // 탄단지 막대
  const bx = 150, bw = W - 300, by = B.infant && parts ? 545 : 495;
  g.save(); roundRect(g, bx, by, bw, 26, 13); g.clip();
  g.fillStyle = '#e8b04a'; g.fillRect(bx, by, bw * B.pc / 100, 26);
  g.fillStyle = C.accent; g.fillRect(bx + bw * B.pc / 100, by, bw * B.pp / 100, 26);
  g.fillStyle = '#8a9bd6'; g.fillRect(bx + bw * (B.pc + B.pp) / 100, by, bw, 26);
  g.restore();
  txt(g, `탄수화물 ${B.pc}%  ·  단백질 ${B.pp}%  ·  지방 ${B.pf}%`, W / 2, by + 70, 30, C.muted, 600, 'center');
  // 영양소 9개 (2열)
  const lab = { g: '충분', y: '조금 부족', r: '부족' };
  B.rows.forEach((x, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x0 = col ? 570 : 150, y0 = by + 155 + row * 78;
    // 영양제로 채운 칸은 앱 화면처럼 하늘색 '영양제'로 그린다
    const col2 = x.supp ? '#2f8fc4' : C[x.lv];
    g.beginPath(); g.arc(x0 + 14, y0 - 11, 13, 0, Math.PI * 2); g.fillStyle = x.supp ? '#5bb4e5' : C[x.lv]; g.fill();
    txt(g, BF_FIX[x.k].name, x0 + 42, y0, 34, C.ink, 700);
    txt(g, x.supp ? '영양제' : lab[x.lv], x0 + 360, y0, 28, col2, 700, 'right');
  });
  if (B.tomorrow && B.tomorrow.moves.length) {
    g.fillStyle = C.gs; roundRect(g, 120, 1040, W - 240, 80, 24); g.fill();
    txt(g, `내일 아침은 ${B.tomorrow.score}점 도전! (+${B.tomorrow.score - B.total})`, W / 2, 1093, 34, C.ink, 700, 'center');
  } else if (B.lackNames.length) {
    const bandY = Math.max(1040, by + 155 + 4 * 78 + 45); // 영양소 목록 바로 아래 (돌 전 카드는 조금 더 아래)
    g.fillStyle = C.ys; roundRect(g, 120, bandY, W - 240, 80, 24); g.fill();
    txt(g, `내일 아침 도전: ${B.lackNames.slice(0, 3).join('·')} 하나만 더`, W / 2, bandY + 53, 34, C.ink, 700, 'center');
  }
  footer(g, W, H, '매일 아침 1분 체크 · 프로필 링크에서');
  shareCanvas(c, 'breakfast-check.png', '오늘 아침밥 체크');
}
const BF_KEYS = ['p', 'ca', 'fe', 'zn', 'mg', 'vc', 'd', 'fib'];
function bfToday(s) {
  const t = today();
  const bf = s.bf && s.bf.date === t ? s.bf : { date: t, items: {}, supps: {}, amt: 1 };
  for (const k in bf.items) {
    const q = bf.items[k] === true ? 1 : Number(bf.items[k]);
    if (BF_QTY_STEPS.includes(q)) bf.items[k] = q; else if (q) bf.items[k] = 1; else delete bf.items[k];
  }
  bf.supps = bf.supps || {};
  delete bf.amt; // 예전의 전체 양 선택은 메뉴별 분량으로 바뀌었다
  return bf;
}
function setBf(fn) {
  update((x) => { x.bf = bfToday(x); fn(x.bf); });
  renderBreakfast();
}

// 먹은 음식(id→분량 배수)·연령 배율(amt)·영양제로 아침 영양을 계산한다
function calcBf(items, supps, need, amt = 1) {
  const sum = { kcal: 0, c: 0, p: 0, f: 0, ca: 0, fe: 0, zn: 0, mg: 0, va: 0, vc: 0, d: 0, om: 0, fib: 0, sug: 0, na: 0 };
  BF_ITEMS.forEach((x) => { const q = items[x.id] || 0; if (q) { const m = BF_FIXED.includes(x.id) ? 1 : amt; for (const k in sum) sum[k] += (x[k] || 0) * q * m; } });
  const filled = new Set();
  BF_SUPPS.filter((x) => supps[x.id]).forEach((x) => x.fills.forEach((k) => filled.add(k)));
  const rows = BF_KEYS.map((k) => ({ k, r: sum[k] / (need[k] / 3) }));
  // 오메가-3는 고등어구이 반 토막(om 1)을 아침 목표로 보고 비율로 계산한다 (멸치 0.1, 들기름·호두 0.5)
  rows.push({ k: 'om', r: sum.om });
  const lvOf = (r) => (r >= 0.8 ? 'g' : r >= 0.4 ? 'y' : 'r');
  rows.forEach((x) => {
    x.food = Math.min(1, x.r);   // 음식으로 채운 비율 (막대 앞부분)
    x.flv = lvOf(x.r);           // 음식만 봤을 때의 색
    x.supp = filled.has(x.k) && x.r < 1;  // 음식으로 다 못 채운 만큼은 영양제가 채운 것으로 본다
    if (x.supp) x.r = 1;         // 영양제가 나머지를 채운 것으로 본다 (막대 뒷부분, 노란색)
    x.lv = lvOf(x.r);
  });
  const score = Math.round(rows.reduce((a, x) => a + Math.min(1, x.r), 0) / rows.length * 100);
  return { sum, rows, score };
}

function renderBreakfast() {
  const s = load();
  const t = today();
  const bf = bfToday(s);
  const items = bf.items, supps = bf.supps;
  const bandNow = calcAge(s) == null ? null : bandOf(calcAge(s));
  const amtNow = bandNow ? bandNow.portion : 1;
  const qtyLabel = (id, q) => (BF_ML[id] ? `${Math.round(BF_ML[id] * q / 10) * 10}mL` : BF_QTY[id][BF_QTY_STEPS.indexOf(q)]);

  const ageNow = calcAge(s);
  $('bfChips').innerHTML = BF_CATS.filter((cat) => !cat.minAge || ageNow == null || ageNow >= cat.minAge).map((cat) => `<div class="fcat"><div class="fcat-h">${cat.emo} ${cat.name}</div><div class="chips">${cat.ids.map((id) => {
    const x = BF_ITEMS.find((i) => i.id === id), q = items[id];
    if (!q) return `<button type="button" data-id="${id}" aria-pressed="false">${x.emo} ${BF_UNIT[id][0]}</button>`;
    const label = qtyLabel(id, q);
    return `<span class="pick"><button type="button" class="nm" data-id="${id}" aria-pressed="true">${x.emo} ${BF_UNIT[id][0]}</button><button type="button" class="qt" data-q="${id}" aria-label="${BF_UNIT[id][0]} 양 바꾸기">${label}</button></span>`;
  }).join('')}</div></div>`).join('');
  $('bfChips').querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => setBf((x) => {
    if (x.items[b.dataset.id]) delete x.items[b.dataset.id]; else x.items[b.dataset.id] = 1;
    if (!Object.keys(x.items).length) x.supps = {}; // 음식을 다 지우면 숨어 있던 영양제 선택도 지운다
  })));
  // 분량 글자를 누를 때마다 반 → 1인분 → 2배 → 반 … 으로 바뀐다
  $('bfChips').querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => setBf((x) => {
    const i = BF_QTY_STEPS.indexOf(x.items[b.dataset.q]);
    x.items[b.dataset.q] = BF_QTY_STEPS[(i + 1) % BF_QTY_STEPS.length];
  })));

  // 오늘 먹은 영양제: 점수 아래, 영양소 막대 바로 위에 두어 누르면 막대가 채워지는 걸 바로 보게 한다
  const suppChips = BF_SUPP_GROUPS.map(([g, label]) => `<div class="fcat"><div class="fcat-h">${label}</div><div class="chips">${BF_SUPPS.filter((x) => x.group === g)
    .map((x) => `<button type="button" data-supp="${x.id}" aria-pressed="${!!supps[x.id]}">${x.emo} ${x.name}</button>`).join('')}</div></div>`).join('');

  const eaten = BF_ITEMS.filter((x) => items[x.id]);
  $('bfIntro').hidden = !!eaten.length;
  $('scoreBar').hidden = true;
  if (!eaten.length) {
    $('bfResult').innerHTML = '<p class="note">먹은 음식을 고르면 아침 영양 점수와 저녁에 챙길 음식을 알려드려요. 바쁜 날은 우유 반 컵처럼 먹은 것만 골라도 돼요.</p>';
    return;
  }

  const p = s.profile;
  const wRec = (s.records || []).filter((r) => r.w).slice(-1)[0];
  const age = calcAge(s);
  const band = age == null ? null : bandOf(age);
  const need = dailyNeeds(age, kidSex(s), wRec && wRec.w, !!s.active && age != null && age >= 13);
  const active = !!s.active && age != null && age >= 13;
  // 같은 "1인분"도 영유아는 적게, 청소년은 많이 먹는다
  const amt = band ? band.portion : 1;
  const { sum, rows, score: rawScore } = calcBf(items, supps, need, amt);
  // 음식만의 점수와 영양제가 더해 준 점수를 나눠 보여 준다 (예: 74점 + 영양제 12점 = 86점)
  const foodScore = calcBf(items, {}, need, amt).score;
  // 영양제로 오르는 점수는 최대 20점 (음식이 먼저)
  const suppPts = Math.min(20, rawScore - foodScore);
  const bfScore = foodScore + suppPts;

  // 아침은 하루의 약 1/4~1/3 (영양소는 1/3, 열량은 1/4을 기준으로 본다)
  const kTarget = need.kcal * 0.25;
  // 당류(첨가·유리당)가 아침 열량의 10%를 넘으면, 넘은 2g마다 1점씩 뺀다 (최대 10점)
  const sugLimit = kTarget * 0.1 / 4;
  const sugPenOf = (g) => (g > sugLimit ? Math.min(10, Math.max(1, Math.round((g - sugLimit) / 2))) : 0);
  const sugPen = sugPenOf(sum.sug);
  const total = Math.max(0, bfScore - sugPen);
  const kRatio = sum.kcal / kTarget;
  const student = age != null && age >= 7;
  const amountMsg = kRatio < 0.6 ? ['y', age != null && age < 1 ? '분유·모유는 점수에 안 들어가요' : '양이 적은 편이에요', age != null && age < 1 ? '이유식 양은 아기마다 달라요. 모유·분유와 이유식 간식으로 채워 주세요.' : `아침 권장보다 적게 먹었어요. ${student ? '점심 급식을 든든히 먹고, 하교 후 간식' : '오전 간식'}으로 ${items.milk ? '과일·달걀' : '우유·과일'}을 더해 주세요.`]
    : kRatio <= 1.3 ? ['g', '양은 적당해요', '아침 권장량 정도를 먹었어요.']
    : kRatio > (active ? 2.2 : 1.8) ? ['r', '영양 과잉이에요', `아침 권장량의 약 ${kRatio.toFixed(1)}배예요. 혹시 너무 많이 누르셨나요? 실제로 이만큼 먹었다면 점심·저녁은 평소보다 가볍게 주세요.`]
    : active ? ['g', '든든하게 먹었어요', '운동하는 날엔 이 정도가 좋아요. 운동 전후로 우유·바나나·삶은 달걀을 챙겨 주세요.']
    : rows.filter((x) => x.lv !== 'g').length <= 1 ? ['g', '든든하게 잘 먹었어요', '골고루 많이 먹었어요. 점심은 평소대로 주세요.']
    : ['y', '양이 많은 편이에요', '점심은 평소대로, 간식은 가볍게 주세요.'];

  const ek = sum.c * 4 + sum.p * 4 + sum.f * 9 || 1;
  const pc = Math.round(sum.c * 4 / ek * 100), pp = Math.round(sum.p * 4 / ek * 100), pf = 100 - pc - pp;
  const macroMsg = kRatio < 0.4 ? '먹은 양이 적어서 균형은 다음 아침에 봐요.'
    : pp < 10 ? '탄수화물 위주예요. 단백질 반찬을 하나 더해 주세요.'
    : pc > 60 ? '탄수화물 비중이 높아요. 달걀·우유·두부를 곁들여 주세요.'
    // 영유아는 지방 30~40%가 정상이라 기준을 높게 둔다. 햄·튀김을 안 먹었으면 그 말은 하지 않는다
    : pf > (age != null && age < 4 ? 45 : 40) ? (eaten.some((x) => ['ham', 'friedrice', 'cupnoodle', 'sandwich', 'pancake'].includes(x.id))
      ? '지방 비중이 높아요. 햄·튀긴 음식은 줄여 주세요.' : '지방 비중이 높은 편이에요. 밥·빵이나 과일을 조금 곁들여 주세요.')
    : '탄수화물·단백질·지방 균형이 좋아요.';

  const label = { g: '충분', y: '조금 부족', r: '부족' };
  const lack = rows.filter((x) => x.lv !== 'g');
  const lackNames = [...lack].sort((a, b) => a.r - b.r).map((x) => BF_FIX[x.k].name);
  // 내일 레시피는 다음 업데이트 때 다양화해서 다시 넣는다 (TODO.md)
  const tm = { score: total, moves: [] };

  lastBf = { infant: age != null && age < 1, sum, kTarget, amountMsg, pc, pp, pf, rows, lackNames, bfScore, foodScore, suppPts, sugPen, total, tomorrow: tm };
  // 저녁 안내가 메인: 먹일 음식을 크게, 채워지는 영양소는 작게 붙인다
  // 비타민 D는 음식으로 채우기 어려워 맨 아래에 따로 솔직하게 안내한다 (음식으로 채울 것들을 먼저)
  const dLine = (x) => (x.supp
    ? '<li class="fx-d"><b>☀️ 오늘 비타민 D는 영양제로 챙겼어요</b><span>음식만으로는 채우기 어려워 영양제가 가장 확실해요</span></li>'
    : `<li class="fx-d"><b>☀️ 비타민 D는 음식만으로는 채우기 어려워요</b><span>${age != null && age < 1 ? '비타민 D 드롭(하루 400IU)을 권해요' : age != null && age < 4 ? '비타민 D 드롭(하루 600IU)을 권해요' : '비타민 D 영양제를 권해요'} · 낮 햇볕 10~15분도 도움돼요</span></li>`);
  const fixRows = lack.filter((x) => x.k !== 'd').sort((a, b) => a.r - b.r).slice(0, 4);
  const dRow = lack.find((x) => x.k === 'd');
  const fixHtml = fixRows.map((x) => `<li><b>${fixFood(x.k, age)}</b><span>${BF_FIX[x.k].emo} ${BF_FIX[x.k].name}</span></li>`).join('') + (dRow ? dLine(dRow) : '');
  // 아침밥 결과에서는 음식으로 채우기 어려운 비타민 D만 영양제를 보여 준다. 나머지 영양제는 영양 체크 탭(평소 식습관·부족 신호)에서
  const prodHtml = productHtml(rows.filter((x) => x.lv === 'r' && x.k === 'd').map((x) => x.k), (k) => BF_FIX[k].name, age);
  // 영양소가 모두 채워졌고 유산균을 안 챙긴 날엔 장 건강용 유산균을 보여 준다
  const pb = PRODUCTS.probiotic;
  // 비타민 D(음식으로 채우기 어려움)를 빼고 빨간 '부족'이 없으면 유산균을 보여 준다
  const probioticHtml = !rows.some((x) => x.lv === 'r' && x.k !== 'd') && !supps.probiotic && pb ? `<div class="cc g prod"><div class="q">💊 장 건강도 챙겨 볼까요?<span class="pill">찐약사 공동구매</span></div><div class="tt">오늘 아침 꽤 잘 먹었어요 👏</div>
    <ul class="list"><li>${pb.img ? `<img class="pimg" src="${pb.img}" alt="${pb.name}">` : `<div class="emo">${pb.emo}</div>`}<div><b>${pb.name}</b>${gbBadge('probiotic')}<span>${pb.kind} · ${ageRange(pb)}${PRODUCT_NOTE.probiotic ? `<br>${PRODUCT_NOTE.probiotic}` : ''}</span></div></li></ul>
    <button class="linkbtn gblink" type="button" data-go="gb">📅 공구 일정 보기 →</button>
    <p class="fine">음식이 먼저예요. 건강기능식품은 질병의 예방·치료를 위한 의약품이 아니에요. 찐약사가 판매에 참여하는 공동구매 제품이에요.</p></div>` : '';
  const suppUsed = BF_SUPPS.filter((x) => supps[x.id]).map((x) => x.name);

  // 당류(첨가·유리당)는 아침 열량의 10%, 나트륨은 하루 기준의 1/3을 넘으면 많은 편으로 본다
  const sugHigh = sugPen > 0;
  // 주스·햄 같은 음식의 주의 문구, 돌 전 생우유 경고
  const warns = eaten.filter((x) => x.warn).map((x) => x.warn);
  if (age != null && age < 1 && items.milk) warns.unshift('돌 전에는 생우유 대신 모유·분유를 주세요');
  if (age != null && age < 1 && items.tteok) warns.unshift('돌 전 아기에게는 떡을 주지 마세요. 목에 걸리기 쉬워요');
  else if (age != null && age < 3 && items.tteok) warns.unshift('떡은 목에 걸리기 쉬워요. 만 3세 전에는 잘게 잘라 앉아서 먹여 주세요');
  if (age != null && age < 4) {
    if (items.nuts) warns.push('만 4세 전에는 통견과 대신 곱게 갈아서 주세요 (질식 위험)');
    if (items.grape || items.tomato || items.blueberry) warns.push('포도·방울토마토·블루베리는 만 4세 전에는 반이나 4등분해서 주세요');
  }
  const naHigh = sum.na > need.na / 3;
  // 장 건강: 점수에는 넣지 않고 한 줄로만 보여 준다 (유산균은 권장량 기준이 없어서)
  const ferm = [...new Set(eaten.map((x) => BF_FERMENT[x.id]).filter(Boolean))];
  const gutHtml = supps.probiotic ? '🦠 장 건강: 유산균으로 챙겼어요 ✅'
    : ferm.length ? `🦠 장 건강: 오늘 ${ferm.join('·')}${(ferm[ferm.length - 1].slice(-1).charCodeAt(0) - 0xac00) % 28 ? '으로' : '로'} 챙겼어요 ✅`
    : '🦠 장 건강: 요거트·김치·된장 같은 발효식품이나 유산균을 곁들여 보세요';
  if (items.kimchi && age != null && age < 1) warns.push('돌 전에는 김치를 주지 마세요. 맵고 짜요');
  else if (items.kimchi && age != null && age < 4) warns.push('김치는 물에 헹궈 맵지 않게, 조금만 주세요');
  // 영양제를 여러 개 겹쳐 먹이면 같은 성분이 과해질 수 있다 (종합비타민 + 단일 성분, 또는 3개 이상)
  const suppIds = BF_SUPPS.filter((x) => supps[x.id]).map((x) => x.id);
  if (suppIds.length >= 3 || (supps.multi && (supps.d || supps.vc))) warns.push('영양제가 겹쳐요. 종합비타민과 비타민 D·C처럼 같은 성분이 겹치면 과잉될 수 있어요. 먹이는 양은 찐약사에게 물어봐 주세요');
  if (naHigh && items.soup) warns.push('국은 건더기 위주로, 국물은 조금만 주세요');

  $('bfResult').innerHTML = `${age != null && age < 1 ? INFANT_HTML : ''}
    <div class="bfsum">
      <div class="big2">${suppPts > 0 || sugPen > 0 ? `<span class="nw">아침 영양 점수 ${foodScore}점</span> <span class="nw">${suppPts > 0 ? `<span class="plus">+ 영양제 ${suppPts}점</span> ` : ''}${sugPen > 0 ? `<span class="minus">− 당류 ${sugPen}점</span> ` : ''}= <span class="tot">${total}점</span></span>` : `아침 영양 점수 ${total}점`}</div>
      <div class="row2">약 ${Math.round(sum.kcal)}kcal · 아침 권장 약 ${Math.round(kTarget)}kcal${suppUsed.length ? ` · 영양제: ${suppUsed.join(', ')}` : ''}</div>
      <div class="cc ${amountMsg[0]}" style="margin-top:10px;padding:12px 14px"><div class="tt" style="margin:0;font-size:16px">${amountMsg[1]}</div><div class="row2">${amountMsg[2]}</div></div>
      <div class="macro"><i style="width:${pc}%;background:#e8b04a"></i><i style="width:${pp}%;background:var(--accent)"></i><i style="width:${pf}%;background:#8a9bd6"></i></div>
      <div class="legend"><span style="--c:#e8b04a">탄수화물 <b>${pc}%</b></span><span style="--c:var(--accent)">단백질 <b>${pp}%</b></span><span style="--c:#8a9bd6">지방 <b>${pf}%</b></span></div>
      <div class="row2" style="margin-top:6px">${macroMsg}</div>
      <div class="less"><span class="lab">줄이면 좋은 것</span>
        <span class="lp ${sugHigh ? 'hi' : ''}">🍭 당류 약 ${Math.round(sum.sug)}g · ${sugHigh ? `많은 편 (−${sugPen}점)` : '적당'}</span>
        <span class="lp ${naHigh ? 'hi' : ''}">🧂 나트륨 약 ${Math.round(sum.na / 10) * 10}mg · ${naHigh ? '많은 편' : '적당'}</span></div>
      ${warns.map((w) => `<div class="warnline">⚠️ ${w}</div>`).join('')}
    </div>
    <div class="suppbox" id="bfSupps">
      <p class="step" style="margin:0 0 4px">💊 오늘 먹은 영양제가 있나요? <small>누르면 아래 부족한 칸이 하늘색으로 채워져요</small></p>
      ${suppChips}
    </div>
    <p class="step" style="margin-top:18px">아침에 채운 영양소 <small>하루 필요량의 1/3 기준</small></p>
    ${rows.map((x) => `<div class="nrow"><span>${BF_FIX[x.k].name}</span><div class="bar split"><i class="${x.flv}" style="width:${x.food * 100}%"></i>${x.supp ? `<i class="sp" style="width:${(1 - x.food) * 100}%"></i>` : ''}</div><span class="st ${x.supp ? 'sp' : x.lv}">${x.supp ? '영양제 보충' : label[x.lv]}</span></div>`).join('')}
    ${rows.some((x) => x.supp) ? '<div class="legend" style="margin-top:6px"><span style="--c:var(--g)">음식</span><span style="--c:#5bb4e5">영양제로 보충</span></div>' : ''}
    <div class="gutline">${gutHtml}</div>
    ${lack.length ? `<div class="cc y fixcard"><div class="fx-h">🍽️ 저녁엔 이렇게 챙겨 주세요!</div><ul class="fx-list">${fixHtml}</ul><div class="fx-sub">${rows.some((x) => x.lv === 'g') ? `✅ 오늘 채운 것: ${rows.filter((x) => x.lv === 'g').map((x) => BF_FIX[x.k].name).join(' · ')}<br>` : ''}내일 아침엔 ${lackNames.slice(0, 2).join('·')} 중 하나만 더해서 다시 눌러 보세요</div></div>
    <a class="followline" href="https://www.instagram.com/zzin__yaksa/" target="_blank" rel="noopener">📲 부족한 영양소 채우는 반찬, @zzin__yaksa에서 알려드려요 →</a>` : '<div class="cc g fixcard"><div class="fx-h" style="margin:0">아침 한 끼로 골고루 잘 먹었어요! 👏</div></div>'}
    <div class="cards">
      ${prodHtml}${probioticHtml}
    </div>
    <button class="btn" id="bfShare" type="button">아침밥 결과 카드 공유하기</button>
    <p class="note">${age != null ? (age < 1 ? '돌 전이라 영유아(만 1~3세) 기준으로 계산한 참고용이에요. ' : `${band.name}(${band.range}) 기준으로 계산했어요. `) : '위에서 아이 나이를 고르면 나이에 맞춰 계산해요. '}${active ? '운동을 많이 하는 아이라 열량·단백질 목표를 높였어요. ' : ''}${sugPen > 0 ? `당류는 아침 기준(약 ${Math.round(sugLimit)}g)을 넘은 2g마다 1점씩 뺐어요. ` : ''}음식 1회 분량 기준의 대략적인 추정치예요. 영양제는 권장량만큼 먹었다고 보고 계산해요. 비타민 D는 음식만으로 채우기 어려워 거의 모든 아이에게 보충을 권해요.</p>`;
  $('bfShare').addEventListener('click', shareBreakfast);
  $('bfResult').querySelectorAll('[data-supp]').forEach((b) => b.addEventListener('click', () => setBf((x) => { x.supps[b.dataset.supp] = !x.supps[b.dataset.supp]; })));
  $('scoreNum').textContent = total;
  updateScoreBar();
}

// 음식을 고르는 동안 아래쪽에 지금 점수를 띄워 두고, 누르면 결과로 이동한다
function updateScoreBar() {
  const res = document.querySelector('#bfResult .bfsum');
  const onTab = !document.querySelector('[data-panel="bf"]').hidden && $('profileForm').hidden; // 아이 정보 입력 중엔 숨김
  if (!res || !onTab) { $('scoreBar').hidden = true; return; }
  const top = res.getBoundingClientRect().top;
  $('scoreBar').hidden = top < window.innerHeight - 120;
}
window.addEventListener('scroll', updateScoreBar, { passive: true });
$('scoreBar').addEventListener('click', () => document.querySelector('#bfResult .bfsum').scrollIntoView({ behavior: 'smooth', block: 'start' }));

function refresh() {
  renderKids();
  renderProfile();
  renderBreakfast();
  renderNutri();
}

// 오늘 고른 음식·영양제를 한 번에 지운다
$('bfReset').addEventListener('click', () => {
  const bf = bfToday(load());
  if (!Object.keys(bf.items).length && !Object.values(bf.supps).some(Boolean)) return;
  if (!confirm('오늘 고른 음식과 영양제를 모두 지울까요?')) return;
  setBf((x) => { x.items = {}; x.supps = {}; });
  window.scrollTo(0, 0);
});

// ---- init ----
(function init() {
  if ($('srcOpen')) $('srcOpen').addEventListener('click', () => { // 참고 자료 버튼은 지금 화면에서 뺐다
    const recipeSrc = [...new Map(RECIPES.flatMap((r) => r.src).filter((x) => x.u).map((x) => [x.u, x])).values()];
    $('srcList').innerHTML = SOURCES.map((x) => `<li><div class="emo">📘</div><div><b>${x.t}</b><span>${x.d}</span></div></li>`).join('')
      + `<li><div class="emo">🍳</div><div><b>아침 레시피 참고</b><span>${recipeSrc.map((x) => `<a href="${x.u}" target="_blank" rel="noopener">${x.t}</a>`).join('<br>')}<br>원물 위주로 바꿔 짧게 다시 정리했어요</span></div></li>`;
    $('srcModal').hidden = false;
  });
  refresh();
})();
