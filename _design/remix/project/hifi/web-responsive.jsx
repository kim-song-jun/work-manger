// 반응형 데스크탑 — 같은 대시보드를 1440 / 1280 / 1024 / 768 레이아웃으로
// 재설계 2026-04-25: 데스크탑과 동일한 워크스페이스 크롬/밀도,
// 브레이크포인트별로 무엇을 강조할지 명확히 결정한다.
//
//   1440 XL : 3열 (Today / Team now / Activity) + 좌측 + 우측 레일
//   1280 LG : 3열 but 더 빡빡 · 우측 레일 접힘
//   1024 MD : 2열 + 아이콘 레일 · Team now 와 Activity 를 탭으로 병합
//    768 타블렛 : 1열 스택 · Now 상태를 상단 히어로로, 주요 3~4개 블록만

function WebDashResponsive({ width }) {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  const isXL = width >= 1440;
  const isLG = width >= 1280 && width < 1440;
  const isMD = width >= 1024 && width < 1280;
  const isTablet = width < 1024;
  const railMode = isMD; // icon-only rail on MD, hidden on tablet

  const sidebarW = isTablet ? 0 : railMode ? 56 : 208;

  const nav = [
    ['home', Icon.home, ko ? '대시보드' : 'Dashboard', true],
    ['my', Icon.clock, ko ? '내 근무' : 'My time'],
    ['leave', Icon.calendar, ko ? '연차' : 'Leave', null, '3'],
    ['team', Icon.team, ko ? '팀' : 'Team'],
    ['inbox', Icon.inbox, ko ? '요청함' : 'Inbox', null, '1'],
  ];

  // Main grid columns
  const mainCols = isXL ? '1.4fr 1fr' : isLG ? '1.3fr 1fr' : isMD ? '1fr 1fr' : '1fr';

  return (
    <div className="hf-web" style={{ width: '100%', height: '100%', background: 'var(--white)' }}>
      <div className="hf-webbar">
        <div className="dots"><i style={{background:'#FF5F57'}}/><i style={{background:'#FEBC2E'}}/><i style={{background:'#28C840'}}/></div>
        <div className="url">workday.app/acme · {width}px</div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ display: 'flex', height: 'calc(100% - 32px)', minHeight: 0, background: 'var(--grey-50)' }}>
        {/* ─── Sidebar ─── */}
        {!isTablet && (
          <aside style={{
            width: sidebarW, flexShrink: 0,
            borderRight: '1px solid var(--grey-200)', background: 'var(--white)',
            display: 'flex', flexDirection: 'column' }}>
            {/* Workspace header */}
            <div style={{
              padding: railMode ? '10px 6px' : '10px 10px 10px 12px',
              display: 'flex', alignItems: 'center', gap: 8,
              justifyContent: railMode ? 'center' : 'flex-start',
              borderBottom: '1px solid var(--grey-200)', cursor: 'pointer' }}>
              <div style={{
                width: 26, height: 26, borderRadius: 'var(--r-xs)', background: 'var(--grey-900)',
                color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, letterSpacing: -0.5, flexShrink: 0 }}>A</div>
              {!railMode && <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--grey-900)' }}>Acme Inc.</div>
                  <div style={{ fontSize: 10.5, color: 'var(--grey-500)' }}>{ko ? '32명' : '32 members'}</div>
                </div>
                <Icon.chevD style={{ width: 13, height: 13, color: 'var(--grey-400)' }}/>
              </>}
            </div>

            {!railMode && (
              <div style={{ padding: '10px 10px 4px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 5,
                  background: 'var(--grey-100)', color: 'var(--grey-500)',
                  fontSize: 12.5, cursor: 'pointer' }}>
                  <Icon.search className="icon-12"/>
                  <span className="flex-1">{ko ? '검색' : 'Search'}</span>
                  <kbd style={{ fontSize: 9.5, fontWeight: 600, background: 'var(--white)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--grey-200)' }}>⌘K</kbd>
                </div>
              </div>
            )}

            <div style={{ padding: railMode ? '8px 4px' : '6px 8px' }}>
              {nav.map(([k, IC, l, active, badge]) => (
                <div key={k} title={railMode ? l : ''} style={{
                  display: 'flex', alignItems: 'center', position: 'relative',
                  gap: railMode ? 0 : 9,
                  justifyContent: railMode ? 'center' : 'flex-start',
                  padding: railMode ? '8px 0' : '5px 10px',
                  borderRadius: 5, marginBottom: 1, cursor: 'pointer',
                  background: active ? 'var(--grey-100)' : 'transparent',
                  color: active ? 'var(--grey-900)' : 'var(--grey-700)',
                  fontSize: 12.5, fontWeight: active ? 600 : 500 }}>
                  <IC style={{ width: 15, height: 15, color: active ? 'var(--grey-800)' : 'var(--grey-500)' }}/>
                  {!railMode && <span className="flex-1">{l}</span>}
                  {!railMode && badge && <span style={{
                    background: 'var(--grey-200)', color: 'var(--grey-700)',
                    fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '1px 5px',
                    fontFamily: 'var(--font-num)' }}>{badge}</span>}
                  {railMode && badge && <span style={{
                    position: 'absolute', top: 4, right: 6,
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }}/>}
                </div>
              ))}
            </div>

            {/* Footer user */}
            <div style={{ marginTop: 'auto', padding: railMode ? '10px 6px' : 10, borderTop: '1px solid var(--grey-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: railMode ? 'center' : 'flex-start' }}>
                <div style={{ position: 'relative' }}>
                  <Avatar n="김지우" size={26}/>
                  <span style={{ position: 'absolute', right: -1, bottom: -1, width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--white)' }}/>
                </div>
                {!railMode && <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fs-12 fw-600">{ko ? '김지우' : 'Jiwoo Kim'}</div>
                    <div className="fs-10 c-mute">{ko ? '근무 중' : 'Working'}</div>
                  </div>
                  <Icon.settings style={{ width: 13, height: 13, color: 'var(--grey-500)' }}/>
                </>}
              </div>
            </div>
          </aside>
        )}

        {/* ─── Main column ─── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <header style={{
            height: isTablet ? 48 : 42, flexShrink: 0, padding: isTablet ? '0 14px' : '0 18px',
            borderBottom: '1px solid var(--grey-200)', background: 'var(--white)',
            display: 'flex', alignItems: 'center', gap: 10 }}>
            {isTablet && (
              <div style={{ width: 26, height: 26, borderRadius: 5, background: 'var(--grey-900)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>A</div>
            )}
            <div style={{ flex: 1, fontSize: 13, color: 'var(--grey-600)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {!isTablet && <span>{ko ? '내 워크스페이스' : 'My workspace'}</span>}
              {!isTablet && <span style={{ color: 'var(--grey-300)' }}>/</span>}
              <span className="c-primary fw-600">{ko ? '대시보드' : 'Dashboard'}</span>
            </div>
            {!isTablet && (
              <button style={{
                height: 26, padding: '0 10px', fontSize: 12, fontWeight: 600,
                background: 'var(--grey-900)', color: 'var(--white)', border: 'none', borderRadius: 5,
                display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <Icon.plus className="icon-12"/>
                {ko ? '연차 신청' : 'Request leave'}
              </button>
            )}
            <button style={{
              position: 'relative',
              width: 28, height: 28, border: 'none', background: 'transparent',
              borderRadius: 5, cursor: 'pointer', color: 'var(--grey-600)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.bell style={{ width: 15, height: 15 }}/>
              <span style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }}/>
            </button>
          </header>

          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: isTablet ? 14 : isMD ? 14 : 16 }}>
            {/* ─── HERO (tablet only): big now card ─── */}
            {isTablet && (
              <div style={{
                background: 'var(--grey-900)', color: 'var(--white)', borderRadius: 10,
                padding: '16px 18px', marginBottom: 12 }}>
                <div className="row g-8 mb-12">
                  <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#2DCB74' }}>
                    <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: '#2DCB74', opacity: 0.3 }}/>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>{ko ? '근무 중' : 'Working'}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>{ko ? '본사 · 5층' : 'HQ · 5F'}</span>
                </div>
                <div className="row-end g-16">
                  <div>
                    <div style={{ fontSize: 10.5, opacity: 0.7, marginBottom: 2 }}>{ko ? '출근' : 'Clocked in'}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-num)', letterSpacing: -0.5 }}>08:54</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, opacity: 0.7, marginBottom: 2 }}>{ko ? '진행' : 'Elapsed'}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-num)', letterSpacing: -0.5 }}>6h 30m</div>
                  </div>
                  <div className="flex-1"/>
                  <div className="row g-6">
                    <button style={tabletBtn(false)}>{ko ? '휴게' : 'Break'}</button>
                    <button style={tabletBtn(true)}>{ko ? '퇴근' : 'Out'}</button>
                  </div>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: 12 }}>
                  <div style={{ height: '100%', width: '81%', background: '#2DCB74', borderRadius: 2 }}/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginTop: 4, opacity: 0.7 }}>
                  <span>{ko ? '81% 진행' : '81% done'}</span>
                  <span>{ko ? '예정 퇴근 18:00' : 'Est. out 18:00'}</span>
                </div>
              </div>
            )}

            {/* ─── NON-tablet: compact status strip ─── */}
            {!isTablet && (
              <div style={{
                background: 'var(--white)', border: '1px solid var(--grey-200)', borderRadius: 'var(--r-sm)',
                padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 18,
                fontSize: 13, marginBottom: 12 }}>
                <div className="row g-8">
                  <span style={{ position: 'relative', width: 9, height: 9, borderRadius: '50%', background: 'var(--success)' }}>
                    <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: 'var(--success)', opacity: 0.25 }}/>
                  </span>
                  <span className="fw-600">{ko ? '근무 중' : 'Working'}</span>
                </div>
                <Meta2 label={ko ? '출근' : 'In'} value="08:54"/>
                <Meta2 label={ko ? '진행' : 'Elapsed'} value="6h 30m" strong/>
                {!isMD && <Meta2 label={ko ? '예정 퇴근' : 'Est. out'} value="18:00"/>}
                <Meta2 label={ko ? '위치' : 'Loc.'} value={ko ? '본사 5F' : 'HQ · 5F'}/>
                <div className="flex-1"/>
                <div className="row g-6">
                  <button style={toolBtn()}>{ko ? '휴게' : 'Break'}</button>
                  <button style={toolBtn(true)}>{ko ? '퇴근' : 'Clock out'}</button>
                </div>
              </div>
            )}

            {/* ─── Tablet: condensed stat row ─── */}
            {isTablet && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <HeroStat
                  label={ko ? '잔여 연차' : 'Leave'}
                  value="9"
                  unit={ko ? '일' : 'd'}
                  caption={ko ? '12/31 3일 소멸' : '3 expire 12/31'}
                  captionWarn
                  pct={60}
                  accent="var(--warn)"
                />
                <HeroStat
                  label={ko ? '이번 주' : 'This week'}
                  value="32"
                  unit="h"
                  caption={ko ? '+1.2h 평균 대비' : '+1.2h vs avg'}
                  pct={80}
                  accent="var(--grey-900)"
                />
              </div>
            )}

            {/* ─── Main grid ─── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: mainCols,
              gap: isMD ? 10 : 12 }}>
              {/* Today panel — always first */}
              <FlatPanel
                title={ko ? '오늘의 근무' : 'Today'}
                meta={ko ? '수 · 4월 22일' : 'Wed · Apr 22'}
                pad={0}
              >
                <TodayMiniTimeline ko={ko} compact={isMD}/>
              </FlatPanel>

              {/* Team now */}
              <FlatPanel
                title={ko ? '팀 현재 상태' : 'Team now'}
                meta="22 / 32"
                pad={0}
              >
                <TeamNowMini ko={ko} max={isMD ? 5 : isTablet ? 6 : 7}/>
              </FlatPanel>
            </div>

            {/* Second row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isXL || isLG ? '1fr 1fr 1fr' : isMD ? '1fr 1fr' : '1fr',
              gap: isMD ? 10 : 12,
              marginTop: isMD ? 10 : 12 }}>
              {/* Leave balance (hide on tablet — already shown in hero stat) */}
              {!isTablet && (
                <FlatPanel title={ko ? '연차' : 'Leave'}>
                  <LeaveDetail ko={ko}/>
                </FlatPanel>
              )}

              {/* Weekly stats */}
              <FlatPanel title={ko ? '이번 주' : 'This week'}>
                <WeeklyStats ko={ko}/>
              </FlatPanel>

              {/* Activity */}
              <FlatPanel
                title={ko ? '활동' : 'Activity'}
                action={<span style={{ fontSize: 10.5, color: 'var(--grey-500)', cursor: 'pointer' }}>{ko ? '모두' : 'All'}</span>}
                pad={0}
              >
                <ActivityFeedMini ko={ko} max={isMD ? 3 : 4}/>
              </FlatPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────
