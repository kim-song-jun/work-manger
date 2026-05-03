// Admin screens — approvals, expiring leave, reports, employees

function AdminShell({ active, children, breadcrumb }) {
  const items = [
    [Icon.chart, '대시보드', 'dash'],
    [Icon.inbox, '승인 대기', 'approve', '12'],
    [Icon.bell, '연차 관리', 'leave', '5'],
    [Icon.team, '직원 관리', 'employees'],
    [Icon.calendar, '근태 리포트', 'reports'],
    [Icon.settings, '조직 설정', 'settings'],
  ];
  return (
    <div className="hf-web">
      <div className="hf-webbar">
        <div className="dots"><i style={{background:'#FF5F57'}}/><i style={{background:'#FEBC2E'}}/><i style={{background:'#28C840'}}/></div>
        <div className="url">admin.company.co.kr/{active}</div>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
        <div style={{ width: 220, borderRight: '1px solid var(--grey-200)', background: 'var(--white)', padding: '18px 14px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 6px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--grey-900)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>W</div>
            <div><b className="fs-14">Workday</b><div className="fs-10 c-mute">관리자</div></div>
          </div>
          <div style={{ padding: '10px 8px', borderRadius: 'var(--r-sm)', background: 'var(--grey-50)', marginTop: 12, fontSize: 12 }}>
            <div className="c-mute">조직</div>
            <div className="fw-700 fs-13">컴퍼니 Inc. · 42명</div>
          </div>
          <div className="mt-10">
            {items.map(([IC, l, k, badge]) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px',
                borderRadius: 'var(--r-sm)', marginBottom: 2, cursor: 'pointer',
                background: active === k ? 'var(--grey-900)' : 'transparent',
                color: active === k ? '#fff' : 'var(--grey-700)',
                fontSize: 13, fontWeight: active === k ? 700 : 500 }}>
                <IC style={{ width: 17, height: 17 }} />
                <span className="flex-1">{l}</span>
                {badge && <span style={{ background: active === k ? 'rgba(255,255,255,0.25)' : 'var(--danger)', color: 'var(--white)', fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '1px 6px' }}>{badge}</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 28, minWidth: 0 }}>
          {breadcrumb && <div className="fs-12 c-mute mb-4">{breadcrumb}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── A1: approvals inbox ─────────────────────────────────
function AdminApprovals() {
  const rows = [
    { who: '이도현', team: '개발', k: '연차', d: '5/2 ~ 5/3 · 2일', r: '가족 행사', since: '2시간 전', kind: 'leave' },
    { who: '최하늘', team: '개발', k: '오후 반차', d: '4/25 · 0.5일', r: '병원 방문', since: '3시간 전', kind: 'leave' },
    { who: '윤소라', team: '마케팅', k: '초과근무', d: '4/21 18:00~21:30 · 3h 30m', r: '캠페인 런칭 준비', since: '어제', kind: 'ot' },
    { who: '장민호', team: '마케팅', k: '초과근무', d: '4/20 18:00~20:15 · 2h 15m', r: '고객 미팅 후속', since: '어제', kind: 'ot' },
    { who: '강보람', team: '재무', k: '연차', d: '5/8 · 1일', r: '—', since: '어제', kind: 'leave' },
  ];
  return (
    <AdminShell active="approve" breadcrumb="승인 대기">
      <div className="row-between">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>승인 대기</h1>
          <div className="fs-13 c-mute mt-2">연차 5건 · 초과근무 7건이 검토를 기다리고 있어요</div>
        </div>
        <div className="row g-8">
          <button className="hf-btn hf-btn-secondary"><Icon.filter className="icon-14"/> 필터</button>
          <button className="hf-btn hf-btn-primary">전체 승인</button>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 4, marginTop: 18, borderBottom: '1px solid var(--grey-200)' }}>
        {[['전체', 12, true],['연차', 5, false],['초과근무', 7, false],['외근', 0, false]].map(([l, n, a], i) => (
          <div key={i} style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            color: a ? 'var(--grey-900)' : 'var(--grey-500)',
            borderBottom: a ? '2px solid var(--grey-900)' : '2px solid transparent',
            marginBottom: -1 }}>{l} <span style={{ marginLeft: 4, opacity: 0.7 }}>{n}</span></div>
        ))}
      </div>

      <div className="mt-14">
        {rows.map((r, i) => (
          <div key={i} className="hf-card" style={{ padding: 18, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
            <input type="checkbox" className="icon-16" />
            <Avatar n={r.who} size={40} />
            <div style={{ width: 140 }}>
              <div className="t-body fw-700">{r.who}</div>
              <div className="t-caption">{r.team}</div>
            </div>
            <div className="flex-1">
              <div className="row g-8">
                <span className={`hf-chip ${r.kind === 'leave' ? 'warn' : 'info'}`}>{r.k}</span>
                <b className="fs-14">{r.d}</b>
              </div>
              <div className="fs-12 c-muted mt-4">
                사유: {r.r} · <span className="c-faint">{r.since}</span>
              </div>
            </div>
            <div className="row g-6">
              <button className="hf-btn hf-btn-ghost c-danger">반려</button>
              <button className="hf-btn hf-btn-primary" style={{ background: 'var(--grey-900)' }}><Icon.check className="icon-14"/> 승인</button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

// ─── A2: expiring leave → notify ────────────────────────
function AdminExpiringLeave() {
  const rows = [
    { n: '김지우', team: '디자인', days: 3, when: '12/31', risk: 'high' },
    { n: '박서연', team: '디자인', days: 2, when: '12/31', risk: 'mid' },
    { n: '정유진', team: '개발', days: 5, when: '12/31', risk: 'high' },
    { n: '오민석', team: '개발', days: 1, when: '12/31', risk: 'low' },
    { n: '서지훈', team: '운영', days: 4, when: '12/31', risk: 'high' },
    { n: '임시우', team: '재무', days: 2, when: '12/31', risk: 'mid' },
  ];
  const riskColor = { high: 'danger', mid: 'warn', low: 'info' };
  const riskLabel = { high: '위험', mid: '주의', low: '양호' };
  return (
    <AdminShell active="leave" breadcrumb="연차 관리 · 소멸 예정">
      <div className="row-between">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>소멸 예정 연차</h1>
          <div className="fs-13 c-mute mt-2">12월 31일까지 17명 · 총 48일이 소멸돼요</div>
        </div>
        <div className="row g-8">
          <button className="hf-btn hf-btn-secondary">자동 안내 규칙</button>
          <button className="hf-btn hf-btn-primary"><Icon.bell className="icon-14"/> 선택 안내 발송</button>
        </div>
      </div>

      {/* summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
        {[
          ['소멸 위험 인원', '17', '명', 'danger'],
          ['총 소멸 예정', '48', '일', 'warn'],
          ['안내 발송 완료', '12', '명', 'success'],
          ['응답률', '65', '%', 'info'],
        ].map(([l, v, u, c], i) => (
          <div key={i} className="hf-card" style={{ padding: 16 }}>
            <div className="t-caption-strong">{l}</div>
            <div className="num" style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: `var(--${c})` }}>
              {v}<span style={{ fontSize: 14, color: 'var(--grey-400)', marginLeft: 3 }}>{u}</span>
            </div>
          </div>
        ))}
      </div>

      {/* auto notify rule */}
      <div className="hf-card" style={{ padding: 18, marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--brand-softer)', border: '1px solid var(--brand-soft)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.bell className="icon-20"/>
        </div>
        <div className="flex-1">
          <b className="fs-14">자동 안내 · 소멸 60 / 30 / 7일 전</b>
          <div className="fs-12 c-muted mt-2">잔여 1일 이상인 직원에게 자동으로 푸시와 이메일을 보내요</div>
        </div>
        <span className="hf-switch on" />
      </div>

      {/* table */}
      <div className="hf-card" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: 'var(--grey-50)' }}>
            <tr className="ta-l c-muted fw-600">
              <th style={{ padding: '12px 16px', width: 30 }}><input type="checkbox" /></th>
              {['직원','팀','소멸 예정','소멸일','위험도','마지막 안내','작업'].map((h) => <th key={h} style={{ padding: '12px 16px' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--grey-100)' }}>
                <td style={{ padding: '12px 16px' }}><input type="checkbox" /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div className="row g-8">
                    <Avatar n={r.n} size={28} /><b>{r.n}</b>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--grey-700)' }}>{r.team}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-num)' }}>{r.days}일</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)' }}>{r.when}</td>
                <td style={{ padding: '12px 16px' }}><span className={`hf-chip ${riskColor[r.risk]}`}>{riskLabel[r.risk]}</span></td>
                <td style={{ padding: '12px 16px', color: 'var(--grey-500)', fontSize: 12 }}>{i < 3 ? '5일 전' : '보낸 적 없음'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button className="hf-btn hf-btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>개별 안내</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

// ─── A3: reports ─────────────────────────────────────────
function AdminReports() {
  const teams = [
    { n: '디자인', rate: 96, work: 41.2, ot: 1.8 },
    { n: '개발', rate: 92, work: 43.8, ot: 4.2 },
    { n: '운영', rate: 98, work: 40.1, ot: 0.4 },
    { n: '마케팅', rate: 89, work: 42.5, ot: 3.1 },
    { n: '재무', rate: 100, work: 40.0, ot: 0.0 },
  ];
  return (
    <AdminShell active="reports" breadcrumb="근태 리포트 · 월간">
      <div className="row-between">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>근태 리포트</h1>
          <div className="fs-13 c-mute mt-2">2026년 4월 · 전사 42명</div>
        </div>
        <div className="row g-8">
          <div style={{ display: 'flex', background: 'var(--grey-100)', borderRadius: 'var(--r-sm)', padding: 3 }}>
            {['주간','월간','분기'].map((l, i) => (
              <div key={l} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 'var(--r-xs)', cursor: 'pointer',
                background: i === 1 ? 'var(--white)' : 'transparent', boxShadow: i === 1 ? 'var(--shadow-xs)' : 'none',
                color: i === 1 ? 'var(--grey-900)' : 'var(--grey-600)' }}>{l}</div>
            ))}
          </div>
          <button className="hf-btn hf-btn-secondary">기간 선택</button>
          <button className="hf-btn hf-btn-primary">PDF 내보내기</button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
        {[
          { l: '정시 출근율', v: '94.2', u: '%', trend: '+1.2%p', pos: true },
          { l: '평균 근무시간', v: '42.1', u: 'h/주', trend: '+0.4h', pos: false },
          { l: '누적 초과근무', v: '387', u: 'h', trend: '−42h', pos: true },
          { l: '연차 사용률', v: '68', u: '%', trend: '+8%p', pos: true },
        ].map((k, i) => (
          <div key={i} className="hf-card" style={{ padding: 18 }}>
            <div className="t-caption-strong">{k.l}</div>
            <div className="row-baseline g-4 mt-6">
              <span className="num" style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>{k.v}</span>
              <span className="fs-14 c-mute fw-600">{k.u}</span>
            </div>
            <div style={{ fontSize: 12, color: k.pos ? 'var(--success)' : 'var(--warn)', fontWeight: 600, marginTop: 2 }}>
              {k.pos ? '▲' : '▼'} {k.trend} 전월 대비
            </div>
          </div>
        ))}
      </div>

      {/* charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginTop: 14 }}>
        <div className="hf-card" style={{ padding: 20 }}>
          <div className="row-between mb-14">
            <b className="fs-15">주차별 근무 시간 추이</b>
            <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--grey-600)' }}>
              <div className="row g-5"><span style={{ width: 10, height: 10, background: 'var(--brand)', borderRadius: 2 }}/>정규</div>
              <div className="row g-5"><span style={{ width: 10, height: 10, background: 'var(--warn)', borderRadius: 2 }}/>초과</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 200, paddingBottom: 20, borderBottom: '1px solid var(--grey-200)' }}>
            {[[40,3],[41,4.5],[42,6],[40,2],[42,4],[41,3.5],[43,5],[42,4.2]].map(([a, b], i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 6 }}>
                <div style={{ width: '100%', maxWidth: 38, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: b*6, background: 'var(--warn)', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                  <div style={{ height: a*3.2, background: 'var(--brand)', borderRadius: '0 0 4px 4px' }} />
                </div>
                <span className="t-caption">{i+1}주</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hf-card" style={{ padding: 20 }}>
          <b className="fs-15">출근 상태 분포</b>
          <div className="row-center mt-20 mb-8">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="64" fill="none" stroke="var(--grey-100)" strokeWidth="20"/>
              <circle cx="80" cy="80" r="64" fill="none" stroke="var(--success)" strokeWidth="20" strokeDasharray={`${0.62*402} 402`} transform="rotate(-90 80 80)"/>
              <circle cx="80" cy="80" r="64" fill="none" stroke="var(--info)" strokeWidth="20" strokeDasharray={`${0.22*402} 402`} strokeDashoffset={`${-0.62*402}`} transform="rotate(-90 80 80)"/>
              <circle cx="80" cy="80" r="64" fill="none" stroke="var(--warn)" strokeWidth="20" strokeDasharray={`${0.10*402} 402`} strokeDashoffset={`${-0.84*402}`} transform="rotate(-90 80 80)"/>
              <circle cx="80" cy="80" r="64" fill="none" stroke="var(--danger)" strokeWidth="20" strokeDasharray={`${0.06*402} 402`} strokeDashoffset={`${-0.94*402}`} transform="rotate(-90 80 80)"/>
              <text x="80" y="78" textAnchor="middle" fontSize="24" fontWeight="800">62%</text>
              <text x="80" y="94" textAnchor="middle" fontSize="10" fill="var(--grey-500)">본사 출근</text>
            </svg>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
            {[['본사', 62, 'success'], ['재택', 22, 'info'], ['연차', 10, 'warn'], ['지각/결근', 6, 'danger']].map(([l, v, c]) => (
              <div key={l} className="row g-6">
                <span className="hf-dot" style={{ background: `var(--${c})` }}/>
                <span className="c-body flex-1">{l}</span>
                <b>{v}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* team table */}
      <div className="hf-card" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 18, borderBottom: '1px solid var(--grey-200)' }}><b className="fs-15">팀별 성과</b></div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: 'var(--grey-50)' }}>
            <tr className="ta-l c-muted fw-600">
              {['팀','정시 출근율','평균 주 근무','평균 초과','분포'].map((h) => <th key={h} style={{ padding: '12px 16px' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--grey-100)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{t.n}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)' }}>
                  <div className="row g-10">
                    <b>{t.rate}%</b>
                    <div style={{ flex: 1, maxWidth: 100, height: 6, background: 'var(--grey-100)', borderRadius: 3 }}>
                      <div style={{ width: `${t.rate}%`, height: '100%', background: t.rate >= 95 ? 'var(--success)' : 'var(--warn)', borderRadius: 3 }}/>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)' }}>{t.work}h</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)', color: t.ot > 3 ? 'var(--warn)' : 'var(--grey-700)' }}>{t.ot}h</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 2, width: 160, height: 16 }}>
                    <div style={{ flex: t.rate - 5, background: 'var(--success)', borderRadius: '3px 0 0 3px' }}/>
                    <div style={{ flex: 100 - t.rate, background: 'var(--warn)' }}/>
                    <div style={{ flex: 5, background: 'var(--danger)', borderRadius: '0 3px 3px 0' }}/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

// ─── A4: employees list ─────────────────────────────────
function AdminEmployees() {
  const emps = [
    ...PEOPLE.map((p) => ({ ...p, join: '2024.03.11', lv: 11 })),
  ].map((p, i) => ({ ...p, join: ['2021.05.04','2022.09.12','2020.02.18','2023.11.01','2024.03.11','2022.07.22','2021.08.15','2024.01.09','2023.05.06','2022.12.03','2021.04.18','2024.06.20'][i] || '2023.01.01' }));
  return (
    <AdminShell active="employees" breadcrumb="직원 관리">
      <div className="row-between">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>직원 관리</h1>
          <div className="fs-13 c-mute mt-2">총 42명 · 활성 40명 · 휴직 2명</div>
        </div>
        <div className="row g-8">
          <button className="hf-btn hf-btn-secondary">CSV 가져오기</button>
          <button className="hf-btn hf-btn-primary"><Icon.plus className="icon-14"/> 직원 추가</button>
        </div>
      </div>

      {/* filters */}
      <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Icon.search style={{ position: 'absolute', left: 14, top: 12, width: 16, height: 16, color: 'var(--grey-400)' }}/>
          <input className="hf-input" placeholder="이름, 이메일, 팀으로 검색" style={{ paddingLeft: 40 }}/>
        </div>
        <button className="hf-btn hf-btn-secondary">팀 · 전체</button>
        <button className="hf-btn hf-btn-secondary">상태 · 활성</button>
      </div>

      <div className="hf-card" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: 'var(--grey-50)' }}>
            <tr className="ta-l c-muted fw-600">
              <th style={{ padding: '12px 16px', width: 30 }}><input type="checkbox"/></th>
              {['직원','팀 · 직책','입사일','현재 상태','잔여 연차','이번 달 근무',''].map((h) => <th key={h} style={{ padding: '12px 16px' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {emps.slice(0, 10).map((p, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--grey-100)' }}>
                <td style={{ padding: '12px 16px' }}><input type="checkbox"/></td>
                <td style={{ padding: '12px 16px' }}>
                  <div className="row g-10">
                    <Avatar n={p.n} size={32}/>
                    <div>
                      <div className="fw-700">{p.n}</div>
                      <div className="t-caption">{p.n.toLowerCase().replace(/\s/g,'')}@company.co.kr</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div>{p.t}</div>
                  <div className="t-caption">{p.r}</div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)' }}>{p.join}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="hf-chip" style={{ background: `var(--s-${p.s === 'off' ? 'off' : p.s})`, color: 'var(--white)', opacity: 0.9 }}>
                    <span className={`hf-dot ${p.s}`} style={{ background: 'var(--white)' }}/>
                    {({ office: '본사', wfh: '재택', leave: '연차', break: '휴게', off: '퇴근' })[p.s]}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)', fontWeight: 700 }}>
                  {[11,12,9,13,8,15,10,14,7,11][i]}일
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-num)' }}>
                  {[168,172,180,155,140,0,170,163,174,168][i]}h
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Icon.chevR className="icon-16 c-faint"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

Object.assign(window, { AdminShell, AdminApprovals, AdminExpiringLeave, AdminReports, AdminEmployees });
