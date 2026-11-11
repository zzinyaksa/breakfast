// 아침밥 점수·영양 체크 데이터.
// 식품 안내는 『자란다 — 우리 아이 건강한 성장의 모든 것』 4장을 바탕으로 정리했다.
const BOOK = '『자란다』';

// 영양 체크: 잘 안 먹는 음식과 부족 신호로 필요한 영양소를 추정한다 (가중치는 「자란다」 4장 식품·결핍 증상 기준)
const FOODS = [
  { id: 'dairy', emo: '🥛', name: '우유·치즈·요거트', n: { ca: 2, protein: 1, d: 0.5 } },
  { id: 'meat', emo: '🥩', name: '소고기·돼지고기', n: { iron: 2, zinc: 2, protein: 1 } },
  { id: 'chicken', emo: '🍗', name: '닭고기', n: { protein: 1, zinc: 0.5 } },
  { id: 'fish', emo: '🐟', name: '생선 (연어·고등어)', n: { omega: 2, d: 1, protein: 0.5 } },
  { id: 'egg', emo: '🥚', name: '달걀', n: { protein: 1, d: 0.5, vita: 0.5 } },
  { id: 'tofu', emo: '🫘', name: '두부·콩', n: { protein: 0.5, ca: 0.5, mg: 0.5, iron: 0.5 } },
  { id: 'anchovy', emo: '🐠', name: '멸치·뼈째 먹는 생선', n: { ca: 1 } },
  { id: 'green', emo: '🥬', name: '녹색 채소 (시금치·브로콜리)', n: { mg: 1, vitk: 2, iron: 0.5 } },
  { id: 'orange', emo: '🥕', name: '당근·호박·고구마', n: { vita: 2 } },
  { id: 'fruit', emo: '🍊', name: '과일 (귤·키위·딸기)', n: { vitc: 2 } },
  { id: 'nuts', emo: '🥜', name: '견과류·잡곡', n: { mg: 1.5, zinc: 0.5 } },
];
const SIGNS = [
  { id: 'pale', name: '얼굴이 창백해요', n: { iron: 2 } },
  { id: 'tired', name: '쉽게 지치고 기운이 없어요', n: { iron: 1.5, mg: 0.5, d: 0.5 } },
  { id: 'ice', name: '얼음을 자꾸 씹어 먹어요', n: { iron: 3 } },
  { id: 'breath', name: '조금만 뛰어도 숨차해요', n: { iron: 1.5 } },
  { id: 'focus', name: '집중을 잘 못해요', n: { iron: 1, mg: 1 } },
  { id: 'noappetite', name: '입맛이 없고 적게 먹어요', n: { zinc: 2 } },
  { id: 'taste', name: '음식이 맛없다고 해요', n: { zinc: 2 } },
  { id: 'cold', name: '감기에 자주 걸려요', n: { zinc: 1, d: 1, vita: 1, vitc: 1 } },
  { id: 'wound', name: '상처가 잘 안 나아요', n: { zinc: 1.5, vitc: 1 } },
  { id: 'legpain', name: '밤에 다리가 아프다고 해요', n: { d: 2 } },
  { id: 'cramp', name: '다리에 쥐가 자주 나요', n: { ca: 1.5, mg: 1.5 } },
  { id: 'sleep', name: '잠을 설치고 예민해요', n: { mg: 1.5, d: 0.5 } },
  { id: 'dark', name: '어두운 곳에서 잘 못 봐요', n: { vita: 2.5 } },
  { id: 'indoor', name: '햇볕 쬐는 시간이 적어요', n: { d: 2 } },
];
const NUTRIENTS = {
  d: { emo: '☀️', name: '비타민 D', base: 1, role: '칼슘 흡수의 열쇠 · 면역', food: '연어·고등어, 달걀노른자', supp: "거의 모든 아이에게 권장 · 1~18세 하루 600IU, D3(콜레칼시페롤)로", ch: '4-1' },
  ca: { emo: '🦴', name: '칼슘', role: '뼈의 재료', food: '우유·요거트·치즈, 멸치·뱅어포, 두부', supp: '유제품을 거의 안 먹을 때만 · 한 번에 500mg 이하', ch: '4-1' },
  iron: { emo: '🩸', name: '철분', role: '산소 운반 · 에너지', food: '소고기·간·굴·조개 + 귤·키위(비타민 C와 함께)', supp: '어린이 철분 영양제(하루 6~12mg)는 괜찮아요 · 칼슘과 2시간 띄우기 · 빈혈이 의심되면 검사 후 처방', ch: '4-3' },
  zinc: { emo: '⚡', name: '아연', role: '성장호르몬 파트너 · 식욕 · 면역', food: '굴, 소고기, 닭고기, 달걀, 치즈, 호박씨', supp: '식욕 저하·성장 지연 때 고려 · 철분과 2시간 띄우기', ch: '4-3' },
  mg: { emo: '🌰', name: '마그네슘', role: '비타민 D 활성화 · 근육 이완 · 숙면', food: '호박씨·아몬드, 현미·귀리, 바나나, 시금치', supp: '보통 음식으로 충분 · 자기 전 칼슘과 함께', ch: '4-1' },
  protein: { emo: '💪', name: '단백질', role: '성장호르몬·근육·뼈·성장판의 재료', food: '달걀, 고기, 생선, 두부, 우유 (매 끼니 1가지)', supp: '보통 음식으로 충분 · 보충제는 극심한 편식일 때만 상담 후', ch: '4-2' },
  omega: { emo: '🐟', name: '오메가-3', role: '생선에서 주로 얻는 지방산', food: '연어·고등어, 호두, 아마씨유', supp: '생선을 거부하면 고려', ch: '4-3 · 4-4' },
  vita: { emo: '🥕', name: '비타민 A', role: '뼈 성장 · 면역("항감염 비타민") · 시력', food: '당근·고구마·호박, 시금치, 달걀노른자', supp: '음식으로 · 고용량 레티놀 보충제는 피하기', ch: '4-3' },
  vitc: { emo: '🍊', name: '비타민 C', role: '콜라겐(뼈의 철근) · 철분 흡수 2~3배 · 면역', food: '키위, 딸기, 귤, 빨간 파프리카, 브로콜리 (생으로)', supp: '과일·채소로 충분', ch: '4-3' },
  vitk: { emo: '🥬', name: '비타민 K', role: '칼슘을 뼈에 붙이는 접착제', food: '시금치, 케일, 브로콜리 (기름과 함께)', supp: '녹색 채소로 충분', ch: '4-3' },
};

