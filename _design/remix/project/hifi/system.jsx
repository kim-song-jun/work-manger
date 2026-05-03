// System showcase — DESIGN.md §§ 2-6, 14-15 기반
// 토큰/컴포넌트/상태/모션을 한 화면에 시각화

function SysColors() {
  const shades = [50,100,200,300,400,500,600,700,800,900];
  return (
    <div style={{ padding: 28, background: '#fff', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg" style={{ marginBottom: 4 }}>컬러</div>
      <div className="t-body" style={{ color: 'var(--grey-600)', marginBottom: 24 }}>
        OKLCH 기반 · 같은 스케일 숫자는 같은 시각 무게를 가져요.
      </div>

      {/* Primary */}
      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>PRIMARY · 인터랙티브</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 24 }}>
        {[['blue-50','var(--brand-soft)','500 밑 배경'],['blue-500','var(--brand)','기본'],['blue-600','#2272EB','hover'],['grey-900','var(--grey-900)','dark 대안'],['white','#FFFFFF','surface'],['grey-100','var(--grey-100)','surface 2']].map(([n, c, use]) => (
          <div key={n}>
            <div style={{ width: '100%', aspectRatio: '1.2', borderRadius: 10, background: c, border: c === '#FFFFFF' ? '1px solid var(--grey-200)' : 'none' }} />
            <div className="t-caption-strong" style={{ marginTop: 6 }}>{n}</div>
            <div className="t-caption num" style={{ color: 'var(--grey-500)' }}>{c}</div>
            <div className="t-caption" style={{ color: 'var(--grey-600)', fontSize: 11 }}>{use}</div>
          </div>
        ))}
      </div>

      {/* Semantic */}
      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SEMANTIC</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 24 }}>
        {[
          ['success','#03B26C','본사 · 승인됨'],
          ['warn','#FE9800','연차 · 대기'],
          ['caution','#FFC342','주의'],
          ['danger','var(--danger)','삭제 · 에러'],
          ['info','#18A5A5','안내'],
          ['purple','#A234C7','프리미엄'],
        ].map(([n, c, use]) => (
          <div key={n}>
            <div style={{ width: '100%', aspectRatio: '1.2', borderRadius: 10, background: c }} />
            <div className="t-caption-strong" style={{ marginTop: 6 }}>{n}</div>
            <div className="t-caption num" style={{ color: 'var(--grey-500)' }}>{c}</div>
            <div className="t-caption" style={{ color: 'var(--grey-600)', fontSize: 11 }}>{use}</div>
          </div>
        ))}
      </div>

      {/* Grey scale */}
      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>NEUTRAL (warm undertone)</div>
      <div style={{ display: 'flex', gap: 2, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
        {shades.map((s) => (
          <div key={s} style={{ flex: 1, height: 72, background: `var(--grey-${s})`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 6, color: s >= 500 ? '#fff' : 'var(--grey-900)', fontSize: 10, fontWeight: 600 }}>{s}</div>
        ))}
      </div>
      <div className="t-caption" style={{ color: 'var(--grey-500)' }}>
        grey-900 #191F28 (제목) → grey-600 #6B7684 (본문) → grey-500 #8B95A1 (캡션) → grey-400 #B0B8C1 (플레이스홀더)
      </div>
    </div>
  );
}

function SysType() {
  return (
    <div style={{ padding: 28, background: '#fff', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg" style={{ marginBottom: 4 }}>타이포그래피</div>
      <div className="t-body" style={{ color: 'var(--grey-600)', marginBottom: 24 }}>
        Toss Product Sans · 400 (body), 600 (emphasis), 700 (heading) 세 가지만.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[
          ['Display Hero / 30 · 700', 't-display-hero', '오늘도 기록해볼까요?'],
          ['Display Large / 26 · 700', 't-display-lg', '잔여 연차 11일'],
          ['Heading Large / 22 · 700', 't-heading-lg', '승인 대기 4건'],
          ['Heading / 20 · 600', 't-heading', '오늘 근무'],
          ['Subtitle / 16 · 600', 't-subtitle', '박민지 PM에게 신청하기'],
          ['Body Large / 16 · 400', 't-body-lg', '회사에서 받은 이메일로 로그인해주세요.'],
          ['Body / 14 · 400', 't-body', '정규 시간 18:00 지났어요. 지금 퇴근하시거나, 초과근무로 기록할 수 있어요.'],
          ['Body Small / 13 · 400', 't-body-sm', '강남 오피스 · Wi-Fi로 자동 감지됨'],
          ['Caption / 12 · 400', 't-caption', '© 2026 Company Inc. · v2.4.0'],
        ].map(([lbl, cls, s]) => (
          <div key={lbl} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'baseline', paddingBottom: 14, borderBottom: '1px solid var(--grey-100)' }}>
            <div className="t-caption-strong" style={{ color: 'var(--grey-500)' }}>{lbl}</div>
            <div className={cls}>{s}</div>
          </div>
        ))}
      </div>

      <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '28px 0 8px' }}>숫자 · TABULAR + 700</div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
        <div>
          <div className="t-caption" style={{ color: 'var(--grey-500)' }}>Number XL / 40</div>
          <div className="t-number-xl">11일</div>
        </div>
        <div>
          <div className="t-caption" style={{ color: 'var(--grey-500)' }}>Number LG / 30</div>
          <div className="t-number-lg">7h 42m</div>
        </div>
        <div>
          <div className="t-caption" style={{ color: 'var(--grey-500)' }}>Number MD / 22</div>
          <div className="t-number-md">09:00</div>
        </div>
      </div>
    </div>
  );
}