function Meta2({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
      <span className="t-caption">{label}</span>
      <span style={{ fontSize: 13, fontWeight: strong ? 700 : 500, fontFamily: 'var(--font-num)', color: 'var(--grey-900)' }}>{value}</span>
    </div>
  );
}

function toolBtn(dark) {
  return {
    height: 28, padding: '0 10px', fontSize: 12, fontWeight: 600,
    border: '1px solid ' + (dark ? 'var(--grey-900)' : 'var(--grey-200)'),
    background: dark ? 'var(--grey-900)' : 'var(--white)',
    color: dark ? '#fff' : 'var(--grey-800)',
    borderRadius: 5, cursor: 'pointer'
  };
}

function tabletBtn(dark) {
  return {
    height: 34, padding: '0 16px', fontSize: 13, fontWeight: 700, border: 'none',
    background: dark ? '#fff' : 'rgba(255,255,255,0.15)',
    color: dark ? 'var(--grey-900)' : '#fff',
    borderRadius: 'var(--r-xs)', cursor: 'pointer'
  };
}

function FlatPanel({ title, meta, action, pad = 14, children }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--grey-200)', borderRadius: 'var(--r-sm)',
      display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {title && (
        <div style={{
          padding: '9px 12px', borderBottom: '1px solid var(--grey-200)',
          display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="fs-12 fw-600 c-strong">{title}</div>
          {meta && <span style={{ fontSize: 10.5, color: 'var(--grey-500)', fontFamily: 'var(--font-num)' }}>{meta}</span>}
          <div className="flex-1"/>
          {action}
        </div>
      )}
      <div style={{ padding: pad, minHeight: 0, flex: 1 }}>{children}</div>
    </div>
  );
}

