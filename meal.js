const $ = (id) => document.getElementById(id);
const STORE_KEY = 'zzin-meal-v1';
const GROWTH_KEY = 'zzin-growth-v1';

const TIPS = [
  ['🥚', '달걀·두부·생선처럼 단백질 식품을 곁들여 보세요'],
  ['🥛', '우유·요거트는 제품마다 영양성분이 달라요'],
  ['🍊', '한 끼보다 여러 날의 다양한 식사를 함께 살펴요'],
  ['📅', '이 점수는 엄마의 성적표가 아닌 식사 기록이에요'],
  ['🐟', '생선과 견과류의 오메가3 종류·함량은 달라요'],
];
const BF_SCORE_VERSION = 4;

// ---- storage (아이별) ----
function loadAll() {
  let a;
  try { a = JSON.parse(localStorage.getItem(STORE_KEY)); } catch { a = null; }
  if (!a) {
    a = { kids: [], cur: null };
    // 같은 주소의 성장 앱에 입력한 아이 정보를 가져온다
    try {
      const g = JSON.parse(localStorage.getItem(GROWTH_KEY)) || {};
      const kids = g.kids || (g.profile ? [{ id: 'k1', ...g }] : []);
      a.kids = kids.filter((k) => k.profile).map((k) => ({ id: k.id, profile: k.profile, records: (k.records || []).filter((r) => r.w).slice(-1) }));
      a.cur = g.cur && a.kids.some((k) => k.id === g.cur) ? g.cur : a.kids[0] && a.kids[0].id;
    } catch {}
  }
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
  if (!p || !p.birth) return null;
  const [y,m,d] = p.birth.split('-').map(Number), now = new Date();
  if (![y,m,d].every(Number.isFinite) || p.birth > today()) return null;
  let years = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) years--;
  return years;
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
  $('kids').innerHTML = a.kids.map((k) => `<button type="button" data-kid="${k.id}" aria-pressed="${k.id === a.cur}">${k.profile && k.profile.sex === 'female' ? '👧' : '👦'} ${childName(k.profile)}</button>`).join('')
    + '<button type="button" data-kid="new">＋ 아이 추가</button>';
  $('kids').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.kid === 'new') { adding = true; openProfile(true); }
    else { const x = loadAll(); x.cur = b.dataset.kid; saveAll(x); refresh(); }
  }));
}
function renderProfile() {
  const s = load(); const p = s.profile;
  const w = (s.records || []).filter((r) => r.w).slice(-1)[0];
  $('profileLine').innerHTML = p
    ? `${p.sex === 'female' ? '👧' : '👦'} <b>${childName(p)}</b> · ${p.birth ? `만 ${Math.floor(ageYears())}세` : '나이 미입력'}${w ? ` · ${w.w}kg` : ''} <button class="linkbtn" id="editP" type="button">수정</button>`
    : '아이 나이를 넣으면 연령·성별 기준으로 계산해요 <button class="linkbtn" id="editP" type="button">입력하기</button>';
  $('editP').addEventListener('click', () => openProfile(false));
}
function openProfile(isNew) {
  const s = isNew ? {} : load(); const p = s.profile || {};
  const w = (s.records || []).filter((r) => r.w).slice(-1)[0];
  $('nick').value = p.nick || ''; $('birth').value = p.birth || ''; $('weight').value = w ? w.w : '';
  setSex(p.sex || 'male');
  $('profileForm').hidden = false;
  $('nick').focus();
}
$('saveP').addEventListener('click', () => {
  const nick = $('nick').value.trim(), birth = $('birth').value;
  const w = parseFloat(String($('weight').value).replace(',', '.'));
  if (!birth || birth > today()) { $('perr').textContent = '오늘 이전의 생년월일을 넣어 주세요.'; return; }
  $('perr').textContent = '';
  const a = loadAll();
  if (adding || !a.cur) { a.cur = 'k' + Date.now(); saveAll(a); adding = false; }
  update((x) => {
    x.profile = { ...(x.profile || {}), nick, sex, birth };
    if (Number.isFinite(w) && w > 2 && w < 150) { x.records = (x.records || []).filter((r) => r.date !== today()); x.records.push({ date: today(), w }); }
  });
  $('profileForm').hidden = true;
  refresh();
});
$('cancelP').addEventListener('click', () => {
  adding = false;
  $('profileForm').hidden = true; refresh();
});