function SysComponents() {
  const [on, setOn] = React.useState(true);
  return (
    <div style={{ padding: 28, background: '#fff', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg" style={{ marginBottom: 4 }}>컴포넌트</div>
      <div className="t-body" style={{ color: 'var(--grey-600)', marginBottom: 24 }}>
        버튼 · 인풋 · 칩 · 스위치 · 프로그레스 등 기본 블록.
      </div>

      {/* Buttons: variant x size */}
      <div className="t-subtitle" style={{ marginBottom: 12 }}>버튼 · Variant</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button className="hf-btn hf-btn-primary hf-btn-big">Primary · Big</button>
        <button className="hf-btn hf-btn-weak hf-btn-big">Weak</button>
        <button className="hf-btn hf-btn-dark hf-btn-big">Dark</button>
        <button className="hf-btn hf-btn-danger hf-btn-big">Danger</button>
        <button className="hf-btn hf-btn-secondary hf-btn-big">Secondary</button>
        <button className="hf-btn hf-btn-ghost hf-btn-big">Ghost</button>
      </div>

      <div className="t-subtitle" style={{ marginBottom: 12 }}>버튼 · Size</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
        <button className="hf-btn hf-btn-primary hf-btn-tiny">Tiny 32</button>
        <button className="hf-btn hf-btn-primary hf-btn-medium">Medium 40</button>
        <button className="hf-btn hf-btn-primary hf-btn-large">Large 48</button>
        <button className="hf-btn hf-btn-primary hf-btn-big">Big 56</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <div className="t-subtitle" style={{ marginBottom: 12 }}>Input · Box</div>
          <input className="hf-input" placeholder="jiwoo@company.co.kr" />
          <div style={{ height: 8 }} />
          <input className="hf-input error" defaultValue="wrong@" />
          <div className="hf-field-error">회사 이메일이 아니에요. 도메인을 확인해주세요.</div>
        </div>
        <div>
          <div className="t-subtitle" style={{ marginBottom: 12 }}>Input · Underline</div>
          <input className="hf-input-line" placeholder="이름을 입력하세요" />
          <div style={{ height: 12 }} />
          <input className="hf-input-line" defaultValue="김지우" />
        </div>
      </div>

      <div className="t-subtitle" style={{ marginBottom: 12 }}>Chip · Status Dot</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <span className="hf-chip">기본</span>
        <span className="hf-chip brand">인터랙티브</span>
        <span className="hf-chip success">승인됨</span>
        <span className="hf-chip warn">대기</span>
        <span className="hf-chip caution">주의</span>
        <span className="hf-chip danger">반려</span>
        <span className="hf-chip info">안내</span>
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
        {[['office','본사'],['wfh','재택'],['break','휴게'],['leave','연차'],['off','퇴근']].map(([s,l]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`hf-dot ${s}`} style={{ width: 10, height: 10 }} />
            <span className="t-body-sm">{l}</span>
          </div>
        ))}
      </div>

      <div className="t-subtitle" style={{ marginBottom: 12 }}>Switch · Progress</div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div className={`hf-switch ${on ? 'on' : ''}`} onClick={() => setOn(!on)} />
        <div style={{ flex: 1 }}>
          <div className="hf-progress"><span style={{ width: '73%' }} /></div>
          <div className="t-caption" style={{ marginTop: 6, color: 'var(--grey-500)' }}>11 / 15일</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="hf-progress success"><span style={{ width: '92%' }} /></div>
          <div className="t-caption" style={{ marginTop: 6, color: 'var(--grey-500)' }}>근속 92%</div>
        </div>
      </div>
    </div>
  );
}

function SysStates() {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setInterval(() => setLoading((v) => !v), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ padding: 28, background: '#fff', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg" style={{ marginBottom: 4 }}>상태</div>
      <div className="t-body" style={{ color: 'var(--grey-600)', marginBottom: 24 }}>
        Empty · Loading · Error · Success — 모든 화면에서 일관되게.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Empty */}
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="t-caption-strong" style={{ color: 'var(--grey-700)' }}>EMPTY</div>
            <div className="t-caption" style={{ color: 'var(--grey-500)' }}>첫 사용 · 한 줄 설명 + 약한 CTA</div>
          </div>
          <EmptyState
            title="아직 신청한 연차가 없어요."
            action="연차 신청하기"
            icon={<Icon.calendar style={{ width: 22, height: 22 }} />}
          />
        </div>

        {/* Loading */}
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="t-caption-strong" style={{ color: 'var(--grey-700)' }}>LOADING · SKELETON</div>
            <div className="t-caption num" style={{ color: 'var(--grey-500)' }}>{loading ? 'loading...' : 'ready'}</div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <>
                <Skeleton w="60%" h={14} />
                <Skeleton w="40%" h={30} />
                <Skeleton w="100%" h={16} />
                <Skeleton w="80%" h={16} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Skeleton w={80} h={36} r={8} />
                  <Skeleton w={80} h={36} r={8} />
                </div>
              </>
            ) : (
              <>
                <div className="t-caption-strong" style={{ color: 'var(--grey-500)' }}>오늘 근무</div>
                <div className="t-number-lg">7h 42m</div>
                <div className="t-body-sm">출근 08:54 · 퇴근 16:36</div>
                <div className="t-body-sm">정규 09:00–18:00</div>
              </>
            )}
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--grey-100)' }}>
            <div className="t-caption" style={{ color: 'var(--grey-500)' }}>금액/시간은 skeleton 대신 <b>—</b>로 표시</div>
          </div>
        </div>

        {/* Error */}
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--grey-100)' }}>
            <div className="t-caption-strong" style={{ color: 'var(--grey-700)' }}>ERROR · INLINE</div>
          </div>
          <div style={{ padding: 20 }}>
            <label className="hf-field-label">회사 이메일</label>
            <input className="hf-input error" defaultValue="jiwoo@gmail.com" />
            <div className="hf-field-error">회사 이메일이 아니에요. @company.co.kr 형식이에요.</div>
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--grey-100)' }}>
            <div className="t-caption" style={{ color: 'var(--grey-500)' }}>Blameless + specific + actionable</div>
          </div>
        </div>

        {/* Toast / Flash */}
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--grey-100)' }}>
            <div className="t-caption-strong" style={{ color: 'var(--grey-700)' }}>TOAST · ERROR</div>
          </div>
          <div style={{ padding: 40, position: 'relative', background: 'var(--grey-50)', minHeight: 120 }}>
            <div style={{
              position: 'absolute', left: 20, right: 20, bottom: 20,
              background: 'var(--grey-900)', color: '#fff',
              padding: '14px 16px', borderRadius: 12, fontSize: 14,
              boxShadow: 'var(--shadow-3)',
            }}>GPS를 잠시 읽지 못했어요. Wi-Fi로 대신 확인해드릴게요.</div>
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--grey-100)' }}>
            <div className="t-caption" style={{ color: 'var(--grey-500)' }}>한 문장 · 아이콘 없음 · 3초 자동 사라짐</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SysMotion() {
  const [key, setKey] = React.useState(0);
  return (
    <div style={{ padding: 28, background: '#fff', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg" style={{ marginBottom: 4 }}>모션</div>
      <div className="t-body" style={{ color: 'var(--grey-600)', marginBottom: 24 }}>
        Duration × Easing · spring은 성공 확인에만.
      </div>

      {/* Duration table */}
      <div className="t-subtitle" style={{ marginBottom: 12 }}>Duration 토큰</div>
      <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        {[
          ['motion-instant', '0ms', '토글 플립'],
          ['motion-fast', '150ms', 'Hover · Press'],
          ['motion-standard', '250ms', '시트 · 탭 · 카드 (기본)'],
          ['motion-slow', '400ms', '성공 체크마크'],
          ['motion-page', '350ms', '페이지 전환'],
        ].map(([n, v, use]) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '200px 80px 1fr', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--grey-100)' }}>
            <div className="t-body-strong">{n}</div>
            <div className="t-body num" style={{ color: 'var(--grey-600)' }}>{v}</div>
            <div className="t-body-sm" style={{ color: 'var(--grey-600)' }}>{use}</div>
          </div>
        ))}
      </div>

      {/* Easing */}
      <div className="t-subtitle" style={{ marginBottom: 12 }}>Easing</div>
      <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        {[
          ['ease-enter', '(0, 0, 0.2, 1)', '나타나기'],
          ['ease-exit', '(0.4, 0, 1, 1)', '사라지기'],
          ['ease-standard', '(0.4, 0, 0.2, 1)', '양방향'],
          ['ease-spring', '(0.34, 1.56, 0.64, 1)', '한 번만 — 성공 체크'],
        ].map(([n, v, use]) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '200px 200px 1fr', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--grey-100)' }}>
            <div className="t-body-strong">{n}</div>
            <div className="t-body-sm num" style={{ color: 'var(--grey-600)' }}>{v}</div>
            <div className="t-body-sm" style={{ color: 'var(--grey-600)' }}>{use}</div>
          </div>
        ))}
      </div>

      {/* Signature motions demo */}
      <div className="t-subtitle" style={{ marginBottom: 12 }}>Signature</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--grey-50)', borderRadius: 12, padding: 20, textAlign: 'center', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          <div key={key + 'n'} className="anim-num-in t-number-lg">7h 42m</div>
          <div className="t-caption" style={{ color: 'var(--grey-500)' }}>Number — in 20px up (standard · enter)</div>
        </div>
        <div style={{ background: 'var(--grey-50)', borderRadius: 12, padding: 20, textAlign: 'center', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          <div key={key + 'c'} style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--success-soft)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className="anim-check" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <div className="t-caption" style={{ color: 'var(--grey-500)' }}>Check — slow · spring</div>
        </div>
        <div style={{ background: 'var(--grey-50)', borderRadius: 12, padding: 20, textAlign: 'center', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, position: 'relative', overflow: 'hidden' }}>
          <div key={key + 's'} className="anim-sheet" style={{ background: '#fff', padding: '16px', borderRadius: 12, boxShadow: 'var(--shadow-3)', marginTop: 'auto' }}>
            <div style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--grey-300)', margin: '0 auto 10px' }} />
            <div className="t-body-strong">초과근무 요청</div>
          </div>
          <div className="t-caption" style={{ color: 'var(--grey-500)' }}>Sheet — 40px up · standard · enter</div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="hf-btn hf-btn-weak hf-btn-medium" onClick={() => setKey((k) => k + 1)}>애니메이션 다시 보기</button>
      </div>
    </div>
  );
}