// ---- 아침밥 체크 ----
// 아이 1회 분량 기준 대략적인 영양 성분. 「자란다」 4장에 나온 수치(달걀·우유·치즈·두부·멸치·고등어 등)를 우선 쓰고,
// 나머지는 일반 식품 성분표의 대략치다. kcal·탄수(c)·단백(p)·지방(f) g, ca·fe·zn·mg mg, d IU, vc mg, va μgRAE, om(오메가-3 식품 여부)
const BF_ITEMS = [
  { id: 'rice', emo: '🍚', name: '흰쌀밥 반 공기', kcal: 150, c: 33, p: 3, f: 0.3, ca: 4, fe: 0.2, zn: 0.6, mg: 10 },
  { id: 'grain', emo: '🍙', name: '잡곡밥 반 공기', kcal: 150, c: 32, p: 3.5, f: 1, ca: 8, fe: 0.6, zn: 0.9, mg: 40 },
  { id: 'bread', emo: '🍞', name: '빵·토스트 1쪽', kcal: 80, c: 15, p: 2.5, f: 1, ca: 20, fe: 0.5, zn: 0.3, mg: 8 },
  { id: 'cereal', emo: '🥣', name: '시리얼 (우유 제외)', kcal: 115, c: 25, p: 2, f: 1, ca: 10, fe: 3, zn: 1, mg: 10 },
  { id: 'potato', legacy: true, emo: '🍠', name: '고구마·감자 반 개', kcal: 65, c: 15, p: 1, f: 0.1, ca: 20, fe: 0.4, zn: 0.2, mg: 15, va: 400, vc: 10 },
  { id: 'egg', emo: '🥚', name: '달걀 1개', kcal: 75, c: 0.5, p: 6, f: 5, ca: 25, fe: 0.9, zn: 0.6, mg: 6, d: 45, va: 80 },
  { id: 'milk', emo: '🥛', name: '우유 1컵 (200mL)', kcal: 130, c: 10, p: 6.4, f: 7, ca: 220, fe: 0.1, zn: 0.8, mg: 20, va: 60 },
  { id: 'yogurt', emo: '🍶', name: '요거트 1개', kcal: 100, c: 14, p: 5, f: 3, ca: 180, zn: 0.6, mg: 15 },
  { id: 'cheese', emo: '🧀', name: '치즈 1장', kcal: 60, c: 0.5, p: 4, f: 4.5, ca: 140, zn: 0.6, va: 50 },
  { id: 'tofu', legacy: true, emo: '🫘', name: '두부 1/4모·콩', kcal: 60, c: 1.5, p: 6, f: 3.5, ca: 110, fe: 1, zn: 0.6, mg: 25 },
  { id: 'meat', emo: '🍖', name: '고기 반찬 (불고기 등)', kcal: 110, c: 3, p: 10, f: 7, ca: 5, fe: 1.2, zn: 2.5, mg: 12 },
  { id: 'ham', emo: '🌭', name: '햄·소시지', kcal: 80, c: 1, p: 4, f: 7, ca: 5, fe: 0.3, zn: 0.5, mg: 5, warn: '햄·소시지는 제품별 나트륨 표시도 살펴보세요' },
  { id: 'fish', emo: '🐟', name: '생선구이 (고등어 등)', kcal: 100, c: 0, p: 10, f: 6, ca: 10, fe: 0.6, zn: 0.4, mg: 15, d: 200, om: 1 },
  { id: 'anchovy', legacy: true, emo: '🐠', name: '멸치볶음·김', kcal: 40, c: 2, p: 5, f: 1, ca: 200, fe: 0.4, zn: 0.3, mg: 20 },
  { id: 'veg', emo: '🥦', name: '채소 반찬·나물', kcal: 20, c: 3, p: 1, f: 1, ca: 30, fe: 0.8, zn: 0.2, mg: 30, va: 200, vc: 15 },
  { id: 'fruitc', emo: '🍊', name: '귤·키위·딸기', kcal: 45, c: 11, p: 0.6, f: 0.2, ca: 20, fe: 0.2, mg: 10, vc: 60 },
  { id: 'banana', emo: '🍌', name: '바나나·사과', kcal: 80, c: 20, p: 0.8, f: 0.2, ca: 5, fe: 0.2, zn: 0.1, mg: 25, vc: 7 },
  { id: 'juice', emo: '🧃', name: '주스 1컵', kcal: 90, c: 22, p: 0.5, f: 0, ca: 15, vc: 40, warn: '주스 대신 씹어 먹는 과일도 곁들여 보세요' },
  { id: 'nuts', legacy: true, emo: '🥜', name: '견과류 한 줌·땅콩버터', kcal: 120, c: 4, p: 4, f: 10, ca: 20, fe: 0.7, zn: 0.6, mg: 50, om: 0.5 },
  { id: 'soup', emo: '🍲', name: '국·찌개 (건더기)', kcal: 50, c: 4, p: 3, f: 2, ca: 20, fe: 0.5, zn: 0.4, mg: 10, vc: 3 },
];