function HeroStat({ label, value, unit, caption, captionWarn, pct, accent }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--grey-200)',
      borderRadius: 10, padding: '12px 14px' }}>
      <div className="fs-12 c-mute fw-500">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 2 }}>
        <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-num)', letterSpacing: -0.5, color: 'var(--grey-900)' }}>{value}</span>
        <span className="fs-13 c-mute">{unit}</span>
      </div>
      <div style={{ height: 4, background: 'var(--grey-100)', borderRadius: 2, marginTop: 8 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: accent, borderRadius: 2 }}/>
      </div>
      <div style={{ fontSize: 10.5, color: captionWarn ? 'var(--danger)' : 'var(--grey-600)', marginTop: 6, fontWeight: captionWarn ? 600 : 500 }}>{caption}</div>
    </div>
  );
}

// Today mini timeline
function TodayMiniTimeline({ ko, compact }) {
  const startH = 9, endH = 19;
  const hours = Array.from({ length: endH - startH + 1 }, (_, i) => startH + i);
  const pct = (h, m = 0) => ((h + m/60 - startH) / (endH - startH)) * 100;
  const now = pct(15, 24);
  const events = [
    { from: [8, 54], to: [12, 0], label: ko ? '오전' : 'AM', color: 'var(--brand)' },
    { from: [12, 0], to: [13, 0], label: ko ? '점심' : 'Lunch', color: 'var(--grey-300)' },
    { from: [13, 0], to: [14, 0], label: ko ? '스탠드업' : 'Standup', color: 'var(--purple)' },
    { from: [14, 0], to: [15, 24], label: ko ? '오후' : 'PM', color: 'var(--brand)' },
  ];
  return (
    <div style={{ padding: compact ? '10px 12px 12px' : '12px 14px 14px' }}>
      <div className="row-baseline g-12 wrap mb-10">
        <div className="row-baseline g-4">
          <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-num)', letterSpacing: -0.5, color: 'var(--grey-900)' }}>6h 30m</span>
          <span className="t-caption">/ 8h {ko ? '목표' : 'goal'}</span>
        </div>
        <span className="t-caption">
          {ko ? '남은' : 'Remaining'} <b style={{ color: 'var(--grey-900)', fontFamily: 'var(--font-num)' }}>2h 36m</b>
        </span>
        <div className="flex-1"/>
        <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: 'var(--grey-600)' }}>
          <LegendMini c="var(--brand)" l={ko ? '근무' : 'Work'} v="6h 30m"/>
          {!compact && <LegendMini c="var(--grey-300)" l={ko ? '휴게' : 'Break'} v="1h"/>}
          {!compact && <LegendMini c="var(--purple)" l={ko ? '회의' : 'Mtg'} v="1h"/>}
        </div>
      </div>

      <div style={{ position: 'relative', height: 44, borderRadius: 5, background: 'var(--grey-50)', border: '1px solid var(--grey-200)' }}>
        {hours.slice(1, -1).map((h, i) => (
          <div key={h} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${((i + 1) / (hours.length - 1)) * 100}%`,
            borderLeft: '1px solid var(--grey-200)' }}/>
        ))}
        {events.map((e, i) => {
          const L = pct(e.from[0], e.from[1]);
          const W = pct(e.to[0], e.to[1]) - L;
          return (
            <div key={i} title={e.label} style={{
              position: 'absolute', top: 6, bottom: 6,
              left: `${L}%`, width: `${W}%`,
              background: e.color, borderRadius: 3,
              padding: '0 6px', display: 'flex', alignItems: 'center',
              color: 'var(--white)', fontSize: 10, fontWeight: 600,
              overflow: 'hidden', whiteSpace: 'nowrap' }}>{W > 8 ? e.label : ''}</div>
          );
        })}
        <div style={{
          position: 'absolute', top: -4, bottom: -4,
          left: `${pct(17, 0)}%`, width: 1,
          borderLeft: '1.5px dashed var(--grey-400)' }}/>
        <div style={{ position: 'absolute', top: -5, bottom: -5, left: `${now}%`, width: 2, background: 'var(--danger)' }}>
          <span style={{
            position: 'absolute', top: -15, left: -17, width: 36, textAlign: 'center',
            fontSize: 9.5, fontWeight: 700, fontFamily: 'var(--font-num)', color: 'var(--danger)' }}>15:24</span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 12, marginTop: 2, fontFamily: 'var(--font-num)', fontSize: 9.5, color: 'var(--grey-500)' }}>
        {hours.filter((_, i) => i % (compact ? 3 : 2) === 0).map((h) => (
          <span key={h} style={{ position: 'absolute', left: `${((h - startH) / (endH - startH)) * 100}%`, transform: 'translateX(-50%)' }}>{String(h).padStart(2,'0')}</span>
        ))}
      </div>
    </div>
  );
}

function LegendMini({ c, l, v }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <span style={{ width: 6, height: 6, borderRadius: 1.5, background: c }}/>
      {l} <b style={{ fontFamily: 'var(--font-num)', color: 'var(--grey-900)' }}>{v}</b>
    </span>
  );
}

function TeamNowMini({ ko, max }) {
  const rows = [
    ['이서현', ko ? '개발' : 'Eng', 'office', ko ? '본사' : 'HQ', '6h 23m'],
    ['박민호', ko ? '디자인' : 'Design', 'wfh', ko ? '재택' : 'WFH', '6h 12m'],
    ['최유진', ko ? '운영' : 'Ops', 'office', ko ? '본사' : 'HQ', '6h 36m'],
    ['정태윤', ko ? '개발' : 'Eng', 'break', ko ? '휴게' : 'Break', '5m'],
    ['한도윤', ko ? '개발' : 'Eng', 'office', ko ? '본사' : 'HQ', '6h 00m'],
    ['오민석', ko ? '디자인' : 'Design', 'leave', ko ? '연차' : 'Leave', '—'],
    ['서지훈', ko ? '운영' : 'Ops', 'wfh', ko ? '재택' : 'WFH', '6h 19m'],
  ];
  const summary = [
    ['office', 14, 'var(--success)'],
    ['wfh', 6, 'var(--brand)'],
    ['break', 2, 'var(--caution)'],
    ['leave', 2, 'var(--warn)'],
  ];
  const labels = { office: ko?'본사':'HQ', wfh: ko?'재택':'WFH', break: ko?'휴게':'Break', leave: ko?'연차':'Leave' };
  return (
    <div>
      <div style={{ display: 'flex', padding: '8px 12px', gap: 10, borderBottom: '1px solid var(--grey-200)', flexWrap: 'wrap' }}>
        {summary.map(([k, n, c]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: c }}/>
            <span className="c-muted">{labels[k]}</span>
            <span style={{ fontFamily: 'var(--font-num)', fontWeight: 700, color: 'var(--grey-900)' }}>{n}</span>
          </div>
        ))}
      </div>
      {rows.slice(0, max).map(([n, d, s, loc, dur], i, arr) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 8, alignItems: 'center',
          padding: '6px 12px',
          borderBottom: i < arr.length - 1 ? '1px solid var(--grey-100)' : 'none' }}>
          <Avatar n={n} size={20}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--grey-900)' }}>{n} <span className="c-mute fw-500 fs-10">· {d}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--grey-500)' }}>
              <span className={`hf-dot ${s}`} style={{ width: 5, height: 5 }}/>
              {loc}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-num)', fontSize: 10.5, fontWeight: 600, color: 'var(--grey-800)' }}>{dur}</div>
        </div>
      ))}
    </div>
  );
}

function LeaveDetail({ ko }) {
  return (
    <div>
      <div className="row-baseline g-4">
        <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-num)', letterSpacing: -0.5 }}>9</span>
        <span className="t-caption">/ 15 {ko ? '일' : 'd'}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--danger)', fontWeight: 600, background: 'var(--danger-soft)', padding: '2px 6px', borderRadius: 4 }}>
          {ko ? '3일 소멸' : '3 expire'}
        </span>
      </div>
      <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 10, background: 'var(--grey-100)' }}>
        <div style={{ width: '26%', background: 'var(--grey-400)' }}/>
        <div style={{ width: '13%', background: 'var(--warn)' }}/>
        <div style={{ width: '40%', background: 'var(--brand)' }}/>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 10.5 }}>
        <LegendMini c="var(--grey-400)" l={ko ? '사용' : 'Used'} v="4"/>
        <LegendMini c="var(--warn)" l={ko ? '예정' : 'Sch.'} v="2"/>
        <LegendMini c="var(--brand)" l={ko ? '남음' : 'Avail'} v="9"/>
      </div>
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--grey-200)', fontSize: 12.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--grey-600)', marginBottom: 3 }}>
          <span>{ko ? '다음 휴가' : 'Next off'}</span>
          <span className="c-primary fw-600">{ko ? '5/3 ~ 5/5' : 'May 3–5'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--grey-600)' }}>
          <span>{ko ? '소멸일' : 'Expiry'}</span>
          <span className="c-danger fw-600">12/31 · 3{ko ? '일' : 'd'}</span>
        </div>
      </div>
    </div>
  );
}

function WeeklyStats({ ko }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
        <MiniStat2 label={ko ? '정시' : 'On time'} value="94%" delta="+2" up/>
        <MiniStat2 label={ko ? '평균' : 'Avg hrs'} value="8h 12m" delta="+18m" up/>
        <MiniStat2 label={ko ? '초과' : 'OT'} value="4.3h" delta="+1.1" warn up/>
        <MiniStat2 label={ko ? '재택' : 'Remote'} value="1d" delta="—"/>
      </div>
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--grey-200)' }}>
        <div style={{ fontSize: 10.5, color: 'var(--grey-500)', marginBottom: 5 }}>{ko ? '일별' : 'By day'}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
          {[6.8, 8.2, 9.1, 8.5, 7.2, 0, 0].map((v, i) => {
            const today = i === 2;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{
                  width: '100%', height: v ? `${(v/10)*22}px` : '2px',
                  background: today ? 'var(--grey-900)' : v > 8 ? 'var(--warn)' : v ? 'var(--grey-300)' : 'var(--grey-200)',
                  borderRadius: 2 }}/>
                <span style={{ fontSize: 9, color: today ? 'var(--grey-900)' : 'var(--grey-500)', fontWeight: today ? 700 : 500 }}>
                  {['월','화','수','목','금','토','일'][i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat2({ label, value, delta, up, warn }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--grey-500)', marginBottom: 2 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-num)', color: warn ? 'var(--warn)' : 'var(--grey-900)' }}>{value}</span>
        {delta && delta !== '—' && (
          <span style={{ fontSize: 10, fontWeight: 600, color: up ? (warn ? 'var(--warn)' : 'var(--success)') : 'var(--grey-500)' }}>
            ▲{delta.replace('+','')}
          </span>
        )}
      </div>
    </div>
  );
}

function ActivityFeedMini({ ko, max }) {
  const items = [
    { who: '박PM', act: ko ? ' 초과근무 승인' : ' approved overtime', t: ko ? '방금' : 'now', emph: 'success' },
    { who: '이도현', act: ko ? ' 출근 · 본사' : ' clocked in · HQ', t: '18m', emph: 'default' },
    { who: ko ? '시스템' : 'System', act: ko ? ' 4월 리포트 준비됨' : ' April report ready', t: '3h', emph: 'info' },
    { who: '한예린', act: ko ? ' 5/10 연차 신청' : ' requested May 10', t: '5h', emph: 'default' },
    { who: ko ? '시스템' : 'System', act: ko ? ' 연차 3일 곧 소멸' : ' 3 days expiring', t: '2d', emph: 'danger' },
  ];
  return (
    <div>
      {items.slice(0, max).map((it, i, arr) => (
        <div key={i} style={{
          display: 'flex', gap: 8, padding: '8px 12px',
          borderBottom: i < arr.length - 1 ? '1px solid var(--grey-100)' : 'none' }}>
          <div style={{
            width: 4, alignSelf: 'stretch', borderRadius: 2, marginTop: 2, marginBottom: 2,
            background: it.emph === 'success' ? 'var(--success)'
              : it.emph === 'danger' ? 'var(--danger)'
              : it.emph === 'info' ? 'var(--info)'
              : 'var(--grey-200)' }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--grey-800)' }}>
              <b className="c-primary">{it.who}</b>{it.act}
            </div>
            <div style={{ fontSize: 10, color: 'var(--grey-500)', marginTop: 1, fontFamily: 'var(--font-num)' }}>{it.t}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Convenience wrappers
function WebDash1440() { return <WebDashResponsive width={1440}/>; }
function WebDash1280() { return <WebDashResponsive width={1280}/>; }
function WebDash1024() { return <WebDashResponsive width={1024}/>; }
function WebDash768()  { return <WebDashResponsive width={768}/>; }

Object.assign(window, { WebDashResponsive, WebDash1440, WebDash1280, WebDash1024, WebDash768 });
