// 두 앱(성장 · 아침밥)이 함께 쓰는 기능: 공구 안내, 저장 안내·보관 요청, 기록 백업·복원.
// meal/shared.js는 이 파일의 복사본이다. 수정하면 두 곳 모두 바꿔야 한다.

// ---- 공구 안내 (광고) ----
const PROMO = {
  name: '파파 칼마디 부스터 K2',
  tagline: '칼슘 · 마그네슘 · 비타민 D · 비타민 K2',
  url: 'https://www.instagram.com/zzin__yaksa/', // 공구 링크가 정해지면 바꾼다
  points: [
    ['🦴', '칼슘', '뼈와 치아 형성에 필요'],
    ['☀️', '비타민 D', '칼슘과 인의 흡수·이용에 필요, 뼈의 형성과 유지에 필요'],
    ['🌰', '마그네슘', '에너지 이용, 신경과 근육 기능 유지에 필요'],
    ['🥬', '비타민 K', '뼈의 구성에 필요'],
  ],
};
function renderPromo(el) {
  if (!el) return;
  el.innerHTML = `<div class="ad">광고 · 약사아빠 공동구매</div>
    <div class="pname">${PROMO.name}</div>
    <div class="ptag">${PROMO.tagline}</div>
    <p class="pdesc">『자란다』가 "뼈 성장의 세 기둥"으로 꼽은 칼슘·비타민 D·마그네슘에, 칼슘을 뼈에 붙여 주는 비타민 K까지 한 번에 챙겨요.</p>
    <ul class="list">${PROMO.points.map(([e, n, d]) => `<li><div class="emo">${e}</div><div><b>${n}</b><span>${d}</span></div></li>`).join('')}</ul>
    <a class="btn" href="${PROMO.url}" target="_blank" rel="noopener">공구 보러 가기</a>
    <p class="fine">찐약사가 판매에 참여하는 공동구매 제품이에요. 건강기능식품은 질병의 예방·치료를 위한 의약품이 아니며, 키 성장을 보장하지 않아요. 음식이 먼저이고, 부족한 부분을 채우는 용도로 드세요.</p>`;
}

// ---- 저장: 이 휴대폰에만, 브라우저에 오래 보관 요청 ----
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch {}

// ---- 기록 백업·복원 (두 앱 기록을 한꺼번에) ----
const BACKUP_KEYS = ['zzin-growth-v1', 'zzin-meal-v1'];
function makeBackup() {
  const data = {};
  BACKUP_KEYS.forEach((k) => { try { const v = localStorage.getItem(k); if (v) data[k] = JSON.parse(v); } catch {} });
  return 'ZZIN1:' + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}
function restoreBackup(code) {
  const raw = String(code || '').trim().replace(/^ZZIN1:/, '');
  const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
  let n = 0;
  BACKUP_KEYS.forEach((k) => { if (data[k]) { localStorage.setItem(k, JSON.stringify(data[k])); n++; } });
  if (!n) throw new Error('empty');
}
function initBackup() {
  const open = document.getElementById('backupOpen');
  if (!open) return;
  open.addEventListener('click', () => {
    document.getElementById('backupCode').value = makeBackup();
    document.getElementById('backupMsg').textContent = '';
    document.getElementById('backupModal').hidden = false;
  });
  document.getElementById('backupCopy').addEventListener('click', async () => {
    const ta = document.getElementById('backupCode');
    try { await navigator.clipboard.writeText(ta.value); } catch { ta.select(); document.execCommand('copy'); }
    document.getElementById('backupMsg').textContent = '복사했어요. 메모장이나 카톡 나에게 보내기에 붙여넣어 보관하세요.';
  });
  document.getElementById('backupRestore').addEventListener('click', () => {
    const code = document.getElementById('restoreCode').value;
    try {
      restoreBackup(code);
      document.getElementById('backupMsg').textContent = '복원했어요! 화면을 새로 불러올게요.';
      setTimeout(() => location.reload(), 800);
    } catch {
      document.getElementById('backupMsg').textContent = '코드를 확인해 주세요. 복사한 코드 전체를 붙여넣어야 해요.';
    }
  });
}
initBackup();