// 새 식품은 명시한 조리상태/분량만 대표한다. USDA 수치는 국내 품종·제품 전체를 대표하지 않는다.
BF_ITEMS.push(...[
  {
    "id": "boiled_potato",
    "emo": "🥔",
    "name": "삶은 감자",
    "grams": 75,
    "fdcId": 170440,
    "sourceName": "Potatoes, boiled, cooked without skin, flesh, without salt",
    "c": 15.0,
    "va": 0.0,
    "kcal": 64.5,
    "d": 0.0,
    "f": 0.075,
    "ca": 6.0,
    "zn": 0.203,
    "p": 1.282,
    "fe": 0.233,
    "mg": 15.0,
    "vc": 5.55
  },
{
  "id": "steamed_sweet",
  "emo": "🍠",
  "name": "찐 밤고구마",
  "grams": 75,
  "foodCode": "R102-006150049-0000",
  "sourceUrl": "https://various.foodsafetykorea.go.kr/nutrient/general/food/detail.do?dbGrpCm=A&searchFoodCd=R102-006150049-0000&searchRegionCd=ZZ&searchMonthCd=AVG",
  "derived": "비타민 A는 레티놀0 + 베타카로틴37/12 μgRAE/100g 환산",
  "kcal": 126.75,
  "c": 30.675,
  "p": 0.8025,
  "f": 0.1125,
  "ca": 12.75,
  "fe": 0.315,
  "zn": 0.18,
  "mg": 16.5,
  "vc": 11.52,
  "d": 0.0,
  "va": 2.3125
},
  {
    "id": "soybeans",
    "emo": "🫘",
    "name": "삶은 대두",
    "grams": 30,
    "fdcId": 174271,
    "sourceName": "Soybeans, mature cooked, boiled, without salt",
    "d": 0.0,
    "va": 0.0,
    "c": 2.508,
    "kcal": 51.6,
    "p": 5.46,
    "f": 2.691,
    "ca": 30.6,
    "zn": 0.345,
    "vc": 0.51,
    "fe": 1.542,
    "mg": 25.8
  },
  {
    "id": "almonds",
    "emo": "🥜",
    "name": "아몬드",
    "grams": 15,
    "fdcId": 170567,
    "sourceName": "Nuts, almonds",
    "d": 0.0,
    "p": 3.18,
    "fe": 0.556,
    "mg": 40.5,
    "f": 7.485,
    "c": 3.24,
    "kcal": 86.85,
    "ca": 40.35,
    "zn": 0.468,
    "vc": 0.0,
    "va": 0.0
  },
  {
    "id": "peanutbutter",
    "emo": "🥜",
    "name": "땅콩버터(무염)",
    "grams": 15,
    "fdcId": 172470,
    "sourceName": "Peanut butter, smooth style, without salt",
    "d": 0.0,
    "va": 0.0,
    "vc": 0.0,
    "p": 3.33,
    "fe": 0.261,
    "mg": 25.2,
    "ca": 7.35,
    "zn": 0.377,
    "f": 7.71,
    "c": 3.345,
    "kcal": 89.7
  },

  {
    "id": "plain_tofu",
    "emo": "🫘",
    "name": "일반 두부(추정)",
    "grams": 75,
    "kcal": 60,
    "c": 1.5,
    "p": 6,
    "f": 3.5,
    "ca": 110,
    "fe": 1,
    "zn": 0.6,
    "mg": 25,
    "estimate": true
  },
{
  "id": "anchovy_stir",
  "emo": "🐠",
  "name": "멸치볶음",
  "grams": 15,
  "foodCode": "D110-472000000-0001",
  "sourceUrl": "https://various.foodsafetykorea.go.kr/nutrient/general/food/detail.do?dbGrpCm=A&searchFoodCd=D110-472000000-0001&searchRegionCd=ZZ&searchMonthCd=AVG",
  "kcal": 41.4,
  "c": 2.043,
  "f": 1.062,
  "p": 5.916,
  "ca": 157.65,
  "fe": 1.449,
  "zn": 0.645,
  "mg": 44.907,
  "va": 4.65,
  "vc": 0.54,
  "d": 12.12
},
{
  "id": "laver",
  "emo": "🌿",
  "name": "마른김",
  "grams": 2,
  "foodCode": "R212-813010102-0001",
  "sourceUrl": "https://various.foodsafetykorea.go.kr/nutrient/general/food/detail.do?dbGrpCm=R&searchFoodCd=R212-813010102-0001&searchRegionCd=ZZ&searchMonthCd=AVG",
  "unknown": [
    "va",
    "vc",
    "d"
  ],
  "kcal": 3.46,
  "c": 0.9698,
  "p": 0.737,
  "f": 0.0112,
  "ca": 5.42,
  "fe": 0.297,
  "zn": 0.0906,
  "mg": 9.24
}
]);
const BF_LEGACY_IDS = ['potato', 'tofu', 'anchovy', 'nuts'];

