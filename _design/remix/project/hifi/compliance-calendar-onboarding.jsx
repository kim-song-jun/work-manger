// ============================================================
// ⑱ 스마트 스케줄링 / 컴플라이언스 가드
// ⑲ 팀 캘린더
// ⑳ 사용자 온보딩 (전체 플로우)
// ============================================================

// ── 공통 mock data ────────────────────────────────────────
const CC_PEOPLE = [
  { n: '김지우', t: '디자인', s: 'office', c: '#FFB4A2' },
  { n: '박민지', t: '디자인', s: 'wfh',    c: '#A8DADC' },
  { n: '이준호', t: '엔지니어링', s: 'office', c: '#B5C9F4' },
  { n: '정유나', t: '엔지니어링', s: 'wfh', c: '#F4D6B5' },
  { n: '한승우', t: '엔지니어링', s: 'leave', c: '#D4C5F4' },
  { n: '최서연', t: '프로덕트', s: 'office', c: '#C5F4D4' },
  { n: '윤재호', t: '프로덕트', s: 'break', c: '#F4C5E5' },
  { n: '송하늘', t: '운영', s: 'office', c: '#FAD9A1' },
];

// ─────────────────────────────────────────────────────────
// ⑱-A 컴플라이언스 가드 (모바일) — 주간 한도 게이지 + 위반 예측
// ─────────────────────────────────────────────────────────
function MobCompliance() {
  const t = useT();
  const used = 47.5;     // 이번 주까지 누적
  const cap = 52;        // 법정 + 계약상한
  const projected = 53.2; // 예상 (현재 페이스 유지 시)
  const pct = Math.min(used / cap * 100, 100);
  const projPct = Math.min(projected / cap * 100, 100);

  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-appbar">
        <Icon.chevL className="icon-22 c-body" />
        <h1 className="flex-1">근로시간 컴플라이언스</h1>
      </div>
      <div className="hf-screen" style={{ padding: '4px 16px 16px' }}>

        {/* 핵심 카드 — projected가 cap을 넘었을 때 강조 */}
        <div className="hf-card" style={{ padding: 18, background: 'var(--danger-soft)', border: '1px solid var(--danger)' }}>
          <div className="row g-8 mb-6">
            <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--danger)' }} />
            <div className="fs-12 fw-700 c-danger">주 52시간 초과 예상</div>
          </div>
          <div className="fs-15 fw-700 c-primary lh-1-4">
            현재 페이스로 가면 금요일에<br/>
            <span className="num fs-22 c-danger">53시간 12분</span>이 됩니다
          </div>
          <div className="fs-12 c-body mt-6">오늘부터 매일 1시간씩 줄여보세요</div>
        </div>

        {/* 게이지 */}
        <div className="hf-card" style={{ padding: 16, marginTop: 10 }}>
          <div className="row-baseline mb-10">
            <div className="t-body fw-700">이번 주 누적</div>
            <div className="t-caption">한도 {cap}시간</div>
          </div>

          {/* 누적 + 예측 두 줄 */}
          <div style={{ position: 'relative', height: 14, borderRadius: 7, background: 'var(--grey-100)', overflow: 'visible' }}>
            <div style={{
              position: 'absolute', inset: 0, width: `${projPct}%`,
              background: 'repeating-linear-gradient(45deg, var(--danger-soft), var(--danger-soft) 4px, transparent 4px, transparent 8px)',
              borderRadius: 7 }}/>
            <div style={{
              position: 'absolute', inset: 0, width: `${pct}%`,
              background: 'var(--brand)', borderRadius: 7 }}/>
            {/* 한도선 */}
            <div style={{ position: 'absolute', top: -3, bottom: -3, left: '100%', width: 2, background: 'var(--danger)' }}/>
          </div>

          <div className="row-between mt-12">
            <div>
              <div className="t-caption">현재</div>
              <div className="num fs-20 fw-700 c-brand">{used}h</div>
            </div>
            <div>
              <div className="t-caption">예상</div>
              <div className="num fs-20 fw-700 c-danger">{projected}h</div>
            </div>
            <div>
              <div className="t-caption">잔여 한도</div>
              <div className="num fs-20 fw-700 c-body">{(cap-used).toFixed(1)}h</div>
            </div>
          </div>
        </div>

        {/* 일별 그래프 */}
        <div className="hf-card" style={{ padding: 16, marginTop: 10 }}>
          <div className="fs-13 fw-700 mb-14">일별 근무시간</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, alignItems: 'end', height: 100 }}>
            {[
              { d: '월', h: 9.5, ok: true },
              { d: '화', h: 10.2, ok: true },
              { d: '수', h: 9.8, ok: true },
              { d: '목', h: 11.5, ok: false },
              { d: '금', h: 6.5, ok: true, today: true },
              { d: '토', h: 0, planned: true },
              { d: '일', h: 0, planned: true },
            ].map((d, i) => {
              const max = 12;
              const h = (d.h / max) * 80;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: h || 2,
                    background: d.today ? 'var(--brand)' : d.planned ? 'transparent' : !d.ok ? 'var(--danger)' : 'var(--grey-300)',
                    border: d.planned ? '1px dashed var(--grey-300)' : 'none',
                    borderRadius: 4, transition: 'all 0.3s' }}/>
                  <div style={{ fontSize: 10, color: d.today ? 'var(--brand)' : 'var(--grey-500)', fontWeight: d.today ? 700 : 400 }}>{d.d}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 자동 가드 */}
        <div className="hf-card" style={{ padding: 14, marginTop: 10 }}>
          <div className="fs-13 fw-700 mb-8">자동 가드</div>
          {[
            { l: '한도 도달 시 출근 차단', s: '관리자 승인 필수', on: true },
            { l: '하루 12시간 초과 시 알림', s: '본인 + 직속 상급자', on: true },
            { l: '연속 6일 근무 경고', s: '주말 강제 권고', on: false },
            { l: '11시간 인터벌 미준수 알림', s: '퇴근→출근 사이', on: true },
          ].map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: i ? '1px solid var(--grey-100)' : 'none' }}>
              <div className="flex-1">
                <div className="fs-13 fw-600">{g.l}</div>
                <div className="t-caption">{g.s}</div>
              </div>
              <div style={{
                width: 36, height: 22, borderRadius: 11,
                background: g.on ? 'var(--brand)' : 'var(--grey-200)',
                position: 'relative', flexShrink: 0 }}>
                <div style={{
                  position: 'absolute', top: 2, left: g.on ? 16 : 2,
                  width: 18, height: 18, borderRadius: 9, background: 'var(--white)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)', transition: 'left 0.2s' }}/>
              </div>
            </div>
          ))}
        </div>

      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ⑱-B 출근 차단 모달 (모바일) — 한도 초과 시 출근 시도