// ---- tabs ----
document.querySelectorAll('nav.tabs button').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
function showTab(tab) {
  document.querySelectorAll('nav.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  document.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== tab; });
  window.scrollTo(0, 0);
}

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


// ---- 영양 체크 ----
function renderNutri() {
  const s = load();
  const nc = s.nutri || { foods: {}, signs: {} };
  const chips = (arr, sel, kind) => arr.map((x) => `<button type="button" data-kind="${kind}" data-id="${x.id}" aria-pressed="${!!sel[x.id]}">${x.emo ? x.emo + ' ' : ''}${x.name}</button>`).join('');
  $('foodChips').innerHTML = chips(FOODS, nc.foods, 'foods');
  $('signChips').innerHTML = chips(SIGNS, nc.signs, 'signs');
  document.querySelectorAll('#foodChips button, #signChips button').forEach((b) => b.addEventListener('click', () => {
    update((x) => { x.nutri = x.nutri || { foods: {}, signs: {} }; const g = x.nutri[b.dataset.kind]; g[b.dataset.id] = !g[b.dataset.id]; });
    renderNutri();
  }));

  const selected = FOODS.filter((f) => nc.foods[f.id]);
  const signs = SIGNS.filter((g) => nc.signs[g.id]);
  if (!selected.length && !signs.length) { $('nutriResult').innerHTML = '<p class="note">식습관은 음식 선택을 돕는 참고예요. 증상만으로 특정 영양소 결핍을 판단하지 않아요.</p>'; lastNutri = null; return; }
  // 증상·계절은 결핍 점수로 합산하지 않는다. 식품군 선택으로 살펴볼 영양소만 표시한다.
  const need = [...new Set(selected.flatMap((f) => Object.keys(f.n)))];
  const cards = need.slice(0, 3).map((k) => `<li><b>${NUTRIENTS[k].name}</b> · ${NUTRIENTS[k].food}</li>`).join('');
  lastNutri = { need, signs: signs.length };
  $('nutriResult').innerHTML = `${selected.length ? `<p class="step">식품 선택에서 살펴볼 것</p><ul class="food-options">${cards}</ul><p class="hint">안 먹는 식품군에 들어 있는 영양소예요. 다른 음식에서도 섭취할 수 있어요.</p>` : ''}
    ${signs.length ? '<p class="note">기록한 모습은 여러 원인으로 생길 수 있어요. 지속되거나 일상생활에 영향을 주면 소아청소년과에서 상담해 주세요.</p>' : ''}
    <p>다음 끼니에는 아이가 먹을 수 있는 대체 식품을 한 가지 골라 보세요.</p>
    <button class="btn ghost" id="nutriShare" type="button">식습관 참고 카드 공유하기</button>`;
  $('nutriShare').addEventListener('click', shareNutri);
}

let lastNutri = null;
function shareNutri() {
  if (!lastNutri) return;
  const { c, g } = canvasCard(1080, 1350);
  txt(g, '우리 아이 식습관 참고', 540, 200, 48, C.ink, 800, 'center');
  txt(g, '안 먹는 식품군에서 살펴볼 영양소', 540, 290, 34, C.ink, 600, 'center');
  lastNutri.need.slice(0, 6).forEach((k, i) => txt(g, NUTRIENTS[k].name, 540, 390 + i * 90, 44, C.ink, 700, 'center'));
  txt(g, '다른 음식에서도 섭취할 수 있어요', 540, 1040, 32, C.muted, 500, 'center');
  txt(g, '결핍 진단·영양제 필요 판정이 아니에요', 540, 1110, 32, C.muted, 500, 'center');
  footer(g, 1080, 1350, '다음 끼니에 한 가지씩');
  shareCanvas(c, 'nutrition-check.png', '우리 아이 식습관 참고');
}

// ---- 오늘 아침밥 체크 ----
let lastBf = null;
function shareBreakfast() {
  if (!lastBf) return;
  const B = lastBf;
  const W = 1080, H = 1350;
  const { c, g } = canvasCard(W, H);
  txt(g, B.preview ? '7세 남아 기준 미리보기' : '오늘 아침밥 체크', W / 2, 175, 40, C.accent, 700, 'center');
  txt(g, `${childName(load().profile)} 음식으로 챙긴 점수`, W / 2, 250, 46, C.ink, 700, 'center');
  txt(g, `${B.foodScore}점`, W / 2, 380, 130, C.ink, 800, 'center');
  txt(g, B.suppUsed ? `영양제 충족 가정 +${B.extraScore}점 · 함께 본 ${B.bfScore}점` : '음식 기준 · 앱 자체 참고 점수', W / 2, 450, 25, C.muted, 600, 'center');
  // 탄단지 막대
  const bx = 150, bw = W - 300, by = 495;
  g.save(); roundRect(g, bx, by, bw, 26, 13); g.clip();
  g.fillStyle = '#e8b04a'; g.fillRect(bx, by, bw * B.pc / 100, 26);
  g.fillStyle = C.accent; g.fillRect(bx + bw * B.pc / 100, by, bw * B.pp / 100, 26);
  g.fillStyle = '#8a9bd6'; g.fillRect(bx + bw * (B.pc + B.pp) / 100, by, bw, 26);
  g.restore();
  txt(g, `탄수화물 ${B.pc}%  ·  단백질 ${B.pp}%  ·  지방 ${B.pf}%`, W / 2, by + 70, 30, C.muted, 600, 'center');
  // 화면과 같은 공급원 색으로 표시한다.
  txt(g, '초록: 음식  ·  보라: 충족 가정  ·  회색: 기준까지 남음', W / 2, 605, 25, C.muted, 600, 'center');
  B.rows.forEach((x, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x0 = col ? 570 : 150, y0 = 650 + row * 78;
    const { food, supplement, gap } = nutrientSegments(x);
    txt(g, BF_FIX[x.k].name, x0, y0, 29, C.ink, 700);
    txt(g, nutrientStatus(x), x0 + 360, y0, 25, C.ink, 600, 'right');
    g.save(); roundRect(g, x0, y0 + 12, 360, 16, 8); g.clip();
    g.fillStyle = '#e0dcd7'; g.fillRect(x0, y0 + 12, 360, 16);
    g.fillStyle = '#328264'; g.fillRect(x0, y0 + 12, 360 * food / 100, 16);
    g.fillStyle = '#7861b5'; g.fillRect(x0 + 360 * food / 100, y0 + 12, 360 * supplement / 100, 16);
    g.restore();
  });
  txt(g, '다음 끼니에 한 가지만', W / 2, 1030, 32, C.ink, 700, 'center');
  const actionLines = B.action.match(/.{1,24}/g) || [];
  actionLines.forEach((line, i) => txt(g, line, W / 2, 1080 + i * 40, 28, C.ink, 500, 'center'));
  txt(g, '하루 기준의 1/3 비교 · 실제 보충량/결핍 판정 아님', W / 2, 1160, 25, C.muted, 500, 'center');
  footer(g, W, H, '우리 아이 아침밥, 몇 점일까?');
  shareCanvas(c, 'breakfast-check.png', '오늘 아침밥 체크');
}
const BF_KEYS = ['p', 'ca', 'fe', 'zn', 'mg', 'va', 'vc', 'd'];
function bfToday(s) {
  const t = today();
  const bf = s.bf && s.bf.date === t ? JSON.parse(JSON.stringify(s.bf)) : { date: t, items: {}, supps: {}, amt: 1 };
  // 구버전 선택은 1회 분량으로 보존하고, 새 버전은 항목별 배수를 유지한다.
  bf.items = bf.items || {};
  for (const k in bf.items) {
    const qty = bf.tapQuantityVersion === 1 ? Number(bf.items[k]) : bf.items[k] ? 1 : 0;
    if (BF_TAP[k] && Number.isFinite(qty) && qty > 0) bf.items[k] = qty; else delete bf.items[k];
  }
  bf.tapQuantityVersion = 1;
  bf.legacyItems = bf.legacyItems || {};
  for (const id of BF_LEGACY_IDS) {
    if (bf.items[id]) { bf.legacyItems[id] = bf.items[id]; delete bf.items[id]; }
  }
  bf.supps = bf.supps || {};
  bf.amt = [0.5, 1, 1.5].includes(Number(bf.amt)) ? Number(bf.amt) : 1;
  return bf;
}
function setBf(fn) {
  update((x) => { x.bf = bfToday(x); fn(x.bf); });
  renderBreakfast();
}

// 식사량/단백질/지방은 음식으로, 비타민·미네랄 등은 음식+영양제 충족 가정으로 평가한다.
function calcBf(items, supps, need, amt = 1) {
  const sum = { kcal: 0, c: 0, p: 0, f: 0, ca: 0, fe: 0, zn: 0, mg: 0, va: 0, vc: 0, d: 0, om: 0 };
  BF_ITEMS.forEach((x) => { if (items[x.id] && !x.legacy && !x.recordOnly) for (const k in sum) sum[k] += (x[k] || 0) * Number(items[x.id]) * amt; });
  const filled = new Set(BF_SUPPS.filter((x) => supps[x.id]).flatMap((x) => x.fills));
  const rows = BF_KEYS.map((k) => ({ k, r: sum[k] / (need[k] / 3), unknown: BF_ITEMS.some((x) => items[x.id] && (x.unknown || []).includes(k)) }));
  // 오메가3는 함량이 아닌 선택 기록이므로 영양소 평균/막대에서 제외한다.
  rows.forEach((x) => {
    x.foodRatio = x.r;
    x.supp = x.k !== 'p' && filled.has(x.k) && x.r < 1;
    if (x.supp) x.r = 1;
    x.lv = x.r >= 1 - 1e-9 ? 'g' : 'y';
  });
  const targetEnergy = need.kcal / 4, targetProtein = need.p / 3;
  const [fatLow, fatHigh] = need.fatRange || [0.15, 0.30];
  const targetFat = targetEnergy * fatLow / 9;
  const energyRatio = sum.kcal / targetEnergy;
  const fatShare = sum.f * 9 / (sum.c * 4 + sum.p * 4 + sum.f * 9 || 1);
  const micro = rows.filter((x) => x.k !== 'p');
  const ratios = {
    energy: energyRatio < 0.8 ? energyRatio / 0.8 : energyRatio <= 1.2 ? 1 : 1.2 / energyRatio,
    protein: Math.min(1, sum.p / targetProtein),
    fat: Math.min(1, sum.f / targetFat) * (fatShare > fatHigh ? fatHigh / fatShare : 1),
    nutrients: sum.kcal > 0 ? micro.reduce((a, x) => a + Math.min(1, x.r), 0) / micro.length : 0,
  };
  const names = { energy: '식사량', protein: '단백질', fat: '지방', nutrients: '비타민·미네랄 등' };
  const parts = Object.entries(BF_SCORE_WEIGHTS).map(([key, max]) => ({ key, name: names[key], max, points: Math.round(Math.max(0, Math.min(1, ratios[key])) * max * 10) / 10 }));
  const score = Math.round(parts.reduce((a, x) => a + x.points, 0));
  return { sum, rows, score, parts, targetEnergy, targetProtein, targetFat, fatShare, fatLow, fatHigh };

}

// 한 끼 입력은 결핍 판정이 아니다. 음식 기록으로 설명 가능한 행동 하나만 제시한다.
function nextMealAction(items, food, need) {
  if (food.sum.p < need.p / 3) return '다음 끼니엔 달걀·두부·고기 중 한 가지를 곁들여 보세요.';
  if (!items.veg && !items.fruitc && !items.banana) return '다음 끼니엔 채소 반찬이나 씹어 먹는 과일을 하나 곁들여 보세요.';
  if (food.sum.ca < need.ca / 3) return '다음 끼니나 간식에 우유·요거트 또는 칼슘을 함유한 대체 식품을 살펴보세요.';
  return '다음 끼니엔 오늘 기록한 음식과 다른 재료도 골라 보세요.';
}

// 색은 충족 등급 대신 공급원을 뜻한다. 음식 + 영양제 + 부족 = 100%.
function nutrientSegments(row) {
  const raw = Math.max(0, Math.min(1, row.foodRatio == null ? row.r : row.foodRatio));
  // 99.9%를 반올림해 도달로 바꾸지 않는다. 판정과 막대는 같은 100% 기준.
  const food = raw >= 1 - 1e-9 ? 100 : Math.min(99, Math.floor(raw * 100));
  const supplement = row.supp ? 100 - food : 0;
  return { food, supplement, gap: 100 - food - supplement };
}
function nutrientStatus(row) {
  const { gap } = nutrientSegments(row);
  return row.supp ? '보충 가정' : row.unknown ? '자료 일부' : gap ? `${gap}% 남음` : '기준 도달';
}
function renderNutrientBar(row) {
  const { food, supplement, gap } = nutrientSegments(row);
  const status = nutrientStatus(row);
  const description = `${BF_FIX[row.k].name}: 음식 ${food}%, 영양제 충족 가정 ${supplement}%, 이번 기준까지 ${gap}% 남음`;
  return `<div class="nrow nutrient-row"><span>${BF_FIX[row.k].name}</span><div class="bar nutrient-bar" role="img" aria-label="${description}" title="${description}"><i class="food-fill" style="width:${food}%"></i><i class="supp-fill" style="width:${supplement}%"></i><i class="gap-fill" style="width:${gap}%"></i></div><span class="nutrient-status">${status}</span></div>`;
}

function renderBreakfast() {
  const s = load();
  const t = today();
  const bf = bfToday(s);
  const items = bf.items, supps = bf.supps;

  $('bfChips').innerHTML = BF_CATS.map((cat) => `<div class="fcat"><div class="fcat-h">${cat.emo} ${cat.name}</div><div class="chips">${cat.ids.map((id) => {
    const x = BF_ITEMS.find((i) => i.id === id);
    const qty = items[id] || 0;
    const next = nextBfQuantity(id, qty);
    return `<span class="food-chip${qty ? ' selected' : ''}" role="group" aria-label="${BF_UNIT[id][0]} 분량"><button type="button" data-id="${id}" data-action="increase" aria-label="${BF_UNIT[id][0]} 양 늘리기, 다음 ${bfTapLabel(id, next)}">${x.emo} ${BF_UNIT[id][0]}</button>${qty ? `<button class="food-quantity" type="button" data-id="${id}" data-action="decrease" aria-label="${BF_UNIT[id][0]} ${bfTapLabel(id, qty)}, 누르면 ${qty <= BF_TAP[id][0] ? '선택 해제' : bfTapLabel(id, qty - BF_TAP[id][0]) + '로 줄이기'}">${bfTapLabel(id, qty)}</button>` : ''}</span>`;
  }).join('')}</div></div>`).join('');
  $('bfChips').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.id, action = b.dataset.action;
    setBf((x) => {
      const current = x.items[id] || 0;
      const qty = action === 'decrease' ? Math.max(0, current - BF_TAP[id][0]) : nextBfQuantity(id, current);
      if (qty) x.items[id] = qty; else delete x.items[id];
    });
    const target = $('bfChips').querySelector(`[data-id="${id}"][data-action="${action}"]`)
      || $('bfChips').querySelector(`[data-id="${id}"][data-action="increase"]`);
    target.focus({ preventScroll: true });
  }));
  $('bfAmountLabel').textContent = `전체 양 보정 · 현재 ${bf.amt}배`;
  $('bfAmt').querySelectorAll('button').forEach((b) => {
    b.setAttribute('aria-pressed', String(Number(b.dataset.a) === bf.amt));
    b.onclick = () => setBf((x) => { x.amt = Number(b.dataset.a); });
  });

  $('bfSupps').innerHTML = BF_SUPPS.map((x) => `<button type="button" data-id="${x.id}" aria-pressed="${!!supps[x.id]}">${x.emo} ${x.name}</button>`).join('');
  $('bfSupps').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setBf((x) => { x.supps[b.dataset.id] = !x.supps[b.dataset.id]; })));

  $('bfFoodResult').innerHTML = '';
  $('bfResult').innerHTML = '';
  $('bfSuppSection').hidden = true;
  const pending = Object.entries(bf.legacyItems || {});
  $('bfLegacy').innerHTML = pending.length ? `<p>이전 묶음 기록을 보관했어요. 실제 먹은 음식을 위에서 다시 골라 주세요.</p>${pending.map(([id, qty]) => `<p>${BF_UNIT[id][0]} · ${bfTapLabel(id, qty)} <button type="button" class="linkbtn" data-legacy="${id}">다시 골랐어요</button></p>`).join('')}` : '';
  $('bfLegacy').hidden = !pending.length;
  $('bfLegacy').querySelectorAll('[data-legacy]').forEach((b) => b.onclick = () => setBf((x) => {
    x.legacyArchive = x.legacyArchive || {};
    x.legacyArchive[b.dataset.legacy] = x.legacyItems[b.dataset.legacy];
    delete x.legacyItems[b.dataset.legacy];
  }));
  const eaten = BF_ITEMS.filter((x) => items[x.id] && !x.legacy);
  const age = ageYears();
  const preview = !(s.profile && s.profile.birth);
  const need = preview ? dailyNeeds(7, 'male') : dailyNeeds(age, s.profile && s.profile.sex);
  if (!eaten.some((x) => !x.recordOnly) || !need || pending.length) {
    lastBf = null;
    if (!preview && !eaten.length && !pending.length && (s.bfScoreVersions || {})[t] === BF_SCORE_VERSION) { saveScore(null); renderWeek(); }
    const message = pending.length ? '묶음 기록의 음식을 확인하면 새 기준 점수를 보여드려요.'
      : !eaten.some((x) => !x.recordOnly) ? (eaten.length ? '김은 기록했어요. 함량 확인 전이라 점수 계산에서는 제외해요.' : '먹은 음식과 양을 고르면 결과가 바로 보여요.')
      : age == null ? '위에서 아이 생년월일을 입력하면 점수를 계산해요.'
      : '이 참고 점수는 만 1~18세 기준이에요. 수유·이유식이나 성인 식사는 같은 기준으로 계산하지 않아요.';
    $('bfFoodResult').innerHTML = `<p class="note">${message}</p>`;
    return;
  }
  const food = calcBf(items, {}, need, bf.amt);
  const combined = calcBf(items, supps, need, bf.amt);
  const { sum, rows, parts, targetProtein, targetFat, fatShare, fatLow, fatHigh } = combined;
  const foodScore = food.score, bfScore = combined.score, extraScore = bfScore - foodScore;
  const suppUsed = BF_SUPPS.filter((x) => supps[x.id]);
  const kTarget = need.kcal / 4;
  const ek = sum.c * 4 + sum.p * 4 + sum.f * 9 || 1;
  const pc = Math.round(sum.c * 4 / ek * 100), pp = Math.round(sum.p * 4 / ek * 100), pf = 100 - pc - pp;
  const action = nextMealAction(items, food, need);
  const incomplete = eaten.filter((x) => (x.unknown || []).length);
  const summary = sum.p >= targetProtein ? '기록한 음식의 단백질은 앱의 한 끼 기준에 도달했어요.' : '다음 끼니에 더할 음식 한 가지를 아래에서 확인해요.';
  const fatMessage = fatShare > fatHigh ? `지방 비중이 참고 범위(${fatLow * 100}~${fatHigh * 100}%)보다 높아 점수에 반영했어요.`
    : sum.f < targetFat ? '기록한 지방량이 앱의 한 끼 기준보다 적어요. 조리유 누락도 확인해요.'
    : '기록한 지방량·비중은 앱의 한 끼 참고 범위에 들어요.';
  $('bfFoodResult').innerHTML = `<div class="bfsum">${preview ? '<p class="preview-note">7세 남아 기준 미리보기 <button type="button" class="linkbtn" id="bfPreviewAge" title="아이 나이를 입력하면 맞춤 기준으로 바뀌어요">나이 입력</button></p>' : ''}<div class="food-score"><div class="food-score-label">음식으로 챙긴 점수</div><div class="food-score-value"><strong>${foodScore}</strong><span>점</span></div></div><p>${summary}</p><div class="row2">약 ${Math.round(sum.kcal)}kcal · 음식에서 단백질 ${sum.p.toFixed(1)}g</div></div>`;
  if (preview) $('bfPreviewAge').addEventListener('click', () => openProfile(false));
  $('bfSuppSection').hidden = false;
  $('bfResult').innerHTML = `
    <div class="supp-result" aria-live="polite">${suppUsed.length ? `<b>영양제 충족 가정 +${extraScore}점 → 함께 본 ${bfScore}점</b><p>음식 ${foodScore}점은 그대로예요.${extraScore === 0 ? ' 이미 기준에 도달했거나 점수에 포함하지 않는 성분이에요.' : ''}</p>` : '<span>영양제를 선택하면 가정한 추가점수를 보여드려요.</span>'}</div>
    <p class="step">오늘 기록한 아침 + 영양제</p>
    <div class="nutrient-key"><span><i class="food-fill"></i>음식</span><span><i class="supp-fill"></i>보충 가정</span><span><i class="gap-fill"></i>기준까지 남음</span></div>
    ${rows.map(renderNutrientBar).join('')}
    <p class="hint">하루 기준의 1/3을 비교한 막대예요. 회색은 영양결핍을 뜻하지 않아요.</p>
    <p class="omega-record">오메가3: ${items.fish ? '생선 기록 있음' : '생선 기록 없음'}${supps.omega ? ' · 영양제 기록 있음' : ''} <small>함량 미계산·점수 제외</small></p>
    <div class="next-meal"><b>다음 끼니에 한 가지만</b><p>${action}</p></div>
    <details class="meal-details"><summary>계산 기준·음식 분량 보기</summary>
      <p>2025 한국인 영양소 섭취기준의 연령·성별 참고치예요. 체중·활동량에 따른 개인 처방은 아니에요. 식사량은 하루 에너지의 1/4(80~120% 구간은 같은 점수), 영양소는 하루 기준의 1/3로 비교해요. 비타민 D는 충분섭취량을 참고하며 영양제 복용량 권고가 아니에요.</p>
      <p>음식 점수: ${food.parts.map((x) => `${x.name} ${x.points}/${x.max}`).join(' · ')}. 배점과 한 끼 환산은 앱 자체 규칙이며 의학적으로 검증된 척도가 아니에요.</p>
      <p>단백질 ${sum.p.toFixed(1)}g / 기준 ${targetProtein.toFixed(1)}g · 지방 ${sum.f.toFixed(1)}g / 기준 ${targetFat.toFixed(1)}g. ${fatMessage} 탄수화물 ${pc}% · 단백질 ${pp}% · 지방 ${pf}%.</p>
      <p>영양제는 등록된 성분이 이번 기준까지 채워진다고 가정해요. 실제 함량·먹은 양·중복 복용 안전성은 계산하지 않아요. 식사량·단백질·지방 점수는 음식으로만 계산해요.</p>
      <p>식품값은 대표값·추정치예요. 일반 두부 등은 추정치이며 멸치볶음도 조리법에 따라 달라요. 찐 밤고구마는 해당 품종·조리상태의 값이며 다른 고구마와 차이가 있어요. 조리유·목록에 없는 음식은 계산에서 빠질 수 있어요.</p>
      <ul>${eaten.map((x) => `<li>${BF_UNIT[x.id][0]} ${bfTapLabel(x.id, items[x.id])}${x.grams ? ` · 기준 ${x.grams}g당 영양값` : ''}${x.foodCode ? ` · <a href="${x.sourceUrl}" target="_blank" rel="noopener">식약처 ${x.foodCode}</a>` : x.fdcId ? ` · <a href="https://fdc.nal.usda.gov/food-details/${x.fdcId}/nutrients" target="_blank" rel="noopener">USDA ${x.fdcId}</a>` : x.recordOnly ? ' · 함량 미확인, 계산 제외' : ' · 기존 대표 추정값'}${bf.amt !== 1 ? ` · 전체 ${bf.amt}배 적용` : ''}</li>`).join('')}</ul>
      <p>한 끼 기록으로 하루 전체 섭취나 영양결핍을 판정하지 않아요.</p>
    </details>
    ${incomplete.length ? `<p class="note">${incomplete.map((x) => `${BF_UNIT[x.id][0]}의 ${(x.unknown || []).map((k) => BF_FIX[k].name).join('·')}`).join(', ')}는 자료 미확인으로 합산하지 않았어요. 실제 섭취량은 더 많을 수 있어요.</p>` : ''}
    <button class="btn ghost" id="bfShare" type="button">결과 카드 공유하기</button>`;
  lastBf = { preview, parts, sum, kTarget, pc, pp, pf, rows, bfScore, foodScore, extraScore, suppUsed: suppUsed.length > 0, action };
  if (!preview && ((s.bfLog || {})[t] !== bfScore || (s.bfScoreVersions || {})[t] !== BF_SCORE_VERSION)) { saveScore(bfScore); renderWeek(); }
  $('bfShare').addEventListener('click', shareBreakfast);
}

