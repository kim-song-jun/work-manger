// Hi-fi web dashboard screens — personal + shared frames

// ─── Web Dashboard (personal) ─────────────────────────────
function WebDashboard() {
  const t = useT();
  const weekBars = [6.8, 8.2, 9.1, 8.5, 7.2, 0, 0]; // hours per day
  const maxH = 10;
  return (
    <div className="hf-web">
      <div className="hf-webbar">
        <div className="dots"><i style={{background:'#FF5F57'}}/><i style={{background:'#FEBC2E'}}/><i style={{background:'#28C840'}}/></div>
        <div className="url">work.company.co.kr/dashboard</div>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
        {/* sidebar */}
        <div style={{ width: 220, borderRight: '1px solid var(--grey-200)', background: 'var(--white)', padding: '18px 14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 18px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--brand)', color: 'var(--white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>W</div>
            <b className="fs-15">Workday</b>
          </div>
          {[
            [Icon.home, '대시보드', true],
            [Icon.calendar, '내 연차', false, '3'],
            [Icon.clock, '근무 기록', false],
            [Icon.team, '팀 현황', false],
            [Icon.inbox, '신청/요청', false, '1'],
          ].map(([IC, l, active, badge], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px',
              borderRadius: 'var(--r-sm)', marginBottom: 2, cursor: 'pointer',
              background: active ? 'var(--brand-soft)' : 'transparent',
              color: active ? 'var(--brand)' : 'var(--grey-700)',
              fontSize: 14, fontWeight: active ? 700 : 500 }}>
              <IC className="icon-18" />
              <span className="flex-1">{l}</span>
              {badge && <span style={{ background: 'var(--danger)', color: 'var(--white)', fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '1px 6px' }}>{badge}</span>}
            </div>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid var(--grey-200)', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 8px' }}>
            <Avatar n="김지우" size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="fs-13 fw-600">김지우</div>
              <div className="t-caption">디자인팀</div>
            </div>
            <Icon.settings className="icon-16 c-mute"/>
          </div>
        </div>

        {/* main */}
        <div style={{ flex: 1, overflow: 'auto', padding: 32, minWidth: 0 }}>
          <div className="row-between">
            <div>
              <div className="c-mute fs-13">수 · 2026년 4월 22일</div>
              <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{t('good_morning')}, 지우님</h1>
            </div>
            <div className="row g-8">
              <button className="hf-btn hf-btn-secondary">이번 주 리포트</button>
              <button className="hf-btn hf-btn-primary"><Icon.plus className="icon-14" /> 연차 신청</button>
            </div>
          </div>

          {/* Top row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 14, marginTop: 20 }}>
            {/* Clock-in card */}
            <div className="hf-card" style={{ padding: 20 }}>
              <div className="row-start">
                <div>
                  <div className="t-caption-strong">오늘의 근무</div>
                  <div className="num" style={{ fontSize: 40, fontWeight: 700, letterSpacing: -0.5, marginTop: 4 }}>6h 30m<span style={{ fontSize: 16, color: 'var(--grey-400)', fontWeight: 600, marginLeft: 6 }}>/ 8h</span></div>
                </div>
                <span className="hf-chip success"><span className="hf-dot office" /> 근무 중</span>
              </div>
              <div className="hf-progress mt-14"><span style={{ width: '81%', background: 'var(--success)' }}/></div>
              <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 13 }}>
                <div><div className="c-mute">출근</div><div className="num fw-700">08:54</div></div>
                <div><div className="c-mute">예정 퇴근</div><div className="num fw-700">18:00</div></div>
                <div><div className="c-mute">위치</div><div className="fw-700">본사</div></div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button className="hf-btn hf-btn-secondary" style={{ padding: '6px 12px' }}>휴게</button>
                  <button className="hf-btn" style={{ background: 'var(--grey-900)', color: 'var(--white)', padding: '6px 14px' }}>퇴근</button>
                </div>
              </div>
            </div>

            {/* Leave summary */}
            <div className="hf-card" style={{ padding: 18, background: 'var(--brand)', color: 'var(--white)' }}>
              <div style={{ fontSize: 12, opacity: 0.85 }}>잔여 연차</div>
              <div className="num" style={{ fontSize: 36, fontWeight: 700, marginTop: 2, letterSpacing: -0.5 }}>11<span style={{ fontSize: 16, opacity: 0.8 }}>일</span></div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 999, marginTop: 12 }}>
                <div style={{ height: '100%', width: '73%', background: 'var(--white)', borderRadius: 999 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 6, opacity: 0.85 }}>
                <span>사용 4일</span><span>지급 15일</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, background: 'rgba(0,0,0,0.15)', padding: '6px 10px', borderRadius: 'var(--r-sm)' }}>
                <Icon.bell className="icon-12" />
                12월 소멸 <b>3일</b>
              </div>
            </div>

            {/* Overtime */}
            <div className="hf-card" style={{ padding: 18 }}>
              <div className="t-caption-strong">이번 달 초과근무</div>
              <div className="num" style={{ fontSize: 36, fontWeight: 700, marginTop: 2, letterSpacing: -0.5 }}>4.3<span className="fs-16 c-faint">h</span></div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 42, marginTop: 10 }}>
                {[1,0.4,2,1.5,0,0.8,0,0,0].map((v, i) => (
                  <div key={i} style={{ flex: 1, height: `${Math.max(6, v*100/2)}%`, background: v > 0 ? 'var(--warn)' : 'var(--grey-200)', borderRadius: 2 }} />
                ))}
              </div>
              <div className="fs-12 c-mute mt-6">모두 승인됨 · 직속: 박PM</div>
            </div>
          </div>

          {/* middle row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginTop: 14 }}>
            <div className="hf-card" style={{ padding: 20 }}>
              <div className="row-between mb-14">
                <div>
                  <div className="t-subtitle">이번 주 근무</div>
                  <div className="t-caption">총 32h 8m · 주 평균 대비 +1.2h</div>
                </div>
                <div className="row g-4">
                  <button className="hf-btn hf-btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>주간</button>
                  <button className="hf-btn hf-btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}>월간</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160, paddingBottom: 20, borderBottom: '1px solid var(--grey-200)', position: 'relative' }}>
                {/* target line */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(8/maxH)*140 + 20}px`, borderTop: '1.5px dashed var(--grey-300)' }}>
                  <span style={{ position: 'absolute', right: 0, top: -16, fontSize: 10, color: 'var(--grey-500)' }}>목표 8h</span>
                </div>
                {['월','화','수','목','금','토','일'].map((d, i) => (
                  <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <span className="num" style={{ fontSize: 12, color: weekBars[i] ? 'var(--grey-700)' : 'var(--grey-400)', fontWeight: 600 }}>{weekBars[i] || '—'}</span>
                    <div style={{ width: '100%', maxWidth: 36, height: `${(weekBars[i]/maxH)*100}%`, background: i === 2 ? 'var(--brand)' : weekBars[i] > 8 ? 'var(--warn)' : 'var(--grey-300)', borderRadius: '6px 6px 0 0', minHeight: weekBars[i] ? 4 : 0 }} />
                    <span className="t-caption-strong">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hf-card" style={{ padding: 20 }}>
              <div className="t-subtitle">알림</div>
              <div className="mt-10">
                {[
                  { ic: Icon.bell, t: '연차 3일이 12월에 소멸돼요', s: '지금 신청하기', c: 'warn' },
                  { ic: Icon.check, t: '박PM이 초과근무 승인', s: '4/19 · 2시간', c: 'success' },
                  { ic: Icon.team, t: '팀원 3명이 재택', s: '디자인팀 · 오늘', c: 'info' },
                ].map((n, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--grey-200)' : 'none', display: 'flex', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: `var(--${n.c}-soft)`, color: `var(--${n.c})` }}>
                      <n.ic className="icon-16"/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{n.t}</div>
                      <div className="fs-12 c-mute mt-2">{n.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Web: team leave calendar ────────────────────────────
function WebTeamLeave() {
  const t = useT();
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const leaves = {
    '김지우': { 8: 'L', 14: 'L' },
    '박서연': { 2: 'L', 3: 'L', 25: 'H' },
    '이도현': { 18: 'L' },
    '최하늘': { 11: 'L', 12: 'L' },
    '정유진': { 9: 'H', 22: 'H' },
    '오민석': { 21: 'L', 22: 'L', 23: 'L' },
    '한예린': { 29: 'L' },
    '서지훈': {} };
  const names = Object.keys(leaves);
  return (
    <div className="hf-web">
      <div className="hf-webbar">
        <div className="dots"><i style={{background:'#FF5F57'}}/><i style={{background:'#FEBC2E'}}/><i style={{background:'#28C840'}}/></div>
        <div className="url">work.company.co.kr/team/leave</div>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
        <div style={{ width: 220, borderRight: '1px solid var(--grey-200)', background: 'var(--white)', padding: '18px 14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 18px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--brand)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>W</div>
            <b className="fs-15">Workday</b>
          </div>
          {[
            [Icon.home, '대시보드', false],
            [Icon.calendar, '내 연차', false],
            [Icon.clock, '근무 기록', false],
            [Icon.team, '팀 현황', true],
            [Icon.inbox, '신청/요청', false],
          ].map(([IC, l, active], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px',
              borderRadius: 'var(--r-sm)', cursor: 'pointer',
              background: active ? 'var(--brand-soft)' : 'transparent',
              color: active ? 'var(--brand)' : 'var(--grey-700)',
              fontSize: 14, fontWeight: active ? 700 : 500 }}>
              <IC className="icon-18" />{l}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 28, overflow: 'auto' }}>
          <div className="row-between">
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>팀 연차 캘린더</h1>
              <div className="fs-13 c-mute mt-2">디자인 + 개발팀 · 2026년 4월</div>
            </div>
            <div className="row g-8">
              <button className="hf-btn hf-btn-secondary"><Icon.filter className="icon-14"/> 팀 선택</button>
              <button className="hf-btn hf-btn-secondary">이번 달</button>
              <button className="hf-btn hf-btn-primary"><Icon.plus className="icon-14"/> 연차 신청</button>
            </div>
          </div>

          <div className="hf-card" style={{ marginTop: 18, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(30, 1fr)`, borderBottom: '1px solid var(--grey-200)' }}>
              <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--grey-600)', borderRight: '1px solid var(--grey-200)' }}>팀원</div>
              {days.map((d) => {
                const weekend = d % 7 === 5 || d % 7 === 6;
                return (
                  <div key={d} style={{ padding: '8px 0', fontSize: 12, textAlign: 'center', color: weekend ? 'var(--danger)' : 'var(--grey-600)', background: d === 22 ? 'var(--brand-soft)' : 'transparent', fontWeight: d === 22 ? 700 : 500 }}>{d}</div>
                );
              })}
            </div>
            {names.map((n) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: `140px repeat(30, 1fr)`, borderBottom: '1px solid var(--grey-100)', alignItems: 'center' }}>
                <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid var(--grey-200)' }}>
                  <Avatar n={n} size={24} /><span className="fs-13 fw-600">{n}</span>
                </div>
                {days.map((d) => {
                  const ev = leaves[n]?.[d];
                  const today = d === 22;
                  return (
                    <div key={d} style={{ height: 38, borderRight: '1px solid var(--grey-100)', background: today ? 'var(--brand-softer)' : 'transparent', position: 'relative', padding: 3 }}>
                      {ev && <div style={{
                        height: '100%', borderRadius: 4,
                        background: ev === 'L' ? 'var(--s-leave)' : 'var(--s-break)',
                        opacity: 0.85,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: 'var(--white)'
                      }}>{ev === 'L' ? '연차' : '반차'}</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 12, color: 'var(--grey-600)' }}>
            <div className="row g-6"><div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--s-leave)', opacity: 0.85 }}/>연차</div>
            <div className="row g-6"><div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--s-break)', opacity: 0.85 }}/>반차</div>
            <div className="row g-6"><div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--brand-softer)' }}/>오늘</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Web: my records (detail) ────────────────────────────
