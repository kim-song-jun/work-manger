// Hi-fi mobile screens: Login, Home (3 variations), Checkin flow, Overtime, Team (3), Leave apply, Settings, UI Customize

// ─── Login ───────────────────────────────────────────────
function MobLogin() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-screen" style={{ padding: '40px 24px 30px', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--r-md)',
          background: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--white)', fontSize: 26, fontWeight: 700,
          marginBottom: 32, letterSpacing: -0.5 }}>W</div>
        <div className="t-display-lg mb-8">
          안녕하세요,<br/>오늘도 기록해볼까요?
        </div>
        <div className="t-body mb-32">
          회사에서 받은 이메일로 로그인해주세요.
        </div>
        <FormField label="회사 이메일">
          <input className="hf-input" defaultValue="jiwoo@company.co.kr" />
        </FormField>
        <FormField label="비밀번호">
          <div style={{ position: 'relative' }}>
            <input className="hf-input" style={{ paddingRight: 44 }} type="password" defaultValue="xxxxxxxx" />
            <Icon.lock style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--grey-400)' }} />
          </div>
        </FormField>
        <button className="hf-btn hf-btn-primary hf-btn-large hf-btn-block mt-8">
          로그인
        </button>
        <div className="row-between mt-14">
          <span className="t-body-sm">비밀번호를 잊으셨나요?</span>
          <span className="t-body-sm c-brand fw-600">도움 받기</span>
        </div>
        <div className="t-caption" style={{ marginTop: 'auto', textAlign: 'center' }}>
          © 2026 Company Inc. · v2.4.0
        </div>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Home Variation A: Slide-to-clock-in ──────────────────
