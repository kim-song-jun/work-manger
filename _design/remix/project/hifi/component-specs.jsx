// Detailed component spec pages — per-component, dev-ready
// Each page: header → variants matrix → states → sizes → anatomy → props table → code → a11y

// ─── Reusable spec atoms ────────────────────────────────────────

function SpecHeader({ name, role, summary }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--grey-100)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
        <div className="t-display-lg">{name}</div>
        <div className="t-caption-strong" style={{ color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{role}</div>
      </div>
      <div className="t-body" style={{ color: 'var(--grey-600)', maxWidth: 720 }}>{summary}</div>
    </div>
  );
}

function SpecSection({ title, hint, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
        <div className="t-caption-strong" style={{ color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
        {hint && <div className="t-caption" style={{ color: 'var(--grey-500)' }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function SpecGrid({ cols = 3, children, gap = 12 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>{children}</div>;
}

function SpecCell({ label, sub, children, bg = '#fff' }) {
  return (
    <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
        <div className="t-caption-strong" style={{ color: 'var(--grey-700)' }}>{label}</div>
        {sub && <div className="t-caption num" style={{ color: 'var(--grey-500)' }}>{sub}</div>}
      </div>
      <div style={{ padding: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 72 }}>{children}</div>
    </div>
  );
}

function PropsTable({ rows }) {
  return (
    <div style={{ border: '1px solid var(--grey-200)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '160px 200px 100px 1fr', padding: '10px 14px', background: 'var(--grey-50)', borderBottom: '1px solid var(--grey-200)' }}>
        {['Prop','Type','Default','Description'].map((h) => (
          <div key={h} className="t-caption-strong" style={{ color: 'var(--grey-700)' }}>{h}</div>
        ))}
      </div>
      {rows.map(([p, t, d, desc], i) => (
        <div key={p} style={{ display: 'grid', gridTemplateColumns: '160px 200px 100px 1fr', padding: '10px 14px', borderBottom: i < rows.length - 1 ? '1px solid var(--grey-100)' : 'none', alignItems: 'baseline' }}>
          <div className="t-body-sm" style={{ fontFamily: 'JetBrains Mono, Menlo, monospace', color: 'var(--grey-900)', fontWeight: 600 }}>{p}</div>
          <div className="t-body-sm" style={{ fontFamily: 'JetBrains Mono, Menlo, monospace', color: 'var(--brand)', fontSize: 12 }}>{t}</div>
          <div className="t-body-sm num" style={{ fontFamily: 'JetBrains Mono, Menlo, monospace', color: 'var(--grey-500)', fontSize: 12 }}>{d || '—'}</div>
          <div className="t-body-sm" style={{ color: 'var(--grey-700)' }}>{desc}</div>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ code, lang = 'jsx' }) {
  return (
    <pre style={{
      background: '#0F1419', color: '#E8EAED', padding: 16, borderRadius: 10,
      fontSize: 12, lineHeight: 1.7, fontFamily: 'JetBrains Mono, Menlo, monospace',
      overflow: 'auto', margin: 0,
    }}>
      <div className="t-caption" style={{ color: '#6B7684', marginBottom: 8 }}>{lang}</div>
      <code>{code}</code>
    </pre>
  );
}

function A11yChecklist({ items }) {
  return (
    <div style={{ background: 'var(--grey-50)', borderRadius: 10, padding: 16 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < items.length - 1 ? 8 : 0, alignItems: 'flex-start' }}>
          <Icon.check style={{ width: 14, height: 14, color: 'var(--success)', flexShrink: 0, marginTop: 3 }} />
          <div className="t-body-sm" style={{ color: 'var(--grey-700)' }}>{it}</div>
        </div>
      ))}
    </div>
  );
}

function SpecPage({ children }) {
  return (
    <div style={{ padding: 28, background: '#fff', height: '100%', overflow: 'auto', fontFamily: 'var(--font-kr)' }}>
      {children}
    </div>
  );
}

// ─── 1. Button ──────────────────────────────────────────────────

function SpecButton() {
  return (
    <SpecPage>
      <SpecHeader
        name="Button"
        role="ACTION"
        summary="화면당 Primary 1개 원칙. 56(Big) → 48(Large) → 40(Medium) → 32(Tiny). 로딩 중에는 스피너로 라벨을 가리고 width 고정."
      />

      <SpecSection title="Variants × Size">
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', background: 'var(--grey-50)' }}>
            {['','Tiny 32','Medium 40','Large 48','Big 56'].map((h) => (
              <div key={h} className="t-caption-strong" style={{ padding: '10px 14px', color: 'var(--grey-700)', borderBottom: '1px solid var(--grey-200)' }}>{h}</div>
            ))}
          </div>
          {[
            ['Primary', 'hf-btn-primary', '인터랙티브 #3182F6'],
            ['Weak', 'hf-btn-weak', '브랜드 soft 배경'],
            ['Dark', 'hf-btn-dark', '강조 #191F28'],
            ['Secondary', 'hf-btn-secondary', '회색 외곽선'],
            ['Ghost', 'hf-btn-ghost', '배경 없음'],
            ['Danger', 'hf-btn-danger', '#F04452 — 삭제만'],
          ].map(([label, cls, hint]) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'center', borderBottom: '1px solid var(--grey-100)' }}>
              <div style={{ padding: '12px 14px' }}>
                <div className="t-body-strong">{label}</div>
                <div className="t-caption" style={{ color: 'var(--grey-500)' }}>{hint}</div>
              </div>
              {['hf-btn-tiny','hf-btn-medium','hf-btn-large','hf-btn-big'].map((sz) => (
                <div key={sz} style={{ padding: 14, display: 'flex', alignItems: 'center' }}>
                  <button className={`hf-btn ${cls} ${sz}`}>버튼</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </SpecSection>

      <SpecSection title="States" hint="default · hover · pressed · disabled · loading">
        <SpecGrid cols={5}>
          <SpecCell label="Default"><button className="hf-btn hf-btn-primary hf-btn-medium">출근하기</button></SpecCell>
          <SpecCell label="Hover" sub="bg → 600"><button className="hf-btn hf-btn-primary hf-btn-medium" style={{ background: 'var(--blue-600)' }}>출근하기</button></SpecCell>
          <SpecCell label="Pressed" sub="scale 0.98"><button className="hf-btn hf-btn-primary hf-btn-medium" style={{ transform: 'scale(0.98)', background: 'var(--blue-700)' }}>출근하기</button></SpecCell>
          <SpecCell label="Disabled" sub="opacity 0.4"><button className="hf-btn hf-btn-primary hf-btn-medium" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>출근하기</button></SpecCell>
          <SpecCell label="Loading">
            <button className="hf-btn hf-btn-primary hf-btn-medium" style={{ pointerEvents: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 800ms linear infinite' }}>
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none"/>
                <path d="M14 8a6 6 0 0 0-6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </button>
          </SpecCell>
        </SpecGrid>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </SpecSection>

      <SpecSection title="Anatomy">
        <div style={{ background: 'var(--grey-50)', padding: 28, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <button className="hf-btn hf-btn-primary hf-btn-large" style={{ minWidth: 200 }}>
              <Icon.check style={{ width: 16, height: 16, marginRight: 6 }} />
              <span>출근하기</span>
            </button>
            {/* annotations */}
            <div style={{ position: 'absolute', top: -32, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--grey-500)' }}>
              <span>↕ 48px</span>
            </div>
            <div style={{ position: 'absolute', bottom: -28, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--grey-500)' }}>
              padding 14·20 · gap 6 · radius 12 · weight 700
            </div>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Props">
        <PropsTable rows={[
          ['variant', '"primary" | "weak" | "dark" | "secondary" | "ghost" | "danger"', 'primary', '시각적 강조도. Primary는 화면당 1개.'],
          ['size', '"tiny" | "medium" | "large" | "big"', 'medium', 'tiny=32, medium=40, large=48, big=56'],
          ['leftIcon', 'ReactNode', '—', '라벨 좌측 아이콘. gap 6px'],
          ['rightIcon', 'ReactNode', '—', '라벨 우측 아이콘 (예: Chevron)'],
          ['loading', 'boolean', 'false', 'true면 라벨 숨기고 스피너만. width 고정.'],
          ['disabled', 'boolean', 'false', 'opacity 0.4 + pointer-events none'],
          ['fullWidth', 'boolean', 'false', '컨테이너 100% 너비'],
          ['onClick', '(e) => void', '—', '클릭 핸들러'],
        ]}/>
      </SpecSection>

      <SpecSection title="Code">
        <CodeBlock code={`<Button variant="primary" size="large" leftIcon={<CheckIcon/>}>
  출근하기
</Button>

<Button variant="danger" loading={isDeleting}>
  삭제
</Button>`}/>
      </SpecSection>

      <SpecSection title="접근성">
        <A11yChecklist items={[
          'min-height 44px (WCAG 2.5.5 Target Size)',
          'focus-visible 시 2px outline (var(--brand))',
          'disabled에는 aria-disabled="true" 사용',
          'loading 중 aria-busy="true" + 라벨은 sr-only로 유지',
          '아이콘만 있는 버튼은 반드시 aria-label 제공',
        ]}/>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 2. Input ──────────────────────────────────────────────────

function SpecInput() {
  return (
    <SpecPage>
      <SpecHeader
        name="Input"
        role="FORM"
        summary="Box(기본) + Underline(미니멀) 두 종. 상태별 border 컬러로 구분 — default → focus → error → disabled."
      />

      <SpecSection title="Variants">
        <SpecGrid cols={2}>
          <SpecCell label="Box" sub="default">
            <input className="hf-input" placeholder="이메일 입력" style={{ width: '100%' }} />
          </SpecCell>
          <SpecCell label="Underline" sub="line">
            <input className="hf-input-line" placeholder="이름" style={{ width: '100%' }} />
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="States">
        <SpecGrid cols={5}>
          <SpecCell label="Empty"><input className="hf-input" placeholder="placeholder" style={{ width: '100%' }} /></SpecCell>
          <SpecCell label="Filled"><input className="hf-input" defaultValue="김지우" style={{ width: '100%' }} /></SpecCell>
          <SpecCell label="Focus" sub="border brand"><input className="hf-input" defaultValue="김지우" style={{ width: '100%', borderColor: 'var(--brand)', boxShadow: '0 0 0 3px var(--brand-soft)' }} /></SpecCell>
          <SpecCell label="Error"><input className="hf-input error" defaultValue="wrong@" style={{ width: '100%' }} /></SpecCell>
          <SpecCell label="Disabled"><input className="hf-input" disabled defaultValue="잠김" style={{ width: '100%', opacity: 0.5, background: 'var(--grey-50)' }} /></SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Field 조립" hint="label + input + helper/error">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="hf-field-label">회사 이메일</label>
            <input className="hf-input" placeholder="jiwoo@company.co.kr" />
            <div className="t-caption" style={{ color: 'var(--grey-500)', marginTop: 6 }}>로그인 시 사용할 회사 이메일이에요.</div>
          </div>
          <div>
            <label className="hf-field-label">회사 이메일</label>
            <input className="hf-input error" defaultValue="jiwoo@gmail.com" />
            <div className="hf-field-error">회사 이메일이 아니에요. @company.co.kr 형식이에요.</div>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="With Adornments">
        <SpecGrid cols={3}>
          <SpecCell label="Left icon">
            <div style={{ position: 'relative', width: '100%' }}>
              <Icon.search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--grey-500)' }} />
              <input className="hf-input" placeholder="검색" style={{ width: '100%', paddingLeft: 36 }} />
            </div>
          </SpecCell>
          <SpecCell label="Right action">
            <div style={{ position: 'relative', width: '100%' }}>
              <input className="hf-input" defaultValue="회의실 A" style={{ width: '100%', paddingRight: 36 }} />
              <Icon.close style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--grey-500)', cursor: 'pointer' }} />
            </div>
          </SpecCell>
          <SpecCell label="Suffix unit">
            <div style={{ position: 'relative', width: '100%' }}>
              <input className="hf-input" defaultValue="1.5" style={{ width: '100%', paddingRight: 44 }} />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--grey-500)' }}>시간</span>
            </div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Props">
        <PropsTable rows={[
          ['variant', '"box" | "line"', 'box', 'Box: 외곽선 + 라운드 / Line: 하단 라인'],
          ['size', '"sm" | "md" | "lg"', 'md', '40 / 48 / 56 높이'],
          ['state', '"default" | "error" | "success"', 'default', 'border와 helper 컬러 자동 매핑'],
          ['label', 'string', '—', '필드 라벨. label htmlFor 자동 연결'],
          ['helper', 'string | ReactNode', '—', '하단 안내 메시지'],
          ['error', 'string', '—', 'error 상태일 때만 표시'],
          ['leftIcon, rightIcon', 'ReactNode', '—', 'inset 아이콘'],
          ['suffix', 'string', '—', '단위 (분, 시간, 원 등)'],
          ['disabled', 'boolean', 'false', 'opacity 0.5 + bg grey-50'],
        ]}/>
      </SpecSection>

      <SpecSection title="Code">
        <CodeBlock code={`<Field label="회사 이메일" error={emailError}>
  <Input
    type="email"
    placeholder="jiwoo@company.co.kr"
    leftIcon={<MailIcon/>}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</Field>`}/>
      </SpecSection>

      <SpecSection title="접근성">
        <A11yChecklist items={[
          'label과 input은 htmlFor / id로 연결',
          'error 상태에는 aria-invalid="true" + aria-describedby로 메시지 연결',
          'placeholder를 라벨 대용으로 쓰지 않기',
          '터치 타깃 최소 44px 보장 (size sm은 라벨 영역 포함)',
        ]}/>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 3. Chip / Badge ──────────────────────────────────────────────

function SpecChip() {
  const variants = [
    ['default', '기본', '#F2F4F6', '#4E5968'],
    ['brand', '인터랙티브', 'var(--brand-soft)', 'var(--brand)'],
    ['success', '본사 · 승인됨', 'var(--success-soft)', 'var(--success)'],
    ['warn', '연차 · 대기', 'var(--warn-soft)', '#C57700'],
    ['caution', '주의', 'var(--caution-soft)', '#946100'],
    ['danger', '반려 · 삭제', 'var(--danger-soft)', 'var(--danger)'],
    ['info', '안내', 'var(--info-soft)', 'var(--info)'],
  ];
  return (
    <SpecPage>
      <SpecHeader
        name="Chip · Badge"
        role="STATUS"
        summary="상태 · 카테고리 · 메타 정보. height 26px (compact) / 32px (default). 의미는 컬러 토큰으로만 구분."
      />

      <SpecSection title="Semantic variants">
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12, overflow: 'hidden' }}>
          {variants.map(([k, use, bg, fg]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 200px 1fr 220px', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--grey-100)' }}>
              <div className="t-body-strong" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{k}</div>
              <span style={{ background: bg, color: fg, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, justifySelf: 'start' }}>{use}</span>
              <div className="t-body-sm" style={{ color: 'var(--grey-600)' }}>{use}</div>
              <div className="t-caption num" style={{ color: 'var(--grey-500)', textAlign: 'right' }}>bg {bg.length > 16 ? bg.slice(0, 16) + '…' : bg}</div>
            </div>
          ))}
        </div>
      </SpecSection>

      <SpecSection title="Sizes & Variants">
        <SpecGrid cols={4}>
          <SpecCell label="Compact"><span className="hf-chip" style={{ fontSize: 11, padding: '2px 8px' }}>대기</span></SpecCell>
          <SpecCell label="Default"><span className="hf-chip">대기</span></SpecCell>
          <SpecCell label="With dot"><span className="hf-chip success" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--success)' }}/>본사</span></SpecCell>
          <SpecCell label="Removable"><span className="hf-chip brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>디자인팀<Icon.close style={{ width: 12, height: 12, cursor: 'pointer' }} /></span></SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Status Dot" hint="아바타 · 리스트 옆 상태 표시">
        <div style={{ display: 'flex', gap: 28, padding: 24, background: 'var(--grey-50)', borderRadius: 12 }}>
          {[['office','본사','var(--success)'],['wfh','재택','var(--brand)'],['leave','연차','var(--warn)'],['break','휴게','var(--caution)'],['off','오프','var(--grey-400)']].map(([k, l, c]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: c, boxShadow: '0 0 0 2px #fff, 0 0 0 3px ' + c + '40' }}/>
              <div className="t-caption-strong">{l}</div>
              <div className="t-caption num" style={{ color: 'var(--grey-500)', fontSize: 10 }}>{k}</div>
            </div>
          ))}
        </div>
      </SpecSection>

      <SpecSection title="Props">
        <PropsTable rows={[
          ['variant', '"default" | "brand" | "success" | "warn" | "danger" | "info"', 'default', '의미별 컬러'],
          ['size', '"compact" | "default"', 'default', '26 / 32 높이'],
          ['dot', 'boolean', 'false', '좌측 상태 점'],
          ['onRemove', '() => void', '—', '있으면 우측 X 버튼 표시'],
        ]}/>
      </SpecSection>

      <SpecSection title="Code">
        <CodeBlock code={`<Chip variant="success" dot>본사</Chip>
<Chip variant="brand" onRemove={() => removeFilter('design')}>디자인팀</Chip>`}/>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 4. Form Controls (Switch, Checkbox, Radio) ─────────────────

function SpecToggles() {
  const [on, setOn] = React.useState(true);
  const [check, setCheck] = React.useState({ a: true, b: false, c: false });
  const [radio, setRadio] = React.useState('m');
  return (
    <SpecPage>
      <SpecHeader
        name="Switch · Checkbox · Radio"
        role="FORM"
        summary="즉시 적용은 Switch, 확인이 필요한 다중 선택은 Checkbox, 배타적 선택은 Radio."
      />

      <SpecSection title="Switch" hint="즉시 적용 · 저장 버튼 없이">
        <SpecGrid cols={4}>
          <SpecCell label="Off"><div className={`hf-switch`} /></SpecCell>
          <SpecCell label="On"><div className={`hf-switch on`} /></SpecCell>
          <SpecCell label="Disabled"><div className={`hf-switch`} style={{ opacity: 0.4 }} /></SpecCell>
          <SpecCell label="Interactive">
            <div className={`hf-switch ${on ? 'on' : ''}`} onClick={() => setOn(!on)} style={{ cursor: 'pointer' }} />
          </SpecCell>
        </SpecGrid>
        <div style={{ marginTop: 12, padding: 16, background: 'var(--grey-50)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="t-body-strong">초과근무 자동 요청</div>
            <div className="t-caption" style={{ color: 'var(--grey-500)' }}>18시 후 30분 이상 머물면 자동 발송</div>
          </div>
          <div className={`hf-switch ${on ? 'on' : ''}`} onClick={() => setOn(!on)} style={{ cursor: 'pointer' }} />
        </div>
      </SpecSection>

      <SpecSection title="Checkbox">
        <SpecGrid cols={4}>
          <SpecCell label="Unchecked">
            <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid var(--grey-300)', background: '#fff' }}/>
          </SpecCell>
          <SpecCell label="Checked">
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.check style={{ width: 14, height: 14, color: '#fff' }} />
            </div>
          </SpecCell>
          <SpecCell label="Indeterminate">
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 10, height: 2, background: '#fff', borderRadius: 1 }}/>
            </div>
          </SpecCell>
          <SpecCell label="Disabled">
            <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid var(--grey-200)', background: 'var(--grey-100)' }}/>
          </SpecCell>
        </SpecGrid>
        <div style={{ marginTop: 12, padding: 16, background: 'var(--grey-50)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[['a','월요일'],['b','수요일'],['c','금요일']].map(([k, l]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div onClick={() => setCheck({ ...check, [k]: !check[k] })} style={{
                width: 20, height: 20, borderRadius: 5,
                border: check[k] ? 'none' : '2px solid var(--grey-300)',
                background: check[k] ? 'var(--brand)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {check[k] && <Icon.check style={{ width: 12, height: 12, color: '#fff' }} />}
              </div>
              <span className="t-body">{l}</span>
            </label>
          ))}
        </div>
      </SpecSection>

      <SpecSection title="Radio">
        <SpecGrid cols={4}>
          <SpecCell label="Unselected">
            <div style={{ width: 22, height: 22, borderRadius: 11, border: '2px solid var(--grey-300)', background: '#fff' }}/>
          </SpecCell>
          <SpecCell label="Selected">
            <div style={{ width: 22, height: 22, borderRadius: 11, border: '2px solid var(--brand)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--brand)' }}/>
            </div>
          </SpecCell>
          <SpecCell label="Disabled">
            <div style={{ width: 22, height: 22, borderRadius: 11, border: '2px solid var(--grey-200)', background: 'var(--grey-100)' }}/>
          </SpecCell>
          <SpecCell label="Group">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['s','짧게'],['m','보통'],['l','길게']].map(([k, l]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setRadio(k)}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 9,
                    border: '2px solid ' + (radio === k ? 'var(--brand)' : 'var(--grey-300)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {radio === k && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--brand)' }}/>}
                  </div>
                  <span className="t-body-sm">{l}</span>
                </label>
              ))}
            </div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Props">
        <PropsTable rows={[
          ['checked', 'boolean', 'false', '제어 컴포넌트일 때 현재 값'],
          ['onChange', '(checked: boolean) => void', '—', '값 변경 콜백'],
          ['disabled', 'boolean', 'false', '비활성'],
          ['indeterminate', 'boolean', 'false', '(Checkbox만) 부분 선택'],
          ['name', 'string', '—', '(Radio) 그룹 식별자'],
        ]}/>
      </SpecSection>

      <SpecSection title="언제 어떤 컴포넌트를?">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            ['Switch', '즉시 적용 · ON/OFF', '알림 켜기, 자동 요청, 다크 모드'],
            ['Checkbox', '확인 후 저장 · 다중 가능', '근무일 선택, 동의 항목, 필터'],
            ['Radio', '하나만 선택 · 모두 보임', '근무 형태(본사/재택), 알림 빈도'],
          ].map(([t, sub, ex]) => (
            <div key={t} style={{ border: '1px solid var(--grey-200)', borderRadius: 12, padding: 16 }}>
              <div className="t-subtitle">{t}</div>
              <div className="t-caption-strong" style={{ color: 'var(--brand)', marginTop: 4 }}>{sub}</div>
              <div className="t-body-sm" style={{ color: 'var(--grey-600)', marginTop: 8 }}>{ex}</div>
            </div>
          ))}
        </div>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 5. Card ────────────────────────────────────────────────────

function SpecCard() {
  return (
    <SpecPage>
      <SpecHeader
        name="Card"
        role="CONTAINER"
        summary="정보 그룹화의 기본 단위. Surface(흰 배경) + Subtle(grey-50) 두 톤. 그림자는 떠 있을 때만."
      />

      <SpecSection title="Variants">
        <SpecGrid cols={3}>
          <SpecCell label="Plain" sub="border" bg="var(--grey-50)">
            <div style={{ background: '#fff', border: '1px solid var(--grey-200)', borderRadius: 12, padding: 16, width: '100%' }}>
              <div className="t-body-strong">Plain</div>
              <div className="t-caption" style={{ color: 'var(--grey-500)' }}>border 1px</div>
            </div>
          </SpecCell>
          <SpecCell label="Elevated" sub="shadow-2" bg="var(--grey-50)">
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, width: '100%', boxShadow: 'var(--shadow-2)' }}>
              <div className="t-body-strong">Elevated</div>
              <div className="t-caption" style={{ color: 'var(--grey-500)' }}>floating</div>
            </div>
          </SpecCell>
          <SpecCell label="Subtle" sub="filled" bg="#fff">
            <div style={{ background: 'var(--grey-50)', borderRadius: 12, padding: 16, width: '100%' }}>
              <div className="t-body-strong">Subtle</div>
              <div className="t-caption" style={{ color: 'var(--grey-500)' }}>secondary bg</div>
            </div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Density">
        <SpecGrid cols={3}>
          {[['Compact', 12], ['Default', 16], ['Comfortable', 20]].map(([l, p]) => (
            <SpecCell key={l} label={l} sub={`p ${p}`}>
              <div style={{ background: '#fff', border: '1px solid var(--grey-200)', borderRadius: 12, padding: p, width: '100%' }}>
                <div className="t-body-strong">제목</div>
                <div className="t-caption" style={{ color: 'var(--grey-600)' }}>본문 텍스트</div>
              </div>
            </SpecCell>
          ))}
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Composition Examples">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {/* metric card */}
          <div style={{ background: '#fff', border: '1px solid var(--grey-200)', borderRadius: 14, padding: 18 }}>
            <div className="t-caption-strong" style={{ color: 'var(--grey-500)' }}>오늘 근무</div>
            <div className="t-number-lg" style={{ marginTop: 4 }}>7h 42m</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
              <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 700 }}>+8%</span>
              <span className="t-caption" style={{ color: 'var(--grey-500)' }}>지난주 대비</span>
            </div>
          </div>
          {/* action card */}
          <div style={{ background: '#fff', border: '1px solid var(--grey-200)', borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="t-body-strong">초과근무 요청</div>
                <div className="t-caption" style={{ color: 'var(--grey-500)' }}>18:30 → 20:00 · 1h 30m</div>
              </div>
              <span className="hf-chip warn">대기</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="hf-btn hf-btn-secondary hf-btn-medium" style={{ flex: 1 }}>거절</button>
              <button className="hf-btn hf-btn-primary hf-btn-medium" style={{ flex: 1 }}>승인</button>
            </div>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Anatomy">
        <div style={{ background: 'var(--grey-50)', padding: 24, borderRadius: 12 }}>
          <div style={{ background: '#fff', border: '1px dashed var(--brand)', borderRadius: 12, padding: 16, position: 'relative' }}>
            <div className="t-caption-strong" style={{ color: 'var(--brand)', marginBottom: 4 }}>HEADER · optional</div>
            <div style={{ background: 'var(--grey-100)', padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <div className="t-body-strong">제목</div>
              <div className="t-caption" style={{ color: 'var(--grey-500)' }}>설명</div>
            </div>
            <div className="t-caption-strong" style={{ color: 'var(--brand)', marginBottom: 4 }}>BODY · required</div>
            <div style={{ background: 'var(--grey-100)', padding: 12, borderRadius: 8, marginBottom: 8 }}>본문 영역</div>
            <div className="t-caption-strong" style={{ color: 'var(--brand)', marginBottom: 4 }}>FOOTER · optional</div>
            <div style={{ background: 'var(--grey-100)', padding: 12, borderRadius: 8 }}>액션 버튼</div>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Props">
        <PropsTable rows={[
          ['variant', '"plain" | "elevated" | "subtle"', 'plain', '배경/테두리 처리'],
          ['density', '"compact" | "default" | "comfortable"', 'default', '내부 padding'],
          ['radius', '"sm" | "md" | "lg"', 'md', '8 / 12 / 16'],
          ['header', 'ReactNode', '—', '상단 영역'],
          ['footer', 'ReactNode', '—', '하단 액션 영역'],
          ['onClick', '() => void', '—', '카드 자체가 인터랙티브일 때'],
        ]}/>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 6. Avatar / List Item ──────────────────────────────────────

function SpecAvatarList() {
  return (
    <SpecPage>
      <SpecHeader
        name="Avatar · List Item"
        role="DATA"
        summary="사람을 표현하는 아바타 + 리스트 행. 같은 토큰을 공유."
      />

      <SpecSection title="Avatar Sizes">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, padding: 24, background: 'var(--grey-50)', borderRadius: 12 }}>
          {[24, 32, 40, 48, 64, 80].map((s) => (
            <div key={s} style={{ textAlign: 'center' }}>
              <Avatar n="김지우" size={s} />
              <div className="t-caption num" style={{ color: 'var(--grey-500)', marginTop: 8 }}>{s}px</div>
            </div>
          ))}
        </div>
      </SpecSection>

      <SpecSection title="Variants">
        <SpecGrid cols={4}>
          <SpecCell label="Initials"><Avatar n="김지우" size={48} /></SpecCell>
          <SpecCell label="With status">
            <div style={{ position: 'relative' }}>
              <Avatar n="박민지" size={48} />
              <span style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, background: 'var(--success)', border: '2px solid #fff' }}/>
            </div>
          </SpecCell>
          <SpecCell label="Stack">
            <div style={{ display: 'flex' }}>
              {['김','박','이','최'].map((n, i) => (
                <div key={i} style={{ marginLeft: i === 0 ? 0 : -10, border: '2px solid #fff', borderRadius: 18 }}>
                  <Avatar n={n} size={36} />
                </div>
              ))}
              <div style={{ marginLeft: -10, width: 36, height: 36, borderRadius: 18, background: 'var(--grey-100)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--grey-700)' }}>+8</div>
            </div>
          </SpecCell>
          <SpecCell label="Squared">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>김</div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="List Item Variants">
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12, overflow: 'hidden' }}>
          {/* basic */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--grey-100)' }}>
            <Avatar n="김지우" size={40} />
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div className="t-body-strong">김지우</div>
              <div className="t-caption" style={{ color: 'var(--grey-500)' }}>디자인팀 · 본사</div>
            </div>
            <Icon.chevR style={{ width: 16, height: 16, color: 'var(--grey-400)' }} />
          </div>
          {/* with metadata */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--grey-100)' }}>
            <Avatar n="박민지" size={40} />
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="t-body-strong">박민지</span>
                <span className="hf-chip" style={{ fontSize: 10, padding: '1px 6px' }}>PM</span>
              </div>
              <div className="t-caption" style={{ color: 'var(--grey-500)' }}>업무 중 · 09:42 출근</div>
            </div>
            <span className="hf-chip success">본사</span>
          </div>
          {/* multi-line */}
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 16px', borderBottom: '1px solid var(--grey-100)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.calendar style={{ width: 20, height: 20 }} />
            </div>
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div className="t-body-strong">연차 신청</div>
              <div className="t-body-sm" style={{ color: 'var(--grey-700)', margin: '2px 0' }}>4월 22일 ~ 4월 25일 · 4일</div>
              <div className="t-caption" style={{ color: 'var(--grey-500)' }}>박민지 PM · 30분 전</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="hf-btn hf-btn-secondary hf-btn-tiny">거절</button>
              <button className="hf-btn hf-btn-primary hf-btn-tiny">승인</button>
            </div>
          </div>
          {/* selected */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: 'var(--brand-soft)' }}>
            <Avatar n="이서연" size={40} />
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div className="t-body-strong" style={{ color: 'var(--brand)' }}>이서연</div>
              <div className="t-caption" style={{ color: 'var(--brand)' }}>선택됨</div>
            </div>
            <Icon.check style={{ width: 18, height: 18, color: 'var(--brand)' }} />
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Props · Avatar">
        <PropsTable rows={[
          ['name', 'string', '—', '이름. 첫 글자로 initials 생성'],
          ['size', 'number | "sm" | "md" | "lg" | "xl"', 'md', 'px 직접 또는 토큰'],
          ['src', 'string', '—', '이미지 URL'],
          ['status', '"office" | "wfh" | "leave" | "off"', '—', '우하단 점'],
          ['shape', '"circle" | "square"', 'circle', '원/사각'],
        ]}/>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 7. Tabs / Segment / Pagination ─────────────────────────────

function SpecTabs() {
  const [tab, setTab] = React.useState(0);
  const [seg, setSeg] = React.useState('week');
  return (
    <SpecPage>
      <SpecHeader
        name="Tabs · Segment · Pagination"
        role="NAVIGATION"
        summary="Tabs는 같은 컨테이너 내 콘텐츠 전환. Segment는 짧은 옵션(2~5). 6개 이상은 Dropdown."
      />

      <SpecSection title="Tabs · Underline">
        <div style={{ border: '1px solid var(--grey-200)', borderRadius: 12, padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--grey-200)' }}>
            {['전체 (12)','승인 대기 (4)','승인됨 (8)','반려 (0)'].map((l, i) => (
              <div key={l} onClick={() => setTab(i)} style={{
                padding: '14px 18px', cursor: 'pointer',
                borderBottom: tab === i ? '2px solid var(--grey-900)' : '2px solid transparent',
                color: tab === i ? 'var(--grey-900)' : 'var(--grey-500)',
                fontWeight: tab === i ? 700 : 500, marginBottom: -1, fontSize: 14,
              }}>{l}</div>
            ))}
          </div>
          <div style={{ padding: 24, color: 'var(--grey-500)' }} className="t-body-sm">
            tab[{tab}] 콘텐츠 영역
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Tabs · Pill">
        <div style={{ display: 'inline-flex', gap: 6, padding: 4, background: 'var(--grey-100)', borderRadius: 999 }}>
          {['전체','대기','완료'].map((l, i) => (
            <div key={l} style={{
              padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
              background: i === 0 ? '#fff' : 'transparent',
              boxShadow: i === 0 ? 'var(--shadow-1)' : 'none',
              fontWeight: i === 0 ? 700 : 500, fontSize: 13,
              color: i === 0 ? 'var(--grey-900)' : 'var(--grey-600)',
            }}>{l}</div>
          ))}
        </div>
      </SpecSection>

      <SpecSection title="Segment Control">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div className="t-caption-strong" style={{ marginBottom: 8 }}>2 options</div>
            <div style={{ display: 'flex', padding: 3, background: 'var(--grey-100)', borderRadius: 10, width: 200 }}>
              {[['ko','한국어'],['en','English']].map(([k, l]) => (
                <div key={k} style={{
                  flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, cursor: 'pointer',
                  background: k === 'ko' ? '#fff' : 'transparent',
                  boxShadow: k === 'ko' ? 'var(--shadow-1)' : 'none',
                  fontSize: 13, fontWeight: k === 'ko' ? 700 : 500,
                }}>{l}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="t-caption-strong" style={{ marginBottom: 8 }}>4 options · interactive</div>
            <div style={{ display: 'flex', padding: 3, background: 'var(--grey-100)', borderRadius: 10 }}>
              {[['day','일'],['week','주'],['month','월'],['year','년']].map(([k, l]) => (
                <div key={k} onClick={() => setSeg(k)} style={{
                  flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, cursor: 'pointer',
                  background: seg === k ? '#fff' : 'transparent',
                  boxShadow: seg === k ? 'var(--shadow-1)' : 'none',
                  fontSize: 13, fontWeight: seg === k ? 700 : 500,
                }}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Pagination">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--grey-200)', borderRadius: 8, color: 'var(--grey-300)', cursor: 'not-allowed' }}>
              <Icon.chevL style={{ width: 14, height: 14 }} />
            </div>
            {[1,2,3,4,5,'…',12].map((p, i) => (
              <div key={i} style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: p === 1 ? 'var(--grey-900)' : 'transparent',
                color: p === 1 ? '#fff' : 'var(--grey-700)',
              }}>{p}</div>
            ))}
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--grey-200)', borderRadius: 8, color: 'var(--grey-700)', cursor: 'pointer' }}>
              <Icon.chevR style={{ width: 14, height: 14 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--grey-600)', fontSize: 13 }}>
            <span>1 - 20 / 240</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: '1px solid var(--grey-200)', borderRadius: 8, cursor: 'pointer' }}>
              <span>20</span>
              <Icon.chevD style={{ width: 12, height: 12 }} />
            </div>
            <span>per page</span>
          </div>
        </div>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 8. Date Picker (detailed) ─────────────────────────────────

function SpecDatePicker() {
  const days = ['월','화','수','목','금','토','일'];
  const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <SpecPage>
      <SpecHeader
        name="DatePicker"
        role="DATE"
        summary="단일 날짜 / 기간 / 다중 / 인라인 캘린더. 모든 날짜 표기는 같은 토큰."
      />

      <SpecSection title="Date States">
        <SpecGrid cols={6}>
          <SpecCell label="Default">
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500 }}>14</div>
          </SpecCell>
          <SpecCell label="Hover">
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, background: 'var(--grey-100)', borderRadius: 8 }}>14</div>
          </SpecCell>
          <SpecCell label="Today">
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, border: '2px solid var(--brand)', borderRadius: 8, color: 'var(--brand)' }}>14</div>
          </SpecCell>
          <SpecCell label="Selected">
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: 'var(--brand)', borderRadius: 8, color: '#fff' }}>14</div>
          </SpecCell>
          <SpecCell label="In range">
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, background: 'var(--brand-soft)', color: 'var(--brand)' }}>14</div>
          </SpecCell>
          <SpecCell label="Disabled">
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--grey-300)' }}>14</div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Picker Layout">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ border: '1px solid var(--grey-200)', borderRadius: 14, padding: 16, background: '#fff', boxShadow: 'var(--shadow-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Icon.chevL style={{ width: 18, height: 18, color: 'var(--grey-600)', cursor: 'pointer' }} />
              <div className="t-subtitle">2025년 4월</div>
              <Icon.chevR style={{ width: 18, height: 18, color: 'var(--grey-600)', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {days.map((d, i) => <div key={d} className="t-caption" style={{ textAlign: 'center', color: i >= 5 ? 'var(--grey-400)' : 'var(--grey-500)', padding: '4px 0', fontWeight: 600 }}>{d}</div>)}
              {monthDays.map((d) => {
                const isSel = d === 22;
                const isToday = d === 14;
                return (
                  <div key={d} style={{
                    aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, fontSize: 13, fontWeight: isSel || isToday ? 700 : 500, cursor: 'pointer',
                    background: isSel ? 'var(--brand)' : 'transparent',
                    color: isSel ? '#fff' : isToday ? 'var(--brand)' : 'var(--grey-900)',
                    border: isToday && !isSel ? '2px solid var(--brand)' : 'none',
                  }}>{d}</div>
                );
              })}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 6, paddingTop: 14, borderTop: '1px solid var(--grey-100)' }}>
              <button className="hf-btn hf-btn-secondary hf-btn-tiny" style={{ flex: 1 }}>오늘</button>
              <button className="hf-btn hf-btn-secondary hf-btn-tiny" style={{ flex: 1 }}>지우기</button>
            </div>
          </div>

          <div style={{ border: '1px solid var(--grey-200)', borderRadius: 14, padding: 16, background: '#fff', boxShadow: 'var(--shadow-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div className="t-caption-strong" style={{ color: 'var(--grey-500)' }}>시작</div>
                <div className="t-body-strong">4월 22일</div>
              </div>
              <div>
                <div className="t-caption-strong" style={{ color: 'var(--grey-500)' }}>종료</div>
                <div className="t-body-strong">4월 25일</div>
              </div>
              <div>
                <div className="t-caption-strong" style={{ color: 'var(--grey-500)' }}>총</div>
                <div className="t-body-strong" style={{ color: 'var(--brand)' }}>4일</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
              {days.map((d, i) => <div key={d} className="t-caption" style={{ textAlign: 'center', color: i >= 5 ? 'var(--grey-400)' : 'var(--grey-500)', padding: '4px 0', fontWeight: 600 }}>{d}</div>)}
              {monthDays.map((d) => {
                const inRange = d >= 22 && d <= 25;
                const isStart = d === 22;
                const isEnd = d === 25;
                const bg = isStart || isEnd ? 'var(--brand)' : inRange ? 'var(--brand-soft)' : 'transparent';
                const color = isStart || isEnd ? '#fff' : inRange ? 'var(--brand)' : 'var(--grey-900)';
                const radius = isStart ? '8px 0 0 8px' : isEnd ? '0 8px 8px 0' : 0;
                return (
                  <div key={d} style={{
                    aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: bg, color, fontSize: 13, fontWeight: 600,
                    borderRadius: inRange && !isStart && !isEnd ? 0 : radius || 8,
                  }}>{d}</div>
                );
              })}
            </div>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Trigger · Input + Picker">
        <SpecGrid cols={2}>
          <SpecCell label="Closed">
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--grey-200)', borderRadius: 10, background: '#fff' }}>
              <span style={{ fontSize: 14 }}>2025-04-22</span>
              <Icon.calendar style={{ width: 16, height: 16, color: 'var(--grey-500)' }} />
            </div>
          </SpecCell>
          <SpecCell label="Range placeholder">
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--grey-200)', borderRadius: 10, background: '#fff' }}>
              <span style={{ fontSize: 14, color: 'var(--grey-400)' }}>시작 ~ 종료</span>
              <Icon.calendar style={{ width: 16, height: 16, color: 'var(--grey-500)' }} />
            </div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Props">
        <PropsTable rows={[
          ['mode', '"single" | "range" | "multi"', 'single', '선택 모드'],
          ['value', 'Date | [Date, Date] | Date[]', '—', 'mode에 따라 타입 결정'],
          ['onChange', '(v) => void', '—', '선택 변경'],
          ['minDate, maxDate', 'Date', '—', '선택 가능 범위'],
          ['disabledDates', '(d: Date) => boolean', '—', '비활성 조건 (예: 주말)'],
          ['locale', '"ko" | "en"', 'ko', '월/요일 표기 언어'],
          ['showHolidays', 'boolean', 'true', '공휴일 빨간색 표시'],
        ]}/>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 9. Dropdown / Select / Menu ────────────────────────────────

