// i18n for hi-fi
const T_KR = {
  nav_home: '홈', nav_team: '팀', nav_leave: '연차', nav_me: '마이',
  good_morning: '좋은 아침이에요', good_evening: '오늘도 수고했어요',
  clock_in: '출근', clock_out: '퇴근', on_break: '휴게',
  slide_in: '밀어서 출근', slide_out: '밀어서 퇴근',
  tap_in: '탭해서 출근', tap_out: '탭해서 퇴근',
  today_work: '오늘 근무', this_week: '이번 주', this_month: '이번 달',
  scheduled: '정규 근무', worked: '근무',
  at_office: '본사', at_home: '재택', location: '위치',
  auto_detected: '자동 감지됨', change: '변경', confirm: '확인',
  overtime: '초과근무', ot_alert: '정규 시간 이후입니다',
  request_ot: '초과근무 요청', end_now: '지금 퇴근',
  send: '보내기', cancel: '취소', next: '다음', back: '뒤로',
  annual_leave: '연차', remaining: '잔여', used: '사용', total: '지급',
  days: '일', hrs: '시간',
  apply_leave: '연차 신청', who_approves: '승인자',
  reason: '사유 (선택)',
  team_status: '지금 팀은', 
  settings: '설정', theme: '테마', font_size: '글자 크기',
  language: '언어', appearance: '화면', notifications: '알림',
  checkin_style: '출퇴근 UI', team_view: '팀 상태 보기',
  widgets: '홈 위젯',
};
const T_EN = {
  nav_home: 'Home', nav_team: 'Team', nav_leave: 'Leave', nav_me: 'Me',
  good_morning: 'Good morning', good_evening: 'Good work today',
  clock_in: 'Clock in', clock_out: 'Clock out', on_break: 'Break',
  slide_in: 'Slide to clock in', slide_out: 'Slide to clock out',
  tap_in: 'Tap to clock in', tap_out: 'Tap to clock out',
  today_work: 'Today', this_week: 'This week', this_month: 'This month',
  scheduled: 'Scheduled', worked: 'Worked',
  at_office: 'Office', at_home: 'Home', location: 'Location',
  auto_detected: 'Auto-detected', change: 'Change', confirm: 'Confirm',
  overtime: 'Overtime', ot_alert: 'Past scheduled hours',
  request_ot: 'Request overtime', end_now: 'Clock out now',
  send: 'Send', cancel: 'Cancel', next: 'Next', back: 'Back',
  annual_leave: 'Leave', remaining: 'Left', used: 'Used', total: 'Total',
  days: 'd', hrs: 'h',
  apply_leave: 'Apply leave', who_approves: 'Approver',
  reason: 'Reason (optional)',
  team_status: 'Team right now',
  settings: 'Settings', theme: 'Theme', font_size: 'Text size',
  language: 'Language', appearance: 'Appearance', notifications: 'Notifications',
  checkin_style: 'Clock-in UI', team_view: 'Team view',
  widgets: 'Home widgets',
};

const PEOPLE = [
  { n: '김지우', t: '디자인', r: '프로덕트 디자이너', s: 'office' },
  { n: '박서연', t: '디자인', r: '브랜드 디자이너', s: 'wfh' },
  { n: '이도현', t: '개발', r: '프론트엔드', s: 'office' },
  { n: '최하늘', t: '개발', r: '백엔드', s: 'wfh' },
  { n: '정유진', t: '개발', r: 'iOS', s: 'break' },
  { n: '오민석', t: '개발', r: '안드로이드', s: 'leave' },
  { n: '한예린', t: '운영', r: 'CS Lead', s: 'office' },
  { n: '서지훈', t: '운영', r: 'CS', s: 'office' },
  { n: '윤소라', t: '마케팅', r: 'Growth', s: 'wfh' },
  { n: '장민호', t: '마케팅', r: 'Content', s: 'off' },
  { n: '강보람', t: '재무', r: 'Finance', s: 'office' },
  { n: '임시우', t: '재무', r: 'Finance', s: 'leave' },
];

const HiCtx = React.createContext({ lang: 'ko', theme: 'light', font: 'md' });
function useHi() { return React.useContext(HiCtx); }
function useT() { const { lang } = useHi(); return (k) => (lang === 'en' ? T_EN : T_KR)[k] ?? k; }

Object.assign(window, { T_KR, T_EN, PEOPLE, HiCtx, useHi, useT });
