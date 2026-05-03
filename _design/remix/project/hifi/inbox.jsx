// 통합 승인함 (Inbox) — 토스 스타일
// flex/시프티의 분산된 승인 UI를 하나로 통합
// 웹: 3-pane (필터 · 리스트 · 상세) · 모바일: 탭 + 카드 스택

// ─── 공유 데이터 ────────────────────────────────────────
const INBOX_DATA = [
  {
    id: 'rq-001', kind: 'overtime', urgent: true,
    who: '박서연', team: '디자인팀', avatar: '박서연',
    title_ko: '오늘 18:00–20:30 초과근무', title_en: 'Overtime today 18:00–20:30',
    reason_ko: '스프린트 마감 · 디자인 QA 마무리 필요',
    reason_en: 'Sprint deadline · design QA wrap-up',
    detail_ko: '예상 2시간 30분', detail_en: 'Expected 2h 30m',
    requested: '오늘 14:32', requested_en: 'Today 14:32',
    deadline_ko: '17:30까지 결정 필요', deadline_en: 'Decide by 17:30',
    role: 'approve', // 내가 승인할 것
    timeline: [
      { t: '14:32', ko: '박서연님이 요청', en: 'Requested by Seoyeon Park' },
      { t: '14:33', ko: '시스템 · 자동 검토 통과', en: 'System · auto-review passed' },
      { t: '14:35', ko: '박PM · 1차 승인', en: 'PM Park · L1 approved' },
    ] },
  {
    id: 'rq-002', kind: 'leave',
    who: '김지우', team: '디자인팀', avatar: '김지우',
    title_ko: '5월 2일 (금) 연차', title_en: 'May 2 (Fri) leave',
    reason_ko: '어린이날 연결 · 가족 여행', reason_en: 'Kids Day bridge · family trip',
    detail_ko: '1일 · 잔여 9일', detail_en: '1 day · 9 left',
    requested: '오늘 11:18', requested_en: 'Today 11:18',
    role: 'approve',
    timeline: [
      { t: '11:18', ko: '김지우님이 요청', en: 'Requested by Jiwoo Kim' },
    ] },
  {
    id: 'rq-003', kind: 'wfh',
    who: '이민호', team: '개발팀', avatar: '이민호',
    title_ko: '내일 (목) 재택근무', title_en: 'Tomorrow (Thu) WFH',
    reason_ko: '병원 방문 · 오후 진료 예약',
    reason_en: 'Hospital appointment in afternoon',
    detail_ko: '1일 · 이번 달 2번째', detail_en: '1 day · 2nd this month',
    requested: '오늘 09:42', requested_en: 'Today 09:42',
    role: 'approve' },
  {
    id: 'rq-004', kind: 'overtime', status: 'approved',
    who: '나', team: '디자인팀', avatar: '김지우',
    title_ko: '4월 17일 초과 11시간', title_en: 'Apr 17 OT · 11h',
    reason_ko: '런칭 준비', reason_en: 'Launch prep',
    detail_ko: '승인 완료', detail_en: 'Approved',
    requested: '4월 17일 18:30', requested_en: 'Apr 17 18:30',
    role: 'mine' },
  {
    id: 'rq-005', kind: 'leave', status: 'pending',
    who: '나', team: '디자인팀', avatar: '김지우',
    title_ko: '5월 4일 (월) 연차', title_en: 'May 4 (Mon) leave',
    reason_ko: '가족 여행', reason_en: 'Family trip',
    detail_ko: '1차 승인 대기', detail_en: 'Awaiting L1',
    requested: '어제', requested_en: 'Yesterday',
    role: 'mine' },
  {
    id: 'rq-006', kind: 'expiry', system: true,
    who: '시스템', team: '근로기준', avatar: 'S',
    title_ko: '연차 3일이 6월 30일에 소멸돼요',
    title_en: '3 leave days expire on Jun 30',
    reason_ko: '근로기준법 60조 · 자동 알림',
    reason_en: 'Labor Standards Act §60 · auto notification',
    detail_ko: '60일 남음', detail_en: '60 days left',
    requested: '오늘 09:00', requested_en: 'Today 09:00',
    role: 'info' },
  {
    id: 'rq-007', kind: 'compliance', system: true, urgent: true,
    who: '시스템', team: '근로기준', avatar: 'S',
    title_ko: '주 52시간 초과 위험 (현재 48h)',
    title_en: '52h limit risk · currently 48h',
    reason_ko: '오늘 4시간 더 근무 시 한도 초과',
    reason_en: '4 more hours today exceeds limit',
    detail_ko: '회사 정책 · 자동 차단', detail_en: 'Policy · auto-blocked',
    requested: '오늘 12:00', requested_en: 'Today 12:00',
    role: 'info' },
];