// 2025 KDRI 정오표 적용 국문요약본 xi–xx, 2026-11-03 대조.
// 1–18세. kcal=필요추정량, D=충분섭취량(μg×40→IU), 나머지=권장섭취량.
// 개인의 체중/활동량에 따른 필요량 진단이 아닌 연령·성별 참고치다.
const KDRI_2025 = {
  male: {
    kcal: [900, 1400, 1700, 2000, 2500, 2700], p: [20, 25, 35, 50, 60, 65],
    ca: [450, 550, 700, 800, 950, 800], fe: [6, 6, 7, 8, 11, 11],
    zn: [3, 4, 5, 8, 8, 10], mg: [70, 110, 150, 220, 320, 410],
    va: [250, 300, 450, 600, 750, 850], vc: [40, 45, 50, 70, 90, 100], d: [200, 200, 200, 200, 400, 400],
  },
  female: {
    kcal: [900, 1400, 1500, 1800, 2000, 2000], p: [20, 25, 35, 45, 55, 55],
    ca: [450, 550, 700, 800, 850, 700], fe: [6, 6, 7, 8, 13, 12],
    zn: [3, 4, 5, 8, 8, 9], mg: [70, 110, 150, 220, 290, 340],
    va: [250, 300, 400, 550, 650, 650], vc: [40, 45, 50, 70, 90, 100], d: [200, 200, 200, 200, 400, 400],
  },
};
function dailyNeeds(age, sex) {
  if (!Number.isFinite(age) || age < 1 || age >= 19) return null;
  const band = age < 3 ? 0 : age < 6 ? 1 : age < 9 ? 2 : age < 12 ? 3 : age < 15 ? 4 : 5;
  const values = KDRI_2025[sex === 'female' ? 'female' : 'male'];
  return { ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v[band]])), fatRange: age < 3 ? [0.20, 0.35] : [0.15, 0.30] };
}