function SpecDropdown() {
  return (
    <SpecPage>
      <SpecHeader
        name="Select · Menu"
        role="OVERLAY"
        summary="값 선택은 Select, 액션 실행은 Menu. shadow-3 + 8px 라운드 + 6px gap."
      />

      <SpecSection title="Select Trigger States">
        <SpecGrid cols={4}>
          <SpecCell label="Default">
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--grey-200)', borderRadius: 10, background: '#fff' }}>
              <span style={{ fontSize: 14, color: 'var(--grey-400)' }}>선택</span>
              <Icon.chevD style={{ width: 16, height: 16, color: 'var(--grey-500)' }} />
            </div>
          </SpecCell>
          <SpecCell label="Filled">
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--grey-200)', borderRadius: 10, background: '#fff' }}>
              <span style={{ fontSize: 14, color: 'var(--grey-900)' }}>디자인팀</span>
              <Icon.chevD style={{ width: 16, height: 16, color: 'var(--grey-500)' }} />
            </div>
          </SpecCell>
          <SpecCell label="Open">
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '2px solid var(--brand)', borderRadius: 10, background: '#fff', margin: -1 }}>
              <span style={{ fontSize: 14, color: 'var(--grey-900)' }}>디자인팀</span>
              <Icon.chevD style={{ width: 16, height: 16, color: 'var(--brand)', transform: 'rotate(180deg)' }} />
            </div>
          </SpecCell>
          <SpecCell label="Disabled">
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--grey-200)', borderRadius: 10, background: 'var(--grey-50)', opacity: 0.6 }}>
              <span style={{ fontSize: 14, color: 'var(--grey-400)' }}>잠김</span>
              <Icon.chevD style={{ width: 16, height: 16, color: 'var(--grey-300)' }} />
            </div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Open · Single / Multi / Search">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {/* Single */}
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-3)', border: '1px solid var(--grey-100)', overflow: 'hidden' }}>
            <div className="t-caption-strong" style={{ padding: '10px 14px', color: 'var(--grey-500)', borderBottom: '1px solid var(--grey-100)' }}>SINGLE</div>
            {['전체 부서','디자인 (8)','엔지니어링 (24)','PM (6)','마케팅 (5)'].map((l, i) => (
              <div key={l} style={{
                padding: '12px 14px', fontSize: 14, cursor: 'pointer',
                background: i === 1 ? 'var(--brand-soft)' : 'transparent',
                color: i === 1 ? 'var(--brand)' : 'var(--grey-900)',
                fontWeight: i === 1 ? 700 : 500,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>{l}</span>
                {i === 1 && <Icon.check style={{ width: 16, height: 16 }} />}
              </div>
            ))}
          </div>

          {/* Multi */}
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-3)', border: '1px solid var(--grey-100)', overflow: 'hidden' }}>
            <div className="t-caption-strong" style={{ padding: '10px 14px', color: 'var(--grey-500)', borderBottom: '1px solid var(--grey-100)' }}>MULTI · 2 selected</div>
            {[['디자인 (8)', true],['엔지니어링 (24)', false],['PM (6)', true],['마케팅 (5)', false]].map(([l, c], i) => (
              <div key={i} style={{ padding: '10px 14px', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: c ? 'none' : '2px solid var(--grey-300)',
                  background: c ? 'var(--brand)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {c && <Icon.check style={{ width: 12, height: 12, color: '#fff' }} />}
                </div>
                <span>{l}</span>
              </div>
            ))}
            <div style={{ padding: 10, borderTop: '1px solid var(--grey-100)' }}>
              <button className="hf-btn hf-btn-primary hf-btn-tiny" style={{ width: '100%' }}>적용</button>
            </div>
          </div>

          {/* Search */}
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-3)', border: '1px solid var(--grey-100)', overflow: 'hidden' }}>
            <div style={{ padding: 10, borderBottom: '1px solid var(--grey-100)', position: 'relative' }}>
              <Icon.search style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--grey-500)' }} />
              <input className="hf-input" placeholder="이름 검색" style={{ width: '100%', paddingLeft: 32, height: 36, fontSize: 13 }} />
            </div>
            {['김지우','김민수','김서연'].map((n) => (
              <div key={n} style={{ padding: '8px 14px', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar n={n} size={28} />
                <span>{n}</span>
              </div>
            ))}
            <div className="t-caption" style={{ padding: '8px 14px', color: 'var(--grey-500)', borderTop: '1px solid var(--grey-100)' }}>3 results</div>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Action Menu">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-3)', border: '1px solid var(--grey-100)', overflow: 'hidden' }}>
            <div className="t-caption-strong" style={{ padding: '10px 14px', color: 'var(--grey-500)', borderBottom: '1px solid var(--grey-100)' }}>ACTIONS</div>
            {[
              [Icon.edit, '수정', null],
              [Icon.calendar, '일정 변경', null],
              [Icon.bell, '알림 끄기', null],
            ].map(([I, l], i) => (
              <div key={i} style={{ padding: '10px 14px', fontSize: 14, color: 'var(--grey-900)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <I style={{ width: 16, height: 16, color: 'var(--grey-600)' }} />
                <span>{l}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--grey-100)', margin: '4px 0' }} />
            <div style={{ padding: '10px 14px', fontSize: 14, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Icon.close style={{ width: 16, height: 16 }} />
              <span>삭제</span>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-3)', border: '1px solid var(--grey-100)', overflow: 'hidden' }}>
            <div className="t-caption-strong" style={{ padding: '10px 14px', color: 'var(--grey-500)', borderBottom: '1px solid var(--grey-100)' }}>WITH SHORTCUTS</div>
            {[['수정','⌘ E'],['복제','⌘ D'],['이동','⌘ M']].map(([l, k]) => (
              <div key={l} style={{ padding: '10px 14px', fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
                <span>{l}</span>
                <span style={{ fontSize: 12, color: 'var(--grey-500)', fontFamily: 'JetBrains Mono, monospace' }}>{k}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-3)', border: '1px solid var(--grey-100)', overflow: 'hidden' }}>
            <div className="t-caption-strong" style={{ padding: '10px 14px', color: 'var(--grey-500)', borderBottom: '1px solid var(--grey-100)' }}>SECTIONED</div>
            <div className="t-caption" style={{ padding: '8px 14px 4px', color: 'var(--grey-400)', textTransform: 'uppercase' }}>변경</div>
            <div style={{ padding: '8px 14px', fontSize: 14 }}>이름 변경</div>
            <div style={{ padding: '8px 14px', fontSize: 14 }}>분류 변경</div>
            <div style={{ height: 1, background: 'var(--grey-100)', margin: '4px 0' }} />
            <div className="t-caption" style={{ padding: '8px 14px 4px', color: 'var(--grey-400)', textTransform: 'uppercase' }}>위험</div>
            <div style={{ padding: '8px 14px', fontSize: 14, color: 'var(--danger)' }}>삭제</div>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Placement">
        <div className="t-body-sm" style={{ color: 'var(--grey-600)', marginBottom: 12 }}>
          기본은 <code>bottom-start</code>. 화면 경계에 가까우면 자동 flip. 6px gap.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['bottom-start','bottom','bottom-end','top','left','right'].map((p) => (
            <span key={p} className="hf-chip" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{p}</span>
          ))}
        </div>
      </SpecSection>

      <SpecSection title="접근성">
        <A11yChecklist items={[
          'role="listbox" + 옵션 role="option"',
          'aria-expanded · aria-haspopup · aria-controls',
          '키보드: ↑↓ 이동 · Enter 선택 · Esc 닫기 · Tab으로 포커스 이동',
          '스크린리더가 선택된 옵션 수를 읽도록 aria-live 사용',
        ]}/>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 10. Modal / Sheet / Dialog ────────────────────────────────

function SpecModal() {
  return (
    <SpecPage>
      <SpecHeader
        name="Modal · Sheet · Dialog"
        role="OVERLAY"
        summary="Modal: 중앙 + 데스크탑 / Sheet: 하단 + 모바일 / Dialog: 확인. backdrop 항상 검정 40% 투명."
      />

      <SpecSection title="Center Modal">
        <div style={{ position: 'relative', height: 360, background: 'rgba(0,0,0,0.4)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 16, padding: 0, width: 480,
            boxShadow: 'var(--shadow-4)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="t-heading">연차를 신청할까요?</div>
              <Icon.close style={{ width: 18, height: 18, color: 'var(--grey-500)', cursor: 'pointer' }} />
            </div>
            <div style={{ padding: 24 }}>
              <div className="t-body" style={{ color: 'var(--grey-700)', marginBottom: 12 }}>
                <strong>4월 22일 ~ 4월 25일</strong> · 4일 (영업일 4일)
              </div>
              <div style={{ background: 'var(--grey-50)', borderRadius: 10, padding: 14 }}>
                <div className="t-caption-strong" style={{ color: 'var(--grey-500)' }}>승인자</div>
                <div className="t-body" style={{ marginTop: 4 }}>박민지 PM</div>
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--grey-100)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="hf-btn hf-btn-secondary hf-btn-medium">취소</button>
              <button className="hf-btn hf-btn-primary hf-btn-medium">신청하기</button>
            </div>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Bottom Sheet (모바일)">
        <SpecGrid cols={2}>
          <SpecCell label="Compact" sub="auto height">
            <div style={{ width: 280, position: 'relative', height: 320, background: 'rgba(0,0,0,0.3)', borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, boxShadow: 'var(--shadow-3)' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--grey-300)', margin: '0 auto 12px' }} />
                <div className="t-heading" style={{ marginBottom: 4 }}>초과근무 요청</div>
                <div className="t-body-sm" style={{ color: 'var(--grey-600)', marginBottom: 12 }}>18:00 지났어요</div>
                <button className="hf-btn hf-btn-primary hf-btn-large" style={{ width: '100%' }}>1.5시간 요청</button>
              </div>
            </div>
          </SpecCell>
          <SpecCell label="Full" sub="90vh">
            <div style={{ width: 280, position: 'relative', height: 320, background: 'rgba(0,0,0,0.3)', borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, boxShadow: 'var(--shadow-3)', height: '85%' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--grey-300)', margin: '0 auto 12px' }} />
                <div className="t-heading" style={{ marginBottom: 12 }}>연차 신청</div>
                <input className="hf-input" placeholder="시작일" style={{ marginBottom: 8 }} />
                <input className="hf-input" placeholder="종료일" style={{ marginBottom: 8 }} />
                <input className="hf-input" placeholder="사유" />
              </div>
            </div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Confirm Dialog">
        <SpecGrid cols={2}>
          <SpecCell label="Default">
            <div style={{ width: '100%', background: '#fff', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow-3)', textAlign: 'center' }}>
              <div className="t-heading">정말 삭제할까요?</div>
              <div className="t-body-sm" style={{ color: 'var(--grey-600)', marginTop: 6 }}>삭제하면 되돌릴 수 없어요.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="hf-btn hf-btn-secondary hf-btn-medium" style={{ flex: 1 }}>취소</button>
                <button className="hf-btn hf-btn-danger hf-btn-medium" style={{ flex: 1 }}>삭제</button>
              </div>
            </div>
          </SpecCell>
          <SpecCell label="Stacked (모바일)">
            <div style={{ width: '100%', background: '#fff', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow-3)', textAlign: 'center' }}>
              <div className="t-heading">출근 위치를 변경할까요?</div>
              <div className="t-body-sm" style={{ color: 'var(--grey-600)', marginTop: 6 }}>본사 → 재택으로 변경돼요.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                <button className="hf-btn hf-btn-primary hf-btn-medium">변경하기</button>
                <button className="hf-btn hf-btn-ghost hf-btn-medium">취소</button>
              </div>
            </div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Anatomy & Sizing">
        <PropsTable rows={[
          ['size', '"sm" | "md" | "lg" | "fullscreen"', 'md', 'sm 360 / md 480 / lg 640 / fullscreen 100vw'],
          ['placement', '"center" | "bottom" | "right"', 'center', 'center=Modal, bottom=Sheet, right=Drawer'],
          ['dismissOnBackdrop', 'boolean', 'true', '백드롭 클릭 시 닫기'],
          ['dismissOnEsc', 'boolean', 'true', 'ESC 키로 닫기'],
          ['onClose', '() => void', '—', '닫힘 콜백'],
          ['header, footer', 'ReactNode', '—', '슬롯'],
          ['lockScroll', 'boolean', 'true', 'body scroll 잠금'],
        ]}/>
      </SpecSection>

      <SpecSection title="Motion">
        <div className="t-body-sm" style={{ color: 'var(--grey-600)', marginBottom: 12 }}>
          enter: 250ms standard · exit: 200ms ease-out · backdrop: 200ms fade · sheet: 40px up · modal: 8px down
        </div>
      </SpecSection>

      <SpecSection title="접근성">
        <A11yChecklist items={[
          'role="dialog" + aria-modal="true" + aria-labelledby + aria-describedby',
          '열렸을 때 첫 focusable로 자동 포커스',
          'focus trap — 포커스가 다이얼로그 밖으로 못 나감',
          '닫히면 트리거 엘리먼트로 포커스 복원',
          'ESC와 백드롭 클릭으로 닫을 수 있어야 함 (확인 다이얼로그는 예외)',
        ]}/>
      </SpecSection>
    </SpecPage>
  );
}

// ─── 11. Toast / Banner / Alert ─────────────────────────────────

function SpecFeedback() {
  return (
    <SpecPage>
      <SpecHeader
        name="Toast · Banner · Alert"
        role="FEEDBACK"
        summary="Toast: 임시(3초) · Banner: 페이지 영구 · Alert: 즉각 행동 필요. 톤은 컬러로만 구분."
      />

      <SpecSection title="Toast" hint="3s 자동 사라짐 · 좌하단 또는 중앙 상단">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: 'var(--grey-900)', color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 13, boxShadow: 'var(--shadow-3)', maxWidth: 400, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon.check style={{ width: 16, height: 16, color: 'var(--success)' }} />
            <span style={{ flex: 1 }}>연차 신청이 박민지 PM에게 전송됐어요.</span>
          </div>
          <div style={{ background: 'var(--grey-900)', color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 13, boxShadow: 'var(--shadow-3)', maxWidth: 400, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1 }}>1건이 삭제됐어요.</span>
            <span style={{ color: '#7CB1FF', fontWeight: 700, cursor: 'pointer' }}>되돌리기</span>
          </div>
          <div style={{ background: 'var(--grey-900)', color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 13, boxShadow: 'var(--shadow-3)', maxWidth: 400, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon.close style={{ width: 16, height: 16, color: 'var(--danger)' }} />
            <span style={{ flex: 1 }}>네트워크 연결이 끊어졌어요.</span>
            <span style={{ color: '#7CB1FF', fontWeight: 700, cursor: 'pointer' }}>다시 시도</span>
          </div>
        </div>
      </SpecSection>

      <SpecSection title="Banner · Inline" hint="페이지 상단 또는 카드 상단에 영구 표시">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['info','#EBF4FF','var(--brand)','이번 주 1.5시간 추가로 일했어요. 초과근무 신청을 추천드려요.', '신청'],
            ['success','#E6F8F0','var(--success)','출근이 정상적으로 기록되었어요.', null],
            ['warn','#FFF6E5','#C57700','연차 4일이 12월 31일에 사라져요.', '연차 쓰기'],
            ['danger','#FFE8E8','var(--danger)','GPS를 읽지 못했어요. Wi-Fi로 다시 확인해주세요.', '재시도'],
          ].map(([k, bg, c, msg, action]) => (
            <div key={k} style={{
              background: bg, color: c, padding: '14px 16px', borderRadius: 10,
              fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: c, flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--grey-900)', fontWeight: 500 }}>{msg}</span>
              {action && (
                <span style={{ color: c, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>{action}</span>
              )}
              <Icon.close style={{ width: 14, height: 14, color: 'var(--grey-500)', cursor: 'pointer' }} />
            </div>
          ))}
        </div>
      </SpecSection>

      <SpecSection title="Tooltip">
        <SpecGrid cols={3}>
          <SpecCell label="Top">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button className="hf-btn hf-btn-secondary hf-btn-medium">호버 대상</button>
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-6px)',
                background: 'var(--grey-900)', color: '#fff', padding: '6px 10px', borderRadius: 6,
                fontSize: 12, whiteSpace: 'nowrap',
              }}>설명 텍스트</div>
            </div>
          </SpecCell>
          <SpecCell label="Right">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button className="hf-btn hf-btn-secondary hf-btn-medium">호버 대상</button>
              <div style={{
                position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%) translateX(6px)',
                background: 'var(--grey-900)', color: '#fff', padding: '6px 10px', borderRadius: 6,
                fontSize: 12, whiteSpace: 'nowrap',
              }}>오른쪽 설명</div>
            </div>
          </SpecCell>
          <SpecCell label="Multi-line">
            <div style={{
              background: 'var(--grey-900)', color: '#fff', padding: '8px 10px', borderRadius: 6,
              fontSize: 12, maxWidth: 220, lineHeight: 1.5,
            }}>2줄 이상의 긴 설명도 가능해요. 다만 복잡한 내용은 Popover를 써주세요.</div>
          </SpecCell>
        </SpecGrid>
      </SpecSection>

      <SpecSection title="Props">
        <PropsTable rows={[
          ['type', '"info" | "success" | "warn" | "danger"', 'info', '의미별 컬러'],
          ['duration', 'number', '3000', 'Toast 자동 사라짐 (ms). 0 = 수동'],
          ['action', '{ label, onClick }', '—', '오른쪽 액션 (예: 되돌리기)'],
          ['dismissible', 'boolean', 'true', 'X 버튼 표시 (Banner)'],
          ['icon', 'ReactNode | "auto"', 'auto', 'auto면 type별 아이콘'],
        ]}/>
      </SpecSection>

      <SpecSection title="언제 어떤 컴포넌트?">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            ['Toast', '한 번 알려주고 사라짐', '저장 완료, 보냈어요, 복사됨'],
            ['Banner', '계속 보여야 함 · 행동 가능', '연차 소멸 임박, 권한 부족'],
            ['Alert Dialog', '즉각 결정 필요', '삭제 확인, 변경사항 폐기'],
          ].map(([t, sub, ex]) => (
            <div key={t} style={{ border: '1px solid var(--grey-200)', borderRadius: 12, padding: 16 }}>
              <div className="t-subtitle">{t}</div>
              <div className="t-caption-strong" style={{ color: 'var(--brand)', marginTop: 4 }}>{sub}</div>
              <div className="t-body-sm" style={{ color: 'var(--grey-600)', marginTop: 8 }}>{ex}</div>
            </div>
          ))}
        </div>
      </SpecSection>
    </SpecPage>
  );
}

// ─── Export all ────────────────────────────────────────────────

Object.assign(window, {
  SpecButton, SpecInput, SpecChip, SpecToggles, SpecCard,
  SpecAvatarList, SpecTabs, SpecDatePicker, SpecDropdown,
  SpecModal, SpecFeedback,
});
