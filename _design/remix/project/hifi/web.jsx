// Hi-fi web dashboard — Toss-style desktop
// 2026-04-25 rewrite — soft cards, generous whitespace, brand blue emphasis,
// big readable numbers (Toss DESIGN.md). Keeps WebShell/WebDashboard/WebTeamLeave/WebRecords exports.

// ─── Shared shell (Toss-style sidebar + canvas) ─────────────

function WebShell({ active = 'home', breadcrumb = [], children, actions }) {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';

  const nav = [
    ['home', Icon.home, ko ? '대시보드' : 'Dashboard'],
    ['my-time', Icon.clock, ko ? '내 근무' : 'My time'],
    ['my-leave', Icon.calendar, ko ? '내 연차' : 'My leave', '3'],
    ['team-leave', Icon.team, ko ? '팀 연차' : 'Team'],
    ['inbox', Icon.inbox, ko ? '요청함' : 'Inbox', '1'],
    ['reports', Icon.chart, ko ? '리포트' : 'Reports'],
  ];

  return (
    <div className="hf-web" style={{ background: 'var(--grey-50)', height: '100%', width: '100%' }}>
      <div className="hf-webbar">
        <div className="dots"><i style={{background:'#FF5F57'}}/><i style={{background:'#FEBC2E'}}/><i style={{background:'#28C840'}}/></div>
        <div className="url">workday.app/acme/{active}</div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
        {/* Sidebar — soft, friendly, generous */}
        <aside style={{
          width: 248, background: 'var(--white)',
          display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--brand)',
              color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 15, letterSpacing: -0.5 }}>A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-heading-sm c-primary">Acme</div>
              <div style={{ fontSize: 12.5, color: 'var(--grey-500)' }}>{ko ? '32명' : '32 members'}</div>
            </div>
          </div>

          <div style={{ padding: '8px 12px' }}>
            {nav.map(([k, IC, label, badge]) => {
              const on = k === active;
              return (
                <div key={k} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 2, cursor: 'pointer',
                  background: on ? 'var(--brand-soft)' : 'transparent',
                  color: on ? 'var(--brand)' : 'var(--grey-700)',
                  fontSize: 14, fontWeight: on ? 700 : 500 }}>
                  <IC className="icon-18"/>
                  <span className="flex-1">{label}</span>
                  {badge && <span style={{
                    background: on ? 'var(--brand)' : 'var(--grey-200)',
                    color: on ? '#fff' : 'var(--grey-700)',
                    fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '2px 8px',
                    fontFamily: 'var(--font-num)' }}>{badge}</span>}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', padding: '12px 16px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar n="김지우" size={32}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="fs-13 fw-600">{ko ? '김지우' : 'Jiwoo Kim'}</div>
              <div className="fs-12 c-success fw-600">● {ko ? '근무 중' : 'Working'}</div>
            </div>
            <Icon.settings className="icon-18 c-mute"/>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <header style={{
            height: 60, padding: '0 32px', flexShrink: 0,
            background: 'var(--grey-50)',
            display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              {breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: 'var(--grey-300)' }}>/</span>}
                  <span style={{
                    color: i === breadcrumb.length - 1 ? 'var(--grey-900)' : 'var(--grey-500)',
                    fontWeight: i === breadcrumb.length - 1 ? 700 : 500 }}>{b}</span>
                </React.Fragment>
              ))}
            </div>
            <div className="row g-8">
              {actions}
              <button style={{
                width: 36, height: 36, border: 'none', background: 'var(--white)',
                borderRadius: 10, cursor: 'pointer', position: 'relative',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.bell className="icon-18 c-body"/>
                <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', border: '2px solid var(--white)' }}/>
              </button>
            </div>
          </header>

          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Toss-style soft card
function Card({ title, action, pad = 24, style, children }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--r-lg)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
      ...style }}>
      {title && (
        <div style={{
          padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="t-heading-sm flex-1 c-primary">{title}</div>
          {action}
        </div>
      )}
      <div style={{ padding: title ? `12px ${pad}px ${pad}px` : pad, minHeight: 0, flex: 1 }}>{children}</div>
    </div>
  );
}

function ToolBtn({ icon: IC, label, primary, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      height: 36, padding: '0 14px', fontSize: 13, fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      border: 'none',
      background: primary ? 'var(--brand)' : 'var(--white)',
      color: primary ? '#fff' : 'var(--grey-800)',
      borderRadius: 10, cursor: 'pointer'
    }}>
      {IC && <IC style={{ width: 15, height: 15 }}/>}
      {label}
      {children}
    </button>
  );
}