// 부족할 때 점심·저녁에 채울 음식 (「자란다」 4장)
const BF_FIX = {
  p: { name: '단백질', emo: '💪', food: '고기·생선·달걀·두부 중 한 가지를 매 끼니', supp: '' },
  ca: { name: '칼슘', emo: '🦴', food: '우유·요거트·치즈 간식, 멸치볶음, 두부', supp: '유제품을 거의 안 먹으면 칼슘제(+비타민 D)' },
  fe: { name: '철분', emo: '🩸', food: '소고기·간·굴·조개 + 귤·키위로 비타민 C 함께', supp: '어린이 철분 영양제(하루 6~12mg) 고려 · 빈혈이 의심되면 검사 후 처방' },
  zn: { name: '아연', emo: '⚡', food: '소고기, 굴, 닭고기, 달걀, 치즈, 호박씨', supp: '입맛이 없고 잘 안 먹는다면 아연 고려' },
  mg: { name: '마그네슘', emo: '🌰', food: '잡곡밥·현미, 견과류, 바나나, 시금치', supp: '보통 음식으로 충분해요' },
  va: { name: '비타민 A', emo: '🥕', food: '당근·고구마·호박, 시금치, 달걀노른자', supp: '음식으로 채워 주세요(고용량 보충제는 피하기)' },
  vc: { name: '비타민 C', emo: '🍊', food: '키위·딸기·귤, 빨간 파프리카, 브로콜리 (생으로)', supp: '과일·채소로 충분해요' },
  d: { name: '비타민 D', emo: '☀️', food: '연어·고등어, 달걀노른자, 햇볕 10~15분', supp: '음식만으론 어려워 거의 모든 아이에게 D3 600IU 권장' },
  om: { name: '오메가-3', emo: '🐟', food: '연어·고등어 주 2~3번, 호두', supp: '생선을 안 먹는다면 오메가-3' },
};

