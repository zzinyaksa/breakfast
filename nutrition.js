// 아침밥 점수·영양 체크 데이터.
// 결핍 신호·식품·권장량은 『자란다 — 우리 아이 건강한 성장의 모든 것』 4장을 바탕으로 정리했다.
const BOOK = '『자란다』';

// 영양 체크: 잘 안 먹는 음식과 부족 신호로 필요한 영양소를 추정한다 (가중치는 「자란다」 4장 식품·결핍 증상 기준)
const FOODS = [
  { id: 'dairy', emo: '🥛', name: '우유·치즈·요거트', n: { ca: 2, protein: 1, d: 0.5 } },
  { id: 'meat', emo: '🥩', name: '소고기·돼지고기', n: { iron: 2, zinc: 2, protein: 1 }, fib: 0.3, sug: 2, na: 300 },
  { id: 'chicken', emo: '🍗', name: '닭고기', n: { protein: 1, zinc: 0.5 } },
  { id: 'fish', emo: '🐟', name: '생선 (연어·고등어)', n: { omega: 2, d: 1, protein: 0.5 }, fib: 0, sug: 0, na: 300 },
  { id: 'egg', emo: '🥚', name: '달걀', n: { protein: 1, d: 0.5, vita: 0.5 }, fib: 0, sug: 0, na: 70 },
  { id: 'tofu', emo: '🫘', name: '두부·콩', n: { protein: 0.5, ca: 0.5, mg: 0.5, iron: 0.5 }, fib: 0.5, sug: 0, na: 10 },
  { id: 'anchovy', emo: '🐠', name: '멸치·뼈째 먹는 생선', n: { ca: 1 }, fib: 0.5, sug: 2, na: 300 },
  { id: 'green', emo: '🥬', name: '녹색 채소 (시금치·브로콜리)', n: { mg: 1, vitk: 2, iron: 0.5 } },
  { id: 'orange', emo: '🥕', name: '당근·호박·고구마', n: { vita: 2 } },
  { id: 'fruit', emo: '🍊', name: '과일 (귤·키위·딸기)', n: { vitc: 2 } },
  { id: 'nuts', emo: '🥜', name: '견과류·잡곡', n: { mg: 1.5, zinc: 0.5 }, fib: 1.5, sug: 1, na: 70 },
];
// minAge: 이 나이(만) 미만에는 보여 주지 않음 (말로 표현해야 알 수 있는 신호 등) · sex: 그 성별에만
const SIGNS = [
  { id: 'pale', minAge: 0, name: '얼굴이 창백해요', n: { iron: 2 } },
  { id: 'tired', minAge: 1, name: '쉽게 지치고 기운이 없어요', n: { iron: 1.5, mg: 0.5, d: 0.5 } },
  { id: 'ice', minAge: 3, name: '얼음을 자꾸 씹어 먹어요', n: { iron: 3 } },
  { id: 'breath', minAge: 3, name: '조금만 뛰어도 숨차해요', n: { iron: 1.5 } },
  { id: 'focus', minAge: 3, name: '집중을 잘 못해요', n: { iron: 1, mg: 1 } },
  { id: 'noappetite', minAge: 0, name: '입맛이 없고 적게 먹어요', n: { zinc: 2 } },
  { id: 'taste', minAge: 3, name: '음식이 맛없다고 해요', n: { zinc: 2 } },
  { id: 'cold', minAge: 0, name: '감기에 자주 걸려요', n: { zinc: 1, d: 1, vita: 1, vitc: 1 } },
  { id: 'wound', minAge: 1, name: '상처가 잘 안 나아요', n: { zinc: 1.5, vitc: 1 } },
  { id: 'legpain', minAge: 3, name: '밤에 다리가 아프다고 해요', n: { d: 2 } },
  { id: 'cramp', minAge: 3, name: '다리에 쥐가 자주 나요', n: { ca: 1.5, mg: 1.5 } },
  { id: 'sleep', minAge: 0, name: '잠을 설치고 예민해요', n: { mg: 1.5, d: 0.5 } },
  { id: 'dark', minAge: 3, name: '어두운 곳에서 잘 못 봐요', n: { vita: 2.5 } },
  { id: 'indoor', minAge: 0, name: '햇볕 쬐는 시간이 적어요', n: { d: 2 } },
  { id: 'period', minAge: 10, sex: 'female', name: '월경량이 많거나 길어요', n: { iron: 3 } },
  { id: 'diet', minAge: 11, name: '다이어트한다며 끼니를 걸러요', n: { iron: 1, ca: 1, protein: 1 } },
];
const NUTRIENTS = {
  d: { emo: '☀️', name: '비타민 D', base: 1, role: '칼슘 흡수의 열쇠 · 면역', food: '햇볕(봄~가을 10~15분), 연어·고등어, 달걀노른자', supp: "거의 모든 아이에게 권장 · 1~18세 하루 600IU, D3(콜레칼시페롤)로", ch: '4-1' },
  ca: { emo: '🦴', name: '칼슘', role: '뼈의 재료', food: '우유·요거트·치즈, 멸치·뱅어포, 두부', supp: '유제품을 거의 안 먹을 때만 · 한 번에 500mg 이하', ch: '4-1' },
  iron: { emo: '🩸', name: '철분', role: '산소 운반 · 에너지', food: '소고기·간·굴·조개 + 귤·키위(비타민 C와 함께)', supp: '나이에 맞는 양으로 (어린이는 하루 6~12mg) · 칼슘과 2시간 띄우기 · 빈혈이 의심되면 검사 후 처방', ch: '4-3' },
  zinc: { emo: '⚡', name: '아연', role: '성장호르몬 파트너 · 식욕 · 면역', food: '굴, 소고기, 닭고기, 달걀, 치즈, 호박씨', supp: '식욕 저하·성장 지연 때 고려 · 철분과 2시간 띄우기', ch: '4-3' },
  mg: { emo: '🌰', name: '마그네슘', role: '비타민 D 활성화 · 근육 이완 · 숙면', food: '호박씨·아몬드, 현미·귀리, 바나나, 시금치', supp: '보통 음식으로 충분 · 자기 전 칼슘과 함께', ch: '4-1' },
  protein: { emo: '💪', name: '단백질', role: '성장호르몬·근육·뼈·성장판의 재료', food: '달걀, 고기, 생선, 두부, 우유 (매 끼니 1가지)', supp: '보통 음식으로 충분 · 보충제는 극심한 편식일 때만 상담 후', ch: '4-2' },
  omega: { emo: '🐟', name: '오메가-3', role: '생선에서 주로 얻는 지방산', food: '연어·고등어, 호두·들기름', supp: '생선을 거부하면 고려', ch: '4-3 · 4-4' },
  vita: { emo: '🥕', name: '비타민 A', role: '뼈 성장 · 면역("항감염 비타민") · 시력', food: '당근·고구마·호박, 시금치, 달걀노른자', supp: '음식으로 · 고용량 레티놀 보충제는 피하기', ch: '4-3' },
  vitc: { emo: '🍊', name: '비타민 C', role: '콜라겐(뼈의 철근) · 철분 흡수 2~3배 · 면역', food: '키위, 딸기, 귤, 빨간 파프리카, 브로콜리 (생으로)', supp: '과일·채소로 충분', ch: '4-3' },
  vitk: { emo: '🥬', name: '비타민 K', role: '칼슘을 뼈에 붙이는 접착제', food: '시금치, 케일, 브로콜리 (기름과 함께)', supp: '녹색 채소로 충분', ch: '4-3' },
};