// ─── Web Dashboard (Toss style) ─────────────────────────────
function WebDashboard() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';

  return (
    <WebShell
      active="home"
      breadcrumb={[ko ? '내 워크스페이스' : 'My workspace', ko ? '대시보드' : 'Dashboard']}
      actions={<>
        <ToolBtn icon={Icon.calendar} label={ko ? '2026 · 4월' : 'Apr 2026'}/>
        <ToolBtn primary icon={Icon.plus} label={ko ? '연차 신청' : 'Request leave'}/>
      </>}
    >
      <div style={{ padding: '12px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Greeting + live status — Toss hero */}
        <TossHero ko={ko}/>

        {/* KPI cards — soft, big numbers */}
        <KpiCards ko={ko}/>

        {/* Today + Up next */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
          <Card title={ko ? '오늘의 근무' : 'Today'}
            action={<span className="fs-13 c-mute">
              {ko ? '남은' : 'Remaining'} <b className="num c-primary fw-700">2h 36m</b>
            </span>}
            pad={0}
          >
            <TodayTimeline ko={ko}/>
          </Card>

          <Card title={ko ? '다음 일정' : 'Up next'} pad={0}>
            <UpNextList ko={ko}/>
          </Card>
        </div>

        {/* Leave overview + Pattern + Team */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1.05fr', gap: 20 }}>
          <LeaveCard ko={ko}/>
          <PatternCard ko={ko}/>
          <TeamCard ko={ko}/>
        </div>

        {/* Approvals + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card title={ko ? '요청함' : 'Approvals'}
            action={<span className="hf-chip hf-chip-info fs-12">3 {ko ? '건' : 'new'}</span>}
            pad={0}
          >
            <ApprovalsList ko={ko}/>
          </Card>
          <Card title={ko ? '최근 활동' : 'Activity'} pad={0}>
            <ActivityList ko={ko}/>
          </Card>
        </div>
      </div>
    </WebShell>
  );
}

// ─── Toss-style hero — friendly greeting + big status pill ─────
function TossHero({ ko }) {
  const progress = 6.5 / 8;
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 20, padding: 32,
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }}>
      <div>
        <div className="fs-13 c-mute fw-600 mb-6">
          {ko ? '수요일, 4월 22일' : 'Wednesday, Apr 22'}
        </div>
        <div className="t-display-lg c-primary mb-14">
          {ko ? '좋은 오후예요, 지우님' : 'Good afternoon, Jiwoo'}
        </div>
        <div className="row g-10 wrap">
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--success-soft)', color: 'var(--success)',
            padding: '8px 14px', borderRadius: 999, fontSize: 14, fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}/>
            {ko ? '근무 중' : 'Working'}
          </span>
          <span className="c-mute fs-14">
            {ko ? '출근' : 'In'} <b className="num c-primary fw-700">08:54</b>
          </span>
          <span style={{ color: 'var(--grey-300)' }}>·</span>
          <span style={{ color: 'var(--grey-500)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Icon.map className="icon-14 c-mute"/>
            {ko ? '본사 5층' : 'HQ · 5F'}
          </span>
        </div>
      </div>

      {/* Right: progress ring + clock-out CTA */}
      <div className="row g-24">
        <RingStat progress={progress} label={ko ? '근무' : 'Worked'} value="6h 30m" sub={ko ? '/ 8h 목표' : '/ 8h goal'}/>
        <div className="col g-8">
          <button style={{
            height: 52, padding: '0 28px', borderRadius: 14, border: 'none',
            background: 'var(--grey-900)', color: 'var(--white)', fontSize: 16, fontWeight: 700,
            cursor: 'pointer'
          }}>{ko ? '퇴근하기' : 'Clock out'}</button>
          <button style={{
            height: 36, padding: '0 14px', borderRadius: 10, border: 'none',
            background: 'var(--grey-100)', color: 'var(--grey-700)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer'
          }}>{ko ? '☕ 휴게 시작' : '☕ Start break'}</button>
        </div>
      </div>
    </div>
  );
}

function RingStat({ progress, label, value, sub }) {
  const r = 44, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
      <svg width="120" height="120" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} stroke="var(--grey-100)" strokeWidth="10" fill="none"/>
        <circle cx="60" cy="60" r={r} stroke="var(--brand)" strokeWidth="10" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} strokeLinecap="round"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <div className="t-caption-strong">{label}</div>
        <div className="num" style={{ fontSize: 20, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.5 }}>{value}</div>
        <div className="fs-10 c-faint">{sub}</div>
      </div>
    </div>
  );
}