const SOURCES = [
  { t: '『자란다 — 우리 아이 건강한 성장의 모든 것』', d: '부족 신호·식품·권장량·영양제 안내의 기준 자료' },
  { t: '보건복지부·한국영양학회 「2025 한국인 영양소 섭취기준」', d: '정오표 적용 국문요약본 xi–xx. 1~18세 연령·성별 에너지·단백질·지방비율·비타민·무기질 표를 대조했어요. 비타민 D는 충분섭취량이며 영양제 권장 복용량이 아닙니다.', url: 'https://www.kns.or.kr/fileroom/fileroom_view.asp?BoardID=Kdr&idx=167' },
  { t: '앱의 참고 점수', d: '식사량25·단백질30·지방15·비타민/미네랄30점과 아침 환산은 자체 규칙이며 의학적으로 검증된 척도가 아닙니다. 오메가3 선택 여부는 점수에 포함하지 않아요.' },
  { t: '식품 영양 성분', d: '책에 나온 수치를 우선 쓰고, 나머지는 일반 식품 성분표 기준 대략치' },
];

// 아침밥 화면 분류와 단위 (이름은 짧게, 분량은 단위로 보여 준다)
const BF_CATS = [
  { emo: '🍚', name: '밥·빵', ids: ['rice', 'grain', 'bread', 'cereal', 'boiled_potato', 'steamed_sweet'] },
  { emo: '🥚', name: '단백질 반찬', ids: ['egg', 'meat', 'fish', 'plain_tofu', 'soybeans', 'ham'] },
  { emo: '🥛', name: '우유·유제품', ids: ['milk', 'yogurt', 'cheese'] },
  { emo: '🥦', name: '채소·국·반찬', ids: ['veg', 'anchovy_stir', 'laver', 'soup'] },
  { emo: '🍎', name: '과일·간식', ids: ['fruitc', 'banana', 'almonds', 'peanutbutter', 'juice'] },
];
const BF_UNIT = {
  rice: ['흰쌀밥', '반 공기'], grain: ['잡곡밥', '반 공기'], bread: ['빵·토스트', '1쪽'], cereal: ['시리얼', '1그릇'], potato: ['고구마·감자', '반 개'],
  egg: ['달걀', '1개'], meat: ['고기 반찬', '1접시'], fish: ['생선구이', '반 토막'], tofu: ['두부·콩', '1/4모'], ham: ['햄·소시지', '1접시'],
  milk: ['우유', '1컵'], yogurt: ['요거트', '1개'], cheese: ['치즈', '1장'],
  veg: ['채소 반찬·나물', '1접시'], anchovy: ['멸치볶음·김', '1접시'], soup: ['국·찌개', '1그릇'],
  fruitc: ['귤·키위·딸기', '1개 분량'], banana: ['바나나·사과', '1개'], nuts: ['견과류·땅콩버터', '한 줌'], juice: ['주스', '1컵'],
};

// 해당 영양소를 충족한다고 가정하는 시뮬레이션. 실제 함량/복용량 검증 결과가 아니다.
const BF_SUPPS = [
  { id: 'calmadi', emo: '🦴', name: '파파 칼마디 부스터 K2', fills: ['ca', 'mg', 'd'], promo: true },
  { id: 'd', emo: '☀️', name: '비타민 D', fills: ['d'] },
  { id: 'multi', emo: '💊', name: '종합비타민', fills: ['va', 'vc', 'd', 'zn'] },
  { id: 'ca', emo: '🥛', name: '칼슘', fills: ['ca'] },
  { id: 'iron', emo: '🩸', name: '철분', fills: ['fe'] },
  { id: 'zinc', emo: '⚡', name: '아연', fills: ['zn'] },
  { id: 'omega', emo: '🐟', name: '오메가-3', fills: ['om'] },
];

// 내일 아침 추천에서 쓰는 바꾸기 후보
const BF_SWAPS = [['rice', 'grain'], ['juice', 'fruitc'], ['ham', 'egg'], ['bread', 'grain']];
const BF_NO_ADD = ['juice', 'ham'];