// ---- 아침밥 체크 ----
// 아이 1회 분량 기준 대략적인 영양 성분. 「자란다」 4장에 나온 수치(달걀·우유·치즈·두부·멸치·고등어 등)를 우선 쓰고,
// 나머지는 일반 식품 성분표의 대략치다. kcal·탄수(c)·단백(p)·지방(f) g, ca·fe·zn·mg mg, d IU, vc mg, va μgRAE, om(오메가-3 식품 여부)
const BF_ITEMS = [
  { id: 'rice', emo: '🍚', name: '흰쌀밥 반 공기', kcal: 150, c: 33, p: 3, f: 0.3, ca: 4, fe: 0.2, zn: 0.6, mg: 10, fib: 0.3, sug: 0, na: 0 },
  { id: 'grain', emo: '🍙', name: '잡곡밥 반 공기', kcal: 150, c: 32, p: 3.5, f: 1, ca: 8, fe: 0.6, zn: 0.9, mg: 40, fib: 1.5, sug: 0, na: 0 },
  { id: 'bread', emo: '🍞', name: '빵·토스트 1쪽', kcal: 80, c: 15, p: 2.5, f: 1, ca: 20, fe: 0.5, zn: 0.3, mg: 8, fib: 0.8, sug: 2, na: 150 },
  { id: 'cereal', emo: '🥣', name: '시리얼 (우유 제외)', kcal: 115, c: 25, p: 2, f: 1, ca: 10, fe: 3, zn: 1, mg: 10, fib: 1, sug: 8, na: 120 },
  { id: 'potato', emo: '🍠', name: '고구마·감자 반 개', kcal: 65, c: 15, p: 1, f: 0.1, ca: 20, fe: 0.4, zn: 0.2, mg: 15, va: 400, vc: 10, fib: 1.5, sug: 0, na: 10 },
  { id: 'egg', emo: '🥚', name: '달걀 1개', kcal: 75, c: 0.5, p: 6, f: 5, ca: 25, fe: 0.9, zn: 0.6, mg: 6, d: 45, va: 80, fib: 0, sug: 0, na: 70 },
  { id: 'milk', emo: '🥛', name: '우유 1컵 (200mL)', kcal: 130, c: 10, p: 6.4, f: 7, ca: 220, fe: 0.1, zn: 0.8, mg: 20, va: 60, fib: 0, sug: 0, na: 100 },
  { id: 'yogurt', emo: '🍶', name: '플레인 요거트 1개', kcal: 80, c: 8, p: 5, f: 3, ca: 180, zn: 0.6, mg: 15, fib: 0, sug: 0, na: 60 }, // 유당은 첨가당이 아니라 감점하지 않는다
  { id: 'sweetyogurt', emo: '🍓', name: '떠먹는 가당 요거트 1개', kcal: 110, c: 17, p: 4, f: 3, ca: 150, zn: 0.5, mg: 12, fib: 0, sug: 9, na: 60, warn: '가당 요거트는 당이 많아요. 플레인 요거트에 과일을 넣어 주세요' },
  { id: 'cheese', emo: '🧀', name: '치즈 1장', kcal: 60, c: 0.5, p: 4, f: 4.5, ca: 140, zn: 0.6, va: 50, fib: 0, sug: 0, na: 250 },
  { id: 'tofu', emo: '🫘', name: '두부 1/4모·콩', kcal: 60, c: 1.5, p: 6, f: 3.5, ca: 110, fe: 1, zn: 0.6, mg: 25, fib: 0.5, sug: 0, na: 10 },
  { id: 'meat', emo: '🍖', name: '고기 반찬 (불고기 등)', kcal: 110, c: 3, p: 10, f: 7, ca: 5, fe: 1.2, zn: 2.5, mg: 12, fib: 0.3, sug: 2, na: 300 },
  { id: 'ham', emo: '🌭', name: '햄·소시지', kcal: 80, c: 1, p: 4, f: 7, ca: 5, fe: 0.3, zn: 0.5, mg: 5, warn: '햄·소시지는 나트륨이 많아 주 1~2회로 줄여 주세요', fib: 0, sug: 1, na: 400 },
  { id: 'fish', emo: '🐟', name: '생선구이 (고등어 등)', kcal: 100, c: 0, p: 10, f: 6, ca: 10, fe: 0.6, zn: 0.4, mg: 15, d: 200, om: 1, fib: 0, sug: 0, na: 300 },
  { id: 'anchovy', emo: '🐠', name: '멸치볶음·김', kcal: 40, c: 2, p: 5, f: 1, ca: 200, fe: 0.4, zn: 0.3, mg: 20, om: 0.1, fib: 0.5, sug: 2, na: 300 },
  { id: 'kimchi', emo: '🥬', name: '김치 조금 (30g)', kcal: 10, c: 1.5, p: 0.6, f: 0.2, ca: 15, fe: 0.2, mg: 4, vc: 4, fib: 0.9, sug: 0, na: 250 }, // 발효식품
  { id: 'veg', emo: '🥦', name: '채소 반찬·나물', kcal: 20, c: 3, p: 1, f: 1, ca: 30, fe: 0.8, zn: 0.2, mg: 30, va: 200, vc: 15, fib: 1.5, sug: 0, na: 150 },
  { id: 'fruitc', emo: '🍊', name: '귤·키위·딸기', kcal: 45, c: 11, p: 0.6, f: 0.2, ca: 20, fe: 0.2, mg: 10, vc: 60, fib: 1.5, sug: 0, na: 0 },
  { id: 'banana', emo: '🍌', name: '바나나 1개', kcal: 90, c: 23, p: 1, f: 0.3, ca: 5, fe: 0.3, zn: 0.2, mg: 27, vc: 9, fib: 2, sug: 0, na: 0 },
  { id: 'juice', emo: '🧃', name: '주스 1컵', kcal: 90, c: 22, p: 0.5, f: 0, ca: 15, vc: 40, warn: '주스는 당분만 농축돼 있어요. 생과일로 바꿔 주세요', fib: 0.2, sug: 20, na: 10 },
  { id: 'nuts', emo: '🌰', name: '호두·견과류 한 줌', kcal: 120, c: 4, p: 4, f: 10, ca: 20, fe: 0.7, zn: 0.6, mg: 50, om: 0.5, fib: 1.5, sug: 1, na: 70 },
  // 오메가-3: om 1 = 고등어구이 반 토막(DHA·EPA), 참치캔·멸치 0.1, 식물성 ALA(호두·들기름) 0.5. ALA는 몸에서 DHA로 조금만 바뀐다
  { id: 'tuna', emo: '🥫', name: '참치캔 2큰술', kcal: 40, c: 0, p: 7, f: 1, ca: 5, fe: 0.4, zn: 0.2, mg: 8, d: 15, om: 0.1, fib: 0, sug: 0, na: 110 },
  { id: 'perilla', emo: '🫗', name: '들기름·들깨가루 1작은술', kcal: 36, c: 0.3, p: 0.3, f: 4, ca: 10, fe: 0.3, mg: 5, om: 0.5, fib: 0.3, sug: 0, na: 0 },
  { id: 'pb', emo: '🥜', name: '땅콩버터 1큰술', kcal: 95, c: 3, p: 4, f: 8, ca: 7, fe: 0.3, zn: 0.5, mg: 27, fib: 1, sug: 1, na: 70 },
  // 편의점·간편식 (일반 제품 1개 기준 대략치)
  { id: 'sandwich', emo: '🥪', name: '편의점 샌드위치 1개', kcal: 300, c: 30, p: 13, f: 14, ca: 150, fe: 1.5, zn: 1.2, mg: 20, d: 10, fib: 1.5, sug: 5, na: 750 },
  { id: 'triangle', emo: '🍙', name: '삼각김밥 1개', kcal: 190, c: 37, p: 4, f: 2.5, ca: 10, fe: 0.4, zn: 0.6, mg: 10, fib: 0.5, sug: 2, na: 450 },
  { id: 'cupnoodle', emo: '🍜', name: '컵라면 1개(작은 컵)', kcal: 300, c: 40, p: 6, f: 13, ca: 20, fe: 1, zn: 0.5, mg: 15, fib: 1.5, sug: 2, na: 1300, warn: '컵라면 하나에 나트륨이 많아요. 국물은 남기고, 아침엔 주 1회 이하로' },
  { id: 'bananamilk', emo: '🍌', name: '바나나우유 1개(240mL)', kcal: 210, c: 30, p: 7, f: 7, ca: 230, zn: 0.8, mg: 20, fib: 0, sug: 20, na: 120, warn: '가공 우유는 당이 많아요. 흰 우유로 바꿔 주세요' },
  { id: 'greek', emo: '🥣', name: '플레인 그릭요거트 100g', kcal: 100, c: 5, p: 9, f: 5, ca: 120, zn: 0.6, mg: 12, fib: 0, sug: 0, na: 40 },
  { id: 'soup', emo: '🍲', name: '국·찌개 (건더기)', kcal: 50, c: 4, p: 3, f: 2, ca: 20, fe: 0.5, zn: 0.4, mg: 10, vc: 3, fib: 0.8, sug: 0, na: 600 },
  // 한국 아이 아침에 자주 나오는 메뉴 (일반 식품 성분표 기준 대략치)
  { id: 'porridge', emo: '🥣', name: '죽 (소고기·야채죽)', kcal: 160, c: 28, p: 6, f: 2.5, ca: 20, fe: 1, zn: 1.2, mg: 20, va: 80, vc: 3, fib: 1, sug: 0, na: 400 },
  { id: 'gimbap', emo: '🍙', name: '김밥 반 줄', kcal: 180, c: 30, p: 6, f: 4, ca: 30, fe: 0.8, zn: 0.8, mg: 20, va: 150, vc: 3, fib: 1, sug: 1, na: 450 },
  { id: 'friedrice', emo: '🍛', name: '볶음밥', kcal: 220, c: 35, p: 5, f: 7, ca: 15, fe: 0.6, zn: 0.7, mg: 15, va: 100, vc: 3, fib: 1, sug: 0, na: 400 },
  { id: 'nurungji', emo: '🍘', name: '누룽지', kcal: 110, c: 24, p: 2, f: 0.3, ca: 3, fe: 0.2, zn: 0.4, mg: 8, fib: 0.2, sug: 0, na: 5 },
  { id: 'oatmeal', emo: '🌾', name: '오트밀', kcal: 115, c: 20, p: 4, f: 2, ca: 15, fe: 1.3, zn: 1.1, mg: 40, fib: 3, sug: 0, na: 0 },
  { id: 'pancake', emo: '🥞', name: '팬케이크·와플', kcal: 115, c: 17, p: 3, f: 4, ca: 50, fe: 0.6, zn: 0.3, mg: 8, fib: 0.5, sug: 7, na: 200 },
  { id: 'tteok', emo: '🍡', name: '떡', kcal: 115, c: 26, p: 2, f: 0.2, ca: 3, fe: 0.3, zn: 0.4, mg: 6, fib: 0.3, sug: 2, na: 150 },
  { id: 'dumpling', emo: '🥟', name: '만두', kcal: 150, c: 17, p: 6, f: 6, ca: 20, fe: 0.8, zn: 0.8, mg: 12, vc: 2, fib: 1, sug: 0, na: 350 },
  { id: 'soymilk', emo: '🧋', name: '두유 1팩', kcal: 100, c: 9, p: 6, f: 4, ca: 150, fe: 1, zn: 0.5, mg: 30, fib: 0.5, sug: 6, na: 100 },
  // 과일 (일반 식품 성분표 기준 대략치)
  { id: 'blueberry', emo: '🫐', name: '블루베리 한 줌', kcal: 30, c: 7, p: 0.4, f: 0.2, ca: 3, fe: 0.1, mg: 3, vc: 5, fib: 1.2, sug: 0, na: 0 },
  { id: 'apple', emo: '🍎', name: '사과 반 개', kcal: 50, c: 13, p: 0.2, f: 0.1, ca: 4, fe: 0.1, mg: 5, vc: 4, fib: 2, sug: 0, na: 0 },
  { id: 'grape', emo: '🍇', name: '포도', kcal: 60, c: 15, p: 0.6, f: 0.2, ca: 6, fe: 0.3, mg: 7, vc: 3, fib: 0.6, sug: 0, na: 0 },
  { id: 'tomato', emo: '🍅', name: '방울토마토 5알', kcal: 15, c: 3, p: 0.7, f: 0.2, ca: 8, fe: 0.2, mg: 8, vc: 14, va: 30, fib: 0.9, sug: 0, na: 5 },
  { id: 'pear', emo: '🍐', name: '배 1/4개', kcal: 45, c: 11, p: 0.3, f: 0.1, ca: 3, fe: 0.1, mg: 5, vc: 4, fib: 1.7, sug: 0, na: 0 },
  { id: 'avocado', emo: '🥑', name: '아보카도 반 개', kcal: 115, c: 6, p: 1.4, f: 10.5, ca: 9, fe: 0.4, zn: 0.5, mg: 20, vc: 7, fib: 4.7, sug: 0, na: 5 },
];

