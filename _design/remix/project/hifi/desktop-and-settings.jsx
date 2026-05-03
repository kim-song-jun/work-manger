// Desktop menubar / tray + Settings + UI Customize

// ─── macOS menubar tray ──────────────────────────────────
function DesktopMenubar() {
  return (
    <div className="hf-macos">
      {/* menubar */}
      <div style={{ height: 28, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 13, color: '#1a1a1a', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.1 13.3c0-2.4 2-3.5 2.1-3.6-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.5 1.3-.1 1.8-.9 3.4-.9 1.6 0 2.1.9 3.5.8 1.4 0 2.3-1.2 3.2-2.5.6-.9 1-1.8 1.4-2.7-3.1-1.2-3.1-4.4-3.1-4.4z"/></svg>
          <span style={{ fontWeight: 700, marginLeft: 10 }}>Workday</span>
        <span style={{ marginLeft: 16 }}>파일</span><span style={{ marginLeft: 12 }}>편집</span><span style={{ marginLeft: 12 }}>보기</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center', fontSize: 12 }}>
          {/* tray icons */}
          <span style={{ position: 'relative' }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: 'var(--brand)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>W</div>
            <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--success)', borderRadius: 999, border: '1.5px solid #fff' }}/>
          </span>
          <span>🔋 82%</span>
          <span>📶</span>
          <span>🔍</span>
          <span style={{ fontFamily: 'var(--font-num)', fontWeight: 600 }}>수 4월 22일 15:42</span>
        </div>
      </div>

      {/* dropdown tray */}
      <div style={{
        position: 'absolute', top: 32, right: 130, width: 340,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(40px)',
        borderRadius: 14, padding: 14,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.1)' }}>
        {/* current status header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 12px' }}>
          <Avatar n="김지우" size={38}/>
          <div className="flex-1">
            <div className="t-body fw-700">김지우 · 근무 중</div>
            <div className="t-caption">08:54 출근 · 본사</div>
          </div>
          <div className="num fs-20 fw-700">6h 48m</div>
        </div>

        {/* quick action */}
        <button className="hf-btn hf-btn-lg" style={{ width: '100%', background: 'var(--grey-900)', color: 'var(--white)', padding: 14, justifyContent: 'space-between' }}>
          <span className="row g-8">
            <Icon.moon className="icon-16"/><b>퇴근 찍기</b>
          </span>
          <span style={{ fontSize: 12, opacity: 0.7 }}>⌘ ⇧ O</span>
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
          <button className="hf-btn hf-btn-secondary" style={{ padding: '10px 8px', fontSize: 12 }}><Icon.coffee className="icon-14"/> 휴게 시작</button>
          <button className="hf-btn hf-btn-secondary" style={{ padding: '10px 8px', fontSize: 12 }}><Icon.house className="icon-14"/> 재택으로 전환</button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--grey-500)', margin: '14px 6px 6px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>오늘</div>

        <div style={{ background: 'var(--white)', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span className="c-mute">정규 근무</span><b className="num">09:00 – 18:00</b>
          </div>
          <div className="hf-progress mt-8"><span style={{ width: '76%' }}/></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 6, color: 'var(--grey-500)' }}>
            <span>08:54</span><span>남은 시간 2h 12m</span><span>18:00</span>
          </div>
        </div>

        {/* team preview */}
        <div style={{ fontSize: 12, color: 'var(--grey-500)', margin: '14px 6px 6px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>팀 · 지금</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 4px' }}>
          {PEOPLE.slice(0, 8).map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px 4px 4px', background: 'var(--white)', borderRadius: 999, fontSize: 12 }}>
              <div style={{ position: 'relative' }}>
                <Avatar n={p.n} size={18}/>
                <span className={`hf-dot ${p.s}`} style={{ position: 'absolute', bottom: -1, right: -1, width: 6, height: 6, border: '1.5px solid #fff' }}/>
              </div>
              {p.n.slice(1)}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--grey-200)', marginTop: 12, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--grey-600)' }}>
          <span style={{ cursor: 'pointer' }}>대시보드 열기</span>
          <span style={{ cursor: 'pointer' }}>설정</span>
        </div>
      </div>

      {/* faint dock at bottom */}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, padding: 8, background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(20px)', borderRadius: 'var(--r-lg)', border: '0.5px solid rgba(0,0,0,0.1)' }}>
        {['var(--warn)','var(--brand)','var(--s-office)','var(--purple)','var(--danger)','#1a1a1a'].map((c, i) => (
          <div key={i} style={{ width: 40, height: 40, borderRadius: 10, background: c, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}/>
        ))}
      </div>
    </div>
  );
}

// ─── Mobile settings ─────────────────────────────────────
function MobSettings() {
  const t = useT();
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch"/>
      <StatusBar/>
      <div className="hf-appbar"><h1 className="flex-1">마이</h1></div>
      <div className="hf-screen" style={{ padding: '0 16px 16px' }}>
        {/* profile card */}
        <div className="hf-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar n="김지우" size={52}/>
          <div className="flex-1">
            <div className="t-heading-sm">김지우</div>
            <div className="t-caption">디자인팀 · 프로덕트 디자이너</div>
            <div className="fs-12 c-mute mt-2">jiwoo@company.co.kr</div>
          </div>
          <Icon.chevR className="icon-18 c-faint"/>
        </div>

        {/* stats mini */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 10 }}>
          {[['연차','11일'],['이번 달','168h'],['초과','4.3h']].map(([l, v]) => (
            <div key={l} className="hf-card" style={{ padding: 10, textAlign: 'center' }}>
              <div className="num fs-18 fw-700">{v}</div>
              <div className="t-caption">{l}</div>
            </div>
          ))}
        </div>

        {/* sections */}
        {[
          { title: '화면 & 알림', items: [
            [Icon.sun, '화면 꾸미기', '라이트 · 블루', true],
            [Icon.bell, '알림', '모두 켜짐'],
            [Icon.house, '언어', '한국어 · KR'],
          ]},
          { title: '근무 설정', items: [
            [Icon.map, '내 위치 등록', '본사 · 자택'],
            [Icon.clock, '정규 근무시간', '09:00 – 18:00'],
            [Icon.user, '승인자', '박민지 PM'],
          ]},
          { title: '계정', items: [
            [Icon.lock, '비밀번호 변경', ''],
            [Icon.inbox, '로그 기록 내보내기', ''],
            [Icon.close, '로그아웃', '', false, 'danger'],
          ]},
        ].map((sec, si) => (
          <div key={si} className="mt-16">
            <div style={{ fontSize: 12, color: 'var(--grey-500)', fontWeight: 700, padding: '0 4px 6px' }}>{sec.title}</div>
            <div className="hf-card" style={{ padding: 0, overflow: 'hidden' }}>
              {sec.items.map(([IC, l, v, highlight, color], i) => (
                <div key={i} className="tap" style={{
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none', cursor: 'pointer' }}>
                  <IC style={{ width: 18, height: 18, color: color ? `var(--${color})` : 'var(--grey-600)' }}/>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: color ? `var(--${color})` : 'inherit' }}>{l}</div>
                  {v && <div className="t-caption">{v}</div>}
                  {highlight && <span className="hf-chip brand" style={{ fontSize: 10, padding: '2px 6px' }}>NEW</span>}
                  {!color && <Icon.chevR className="icon-14 c-faint"/>}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--grey-400)', marginTop: 18 }}>Workday v2.4.0</div>
      </div>
      <TabBar active="me" t={t}/>
      <div className="hf-phone-home"/>
    </div>
  );
}

// ─── UI Customize screen — lots of toggles ──────────────
function MobCustomize() {
  const t = useT();
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch"/>
      <StatusBar/>
      <div className="hf-appbar">
        <Icon.chevL className="icon-22"/>
        <h1 className="flex-1">화면 꾸미기</h1>
      </div>
      <div className="hf-screen" style={{ padding: '0 16px 16px' }}>
        {/* theme swatches */}
        <div style={{ fontSize: 12, color: 'var(--grey-500)', fontWeight: 700, padding: '8px 4px 6px' }}>테마</div>
        <div className="hf-card" style={{ padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              ['라이트','var(--brand)', false],
              ['다크','#131720', false],
              ['민트','var(--success)', true],
              ['바이올렛','var(--purple)', false],
              ['코랄','var(--danger)', false],
              ['모노','var(--grey-900)', false],
            ].map(([n, c, on], i) => (
              <div key={i} className="ta-c">
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: 'var(--r-md)', background: c,
                  border: on ? '3px solid var(--grey-900)' : '3px solid transparent',
                  boxShadow: on ? '0 0 0 1px var(--grey-900)' : 'inset 0 0 0 1px var(--grey-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on && <Icon.check className="icon-20 c-white"/>}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, color: on ? 'var(--grey-900)' : 'var(--grey-600)' }}>{n}</div>
              </div>
            ))}
          </div>
        </div>

        {/* appearance mode */}
        <div style={{ fontSize: 12, color: 'var(--grey-500)', fontWeight: 700, padding: '16px 4px 6px' }}>화면 모드</div>
        <div className="hf-card" style={{ padding: 6 }}>
          <div className="row g-4">
            {[['자동', Icon.settings, false], ['라이트', Icon.sun, true], ['다크', Icon.moon, false]].map(([l, IC, a], i) => (
              <div key={i} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, textAlign: 'center',
                background: a ? 'var(--grey-900)' : 'transparent',
                color: a ? '#fff' : 'var(--grey-700)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <IC style={{ width: 16, height: 16, marginBottom: 2 }}/>
                <div>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* font size */}
        <div style={{ fontSize: 12, color: 'var(--grey-500)', fontWeight: 700, padding: '16px 4px 6px' }}>글자 크기</div>
        <div className="hf-card" style={{ padding: 16 }}>
          <div className="row-end mb-10">
            <span className="fs-12">가</span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>가</span>
            <span className="fs-22 fw-700">가</span>
          </div>
          <input type="range" min="0" max="2" defaultValue="1" style={{ width: '100%', accentColor: 'var(--brand)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--grey-500)', marginTop: 4 }}>
            <span>작게</span><span>보통</span><span>크게</span>
          </div>
        </div>

        {/* checkin UI */}
        <div style={{ fontSize: 12, color: 'var(--grey-500)', fontWeight: 700, padding: '16px 4px 6px' }}>출퇴근 UI</div>
        <div className="hf-card" style={{ padding: 8 }}>
          {[
            ['밀어서 출근', '슬라이드 버튼', true],
            ['탭하여 출근', '큰 원형 버튼', false],
            ['카드 스택', '스텝별 카드', false],
            ['위치 자동', '감지 시 자동 체크인 제안', false],
          ].map(([l, s, on], i) => (
            <div key={i} style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
              borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: on ? '6px solid var(--brand)' : '2px solid var(--grey-300)',
                flexShrink: 0 }}/>
              <div className="flex-1">
                <div className="fs-14 fw-600">{l}</div>
                <div className="t-caption">{s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* team view */}
        <div style={{ fontSize: 12, color: 'var(--grey-500)', fontWeight: 700, padding: '16px 4px 6px' }}>팀 상태 보기</div>
        <div className="hf-card" style={{ padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { l: '그리드', svg: (<g><rect x="4" y="4" width="10" height="10" rx="5"/><rect x="18" y="4" width="10" height="10" rx="5"/><rect x="32" y="4" width="10" height="10" rx="5"/><rect x="4" y="18" width="10" height="10" rx="5"/><rect x="18" y="18" width="10" height="10" rx="5"/><rect x="32" y="18" width="10" height="10" rx="5"/></g>), on: true },
              { l: '팀별', svg: (<g><rect x="4" y="4" width="38" height="8" rx="2"/><rect x="4" y="16" width="38" height="8" rx="2"/><rect x="4" y="28" width="38" height="8" rx="2"/></g>) },
              { l: '타임라인', svg: (<g><line x1="4" y1="8" x2="42" y2="8" strokeWidth="1.5"/><line x1="4" y1="18" x2="42" y2="18" strokeWidth="1.5"/><line x1="4" y1="28" x2="42" y2="28" strokeWidth="1.5"/><rect x="10" y="5" width="14" height="6" rx="1"/><rect x="18" y="15" width="16" height="6" rx="1"/><rect x="6" y="25" width="20" height="6" rx="1"/></g>) },
            ].map((v, i) => (
              <div key={i} style={{ border: `2px solid ${v.on ? 'var(--brand)' : 'var(--grey-200)'}`, borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <svg width="46" height="32" viewBox="0 0 46 32" fill={v.on ? 'var(--brand)' : 'var(--grey-400)'} stroke={v.on ? 'var(--brand)' : 'var(--grey-400)'}>{v.svg}</svg>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: v.on ? 'var(--brand)' : 'var(--grey-600)' }}>{v.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* home widgets */}
        <div style={{ fontSize: 12, color: 'var(--grey-500)', fontWeight: 700, padding: '16px 4px 6px' }}>홈 위젯</div>
        <div className="hf-card" style={{ padding: 8 }}>
          {[
            ['오늘 근무 시간', true],
            ['주간 근무 요약', true],
            ['잔여 연차', true],
            ['팀 현재 상태', true],
            ['초과근무 누적', false],
            ['승인 대기', false],
          ].map(([l, on], i) => (
            <div key={i} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10,
              borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" className="c-faint">
                <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div className="flex-1 fs-14">{l}</div>
              <span className={`hf-switch ${on ? 'on' : ''}`}/>
            </div>
          ))}
        </div>
      </div>
      <div className="hf-phone-home"/>
    </div>
  );
}

Object.assign(window, { DesktopMenubar, MobSettings, MobCustomize });