// 각 칩을 누를 때 더할 양: [기존 영양표 기준 배수, 실제 분량, 표시 단위].
// 이름으로 증가, 분량으로 감소하며 0에서 해제한다. 영양 성분값은 변경하지 않는다.
const BF_TAP = {
  rice: [1, .5, '공기'], grain: [1, .5, '공기'], bread: [.5, .5, '쪽'], cereal: [.5, .5, '그릇'],
  potato: [1, .5, '개'], egg: [.5, .5, '개'], milk: [.5, .5, '컵'], yogurt: [.5, .5, '개'],
  cheese: [.5, .5, '장'], tofu: [1, .25, '모'], meat: [.5, .5, '접시'], ham: [.5, .5, '접시'],
  fish: [1, .5, '토막'], anchovy: [.5, .5, '접시'], veg: [.5, .5, '접시'],
  fruitc: [.5, .5, '개 분량'], banana: [.5, .5, '개'], juice: [.5, .5, '컵'], nuts: [.5, .5, '줌'], soup: [.5, .5, '그릇'],
};
Object.assign(BF_UNIT, {
  boiled_potato: ['삶은 감자', '75g'], steamed_sweet: ['찐 밤고구마', '75g'],
  plain_tofu: ['일반 두부', '75g'], soybeans: ['삶은 대두', '30g'],
  almonds: ['아몬드', '15g'], peanutbutter: ['땅콩버터', '15g'], anchovy_stir: ['멸치볶음', '15g'], laver: ['마른김', '2g'],
});
Object.assign(BF_TAP, {
  boiled_potato: [1,75,'g'], steamed_sweet: [1,75,'g'], plain_tofu: [1,75,'g'],
  soybeans: [1,30,'g'], almonds: [1,15,'g'], peanutbutter: [1,15,'g'], anchovy_stir: [1,15,'g'], laver: [1,2,'g'],
});
function bfTapLabel(id, qty) {
  const [step, amount, unit] = BF_TAP[id];
  const n = Math.round(qty / step * amount * 1000) / 1000;
  return n === .5 ? `반 ${unit}` : n === .25 ? `1/4${unit}` : `${n}${unit}`;
}
function nextBfQuantity(id, qty) {
  const step = BF_TAP[id][0];
  return qty + step;
}

// 앱 자체의 참고용 배점. 임상적으로 검증된 식사 점수 척도가 아니다.
const BF_SCORE_WEIGHTS = { energy: 25, protein: 30, fat: 15, nutrients: 30 };