// 하루 필요량: 미국 권장량 기준. 칼슘·철·아연·마그네슘·비타민 A·C·D·단백질은 「자란다」 4장(미국소아과학회 등), 식이섬유·나트륨은 미국 영양소 섭취기준, 열량은 대략치.
function dailyNeeds(age, sex, weight, active) {
  const a = age == null ? 7 : age;
  const f = sex === 'female';
  const band = a < 4 ? 0 : a < 9 ? 1 : a < 13 ? 2 : 3; // 화면의 '청소년(만 13세~)'과 맞춘다
  const kcal = a < 3 ? 1000 : a < 6 ? 1400 : a < 9 ? (f ? 1500 : 1700) : a < 12 ? (f ? 1800 : 2000) : a < 15 ? (f ? 2000 : 2500) : (f ? 2000 : 2700);
  // 운동을 많이 하는 아이는 열량 1.2배, 단백질 체중당 1.2g
  const perKg = active ? 1.2 : a < 4 ? 1.1 : a < 13 ? 0.95 : 0.85;
  const defW = [14, 22, 38, 55][band];
  return {
    kcal: active ? Math.round(kcal * 1.2) : kcal,
    p: Math.round((weight || defW) * perKg),
    ca: [700, 1000, 1300, 1300][band],
    fe: [7, 10, 8, f ? 15 : 11][band],
    zn: [3, 5, 8, f ? 9 : 11][band],
    mg: [80, 130, 240, f ? 360 : 410][band],
    va: [300, 400, 600, f ? 700 : 900][band],
    vc: [15, 25, 45, f ? 65 : 75][band],
    d: a < 1 ? 400 : 600,
    // 식이섬유(충분섭취량): 2020 한국인 영양소 섭취기준
    fib: a < 3 ? 15 : a < 6 ? 20 : a < 9 ? 25 : a < 12 ? (f ? 20 : 25) : (f ? 25 : 30),
    // 나트륨(만성질환 위험 감소 섭취량): 미국 영양소 섭취기준(NASEM)
    na: [1200, 1500, 1800, 2300][band],
  };
}