function saveScore(score) {
  update((x) => {
    x.bfLog = x.bfLog || {}; x.bfScoreVersions = x.bfScoreVersions || {};
    if (score == null) { delete x.bfLog[today()]; delete x.bfScoreVersions[today()]; }
    else { x.bfLog[today()] = score; x.bfScoreVersions[today()] = BF_SCORE_VERSION; }
  });
}
function renderWeek() {
  const s = load(), log = s.bfLog || {}, versions = s.bfScoreVersions || {};
  const days = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));
  const wd = ['일', '월', '화', '수', '목', '금', '토'];
  const vals = days.filter((d) => versions[d] === BF_SCORE_VERSION).map((d) => log[d]).filter((v) => v != null);
  const hasOld = days.some((d) => log[d] != null && versions[d] !== BF_SCORE_VERSION);
  const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  $('week').innerHTML = `<div class="weekbars">${days.map((d) => {
    const v = log[d], old = v != null && versions[d] !== BF_SCORE_VERSION;
    return `<div class="wb${d === today() ? ' now' : ''}"><div class="col"><i style="height:${v != null ? Math.max(6, v) : 0}%"></i></div><b>${v != null ? v + (old ? '*' : '') : '-'}</b><span>${wd[new Date(d).getDay()]}</span></div>`;
  }).join('')}</div><p class="hint" style="text-align:center">${avg != null ? `최근 7일 함께 본 참고 평균 <b>${avg}점</b> · ${vals.length}일 기록` : '같은 기준 점수가 쌓이면 평균을 보여드려요.'}<br>영양제는 충족 가정 반영${hasOld ? '<br>* 이전 기준 기록 · 현재 평균에서 제외' : ''}</p>`;
}

