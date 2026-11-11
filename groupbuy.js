// 찐약사 공동구매 일정. 공구가 잡히면 여기에 한 줄씩 추가한다.
// id: 제품 (nutrition.js의 PRODUCTS 키: calmadi, iron, omega, probiotic, vitd, vitc)
// start·end: 공구 기간 (YYYY-MM-DD, 끝나는 날 포함)
// link: 공구 페이지 주소 (선택. 있으면 진행 중일 때 '공구 참여하기' 버튼이 생긴다)
// 예) { id: 'calmadi', start: '2026-11-17', end: '2026-11-21', link: '' },
const GROUPBUY = [
  // 찐약사 온보드 '공구 탭' 기준 (2026-11-06 확인). 앱에 있는 제품만 넣는다
  { id: 'immune', start: '2026-11-02', end: '2026-11-08', link: 'https://papas-promise.com/surl/P/81' }, // 이뮨파파 2차
  { id: 'omega', start: '2026-11-12', end: '2026-11-18', link: '' },     // 뮴 오메가3 키즈
  { id: 'calmadi', start: '2026-11-16', end: '2026-11-22', link: 'https://papas-promise.com/surl/P/88' }, // 파파칼마디 2차
  { id: 'probiotic', start: '2026-12-07', end: '2026-12-13', link: '' }, // 황금비책 트리플 유산균
  { id: 'iron', start: '2026-12-15', end: '2026-12-21', link: '' },      // 오늘온 철분제 2차
  { id: 'nutrione', start: '2026-12-28', end: '2027-01-03', link: '' },  // 뉴트원 칼마디
];