// 돌 전·만 4세 미만에게는 굴·조개·통견과·참치캔처럼 맞지 않는 음식을 빼고 따로 안내한다
const BF_FIX_UNDER1 = {
  p: '소고기·닭고기·두부·달걀노른자를 이유식에 매 끼니', ca: '모유·분유가 기본이에요. 두부·플레인 요거트(돌 즈음)',
  fe: '소고기 이유식을 하루 1~2번 (이 시기엔 철분이 가장 중요해요)', zn: '소고기·닭고기·달걀노른자 이유식',
  mg: '쌀·오트밀 미음, 으깬 바나나·고구마', vc: '익힌 브로콜리·고구마, 으깬 바나나·사과',
  fib: '고구마·단호박·채소 퓨레', om: '흰살생선·연어 살을 익혀 곱게 (가시 꼭 빼기)',
};
const BF_FIX_UNDER4 = {
  ca: '우유·요거트·치즈 간식, 두부, 잔멸치', fe: '다진 소고기·닭고기 + 귤·딸기로 비타민 C 함께',
  zn: '소고기, 닭고기, 달걀, 치즈', mg: '잡곡밥, 바나나, 두부, 시금치 나물',
  om: '연어·고등어 살 (가시 빼기), 들기름 몇 방울', fib: '잡곡밥·오트밀, 잘게 썬 과일·채소',
};
function fixFood(k, age) {
  if (age != null && age < 1 && BF_FIX_UNDER1[k]) return BF_FIX_UNDER1[k];
  if (age != null && age < 4 && BF_FIX_UNDER4[k]) return BF_FIX_UNDER4[k];
  return BF_FIX[k].food;
}

