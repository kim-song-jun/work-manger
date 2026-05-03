// Extra system pages — icons, spacing, shadows, calendar, dropdown, etc.

function SysIcons() {
  const icons = [
    'home','team','calendar','user','settings','bell','chevR','chevL','chevD',
    'close','plus','check','search','map','clock','moon','sun','coffee','lock',
    'inbox','chart','filter','edit','building','house',
  ];
  return (
    <div style={{ padding: 28, background: 'var(--white)', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg mb-4">아이콘</div>
      <div className="t-body c-muted mb-24">
        24×24 viewBox · stroke 2 · 라운드 캡 · 라운드 조인 · currentColor 컬러 상속.
      </div>

      {/* size scale */}
      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SIZE SCALE</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, padding: 20, background: 'var(--grey-50)', borderRadius: 'var(--r-md)', marginBottom: 28 }}>
        {[16, 20, 24, 28, 32].map((s) => (
          <div key={s} className="ta-c">
            <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey-900)' }}>
              <Icon.bell style={{ width: s, height: s }} />
            </div>
            <div className="t-caption num c-mute mt-8">{s}px</div>
          </div>
        ))}
      </div>

      {/* color states */}
      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>COLOR · CONTEXT</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {[
          ['var(--grey-900)','primary'],
          ['var(--grey-600)','secondary'],
          ['var(--grey-400)','disabled'],
          ['var(--brand)','interactive'],
          ['var(--success)','positive'],
          ['var(--danger)','negative'],
        ].map(([c, l]) => (
          <div key={l} style={{ flex: 1, padding: 16, border: '1px solid var(--grey-200)', borderRadius: 'var(--r-md)', textAlign: 'center', color: c }}>
            <Icon.bell className="icon-24" />
            <div className="t-caption-strong mt-8 c-primary">{l}</div>
          </div>
        ))}
      </div>

      {/* full grid */}
      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>전체 ({icons.length})</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {icons.map((n) => {
          const I = Icon[n];
          return (
            <div key={n} style={{ border: '1px solid var(--grey-200)', borderRadius: 10, padding: '20px 8px', textAlign: 'center' }}>
              <I className="icon-24 c-primary" />
              <div className="t-caption mt-10 c-muted">{n}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SysSpacing() {
  const spacing = [
    [4, 'xs', 'Hairline · 칩 내부'],
    [8, 'sm', 'Compact · 인라인'],
    [12, 'md', '카드 내부 padding'],
    [16, 'base', '기본 — 본문 행간'],
    [20, 'lg', '섹션 내 그룹'],
    [24, 'xl', '카드 사이'],
    [32, '2xl', '섹션 사이'],
    [48, '3xl', '페이지 영역'],
    [64, '4xl', '히어로 위/아래'],
  ];
  const radius = [
    [0, 'none'], [4, 'xs'], [8, 'sm'], [12, 'md'], [16, 'lg'],
    [20, 'xl'], [28, '2xl'], [9999, 'full'],
  ];
  const shadows = [
    ['shadow-1','0 1px 2px rgba(0,0,0,0.04)','경계 강조 · 카드 정적'],
    ['shadow-2','0 4px 12px rgba(0,0,0,0.06)','떠 있는 카드'],
    ['shadow-3','0 12px 32px rgba(0,0,0,0.10)','시트 · 모달'],
    ['shadow-4','0 24px 60px rgba(0,0,0,0.16)','드래그 · 풀스크린'],
  ];
  return (
    <div style={{ padding: 28, background: 'var(--white)', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg mb-4">스페이싱 · 라디우스 · 그림자</div>
      <div className="t-body c-muted mb-24">
        4의 배수 그리드 · 라운드는 부드러운 면 · 그림자는 단일 레이어 검정.
      </div>

      {/* spacing */}
      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SPACING</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
        {spacing.map(([v, n, use]) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '70px 70px 1fr 240px', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--grey-100)' }}>
            <div className="t-body-strong">{n}</div>
            <div className="t-body num c-muted">{v}px</div>
            <div style={{ height: 14, background: 'var(--brand-soft)', width: `${v}px`, borderRadius: 4 }} />
            <div className="t-body-sm c-muted">{use}</div>
          </div>
        ))}
      </div>

      {/* radius */}
      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>RADIUS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10, marginBottom: 28 }}>
        {radius.map(([r, n]) => (
          <div key={n} className="ta-c">
            <div style={{ width: '100%', aspectRatio: '1', background: 'var(--grey-100)', borderRadius: r === 9999 ? '50%' : r, border: '1px solid var(--grey-200)' }} />
            <div className="t-caption-strong mt-8">{n}</div>
            <div className="t-caption num c-mute">{r === 9999 ? '∞' : r + 'px'}</div>
          </div>
        ))}
      </div>

      {/* shadows */}
      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SHADOWS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: 24, background: 'var(--grey-50)', borderRadius: 'var(--r-lg)' }}>
        {shadows.map(([n, v, use]) => (
          <div key={n} style={{ background: 'var(--white)', height: 100, borderRadius: 'var(--r-md)', boxShadow: v, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="t-caption-strong">{n}</div>
            <div>
              <div className="t-caption num c-mute">{v}</div>
              <div className="t-caption c-muted">{use}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SysCalendar() {
  // 가벼운 mock — 2025년 4월
  const days = ['월','화','수','목','금','토','일'];
  const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const today = 22;
  const leaves = [3, 4]; // 본인 연차
  const teamLeaves = [10, 17, 24]; // 팀원 연차
  const weekend = (d) => ((d - 1 + 1) % 7 === 5 || (d - 1 + 1) % 7 === 6); // mock

  return (
    <div style={{ padding: 28, background: 'var(--white)', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg mb-4">캘린더</div>
      <div className="t-body c-muted mb-24">
        Day · Range · Inline · Compact — 4가지 변형. 모든 캘린더는 같은 토큰을 공유해요.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Single date picker */}
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 14, padding: 20 }}>
          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 12 }}>DATE PICKER · 단일</div>
          <div className="row-between mb-14">
            <Icon.chevL className="icon-18 c-muted" />
            <div className="t-subtitle">2025년 4월</div>
            <Icon.chevR className="icon-18 c-muted" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {days.map((d) => <div key={d} className="t-caption" style={{ textAlign: 'center', color: 'var(--grey-500)', padding: '4px 0' }}>{d}</div>)}
            {monthDays.map((d) => {
              const isToday = d === today;
              const isWeekend = weekend(d);
              return (
                <div key={d} style={{
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: isToday ? 700 : 500,
                  background: isToday ? 'var(--brand)' : 'transparent',
                  color: isToday ? '#fff' : isWeekend ? 'var(--grey-400)' : 'var(--grey-900)',
                  cursor: 'pointer' }}>{d}</div>
              );
            })}
          </div>
        </div>

        {/* Range picker */}
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 14, padding: 20 }}>
          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 12 }}>DATE RANGE · 연차 신청</div>
          <div className="row-between mb-14">
            <Icon.chevL className="icon-18 c-muted" />
            <div className="t-subtitle">2025년 4월</div>
            <Icon.chevR className="icon-18 c-muted" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
            {days.map((d) => <div key={d} className="t-caption" style={{ textAlign: 'center', color: 'var(--grey-500)', padding: '4px 0' }}>{d}</div>)}
            {monthDays.map((d) => {
              const inRange = d >= 22 && d <= 25;
              const isStart = d === 22;
              const isEnd = d === 25;
              const bg = isStart || isEnd ? 'var(--brand)' : inRange ? 'var(--brand-soft)' : 'transparent';
              const color = isStart || isEnd ? '#fff' : inRange ? 'var(--brand)' : weekend(d) ? 'var(--grey-400)' : 'var(--grey-900)';
              const radius = isStart ? '8px 0 0 8px' : isEnd ? '0 8px 8px 0' : 0;
              return (
                <div key={d} style={{
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: bg, color, fontSize: 13, fontWeight: (isStart || isEnd) ? 700 : 500,
                  borderRadius: inRange && !isStart && !isEnd ? 0 : radius || 8 }}>{d}</div>
              );
            })}
          </div>
          <div className="t-caption mt-12 c-muted">
            <span className="c-brand fw-700">4월 22일 ~ 4월 25일</span> · 4일 (영업일 4일)
          </div>
        </div>

        {/* Multi-event calendar */}
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 14, padding: 20, gridColumn: '1 / -1' }}>
          <div className="row-between mb-12">
            <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase' }}>MULTI · 이벤트 캘린더</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              <div className="row g-6">
                <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--brand)' }} /> 내 연차
              </div>
              <div className="row g-6">
                <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--warn)' }} /> 팀 연차
              </div>
              <div className="row g-6">
                <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--success)' }} /> 출근
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {days.map((d) => <div key={d} className="t-caption" style={{ textAlign: 'center', color: 'var(--grey-500)', padding: '4px 0' }}>{d}</div>)}
            {monthDays.map((d) => {
              const isToday = d === today;
              const myLeave = leaves.includes(d);
              const teamLeave = teamLeaves.includes(d);
              const worked = !myLeave && d <= today && !weekend(d);
              return (
                <div key={d} style={{
                  aspectRatio: '1', borderRadius: 'var(--r-sm)', padding: 4, position: 'relative',
                  background: isToday ? 'var(--brand-soft)' : myLeave ? 'var(--brand-soft)' : 'var(--grey-50)',
                  border: isToday ? '2px solid var(--brand)' : 'none',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 600, color: weekend(d) ? 'var(--grey-400)' : 'var(--grey-900)' }}>{d}</div>
                  <div className="row g-2 wrap">
                    {myLeave && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--brand)' }} />}
                    {teamLeave && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--warn)' }} />}
                    {worked && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--success)' }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SysControls() {
  const [open, setOpen] = React.useState(true);
  const [tab, setTab] = React.useState(0);
  const [seg, setSeg] = React.useState('week');
  return (
    <div style={{ padding: 28, background: 'var(--white)', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg mb-4">컨트롤</div>
      <div className="t-body c-muted mb-24">
        탭 · 세그먼트 · 드롭다운 · 메뉴 · 페이지네이션 · 셀렉트.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Tabs */}
        <div>
          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 8 }}>TABS · UNDERLINE</div>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--grey-200)', marginBottom: 20 }}>
            {['전체','승인 대기','승인됨','반려'].map((l, i) => (
              <div key={l} onClick={() => setTab(i)} style={{
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: tab === i ? '2px solid var(--grey-900)' : '2px solid transparent',
                color: tab === i ? 'var(--grey-900)' : 'var(--grey-500)',
                fontWeight: tab === i ? 700 : 500, marginBottom: -1, fontSize: 14 }}>{l}</div>
            ))}
          </div>

          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 8 }}>SEGMENT</div>
          <div style={{ display: 'flex', padding: 3, background: 'var(--grey-100)', borderRadius: 10, marginBottom: 20 }}>
            {[['day','일'],['week','주'],['month','월'],['year','년']].map(([k, l]) => (
              <div key={k} onClick={() => setSeg(k)} style={{
                flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                background: seg === k ? '#fff' : 'transparent',
                boxShadow: seg === k ? 'var(--shadow-1)' : 'none',
                fontSize: 13, fontWeight: seg === k ? 700 : 500,
                color: seg === k ? 'var(--grey-900)' : 'var(--grey-600)' }}>{l}</div>
            ))}
          </div>

          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 8 }}>PAGINATION</div>
          <div className="row g-4">
            <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--grey-200)', borderRadius: 'var(--r-xs)', color: 'var(--grey-600)', cursor: 'pointer' }}>
              <Icon.chevL className="icon-14" />
            </div>
            {[1,2,3,4,5].map((p) => (
              <div key={p} style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--r-xs)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: p === 2 ? 'var(--grey-900)' : 'transparent',
                color: p === 2 ? '#fff' : 'var(--grey-700)' }}>{p}</div>
            ))}
            <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--grey-200)', borderRadius: 'var(--r-xs)', color: 'var(--grey-600)', cursor: 'pointer' }}>
              <Icon.chevR className="icon-14" />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        <div>
          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 8 }}>DROPDOWN · SELECT</div>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div onClick={() => setOpen(!open)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', border: `1px solid ${open ? 'var(--grey-900)' : 'var(--grey-200)'}`,
              borderRadius: 10, background: 'var(--white)', cursor: 'pointer' }}>
              <span className="fs-14 c-primary">전체 부서</span>
              <Icon.chevD style={{ width: 16, height: 16, color: 'var(--grey-600)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
            </div>
            {open && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
                background: 'var(--white)', borderRadius: 10, boxShadow: 'var(--shadow-3)',
                border: '1px solid var(--grey-100)', overflow: 'hidden', zIndex: 2 }}>
                {['전체 부서','디자인 (8)','엔지니어링 (24)','PM (6)','마케팅 (5)'].map((l, i) => (
                  <div key={l} style={{
                    padding: '12px 14px', fontSize: 14, cursor: 'pointer',
                    background: i === 0 ? 'var(--brand-soft)' : 'transparent',
                    color: i === 0 ? 'var(--brand)' : 'var(--grey-900)',
                    fontWeight: i === 0 ? 700 : 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{l}</span>
                    {i === 0 && <Icon.check className="icon-16" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 8 }}>CONTEXT MENU</div>
          <div style={{
            background: 'var(--white)', borderRadius: 10, boxShadow: 'var(--shadow-3)',
            border: '1px solid var(--grey-100)', overflow: 'hidden', width: 240 }}>
            {[
              [Icon.edit, '수정', false],
              [Icon.calendar, '일정 변경', false],
              [Icon.bell, '알림 끄기', false],
            ].map(([I, l], i) => (
              <div key={l} style={{ padding: '10px 14px', fontSize: 14, color: 'var(--grey-900)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <I className="icon-16 c-muted" />
                <span>{l}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--grey-100)', margin: '4px 0' }} />
            <div style={{ padding: '10px 14px', fontSize: 14, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Icon.close className="icon-16" />
              <span>삭제</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SysFeedback() {
  return (
    <div style={{ padding: 28, background: 'var(--white)', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg mb-4">피드백 · 오버레이</div>
      <div className="t-body c-muted mb-24">
        Banner · Toast · Tooltip · Modal · Bottom Sheet · Dialog.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Banners */}
        <div>
          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 8 }}>BANNER · INLINE</div>
          <div className="col g-8">
            {[
              ['info','#EBF4FF','var(--brand)','이번 주 1.5시간 추가로 일했어요.'],
              ['warn','#FFF6E5','#C57700','연차 4일이 12월 31일에 사라져요.'],
              ['success','#E6F8F0','var(--success)','출근이 기록되었어요.'],
              ['danger','#FFE8E8','var(--danger)','GPS를 읽지 못했어요. Wi-Fi로 다시 시도하기.'],
            ].map(([k, bg, c, msg]) => (
              <div key={k} style={{
                background: bg, color: c, padding: '12px 14px', borderRadius: 10,
                fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: c, flexShrink: 0 }} />
                <span className="flex-1 c-primary">{msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Toast */}
        <div>
          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 8 }}>TOAST</div>
          <div className="col g-8">
            <div style={{ background: 'var(--grey-900)', color: 'var(--white)', padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: 13, boxShadow: 'var(--shadow-3)' }}>
              연차 신청이 박민지 PM에게 전송됐어요.
            </div>
            <div style={{ background: 'var(--grey-900)', color: 'var(--white)', padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: 13, boxShadow: 'var(--shadow-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
              <span>1건이 삭제됐어요.</span>
              <span style={{ color: '#7CB1FF', fontWeight: 700 }}>되돌리기</span>
            </div>
          </div>

          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 }}>TOOLTIP</div>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: 24 }}>
            <button className="hf-btn hf-btn-secondary hf-btn-medium">호버 대상</button>
            <div style={{
              position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-6px)',
              background: 'var(--grey-900)', color: 'var(--white)', padding: '6px 10px', borderRadius: 'var(--r-xs)',
              fontSize: 12, whiteSpace: 'nowrap' }}>
              초과근무로 자동 기록돼요
              <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--grey-900)' }} />
            </div>
          </div>
        </div>

        {/* Modal */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', marginBottom: 8 }}>MODAL · BOTTOM SHEET</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Center modal */}
            <div style={{ position: 'relative', height: 280, background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 24, width: '80%',
                boxShadow: 'var(--shadow-4)' }}>
                <div className="t-heading mb-6">연차를 신청할까요?</div>
                <div className="t-body c-muted mb-16">4월 22일 ~ 4월 25일 · 4일</div>
                <div className="row g-8">
                  <button className="hf-btn hf-btn-secondary hf-btn-medium flex-1">취소</button>
                  <button className="hf-btn hf-btn-primary hf-btn-medium flex-1">신청하기</button>
                </div>
              </div>
            </div>

            {/* Bottom sheet */}
            <div style={{ position: 'relative', height: 280, background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'var(--white)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24,
                boxShadow: 'var(--shadow-3)' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--grey-300)', margin: '0 auto 14px' }} />
                <div className="t-heading mb-4">초과근무 요청</div>
                <div className="t-body c-muted mb-16">정규 시간 18:00 지났어요.</div>
                <button className="hf-btn hf-btn-primary hf-btn-large" style={{ width: '100%' }}>1.5시간 요청 보내기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SysIcons, SysSpacing, SysCalendar, SysControls, SysFeedback });