function refresh() {
  renderKids();
  renderProfile();
  renderBreakfast();
  renderNutri();
  renderWeek();
}

// 참고 메뉴는 읽기 전용. 레시피의 실제 분량 없이 섭취량을 추정하지 않는다.
function initMenuIdeas() {
  const select = $('bfMenuIdea');
  select.innerHTML = ['7일 식단', '간편 아침'].map((group) => `<optgroup label="${group}">${BF_MENU_IDEAS.map((menu, index) => menu.group === group ? `<option value="${index}">${menu.name}</option>` : '').join('')}</optgroup>`).join('');
  const show = () => {
    const menu = BF_MENU_IDEAS[Number(select.value)];
    $('bfMenuPoint').innerHTML = `<p><b>${menu.meal}</b></p><p><b>영양·성장 포인트</b><br>${menu.point}</p>`;
  };
  select.addEventListener('change', show);
  show();
}

// ---- init ----
(function init() {
  initMenuIdeas();
  renderPromo($('promoAd'));
  const t = TIPS[Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000) % TIPS.length];
  $('tipEmo').textContent = t[0]; $('tipText').textContent = t[1];
  saveAll(loadAll()); // 성장 앱 아이 정보 가져오기
  $('srcOpen').addEventListener('click', () => {
    $('srcList').innerHTML = SOURCES.map((x) => `<li><div class="emo">📘</div><div><b>${x.url ? `<a href="${x.url}" target="_blank" rel="noopener noreferrer">${x.t}</a>` : x.t}</b><span>${x.d}</span></div></li>`).join('');
    $('srcModal').hidden = false;
  });
  refresh();
})();