// 부족할 때 저녁에 챙길 음식 (「자란다」 4장)
const BF_FIX = {
  p: { name: '단백질', emo: '💪', food: '고기·생선·달걀·두부 중 한 가지를 매 끼니', supp: '' },
  ca: { name: '칼슘', emo: '🦴', food: '우유·요거트·치즈 간식, 멸치볶음, 두부', supp: '유제품을 거의 안 먹으면 칼슘제(+비타민 D)' },
  fe: { name: '철분', emo: '🩸', food: '소고기·간·굴·조개 + 귤·키위로 비타민 C 함께', supp: '어린이 철분 영양제(하루 6~12mg) 고려 · 빈혈이 의심되면 검사 후 처방' },
  zn: { name: '아연', emo: '⚡', food: '소고기, 굴, 닭고기, 달걀, 치즈, 호박씨', supp: '입맛이 없고 잘 안 먹는다면 아연 고려' },
  mg: { name: '마그네슘', emo: '🌰', food: '잡곡밥·현미, 견과류, 바나나, 시금치', supp: '보통 음식으로 충분해요' },
  va: { name: '비타민 A', emo: '🥕', food: '당근·고구마·호박, 시금치, 달걀노른자', supp: '음식으로 채워 주세요(고용량 보충제는 피하기)' },
  vc: { name: '비타민 C', emo: '🍊', food: '키위·딸기·귤, 빨간 파프리카, 브로콜리 (생으로)', supp: '과일·채소로 충분해요' },
  d: { name: '비타민 D', emo: '☀️', food: '연어·고등어, 달걀노른자, 햇볕 10~15분', supp: '음식만으론 어려워 거의 모든 아이에게 D3 600IU 권장' },
  fib: { name: '식이섬유', emo: '🌾', food: '잡곡밥·오트밀, 생과일(블루베리·사과·배), 채소 반찬', supp: '' },
  om: { name: '오메가-3', emo: '🐟', food: '연어·고등어 주 2~3번, 호두·들기름', supp: '생선을 안 먹는다면 오메가-3' },
};