// ─── KPI cards — Toss style with big numbers ───────────────
function KpiCards({ ko }) {
  const kpis = [
    { label: ko ? '이번 달 근무' : 'This month', value: '142', unit: 'h', delta: '+8%', tone: 'up' },
    { label: ko ? '정시 출근율' : 'On-time rate', value: '94', unit: '%', delta: '+2%', tone: 'up' },
    { label: ko ? '이번 주 초과' : 'OT this week', value: '4.3', unit: 'h', delta: ko ? '평균보다 +1h' : '+1h vs avg', tone: 'warn' },
    { label: ko ? '연차 잔여' : 'Leave left', value: '9', unit: ko ? '일' : 'd', delta: ko ? '3일 소멸 임박' : '3 expiring', tone: 'danger' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
      {kpis.map((k, i) => (
        <div key={i} style={{
          background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 24,
          display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="fs-13 c-muted fw-500">{k.label}</div>
          <div className="row-baseline g-4">
            <span className="num" style={{ fontSize: 36, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.5 }}>{k.value}</span>
            <span className="fs-18 c-mute fw-700">{k.unit}</span>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700,
            color: k.tone === 'warn' ? 'var(--warn)' : k.tone === 'danger' ? 'var(--danger)' : 'var(--success)' }}>{k.delta}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Today timeline (lighter, Toss-friendly) ───────────────
function TodayTimeline({ ko }) {
  const startH = 8, endH = 20;
  const hours = Array.from({ length: endH - startH + 1 }, (_, i) => startH + i);
  const pct = (h, m = 0) => ((h + m/60 - startH) / (endH - startH)) * 100;
  const now = pct(15, 24);

  const blocks = [
    { from: [8, 54], to: [12, 0], label: ko ? '오전 집중' : 'Focus', color: 'var(--brand)' },
    { from: [12, 0], to: [13, 0], label: ko ? '점심' : 'Lunch', color: 'var(--grey-200)', text: 'var(--grey-700)' },
    { from: [13, 0], to: [15, 24], label: ko ? '오후 근무' : 'Afternoon', color: 'var(--brand)' },
    { from: [15, 24], to: [18, 0], label: ko ? '예정' : 'Planned', color: 'var(--brand-soft)', text: 'var(--brand)', dashed: true },
    { from: [18, 0], to: [19, 30], label: ko ? '초과 예상' : 'Overtime', color: 'var(--warn-soft)', text: 'var(--warn)', dashed: true },
  ];
  const meetings = [
    { from: [10, 0], to: [10, 30], label: ko ? '스탠드업' : 'Standup' },
    { from: [13, 30], to: [14, 0], label: ko ? '디자인 리뷰' : 'Design review' },
    { from: [15, 30], to: [16, 0], label: '1:1 박PM', soon: true },
    { from: [16, 30], to: [17, 30], label: ko ? '스프린트 플래닝' : 'Sprint planning' },
  ];

  return (
    <div style={{ padding: '8px 24px 24px' }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
        <Legend color="var(--brand)" label={ko ? '근무' : 'Work'} value="6h 30m"/>
        <Legend color="var(--grey-200)" label={ko ? '휴게' : 'Break'} value="1h"/>
        <Legend color="var(--purple, #7C5CFF)" label={ko ? '회의' : 'Meetings'} value="4"/>
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Work lane */}
        <div style={{ position: 'relative', height: 36 }}>
          {/* gridlines behind */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            {hours.slice(0, -1).map((h, i) => (
              <div key={h} style={{ flex: 1, borderLeft: i === 0 ? 'none' : '1px solid var(--grey-100)', background: h === 12 ? 'var(--grey-50)' : 'transparent' }}/>
            ))}
          </div>
          {blocks.map((b, i) => {
            const L = pct(b.from[0], b.from[1]);
            const W = pct(b.to[0], b.to[1]) - L;
            return (
              <div key={i} style={{
                position: 'absolute', top: 0, bottom: 0, left: `${L}%`, width: `${W}%`,
                background: b.color,
                border: b.dashed ? `2px dashed ${b.text}` : 'none',
                borderRadius: 10, padding: '0 12px',
                display: 'flex', alignItems: 'center',
                color: b.text || '#fff', fontSize: 12, fontWeight: 700,
                overflow: 'hidden', whiteSpace: 'nowrap' }}>{W > 5 ? b.label : ''}</div>
            );
          })}
        </div>
        {/* Meetings lane */}
        <div style={{ position: 'relative', height: 28 }}>
          {meetings.map((m, i) => {
            const L = pct(m.from[0], m.from[1]);
            const W = pct(m.to[0], m.to[1]) - L;
            return (
              <div key={i} style={{
                position: 'absolute', top: 0, bottom: 0, left: `${L}%`, width: `${W}%`,
                background: 'var(--brand-soft)', color: 'var(--brand)',
                border: m.soon ? '2px solid var(--brand)' : 'none',
                borderRadius: 'var(--r-sm)', padding: '0 8px',
                display: 'flex', alignItems: 'center',
                fontSize: 12, fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap' }}>{W > 4 ? m.label : '·'}</div>
            );
          })}
        </div>
        {/* Now line */}
        <div style={{ position: 'absolute', top: -6, bottom: -6, left: `${now}%`, width: 2, background: 'var(--danger)', pointerEvents: 'none' }}>
          <span style={{
            position: 'absolute', top: -22, left: -16, width: 36, height: 18,
            background: 'var(--danger)', color: 'var(--white)', borderRadius: 4,
            fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-num)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>15:24</span>
        </div>
        {/* Hour ticks */}
        <div style={{ display: 'flex', marginTop: 4, fontSize: 10.5, color: 'var(--grey-400)', fontFamily: 'var(--font-num)' }}>
          {hours.map((h, i) => (
            <div key={h} style={{ flex: i === hours.length - 1 ? '0 0 0' : 1, textAlign: 'left' }}>{h}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }}/>
      <span className="c-muted">{label}</span>
      <span className="num fw-700 c-primary">{value}</span>
    </div>
  );
}

// ─── Up next list ───────────────────────────────────────
function UpNextList({ ko }) {
  const items = [
    { t: '15:30', dur: '30m', label: ko ? '1:1 · 박PM' : '1:1 · PM Park', tag: ko ? '회의실 B' : 'Room B', soon: true, soonText: ko ? '6분 후' : 'in 6m' },
    { t: '16:30', dur: '1h',  label: ko ? '스프린트 플래닝' : 'Sprint planning', tag: ko ? '6명 참석' : '6 attendees' },
    { t: '17:45', dur: '15m', label: ko ? '데일리 회고' : 'Daily review', tag: ko ? '비공식' : 'Casual' },
    { t: '18:00', dur: '',    label: ko ? '예정 퇴근' : 'Clock out', tag: ko ? '오늘' : 'Today', kind: 'system' },
  ];
  return (
    <div style={{ padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '12px 12px', borderRadius: 'var(--r-md)',
          background: it.soon ? 'var(--brand-soft)' : 'transparent' }}>
          <div style={{ width: 56, flexShrink: 0 }}>
            <div className="num" style={{ fontSize: 16, fontWeight: 700, color: it.soon ? 'var(--brand)' : 'var(--grey-900)' }}>{it.t}</div>
            {it.dur && <div className="num t-caption">{it.dur}</div>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-body-strong">{it.label}</div>
            <div className="fs-12 c-mute mt-2">{it.tag}</div>
          </div>
          {it.soon && <span style={{
            fontSize: 12, fontWeight: 700, color: 'var(--white)',
            background: 'var(--brand)', padding: '4px 8px', borderRadius: 999 }}>{it.soonText}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Leave card ─────────────────────────────────────────
function LeaveCard({ ko }) {
  const months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  const used = [0, 1, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0]; // through Apr
  return (
    <Card title={ko ? '연차' : 'Leave'} pad={0}>
      <div style={{ padding: '8px 24px 24px' }}>
        {/* Big number */}
        <div className="row-end g-12 mb-16">
          <div>
            <div className="t-caption-strong">{ko ? '잔여' : 'Available'}</div>
            <div className="row-baseline g-4">
              <span className="num" style={{ fontSize: 44, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.5 }}>9</span>
              <span className="fs-18 c-mute fw-700">/ 15{ko ? '일' : 'd'}</span>
            </div>
          </div>
          <div style={{ flex: 1, paddingBottom: 6 }}>
            <div style={{ height: 8, background: 'var(--grey-100)', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '40%', background: 'var(--brand)' }}/>
              <div style={{ width: '20%', background: 'var(--warn)' }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--grey-500)' }}>
              <span>{ko ? '사용 6일' : 'Used 6'}</span>
              <span className="c-warn fw-700">{ko ? '소멸 임박 3일' : '3 expiring'}</span>
            </div>
          </div>
        </div>

        {/* Year strip */}
        <div className="mb-14">
          <div className="fs-12 c-mute fw-600 mb-8">{ko ? '월별 사용' : 'Monthly'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4, alignItems: 'end', height: 56 }}>
            {months.map((m, i) => {
              const v = used[i];
              const h = v === 0 ? 6 : 14 + v * 12;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: h, borderRadius: 4,
                    background: v === 0 ? 'var(--grey-100)' : i === 3 ? 'var(--brand)' : 'var(--brand-soft)' }}/>
                  <div className="num" style={{ fontSize: 9.5, color: i === 3 ? 'var(--brand)' : 'var(--grey-400)', fontWeight: 700 }}>{m}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiry alert — soft Toss style */}
        <div style={{
          background: 'var(--warn-soft)', borderRadius: 'var(--r-md)', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--warn)', color: 'var(--white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, flexShrink: 0 }}>!</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fs-13 fw-700 c-primary">
              {ko ? '연차 3일이 6월 30일에 소멸돼요' : '3 days expire on Jun 30'}
            </div>
            <div className="fs-12 c-muted mt-2">
              {ko ? '지금 신청하면 늦지 않아요' : "Apply now — don't lose them"}
            </div>
          </div>
          <button style={{
            height: 32, padding: '0 12px', border: 'none',
            background: 'var(--warn)', color: 'var(--white)',
            fontSize: 12, fontWeight: 700, borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>{ko ? '신청' : 'Apply'}</button>
        </div>
      </div>
    </Card>
  );
}

// ─── Pattern card ───────────────────────────────────────
function PatternCard({ ko }) {
  const days = ko ? ['월','화','수','목','금','토','일'] : ['M','T','W','T','F','S','S'];
  const hours = [8.4, 8.6, 8.8, 8.2, 7.5, 0, 0];
  const max = 10;
  return (
    <Card title={ko ? '근무 패턴' : 'Pattern'} pad={0}>
      <div style={{ padding: '8px 24px 24px' }}>
        <div className="row-baseline g-6 mb-4">
          <span className="num" style={{ fontSize: 32, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.5 }}>8:12</span>
          <span className="fs-13 c-mute fw-600">{ko ? '평균/일' : 'avg/day'}</span>
        </div>
        <div className="fs-12 c-success fw-700 mb-16">
          {ko ? '전월 대비 +18분' : '+18m vs last month'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, alignItems: 'end', height: 100, marginBottom: 12 }}>
          {hours.map((h, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%', height: `${(h/max)*100}%`, minHeight: h > 0 ? 4 : 0,
                  background: i < 5 ? (i === 2 ? 'var(--brand)' : 'var(--brand-soft)') : 'var(--grey-100)',
                  borderRadius: 'var(--r-xs)' }}/>
              </div>
              <div className="num" style={{ fontSize: 10.5, color: i === 2 ? 'var(--brand)' : 'var(--grey-500)', fontWeight: 700 }}>{days[i]}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', borderTop: '1px solid var(--grey-100)' }}>
          <div>
            <div className="t-caption">{ko ? '가장 긴 날' : 'Longest day'}</div>
            <div className="num t-heading-sm">{ko ? '수 8h 48m' : 'Wed 8h 48m'}</div>
          </div>
          <div>
            <div className="t-caption">{ko ? '평균 출근' : 'Avg in'}</div>
            <div className="num t-heading-sm">08:51</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Team presence card ────────────────────────────────
function TeamCard({ ko }) {
  const groups = [
    { label: ko ? '근무 중' : 'Working', count: 18, color: 'var(--success)', who: ['김지우', '박서연', '이민호', '+15'] },
    { label: ko ? '재택' : 'Remote', count: 6, color: 'var(--brand)', who: ['최유나', '정수민', '+4'] },
    { label: ko ? '연차' : 'Leave', count: 2, color: 'var(--warn)', who: ['한지원', '+1'] },
    { label: ko ? '오프라인' : 'Off', count: 6, color: 'var(--grey-300)', who: [] },
  ];
  return (
    <Card title={ko ? '팀 현황' : 'Team'}
      action={<span style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 700, cursor: 'pointer' }}>
        {ko ? '전체' : 'All'} →
      </span>}
      pad={0}
    >
      <div style={{ padding: '4px 12px 16px' }}>
        {groups.map((g, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px', borderRadius: 'var(--r-md)' }}>
            <div style={{ width: 40, textAlign: 'left' }}>
              <span className="num" style={{ fontSize: 22, fontWeight: 700, color: g.color, letterSpacing: -0.5 }}>{g.count}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color }}/>
                {g.label}
              </div>
              {g.who.length > 0 && (
                <div style={{ fontSize: 12.5, color: 'var(--grey-500)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {g.who.join(' · ')}
                </div>
              )}
            </div>
            <div className="row">
              {g.who.slice(0, 3).map((n, j) => n.startsWith('+') ? null : (
                <div key={j} style={{ marginLeft: j === 0 ? 0 : -8 }}>
                  <Avatar n={n} size={26}/>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Approvals list ────────────────────────────────────
function ApprovalsList({ ko }) {
  const items = [
    { type: ko ? '연차' : 'Leave', who: '김지우', detail: ko ? '5월 2일 (금)' : 'May 2 (Fri)', sub: ko ? '어린이날 연결 · 1일' : 'Kids day bridge · 1d', status: 'pending', urgent: false },
    { type: ko ? '초과근무' : 'Overtime', who: '박서연', detail: ko ? '오늘 18:00–20:30' : 'Today 18:00–20:30', sub: ko ? '스프린트 마감' : 'Sprint deadline', status: 'pending', urgent: true },
    { type: ko ? '재택' : 'WFH', who: '이민호', detail: ko ? '내일 (목)' : 'Tomorrow (Thu)', sub: ko ? '병원 방문' : 'Hospital visit', status: 'pending', urgent: false },
  ];
  return (
    <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 12px', borderRadius: 'var(--r-md)',
          background: it.urgent ? 'var(--warn-soft)' : 'transparent' }}>
          <Avatar n={it.who} size={36}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row g-6 mb-2">
              <span className="fs-13 fw-700 c-primary">{it.who}</span>
              <span style={{
                fontSize: 12, fontWeight: 700, color: 'var(--grey-600)',
                background: 'var(--grey-100)', padding: '2px 7px', borderRadius: 4 }}>{it.type}</span>
              {it.urgent && <span className="fs-12 fw-700 c-warn">{ko ? '긴급' : 'Urgent'}</span>}
            </div>
            <div className="fs-13 c-body">{it.detail}</div>
            <div style={{ fontSize: 12.5, color: 'var(--grey-500)', marginTop: 1 }}>{it.sub}</div>
          </div>
          <div className="row g-6">
            <button style={{
              width: 36, height: 36, border: 'none', borderRadius: 10,
              background: 'var(--grey-100)', color: 'var(--grey-700)', cursor: 'pointer',
              fontSize: 16, fontWeight: 700 }}>✕</button>
            <button style={{
              width: 36, height: 36, border: 'none', borderRadius: 10,
              background: 'var(--brand)', color: 'var(--white)', cursor: 'pointer',
              fontSize: 16, fontWeight: 700 }}>✓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activity list ─────────────────────────────────────
function ActivityList({ ko }) {
  const items = [
    { who: '박PM', dot: 'success', act: ko ? '님이 초과근무 2시간을 승인했어요' : ' approved your overtime (2h)', t: ko ? '방금' : 'just now' },
    { who: '이민호', dot: 'brand', act: ko ? '님이 재택 근무를 시작했어요' : ' started WFH', t: ko ? '12분 전' : '12m ago' },
    { who: ko ? '시스템' : 'System', dot: 'warn', act: ko ? ' · 연차 3일이 60일 후 소멸돼요' : ' · 3 leave days expiring in 60d', t: ko ? '1시간 전' : '1h ago' },
    { who: '한지원', dot: 'brand', act: ko ? '님이 5월 4일 연차를 신청했어요' : ' requested May 4 leave', t: ko ? '3시간 전' : '3h ago' },
    { who: ko ? '내가' : 'You', dot: 'success', act: ko ? ' · 출근했어요 (08:54)' : ' · clocked in (08:54)', t: ko ? '오늘' : 'today' },
  ];
  return (
    <div style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((it, i) => (
        <div key={i} className="row-start g-12">
          <span style={{
            width: 8, height: 8, borderRadius: '50%', marginTop: 7, flexShrink: 0,
            background: it.dot === 'success' ? 'var(--success)' : it.dot === 'warn' ? 'var(--warn)' : 'var(--brand)' }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fs-13 c-strong lh-1-5">
              <b className="fw-700 c-primary">{it.who}</b>{it.act}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--grey-500)', marginTop: 2 }}>{it.t}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Web: Team Leave Calendar (Toss style) ────────────────
function WebTeamLeave() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const team = [
    { n: '김지우', team: ko ? '디자인' : 'Design', leave: [22] },
    { n: '박서연', team: ko ? '디자인' : 'Design', leave: [25, 26] },
    { n: '이민호', team: ko ? '개발' : 'Eng', leave: [] },
    { n: '최유나', team: ko ? '개발' : 'Eng', leave: [29, 30] },
    { n: '정수민', team: ko ? '개발' : 'Eng', leave: [22, 23] },
    { n: '한지원', team: ko ? '운영' : 'Ops', leave: [4] },
  ];
  const today = 22;

  return (
    <WebShell active="team-leave"
      breadcrumb={[ko ? '내 워크스페이스' : 'My workspace', ko ? '팀 연차' : 'Team leave']}
      actions={<>
        <ToolBtn icon={Icon.calendar} label={ko ? '2026 · 4월' : 'Apr 2026'}/>
        <ToolBtn primary icon={Icon.plus} label={ko ? '연차 신청' : 'Request leave'}/>
      </>}
    >
      <div style={{ padding: '12px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            [ko ? '이번 달 연차' : 'On leave', '4', ko ? '명' : 'people', 'var(--brand)'],
            [ko ? '오늘 부재' : 'Out today', '2', ko ? '명' : 'people', 'var(--warn)'],
            [ko ? '대기 승인' : 'Pending', '3', ko ? '건' : 'items', 'var(--grey-900)'],
            [ko ? '팀 잔여 평균' : 'Avg balance', '7.4', ko ? '일' : 'd', 'var(--success)'],
          ].map(([l, v, u, c], i) => (
            <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div className="fs-13 c-muted mb-6">{l}</div>
              <div className="row-baseline g-4">
                <span className="num" style={{ fontSize: 32, fontWeight: 700, color: c, letterSpacing: -0.8 }}>{v}</span>
                <span className="fs-13 c-mute fw-600">{u}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <Card title={ko ? '4월 팀 연차' : 'April team leave'}
          action={<div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i style={{ width: 10, height: 10, background: 'var(--brand)', borderRadius: 3 }}/>{ko ? '연차' : 'Leave'}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i style={{ width: 10, height: 10, background: 'var(--warn-soft)', borderRadius: 3 }}/>{ko ? '주말' : 'Weekend'}</span>
          </div>}
        >
          {/* date header */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}>
            <div/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: 2, marginBottom: 6 }}>
              {days.map(d => (
                <div key={d} className="num" style={{
                  fontSize: 10.5, color: d === today ? 'var(--brand)' : 'var(--grey-400)',
                  fontWeight: d === today ? 800 : 500, textAlign: 'center' }}>{d}</div>
              ))}
            </div>
          </div>

          {team.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'center', padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--grey-100)' }}>
              <div className="row g-10">
                <Avatar n={p.n} size={28}/>
                <div>
                  <div className="fs-13 fw-700 c-primary">{p.n}</div>
                  <div className="t-caption">{p.team}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: 2 }}>
                {days.map(d => {
                  const isLeave = p.leave.includes(d);
                  const dow = (d + 2) % 7; // simulate
                  const isWeekend = dow === 5 || dow === 6;
                  return (
                    <div key={d} style={{
                      height: 22, borderRadius: 4,
                      background: isLeave ? 'var(--brand)' : isWeekend ? 'var(--warn-soft)' : 'var(--grey-100)',
                      border: d === today ? '2px solid var(--grey-900)' : 'none' }}/>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </WebShell>
  );
}

// ─── Web: Records (Toss style) ────────────────────────────
function WebRecords() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';

  const rows = [
    { d: ko ? '4월 22일 (수)' : 'Apr 22 (Wed)', in: '08:54', out: '—', total: '—', loc: ko ? '본사' : 'HQ', status: 'live' },
    { d: ko ? '4월 21일 (화)' : 'Apr 21 (Tue)', in: '08:48', out: '18:12', total: '8:24', loc: ko ? '본사' : 'HQ', status: 'ok' },
    { d: ko ? '4월 20일 (월)' : 'Apr 20 (Mon)', in: '09:15', out: '18:00', total: '7:45', loc: ko ? '재택' : 'WFH', status: 'late' },
    { d: ko ? '4월 19일 (일)' : 'Apr 19 (Sun)', in: '—', out: '—', total: '—', loc: '—', status: 'off' },
    { d: ko ? '4월 18일 (토)' : 'Apr 18 (Sat)', in: '—', out: '—', total: '—', loc: '—', status: 'off' },
    { d: ko ? '4월 17일 (금)' : 'Apr 17 (Fri)', in: '08:50', out: '20:30', total: '11:00', loc: ko ? '본사' : 'HQ', status: 'ot' },
  ];

  return (
    <WebShell active="my-time"
      breadcrumb={[ko ? '내 워크스페이스' : 'My workspace', ko ? '내 근무' : 'My time']}
      actions={<>
        <ToolBtn icon={Icon.download} label={ko ? '내보내기' : 'Export'}/>
        <ToolBtn icon={Icon.calendar} label={ko ? '4월' : 'Apr'}/>
      </>}
    >
      <div style={{ padding: '12px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            [ko ? '이번 달 근무' : 'Worked', '142h', 'var(--grey-900)'],
            [ko ? '평균/일' : 'Avg/day', '8:12', 'var(--brand)'],
            [ko ? '초과근무' : 'Overtime', '11h', 'var(--warn)'],
            [ko ? '지각' : 'Late', '2', 'var(--danger)'],
          ].map(([l, v, c], i) => (
            <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div className="fs-13 c-muted mb-6">{l}</div>
              <span className="num" style={{ fontSize: 32, fontWeight: 700, color: c, letterSpacing: -0.8 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* records */}
        <Card title={ko ? '근무 기록' : 'Records'} pad={0}
          action={<div className="row g-6">
            <span className="hf-chip">{ko ? '전체' : 'All'}</span>
            <span className="hf-chip">{ko ? '초과' : 'Overtime'}</span>
            <span className="hf-chip">{ko ? '지각' : 'Late'}</span>
          </div>}
        >
          <div style={{ padding: '8px 8px 16px' }}>
            {rows.map((r, i) => {
              const status = r.status === 'live' ? { c: 'var(--success)', l: ko ? '근무 중' : 'Live', bg: 'var(--success-soft)' }
                : r.status === 'ok' ? { c: 'var(--grey-700)', l: ko ? '정상' : 'OK', bg: 'var(--grey-100)' }
                : r.status === 'late' ? { c: 'var(--danger)', l: ko ? '지각' : 'Late', bg: 'var(--danger-soft, #FFE7E7)' }
                : r.status === 'ot' ? { c: 'var(--warn)', l: ko ? '초과' : 'OT', bg: 'var(--warn-soft)' }
                : { c: 'var(--grey-400)', l: ko ? '휴일' : 'Off', bg: 'var(--grey-100)' };
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '180px 100px 100px 100px 100px 1fr 80px',
                  gap: 16, alignItems: 'center', padding: '14px 16px', borderRadius: 'var(--r-md)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--grey-50)' }}>
                  <div className="fs-13 fw-600">{r.d}</div>
                  <div className="num" style={{ fontSize: 14, fontWeight: 700, color: r.in === '—' ? 'var(--grey-400)' : 'var(--grey-900)' }}>{r.in}</div>
                  <div className="num" style={{ fontSize: 14, fontWeight: 700, color: r.out === '—' ? 'var(--grey-400)' : 'var(--grey-900)' }}>{r.out}</div>
                  <div className="num" style={{ fontSize: 14, fontWeight: 700, color: r.total === '—' ? 'var(--grey-400)' : 'var(--grey-900)' }}>{r.total}</div>
                  <div className="fs-12 c-muted">{r.loc}</div>
                  <div>
                    <span style={{
                      fontSize: 12.5, fontWeight: 700, color: status.c,
                      background: status.bg, padding: '4px 10px', borderRadius: 999 }}>{status.l}</span>
                  </div>
                  <div className="ta-r">
                    <span style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 700, cursor: 'pointer' }}>{ko ? '상세' : 'Detail'} →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </WebShell>
  );
}
