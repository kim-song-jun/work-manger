// 디테일 페이지 — Toss 시스템 기반 · 단일 엑센트(--brand), 엄격한 위계

// ═══════════════════════════════════════════════════════════════
// 모바일 · 팀 3뷰 탭 통합
// ═══════════════════════════════════════════════════════════════
function MobTeamTabs() {
  const t = useT();
  const [view, setView] = React.useState('grid');
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-appbar">
        <h1 className="flex-1">{t ? t('team_status') : '팀'}</h1>
        <Icon.search className="icon-22 c-body" />
      </div>

      {/* Segmented control */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--grey-100)', borderRadius: 10 }}>
          {[['grid','한눈에'],['group','팀별'],['timeline','타임라인']].map(([k, l]) => {
            const on = view === k;
            return (
              <button key={k} onClick={() => setView(k)} style={{
                flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                background: on ? 'var(--white)' : 'transparent',
                boxShadow: on ? 'var(--shadow-1)' : 'none',
                borderRadius: 'var(--r-sm)',
                fontSize: 13, fontWeight: 600,
                color: on ? 'var(--grey-900)' : 'var(--grey-600)'
              }}>{l}</button>
            );
          })}
        </div>
      </div>

      <div className="hf-screen" style={{ padding: '0 20px 20px' }}>
        {view === 'grid' && <TeamGridBody />}
        {view === 'group' && <TeamGroupBody />}
        {view === 'timeline' && <TeamTimelineBody />}
      </div>

      <TabBar active="team" t={t} />
      <div className="hf-phone-home" />
    </div>
  );
}

function TeamGridBody() {
  const cnt = (s) => PEOPLE.filter((p) => p.s === s).length;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[['office','본사'],['wfh','재택'],['leave','연차'],['off','퇴근']].map(([k, l]) => (
          <div key={k} className="hf-card" style={{ padding: 12, textAlign: 'center', boxShadow: 'none', border: '1px solid var(--grey-200)' }}>
            <div className="num t-heading-lg">{cnt(k)}</div>
            <div className="t-caption mt-2">
              <span className={`hf-dot ${k}`} style={{ marginRight: 4 }}/>{l}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 20 }}>
        {PEOPLE.slice(0, 12).map((p, i) => (
          <div key={i} className="ta-c">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar n={p.n} size={54} />
              <span className={`hf-dot ${p.s}`} style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, border: '2.5px solid var(--grey-50)' }} />
            </div>
            <div className="fs-12 fw-600 mt-6 c-primary">{p.n}</div>
            <div className="t-caption fs-12">{p.t}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function TeamGroupBody() {
  const teams = {};
  PEOPLE.forEach((p) => { (teams[p.t] ||= []).push(p); });
  return Object.entries(teams).map(([team, list]) => {
    const working = list.filter((p) => p.s === 'office' || p.s === 'wfh').length;
    return (
      <div key={team} className="hf-card" style={{ padding: 16, marginBottom: 10, boxShadow: 'none', border: '1px solid var(--grey-200)' }}>
        <div className="row-baseline">
          <div className="t-subtitle">{team}</div>
          <div className="t-caption num">{working}/{list.length} 근무 중</div>
        </div>
        <div className="row g-6 wrap mt-12">
          {list.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 4px', background: 'var(--grey-100)', borderRadius: 999 }}>
              <div style={{ position: 'relative' }}>
                <Avatar n={p.n} size={24} />
                <span className={`hf-dot ${p.s}`} style={{ position: 'absolute', bottom: -1, right: -1, border: '1.5px solid var(--grey-100)' }} />
              </div>
              <span className="fs-12 fw-600 c-strong">{p.n}</span>
            </div>
          ))}
        </div>
      </div>
    );
  });
}