const SOURCES = [
  { t: '『자란다 — 우리 아이 건강한 성장의 모든 것』', d: '부족 신호·식품·권장량·영양제 안내의 기준 자료' },
  { t: '미국 국립과학공학의학원(NASEM) 영양소 섭취기준', d: '권장섭취량 기준 (칼슘·철분 등은 『자란다』가 인용한 미국 기준, 나트륨 포함)' },
  { t: '보건복지부·한국영양학회 「2020 한국인 영양소 섭취기준」', d: '식이섬유 충분섭취량, 하루 열량 대략치 참고' },
  { t: '식품 영양 성분', d: '책에 나온 수치를 우선 쓰고, 나머지는 일반 식품 성분표 기준 대략치' },
];

// 아침밥 화면 분류와 단위 (이름은 짧게, 분량은 단위로 보여 준다)
const BF_CATS = [
  { emo: '🍚', name: '밥·죽', ids: ['rice', 'grain', 'porridge', 'gimbap', 'friedrice', 'nurungji'] },
  { emo: '🍞', name: '빵·간편식', ids: ['bread', 'cereal', 'oatmeal', 'pancake', 'tteok', 'potato'] },
  { emo: '🥚', name: '단백질 반찬', ids: ['egg', 'meat', 'fish', 'tuna', 'tofu', 'dumpling', 'ham'] },
  { emo: '🥛', name: '우유·유제품·두유', ids: ['milk', 'yogurt', 'sweetyogurt', 'greek', 'cheese', 'soymilk'] },
  { emo: '🥦', name: '채소·국·반찬', ids: ['veg', 'kimchi', 'anchovy', 'perilla', 'soup'] },
  { emo: '🍓', name: '과일', ids: ['fruitc', 'blueberry', 'banana', 'avocado', 'apple', 'grape', 'tomato', 'pear'] },
  { emo: '🥜', name: '간식·음료', ids: ['nuts', 'pb', 'juice'] },
  { emo: '🏪', name: '편의점·간편식', ids: ['sandwich', 'triangle', 'cupnoodle', 'bananamilk'], minAge: 4 },
];
const BF_UNIT = {
  rice: ['흰쌀밥', '반 공기'], grain: ['잡곡밥', '반 공기'], bread: ['빵·토스트', '1쪽'], cereal: ['시리얼', '1그릇'], potato: ['고구마·감자', '반 개'],
  egg: ['달걀', '1개'], meat: ['고기 반찬', '1접시'], fish: ['생선구이', '반 토막'], tofu: ['두부·콩', '1/4모'], ham: ['햄·소시지', '1접시'],
  milk: ['우유', '1컵'], yogurt: ['플레인 요거트', '1개'], sweetyogurt: ['가당 요거트', '1개'], cheese: ['치즈', '1장'],
  veg: ['채소 반찬·나물', '1접시'], kimchi: ['김치', '조금'], anchovy: ['멸치볶음·김', '1접시'], soup: ['국·찌개', '1그릇'],
  porridge: ['죽', '1그릇'], gimbap: ['김밥', '반 줄'], friedrice: ['볶음밥', '1그릇'], nurungji: ['누룽지', '1그릇'], oatmeal: ['오트밀', '1그릇'],
  pancake: ['팬케이크·와플', '1장'], tteok: ['떡', '2~3개'], dumpling: ['만두', '3개'], soymilk: ['두유', '1팩'],
  fruitc: ['귤·키위·딸기', '1개 분량'], banana: ['바나나', '1개'],
  blueberry: ['블루베리', '한 줌'], apple: ['사과', '반 개'], avocado: ['아보카도', '반 개'], grape: ['포도', '한 송이 작게'], tomato: ['방울토마토', '5알'], pear: ['배', '1/4개'], nuts: ['호두·견과류', '한 줌'], pb: ['땅콩버터', '1큰술'], tuna: ['참치캔', '2큰술'], perilla: ['들기름·들깨', '1작은술'], juice: ['주스', '1컵'], greek: ['그릭요거트', '1통'], sandwich: ['샌드위치', '1개'], triangle: ['삼각김밥', '1개'], cupnoodle: ['컵라면', '1개'], bananamilk: ['바나나우유', '1개'],
};