// ─────────────────────────────────────────────────────────
function MobComplianceBlock() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div style={{ flex: 1, background: 'rgba(25,31,40,0.6)', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
        {/* 뒤 흐리게 보이는 홈 */}
        <div style={{ position: 'absolute', inset: 0, padding: '60px 20px', filter: 'blur(2px)', opacity: 0.5 }}>
          <div className="t-display-lg">안녕하세요, 김지우님</div>
          <div className="hf-card" style={{ padding: 24, marginTop: 16, background: 'var(--brand)', color: 'var(--white)' }}>
            <div className="fs-13">오늘 근무</div>
            <div className="num" style={{ fontSize: 36, fontWeight: 700 }}>출근 전</div>
          </div>
        </div>

        {/* 시트 */}
        <div style={{
          width: '100%', background: 'var(--white)',
          borderRadius: '20px 20px 0 0',
          padding: '12px 20px 28px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
          position: 'relative', zIndex: 1 }}>
          <div style={{ width: 36, height: 4, background: 'var(--grey-200)', borderRadius: 2, margin: '0 auto 16px' }}/>

          <div style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'var(--danger-soft)', color: 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16v.01"/>
            </svg>
          </div>

          <div className="t-heading-lg ta-c mb-6">주 52시간 도달</div>
          <div className="t-body ta-c c-muted mb-16">
            이번 주 근무시간이 한도에 도달해<br/>출근 처리가 자동 차단되었어요
          </div>

          <div style={{ background: 'var(--grey-50)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span className="c-muted">이번 주 누적</span>
              <span className="num fw-700 c-danger">52h 03m</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span className="c-muted">다음 가능 시각</span>
              <span className="num fw-700">월 09:00</span>
            </div>
          </div>

          <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block mb-8">
            관리자에게 예외 승인 요청
          </button>
          <button className="hf-btn hf-btn-secondary hf-btn-medium hf-btn-block">알겠습니다</button>
        </div>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ⑱-C 컴플라이언스 가드 (관리자 웹) — 전체 직원 한도 보드
// ─────────────────────────────────────────────────────────
function AdminCompliance() {
  const rows = [
    { n: '김지우', t: '디자인', used: 53.2, cap: 52, status: 'over', proj: 53.2 },
    { n: '이준호', t: '엔지니어링', used: 49.5, cap: 52, status: 'warn', proj: 51.8 },
    { n: '한승우', t: '엔지니어링', used: 48.0, cap: 52, status: 'warn', proj: 51.2 },
    { n: '박민지', t: '디자인', used: 38.5, cap: 52, status: 'ok', proj: 41.0 },
    { n: '정유나', t: '엔지니어링', used: 35.0, cap: 52, status: 'ok', proj: 37.5 },
    { n: '최서연', t: '프로덕트', used: 32.0, cap: 52, status: 'ok', proj: 34.0 },
    { n: '윤재호', t: '프로덕트', used: 28.5, cap: 52, status: 'ok', proj: 30.0 },
    { n: '송하늘', t: '운영', used: 41.0, cap: 52, status: 'ok', proj: 43.0 },
  ];
  const overCount = rows.filter(r => r.status === 'over').length;
  const warnCount = rows.filter(r => r.status === 'warn').length;

  return (
    <div style={{ background: 'var(--grey-100)', height: '100%', display: 'flex' }}>
      <AdminSidebar active="compliance" />
      <div style={{ flex: 1, padding: 28, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h1 className="t-display-lg">근로시간 컴플라이언스</h1>
            <div className="t-body c-muted mt-4">이번 주 (4/21–4/27)</div>
          </div>
          <div className="row g-8">
            <button className="hf-btn hf-btn-secondary hf-btn-medium">CSV 내보내기</button>
            <button className="hf-btn hf-btn-primary hf-btn-medium">전체 알림 보내기</button>
          </div>
        </div>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { l: '한도 초과', v: overCount, c: 'var(--danger)' },
            { l: '경고 (90% 이상)', v: warnCount, c: 'var(--warn)' },
            { l: '정상', v: rows.length - overCount - warnCount, c: 'var(--success)' },
            { l: '평균 주간 근무', v: '40.7h', c: 'var(--grey-900)' },
          ].map((k, i) => (
            <div key={i} className="hf-card" style={{ padding: 18 }}>
              <div className="t-caption c-mute">{k.l}</div>
              <div className="num" style={{ fontSize: 32, fontWeight: 700, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>

        {/* 위반 알림 */}
        <div className="hf-card" style={{ padding: '14px 18px', background: 'var(--danger-soft)', border: '1px solid var(--danger)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--r-lg)', background: 'var(--danger)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16v.01"/></svg>
          </div>
          <div className="flex-1">
            <div className="fs-14 fw-700 c-primary">김지우님이 주 52시간을 초과했어요</div>
            <div className="fs-12 c-body">예외 승인 요청이 도착했습니다 · 4/25 14:20</div>
          </div>
          <button className="hf-btn hf-btn-secondary hf-btn-medium">상세 보기</button>
          <button className="hf-btn hf-btn-primary hf-btn-medium">승인</button>
        </div>

        {/* 테이블 */}
        <div className="hf-card" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 120px 1fr 100px 100px 100px', padding: '14px 20px', borderBottom: '1px solid var(--grey-100)', fontSize: 12, fontWeight: 700, color: 'var(--grey-500)' }}>
            <div>이름</div><div>팀</div><div>이번 주 / 예상 (한도 52h)</div><div>현재</div><div>예상</div><div>잔여</div>
          </div>
          {rows.map((r, i) => {
            const pct = (r.used / r.cap) * 100;
            const projPct = (r.proj / r.cap) * 100;
            const color = r.status === 'over' ? 'var(--danger)' : r.status === 'warn' ? 'var(--warn)' : 'var(--brand)';
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 120px 1fr 100px 100px 100px', padding: '14px 20px', borderBottom: i < rows.length-1 ? '1px solid var(--grey-100)' : 'none', alignItems: 'center', fontSize: 14 }}>
                <div className="row g-10">
                  <Avatar n={r.n} size={32} />
                  <span className="fw-600">{r.n}</span>
                </div>
                <div className="c-muted">{r.t}</div>
                <div style={{ paddingRight: 24 }}>
                  <div style={{ position: 'relative', height: 10, borderRadius: 5, background: 'var(--grey-100)' }}>
                    <div style={{ position: 'absolute', inset: 0, width: `${Math.min(projPct, 100)}%`, background: 'repeating-linear-gradient(45deg, var(--grey-200), var(--grey-200) 3px, transparent 3px, transparent 6px)', borderRadius: 5 }}/>
                    <div style={{ position: 'absolute', inset: 0, width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 5 }}/>
                  </div>
                </div>
                <div className="num" style={{ fontWeight: 700, color }}>{r.used}h</div>
                <div className="num" style={{ fontWeight: 600, color: r.proj > r.cap ? 'var(--danger)' : 'var(--grey-700)' }}>{r.proj}h</div>
                <div className="num c-mute">{Math.max(r.cap - r.used, 0).toFixed(1)}h</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 작은 사이드바 헬퍼
function AdminSidebar({ active }) {
  const items = [
    { k: 'dash', l: '대시보드', i: Icon.home },
    { k: 'inbox', l: '승인함', i: Icon.inbox, badge: 3 },
    { k: 'compliance', l: '컴플라이언스', i: Icon.clock },
    { k: 'calendar', l: '팀 캘린더', i: Icon.calendar },
    { k: 'reports', l: '리포트', i: Icon.chart },
    { k: 'employees', l: '직원', i: Icon.team },
    { k: 'settings', l: '설정', i: Icon.settings },
  ];
  return (
    <div style={{ width: 220, background: 'var(--white)', borderRight: '1px solid var(--grey-200)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 14, fontWeight: 700, padding: '8px 12px 16px' }}>관리자</div>
      {items.map(it => (
        <div key={it.k} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 'var(--r-sm)',
          background: active === it.k ? 'var(--brand-soft)' : 'transparent',
          color: active === it.k ? 'var(--brand)' : 'var(--grey-700)',
          fontSize: 14, fontWeight: active === it.k ? 700 : 500,
          cursor: 'pointer', position: 'relative' }}>
          <it.i className="icon-18" />
          <span className="flex-1">{it.l}</span>
          {it.badge && <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--danger)', color: 'var(--white)', padding: '2px 7px', borderRadius: 10 }}>{it.badge}</span>}
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// ⑲ 팀 캘린더
// ═════════════════════════════════════════════════════════

// ⑲-A 모바일 · 월별 캘린더 (팀 연차 오버랩)
function MobTeamCalendar() {
  const t = useT();
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  // mock — 어떤 날에 누가 연차/재택인지
  const events = {
    8: { leave: ['김지', '한승'], wfh: ['박민'] },
    9: { leave: ['김지'], wfh: ['박민', '정유'] },
    14: { leave: ['최서'], wfh: ['박민'] },
    15: { leave: ['최서', '윤재'], wfh: [] },
    22: { leave: [], wfh: ['김지', '박민', '정유'] },  // today
    25: { leave: ['이준'], wfh: ['박민'] },
    28: { leave: ['송하'], wfh: ['김지', '박민'] } };
  const today = 22;

  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-appbar">
        <h1 className="flex-1">팀 캘린더</h1>
        <Icon.filter className="icon-22 c-body" />
      </div>
      <div className="hf-screen" style={{ padding: '4px 16px 16px' }}>

        {/* 월 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px 12px' }}>
          <Icon.chevL className="icon-22 c-muted" />
          <div style={{ fontSize: 17, fontWeight: 700 }}>2026년 5월</div>
          <Icon.chevR className="icon-22 c-muted" />
        </div>

        {/* 캘린더 그리드 */}
        <div className="hf-card" style={{ padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 12, color: 'var(--grey-500)', marginBottom: 6, textAlign: 'center' }}>
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={d} style={{ color: i === 0 ? 'var(--danger)' : i === 6 ? 'var(--brand)' : 'var(--grey-500)' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {/* offset for May 1 (금요일) — 5칸 빈칸 */}
            {Array.from({ length: 4 }, (_, i) => <div key={`e${i}`} />)}
            {days.map(d => {
              const ev = events[d];
              const isToday = d === today;
              return (
                <div key={d} style={{
                  aspectRatio: '1', borderRadius: 'var(--r-sm)',
                  background: isToday ? 'var(--brand-soft)' : 'transparent',
                  display: 'flex', flexDirection: 'column',
                  padding: 4, position: 'relative' }}>
                  <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--brand)' : 'var(--grey-800)' }}>{d}</div>
                  {ev && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 'auto' }}>
                      {ev.leave?.length > 0 && <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--warn)' }}/>}
                      {ev.wfh?.length > 0 && <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--brand)' }}/>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 오늘 섹션 */}
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>오늘 · 5월 22일</span>
          <span className="c-mute fw-500">3명 재택</span>
        </div>

        {[
          { n: '김지우', s: 'wfh', l: '재택' },
          { n: '박민지', s: 'wfh', l: '재택' },
          { n: '정유나', s: 'wfh', l: '재택' },
        ].map((p, i) => (
          <div key={i} className="hf-card" style={{ padding: 10, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar n={p.n} size={32} />
            <div className="flex-1 fs-13 fw-600">{p.n}</div>
            <span className="hf-chip" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>{p.l}</span>
          </div>
        ))}

        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>다가오는 연차</span>
          <span className="c-mute fw-500">2주</span>
        </div>

        {[
          { d: '5/25 (월)', n: '이준호', t: '연차 1일' },
          { d: '5/28 (목)', n: '송하늘', t: '연차 1일' },
          { d: '6/1–6/3', n: '한승우', t: '연차 3일 · 휴가' },
        ].map((e, i) => (
          <div key={i} className="hf-card" style={{ padding: 10, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, textAlign: 'center' }}>
              <div className="num t-caption">{e.d.split(' ')[0]}</div>
            </div>
            <Avatar n={e.n} size={28} />
            <div className="flex-1 fs-13">
              <div className="fw-600">{e.n}</div>
              <div className="t-caption">{e.t}</div>
            </div>
          </div>
        ))}

      </div>
      <TabBar active="leave" t={t} />
      <div className="hf-phone-home" />
    </div>
  );
}

// ⑲-B 웹 · 팀 캘린더 (월별 + 누적 차트)
function WebTeamCalendar() {
  const team = ['김지우','박민지','이준호','정유나','한승우','최서연','윤재호','송하늘'];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  // mock data — { 사람: { 일: 'leave'|'wfh'|'sick'|'office' } }
  const data = {
    '김지우': { 8: 'leave', 9: 'leave', 22: 'wfh' },
    '박민지': { 9: 'wfh', 14: 'wfh', 22: 'wfh', 28: 'wfh' },
    '이준호': { 25: 'leave' },
    '정유나': { 9: 'wfh', 22: 'wfh' },
    '한승우': { 1: 'leave', 2: 'leave', 3: 'leave' },
    '최서연': { 14: 'leave', 15: 'leave' },
    '윤재호': { 15: 'leave' },
    '송하늘': { 28: 'leave' } };
  const colorOf = (s) => ({ leave: 'var(--warn)', wfh: 'var(--brand)', sick: 'var(--danger)' }[s]);

  return (
    <div style={{ background: 'var(--grey-100)', height: '100%', display: 'flex' }}>
      <AdminSidebar active="calendar" />
      <div style={{ flex: 1, padding: 28, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h1 className="t-display-lg">팀 캘린더</h1>
            <div className="t-body c-muted mt-4">전 직원 일정 · 연차 / 재택 / 출장</div>
          </div>
          <div className="row g-8">
            <select className="hf-input hf-input-medium" style={{ width: 140 }}>
              <option>전체 팀</option><option>디자인</option><option>엔지니어링</option>
            </select>
            <button className="hf-btn hf-btn-primary hf-btn-medium">+ 일정 추가</button>
          </div>
        </div>

        {/* 월 네비 + 범례 */}
        <div className="hf-card" style={{ padding: '14px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="hf-btn hf-btn-secondary hf-btn-tiny">오늘</button>
          <Icon.chevL style={{ width: 18, height: 18, color: 'var(--grey-600)', cursor: 'pointer' }} />
          <div className="t-heading-sm">2026년 5월</div>
          <Icon.chevR style={{ width: 18, height: 18, color: 'var(--grey-600)', cursor: 'pointer' }} />
          <div className="flex-1"/>
          <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
            {[['leave','연차'],['wfh','재택'],['sick','병가']].map(([s, l]) => (
              <div key={s} className="row g-5">
                <div style={{ width: 10, height: 10, borderRadius: 3, background: colorOf(s) }}/>
                <span className="c-muted">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 가로 타임라인 매트릭스 */}
        <div className="hf-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* 헤더: 일자 */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(31, 1fr)', borderBottom: '1px solid var(--grey-200)', background: 'var(--grey-50)' }}>
            <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--grey-500)' }}>이름 (8명)</div>
            {days.map(d => {
              const dow = (d + 4) % 7; // May 1 = Fri
              const isWeekend = dow === 0 || dow === 6;
              return (
                <div key={d} style={{
                  padding: '12px 0', textAlign: 'center', fontSize: 12,
                  color: d === 22 ? 'var(--brand)' : isWeekend ? 'var(--grey-400)' : 'var(--grey-600)',
                  fontWeight: d === 22 ? 700 : 500,
                  borderLeft: '1px solid var(--grey-100)',
                  background: d === 22 ? 'var(--brand-soft)' : 'transparent' }}>{d}</div>
              );
            })}
          </div>

          {team.map((n, ti) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '160px repeat(31, 1fr)', borderBottom: ti < team.length-1 ? '1px solid var(--grey-100)' : 'none', alignItems: 'center', height: 44 }}>
              <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar n={n} size={26} />
                <span className="fs-13 fw-600">{n}</span>
              </div>
              {days.map(d => {
                const ev = data[n]?.[d];
                const dow = (d + 4) % 7;
                const isWeekend = dow === 0 || dow === 6;
                return (
                  <div key={d} style={{
                    height: '100%', borderLeft: '1px solid var(--grey-100)',
                    background: isWeekend ? 'var(--grey-50)' : 'transparent',
                    padding: 5, position: 'relative' }}>
                    {ev && (
                      <div style={{
                        position: 'absolute', inset: 6,
                        borderRadius: 4, background: colorOf(ev),
                        opacity: 0.85 }}/>
                    )}
                    {d === 22 && !ev && <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: 'var(--brand)', opacity: 0.3 }}/>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* 일별 가용 인력 */}
        <div className="hf-card" style={{ padding: 18, marginTop: 12 }}>
          <div className="row-baseline mb-12">
            <div className="t-subtitle">일별 출근 인원</div>
            <div className="t-caption">최소 권장: 5명 / 8명</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(31, 1fr)', gap: 1, alignItems: 'end', height: 70 }}>
            {days.map(d => {
              const dow = (d + 4) % 7;
              const isWeekend = dow === 0 || dow === 6;
              if (isWeekend) return <div key={d} style={{ height: 6, background: 'var(--grey-100)', borderRadius: 1 }}/>;
              const offCount = team.filter(n => data[n]?.[d] === 'leave' || data[n]?.[d] === 'sick').length;
              const office = team.length - offCount;
              const h = (office / team.length) * 60;
              const low = office < 5;
              return (
                <div key={d} style={{
                  height: h, background: low ? 'var(--danger)' : 'var(--brand)',
                  borderRadius: 1, opacity: 0.85 }} title={`${office}/${team.length}`}/>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(31, 1fr)', gap: 1, marginTop: 4, fontSize: 9, color: 'var(--grey-400)', textAlign: 'center' }}>
            {days.map(d => <div key={d}>{d % 5 === 0 ? d : ''}</div>)}
          </div>
        </div>

      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// ⑳ 사용자 온보딩 (8단계 풀 플로우)
// ═════════════════════════════════════════════════════════

// 공통: 진행 표시기
function OnbProgress({ step, total = 6 }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '20px 24px 0' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < step ? 'var(--brand)' : 'var(--grey-200)',
          transition: 'background 0.3s' }}/>
      ))}
    </div>
  );
}

// ⑳-1 환영 (브랜드 소개 캐러셀)
function MobOnbWelcome() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-screen" style={{ padding: '60px 32px 32px', display: 'flex', flexDirection: 'column', textAlign: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 12px 32px rgba(20, 122, 245, 0.25)' }}>
            <Icon.clock className="icon-40 c-white" />
          </div>
          <h1 className="t-display-hero mb-12 fs-28">
            출근부터 연차까지<br/>한 번에 관리하세요
          </h1>
          <div className="t-body-lg c-muted">
            우리 회사를 위한 가장 단순한<br/>근무 관리 도구
          </div>
        </div>

        {/* 3개 illustration cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '24px 0' }}>
          {[
            { i: Icon.map, l: '위치 기반 자동 출근', s: '본사·재택 자동 인식' },
            { i: Icon.calendar, l: '연차 자동 발생·소멸', s: '깜빡할 일 없도록 안내' },
            { i: Icon.team, l: '팀원 근무 상태 한눈에', s: '실시간 협업이 더 쉬워져요' },
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'var(--grey-50)', borderRadius: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <it.i className="icon-20"/>
              </div>
              <div className="ta-l">
                <div className="t-body fw-700">{it.l}</div>
                <div className="t-caption">{it.s}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block mb-8">시작하기</button>
          <div className="fs-13 c-mute">이미 계정이 있어요 · <span className="c-brand fw-700">로그인</span></div>
        </div>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ⑳-2 회사 코드 입력
function MobOnbCompanyCode() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <OnbProgress step={1} />
      <div className="hf-appbar"><Icon.chevL className="icon-22 c-body" /></div>
      <div className="hf-screen" style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 className="t-display-lg mb-10">회사 코드를 입력해주세요</h1>
        <div className="t-body c-muted mb-24">관리자에게 받은 6자리 코드를 입력하세요</div>

        <div className="row-center g-8 mb-16">
          {['M','O','L','C','U','B'].map((c, i) => (
            <div key={i} style={{
              width: 44, height: 56, borderRadius: 'var(--r-md)',
              border: i < 6 ? '2px solid var(--brand)' : '2px solid var(--grey-200)',
              background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700 }}>{c}</div>
          ))}
        </div>

        <div style={{ background: 'var(--success-soft)', borderRadius: 'var(--r-md)', padding: 14, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Icon.check className="icon-20 c-success" />
          <div className="flex-1 fs-13">
            <div className="fw-700">몰큐브 (Molcube)</div>
            <div className="fs-12 c-muted">강남구 · 직원 24명</div>
          </div>
        </div>

        <div className="flex-1"/>
        <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block">다음</button>
        <div className="ta-c fs-13 c-mute mt-14">
          코드를 모르시나요? <span className="c-brand fw-700">관리자에게 문의</span>
        </div>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ⑳-3 프로필 설정
function MobOnbProfile() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <OnbProgress step={2} />
      <div className="hf-appbar"><Icon.chevL className="icon-22 c-body" /></div>
      <div className="hf-screen" style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 className="t-display-lg mb-6">프로필을 만들어요</h1>
        <div className="t-body c-muted mb-24">팀원들에게 어떻게 보일지 설정해요</div>

        <div className="row-center mb-24">
          <div style={{ position: 'relative' }}>
            <Avatar n="김지우" size={84} />
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: 14,
              background: 'var(--brand)', color: 'var(--white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid #fff' }}>
              <Icon.plus className="icon-14"/>
            </div>
          </div>
        </div>

        {[
          { l: '이름', v: '김지우', sub: '실명을 입력해주세요' },
          { l: '소속 팀', v: '디자인', sub: '관리자가 지정한 팀' },
          { l: '직책', v: '시니어 디자이너', sub: '선택 사항' },
          { l: '사번', v: 'M-0124', sub: '관리자가 발급' },
        ].map((f, i) => (
          <div key={i} className="mb-14">
            <div className="fs-12 fw-600 c-mute mb-6">{f.l}</div>
            <input className="hf-input hf-input-medium hf-input-block" defaultValue={f.v} style={{ width: '100%', padding: '12px 14px', fontSize: 14, border: '1px solid var(--grey-200)', borderRadius: 10, background: 'var(--white)' }}/>
          </div>
        ))}

        <div className="flex-1"/>
        <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block">다음</button>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ⑳-4 위치 권한 + 본사 등록
function MobOnbLocation() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <OnbProgress step={3} />
      <div className="hf-appbar"><Icon.chevL className="icon-22 c-body" /></div>
      <div className="hf-screen" style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 className="t-display-lg mb-6">위치를 등록해주세요</h1>
        <div className="t-body c-muted mb-20">본사·재택 위치를 자동으로 인식해요</div>

        {/* 지도 */}
        <div style={{
          height: 180, borderRadius: 14,
          background: 'linear-gradient(135deg, #DBE9FF 0%, #E8DBFF 100%)',
          position: 'relative', overflow: 'hidden', marginBottom: 14 }}>
          {/* 도로 가짜 */}
          <svg width="100%" height="100%" style={{ position: 'absolute' }}>
            <path d="M 0 80 Q 100 60 200 100 T 400 80" stroke="#fff" strokeWidth="14" fill="none" opacity="0.6"/>
            <path d="M 50 0 L 80 200" stroke="#fff" strokeWidth="8" fill="none" opacity="0.5"/>
            <path d="M 200 0 L 240 200" stroke="#fff" strokeWidth="6" fill="none" opacity="0.4"/>
          </svg>
          {/* 본사 핀 */}
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -100%)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--brand)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20, 122, 245, 0.4)' }}>
              <Icon.building className="icon-18"/>
            </div>
          </div>
          {/* 반경 */}
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 110, height: 110, borderRadius: '50%', background: 'rgba(20, 122, 245, 0.12)', border: '2px dashed var(--brand)' }}/>
        </div>

        <div className="hf-card" style={{ padding: 14, marginBottom: 10 }}>
          <div className="row g-10 mb-4">
            <Icon.building className="icon-18 c-brand" />
            <div className="t-body fw-700">본사 — 강남 오피스</div>
            <span className="hf-chip success" style={{ marginLeft: 'auto', fontSize: 10 }}>설정됨</span>
          </div>
          <div className="t-caption">서울 강남구 테헤란로 152 · 반경 100m</div>
        </div>

        <div className="hf-card" style={{ padding: 14, marginBottom: 10, border: '1px dashed var(--grey-300)' }}>
          <div className="row g-10">
            <Icon.house className="icon-18 c-mute" />
            <div className="flex-1">
              <div className="t-body fw-700">재택 위치</div>
              <div className="t-caption">지금 위치를 재택으로 등록</div>
            </div>
            <button className="hf-btn hf-btn-weak hf-btn-tiny">+ 추가</button>
          </div>
        </div>

        <div style={{ background: 'var(--info-soft)', borderRadius: 10, padding: 12, fontSize: 12, color: 'var(--grey-700)', display: 'flex', gap: 8 }}>
          <Icon.lock style={{ width: 16, height: 16, color: 'var(--info)', flexShrink: 0, marginTop: 2 }} />
          <div>위치는 출퇴근 인식에만 사용되며, 근무 시간 외에는 추적하지 않아요.</div>
        </div>

        <div className="flex-1"/>
        <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block">다음</button>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ⑳-5 근무시간 / 패턴 안내
function MobOnbSchedule() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <OnbProgress step={4} />
      <div className="hf-appbar"><Icon.chevL className="icon-22 c-body" /></div>
      <div className="hf-screen" style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 className="t-display-lg mb-6">근무시간을 확인하세요</h1>
        <div className="t-body c-muted mb-20">관리자가 설정한 표준 시간이에요</div>

        {/* 시간 카드 */}
        <div className="hf-card" style={{ padding: 18, background: 'var(--brand)', color: 'var(--white)', marginBottom: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>표준 근무시간</div>
          <div className="row g-14 mt-8">
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>출근</div>
              <div className="num" style={{ fontSize: 26, fontWeight: 700 }}>09:00</div>
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.3)' }}/>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>퇴근</div>
              <div className="num" style={{ fontSize: 26, fontWeight: 700 }}>18:00</div>
            </div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            점심 12:00–13:00 · 주 40시간
          </div>
        </div>

        <div className="fs-13 fw-700 mb-8">근무 패턴</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 16 }}>
          {[
            { d: '월', on: true }, { d: '화', on: true }, { d: '수', on: true },
            { d: '목', on: true }, { d: '금', on: true },
            { d: '토', on: false }, { d: '일', on: false },
          ].map((d, i) => (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: 10,
              background: d.on ? 'var(--brand-soft)' : 'var(--grey-100)',
              color: d.on ? 'var(--brand)' : 'var(--grey-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700 }}>{d.d}</div>
          ))}
        </div>

        <div className="hf-card" style={{ padding: 14, marginBottom: 10 }}>
          <div className="row g-10">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--warn-soft)', color: 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.clock className="icon-18"/>
            </div>
            <div className="flex-1">
              <div className="fs-13 fw-700">초과근무는 자동으로 감지돼요</div>
              <div className="t-caption">18시 이후 근무 시 승인 요청이 필요해요</div>
            </div>
          </div>
        </div>

        <div className="hf-card" style={{ padding: 14 }}>
          <div className="row g-10">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.calendar className="icon-18"/>
            </div>
            <div className="flex-1">
              <div className="fs-13 fw-700">연차는 매월 1일 자동 발생</div>
              <div className="t-caption">입사일 기준 · 1년 후 15일 부여</div>
            </div>
          </div>
        </div>

        <div className="flex-1"/>
        <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block">다음</button>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ⑳-6 알림 설정
function MobOnbNotifications() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <OnbProgress step={5} />
      <div className="hf-appbar"><Icon.chevL className="icon-22 c-body" /></div>
      <div className="hf-screen" style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 className="t-display-lg mb-6">알림을 받을까요?</h1>
        <div className="t-body c-muted mb-20">중요한 일은 놓치지 않게요</div>

        {[
          { l: '출퇴근 알림', s: '출근 시간 10분 전', on: true },
          { l: '연차 소멸 안내', s: '소멸 30일 전 / 7일 전', on: true },
          { l: '초과근무 승인 결과', s: '관리자 승인 즉시', on: true },
          { l: '팀원 일정 공유', s: '팀원이 연차/재택 등록 시', on: false },
          { l: '주간 리포트', s: '매주 월요일 09:00', on: true },
          { l: '공지사항', s: '회사 공지 등록 시', on: true },
        ].map((n, i) => (
          <div key={i} className="hf-card" style={{ padding: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="flex-1">
              <div className="fs-14 fw-600">{n.l}</div>
              <div className="t-caption">{n.s}</div>
            </div>
            <div style={{
              width: 40, height: 24, borderRadius: 'var(--r-md)',
              background: n.on ? 'var(--brand)' : 'var(--grey-200)',
              position: 'relative', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', top: 2, left: n.on ? 18 : 2,
                width: 20, height: 20, borderRadius: 10, background: 'var(--white)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)', transition: 'left 0.2s' }}/>
            </div>
          </div>
        ))}

        <div className="flex-1"/>
        <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block mb-8">다음</button>
        <button className="hf-btn hf-btn-secondary hf-btn-medium hf-btn-block" style={{ background: 'transparent', color: 'var(--grey-500)' }}>나중에 설정하기</button>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ⑳-7 위젯 추천
function MobOnbWidget() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <OnbProgress step={6} />
      <div className="hf-screen" style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 className="t-display-lg mb-6">홈 화면에 위젯을 추가할까요?</h1>
        <div className="t-body c-muted mb-24">앱을 열지 않고도 출근할 수 있어요</div>

        {/* 위젯 미리보기 */}
        <div style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          borderRadius: 22, padding: 24, marginBottom: 20,
          display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 144, height: 144, background: 'var(--white)', borderRadius: 22, padding: 14, boxShadow: '0 6px 20px rgba(0,0,0,0.18)' }}>
            <div className="fs-10 c-mute">오늘 근무</div>
            <div className="num fs-22 fw-700 mt-2">6h 12m</div>
            <div style={{
              height: 5, background: 'var(--grey-100)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: '70%', height: '100%', background: 'var(--brand)' }}/>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--success)' }}/>
              <span className="fs-10 c-muted">본사 · 09:02 출근</span>
            </div>
            <div style={{ marginTop: 12, padding: '6px 0', textAlign: 'center', background: 'var(--brand)', color: 'var(--white)', borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 700 }}>퇴근하기</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { l: 'Small', s: '근무시간만', on: false },
            { l: 'Medium', s: '근무 + 팀', on: true },
            { l: 'Large', s: '풀 대시보드', on: false },
          ].map((s, i) => (
            <div key={i} style={{
              padding: 12, borderRadius: 10,
              border: s.on ? '2px solid var(--brand)' : '1px solid var(--grey-200)',
              background: s.on ? 'var(--brand-soft)' : '#fff',
              textAlign: 'center',
              gridColumn: i === 2 ? 'span 2' : 'auto' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.on ? 'var(--brand)' : 'var(--grey-900)' }}>{s.l}</div>
              <div className="t-caption">{s.s}</div>
            </div>
          ))}
        </div>

        <div className="flex-1"/>
        <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block mb-8">위젯 추가하기</button>
        <button className="hf-btn hf-btn-medium hf-btn-block" style={{ background: 'transparent', color: 'var(--grey-500)' }}>나중에 할게요</button>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ⑳-8 완료 + 첫 출근 가이드
function MobOnbDone() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-screen" style={{ padding: '60px 24px 24px', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 40,
          background: 'var(--success-soft)',
          margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.check className="icon-44 c-success" />
        </div>

        <h1 className="t-display-hero" style={{ marginBottom: 10, fontSize: 26 }}>준비 완료!</h1>
        <div className="t-body-lg c-muted mb-24">
          첫 출근, 김지우님을 응원해요 🎉<br/>아래 가이드를 따라가 보세요
        </div>

        <div style={{ background: 'var(--grey-50)', borderRadius: 14, padding: 4, textAlign: 'left' }}>
          {[
            { n: 1, l: '본사 도착하면 자동 출근', s: 'GPS가 위치를 인식해요', done: false },
            { n: 2, l: '점심 후 휴게 등록', s: '12:00–13:00 자동 차감', done: false },
            { n: 3, l: '퇴근은 직접 탭하기', s: '오늘 근무가 마무리돼요', done: false },
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderBottom: i < 2 ? '1px solid var(--grey-100)' : 'none' }}>
              <div style={{
                width: 26, height: 26, borderRadius: 13,
                background: 'var(--brand-soft)', color: 'var(--brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{it.n}</div>
              <div className="flex-1">
                <div className="fs-14 fw-600">{it.l}</div>
                <div className="t-caption">{it.s}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1"/>
        <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block">홈으로 가기</button>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// ㉑ 추가 사용자 페이지 (보조)
// ═════════════════════════════════════════════════════════

// ㉑-A 출장/외근 등록
function MobBusinessTrip() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-appbar">
        <Icon.chevL className="icon-22 c-body" />
        <h1 className="flex-1">출장 · 외근 등록</h1>
      </div>
      <div className="hf-screen" style={{ padding: '4px 16px 16px' }}>

        {/* 유형 선택 */}
        <div className="hf-card" style={{ padding: 6, display: 'flex', gap: 4, marginBottom: 12 }}>
          {['외근', '출장', '재택', '외부 미팅'].map((t, i) => (
            <div key={i} style={{
              flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 'var(--r-sm)',
              background: i === 1 ? 'var(--brand)' : 'transparent',
              color: i === 1 ? '#fff' : 'var(--grey-700)',
              fontSize: 12, fontWeight: 600 }}>{t}</div>
          ))}
        </div>

        {/* 기간 */}
        <div className="hf-card" style={{ padding: 16, marginBottom: 10 }}>
          <div className="fs-12 fw-700 c-mute mb-10">기간</div>
          <div className="row g-10">
            <div className="flex-1">
              <div className="t-caption">시작</div>
              <div className="num t-heading-sm">5/26 (화)</div>
              <div className="fs-12 c-muted">09:00</div>
            </div>
            <Icon.chevR className="icon-16 c-faint" />
            <div className="flex-1">
              <div className="t-caption">종료</div>
              <div className="num t-heading-sm">5/27 (수)</div>
              <div className="fs-12 c-muted">18:00</div>
            </div>
          </div>
        </div>

        {/* 장소 */}
        <div className="hf-card" style={{ padding: 16, marginBottom: 10 }}>
          <div className="fs-12 fw-700 c-mute mb-10">장소</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--grey-50)', borderRadius: 'var(--r-sm)' }}>
            <Icon.map className="icon-18 c-brand"/>
            <div className="flex-1 fs-13">부산 해운대 · 누리마루 APEC하우스</div>
          </div>
        </div>

        {/* 사유 */}
        <div className="hf-card" style={{ padding: 16, marginBottom: 10 }}>
          <div className="fs-12 fw-700 c-mute mb-10">사유</div>
          <div className="fs-13 lh-1-5 c-body">분기 클라이언트 미팅 — 신제품 데모 및 계약 협의</div>
        </div>

        {/* 결재선 */}
        <div className="hf-card" style={{ padding: 14, marginBottom: 10 }}>
          <div className="fs-12 fw-700 c-mute mb-10">결재선</div>
          <div className="row g-10">
            <Avatar n="박민지" size={32} />
            <div className="flex-1 fs-13"><b>박민지</b> · 디자인 팀장</div>
            <span className="hf-chip success">자동</span>
          </div>
        </div>

        <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block mt-10">제출하기</button>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ㉑-B 마이 페이지 풀버전
function MobProfileFull() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-screen" style={{ padding: 0 }}>

        {/* 프로필 헤더 */}
        <div style={{ padding: '24px 20px 20px', background: 'var(--brand)', color: 'var(--white)', position: 'relative' }}>
          <div className="row-start mb-16">
            <Icon.settings style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.8)' }} />
            <Icon.bell style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.8)' }} />
          </div>
          <div className="row g-14">
            <Avatar n="김지우" size={64} color="rgba(255,255,255,0.25)" />
            <div>
              <div className="fs-20 fw-700">김지우</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>디자인 · 시니어</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>M-0124 · 입사 2년 4개월</div>
            </div>
          </div>
        </div>

        {/* KPI 4개 */}
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { l: '이번 달 근무', v: '142h', d: '평균 +3.2h', c: 'var(--success)' },
            { l: '잔여 연차', v: '11일', d: '소멸 임박 2일', c: 'var(--warn)' },
            { l: '평균 출근', v: '08:54', d: '6분 일찍', c: 'var(--brand)' },
            { l: '초과 누적', v: '4.3h', d: '이번 주', c: 'var(--grey-700)' },
          ].map((k, i) => (
            <div key={i} className="hf-card" style={{ padding: 12 }}>
              <div className="t-caption">{k.l}</div>
              <div className="num fs-20 fw-700 mt-2">{k.v}</div>
              <div style={{ fontSize: 10, color: k.c, marginTop: 2, fontWeight: 600 }}>{k.d}</div>
            </div>
          ))}
        </div>

        {/* 메뉴 */}
        <div style={{ padding: '0 16px 16px' }}>
          {[
            { i: Icon.calendar, l: '연차 사용 내역', s: '15일 중 4일 사용' },
            { i: Icon.clock, l: '근무 기록', s: '상세 출퇴근 시간' },
            { i: Icon.chart, l: '월간 리포트', s: '근무 패턴 분석' },
            { i: Icon.inbox, l: '내 신청 내역', s: '연차·초과·외근' },
            { i: Icon.bell, l: '알림 설정', s: '6개 활성' },
            { i: Icon.user, l: '계정 정보', s: '비밀번호·언어' },
          ].map((m, i) => (
            <div key={i} className="hf-card" style={{ padding: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grey-100)', color: 'var(--grey-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <m.i className="icon-18"/>
              </div>
              <div className="flex-1">
                <div className="fs-14 fw-600">{m.l}</div>
                <div className="t-caption">{m.s}</div>
              </div>
              <Icon.chevR className="icon-16 c-faint" />
            </div>
          ))}
        </div>
      </div>
      <TabBar active="me" />
      <div className="hf-phone-home" />
    </div>
  );
}

// ㉑-C 도움말 / FAQ
function MobHelp() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-appbar">
        <Icon.chevL className="icon-22 c-body" />
        <h1 className="flex-1">도움말</h1>
      </div>
      <div className="hf-screen" style={{ padding: '4px 16px 16px' }}>

        {/* 검색 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'var(--grey-100)', borderRadius: 'var(--r-md)', marginBottom: 14 }}>
          <Icon.search className="icon-18 c-mute"/>
          <div className="fs-14 c-mute">도움말 검색...</div>
        </div>

        {/* 빠른 액션 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div className="hf-card" style={{ padding: 14, textAlign: 'center' }}>
            <Icon.bell style={{ width: 22, height: 22, color: 'var(--brand)', margin: '0 auto 6px' }}/>
            <div className="fs-13 fw-700">새 기능</div>
          </div>
          <div className="hf-card" style={{ padding: 14, textAlign: 'center' }}>
            <Icon.team style={{ width: 22, height: 22, color: 'var(--brand)', margin: '0 auto 6px' }}/>
            <div className="fs-13 fw-700">관리자 문의</div>
          </div>
        </div>

        <div className="fs-13 fw-700 mb-8">자주 묻는 질문</div>

        {[
          { q: '재택 위치는 어떻게 추가하나요?', open: true, a: '마이 → 위치 설정에서 "재택 위치 추가"를 누르고, 현재 위치를 등록하면 돼요. 최대 3개까지 등록할 수 있어요.' },
          { q: 'GPS가 본사를 인식하지 못해요' },
          { q: '연차는 언제 자동 발생하나요?' },
          { q: '초과근무 승인은 누가 하나요?' },
          { q: '출퇴근 시간을 수정하려면?' },
          { q: '비밀번호를 잊어버렸어요' },
        ].map((f, i) => (
          <div key={i} className="hf-card" style={{ padding: 14, marginBottom: 6 }}>
            <div className="row g-10">
              <div style={{ flex: 1, fontSize: 14, fontWeight: f.open ? 700 : 600 }}>{f.q}</div>
              <Icon.chevD style={{ width: 16, height: 16, color: 'var(--grey-400)', transform: f.open ? 'rotate(180deg)' : 'none' }} />
            </div>
            {f.open && f.a && (
              <div style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--grey-100)' }}>{f.a}</div>
            )}
          </div>
        ))}

        <div className="hf-card" style={{ padding: 14, marginTop: 14, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.bell className="icon-18"/>
          </div>
          <div className="flex-1">
            <div className="fs-13 fw-700 c-brand">관리자에게 문의하기</div>
            <div className="fs-12 c-muted">박민지 · 디자인 팀장 · 평균 응답 30분</div>
          </div>
          <Icon.chevR className="icon-16 c-brand" />
        </div>

      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

Object.assign(window, {
  MobCompliance, MobComplianceBlock, AdminCompliance,
  MobTeamCalendar, WebTeamCalendar,
  MobOnbWelcome, MobOnbCompanyCode, MobOnbProfile, MobOnbLocation,
  MobOnbSchedule, MobOnbNotifications, MobOnbWidget, MobOnbDone,
  MobBusinessTrip, MobProfileFull, MobHelp,
  AdminSidebar });