function MobHomeSlide() {
  const t = useT();
  const [slid, setSlid] = React.useState(0);
  const [clockedIn, setClockedIn] = React.useState(false);
  const trackRef = React.useRef(null);
  const onDown = (e) => {
    e.preventDefault();
    const rect = trackRef.current.getBoundingClientRect();
    const max = rect.width - 56 - 8;
    const startX = e.clientX ?? e.touches?.[0]?.clientX;
    const startPct = slid;
    const move = (ev) => {
      const x = ev.clientX ?? ev.touches?.[0]?.clientX;
      setSlid(Math.max(0, Math.min(1, startPct + (x - startX) / max)));
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      setSlid((v) => { if (v > 0.88) { setClockedIn((c) => !c); return 0; } return 0; });
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <PageHeader date="수 · 4월 22일" title={clockedIn ? t('good_evening') : t('good_morning')} hasBadge />
      <div className="hf-screen" style={{ padding: '4px 20px 16px' }}>
        {/* big stat card — breathing room for time */}
        <Card padding="24px 20px" style={{ background: clockedIn ? 'var(--brand)' : 'var(--white)', color: clockedIn ? '#fff' : 'inherit' }}>
          <div className="t-caption-strong" style={{ color: clockedIn ? 'rgba(255,255,255,0.85)' : 'var(--grey-500)' }}>{t('today_work')}</div>
          <div className="t-number-xl" style={{ marginTop: 8, color: clockedIn ? '#fff' : 'var(--grey-900)' }}>
            {clockedIn ? '0h 36m' : '—'}
          </div>
          <div className="mt-20">
            <StatRow color={clockedIn ? 'inverse' : 'default'} items={[
              { label: '출근', value: clockedIn ? '08:54' : '—' },
              { label: '퇴근', value: '—' },
              { label: '정규', value: '09–18' },
            ]} />
          </div>
        </Card>

        {/* location chip */}
        <div className="mt-10">
          <ListRow
            leading={
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.building className="icon-20" />
              </div>
            }
            title={t('at_office')}
            subtitle="강남 오피스 · Wi-Fi로 자동 감지됨"
            trailing={<button className="hf-btn hf-btn-ghost hf-btn-tiny">{t('change')}</button>}
            divider={false}
            onClick={() => {}}
          />
        </div>

        {/* slide */}
        <div ref={trackRef} style={{
          marginTop: 14, height: 64, borderRadius: 32,
          background: clockedIn ? 'var(--success-soft)' : 'var(--brand-soft)',
          position: 'relative', padding: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: clockedIn ? 'var(--success)' : 'var(--brand)', fontWeight: 700, opacity: 0.7, fontSize: 14 }}>
            {clockedIn ? t('slide_out') : t('slide_in')} →
          </span>
          <div onPointerDown={onDown} style={{
            position: 'absolute', left: 4 + slid * (276 - 56 - 8), top: 4,
            width: 56, height: 56, borderRadius: 999,
            background: clockedIn ? 'var(--success)' : 'var(--brand)',
            color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-md)', cursor: 'grab', touchAction: 'none'
          }}>
            <Icon.chevR className="icon-24" />
          </div>
        </div>

        {/* quick stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
          {[['이번 주', '32', 'h'], ['잔여 연차', '11', '일'], ['초과 누적', '4.3', 'h']].map(([l, v, u]) => (
            <Card key={l} padding={12}>
              <KPIStat label={l} value={v} unit={u} />
            </Card>
          ))}
        </div>

        {/* team preview */}
        <Card className="mt-10" padding={14} onClick={() => {}}>
          <div className="row-between">
            <div className="t-body-strong">{t('team_status')}</div>
            <Icon.chevR className="icon-16 c-faint" />
          </div>
          <div className="row mt-10">
            {PEOPLE.slice(0, 7).map((p, i) => (
              <div key={i} style={{ marginLeft: i === 0 ? 0 : -8, position: 'relative' }}>
                <Avatar n={p.n} size={32} />
                <span className={`hf-dot ${p.s}`} style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid var(--white)', width: 10, height: 10 }} />
              </div>
            ))}
            <div style={{ marginLeft: -8, width: 32, height: 32, borderRadius: 'var(--r-lg)', background: 'var(--grey-100)', color: 'var(--grey-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>+5</div>
          </div>
        </Card>
      </div>
      <TabBar active="home" t={t} />
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Home B: Big tap button ───────────────────────────────
function MobHomeTap() {
  const t = useT();
  const [on, setOn] = React.useState(false);
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <PageHeader date="수 · 4월 22일" title={on ? '근무 중' : t('good_morning')} action={<Avatar n="김지우" size={36} />} />
      <div className="hf-screen" style={{ padding: '10px 16px 16px', display: 'flex', flexDirection: 'column' }}>
        {/* location banner */}
        <Card padding="10px 14px" style={{ background: 'var(--brand-softer)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.map className="icon-18 c-brand" />
          <div className="t-body-sm flex-1">
            <b>{t('at_office')}</b> 맞아요? <span className="c-mute">· 자동 감지됨</span>
          </div>
          <Icon.chevR className="icon-16 c-faint" />
        </Card>

        {/* giant button */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <div className="ta-c">
            <div className="t-number-xl">{on ? '6h 30m' : '09:00'}</div>
            <div className="t-body-sm c-mute mt-4">{on ? '지금까지 근무했어요' : '오늘 정규 출근 시간'}</div>
          </div>

          <button onClick={() => setOn(!on)} style={{
            width: 220, height: 220, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: on ? 'var(--success)' : 'var(--brand)',
            color: 'var(--white)', position: 'relative',
            boxShadow: on ? '0 20px 40px rgba(0,196,113,0.35), 0 0 0 8px rgba(0,196,113,0.12)'
                         : '0 20px 40px rgba(49,130,246,0.35), 0 0 0 8px rgba(49,130,246,0.12)',
            transition: 'all .2s' }}>
            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>
              {on ? t('clock_out') : t('clock_in')}
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4, fontWeight: 500 }}>
              {on ? '탭하여 퇴근' : '탭하여 출근'}
            </div>
          </button>

          <div className="t-caption">
            {on ? '예정 퇴근까지 2h 30m' : '아직 출근 전이에요'}
          </div>
        </div>

        {/* bottom strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['이번 주', '32', 'h', Icon.chart], ['연차', '11', '일', Icon.calendar], ['초과', '4.3', 'h', Icon.clock]].map(([l, v, u, IC]) => (
            <Card key={l} padding={10} className="ta-c">
              <IC style={{ width: 16, height: 16, color: 'var(--grey-500)', margin: '0 auto 2px' }} />
              <div className="num t-heading-sm">{v}<span style={{ fontSize: 10, color: 'var(--grey-500)', marginLeft: 1 }}>{u}</span></div>
              <div className="t-caption">{l}</div>
            </Card>
          ))}
        </div>
      </div>
      <TabBar active="home" t={t} />
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Home C: Card stack ──────────────────────────────────
function MobHomeCards() {
  const t = useT();
  const [idx, setIdx] = React.useState(0);
  const cards = [
    { title: '출근 찍기', sub: '정규 09:00', color: 'var(--brand)', icon: Icon.sun },
    { title: '휴게 시작', sub: '점심 / 짧은 쉼', color: 'var(--warn)', icon: Icon.coffee },
    { title: '퇴근 찍기', sub: '정규 18:00', color: 'var(--success)', icon: Icon.moon },
  ];
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <PageHeader date="수 · 4월 22일" title={t('good_morning')} />
      <div className="hf-screen" style={{ padding: '6px 20px 16px' }}>
        <Card padding={12} className="row g-10">
          <Icon.map className="icon-18 c-brand" />
          <div className="t-body-sm flex-1"><b>본사</b> · 강남 오피스</div>
          <span className="hf-chip success fs-11">자동 확인</span>
        </Card>

        {/* stack */}
        <div style={{ position: 'relative', height: 340, marginTop: 14 }}>
          {cards.map((c, i) => {
            const pos = i - idx;
            if (pos < 0) return null;
            const off = pos * 14;
            const scale = 1 - pos * 0.04;
            return (
              <div key={i} style={{
                position: 'absolute', inset: 0, top: off,
                transform: `scale(${scale})`, transformOrigin: 'top center',
                zIndex: cards.length - pos, transition: 'all .3s',
                background: c.color, color: 'var(--white)',
                borderRadius: 24, padding: 22, height: 280,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}>
                <div className="row-start">
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>STEP {i + 1} / 3</div>
                    <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6, letterSpacing: -0.8, lineHeight: 1 }}>{c.title}</div>
                    <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{c.sub}</div>
                  </div>
                  <c.icon style={{ width: 44, height: 44, opacity: 0.9 }} />
                </div>
                {pos === 0 && (
                  <>
                    <div style={{ position: 'absolute', left: 22, right: 22, bottom: 72, display: 'flex', gap: 6 }}>
                      {cards.map((_, k) => <div key={k} style={{ flex: 1, height: 3, borderRadius: 2, background: k <= idx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />)}
                    </div>
                    <button onClick={() => setIdx((idx + 1) % cards.length)} style={{
                      position: 'absolute', left: 22, right: 22, bottom: 22,
                      background: 'rgba(255,255,255,0.2)', color: 'var(--white)',
                      border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 14,
                      padding: '14px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                      backdropFilter: 'blur(10px)' }}>{c.title} →</button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="ta-c fs-12 c-mute mt-10">
          카드를 탭하면 다음 단계로 이동
        </div>
      </div>
      <TabBar active="home" t={t} />
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Overtime request (auto triggered sheet) ────────────
function MobOvertime() {
  const t = useT();
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div style={{ flex: 1, background: 'rgba(25,31,40,0.55)', position: 'relative' }}>
        {/* faded background */}
        <div style={{ opacity: 0.25, padding: 20, filter: 'blur(1px)' }}>
          <div className="t-body-sm">수 · 4월 22일</div>
          <h1 className="c-primary">오늘도 수고했어요</h1>
          <Card padding={18} className="mt-10">
            <div className="t-caption">오늘 근무</div>
            <div className="t-number-lg mt-4">9h 42m</div>
          </Card>
        </div>
        {/* sheet */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: 'var(--white)', borderRadius: '24px 24px 0 0',
          padding: '10px 20px 24px',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)' }}>
          <SheetHandle />
          <div className="row-start g-12">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--warn-soft)', color: 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon.moon className="icon-24" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-subtitle">{t('ot_alert')}</div>
              <div className="t-body-sm mt-2">정규 퇴근 18:00 지났어요 · 현재 18:42</div>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gap: 8 }}>
            <button className="hf-btn hf-btn-large hf-btn-block" style={{
              background: 'var(--grey-100)', color: 'var(--grey-800)',
              justifyContent: 'space-between' }}>
              <span><b>지금 퇴근</b> · 18:42 기록</span>
              <Icon.chevR className="icon-18"/>
            </button>
            <button className="hf-btn hf-btn-primary hf-btn-large hf-btn-block" style={{ justifyContent: 'space-between' }}>
              <span><b>초과근무 요청</b> · 박PM에게 전송</span>
              <Icon.chevR className="icon-18"/>
            </button>
          </div>

          <div className="t-caption ta-c mt-14 lh-1-5">
            요청을 누르면 마크제터 승인자에게 전송돼요.<br/>승인이 끝나면 초과근무로 기록되어요.
          </div>
        </div>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Team A: Grid ─────────────────────────────────────────
function MobTeamGrid() {
  const t = useT();
  const [filter, setFilter] = React.useState('all');
  const list = filter === 'all' ? PEOPLE : PEOPLE.filter((p) => p.s === filter);
  const cnt = (s) => PEOPLE.filter((p) => p.s === s).length;
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <PageHeader title={t('team_status')} action={<Icon.search style={{ width: 22, height: 22, color: 'var(--grey-700)', cursor: 'pointer' }} />} />
      <div className="hf-screen" style={{ padding: '4px 16px 16px' }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {[['all','전체',PEOPLE.length],['office','본사',cnt('office')],['wfh','재택',cnt('wfh')],['leave','연차',cnt('leave')],['off','퇴근',cnt('off')]].map(([k,l,n]) => (
            <button key={k} onClick={() => setFilter(k)} className="hf-btn hf-btn-medium" style={{
              flexShrink: 0,
              background: filter === k ? 'var(--grey-900)' : 'var(--grey-100)',
              color: filter === k ? '#fff' : 'var(--grey-700)'
            }}>{l} <span style={{ opacity: 0.7, marginLeft: 2 }}>{n}</span></button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14 }}>
          {list.slice(0, 12).map((p, i) => (
            <div key={i} className="ta-c">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar n={p.n} size={54} />
                <span className={`hf-dot ${p.s}`} style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 14, height: 14, border: '2.5px solid var(--grey-50)'
                }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 5, lineHeight: 1.2 }}>{p.n}</div>
              <div className="fs-10 c-mute">{p.t}</div>
            </div>
          ))}
        </div>

        <div className="hf-card" style={{ padding: 12, marginTop: 18, display: 'flex', justifyContent: 'space-around', fontSize: 11 }}>
          {[['office','본사'],['wfh','재택'],['break','휴게'],['leave','연차'],['off','퇴근']].map(([s,l]) => (
            <div key={s} className="row g-4">
              <span className={`hf-dot ${s}`} /><span className="c-muted">{l}</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="team" t={t} />
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Team B: grouped ─────────────────────────────────────
function MobTeamGrouped() {
  const t = useT();
  const teams = {};
  PEOPLE.forEach((p) => { (teams[p.t] ||= []).push(p); });
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <PageHeader title={t('team_status')} action={<Icon.filter style={{ width: 22, height: 22, color: 'var(--grey-700)', cursor: 'pointer' }} />} />
      <div className="hf-screen" style={{ padding: '4px 16px 16px' }}>
        {Object.entries(teams).map(([team, list]) => {
          const working = list.filter((p) => p.s === 'office' || p.s === 'wfh').length;
          return (
            <Card key={team} padding={14} className="mb-10">
              <div className="row-between">
                <div className="t-subtitle">{team}</div>
                <div className="t-caption">{working}/{list.length} 근무 중</div>
              </div>
              <div className="row g-6 wrap mt-10">
                {list.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px 4px 4px', background: 'var(--grey-100)', borderRadius: 999 }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar n={p.n} size={24} />
                      <span className={`hf-dot ${p.s}`} style={{ position: 'absolute', bottom: -1, right: -1, border: '1.5px solid var(--grey-100)' }} />
                    </div>
                    <span className="t-caption-strong">{p.n}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      <TabBar active="team" t={t} />
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Team C: Timeline ────────────────────────────────────
function MobTeamTimeline() {
  const t = useT();
  const rows = PEOPLE.slice(0, 8);
  const blocks = [
    [[8.5,12,'office'],[12,13,'break'],[13,18,'office']],
    [[9,13,'wfh'],[13,14,'break'],[14,18,'wfh']],
    [[8,12.5,'office'],[12.5,13.5,'break'],[13.5,19.2,'office']],
    [[9.5,18,'wfh']],
    [[0,24,'break']],
    [[0,24,'leave']],
    [[8.2,17.8,'office']],
    [[10,15,'office']],
  ];
  const now = 15.4;
  const color = (k) => ({ office: 'var(--s-office)', wfh: 'var(--s-wfh)', break: 'var(--s-break)', leave: 'var(--s-leave)' }[k]);
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <PageHeader date="오늘 · 현재 15:24" title="타임라인" action={<Icon.filter style={{ width: 22, height: 22, color: 'var(--grey-700)', cursor: 'pointer' }} />} />
      <div className="hf-screen" style={{ padding: '4px 16px 16px' }}>
        <div className="hf-card" style={{ padding: 14 }}>
          <div style={{ position: 'relative', paddingLeft: 64 }}>
            <div style={{ position: 'relative', height: 16, fontSize: 10, color: 'var(--grey-500)' }}>
              {[6,9,12,15,18,21].map((h) => (
                <span key={h} style={{ position: 'absolute', left: `${(h/24)*100}%`, transform: 'translateX(-50%)' }}>{h}</span>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: `${(now/24)*100}%`, top: -2, bottom: 0, width: 2, background: 'var(--brand)', zIndex: 2,
                boxShadow: '0 0 0 3px var(--brand-soft)' }} />
              {rows.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, height: 24 }}>
                  <div style={{ position: 'absolute', left: -64, width: 60, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar n={p.n} size={20} />
                    <span style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 36 }}>{p.n.slice(1)}</span>
                  </div>
                  <div style={{ flex: 1, height: 16, background: 'var(--grey-100)', borderRadius: 4, position: 'relative' }}>
                    {blocks[i].map(([s,e,k], j) => (
                      <div key={j} style={{ position: 'absolute', left: `${(s/24)*100}%`, width: `${((e-s)/24)*100}%`, top: 0, bottom: 0, background: color(k), borderRadius: 3 }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14, fontSize: 11, color: 'var(--grey-600)' }}>
          {[['office','본사'],['wfh','재택'],['break','휴게'],['leave','연차']].map(([s,l]) => (
            <div key={s} className="row g-4">
              <span className={`hf-dot ${s}`} />{l}
            </div>
          ))}
        </div>
      </div>
      <TabBar active="team" t={t} />
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Leave: calendar + detail ────────────────────────────
function MobLeaveCalendar() {
  const t = useT();
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const events = { 8: 'leave', 14: 'leave', 25: 'ot', 18: 'ot' };
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <PageHeader title="내 연차" action={<button className="hf-btn hf-btn-primary hf-btn-medium"><Icon.plus className="icon-14" /> 신청</button>} />
      <div className="hf-screen" style={{ padding: '4px 16px 16px' }}>
        {/* hero */}
        <Card padding={18} variant="elevated" style={{ background: 'var(--brand)', color: 'var(--white)' }}>
          <div className="row-between">
            <div>
              <div className="t-caption" style={{ color: 'rgba(255,255,255,0.85)' }}>잔여 연차</div>
              <div className="t-number-xl c-white">11<span style={{ fontSize: '0.5em', opacity: 0.85, fontWeight: 600 }}>일</span></div>
              <div className="t-caption" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>사용 4일 · 지급 15일</div>
            </div>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.3)" strokeWidth="8" fill="none" />
              <circle cx="40" cy="40" r="32" stroke="#fff" strokeWidth="8" fill="none"
                strokeDasharray={`${(11/15)*201} 201`} transform="rotate(-90 40 40)" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '14px 0 10px' }} />
          <div className="row g-8" className="t-caption-strong">
            <Icon.bell className="icon-14 c-white" />
            <span className="c-white">12월 31일 소멸 <b>3일</b> · 신청하지 않으면 사라져요</span>
          </div>
        </Card>

        {/* mini calendar */}
        <Card padding={14} className="mt-10">
          <div className="row-between mb-10">
            <Icon.chevL style={{ width: 18, height: 18, color: 'var(--grey-600)', cursor: 'pointer' }} />
            <div className="t-subtitle">2026년 4월</div>
            <Icon.chevR style={{ width: 18, height: 18, color: 'var(--grey-600)', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {['일','월','화','수','목','금','토'].map((d) => <div key={d} className="t-caption" style={{ textAlign: 'center', padding: 4, fontSize: 10 }}>{d}</div>)}
            {days.map((d) => {
              const ev = events[d];
              const today = d === 22;
              return (
                <div key={d} style={{
                  aspectRatio: '1',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: today ? 700 : 500,
                  color: today ? '#fff' : 'inherit',
                  background: today ? 'var(--brand)' : 'transparent',
                  borderRadius: 'var(--r-sm)', position: 'relative' }}>
                  {d}
                  {ev && <span style={{
                    width: 4, height: 4, borderRadius: 2, marginTop: 2,
                    background: ev === 'leave' ? 'var(--s-leave)' : 'var(--s-break)'
                  }} />}
                </div>
              );
            })}
          </div>
        </Card>

        {/* recent */}
        <div className="mt-14">
          <SectionTitle title="최근 신청" action="전체" onAction={() => {}} />
        </div>
        {[
          { d: '4/28 ~ 4/29', t: '연차 · 2일', s: 'pending', sl: '승인 대기' },
          { d: '4/8', t: '반차 (오후)', s: 'approved', sl: '승인됨' },
          { d: '3/15', t: '연차 · 1일', s: 'approved', sl: '승인됨' },
        ].map((r, i) => (
          <Card key={i} padding={0} className="mb-6">
            <ListRow
              leading={
                <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.calendar className="icon-18 c-muted" />
                </div>
              }
              title={r.d}
              subtitle={r.t}
              trailing={<StatusChip status={r.s} label={r.sl} size="sm" />}
              divider={false}
              onClick={() => {}}
            />
          </Card>
        ))}
      </div>
      <TabBar active="leave" t={t} badges={{ leave: 1 }} />
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Leave apply form ────────────────────────────────────
function MobLeaveApply() {
  const t = useT();
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const sel = [28, 29];
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-appbar">
        <Icon.chevL style={{ width: 24, height: 24, cursor: 'pointer' }} />
        <h1 className="flex-1">연차 신청</h1>
        <Icon.close style={{ width: 22, height: 22, color: 'var(--grey-700)', cursor: 'pointer' }} />
      </div>
      <div className="hf-screen" style={{ padding: '4px 16px 16px' }}>
        {/* type toggle */}
        <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--grey-100)', borderRadius: 'var(--r-md)' }}>
          {['연차','오전 반차','오후 반차','병가'].map((k, i) => (
            <button key={k} style={{
              flex: 1, padding: '10px 0', border: 'none', background: i === 0 ? 'var(--white)' : 'transparent',
              boxShadow: i === 0 ? 'var(--shadow-xs)' : 'none',
              borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              color: i === 0 ? 'var(--grey-900)' : 'var(--grey-500)' }}>{k}</button>
          ))}
        </div>

        {/* calendar */}
        <div className="hf-card" style={{ padding: 14, marginTop: 10 }}>
          <div className="row-between mb-10">
            <Icon.chevL className="icon-18 c-muted" />
            <div className="t-subtitle">2026년 4월</div>
            <Icon.chevR className="icon-18 c-muted" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {['일','월','화','수','목','금','토'].map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--grey-500)', padding: 4 }}>{d}</div>)}
            {days.map((d) => {
              const selected = sel.includes(d);
              const today = d === 22;
              return (
                <div key={d} style={{
                  aspectRatio: '1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: selected || today ? 700 : 500,
                  color: selected ? '#fff' : today ? 'var(--brand)' : 'inherit',
                  background: selected ? 'var(--brand)' : 'transparent',
                  borderRadius: d === 28 ? '10px 0 0 10px' : d === 29 ? '0 10px 10px 0' : 8,
                  marginRight: d === 28 ? -4 : 0, marginLeft: d === 29 ? -4 : 0 }}>{d}</div>
              );
            })}
          </div>
        </div>

        <div className="t-label mt-14 mb-8">사유 (선택)</div>
        <textarea className="hf-input" style={{ minHeight: 80, resize: 'none' }} defaultValue="휴식을 위한 개인 사유" />

        <div className="t-label mt-14 mb-8">승인자</div>
        <Card padding={12}>
          <ListRow
            leading={<Avatar n="박민지" size={36} />}
            title="박민지 PM"
            subtitle="디자인 · 직속"
            trailing={<StatusChip status="office" label="온라인" size="sm" />}
            divider={false}
          />
        </Card>

        {/* summary */}
        <Card padding={14} style={{ marginTop: 14, background: 'var(--brand-softer)' }}>
          <div className="row-between">
            <span className="t-body-sm c-muted">사용 일수</span>
            <b className="num t-body-strong">2일</b>
          </div>
          <div className="row-between mt-4">
            <span className="t-body-sm c-muted">신청 후 잔여</span>
            <b className="num t-body-strong">9일</b>
          </div>
        </Card>

        <button className="hf-btn hf-btn-primary hf-btn-large hf-btn-block mt-16">
          박민지 PM에게 신청하기
        </button>
      </div>
      <div className="hf-phone-home" />
    </div>
  );
}

// ─── Success: 상단 제출전용 확인 화면 (DESIGN.md §14) ───
function MobSuccess() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <SuccessConfirm
        title="신청이 접수됐어요"
        subtitle="박민지 PM이 확인하는 대로 알려드려요"
        detail={
          <div className="ta-l">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span className="c-muted">기간</span>
              <b className="num c-primary">4/28 — 4/29</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span className="c-muted">유형</span>
              <b className="c-primary">연차 · 2일</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span className="c-muted">신청 후 잔여</span>
              <b className="num c-primary">9일</b>
            </div>
          </div>
        }
        primary="확인"
        secondary="신청 내역 보기"
      />
      <div className="hf-phone-home" />
    </div>
  );
}

Object.assign(window, { MobLogin, MobHomeSlide, MobHomeTap, MobHomeCards, MobOvertime, MobTeamGrid, MobTeamGrouped, MobTeamTimeline, MobLeaveCalendar, MobLeaveApply, MobSuccess });