// 오늘 먹은 영양제: 권장량만큼 먹었다고 보고 해당 영양소를 채운 것으로 계산한다
const BF_SUPPS = [
  // 성장 기본
  { id: 'd', emo: '☀️', name: '비타민 D', fills: ['d'], group: 'base' },
  { id: 'multi', emo: '💊', name: '종합비타민', fills: ['vc', 'd', 'zn'], group: 'base' },
  { id: 'ca', emo: '🥛', name: '칼슘·마그네슘', fills: ['ca', 'mg'], group: 'base' },
  { id: 'iron', emo: '🩸', name: '철분', fills: ['fe'], group: 'base' },
  { id: 'omega', emo: '🐟', name: '오메가-3', fills: ['om'], group: 'base' },
  // 면역·장 건강
  { id: 'vc', emo: '🍊', name: '비타민 C', fills: ['vc'], group: 'immune' },
  { id: 'probiotic', emo: '🦠', name: '유산균', fills: [], group: 'immune', note: '장 건강' },
];
const BF_SUPP_GROUPS = [['base', '🦴 성장 기본'], ['immune', '🛡️ 면역·장 건강']];

// 내일 아침 추천에서 쓰는 바꾸기 후보
const BF_SWAPS = [['rice', 'grain'], ['juice', 'fruitc'], ['ham', 'egg'], ['bread', 'grain']];
const BF_NO_ADD = ['juice', 'ham'];

// 연령별 맞춤: 1회 분량 배율(초등 기준 1)과 연령별 팁 (팁은 「자란다」 4장 기준)
const AGE_BANDS = [
  { id: 'baby', emo: '👶', name: '영유아', range: '만 1~3세', age: 2, max: 4, portion: 0.6,
    tips: ['견과류는 질식 위험이 있어 갈거나 땅콩버터로 주세요 (만 4세 미만)', '칼슘은 하루 700mg: 우유·요거트·치즈 하루 2~3번이면 충분해요', '철분은 하루 7mg: 고기·달걀노른자를 자주 주세요'] },
  { id: 'kinder', emo: '🧒', name: '유치원', range: '만 4~6세', age: 5, max: 7, portion: 0.8,
    tips: ['칼슘이 하루 1,000mg으로 늘어요: 우유 2컵 + 치즈·멸치', '편식이 시작되는 시기예요. 새 음식은 10~15번은 식탁에 올려 주세요', '아침 단백질 하나가 밤새 나온 성장호르몬을 키로 이어줘요'] },
  { id: 'school', emo: '🎒', name: '초등', range: '만 7~12세', age: 9, max: 13, portion: 1,
    tips: ['만 9세부터 칼슘이 하루 1,300mg으로 가장 많이 필요해요 (급성장 대비)', '바쁜 등교 아침엔 달걀 하나 + 우유 한 컵이면 단백질 12g', '탄산·과자보다 우유·요거트·삶은 달걀로 간식을 바꿔 주세요'] },
  { id: 'teen', emo: '🧑', name: '청소년', range: '만 13~18세', age: 15, max: 99, portion: 1.3,
    tips: ['급성장기라 칼슘 1,300mg, 단백질도 가장 많이 필요해요', '여아는 월경으로 철분이 하루 15mg 필요해요', '아침을 거르기 쉬운 나이예요. 그릭 요거트 + 과일처럼 5분 메뉴라도 챙겨 주세요'] },
];


