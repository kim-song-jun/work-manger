// 누락 페이지: 회원가입 · 비밀번호 찾기 · 알림 · 공지사항 · 상세 기록 · 빈 상태 · 에러
// Toss 시스템 기반 — 단일 엑센트(--brand), 엄격한 위계, 토큰 사용

// ─────────────────────────────────────────
// 회원가입 (3단계 중 2단계: 이메일 인증)
// ─────────────────────────────────────────
function MobSignup() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div className="hf-screen" style={{ background: 'var(--white)' }}>
      <StatusBar />
      <div className="hf-appbar g-10">
        <Icon.chevL className="icon-24 c-primary"/>
        <div style={{ flex: 1, height: 4, background: 'var(--grey-100)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: '66%', height: '100%', background: 'var(--brand)' }}/>
        </div>
        <div className="t-caption-strong">2/3</div>
      </div>

      <div style={{ padding: '24px 24px 20px' }}>
        <h1>{ko ? <>회사 이메일을<br/>인증해 주세요</> : <>Verify your<br/>work email</>}</h1>
        <p className="t-body-sm mt-8">
          {ko ? '조직 도메인으로 시작해야 가입할 수 있어요' : 'You must sign up with a verified company domain'}
        </p>
      </div>

      <div style={{ padding: '0 24px' }}>
        <FormField label={ko ? '회사 이메일' : 'Work email'}>
          <div style={{
            padding: '14px', background: 'var(--grey-100)', borderRadius: 'var(--r-md)',
            fontSize: 15, fontWeight: 600, color: 'var(--grey-900)',
            border: '2px solid var(--brand)',
          }}>
            jiwoo.kim@<span className="c-brand">molcube.com</span>
          </div>
          <div className="row g-6 mt-10">
            <Icon.check className="icon-14 c-success"/>
            <span className="t-caption-strong c-success">
              {ko ? '몰큐브 도메인이 확인되었어요' : 'Molcube domain verified'}
            </span>
          </div>
        </FormField>

        <FormField label={ko ? '인증 코드' : 'Verification code'}>
          <div className="row g-8">
            {['4','2','1','·','·','·'].map((c, i) => (
              <div key={i} style={{
                flex: 1, aspectRatio: '1',
                background: i < 3 ? 'var(--white)' : 'var(--grey-100)',
                border: i === 3 ? '2px solid var(--brand)' : `2px solid ${i < 3 ? 'var(--grey-200)' : 'transparent'}`,
                borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700,
                color: c === '·' ? 'var(--grey-400)' : 'var(--grey-900)',
              }}>{c}</div>
            ))}
          </div>
          <div className="row-between mt-12">
            <span className="t-caption">{ko ? '2분 48초 남음' : '2m 48s left'}</span>
            <span className="t-caption-strong c-brand">{ko ? '재전송' : 'Resend'}</span>
          </div>
        </FormField>
      </div>

      <div style={{ padding: '0 24px 24px', marginTop: 'auto' }}>
        <button className="hf-btn hf-btn-primary hf-btn-large hf-btn-block">{ko ? '다음' : 'Next'}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 비밀번호 찾기
// ─────────────────────────────────────────
function MobForgot() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div className="hf-screen" style={{ background: 'var(--white)' }}>
      <StatusBar />
      <div className="hf-appbar">
        <Icon.chevL className="icon-24 c-primary"/>
      </div>

      <div style={{ padding: '8px 24px 20px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--r-md)',
          background: 'var(--brand-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Icon.lock className="icon-28 c-brand"/>
        </div>
        <h1>{ko ? <>비밀번호를<br/>잊으셨나요?</> : <>Forgot your<br/>password?</>}</h1>
        <p className="t-body mt-8">
          {ko ? '가입하신 이메일로 재설정 링크를 보내드릴게요' : 'We\'ll send a reset link to your registered email'}
        </p>
      </div>

      <div style={{ padding: '0 24px' }}>
        <FormField label={ko ? '이메일' : 'Email'}>
          <div style={{
            padding: '14px', background: 'var(--grey-100)', borderRadius: 'var(--r-md)',
            fontSize: 15, fontWeight: 600, color: 'var(--grey-900)',
          }}>
            jiwoo.kim@molcube.com
          </div>
        </FormField>

        <Card padding={14} style={{ background: 'var(--warn-soft)', borderRadius: 'var(--r-md)' }}>
          <div className="row-start g-10">
            <div style={{
              width: 20, height: 20, borderRadius: 10,
              background: 'var(--warn)', color: 'var(--white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>!</div>
            <div className="t-body-sm c-body">
              {ko ? '회사 이메일로만 재설정이 가능해요. 접근이 어려우면 관리자에게 문의해 주세요.' : 'Resets only work for your company email. Contact your admin if you can\'t access it.'}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 24px 24px', marginTop: 'auto' }}>
        <button className="hf-btn hf-btn-primary hf-btn-large hf-btn-block">
          {ko ? '재설정 링크 보내기' : 'Send reset link'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 알림 센터
// ─────────────────────────────────────────
function MobNotifications() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  const items = [
    { type: 'ot',     t: 'now',  title: ko?'초과근무 승인 요청':'Overtime request',    sub: ko?'최민지 님이 1시간 초과근무를 요청했어요':'Minji requested 1h overtime', unread: true,  color: 'var(--warn)' },
    { type: 'leave',  t: '10m',  title: ko?'연차 신청 승인됨':'Leave approved',         sub: ko?'11/14-15 · 이수진 매니저가 승인':'Nov 14-15 · Approved by Sujin',     unread: true,  color: 'var(--success)' },
    { type: 'expire', t: '1h',   title: ko?'소멸 예정 연차':'Leave expiring soon',       sub: ko?'3일이 12/31에 소멸돼요':'3 days expire on Dec 31',                    unread: true,  color: 'var(--danger)' },
    { type: 'team',   t: '3h',   title: ko?'박시우 님이 출근':'Siwoo clocked in',         sub: ko?'본사 · 09:12':'Office · 09:12',                                       unread: false, color: 'var(--brand)' },
    { type: 'notice', t: 'yday', title: ko?'공지: 12월 워크샵 안내':'Notice: December workshop', sub: ko?'12/20 · 제주도 · 필수 참석':'Dec 20 · Jeju · Required',         unread: false, color: 'var(--grey-700)' },
    { type: 'weekly', t: '2d',   title: ko?'이번 주 근무 리포트':'Weekly report ready',   sub: ko?'38h 24m · 평균보다 2h 많아요':'38h 24m · 2h more than avg',           unread: false, color: 'var(--success)' },
  ];
  return (
    <div className="hf-screen" style={{ background: 'var(--grey-50)' }}>
      <StatusBar />
      <div className="hf-appbar" style={{ background: 'var(--white)' }}>
        <Icon.chevL className="icon-24 c-primary"/>
        <h1 className="flex-1">{ko ? '알림' : 'Notifications'}</h1>
        <span className="t-caption-strong c-brand">{ko ? '모두 읽음' : 'Mark all'}</span>
      </div>

      {/* Filter pills */}
      <div style={{ padding: '12px 16px 8px', background: 'var(--white)', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[[ko?'전체':'All', true, 3], [ko?'승인':'Approvals', false, 2], [ko?'연차':'Leave', false, 0], [ko?'공지':'Notice', false, 0]].map(([l, on, n], i) => (
          <div key={i} style={{
            padding: '6px 12px', borderRadius: 999,
            background: on ? 'var(--grey-900)' : 'var(--grey-100)',
            color: on ? 'var(--white)' : 'var(--grey-700)',
            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {l}
            {n > 0 && <span style={{
              background: on ? 'rgba(255,255,255,0.2)' : 'var(--danger)',
              color: 'var(--white)', fontSize: 10, padding: '1px 6px',
              borderRadius: 8, fontWeight: 700,
            }}>{n}</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 12px', flex: 1, overflow: 'auto' }}>
        {items.map((it, i) => (
          <Card key={i} padding={14} style={{
            marginBottom: 6, position: 'relative',
            boxShadow: it.unread ? '0 0 0 1.5px rgba(49,130,246,0.15)' : 'none',
          }}>
            {it.unread && (
              <div style={{
                position: 'absolute', top: 16, right: 14,
                width: 7, height: 7, borderRadius: 4, background: 'var(--brand)',
              }}/>
            )}
            <div className="row g-12">
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--r-sm)',
                background: it.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: it.color }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-baseline g-6 mb-2">
                  <div className="t-body" style={{
                    fontWeight: 700, color: 'var(--grey-900)', flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{it.title}</div>
                  <span className="t-caption shrink-0">{it.t}</span>
                </div>
                <div className="t-body-sm">{it.sub}</div>
                {it.type === 'ot' && (
                  <div className="row g-6 mt-10">
                    <button className="hf-btn hf-btn-primary hf-btn-tiny flex-1">{ko?'승인':'Approve'}</button>
                    <button className="hf-btn hf-btn-secondary hf-btn-tiny flex-1">{ko?'반려':'Reject'}</button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 공지사항
// ─────────────────────────────────────────
function MobNotice() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div className="hf-screen" style={{ background: 'var(--grey-50)' }}>
      <StatusBar />
      <div className="hf-appbar" style={{ background: 'var(--white)' }}>
        <Icon.chevL className="icon-24 c-primary"/>
        <h1 className="flex-1">{ko ? '공지사항' : 'Notices'}</h1>
        <Icon.search className="icon-22 c-body"/>
      </div>

      <div style={{ padding: '16px 20px', flex: 1, overflow: 'auto' }}>
        <div className="row g-4 mb-6">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--danger)"><path d="M12 2l2.09 6.26H20l-5 3.64 1.9 5.87L12 14.27 7.1 17.77 9 11.9 4 8.26h5.91z"/></svg>
          <span className="t-caption-strong c-danger">{ko ? '상단 고정' : 'Pinned'}</span>
        </div>

        <Card padding={16} style={{ marginBottom: 16, border: '1.5px solid var(--danger-soft)' }}>
          <div className="t-caption-strong c-danger mb-4">
            {ko ? '[필수]' : '[REQUIRED]'}
          </div>
          <div className="t-subtitle mb-4">
            {ko ? '연차 소멸 정책 변경 안내' : 'Leave expiration policy update'}
          </div>
          <div className="t-body-sm mb-10">
            {ko ? '2026년부터 연차는 발생일 기준 2년 이내 사용해야 합니다. 미사용 시 자동 소멸...' : 'From 2026, leave must be used within 2 years of grant. Unused days automatically expire...'}
          </div>
          <div className="t-caption row g-8">
            <span>{ko ? 'HR팀 · 11/10' : 'HR · Nov 10'}</span>
            <span>·</span>
            <span>{ko ? '조회 142' : '142 views'}</span>
          </div>
        </Card>

        <div className="t-caption-strong c-mute mb-6">
          {ko ? '최근' : 'Recent'}
        </div>
        {[
          { tag: ko?'워크샵':'EVENT', tc: 'var(--grey-700)', bg: 'var(--grey-100)', title: ko?'12월 팀 워크샵 신청 안내':'December team workshop sign-up', sub: ko?'제주도 2박 3일 · 12/20 출발':'Jeju 3-day · Dec 20', date: ko?'11/08':'Nov 8', views: 98 },
          { tag: ko?'시스템':'SYSTEM', tc: 'var(--brand)', bg: 'var(--brand-soft)', title: ko?'출퇴근 앱 v2.1 업데이트':'App v2.1 update released', sub: ko?'위젯 기능 추가 · 성능 개선':'Widgets · Performance improved', date: ko?'11/05':'Nov 5', views: 87 },
          { tag: ko?'복지':'BENEFIT', tc: 'var(--success)', bg: 'var(--success-soft)', title: ko?'건강검진 신청 기간':'Health checkup sign-up period', sub: ko?'11/15까지 신청':'Sign up by Nov 15', date: ko?'11/01':'Nov 1', views: 64 },
          { tag: ko?'규정':'POLICY', tc: 'var(--warn)', bg: 'var(--warn-soft)', title: ko?'재택근무 규정 일부 개정':'WFH policy minor update', sub: ko?'주 3일까지 재택 가능':'Up to 3 days/week WFH', date: ko?'10/28':'Oct 28', views: 156 },
        ].map((n, i) => (
          <Card key={i} padding={14} className="mb-8">
            <div style={{
              display: 'inline-block', padding: '3px 8px',
              background: n.bg, color: n.tc,
              fontSize: 10, fontWeight: 700, borderRadius: 'var(--r-xs)',
              marginBottom: 8,
            }}>{n.tag}</div>
            <div className="t-body" style={{ fontWeight: 700, color: 'var(--grey-900)', marginBottom: 3 }}>{n.title}</div>
            <div className="t-body-sm mb-8">{n.sub}</div>
            <div className="t-caption row g-8">
              <span>{n.date}</span>
              <span>·</span>
              <span>{ko ? `조회 ${n.views}` : `${n.views} views`}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 근무 기록 상세
// ─────────────────────────────────────────
function MobRecordDetail() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  const tl = [
    { t: '09:02', label: ko?'출근':'Clock in', loc: ko?'재택':'WFH', color: 'var(--success)' },
    { t: '12:14', label: ko?'휴게 시작':'Break start', loc: ko?'점심':'Lunch', color: 'var(--warn)' },
    { t: '13:10', label: ko?'휴게 종료':'Break end', loc: ko?'재택':'WFH', color: 'var(--warn)' },
    { t: '18:00', label: ko?'정규 퇴근 예정':'Scheduled out', loc: '', color: 'var(--grey-400)', dash: true },
    { t: '19:24', label: ko?'퇴근':'Clock out', loc: ko?'초과근무 승인됨':'OT approved', color: 'var(--brand)' },
  ];
  return (
    <div className="hf-screen" style={{ background: 'var(--grey-50)' }}>
      <StatusBar />
      <div className="hf-appbar" style={{ background: 'var(--white)' }}>
        <Icon.chevL className="icon-24 c-primary"/>
        <h1 className="flex-1">{ko ? '11월 12일 (수)' : 'Nov 12 Wed'}</h1>
        <Icon.edit className="icon-20 c-body"/>
      </div>

      {/* Summary */}
      <div style={{ background: 'var(--white)', padding: '20px 20px 24px' }}>
        <div className="row-between mb-10">
          <span className="t-body-sm fw-600">{ko ? '총 근무' : 'Total work'}</span>
          <span style={{
            padding: '3px 8px',
            background: 'var(--success-soft)', color: 'var(--success)',
            fontSize: 12, fontWeight: 700, borderRadius: 'var(--r-xs)',
          }}>{ko ? '정상' : 'Normal'}</span>
        </div>
        <div className="t-number-lg c-primary">
          9<span className="fs-20 c-mute">h</span> 22<span className="fs-20 c-mute">m</span>
        </div>
        <div className="t-caption-strong c-brand mt-2">
          {ko ? '+ 1h 22m 초과근무 (승인됨)' : '+ 1h 22m overtime (approved)'}
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--grey-100)' }}>
          <StatRow items={[
            { label: ko?'출근':'In', value: '09:02' },
            { label: ko?'퇴근':'Out', value: '19:24' },
            { label: ko?'휴게':'Break', value: '56m' },
          ]}/>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: '18px 20px', flex: 1, overflow: 'auto' }}>
        <SectionTitle title={ko ? '타임라인' : 'Timeline'}/>
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{
            position: 'absolute', left: 7, top: 6, bottom: 6,
            width: 2, background: 'var(--grey-200)',
          }}/>
          {tl.map((e, i) => (
            <div key={i} style={{ marginBottom: 16, position: 'relative' }}>
              <div style={{
                position: 'absolute', left: -22, top: 2,
                width: 16, height: 16, borderRadius: 8,
                background: e.dash ? 'var(--white)' : e.color,
                border: e.dash ? '2px dashed ' + e.color : `2px solid ${e.color}`,
              }}/>
              <div className="row-baseline g-10">
                <div className="num" style={{
                  fontSize: 15, fontWeight: 700,
                  color: e.dash ? 'var(--grey-400)' : 'var(--grey-900)',
                }}>{e.t}</div>
                <div className="t-body-sm" style={{
                  fontWeight: 600,
                  color: e.dash ? 'var(--grey-400)' : 'var(--grey-700)',
                }}>{e.label}</div>
              </div>
              {e.loc && <div className="t-caption mt-2">{e.loc}</div>}
            </div>
          ))}
        </div>

        <Card padding={14} className="mt-20">
          <div className="t-caption-strong c-mute mb-4">
            {ko ? '메모' : 'Memo'}
          </div>
          <div className="t-body-sm c-body">
            {ko ? '클라이언트 피드백 반영, 디자인 리뷰 준비로 초과근무 승인' : 'OT approved for client feedback + design review prep'}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 에러 (GPS 실패)
// ─────────────────────────────────────────
function MobErrorGPS() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div className="hf-screen" style={{ background: 'var(--white)' }}>
      <StatusBar />
      <div className="hf-appbar">
        <Icon.close className="icon-24 c-primary"/>
      </div>
      <div style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{
          width: 96, height: 96, borderRadius: 48,
          background: 'var(--danger-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, position: 'relative',
        }}>
          <Icon.map className="icon-44 c-danger"/>
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 32, height: 32, borderRadius: 16,
            background: 'var(--danger)', color: 'var(--white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, border: '3px solid var(--white)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </div>
        </div>
        <h2 className="mb-6">
          {ko ? '위치를 확인할 수 없어요' : 'Can\'t detect location'}
        </h2>
        <div className="t-body" style={{ maxWidth: 260 }}>
          {ko ? '위치 권한을 허용했는지 확인해 주세요. 수동으로 재택/본사를 선택할 수도 있어요.' : 'Check location permissions. You can also manually select WFH/Office.'}
        </div>
      </div>
      <div style={{ padding: '0 24px 24px', display: 'grid', gap: 8 }}>
        <button className="hf-btn hf-btn-primary hf-btn-large hf-btn-block">{ko ? '다시 시도' : 'Try again'}</button>
        <button className="hf-btn hf-btn-secondary hf-btn-large hf-btn-block">{ko ? '수동으로 선택' : 'Select manually'}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 빈 상태
// ─────────────────────────────────────────
function MobEmpty() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div className="hf-screen" style={{ background: 'var(--white)' }}>
      <StatusBar />
      <div className="hf-appbar">
        <Icon.chevL className="icon-24 c-primary"/>
        <h1 className="flex-1">{ko ? '알림' : 'Notifications'}</h1>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ width: 120, height: 120, position: 'relative', marginBottom: 20 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 30, background: 'var(--grey-100)' }}/>
          <div style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 60, background: 'var(--white)', borderRadius: 14, boxShadow: 'var(--shadow-2)' }}/>
          <div style={{ position: 'absolute', top: 38, left: 40, right: 60, height: 4, borderRadius: 2, background: 'var(--grey-200)' }}/>
          <div style={{ position: 'absolute', top: 50, left: 40, right: 40, height: 4, borderRadius: 2, background: 'var(--grey-200)' }}/>
          <div style={{ position: 'absolute', bottom: 20, right: 20, width: 32, height: 32, borderRadius: 16, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.check className="icon-18 c-white"/>
          </div>
        </div>
        <h2 className="mb-6">{ko ? '모두 확인했어요' : 'All caught up'}</h2>
        <div className="t-body">{ko ? '새로운 알림이 오면 여기에 표시돼요' : 'New notifications will appear here'}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 온보딩 (첫 접속)
// ─────────────────────────────────────────
function MobOnboarding() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div className="hf-screen" style={{ background: 'var(--grey-50)' }}>
      <StatusBar />
      <div style={{ padding: '10px 20px 0', textAlign: 'right' }}>
        <span className="t-body-sm fw-600">{ko ? '건너뛰기' : 'Skip'}</span>
      </div>

      <div style={{ flex: 1, padding: '40px 24px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 260, position: 'relative', marginBottom: 32 }}>
          <div style={{ position: 'absolute', top: 40, left: 40, right: 80, bottom: 40, background: 'var(--white)', borderRadius: 18, boxShadow: '0 8px 24px rgba(49,130,246,0.12)', transform: 'rotate(-6deg)', border: '1px solid var(--grey-100)' }}/>
          <div style={{ position: 'absolute', top: 20, left: 60, right: 40, bottom: 60, background: 'var(--white)', borderRadius: 18, boxShadow: '0 8px 24px rgba(49,130,246,0.18)', transform: 'rotate(3deg)', border: '1px solid var(--grey-100)' }}/>
          <div style={{ position: 'absolute', top: 30, left: 50, right: 50, bottom: 30, background: 'var(--white)', borderRadius: 18, boxShadow: '0 12px 32px rgba(49,130,246,0.25)', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="t-caption-strong c-mute">{ko ? '오늘' : 'Today'}</div>
            <div className="num" style={{ fontSize: 28, fontWeight: 700, color: 'var(--grey-900)', letterSpacing: -0.5 }}>09:02</div>
            <div style={{ margin: '8px 0', height: 6, background: 'var(--grey-100)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: 'var(--brand)' }}/>
            </div>
            <div className="t-caption-strong c-success">
              {ko ? '근무 중 · 5h 23m' : 'Working · 5h 23m'}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 20, right: 10, width: 52, height: 52, borderRadius: 26, background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,196,113,0.4)' }}>
            <Icon.check style={{ width: 26, height: 26, color: 'var(--white)' }}/>
          </div>
        </div>

        <h1 style={{ textAlign: 'center', lineHeight: 1.25 }}>
          {ko ? <>출근이<br/><span className="c-brand">탭 한 번</span>으로 끝</> : <>Clock in with<br/><span className="c-brand">one tap</span></>}
        </h1>
        <div className="t-body" style={{ marginTop: 14, textAlign: 'center', padding: '0 10px' }}>
          {ko ? '위치 기반으로 재택/본사를 자동 감지해요' : 'Auto-detects WFH or office by location'}
        </div>

        <div className="row-center g-6 mt-32">
          {[true, false, false].map((on, i) => (
            <div key={i} style={{ width: on ? 24 : 7, height: 7, borderRadius: 4, background: on ? 'var(--brand)' : 'var(--grey-200)', transition: 'all 0.3s' }}/>
          ))}
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <button className="hf-btn hf-btn-primary hf-btn-large hf-btn-block">{ko ? '다음' : 'Next'}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 위치 선택 시트
// ─────────────────────────────────────────
function MobLocationPicker() {
  const { lang } = React.useContext(HiCtx);
  const ko = lang === 'ko';
  return (
    <div className="hf-screen" style={{ background: 'rgba(0,0,0,0.4)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--grey-100)', filter: 'blur(2px)', opacity: 0.5 }}/>
      <StatusBar />
      <div className="flex-1"/>
      <div style={{
        background: 'var(--white)',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 20px 24px', position: 'relative',
      }}>
        <SheetHandle/>
        <h2 className="mb-4">
          {ko ? '근무지를 선택해 주세요' : 'Choose your location'}
        </h2>
        <div className="t-body-sm mb-20">
          {ko ? '자동 감지와 다르다면 직접 바꿀 수 있어요' : 'You can override auto-detection manually'}
        </div>

        {[
          { k: 'office',  l: ko?'본사':'Office',   sub: ko?'강남 11층':'Gangnam 11F',         on: true,  c: 'var(--success)', dist: '0.2km' },
          { k: 'home',    l: ko?'재택':'WFH',      sub: ko?'등록된 재택 주소':'Registered WFH', on: false, c: 'var(--brand)',   dist: '12.4km' },
          { k: 'outside', l: ko?'외근':'Outside',  sub: ko?'현재 위치 기록':'Records current location', on: false, c: 'var(--warn)', dist: '' },
        ].map((o, i) => (
          <div key={i} style={{
            padding: 16, marginBottom: 8,
            background: o.on ? 'var(--brand-soft)' : 'var(--white)',
            border: `1.5px solid ${o.on ? 'var(--brand)' : 'var(--grey-200)'}`,
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--r-sm)',
              background: o.c + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {o.k === 'office' ? <Icon.building style={{ width: 20, height: 20, color: o.c }}/> :
               o.k === 'home' ? <Icon.house style={{ width: 20, height: 20, color: o.c }}/> :
               <Icon.map style={{ width: 20, height: 20, color: o.c }}/>}
            </div>
            <div className="flex-1">
              <div className="t-body fw-700 c-primary">{o.l}</div>
              <div className="t-caption" style={{ marginTop: 1 }}>{o.sub} {o.dist && <span>· {o.dist}</span>}</div>
            </div>
            {o.on && (
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                background: 'var(--brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.check className="icon-14 c-white"/>
              </div>
            )}
          </div>
        ))}

        <button className="hf-btn hf-btn-primary hf-btn-large hf-btn-block mt-16">
          {ko ? '확인' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  MobSignup, MobForgot, MobNotifications, MobNotice,
  MobRecordDetail, MobErrorGPS, MobEmpty, MobOnboarding, MobLocationPicker,
});