function WebRecords() {
  return (
    <div className="hf-web">
      <div className="hf-webbar">
        <div className="dots"><i style={{background:'#FF5F57'}}/><i style={{background:'#FEBC2E'}}/><i style={{background:'#28C840'}}/></div>
        <div className="url">work.company.co.kr/records</div>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
        <div style={{ width: 220, borderRight: '1px solid var(--grey-200)', background: 'var(--white)', padding: '18px 14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 18px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--brand)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>W</div>
            <b className="fs-15">Workday</b>
          </div>
          {[
            [Icon.home, '대시보드', false],
            [Icon.calendar, '내 연차', false],
            [Icon.clock, '근무 기록', true],
            [Icon.team, '팀 현황', false],
            [Icon.inbox, '신청/요청', false],
          ].map(([IC, l, active], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px',
              borderRadius: 'var(--r-sm)', cursor: 'pointer',
              background: active ? 'var(--brand-soft)' : 'transparent',
              color: active ? 'var(--brand)' : 'var(--grey-700)',
              fontSize: 14, fontWeight: active ? 700 : 500 }}>
              <IC className="icon-18" />{l}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 28, overflow: 'auto' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>근무 기록</h1>
          <div className="fs-13 c-mute mt-2">2026년 4월 · 지우님의 상세 근무 내역</div>

          {/* summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              ['정시 출근율', '94%', 'success'],
              ['평균 근무', '8h 12m', 'brand'],
              ['초과근무', '4.3h', 'warn'],
              ['연차 사용', '2일', 'info'],
            ].map(([l, v, c], i) => (
              <div key={i} className="hf-card" style={{ padding: 16 }}>
                <div className="t-caption-strong">{l}</div>
                <div className="num" style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: `var(--${c})` }}>{v}</div>
              </div>
            ))}
          </div>

          {/* table */}
          <div className="hf-card" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--grey-200)' }}>
              <b className="fs-15">일별 기록</b>
              <div className="row g-6">
                <div style={{ position: 'relative' }}>
                  <Icon.search style={{ position: 'absolute', left: 10, top: 8, width: 14, height: 14, color: 'var(--grey-400)' }}/>
                  <input className="hf-input" placeholder="검색" style={{ padding: '6px 10px 6px 30px', fontSize: 12, width: 160 }}/>
                </div>
                <button className="hf-btn hf-btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>엑셀 내보내기</button>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: 'var(--grey-50)' }}>
                <tr className="ta-l c-muted fw-600">
                  {['날짜','출근','퇴근','근무시간','위치','상태'].map((h) => <th key={h} style={{ padding: '10px 16px' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['4/22 수','08:54','근무 중','6h 30m','본사','in', 'brand'],
                  ['4/21 화','09:02','18:14','8h 24m','본사','정시','success'],
                  ['4/20 월','08:48','20:12','10h 34m','본사','초과 승인','warn'],
                  ['4/19 금','—','—','—','연차','연차','info'],
                  ['4/18 목','09:15','18:08','8h 02m','재택','정시','success'],
                  ['4/17 수','09:01','18:02','8h 11m','본사','정시','success'],
                  ['4/16 화','08:52','19:45','10h 12m','본사','초과 승인','warn'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--grey-100)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)' }}>{r[1]}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)' }}>{r[2]}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)', fontWeight: 700 }}>{r[3]}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--grey-700)' }}>{r[4]}</td>
                    <td style={{ padding: '12px 16px' }}><span className={`hf-chip ${r[6]}`}>{r[5]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WebDashboard, WebTeamLeave, WebRecords });