// 마미약사 공개 식단을 메뉴 아이디어로 재구성. 레시피별 함량/분량이 없어 점수에 자동 입력하지 않는다.
const BF_MENU_IDEAS = [
  { group: '7일 식단', name: '월 · 계란말이와 잡곡밥', meal: '계란말이 + 잡곡밥 + 미역국 + 두유', point: '달걀과 콩으로 단백질 식품을 곁들이는 구성. 두유의 단백질·칼슘 함량은 제품 표시를 확인해요.' },
  { group: '7일 식단', name: '화 · 요거트볼과 삶은 달걀', meal: '그릭요거트 + 그래놀라 + 블루베리 + 삶은 달걀', point: '곡류·과일에 달걀과 유제품을 함께 먹는 구성. 요거트는 제품별 단백질·당류 차이를 확인해요.' },
  { group: '7일 식단', name: '수 · 두부계란덮밥', meal: '밥 + 두부 + 달걀 + 구운 김', point: '두부와 달걀로 단백질 식품을 다양하게 먹어요. 김을 멸치볶음과 같은 칼슘 함량으로 계산하지 않아요.' },
  { group: '7일 식단', name: '목 · 치즈토스트', meal: '치즈토스트 + 우유 + 바나나', point: '치즈와 우유는 단백질·칼슘을, 빵과 과일은 에너지를 보태는 구성.' },
  { group: '7일 식단', name: '금 · 닭고기 주먹밥', meal: '닭가슴살 또는 닭안심 주먹밥 + 된장국', point: '밥 속에 닭고기를 넣어 단백질을 함께 챙겨요. 국은 국물보다 건더기 위주로 곁들여요.' },
  { group: '7일 식단', name: '토 · 소고기미역국 아침', meal: '소고기미역국 + 밥 + 달걀프라이', point: '소고기는 단백질과 철분을 보태요. 국 속 실제 고기 양과 조리용 기름에 따라 영양량이 달라져요.' },
  { group: '7일 식단', name: '일 · 생선구이 아침', meal: '연어 또는 고등어구이 + 밥 + 계란국', point: '생선과 달걀로 단백질을 챙기고, 연어·고등어로 오메가-3 지방산을 보태요.' },
  { group: '간편 아침', name: '삶은 달걀과 우유', meal: '삶은 달걀 + 우유', point: '준비하기 쉬운 단백질 식품 조합. 식사량이 적다면 밥·빵이나 과일을 함께 살펴보세요.' },
  { group: '간편 아침', name: '두유·바나나·견과', meal: '두유 + 바나나 + 견과류', point: '두유의 단백질, 견과의 지방을 함께 챙기는 구성. 견과는 아이가 안전하게 씹을 수 있는 형태로 준비해요.' },
  { group: '간편 아침', name: '요거트와 시리얼', meal: '그릭요거트 + 시리얼', point: '시리얼에 요거트를 곁들이는 구성. 원문의 꿀은 필수 재료가 아니며, 제품의 당류를 함께 확인해요.' },
  { group: '간편 아침', name: '치즈·크래커·우유', meal: '치즈 + 통밀 크래커 + 우유', point: '유제품으로 단백질·칼슘을 보태요. 치즈와 크래커의 나트륨도 제품 표시로 확인해요.' },
  { group: '간편 아침', name: '미숫가루 쉐이크', meal: '미숫가루 + 우유 또는 두유', point: '마시는 형태로 곡류와 단백질 식품을 함께 먹어요. 두유는 우유와 칼슘 함량이 같다고 가정하지 않아요.' },
  { group: '간편 아침', name: '연두부와 밥', meal: '연두부 + 밥 + 간장 조금', point: '부드러운 두부로 단백질을 곁들여요. 일반 두부와 연두부는 수분·영양 함량이 달라요.' },
  { group: '간편 아침', name: '참치 주먹밥', meal: '참치 + 밥 + 마요네즈', point: '참치로 단백질을 더하는 구성. 참치 종류와 마요네즈 양에 따라 지방량이 달라지며, 고등어와 같은 오메가-3 함량으로 보지 않아요.' },
  { group: '간편 아침', name: '프렌치토스트와 우유', meal: '달걀을 입힌 빵 + 우유', point: '빵에 달걀과 우유를 더해 단백질을 보태요. 버터·기름·시럽 사용량도 실제 식사 구성에 포함돼요.' },
];
SOURCES.push(
  { t: 'Health Canada · 단백질 식품', d: '달걀·유제품·콩류·생선 등 다양한 단백질 식품 구성 참고.', url: 'https://www.canada.ca/en/health-canada/services/food-guide/explore/healthy-eating-recommendations/eat-variety/eat-proteins.html' },
  { t: 'CDC · 아동 수면과 신체활동', d: '수면 시간과 규칙적인 생활 습관 참고. 신체활동 안내는 아래 성장 습관 링크에서 확인할 수 있어요.', url: 'https://www.cdc.gov/healthy-schools/sleep/index.html' }
);

SOURCES.push({ t: 'USDA FoodData Central · SR Legacy', d: '삶은 감자·삶은 대두·아몬드·무염 땅콩버터의 식품 코드와 100g값을 대조해 분량 환산했어요. 국내 품종·제품과 차이가 있습니다. 일반 두부 등 기존 값은 추정치이며 마른김의 비타민 A·C·D는 단위/값 미확인으로 합산하지 않아요.', url: 'https://fdc.nal.usda.gov/' });

SOURCES.push({ t: '식약처 K-FIND · 멸치볶음·마른김·찐 밤고구마', d: '멸치볶음 D110-472000000-0001(100g→15g), 마른김 R212-813010102-0001(100g→2g). 찐 밤고구마 R102-006150049-0000(100g→75g). 2026-11-03 확인. 고구마 A는 레티놀0+베타카로틴37/12로 RAE 환산. 김의 비타민 A 단위와 C·D 값은 미확인으로 합산 제외.', url: 'https://various.foodsafetykorea.go.kr/nutrient/' });
