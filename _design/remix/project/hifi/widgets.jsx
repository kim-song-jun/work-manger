// ① 모바일 홈화면 위젯 (iOS/Android) + Windows 시스템 트레이

// ─────────────────────────────────────────
// iOS 홈화면 - 위젯 스택
// ─────────────────────────────────────────
function IOSWidgets() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, var(--grey-800) 0%, var(--grey-900) 100%)',
      position: 'relative', padding: '54px 16px 100px', boxSizing: 'border-box',
      fontFamily: 'Pretendard, -apple-system, sans-serif' }}>
      {/* Status bar - iOS */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 54,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '0 28px 10px', color: 'var(--white)', fontSize: 15, fontWeight: 600 }}>
        <span>9:41</span>
        <div className="row g-4">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff"><path d="M8.5 8.5a2 2 0 011.4.6L8.5 10.5 7 9.1a2 2 0 011.5-.6M8.5 5.5a5 5 0 013.5 1.4l-1 1a3.5 3.5 0 00-5 0l-1-1a5 5 0 013.5-1.4M8.5 2.5a8 8 0 015.7 2.3l-1 1a6.5 6.5 0 00-9.4 0l-1-1a8 8 0 015.7-2.3"/></svg>
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="#fff" strokeWidth="1"><rect x="0.5" y="2.5" width="11" height="7" rx="2"/><rect x="2" y="4" width="8" height="4" rx="0.5" fill="#fff"/><path d="M13 4.5v3" strokeLinecap="round"/></svg>
        </div>
      </div>

      {/* Date label */}
      <div style={{ color: 'var(--white)', fontWeight: 700, marginBottom: 2, fontSize: 15, opacity: 0.9 }}>
        {ko ? '수요일' : 'Wednesday'}
      </div>
      <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: 34, letterSpacing: -0.5, marginBottom: 18 }}>
        {ko ? '11월 12일' : 'November 12'}
      </div>

      {/* Widget 1: Medium - Clock-in */}
      <div style={{
        background: 'rgba(255,255,255,0.98)', borderRadius: 22, padding: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginBottom: 14 }}>
        <div className="row g-6 mb-10">
          <div style={{ width: 16, height: 16, borderRadius: 5, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--white)' }}/>
          </div>
          <div className="fs-12 fw-700 c-primary">워크</div>
          <div className="flex-1"/>
          <div className="t-caption-strong">
            {ko ? '재택' : 'WFH'}
          </div>
        </div>
        <div className="row-end g-10 mb-12">
          <div>
            <div className="fs-12 c-muted fw-600 mb-2">
              {ko ? '출근' : 'In'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.6 }}>09:02</div>
          </div>
          <div style={{ flex: 1, height: 8, background: 'var(--grey-100)', borderRadius: 4, marginBottom: 6, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, width: '55%', background: 'linear-gradient(90deg, var(--brand), var(--brand-hover))', borderRadius: 4 }}/>
          </div>
          <div className="ta-r">
            <div className="fs-12 c-muted fw-600 mb-2">
              {ko ? '퇴근' : 'Out'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--grey-400)', letterSpacing: -0.6 }}>18:00</div>
          </div>
        </div>
        <div style={{
          background: 'var(--grey-100)', borderRadius: 10, padding: '9px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="t-caption-strong">
            {ko ? '탭해서 퇴근' : 'Tap to clock out'}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4E5968" strokeWidth="2.5" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
        </div>
      </div>

      {/* Widget 2 row: Small x 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Leave */}
        <div style={{
          background: 'rgba(255,255,255,0.98)', borderRadius: 22, padding: 14,
          aspectRatio: '1', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="row g-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
            <div className="fs-10 fw-700 c-primary">
              {ko ? '연차' : 'Leave'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.5, lineHeight: 1 }}>
              8.5<span className="fs-14 c-mute">/15</span>
            </div>
            <div className="fs-10 c-mute fw-600 mt-2">
              {ko ? '일 남음' : 'days left'}
            </div>
          </div>
          <div style={{ height: 4, background: 'var(--grey-100)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '56%', height: '100%', background: 'var(--success)' }}/>
          </div>
        </div>

        {/* Team status */}
        <div style={{
          background: 'var(--grey-900)', borderRadius: 22, padding: 14,
          aspectRatio: '1', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          color: 'var(--white)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>
            {ko ? '지금 팀은' : 'Team now'}
          </div>
          <div className="row g-4 wrap">
            {['var(--s-office)','var(--s-office)','var(--s-wfh)','var(--s-office)','var(--warn)','var(--s-wfh)','var(--s-office)','var(--grey-400)','var(--s-office)'].map((c, i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: c }}/>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1 }}>
              7<span style={{ fontSize: 12, opacity: 0.6 }}>/9</span>
            </div>
            <div style={{ fontSize: 9, opacity: 0.6, fontWeight: 600, marginTop: 2 }}>
              {ko ? '출근 중' : 'working'}
            </div>
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, background: 'var(--white)', borderRadius: 3 }}/>
    </div>
  );
}

// ─────────────────────────────────────────
// Android 홈화면 - 위젯
// ─────────────────────────────────────────
function AndroidWidgets() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #2E3440 0%, #4C566A 100%)',
      position: 'relative', padding: '38px 14px 90px', boxSizing: 'border-box',
      fontFamily: 'Pretendard, Roboto, sans-serif' }}>
      {/* Status bar - Android */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', color: 'var(--white)', fontSize: 13, fontWeight: 500 }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <svg width="12" height="10" viewBox="0 0 12 10" fill="#fff"><rect x="0" y="7" width="2" height="3"/><rect x="3.5" y="5" width="2" height="5"/><rect x="7" y="3" width="2" height="7"/><rect x="10.5" y="0" width="2" height="10"/></svg>
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="#fff" strokeWidth="1"><rect x="0.5" y="1" width="20" height="8" rx="1.5"/><rect x="2" y="2.5" width="16" height="5" rx="0.5" fill="#fff"/></svg>
        </div>
      </div>

      {/* Search pill */}
      <div style={{
        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
        borderRadius: 24, padding: '10px 14px', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        <span style={{ fontSize: 12, color: 'var(--white)', opacity: 0.7 }}>Search</span>
      </div>

      {/* Large widget - 4x2 */}
      <div style={{
        background: 'var(--white)', borderRadius: 20, padding: 14, marginBottom: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <div className="row g-6 mb-10">
          <div style={{ width: 18, height: 18, borderRadius: 'var(--r-xs)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--white)' }}/>
          </div>
          <div className="fs-13 fw-700 c-primary flex-1">
            {ko ? '몰큐브 워크' : 'Molcube Work'}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s-office)', background: 'var(--success-soft)', padding: '3px 8px', borderRadius: 10 }}>
            {ko ? '근무 중' : 'Working'}
          </div>
        </div>
        <div className="row g-8">
          <div style={{ flex: 1, background: 'var(--grey-100)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
            <div className="fs-10 c-mute fw-600 mb-2">
              {ko ? '출근' : 'Clock in'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.3 }}>09:02</div>
          </div>
          <div style={{ flex: 1, background: 'var(--brand)', borderRadius: 'var(--r-md)', padding: '10px 12px', color: 'var(--white)', cursor: 'pointer' }}>
            <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 600, marginBottom: 2 }}>
              {ko ? '탭' : 'Tap'}
            </div>
            <div className="t-body fw-700">
              {ko ? '퇴근' : 'Clock out'}
            </div>
          </div>
        </div>
      </div>

      {/* Leave + quick row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <div className="fs-10 c-mute fw-600 mb-4">
            {ko ? '연차 잔여' : 'Leave left'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.5 }}>
            8.5{ko ? '일' : 'd'}
          </div>
          <div style={{ height: 3, background: 'var(--grey-100)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ width: '56%', height: '100%', background: 'var(--success)' }}/>
          </div>
        </div>
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <div className="fs-10 c-mute fw-600 mb-4">
            {ko ? '승인 대기' : 'Pending'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--danger)', letterSpacing: -0.5 }}>
            3{ko ? '건' : ''}
          </div>
          <div style={{ fontSize: 9, color: 'var(--grey-500)', fontWeight: 600, marginTop: 6 }}>
            {ko ? '초과근무 2 · 연차 1' : 'OT 2 · Leave 1'}
          </div>
        </div>
      </div>

      {/* App grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 4 }}>
        {[
          ['var(--brand)','W',ko?'워크':'Work'],
          ['var(--danger)','M',ko?'메일':'Mail'],
          ['var(--s-office)','C',ko?'캘':'Cal'],
          ['var(--purple)','S',ko?'슬랙':'Slack'],
        ].map(([c, l, n], i) => (
          <div key={i} className="ta-c">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: c, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>{l}</div>
            <div className="fs-10 c-white mt-4 fw-500">{n}</div>
          </div>
        ))}
      </div>

      {/* Nav pill (Android 3-button) */}
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 50, alignItems: 'center' }}>
        <div style={{ width: 12, height: 12, border: '1.5px solid #fff', borderRadius: 2, transform: 'rotate(45deg)' }}/>
        <div style={{ width: 14, height: 14, background: 'var(--white)', borderRadius: 4 }}/>
        <div style={{ width: 14, height: 2, background: 'var(--white)' }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 위젯 갤러리 (선택 화면) - 사용자가 고를 수 있는 위젯 종류
// ─────────────────────────────────────────
function WidgetGallery() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div className="hf-screen" style={{ background: 'var(--grey-100)' }}>
      <StatusBar />
      <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.chevL width={18} height={18} className="c-primary"/>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--grey-900)' }}>
          {ko ? '위젯 선택' : 'Choose widget'}
        </div>
      </div>

      <div style={{ padding: '4px 20px 20px' }}>
        <div className="fs-12 c-muted fw-600 mb-10">
          {ko ? '작은 위젯 · 2×2' : 'Small · 2×2'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div style={{ background: 'var(--white)', borderRadius: 14, padding: 12, aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--grey-900)' }}>{ko ? '출퇴근' : 'Clock'}</div>
            <div className="fs-20 fw-700 c-primary">09:02</div>
            <div style={{ fontSize: 9, color: 'var(--brand)', fontWeight: 700 }}>{ko ? '근무 중' : 'Working'}</div>
          </div>
          <div style={{ background: 'var(--white)', borderRadius: 14, padding: 12, aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--grey-900)' }}>{ko ? '연차' : 'Leave'}</div>
            <div className="fs-20 fw-700 c-primary">8.5</div>
            <div style={{ height: 3, background: 'var(--grey-100)', borderRadius: 2 }}><div style={{ width: '56%', height: '100%', background: 'var(--success)', borderRadius: 2 }}/></div>
          </div>
          <div style={{ background: 'var(--grey-900)', borderRadius: 14, padding: 12, aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'var(--white)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.7 }}>{ko ? '팀 현황' : 'Team'}</div>
            <div className="row g-2 wrap">
              {['var(--s-office)','var(--s-office)','var(--s-wfh)','var(--warn)','var(--s-office)','var(--grey-400)'].map((c, i) => (<div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: c }}/>))}
            </div>
            <div className="t-heading-sm">7/9</div>
          </div>
          <div style={{ background: 'var(--white)', borderRadius: 14, padding: 12, aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--grey-900)' }}>{ko ? '이번 주' : 'Week'}</div>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 40 }}>
              {[0.6, 0.8, 0.95, 0.7, 0.4].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h * 100}%`, background: 'var(--brand)', borderRadius: 2, opacity: 0.3 + h * 0.7 }}/>
              ))}
            </div>
            <div className="fs-12 fw-700 c-primary">38.5{ko ? 'h' : ''}</div>
          </div>
        </div>

        <div className="fs-12 c-muted fw-600 mb-10">
          {ko ? '중간 위젯 · 4×2' : 'Medium · 4×2'}
        </div>
        <div style={{ background: 'var(--white)', borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <div className="fs-10 fw-700 c-primary mb-8">
            {ko ? '출퇴근 · 상세' : 'Clock · detail'}
          </div>
          <div className="row g-10">
            <div className="flex-1">
              <div style={{ fontSize: 9, color: 'var(--grey-500)' }}>{ko ? '출근' : 'In'}</div>
              <div className="fs-18 fw-700">09:02</div>
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 9, color: 'var(--grey-500)' }}>{ko ? '예정' : 'Out'}</div>
              <div className="fs-18 fw-700 c-faint">18:00</div>
            </div>
            <div style={{ flex: 1, background: 'var(--brand)', color: 'var(--white)', borderRadius: 10, padding: '8px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 9, opacity: 0.8 }}>{ko ? '탭' : 'Tap'}</div>
              <div className="fs-12 fw-700">{ko ? '퇴근' : 'Out'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, padding: 14, background: 'var(--brand-soft)', borderRadius: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontWeight: 700, flexShrink: 0 }}>i</div>
          <div style={{ fontSize: 12, color: '#1B64DA', lineHeight: 1.5 }}>
            {ko ? '길게 누르면 다크/라이트 자동 전환, 재택/본사에 따라 배경색이 바뀌어요.' : 'Long-press for auto dark mode. Background changes based on location.'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Windows 시스템 트레이
// ─────────────────────────────────────────
function WindowsTray() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: 'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%271280%27 height=%27800%27><defs><linearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27><stop offset=%270%27 stop-color=%27%230078D4%27/><stop offset=%2750%%27 stop-color=%27%23005A9E%27/><stop offset=%27100%%27 stop-color=%27%23003A6B%27/></linearGradient></defs><rect width=%271280%27 height=%27800%27 fill=%27url(%23g)%27/></svg>")',
      backgroundSize: 'cover', fontFamily: '"Segoe UI", Pretendard, sans-serif',
      overflow: 'hidden' }}>
      {/* Desktop icons (simplified) */}
      <div style={{ position: 'absolute', top: 24, left: 24, display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 18 }}>
        {[['#FFDE59','📄','보고서.docx'],['var(--s-wfh)','📊','근태.xlsx']].map(([c, e, n], i) => (
          <div key={i} style={{ textAlign: 'center', width: 80 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--r-xs)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{e}</div>
            <div style={{ fontSize: 12, color: 'var(--white)', marginTop: 4, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{n}</div>
          </div>
        ))}
      </div>

      {/* Tray popup - anchored bottom-right */}
      <div style={{
        position: 'absolute', bottom: 58, right: 12,
        width: 360, background: 'rgba(32, 32, 32, 0.85)', backdropFilter: 'blur(30px)',
        borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        color: 'var(--white)' }}>
        {/* Header */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="row g-10 mb-12">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: 'var(--white)' }}/>
            </div>
            <div className="flex-1">
              <div className="fs-13 fw-600">김지우</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                {ko ? '프로덕트 디자이너 · 재택' : 'Product Designer · WFH'}
              </div>
            </div>
            <div style={{ padding: '4px 10px', background: 'rgba(0,196,113,0.2)', border: '1px solid rgba(0,196,113,0.4)', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600, color: '#4ADE80' }}>
              {ko ? '근무 중' : 'Working'}
            </div>
          </div>
          {/* Big times */}
          <div className="row g-12">
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: 'var(--r-xs)' }}>
              <div style={{ fontSize: 10, opacity: 0.6 }}>{ko ? '출근' : 'Clock in'}</div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>09:02</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: 'var(--r-xs)' }}>
              <div style={{ fontSize: 10, opacity: 0.6 }}>{ko ? '경과' : 'Elapsed'}</div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>5h 23m</div>
            </div>
          </div>
          {/* Primary button */}
          <div style={{
            marginTop: 10, padding: '10px 12px', background: 'var(--brand)', borderRadius: 'var(--r-xs)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            {ko ? '퇴근하기' : 'Clock out'}
          </div>
          <div style={{ marginTop: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--r-xs)', fontSize: 12, textAlign: 'center', opacity: 0.8, cursor: 'pointer' }}>
            {ko ? '휴게 시작 (1h 남음)' : 'Start break (1h left)'}
          </div>
        </div>

        {/* Quick list */}
        <div style={{ padding: '8px 8px' }}>
          {[
            [ko?'이번 주 근무':'This week', '38h 24m', '/ 40h', 'var(--s-wfh)'],
            [ko?'연차 잔여':'Leave left', '8.5', ko?'/ 15일':'/ 15d', 'var(--s-office)'],
            [ko?'승인 대기':'Pending', '2', ko?'건':'items', 'var(--warn)'],
          ].map(([l, v, s, c], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 4, cursor: 'pointer' }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: c }}/>
              <div style={{ flex: 1, fontSize: 12, opacity: 0.9 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.2 }}>{v}<span style={{ fontSize: 12, opacity: 0.5, fontWeight: 500 }}> {s}</span></div>
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          {[
            [ko?'연차 신청':'Apply leave', 'M3 5h18l-7 9v5l-4 2v-7z'],
            [ko?'팀 현황':'Team', 'M9 8a3 3 0 11-6 0 3 3 0 016 0zM21 8a3 3 0 11-6 0 3 3 0 016 0zM2 20c0-3 2-5 5-5s5 2 5 5M12 20c0-3 2-5 5-5s5 2 5 5'],
            [ko?'설정':'Settings', 'M12 15a3 3 0 100-6 3 3 0 000 6z'],
          ].map(([l, d], i) => (
            <div key={i} style={{ padding: '10px 8px', borderRadius: 4, textAlign: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ margin: '0 auto 4px', display: 'block' }}><path d={d}/></svg>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Windows taskbar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
        background: 'rgba(32, 32, 32, 0.9)', backdropFilter: 'blur(30px)',
        display: 'flex', alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Start button + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 400 }}>
          {/* Start - Windows logo */}
          <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: 18, height: 18 }}>
              {[0,1,2,3].map(i => <div key={i} style={{ background: 'var(--white)' }}/>)}
            </div>
          </div>
          {/* Search */}
          <div style={{ width: 180, height: 32, borderRadius: 'var(--r-lg)', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ opacity: 0.6 }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            <span style={{ fontSize: 12, color: 'var(--white)', opacity: 0.6 }}>Search</span>
          </div>
          {/* Apps */}
          {['#0078D4', '#00A8E8', '#107C10', 'var(--brand)'].map((c, i) => (
            <div key={i} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 22, height: 22, background: c, borderRadius: 4, position: 'relative' }}>
                {i === 3 && <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 16, height: 2, background: 'var(--brand)', borderRadius: 1 }}/>}
              </div>
            </div>
          ))}
        </div>

        {/* System tray - with our app icon highlighted */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 0, padding: '0 8px', height: '100%' }}>
          <div style={{ padding: '0 8px', height: '100%', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" style={{ opacity: 0.7 }}><path d="M12 2a1 1 0 011 1v10l3-3 1 1-5 5-5-5 1-1 3 3V3a1 1 0 011-1z"/></svg>
          </div>
          <div style={{ padding: '0 8px', height: '100%', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ opacity: 0.7 }}><path d="M2 12a10 10 0 0120 0M6 12a6 6 0 0112 0M10 12a2 2 0 014 0"/></svg>
          </div>
          {/* Our app - highlighted */}
          <div style={{
            padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center',
            background: 'rgba(49, 130, 246, 0.25)', border: '1px solid rgba(49, 130, 246, 0.5)',
            position: 'relative' }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 5, height: 5, borderRadius: 2.5, background: 'var(--white)' }}/>
            </div>
            {/* Red notification dot */}
            <div style={{ position: 'absolute', top: 10, right: 6, width: 8, height: 8, borderRadius: 4, background: 'var(--danger)', border: '1.5px solid #202020' }}/>
          </div>
          <div style={{ padding: '0 12px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontSize: 12, lineHeight: 1.2 }}>
            <div>9:41</div>
            <div>{ko ? '11/12' : '11/12'}</div>
          </div>
        </div>
      </div>

      {/* Pointer arrow showing where user clicked */}
      <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', bottom: 74, right: 44, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
        <path d="M2 1l0 16 4-4 3 7 3-1-3-7 6 0z" fill="#fff" stroke="#191F28" strokeWidth="1"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────
// Windows 데스크톱 앱 - 사이드바 레이아웃
// ─────────────────────────────────────────
function WindowsDesktopApp() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div style={{
      width: '100%', height: '100%', background: 'var(--grey-100)',
      fontFamily: '"Segoe UI Variable", Pretendard, sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Windows title bar */}
      <div style={{
        height: 32, background: 'var(--white)', display: 'flex', alignItems: 'center',
        borderBottom: '1px solid #E5E8EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', flex: 1 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--white)' }}/>
          </div>
          <span className="fs-12 c-primary fw-500">
            {ko ? '몰큐브 워크' : 'Molcube Work'}
          </span>
        </div>
        <div className="row">
          {[
            ['M2 6h8', '_'],
            ['M2 2h8v8H2z', '□'],
            ['M2 2l8 8M10 2l-8 8', '×'],
          ].map(([d, l], i) => (
            <div key={i} style={{ width: 46, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 2 ? 'transparent' : 'transparent' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#191F28" strokeWidth="1"><path d={d}/></svg>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: 64, background: 'var(--white)', borderRight: '1px solid #E5E8EB', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {[
            ['home', true],
            ['team', false],
            ['calendar', false],
            ['chart', false],
          ].map(([k, on], i) => {
            const Ic = Icon[k];
            return (
              <div key={i} style={{ width: 48, height: 48, borderRadius: 'var(--r-sm)', background: on ? 'var(--brand-soft)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Ic width={22} height={22} style={{ color: on ? 'var(--brand)' : 'var(--grey-700)' }}/>
                {on && <div style={{ position: 'absolute', left: 0, top: '30%', bottom: '30%', width: 3, background: 'var(--brand)', borderRadius: 2 }}/>}
              </div>
            );
          })}
          <div className="flex-1"/>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', fontWeight: 700 }}>김</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 32, overflow: 'auto', minHeight: 0 }}>
          <div className="fs-12 c-mute fw-600 mb-4">
            {ko ? '수요일, 11월 12일' : 'Wed, Nov 12'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.8, marginBottom: 24 }}>
            {ko ? '좋은 아침이에요, 지우 님' : 'Good morning, Jiwoo'}
          </div>

          {/* Big card */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 28, display: 'flex', alignItems: 'center', gap: 32, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 140, height: 140, borderRadius: 70, background: 'conic-gradient(from -90deg, #3182F6 0% 55%, #F2F4F6 55% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 110, height: 110, borderRadius: 55, background: 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="fs-10 c-mute fw-600">{ko ? '근무 중' : 'Working'}</div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>5h 23m</div>
                <div className="fs-10 c-mute">/ 8h</div>
              </div>
            </div>
            <div className="flex-1">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <div className="t-caption-strong">{ko ? '출근' : 'Clock in'}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>09:02</div>
                </div>
                <div>
                  <div className="t-caption-strong">{ko ? '예정 퇴근' : 'Out'}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, color: 'var(--grey-400)' }}>18:00</div>
                </div>
                <div>
                  <div className="t-caption-strong">{ko ? '위치' : 'Location'}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-wfh)' }}>
                    {ko ? '재택 · 감지됨' : 'WFH · Detected'}
                  </div>
                </div>
                <div>
                  <div className="t-caption-strong">{ko ? '이번 주' : 'Week'}</div>
                  <div className="t-body fw-700">38h 24m</div>
                </div>
              </div>
              <div className="row g-8">
                <div style={{ flex: 1, padding: '12px 16px', background: 'var(--brand)', color: 'var(--white)', borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {ko ? '퇴근하기' : 'Clock out'}
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--grey-100)', color: 'var(--grey-700)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {ko ? '휴게 시작' : 'Start break'}
                </div>
              </div>
            </div>
          </div>

          {/* Mini cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              [ko?'연차 잔여':'Leave left', '8.5', ko?'일':'days', 'var(--success)', 0.56],
              [ko?'승인 대기':'Pending', '2', ko?'건':'items', 'var(--warn)', 0.5],
              [ko?'팀 출근률':'Team present', '7/9', '78%', 'var(--brand)', 0.78],
            ].map(([l, v, s, c, p], i) => (
              <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="fs-12 c-mute fw-600 mb-6">{l}</div>
                <div className="row-baseline g-4 mb-8">
                  <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>{v}</div>
                  <div className="t-caption">{s}</div>
                </div>
                <div style={{ height: 4, background: 'var(--grey-100)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${p * 100}%`, height: '100%', background: c }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { IOSWidgets, AndroidWidgets, WidgetGallery, WindowsTray, WindowsDesktopApp });