function SysPrinciples() {
  return (
    <div style={{ padding: 28, background: '#fff', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      <div className="t-display-lg" style={{ marginBottom: 4 }}>원칙</div>
      <div className="t-body" style={{ color: 'var(--grey-600)', marginBottom: 24 }}>
        Toss 디자인 철학 · 이 프로젝트에 그대로 적용돼요.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          ['시간에 여백을', '시간·연차 숫자는 일반 텍스트보다 1.5배 여유를 줘요. 공간이 신뢰를 만들어요.'],
          ['점진적 밀도', '요약은 넓게, 상세는 촘촘하게. 깊이 들어갈수록 정보 밀도가 높아져요.'],
          ['한 화면, 한 행동', 'Primary 버튼은 화면당 하나. 두 개가 필요하면 두 화면으로 나눠요.'],
          ['블루는 인터랙션만', '#3182F6은 탭할 수 있는 곳에만. 장식으로는 절대 쓰지 않아요.'],
          ['절제가 곧 신뢰', '그림자는 단일 레이어 검정, 낮은 투명도. 화려함은 비용이에요.'],
          ['한글과 영문은 동급', '두 스크립트 모두를 1급 시민으로 대우해요. Fallback 스택도 둘 다 고려.'],
          ['숫자는 타이포그래피', '금액·시간은 700 + tabular. 본문 굵기와 섞지 않아요.'],
          ['여백은 자산', '더 담는 대신 다음 화면으로 나눠요.'],
        ].map(([t, d], i) => (
          <div key={i} style={{ border: '1px solid var(--grey-200)', borderRadius: 12, padding: 20 }}>
            <div className="t-caption-strong" style={{ color: 'var(--brand)', marginBottom: 6 }}>0{i+1}</div>
            <div className="t-subtitle" style={{ marginBottom: 6 }}>{t}</div>
            <div className="t-body" style={{ color: 'var(--grey-600)' }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SysColors, SysType, SysComponents, SysStates, SysMotion, SysPrinciples });