// 메뉴별 분량: [반, 1인분, 2배]일 때 보여 줄 말 (가운데가 BF_ITEMS 수치의 기준 분량)
const BF_QTY_STEPS = [0.5, 1, 2];
// 마시는 것은 실제 mL로 보여 주고 그대로 계산한다 (1컵 200mL · 반 컵 100mL · 2컵 400mL)
const BF_ML = { milk: 200, soymilk: 190, juice: 200 };
// 개수로 세는 음식은 나이별 분량 배수를 곱하지 않는다 (달걀 1개는 누가 먹어도 1개)
// 그릇·접시·공기·한 줌처럼 아이 크기에 따라 달라지는 것만 배수를 곱한다
// 발효식품 (장 건강 한 줄에 쓴다. 점수에는 넣지 않는다)
const BF_FERMENT = { yogurt: '요거트', sweetyogurt: '요거트', greek: '그릭요거트', kimchi: '김치' };
const BF_FIXED = ['avocado', 'egg', 'banana', 'cheese', 'yogurt', 'sweetyogurt', 'tomato', 'dumpling', 'pancake', 'apple', 'pear', 'potato', 'bread', 'tteok', 'gimbap', 'tofu', 'fruitc', 'fish', 'tuna', 'perilla', 'pb', 'milk', 'soymilk', 'juice', 'greek', 'sandwich', 'triangle', 'cupnoodle', 'bananamilk'];
const BF_QTY = {
  rice: ['1/4 공기', '반 공기', '1공기'], grain: ['1/4 공기', '반 공기', '1공기'], porridge: ['반 그릇', '1그릇', '2그릇'],
  gimbap: ['1/4 줄', '반 줄', '1줄'], friedrice: ['반 그릇', '1그릇', '2그릇'], nurungji: ['반 그릇', '1그릇', '2그릇'],
  bread: ['반 쪽', '1쪽', '2쪽'], cereal: ['반 그릇', '1그릇', '2그릇'], oatmeal: ['반 그릇', '1그릇', '2그릇'],
  pancake: ['반 장', '1장', '2장'], tteok: ['1개', '2~3개', '5개'], potato: ['1/4개', '반 개', '1개'],
  egg: ['반 개', '1개', '2개'], meat: ['반 접시', '1접시', '2접시'], fish: ['조금', '반 토막', '1토막'],
  tofu: ['1/8모', '1/4모', '반 모'], dumpling: ['1~2개', '3개', '6개'], ham: ['조금', '1접시', '2접시'],
  milk: ['반 컵', '1컵', '2컵'], yogurt: ['반 개', '1개', '2개'], sweetyogurt: ['반 개', '1개', '2개'], cheese: ['반 장', '1장', '2장'], soymilk: ['반 팩', '1팩', '2팩'],
  veg: ['조금', '1접시', '2접시'], kimchi: ['한두 조각', '조금', '많이'], anchovy: ['조금', '1접시', '2접시'], soup: ['반 그릇', '1그릇', '2그릇'],
  fruitc: ['조금', '1개 분량', '2개 분량'], blueberry: ['조금', '한 줌', '두 줌'], banana: ['반 개', '1개', '2개'],
  apple: ['1/4개', '반 개', '1개'], avocado: ['1/4개', '반 개', '1개'], grape: ['조금', '작은 한 송이', '한 송이'], tomato: ['2~3알', '5알', '10알'], pear: ['1/8개', '1/4개', '반 개'],
  nuts: ['조금', '한 줌', '두 줌'], pb: ['반 큰술', '1큰술', '2큰술'], tuna: ['1큰술', '2큰술', '4큰술'], perilla: ['반 작은술', '1작은술', '2작은술'], juice: ['반 컵', '1컵', '2컵'],
  greek: ['반 통', '1통', '2통'], sandwich: ['반 개', '1개', '2개'], triangle: ['반 개', '1개', '2개'], cupnoodle: ['반 개', '1개', '2개'], bananamilk: ['반 개', '1개', '2개'],
};

// 찐약사 공동구매 제품: 부족한 영양소에 맞춰 추천한다. 링크는 url, 누끼컷 사진은 img(products/ 폴더)에 채운다.
// minAge~maxAge(만 나이, 0.5 = 생후 6개월) 안에서만 추천한다
const PRODUCTS = {
  immune: { minAge: 1, maxAge: 10, name: '우리아이 면역비책 이뮨파파', kind: '멀티비타민·미네랄 (비타민 D·아연 등)', emo: '🛡️', url: '', img: 'img/immune.webp' },
  calmadi: { minAge: 1, maxAge: 12, name: '파파 칼마디케이투 부스터', kind: '칼슘·마그네슘·비타민 D·K2', emo: '🦴', url: '', img: 'img/calmadi.webp' },
  nutrione: { minAge: 13, name: '뉴트원 칼마디 K2', kind: '칼슘·마그네슘·비타민 D·K', emo: '🦴', url: '', img: 'img/nutrione.webp' },
  iron: { minAge: 0.5, name: '오늘:온 리포좀 철분', kind: '철분', emo: '🩸', url: '', img: 'img/iron.webp' },
  omega: { minAge: 1, maxAge: 12, name: '뮴 키즈 스마트 오메가3 구미', kind: '오메가-3', emo: '🐟', url: '', img: 'img/omega.webp' },
  probiotic: { minAge: 0, name: '온가족 황금비책 트리플 유산균', kind: '유산균', emo: '🦠', url: '', img: 'img/probiotic.webp' },
};
// 영양소 키 → 제품 후보 (앞에서부터 나이에 맞는 첫 제품). 아침밥 체크의 키와 영양 체크의 키를 모두 담는다
const NUTRIENT_PRODUCT = {
  ca: ['calmadi', 'nutrione'],
  fe: ['iron'], iron: ['iron'],
  om: ['omega'], omega: ['omega'],
  d: ['immune', 'calmadi', 'nutrione'], zn: ['immune'], zinc: ['immune'],
};
// 제품별 한 줄 안내 (철분은 치료 용량과 구분)
const PRODUCT_NOTE = {
  iron: '나이에 맞는 양으로 먹여요. 빈혈이 의심되면 검사 후 치료 용량은 처방대로',
  probiotic: '변비·장 건강이 걱정될 때. 식이섬유는 음식으로 함께 채워 주세요',
  calmadi: '칼슘·마그네슘은 2:1로 함께 챙기면 좋아요',
  nutrione: '중·고등학생용 · 칼슘 700mg·마그네슘 200mg 함유',
  immune: '비타민 D3와 아연이 함께 들어 있어요',
};