const KIND_META = (ko) => ({
  overtime:   { label_ko: '초과근무', label_en: 'Overtime', color: 'var(--warn)', soft: 'var(--warn-soft)', icon: '⏱' },
  leave:      { label_ko: '연차',   label_en: 'Leave',    color: 'var(--brand)', soft: 'var(--brand-soft)', icon: '🌴' },
  wfh:        { label_ko: '재택',   label_en: 'WFH',      color: 'var(--purple, #7C5CFF)', soft: '#F1ECFF', icon: '🏠' },
  expiry:     { label_ko: '소멸 알림', label_en: 'Expiry', color: 'var(--warn)', soft: 'var(--warn-soft)', icon: '⏳' },
  compliance: { label_ko: '근로기준', label_en: 'Compliance', color: 'var(--danger)', soft: 'var(--danger-soft, #FFE7E7)', icon: '⚠' } });

// ─── 웹 통합 승인함 (3-pane) ────────────────────────────
function WebInbox() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  const KM = KIND_META(ko);

  const [filter, setFilter] = React.useState('to-approve');
  const [selectedId, setSelectedId] = React.useState('rq-001');

  const filters = [
    { id: 'to-approve', label: ko ? '내가 승인할 것' : 'To approve', count: 3, urgent: 1 },
    { id: 'mine',       label: ko ? '내 요청'         : 'My requests', count: 2, urgent: 0 },
    { id: 'system',     label: ko ? '시스템 알림'      : 'System', count: 2, urgent: 1 },
    { id: 'all',        label: ko ? '전체'            : 'All', count: 7, urgent: 2 },
  ];

  const filteredList = INBOX_DATA.filter(it => {
    if (filter === 'to-approve') return it.role === 'approve';
    if (filter === 'mine') return it.role === 'mine';
    if (filter === 'system') return it.system;
    return true;
  });

  const selected = INBOX_DATA.find(it => it.id === selectedId) || filteredList[0];

  return (
    <WebShell active="inbox"
      breadcrumb={[ko ? '내 워크스페이스' : 'My workspace', ko ? '요청함' : 'Inbox']}
      actions={<>
        <ToolBtn icon={Icon.search} label={ko ? '검색 ⌘K' : 'Search ⌘K'}/>
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '220px 380px 1fr', gap: 0, height: '100%', minHeight: 0 }}>

        {/* Pane 1 — 필터 사이드 */}
        <div style={{ padding: '20px 16px', borderRight: '1px solid var(--grey-100)' }}>
          <div className="t-heading-md" style={{ marginBottom: 14, padding: '0 4px' }}>{ko ? '요청함' : 'Inbox'}</div>

          <div className="col g-2">
            {filters.map(f => {
              const on = filter === f.id;
              return (
                <div key={f.id} onClick={() => setFilter(f.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  background: on ? 'var(--grey-100)' : 'transparent',
                  fontSize: 13, fontWeight: on ? 700 : 500,
                  color: 'var(--grey-800)' }}>
                  <span className="flex-1">{f.label}</span>
                  {f.urgent > 0 && <span style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--white)', background: 'var(--warn)',
                    padding: '2px 6px', borderRadius: 999, fontFamily: 'var(--font-num)' }}>{f.urgent}</span>}
                  <span className="num" style={{ fontSize: 12, color: 'var(--grey-500)', fontWeight: 700, minWidth: 16, textAlign: 'right' }}>{f.count}</span>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--grey-100)', margin: '16px 0 12px' }}/>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-500)', padding: '0 12px 8px', letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {ko ? '카테고리' : 'Categories'}
          </div>
          {Object.entries(KM).map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: 13, color: 'var(--grey-700)' }}>
              <span className="fs-14">{v.icon}</span>
              <span className="flex-1">{ko ? v.label_ko : v.label_en}</span>
              <span className="num fs-12 c-faint">
                {INBOX_DATA.filter(d => d.kind === k).length}
              </span>
            </div>
          ))}
        </div>

        {/* Pane 2 — 리스트 */}
        <div style={{ borderRight: '1px solid var(--grey-100)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{
            padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid var(--grey-100)' }}>
            <div className="t-heading-sm flex-1">
              {filters.find(f => f.id === filter)?.label}
            </div>
            <div style={{ display: 'flex', gap: 4, padding: 2, background: 'var(--grey-100)', borderRadius: 'var(--r-sm)' }}>
              {[ko ? '최신' : 'Recent', ko ? '긴급' : 'Urgent'].map((l, i) => (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: 'var(--r-xs)', fontSize: 12.5, fontWeight: 700,
                  background: i === 0 ? 'var(--white)' : 'transparent',
                  color: i === 0 ? 'var(--grey-900)' : 'var(--grey-500)', cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {filteredList.map((it, i) => {
              const km = KM[it.kind];
              const on = it.id === selectedId;
              return (
                <div key={it.id} onClick={() => setSelectedId(it.id)} style={{
                  padding: '16px 20px', cursor: 'pointer',
                  background: on ? 'var(--brand-soft)' : 'transparent',
                  borderLeft: on ? '3px solid var(--brand)' : '3px solid transparent',
                  borderBottom: '1px solid var(--grey-50)' }}>
                  <div className="row g-8 mb-6">
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: km.color, background: km.soft,
                      padding: '3px 8px', borderRadius: 'var(--r-xs)',
                      display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>{km.icon}</span>
                      {ko ? km.label_ko : km.label_en}
                    </span>
                    {it.urgent && <span style={{
                      fontSize: 10.5, fontWeight: 700, color: 'var(--white)', background: 'var(--warn)',
                      padding: '3px 7px', borderRadius: 999 }}>{ko ? '긴급' : 'URGENT'}</span>}
                    {it.status === 'approved' && <span style={{
                      fontSize: 10.5, fontWeight: 700, color: 'var(--success)', background: 'var(--success-soft)',
                      padding: '3px 7px', borderRadius: 999 }}>{ko ? '승인됨' : 'APPROVED'}</span>}
                    {it.status === 'pending' && <span style={{
                      fontSize: 10.5, fontWeight: 700, color: 'var(--grey-600)', background: 'var(--grey-100)',
                      padding: '3px 7px', borderRadius: 999 }}>{ko ? '대기' : 'PENDING'}</span>}
                    <span className="flex-1"/>
                    <span className="t-caption">{ko ? it.requested : it.requested_en}</span>
                  </div>
                  <div className="row-start g-12">
                    {!it.system ? <Avatar n={it.avatar} size={36}/> : (
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: 'var(--grey-900)',
                        color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700 }}>S</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fs-13 fw-700 c-primary mb-2">
                        {!it.system && it.who} · <span className="fw-500 c-body">{ko ? it.title_ko : it.title_en}</span>
                        {it.system && (ko ? it.title_ko : it.title_en)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--grey-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ko ? it.reason_ko : it.reason_en}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pane 3 — 상세 */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--white)' }}>
          {selected && <InboxDetail item={selected} ko={ko} KM={KM}/>}
        </div>
      </div>
    </WebShell>
  );
}

function InboxDetail({ item, ko, KM }) {
  const km = KM[item.kind];
  const canApprove = item.role === 'approve';
  const isMine = item.role === 'mine';
  const isInfo = item.role === 'info';

  return (
    <>
      {/* Sticky header */}
      <div style={{
        padding: '20px 32px', borderBottom: '1px solid var(--grey-100)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: km.color, background: km.soft,
          padding: '5px 10px', borderRadius: 'var(--r-sm)',
          display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span className="fs-14">{km.icon}</span>
          {ko ? km.label_ko : km.label_en}
        </span>
        {item.urgent && <span style={{
          fontSize: 12, fontWeight: 700, color: 'var(--white)', background: 'var(--warn)',
          padding: '5px 10px', borderRadius: 999 }}>{ko ? '긴급' : 'URGENT'}</span>}
        <div className="flex-1"/>
        <button style={{
          width: 36, height: 36, border: 'none', background: 'var(--grey-100)',
          borderRadius: 10, cursor: 'pointer', fontSize: 16, color: 'var(--grey-600)' }}>⋯</button>
      </div>

      {/* Content scroll */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <div className="t-display-md c-primary mb-12">
          {ko ? item.title_ko : item.title_en}
        </div>

        {/* Requester card */}
        {!item.system && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px', borderRadius: 'var(--r-md)', background: 'var(--grey-50)', marginBottom: 24 }}>
            <Avatar n={item.avatar} size={44}/>
            <div className="flex-1">
              <div className="t-subtitle">{item.who}</div>
              <div className="t-caption">{item.team} · {ko ? item.requested : item.requested_en}</div>
            </div>
            <button style={{
              height: 32, padding: '0 12px', border: '1px solid var(--grey-200)',
              background: 'var(--white)', color: 'var(--grey-700)',
              fontSize: 12, fontWeight: 600, borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>{ko ? '프로필 보기' : 'View profile'}</button>
          </div>
        )}

        {/* Reason */}
        <div className="mb-24">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {ko ? '사유' : 'Reason'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--grey-800)', lineHeight: 1.6 }}>
            {ko ? item.reason_ko : item.reason_en}
          </div>
        </div>

        {/* Key facts grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            [ko ? '카테고리' : 'Type', ko ? km.label_ko : km.label_en],
            [ko ? '상세' : 'Detail', ko ? item.detail_ko : item.detail_en],
            [ko ? '요청일' : 'Requested', ko ? item.requested : item.requested_en],
          ].map(([l, v], i) => (
            <div key={i} style={{
              padding: 14, border: '1px solid var(--grey-100)', borderRadius: 10 }}>
              <div className="fs-12 c-mute fw-600 mb-4">{l}</div>
              <div className="fs-14 fw-700 c-primary">{v}</div>
            </div>
          ))}
        </div>

        {/* Deadline alert (urgent only) */}
        {item.urgent && item.deadline_ko && (
          <div style={{
            padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--warn-soft)',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--warn)', color: 'var(--white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              flexShrink: 0 }}>!</div>
            <div className="flex-1">
              <div className="fs-13 fw-700 c-primary">
                {ko ? item.deadline_ko : item.deadline_en}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--grey-600)' }}>
                {ko ? '늦으면 자동 거절돼요' : 'Auto-rejected if late'}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {item.timeline && (
          <div className="mb-24">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-500)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {ko ? '진행' : 'Timeline'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 6, top: 8, bottom: 8, width: 2, background: 'var(--grey-100)' }}/>
              {item.timeline.map((tl, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: i === item.timeline.length - 1 ? 'var(--brand)' : 'var(--success)',
                    border: '3px solid var(--white)', flexShrink: 0, marginTop: 2,
                    boxShadow: i === item.timeline.length - 1 ? '0 0 0 3px var(--brand-soft)' : 'none' }}/>
                  <div>
                    <div className="num t-caption-strong">{tl.t}</div>
                    <div className="fs-13 c-strong">{ko ? tl.ko : tl.en}</div>
                  </div>
                </div>
              ))}
              {/* Pending step */}
              {canApprove && (
                <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: 'var(--white)', border: '3px dashed var(--grey-300)',
                    flexShrink: 0, marginTop: 2 }}/>
                  <div className="fs-13 c-mute">
                    {ko ? '내 결정 대기 중' : 'Awaiting your decision'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compliance impact (system items) */}
        {item.kind === 'compliance' && (
          <div style={{
            padding: 16, borderRadius: 'var(--r-md)', background: 'var(--grey-50)' }}>
            <div className="fs-13 fw-700 mb-8">
              {ko ? '근로기준법 영향' : 'Labor law impact'}
            </div>
            <div className="row g-8 mb-6">
              <span className="flex-1 fs-12">{ko ? '주간 근로시간' : 'Weekly hours'}</span>
              <span className="num fs-16 fw-700 c-warn">48h</span>
              <span className="t-caption">/ 52h</span>
            </div>
            <div style={{ height: 8, background: 'var(--grey-200)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: '92%', height: '100%', background: 'var(--warn)' }}/>
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      {canApprove && (
        <div style={{
          padding: '16px 32px', borderTop: '1px solid var(--grey-100)', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            height: 44, padding: '0 18px', border: 'none', borderRadius: 'var(--r-md)',
            background: 'var(--grey-100)', color: 'var(--grey-700)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>{ko ? '거절' : 'Reject'}</button>
          <button style={{
            height: 44, padding: '0 18px', border: 'none', borderRadius: 'var(--r-md)',
            background: 'var(--white)', color: 'var(--grey-700)',
            border: '1px solid var(--grey-200)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>{ko ? '의견 남기기' : 'Comment'}</button>
          <div className="flex-1"/>
          <span className="t-caption">
            {ko ? '⌘ + Enter로 빠르게 승인' : '⌘ + Enter to quick approve'}
          </span>
          <button style={{
            height: 44, padding: '0 24px', border: 'none', borderRadius: 'var(--r-md)',
            background: 'var(--brand)', color: 'var(--white)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>{ko ? '승인하기' : 'Approve'}</button>
        </div>
      )}
      {isMine && (
        <div style={{
          padding: '16px 32px', borderTop: '1px solid var(--grey-100)', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            height: 44, padding: '0 18px', border: '1px solid var(--grey-200)', borderRadius: 'var(--r-md)',
            background: 'var(--white)', color: 'var(--grey-700)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>{ko ? '요청 취소' : 'Cancel request'}</button>
          <div className="flex-1"/>
          <span className="t-caption">
            {ko ? '승인자가 결정하면 알림이 가요' : "We'll notify when decided"}
          </span>
        </div>
      )}
      {isInfo && (
        <div style={{
          padding: '16px 32px', borderTop: '1px solid var(--grey-100)', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="flex-1"/>
          <button style={{
            height: 40, padding: '0 16px', border: '1px solid var(--grey-200)', borderRadius: 10,
            background: 'var(--white)', color: 'var(--grey-700)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer'
          }}>{ko ? '읽음 처리' : 'Mark as read'}</button>
          <button style={{
            height: 40, padding: '0 16px', border: 'none', borderRadius: 10,
            background: 'var(--brand)', color: 'var(--white)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer'
          }}>{ko ? '연차 신청하기' : 'Apply leave'}</button>
        </div>
      )}
    </>
  );
}

// ─── 모바일 통합 승인함 ───────────────────────────────
function MobInbox() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  const KM = KIND_META(ko);

  const [tab, setTab] = React.useState('to-approve');

  const tabs = [
    { id: 'to-approve', label: ko ? '승인할 것' : 'To approve', count: 3 },
    { id: 'mine',       label: ko ? '내 요청' : 'Mine', count: 2 },
    { id: 'system',     label: ko ? '알림' : 'System', count: 2 },
  ];

  const list = INBOX_DATA.filter(it => {
    if (tab === 'to-approve') return it.role === 'approve';
    if (tab === 'mine') return it.role === 'mine';
    return it.system;
  });

  return (
    <div className="hf-phone">
      <div className="hf-phone-notch"/>
      <StatusBar/>
      <div className="hf-app" style={{ background: 'var(--grey-50)' }}>
        {/* Header */}
        <div style={{ background: 'var(--white)', padding: '14px 20px 0' }}>
          <div className="row g-8 mb-14">
            <div className="t-display-md flex-1">{ko ? '요청함' : 'Inbox'}</div>
            <button style={{
              width: 36, height: 36, border: 'none', background: 'var(--grey-100)',
              borderRadius: 10, cursor: 'pointer' }}>
              <Icon.search className="icon-18"/>
            </button>
          </div>

          {/* Top action card */}
          <div style={{
            background: 'var(--brand)', borderRadius: 14, padding: 16,
            color: 'var(--white)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>1</div>
            <div className="flex-1">
              <div className="t-body fw-700">
                {ko ? '긴급 승인 1건' : '1 urgent approval'}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                {ko ? '17:30까지 결정 필요' : 'Decide by 17:30'}
              </div>
            </div>
            <span className="fs-18">→</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, paddingBottom: 12 }}>
            {tabs.map(tb => (
              <div key={tb.id} onClick={() => setTab(tb.id)} style={{
                flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                background: tab === tb.id ? 'var(--grey-900)' : 'var(--grey-100)',
                color: tab === tb.id ? '#fff' : 'var(--grey-700)' }}>
                {tb.label}
                <span className="num" style={{
                  marginLeft: 6, fontSize: 12, padding: '1px 6px', borderRadius: 999,
                  background: tab === tb.id ? 'rgba(255,255,255,0.18)' : 'var(--white)',
                  color: tab === tb.id ? '#fff' : 'var(--grey-600)' }}>{tb.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(it => {
            const km = KM[it.kind];
            return (
              <div key={it.id} style={{
                background: 'var(--white)', borderRadius: 14, padding: 16,
                display: 'flex', flexDirection: 'column', gap: 10,
                border: it.urgent ? '2px solid var(--warn)' : 'none' }}>
                <div className="row g-8">
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: km.color, background: km.soft,
                    padding: '3px 8px', borderRadius: 'var(--r-xs)',
                    display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>{km.icon}</span>
                    {ko ? km.label_ko : km.label_en}
                  </span>
                  {it.urgent && <span style={{
                    fontSize: 10.5, fontWeight: 700, color: 'var(--white)', background: 'var(--warn)',
                    padding: '3px 7px', borderRadius: 999 }}>{ko ? '긴급' : 'URGENT'}</span>}
                  <span className="flex-1"/>
                  <span className="t-caption">{ko ? it.requested : it.requested_en}</span>
                </div>
                <div className="row g-12">
                  {!it.system && <Avatar n={it.avatar} size={36}/>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fs-14 fw-700 c-primary mb-2">
                      {!it.system && <span>{it.who} · </span>}
                      <span style={{ fontWeight: it.system ? 700 : 500, color: it.system ? 'var(--grey-900)' : 'var(--grey-700)' }}>
                        {ko ? it.title_ko : it.title_en}
                      </span>
                    </div>
                    <div className="t-caption">
                      {ko ? it.reason_ko : it.reason_en}
                    </div>
                  </div>
                </div>
                {it.role === 'approve' && (
                  <div className="row g-8">
                    <button style={{
                      flex: 1, height: 40, border: 'none', borderRadius: 10,
                      background: 'var(--grey-100)', color: 'var(--grey-700)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}>{ko ? '거절' : 'Reject'}</button>
                    <button style={{
                      flex: 2, height: 40, border: 'none', borderRadius: 10,
                      background: 'var(--brand)', color: 'var(--white)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}>{ko ? '승인하기' : 'Approve'}</button>
                  </div>
                )}
                {it.role === 'mine' && (
                  <div style={{
                    fontSize: 12, color: 'var(--grey-600)', padding: 10,
                    background: 'var(--grey-50)', borderRadius: 10 }}>
                    {ko ? it.detail_ko : it.detail_en}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <TabBar active="leave" t={(k) => ({ nav_home: ko ? '홈' : 'Home', nav_team: ko ? '팀' : 'Team', nav_leave: ko ? '요청함' : 'Inbox', nav_me: ko ? '마이' : 'Me' })[k]} badges={{ leave: 3 }}/>
      <div className="hf-phone-home"/>
    </div>
  );
}

// ─── 모바일 승인 빠른 액션 (스와이프) ───────────────────
function MobInboxQuick() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';

  return (
    <div className="hf-phone">
      <div className="hf-phone-notch"/>
      <StatusBar/>
      <div className="hf-app" style={{ background: 'var(--grey-100)' }}>
        <div style={{ padding: '14px 20px 0' }}>
          <div className="row g-8 mb-14">
            <span style={{ fontSize: 18, color: 'var(--grey-700)', cursor: 'pointer' }}>←</span>
            <div className="t-heading-lg flex-1">{ko ? '빠른 승인' : 'Quick approve'}</div>
            <span className="num fs-13 fw-700 c-mute">1 / 3</span>
          </div>
        </div>

        {/* Card stack */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          {/* Backdrop card */}
          <div style={{
            position: 'absolute', top: 90, left: 30, right: 30, height: 480,
            background: 'var(--white)', borderRadius: 20, opacity: 0.4,
            transform: 'scale(0.92) translateY(20px)' }}/>
          <div style={{
            position: 'absolute', top: 90, left: 24, right: 24, height: 480,
            background: 'var(--white)', borderRadius: 20, opacity: 0.7,
            transform: 'scale(0.96) translateY(10px)' }}/>

          {/* Top card */}
          <div style={{
            position: 'relative', width: '100%',
            background: 'var(--white)', borderRadius: 20, padding: 24,
            display: 'flex', flexDirection: 'column', gap: 16,
            minHeight: 480 }}>
            <div className="row g-8">
              <span style={{
                fontSize: 12, fontWeight: 700, color: 'var(--warn)', background: 'var(--warn-soft)',
                padding: '4px 10px', borderRadius: 'var(--r-sm)' }}>⏱ {ko ? '초과근무' : 'OVERTIME'}</span>
              <span style={{
                fontSize: 12, fontWeight: 700, color: 'var(--white)', background: 'var(--warn)',
                padding: '4px 10px', borderRadius: 999 }}>{ko ? '긴급' : 'URGENT'}</span>
            </div>

            <div className="row g-14">
              <Avatar n="박서연" size={56}/>
              <div>
                <div className="t-heading-md">박서연</div>
                <div style={{ fontSize: 12.5, color: 'var(--grey-500)' }}>{ko ? '디자인팀 · 차장' : 'Design · Sr.'}</div>
              </div>
            </div>

            <div className="t-display-md" style={{ color: 'var(--grey-900)', lineHeight: 1.3 }}>
              {ko ? '오늘 18:00–20:30\n초과근무 요청' : 'Overtime today\n18:00–20:30'}
            </div>

            <div style={{ background: 'var(--grey-50)', borderRadius: 'var(--r-md)', padding: 14 }}>
              <div className="fs-12 fw-700 c-mute mb-6">{ko ? '사유' : 'Reason'}</div>
              <div style={{ fontSize: 13, color: 'var(--grey-800)', lineHeight: 1.6 }}>
                {ko ? '스프린트 마감으로 디자인 QA 마무리가 필요합니다. 내일 출시 일정에 맞추기 위해 오늘 안에 완료해야 해요.'
                    : 'Sprint deadline requires finishing design QA today before tomorrow launch.'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                [ko ? '시간' : 'Hours', '2:30'],
                [ko ? '월간' : 'Month', '8:00'],
                [ko ? '한도' : 'Limit', '12h'],
              ].map(([l, v], i) => (
                <div key={i} style={{ background: 'var(--grey-50)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--grey-500)', fontWeight: 600 }}>{l}</div>
                  <div className="num t-heading-sm">{v}</div>
                </div>
              ))}
            </div>

            <div style={{
              padding: '10px 12px', borderRadius: 10, background: 'var(--warn-soft)',
              fontSize: 12, color: 'var(--warn)', fontWeight: 700, textAlign: 'center' }}>
              ⏰ {ko ? '17:30까지 결정 필요' : 'Decide by 17:30'}
            </div>
          </div>

          {/* Swipe hint + actions */}
          <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 8 }}>
            <button style={{
              flex: 1, height: 56, border: 'none', borderRadius: 14,
              background: 'var(--white)', color: 'var(--grey-700)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>← {ko ? '거절' : 'Reject'}</button>
            <button style={{
              flex: 2, height: 56, border: 'none', borderRadius: 14,
              background: 'var(--brand)', color: 'var(--white)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{ko ? '승인' : 'Approve'} →</button>
          </div>
          <div className="fs-12 c-mute mt-4">
            {ko ? '왼쪽으로 밀어 거절 · 오른쪽으로 밀어 승인' : 'Swipe left to reject · right to approve'}
          </div>
        </div>
      </div>
      <div className="hf-phone-home"/>
    </div>
  );
}