function TeamTimelineBody() {
  const rows = PEOPLE.slice(0, 8);
  const blocks = [
    [[8.5,12,'office'],[12,13,'break'],[13,18,'office']],
    [[9,13,'wfh'],[13,14,'break'],[14,18,'wfh']],
    [[8,12.5,'office'],[12.5,13.5,'break'],[13.5,19.2,'office']],
    [[9.5,18,'wfh']],[[0,24,'leave']],[[0,24,'leave']],
    [[8.2,17.8,'office']],[[10,15,'office']],
  ];
  const now = 15.4;
  const color = (k) => ({ office: 'var(--s-office)', wfh: 'var(--s-wfh)', break: 'var(--s-break)', leave: 'var(--s-leave)' }[k]);
  return (
    <div className="hf-card" style={{ padding: 16, boxShadow: 'none', border: '1px solid var(--grey-200)' }}>
      <div className="row-baseline mb-14">
        <div className="t-subtitle">오늘</div>
        <div className="t-caption num">지금 15:24</div>
      </div>
      <div style={{ paddingLeft: 50 }}>
        <div style={{ position: 'relative', height: 16, fontSize: 10, color: 'var(--grey-500)', fontFamily: 'var(--font-num)' }}>
          {[6,9,12,15,18,21].map((h) => (
            <span key={h} style={{ position: 'absolute', left: `${(h/24)*100}%`, transform: 'translateX(-50%)' }}>{h}</span>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: `${(now/24)*100}%`, top: 0, bottom: 0, width: 1.5, background: 'var(--brand)', zIndex: 2 }} />
          {rows.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, height: 22, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -50, width: 48, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar n={p.n} size={20} />
                <span className="fs-12 fw-600 c-strong">{p.n.slice(1)}</span>
              </div>
              <div style={{ flex: 1, height: 14, background: 'var(--grey-100)', borderRadius: 3, position: 'relative' }}>
                {blocks[i].map(([s,e,k], j) => (
                  <div key={j} style={{ position: 'absolute', left: `${(s/24)*100}%`, width: `${((e-s)/24)*100}%`, top: 0, bottom: 0, background: color(k), borderRadius: 2 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 모바일 · 초과근무 설정
// ═══════════════════════════════════════════════════════════════
function MobOvertimeSettings() {
  const [mode, setMode] = React.useState('auto');
  const [threshold, setThreshold] = React.useState(30);
  const [dailyMax, setDailyMax] = React.useState(3);
  const [reasonRequired, setReasonRequired] = React.useState(false);
  const [weekendDiff, setWeekendDiff] = React.useState(true);

  const modeLabel = { ask: '퇴근할 때 물어보기', auto: '자동으로 요청하기', silent: '기록하지 않기' };

  return (
    <div className="hf-phone">
      <div className="hf-phone-notch" />
      <StatusBar />
      <div className="hf-appbar">
        <Icon.chevL className="icon-24 c-primary"/>
        <h1 className="flex-1">초과근무</h1>
      </div>
      <div className="hf-screen" style={{ padding: '0 20px 24px' }}>
        <p className="t-body" style={{ margin: '0 0 20px', color: 'var(--grey-600)' }}>
          정규 시간이 지난 뒤 퇴근할 때 어떻게 처리할지 선택하세요.
        </p>

        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
          {[
            { k: 'ask', l: '퇴근할 때 물어보기', s: '시트로 직접 선택' },
            { k: 'auto', l: '자동으로 요청하기', s: '승인자에게 바로 전송' },
            { k: 'silent', l: '기록하지 않기', s: '정시 퇴근으로 저장' },
          ].map((o, i) => {
            const on = mode === o.k;
            return (
              <div key={o.k} onClick={() => setMode(o.k)} style={{
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
                borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none',
                cursor: 'pointer' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10,
                  border: on ? '6px solid var(--brand)' : '1.5px solid var(--grey-300)',
                  transition: 'all var(--motion-fast)', flexShrink: 0 }}/>
                <div className="flex-1">
                  <div className="t-body-strong c-primary">{o.l}</div>
                  <div className="t-caption mt-2">{o.s}</div>
                </div>
              </div>
            );
          })}
        </div>

        {mode === 'auto' && (
          <>
            <div className="t-caption-strong" style={{ padding: '28px 4px 8px' }}>세부 조건</div>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 20 }}>
              <div className="row-baseline">
                <span className="t-body-strong">최소 초과 시간</span>
                <span className="num" style={{ fontSize: 17, fontWeight: 700, color: 'var(--grey-900)' }}>
                  {threshold}<span style={{ fontSize: 13, color: 'var(--grey-500)', marginLeft: 2, fontWeight: 400 }}>분</span>
                </span>
              </div>
              <input type="range" min="0" max="120" step="15" value={threshold}
                onChange={(e)=>setThreshold(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--brand)', marginTop: 10 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--grey-500)', marginTop: 2, fontFamily: 'var(--font-num)' }}>
                <span>0</span><span>30</span><span>60</span><span>120</span>
              </div>
              <p className="t-caption" style={{ marginTop: 12, marginBottom: 0 }}>
                {threshold === 0 ? '정규 종료 즉시 요청해요.' : `정규 시간이 끝난 뒤 ${threshold}분이 지나면 자동으로 요청해요.`}
              </p>
            </div>

            <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 20, marginTop: 8 }}>
              <div className="row-baseline">
                <span className="t-body-strong">하루 상한</span>
                <span className="num" style={{ fontSize: 17, fontWeight: 700, color: 'var(--grey-900)' }}>
                  {dailyMax}<span style={{ fontSize: 13, color: 'var(--grey-500)', marginLeft: 2, fontWeight: 400 }}>시간</span>
                </span>
              </div>
              <input type="range" min="1" max="6" step="1" value={dailyMax}
                onChange={(e)=>setDailyMax(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--brand)', marginTop: 10 }}/>
              <p className="t-caption" style={{ marginTop: 12, marginBottom: 0 }}>
                상한을 넘기면 자동 요청을 멈추고 시트로 확인해요.
              </p>
            </div>
          </>
        )}

        <div className="t-caption-strong" style={{ padding: '28px 4px 8px' }}>추가 옵션</div>
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
          {[
            ['사유 입력 필수', '요청 전에 메모를 반드시 남겨요', reasonRequired, setReasonRequired],
            ['주말·공휴일은 따로 확인', '자동 요청 대신 시트로 묻기', weekendDiff, setWeekendDiff],
          ].map(([l, s, v, set], i) => (
            <div key={i} style={{
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
              borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
              <div className="flex-1">
                <div className="t-body-strong">{l}</div>
                <div className="t-caption mt-2">{s}</div>
              </div>
              <div className={`hf-switch ${v ? 'on' : ''}`} onClick={()=>set(!v)}/>
            </div>
          ))}
        </div>

        <p className="t-caption" style={{ padding: '20px 4px 0', lineHeight: 1.6 }}>
          설정을 바꾸면 오늘부터 적용돼요. 승인자는 조직도에 등록된 상급자로 자동 지정됩니다.
        </p>
      </div>
      <div className="hf-phone-home"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 모바일 · 초과근무 이력
// ═══════════════════════════════════════════════════════════════
function MobOvertimeHistory() {
  const [tab, setTab] = React.useState('all');
  const rows = [
    { d: '4월 22일 수', s: '18:00', e: '19:24', h: '1시간 24분', mins: 84, st: 'pending', r: '디자인 리뷰' },
    { d: '4월 21일 화', s: '18:00', e: '20:30', h: '2시간 30분', mins: 150, st: 'approved', r: '릴리즈 대응' },
    { d: '4월 18일 금', s: '18:00', e: '19:12', h: '1시간 12분', mins: 72, st: 'approved', r: '클라이언트 피드백 반영' },
    { d: '4월 15일 화', s: '18:00', e: '21:00', h: '3시간', mins: 180, st: 'rejected', r: '사전 공유 없이 진행' },
    { d: '4월 10일 목', s: '18:00', e: '19:45', h: '1시간 45분', mins: 105, st: 'approved', r: '워크샵 준비' },
  ];
  const chip = { pending: 'warn', approved: 'success', rejected: 'danger' };
  const label = { pending: '승인 대기', approved: '승인됨', rejected: '반려됨' };
  const filtered = tab === 'all' ? rows : rows.filter((r) => r.st === tab);

  return (
    <div className="hf-phone">
      <div className="hf-phone-notch"/>
      <StatusBar/>
      <div className="hf-appbar">
        <Icon.chevL className="icon-24 c-primary"/>
        <h1 className="flex-1">초과근무 이력</h1>
      </div>
      <div className="hf-screen" style={{ padding: '0 20px 24px' }}>
        {/* Summary */}
        <div className="hf-card" style={{ padding: 20, boxShadow: 'none' }}>
          <div className="t-caption">이번 달 승인된 초과</div>
          <div className="num" style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 4, color: 'var(--grey-900)' }}>
            5시간 27분
          </div>
          <div className="row g-20 mt-14">
            {[['3','승인'],['1','대기'],['1','반려']].map(([v, l], i) => (
              <div key={i}>
                <span className="num fs-15 fw-700 c-primary">{v}</span>
                <span className="t-caption" style={{ marginLeft: 6 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20, borderBottom: '1px solid var(--grey-200)' }}>
          {[['all','전체'],['pending','대기'],['approved','승인'],['rejected','반려']].map(([k, l]) => {
            const on = tab === k;
            const n = k === 'all' ? rows.length : rows.filter((r) => r.st === k).length;
            return (
              <div key={k} onClick={() => setTab(k)} style={{
                padding: '12px 0', cursor: 'pointer',
                borderBottom: on ? '2px solid var(--grey-900)' : '2px solid transparent',
                marginBottom: -1 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: on ? 'var(--grey-900)' : 'var(--grey-500)' }}>{l}</span>
                <span className="num" style={{ fontSize: 12, color: 'var(--grey-500)', marginLeft: 4 }}>{n}</span>
              </div>
            );
          })}
        </div>

        {/* List */}
        <div className="mt-4">
          {filtered.map((r, i) => (
            <div key={i} style={{ padding: '18px 0', borderBottom: i < filtered.length - 1 ? '1px solid var(--grey-100)' : 'none' }}>
              <div className="row-baseline">
                <div className="t-body-strong c-primary">{r.d}</div>
                <span className={`hf-chip ${chip[r.st]}`}>{label[r.st]}</span>
              </div>
              <div className="row-baseline g-10 mt-6">
                <span className="num t-heading-lg">{r.h}</span>
                <span className="t-caption num">{r.s} → {r.e}</span>
              </div>
              {r.r && <div className="t-body-sm mt-4">{r.r}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="hf-phone-home"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 모바일 · 승인 상세
// ═══════════════════════════════════════════════════════════════
function MobApprovalDetail() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch"/>
      <StatusBar/>
      <div className="hf-appbar">
        <Icon.chevL className="icon-24 c-primary"/>
        <h1 className="flex-1">신청 상세</h1>
      </div>
      <div className="hf-screen" style={{ padding: '0 20px 24px' }}>
        {/* Hero — 값 중심, 컬러는 chip만 */}
        <div style={{ padding: '12px 4px 24px' }}>
          <span className="hf-chip success mb-12">승인됨</span>
          <div className="t-display-lg mt-12">
            연차 <span className="num">2</span>일이<br/>승인됐어요
          </div>
          <div className="t-body mt-8 c-muted">
            4월 28일 월 — 29일 화
          </div>
        </div>

        {/* Timeline */}
        <div className="t-caption-strong" style={{ padding: '0 4px 10px' }}>승인 이력</div>
        <div className="hf-card" style={{ padding: 20, boxShadow: 'none' }}>
          {[
            { t: '신청 제출', d: '4월 20일 화 · 14:02', who: '김지우' },
            { t: 'PM 확인', d: '4월 20일 화 · 16:40', who: '박민지' },
            { t: '팀장 승인', d: '4월 22일 목 · 14:20', who: '이수진' },
            { t: 'HR 기록 완료', d: '4월 22일 목 · 14:21', who: '자동 처리' },
          ].map((e, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
              {i < arr.length - 1 && <div style={{ position: 'absolute', left: 9, top: 20, bottom: 0, width: 1, background: 'var(--grey-200)' }}/>}
              <div style={{ width: 18, height: 18, borderRadius: 9, background: 'var(--grey-900)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Icon.check style={{ width: 10, height: 10, color: 'var(--white)' }}/>
              </div>
              <div className="flex-1">
                <div className="t-body-strong">{e.t}</div>
                <div className="t-caption num mt-2">{e.who} · {e.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="t-caption-strong" style={{ padding: '24px 4px 10px' }}>신청 내용</div>
        <div className="hf-card" style={{ padding: '8px 20px', boxShadow: 'none' }}>
          {[
            ['유형', '연차 · 종일'],
            ['기간', '4월 28일 월 ~ 29일 화'],
            ['사유', '가족 행사'],
            ['대체 담당', '박서연'],
            ['사용 후 잔여', '9일'],
          ].map(([k, v], i, arr) => (
            <div key={k} style={{
              display: 'flex', padding: '14px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--grey-100)' : 'none' }}>
              <div className="t-body-sm" style={{ flex: '0 0 84px', color: 'var(--grey-500)' }}>{k}</div>
              <div className="t-body-strong c-primary">{v}</div>
            </div>
          ))}
        </div>

        <button className="hf-btn hf-btn-secondary hf-btn-large" style={{
          width: '100%', marginTop: 20, color: 'var(--danger)' }}>신청 취소</button>
      </div>
      <div className="hf-phone-home"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 모바일 · 주간 리포트
// ═══════════════════════════════════════════════════════════════
function MobWeeklyReport() {
  const days = [
    { d: '월', h: 8.2, ot: 0 }, { d: '화', h: 8.0, ot: 1.3 }, { d: '수', h: 8.0, ot: 0 },
    { d: '목', h: 8.0, ot: 1.5 }, { d: '금', h: 7.8, ot: 0 }, { d: '토', h: 0, ot: 0 }, { d: '일', h: 0, ot: 0 },
  ];
  const max = 10;
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch"/>
      <StatusBar/>
      <div className="hf-appbar">
        <Icon.chevL className="icon-24 c-primary"/>
        <h1 className="flex-1">이번 주</h1>
        <Icon.chevR className="icon-22 c-mute"/>
      </div>
      <div className="hf-screen" style={{ padding: '0 20px 24px' }}>
        <div className="t-caption num mb-4">4월 21일 월 — 27일 일</div>

        <div style={{ padding: '8px 4px 24px' }}>
          <div className="t-caption">총 근무</div>
          <div className="num" style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.6px', marginTop: 2, color: 'var(--grey-900)' }}>
            42<span className="fs-18 fw-500 c-muted">시간 </span>
            48<span className="fs-18 fw-500 c-muted">분</span>
          </div>
          <div className="t-body-sm mt-6 c-muted">
            지난 주보다 <span className="num fw-700 c-primary">2시간 12분</span> 많아요
          </div>
        </div>

        {/* Chart */}
        <div className="hf-card" style={{ padding: 20, boxShadow: 'none' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 140 }}>
            {days.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ height: 100, width: '100%', display: 'flex', flexDirection: 'column-reverse' }}>
                  {d.h > 0 && <div style={{ height: `${(d.h / max) * 100}%`, background: 'var(--grey-900)', borderRadius: d.ot > 0 ? '0 0 3px 3px' : 3, minHeight: 4 }}/>}
                  {d.ot > 0 && <div style={{ height: `${(d.ot / max) * 100}%`, background: 'var(--brand)', borderRadius: '3px 3px 0 0' }}/>}
                  {d.h === 0 && <div style={{ height: 4, background: 'var(--grey-200)', borderRadius: 2 }}/>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: d.h === 0 ? 'var(--grey-400)' : 'var(--grey-900)' }}>{d.d}</div>
                <div className="num fs-10 c-mute">{d.h > 0 ? `${d.h}h` : '—'}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--grey-100)' }}>
            <div className="row g-6">
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--grey-900)' }}/>
              <span className="t-caption">정규</span>
            </div>
            <div className="row g-6">
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--brand)' }}/>
              <span className="t-caption">초과</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', overflow: 'hidden', marginTop: 8 }}>
          {[
            ['정시 출근', '5일 모두'],
            ['평균 출근', '08:58'],
            ['평균 퇴근', '18:42'],
            ['휴게 평균', '54분'],
            ['초과근무', '2시간 48분'],
          ].map(([l, v], i, arr) => (
            <div key={i} style={{
              padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
              <span className="t-body">{l}</span>
              <span className="num fs-15 fw-600 c-primary">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hf-phone-home"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 모바일 · 연차 소멸 경고 (풀스크린)
// ═══════════════════════════════════════════════════════════════
function MobExpiryAlert() {
  return (
    <div className="hf-phone">
      <div className="hf-phone-notch"/>
      <StatusBar/>
      <div style={{ padding: '10px 20px 0' }}>
        <Icon.close width={24} height={24} className="c-body"/>
      </div>
      <div className="hf-screen" style={{ padding: '24px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="mt-12">
          <span className="hf-chip warn">6월 30일 소멸</span>
        </div>
        <h1 style={{
          margin: '16px 0 0', fontSize: 28, fontWeight: 700,
          letterSpacing: '-0.5px', lineHeight: 1.35, color: 'var(--grey-900)' }}>
          연차 <span className="num">3</span>일이<br/>
          <span className="num">67</span>일 뒤에 사라져요
        </h1>
        <p className="t-body mt-12 c-muted">
          6월 30일이 지나면 자동으로 소멸돼요. 미리 써두는 걸 추천드려요.
        </p>

        {/* Progress */}
        <div style={{ marginTop: 28 }}>
          <div className="row-between mb-8">
            <span className="t-caption num">오늘 · 4월 22일</span>
            <span className="t-caption num">D-67 · 6월 30일</span>
          </div>
          <div style={{ height: 6, background: 'var(--grey-100)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '25%', height: '100%', background: 'var(--grey-900)' }}/>
          </div>
        </div>

        {/* Suggested dates */}
        <div className="t-caption-strong" style={{ padding: '28px 0 10px' }}>쓰기 좋은 날</div>
        <div style={{ background: 'var(--grey-50)', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--grey-100)' }}>
          {[
            { d: '5월 23일 — 25일', n: '3일 연휴 · 팀원 모두 출근' },
            { d: '6월 6일 — 8일', n: '현충일 포함 3일 연휴' },
            { d: '6월 20일 — 22일', n: '3일 연휴' },
          ].map((s, i, arr) => (
            <div key={i} style={{
              padding: '16px 18px', display: 'flex', alignItems: 'center',
              borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
              <div className="flex-1">
                <div className="t-body-strong c-primary">{s.d}</div>
                <div className="t-caption mt-2">{s.n}</div>
              </div>
              <Icon.chevR className="icon-18 c-faint"/>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="hf-btn hf-btn-primary hf-btn-big" style={{ width: '100%' }}>
            연차 신청하기
          </button>
          <button className="hf-btn hf-btn-ghost" style={{ width: '100%' }}>
            나중에 알림 받기
          </button>
        </div>
      </div>
      <div className="hf-phone-home"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 데스크탑 · 환경설정
// ═══════════════════════════════════════════════════════════════
function DesktopSettings() {
  return (
    <div className="hf-web" style={{ background: 'var(--grey-50)' }}>
      <div className="hf-webbar">
        <div className="dots"><i style={{background:'#FF5F57'}}/><i style={{background:'#FEBC2E'}}/><i style={{background:'#28C840'}}/></div>
        <div className="url">Workday — 환경설정</div>
      </div>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: 'var(--white)', borderRight: '1px solid var(--grey-200)', padding: 20 }}>
          <div className="t-caption-strong" style={{ padding: '0 12px 8px' }}>설정</div>
          {[
            ['일반', false], ['근무 시간', false],
            ['초과근무', true], ['자동 체크인', false],
            ['알림', false], ['단축키', false],
            ['개인정보', false], ['계정', false],
          ].map(([l, on], i) => (
            <div key={i} style={{
              padding: '8px 12px', borderRadius: 'var(--r-sm)', marginBottom: 2, cursor: 'pointer',
              background: on ? 'var(--grey-100)' : 'transparent',
              color: 'var(--grey-900)', fontSize: 14, fontWeight: on ? 600 : 500 }}>{l}</div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 40, overflow: 'auto' }}>
          <div style={{ maxWidth: 640 }}>
            <h2 className="t-heading-lg" style={{ margin: 0 }}>초과근무</h2>
            <p className="t-body" style={{ margin: '6px 0 0', color: 'var(--grey-600)' }}>
              정규 시간이 지난 뒤 퇴근할 때 어떻게 처리할지 선택하세요.
            </p>

            <div className="t-caption-strong" style={{ padding: '32px 0 12px' }}>기본 동작</div>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1px solid var(--grey-200)', overflow: 'hidden' }}>
              {[
                { k: 'ask', l: '퇴근할 때 물어보기', s: '시트로 직접 선택' },
                { k: 'auto', l: '자동으로 요청하기', s: '승인자에게 바로 전송', on: true },
                { k: 'silent', l: '기록하지 않기', s: '정시 퇴근으로 저장' },
              ].map((o, i, arr) => (
                <div key={o.k} style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                  borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none',
                  cursor: 'pointer' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 9,
                    border: o.on ? '5.5px solid var(--brand)' : '1.5px solid var(--grey-300)',
                    flexShrink: 0 }}/>
                  <div className="flex-1">
                    <div className="t-body-strong">{o.l}</div>
                    <div className="t-caption mt-2">{o.s}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="t-caption-strong" style={{ padding: '32px 0 12px' }}>세부 조건</div>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1px solid var(--grey-200)', overflow: 'hidden' }}>
              {[
                ['최소 초과 시간', '30분이 지나면 요청', '30분'],
                ['하루 상한', '상한을 넘으면 시트로 확인', '3시간'],
                ['주말·공휴일', '따로 확인', '켜짐'],
                ['반복 알림', '승인이 없을 때 30분마다', '켜짐'],
                ['주 52시간 경고', '한도 도달 전 알림', '50시간'],
              ].map(([l, s, v], i, arr) => (
                <div key={i} style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                  borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
                  <div className="flex-1">
                    <div className="t-body-strong">{l}</div>
                    <div className="t-caption mt-2">{s}</div>
                  </div>
                  <div className="num fs-14 fw-600 c-body">{v}</div>
                  <Icon.chevR className="icon-16 c-faint"/>
                </div>
              ))}
            </div>

            {/* Inline status */}
            <div style={{
              marginTop: 24, padding: 16, background: 'var(--white)',
              borderRadius: 'var(--r-md)', border: '1px solid var(--grey-200)',
              display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="hf-chip warn">주의</span>
              <div className="flex-1">
                <div className="t-body-strong">이번 주 누적 근무 48시간 32분</div>
                <div className="t-caption mt-2">주 52시간까지 3시간 28분 남았어요.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 데스크탑 · 알림 센터
// ═══════════════════════════════════════════════════════════════
function DesktopNotifications() {
  const items = [
    { g: '오늘', list: [
      { t: '방금', title: '정규 시간이 지났어요', body: '초과 42분 · 박민지 PM에게 요청을 보냈어요', st: 'brand' },
      { t: '2시간 전', title: '연차가 승인됐어요', body: '4월 28일 — 29일 · 이수진 팀장', st: 'success' },
      { t: '4시간 전', title: '팀원이 재택을 시작했어요', body: '박시우 · 디자인', st: null },
    ]},
    { g: '어제', list: [
      { t: '', title: '연차가 소멸될 예정이에요', body: '3일 · 67일 뒤', st: 'warn' },
      { t: '', title: '이번 주 리포트가 나왔어요', body: '총 42시간 48분 근무', st: null },
    ]},
  ];

  return (
    <div className="hf-web" style={{ background: 'var(--grey-50)' }}>
      <div className="hf-webbar">
        <div className="dots"><i style={{background:'#FF5F57'}}/><i style={{background:'#FEBC2E'}}/><i style={{background:'#28C840'}}/></div>
        <div className="url">Workday — 알림</div>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
        <div style={{ width: 560 }}>
          <div className="row-baseline">
            <h2 className="t-heading-lg" style={{ margin: 0 }}>알림</h2>
            <span className="t-body-sm" style={{ color: 'var(--brand)', cursor: 'pointer', fontWeight: 600 }}>모두 읽음으로 표시</span>
          </div>

          {items.map((g, gi) => (
            <div key={gi} style={{ marginTop: 28 }}>
              <div className="t-caption-strong mb-10">{g.g}</div>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1px solid var(--grey-200)', overflow: 'hidden' }}>
                {g.list.map((n, i) => (
                  <div key={i} style={{
                    padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14,
                    borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: 3, marginTop: 9,
                      background: n.st === 'brand' ? 'var(--brand)' : n.st === 'success' ? 'var(--success)' : n.st === 'warn' ? 'var(--warn)' : 'var(--grey-300)',
                      flexShrink: 0 }}/>
                    <div className="flex-1">
                      <div className="t-body-strong c-primary">{n.title}</div>
                      <div className="t-body-sm mt-2">{n.body}</div>
                    </div>
                    {n.t && <div className="t-caption num" style={{ whiteSpace: 'nowrap' }}>{n.t}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 관리자 · 직원 상세
// ═══════════════════════════════════════════════════════════════
function AdminEmployeeDetail() {
  return (
    <AdminShell active="employees" breadcrumb="직원 관리 › 김지우">
      {/* Header */}
      <div className="hf-card" style={{ padding: 28, display: 'flex', gap: 20, alignItems: 'flex-start', boxShadow: 'none', border: '1px solid var(--grey-200)' }}>
        <Avatar n="김지우" size={72}/>
        <div className="flex-1">
          <div className="row g-10">
            <h1 className="t-display-lg" style={{ margin: 0 }}>김지우</h1>
            <span className="hf-chip">재직 중</span>
          </div>
          <div className="t-body mt-4 c-muted">
            디자인팀 · 프로덕트 디자이너
          </div>
          <div className="t-body-sm num mt-4">
            jiwoo@company.co.kr · 010-1234-5678 · 2021년 5월 입사
          </div>
          <div className="row g-8 mt-16">
            <button className="hf-btn hf-btn-secondary">연차 조정</button>
            <button className="hf-btn hf-btn-secondary">근무 시간 예외</button>
            <button className="hf-btn hf-btn-ghost">메시지 보내기</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 20, marginTop: 20, borderBottom: '1px solid var(--grey-200)' }}>
        {['개요','근무 기록','연차 이력','초과근무','문서','로그'].map((l, i) => (
          <div key={i} style={{
            padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            color: i === 0 ? 'var(--grey-900)' : 'var(--grey-500)',
            borderBottom: i === 0 ? '2px solid var(--grey-900)' : '2px solid transparent',
            marginBottom: -1 }}>{l}</div>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
        {[
          { l: '잔여 연차', v: '11', u: '일', t: '지급 15 · 사용 4' },
          { l: '이번 달 근무', v: '168', u: '시간', t: '정규 160 · 초과 8' },
          { l: '정시 출근율', v: '96', u: '%', t: '최근 30일' },
          { l: '주 52시간 여유', v: '12', u: '시간', t: '이번 주 기준' },
        ].map((k, i) => (
          <div key={i} className="hf-card" style={{ padding: 20, boxShadow: 'none', border: '1px solid var(--grey-200)' }}>
            <div className="t-caption">{k.l}</div>
            <div className="row-baseline g-4 mt-8">
              <span className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--grey-900)' }}>{k.v}</span>
              <span className="t-body-sm c-muted">{k.u}</span>
            </div>
            <div className="t-caption num mt-2">{k.t}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="hf-card" style={{ padding: 0, boxShadow: 'none', border: '1px solid var(--grey-200)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 className="t-subtitle" style={{ margin: 0 }}>최근 근무 기록</h3>
            <span className="t-body-sm" style={{ color: 'var(--brand)', cursor: 'pointer', fontWeight: 600 }}>전체 보기</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="ta-l">
                {['날짜','출근','퇴근','근무','초과','위치'].map((h) => (
                  <th key={h} style={{ padding: '10px 20px', fontSize: 12, fontWeight: 600, color: 'var(--grey-500)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['4월 22일 수','08:54','19:24','9시간 14분','1시간 24분','본사'],
                ['4월 21일 화','09:02','20:30','10시간 18분','2시간 30분','본사'],
                ['4월 18일 금','08:48','18:00','8시간 12분','—','재택'],
                ['4월 17일 목','08:52','18:00','8시간 08분','—','본사'],
                ['4월 16일 수','08:58','18:05','8시간 07분','—','본사'],
                ['4월 15일 화','09:04','18:00','7시간 56분','—','재택'],
              ].map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--grey-100)' }}>
                  {row.map((c, j) => (
                    <td key={j} style={{
                      padding: '14px 20px',
                      fontSize: 14, color: 'var(--grey-800)',
                      fontFamily: j >= 1 && j <= 4 ? 'var(--font-num)' : 'inherit',
                      fontWeight: j === 3 ? 600 : 400,
                      fontVariantNumeric: j >= 1 && j <= 4 ? 'tabular-nums' : 'normal' }}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="hf-card" style={{ padding: 20, boxShadow: 'none', border: '1px solid var(--grey-200)' }}>
            <h3 className="t-subtitle" style={{ margin: 0 }}>승인자</h3>
            <div className="mt-16">
              {[
                { n: '박민지', r: 'PM', l: '1차 승인' },
                { n: '이수진', r: '팀장', l: '최종 승인' },
              ].map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
                  <Avatar n={a.n} size={32}/>
                  <div className="flex-1">
                    <div className="t-body-strong c-primary">{a.n} {a.r}</div>
                    <div className="t-caption">{a.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hf-card" style={{ padding: 20, marginTop: 12, boxShadow: 'none', border: '1px solid var(--grey-200)' }}>
            <h3 className="t-subtitle" style={{ margin: 0 }}>예외 설정</h3>
            <div className="mt-12">
              {[
                ['정규 시간', '09:00 — 18:00'],
                ['재택 허용', '주 3일'],
                ['초과근무 상한', '기본 (하루 3시간)'],
                ['자동 체크인', '활성'],
              ].map(([k, v], i, arr) => (
                <div key={k} style={{
                  padding: '10px 0', display: 'flex', justifyContent: 'space-between',
                  borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
                  <span className="t-body-sm">{k}</span>
                  <span className="num fs-13 fw-600 c-primary">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// 관리자 · 실시간 현황
// ═══════════════════════════════════════════════════════════════
function AdminLiveDashboard() {
  return (
    <AdminShell active="dash" breadcrumb="실시간 현황">
      <div className="row-end">
        <div>
          <h1 className="t-display-lg" style={{ margin: 0 }}>실시간 현황</h1>
          <div className="row g-8 mt-6">
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: 3,
              background: 'var(--success)' }}/>
            <span className="t-body-sm num">4월 22일 수 · 15:42</span>
            <span className="t-caption">· 30초마다 갱신</span>
          </div>
        </div>
        <div className="row g-8">
          <button className="hf-btn hf-btn-secondary">부서별 보기</button>
          <button className="hf-btn hf-btn-dark">CSV 내보내기</button>
        </div>
      </div>

      {/* Status row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 24 }}>
        {[
          { l: '본사', k: 'office', v: 18, p: 43 },
          { l: '재택', k: 'wfh', v: 12, p: 29 },
          { l: '휴게', k: 'break', v: 3, p: 7 },
          { l: '연차', k: 'leave', v: 5, p: 12 },
          { l: '퇴근', k: 'off', v: 4, p: 9 },
        ].map((s, i) => (
          <div key={i} className="hf-card" style={{ padding: 20, boxShadow: 'none', border: '1px solid var(--grey-200)' }}>
            <div className="row g-8">
              <span className={`hf-dot ${s.k}`}/>
              <span className="t-body-sm c-body fw-600">{s.l}</span>
            </div>
            <div className="num" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 10, color: 'var(--grey-900)' }}>
              {s.v}<span style={{ fontSize: 14, color: 'var(--grey-500)', fontWeight: 500, marginLeft: 2 }}>명</span>
            </div>
            <div className="t-caption num mt-2">{s.p}% · 42명 중</div>
          </div>
        ))}
      </div>

      {/* Activity + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 20 }}>
        <div className="hf-card" style={{ padding: 0, boxShadow: 'none', border: '1px solid var(--grey-200)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 className="t-subtitle" style={{ margin: 0 }}>최근 활동</h3>
            <span className="t-caption num">지난 1시간 · 28건</span>
          </div>
          <div style={{ maxHeight: 360, overflow: 'auto' }}>
            {[
              { t: '방금', who: '김지우', a: '출근', l: '본사' },
              { t: '2분 전', who: '박서연', a: '재택으로 전환', l: '' },
              { t: '5분 전', who: '정유진', a: '휴게를 시작했어요', l: '' },
              { t: '12분 전', who: '오민석', a: '초과근무를 요청했어요', l: '예상 2시간' },
              { t: '28분 전', who: '서지훈', a: '연차를 신청했어요', l: '5월 2일 — 3일' },
              { t: '42분 전', who: '이도현', a: '출근', l: '재택' },
              { t: '1시간 전', who: '최하늘', a: '퇴근', l: '8시간 30분 근무' },
            ].map((a, i) => (
              <div key={i} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
                <Avatar n={a.who} size={32}/>
                <div className="flex-1">
                  <div className="t-body c-primary">
                    <b className="fw-600">{a.who}</b>님이 {a.a}
                  </div>
                  {a.l && <div className="t-caption num mt-2">{a.l}</div>}
                </div>
                <div className="t-caption num" style={{ whiteSpace: 'nowrap' }}>{a.t}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hf-card" style={{ padding: 20, boxShadow: 'none', border: '1px solid var(--grey-200)' }}>
          <h3 className="t-subtitle" style={{ margin: 0 }}>확인이 필요해요</h3>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { c: 'danger', t: '주 52시간 초과 임박', s: '오민석 · 48 / 52시간' },
              { c: 'warn', t: '승인 대기 12건', s: '가장 오래된 건 3일 경과' },
              { c: 'warn', t: '연차 소멸 임박', s: '17명 · 6월 30일 소멸' },
              { c: null, t: '휴게 미기록', s: '5명 · 7시간 이상 연속 근무' },
            ].map((a, i, arr) => (
              <div key={i} style={{ padding: '14px 0', borderTop: i > 0 ? '1px solid var(--grey-100)' : 'none' }}>
                <div className="row g-8">
                  {a.c && <span className={`hf-chip ${a.c}`}>{a.c === 'danger' ? '긴급' : '주의'}</span>}
                  <span className="t-body-strong">{a.t}</span>
                </div>
                <div className="t-body-sm mt-4">{a.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

Object.assign(window, {
  MobTeamTabs, MobOvertimeSettings, MobOvertimeHistory, MobApprovalDetail,
  MobWeeklyReport, MobExpiryAlert,
  DesktopSettings, DesktopNotifications,
  AdminEmployeeDetail, AdminLiveDashboard });
