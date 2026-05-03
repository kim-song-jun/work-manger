// Mobile attendance screens — 3 variations
// All wrapped in .sk-phone inside a DCArtboard

function StatusBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 14px 6px', fontFamily: 'var(--hand)', fontSize: 11, color: 'var(--ink-3)' }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 4 }}>
        <span>●●●</span>
        <span>▯</span>
      </span>
    </div>
  );
}

function LocBadge({ kind }) {
  const t = useT();
  return (
    <div className="sk-box-sm" style={{ padding: '5px 9px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, maxWidth: '100%' }}>
      <span style={{ fontSize: 13 }}>{kind === 'home' ? '🏠' : '🏢'}</span>
      <div style={{ minWidth: 0 }}>
        <div className="sk-hand" style={{ fontSize: 12, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
          {kind === 'home' ? t('at_home') : t('at_office')}
        </div>
        <div style={{ fontSize: 9, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{t('location_detected')}</div>
      </div>
    </div>
  );
}

// ─── A. Slide to clock-in ──────────────────────────────────
function MobA_Slide() {
  const t = useT();
  const [slid, setSlid] = React.useState(0); // 0..1
  const [clockedIn, setClockedIn] = React.useState(false);
  const trackRef = React.useRef(null);
  const dragRef = React.useRef(null);

  const onDown = (e) => {
    e.preventDefault();
    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    const knob = 54;
    const max = rect.width - knob - 8;
    const startX = (e.touches ? e.touches[0].clientX : e.clientX);
    const startPct = slid;

    const move = (ev) => {
      const x = (ev.touches ? ev.touches[0].clientX : ev.clientX);
      const dx = x - startX;
      const next = Math.max(0, Math.min(1, startPct + dx / max));
      setSlid(next);
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      setSlid((v) => {
        if (v > 0.85) { setClockedIn((c) => !c); return 0; }
        return 0;
      });
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  return (
    <div className="sk-phone">
      <div className="sk-phone-inner" style={{ padding: '6px 4px' }}>
        <StatusBar />
        <div style={{ padding: '10px 6px 6px' }}>
          <div className="sk-label">4월 22일 수요일</div>
          <div className="sk-hand" style={{ fontSize: 26, lineHeight: 1.15 }}>
            {clockedIn ? t('greet_evening') : t('greet_morning')},
          </div>
          <div className="sk-hand" style={{ fontSize: 26, lineHeight: 1.15 }}>지우 님 👋</div>
        </div>

        <div style={{ margin: '12px 6px' }}>
          <LocBadge kind="office" />
        </div>

        {/* Big scheduled card */}
        <div className="sk-box" style={{ margin: '8px 6px', padding: 14 }}>
          <div className="sk-label">{t('scheduled')}</div>
          <div className="sk-hand" style={{ fontSize: 22, lineHeight: 1 }}>09:00 — 18:00</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, gap: 4 }}>
            <div style={{ minWidth: 0 }}>
              <div className="sk-label" style={{ whiteSpace: 'nowrap' }}>{t('clock_in')}</div>
              <div className="sk-hand" style={{ fontSize: 18 }}>{clockedIn ? '08:54' : '—:—'}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="sk-label" style={{ whiteSpace: 'nowrap' }}>{t('clock_out')}</div>
              <div className="sk-hand" style={{ fontSize: 18 }}>—:—</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="sk-label" style={{ whiteSpace: 'nowrap' }}>오늘</div>
              <div className="sk-hand" style={{ fontSize: 18 }}>{clockedIn ? '0h 36m' : '0h'}</div>
            </div>
          </div>
        </div>

        {/* Slide-to track */}
        <div ref={trackRef} className="sk-box" style={{
          margin: '16px 6px 10px', height: 62, padding: 4,
          background: clockedIn ? 'var(--good-soft)' : 'var(--accent-soft)',
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="sk-hand" style={{ fontSize: 18, color: 'var(--ink)', opacity: 0.6 }}>
            → {clockedIn ? t('slide_to_clock_out') : t('slide_to_clock_in')} →
          </div>
          <div ref={dragRef} onPointerDown={onDown} style={{
            position: 'absolute', left: 4 + slid * (260 - 54 - 8), top: 4,
            width: 54, height: 54, borderRadius: '50%',
            background: clockedIn ? 'var(--good)' : 'var(--accent)',
            border: '1.5px solid var(--line)',
            color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, cursor: 'grab', touchAction: 'none'
          }}>→</div>
        </div>

        <div className="sk-label" style={{ textAlign: 'center' }}>
          퇴근 예정 18:00 · 초과시 자동 승인요청 안내
        </div>

        {/* Nav */}
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'space-around',
          padding: '8px 12px', borderTop: '1.2px solid var(--line)', background: 'var(--paper)' }}>
          <div style={{ textAlign: 'center', opacity: 1 }}>
            <div style={{ fontSize: 16 }}>🏠</div><div className="sk-label" style={{ fontSize: 10 }}>홈</div></div>
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <div style={{ fontSize: 16 }}>👥</div><div className="sk-label" style={{ fontSize: 10 }}>팀</div></div>
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <div style={{ fontSize: 16 }}>🗓</div><div className="sk-label" style={{ fontSize: 10 }}>연차</div></div>
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <div style={{ fontSize: 16 }}>⚙</div><div className="sk-label" style={{ fontSize: 10 }}>설정</div></div>
        </div>
      </div>
    </div>
  );
}

// ─── B. Big tap circle + auto-detect sheet ──────────────────
function MobB_Tap() {
  const t = useT();
  const [clockedIn, setClockedIn] = React.useState(false);
  return (
    <div className="sk-phone" style={{ background: 'var(--paper)' }}>
      <div className="sk-phone-inner">
        <StatusBar />
        <div style={{ padding: '8px 10px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="sk-label">수 · 4월 22일</div>
            <div className="sk-hand" style={{ fontSize: 20 }}>{t('greet_morning')}</div>
          </div>
          <div className="sk-avatar">지</div>
        </div>

        {/* auto-detected bottom sheet-y banner */}
        <div className="sk-box-sm" style={{
          margin: '10px 10px 16px', padding: '10px 12px',
          background: 'var(--sky-soft)', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize: 22 }}>📍</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t('location_detected')}</div>
            <div className="sk-hand" style={{ fontSize: 16, lineHeight: 1.1 }}>
              {t('at_office')} 맞아요?
            </div>
          </div>
          <button className="sk-btn" style={{ fontSize: 13, padding: '4px 10px' }}>{t('change_location')}</button>
        </div>

        {/* huge tap circle */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 10px' }}>
          <button onClick={() => setClockedIn((c) => !c)} style={{
            width: 200, height: 200, borderRadius: '50%',
            border: '2.5px solid var(--line)',
            background: clockedIn ? 'var(--good-soft)' : 'var(--accent-soft)',
            position: 'relative', cursor: 'pointer',
            fontFamily: 'var(--hand)',
          }}>
            {/* inner dashed ring */}
            <div style={{
              position: 'absolute', inset: 10, borderRadius: '50%',
              border: '1.5px dashed var(--line)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
              <div style={{ fontSize: 44, lineHeight: 1 }}>{clockedIn ? '👋' : '☀️'}</div>
              <div className="sk-hand" style={{ fontSize: 22, color: 'var(--ink)' }}>
                {clockedIn ? t('tap_to_clock_out') : t('tap_to_clock_in')}
              </div>
              <div className="sk-label" style={{ fontSize: 11 }}>
                {clockedIn ? '08:54 출근' : '정규 09:00'}
              </div>
            </div>
          </button>
        </div>

        {/* breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '4px 10px' }}>
          {[
            { l: t('worked_today'), v: clockedIn ? '0h 36m' : '—' },
            { l: '이번 주', v: '24h 12m' },
            { l: t('overtime'), v: '1h 20m' },
          ].map((c) => (
            <div key={c.l} className="sk-box-sm" style={{ padding: 8, textAlign: 'center' }}>
              <div className="sk-label" style={{ fontSize: 10 }}>{c.l}</div>
              <div className="sk-hand" style={{ fontSize: 17 }}>{c.v}</div>
            </div>
          ))}
        </div>

        {/* nav */}
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'space-around',
          padding: '8px 12px', borderTop: '1.2px solid var(--line)', background: 'var(--paper)' }}>
          {['홈','팀','연차','설정'].map((n,i) => (
            <div key={n} style={{ textAlign: 'center', opacity: i===0?1:0.5 }}>
              <div style={{ fontSize: 16 }}>{['🏠','👥','🗓','⚙'][i]}</div>
              <div className="sk-label" style={{ fontSize: 10 }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── C. Card stack: 출근 · 휴게 · 퇴근 ────────────────────────
function MobC_Cards() {
  const t = useT();
  const [idx, setIdx] = React.useState(0); // 0 clock-in 1 break 2 clock-out
  const cards = [
    { emoji: '☀️', title: t('clock_in'), sub: '정규 09:00', color: 'var(--accent-soft)', cta: '출근 찍기' },
    { emoji: '☕', title: '휴게', sub: '점심 / 짧은 쉼', color: 'var(--warn-soft)', cta: '휴게 시작' },
    { emoji: '🌙', title: t('clock_out'), sub: '정규 18:00', color: 'var(--sky-soft)', cta: '퇴근 찍기' },
  ];
  return (
    <div className="sk-phone">
      <div className="sk-phone-inner">
        <StatusBar />
        <div style={{ padding: '6px 10px 0', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div className="sk-label">4월 22일</div>
            <div className="sk-hand" style={{ fontSize: 18 }}>지우 님 🌤</div>
          </div>
          <LocBadge kind="office" />
        </div>

        {/* Stack */}
        <div style={{ position: 'relative', height: 300, margin: '16px 8px 8px' }}>
          {cards.map((c, i) => {
            const pos = i - idx;
            const off = pos < 0 ? -400 : pos * 14;
            const scale = pos === 0 ? 1 : 1 - pos * 0.05;
            const z = cards.length - pos;
            return (
              <div key={c.title} className="sk-box" style={{
                position: 'absolute', left: 0, right: 0, top: off,
                height: 260, padding: 16, background: c.color,
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                zIndex: z, opacity: pos < 0 ? 0 : (pos > 2 ? 0 : 1 - pos * 0.1),
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="sk-label">STEP {i+1} / 3</div>
                    <div className="sk-hand" style={{ fontSize: 30, lineHeight: 1 }}>{c.title}</div>
                    <div className="sk-label" style={{ marginTop: 4 }}>{c.sub}</div>
                  </div>
                  <div style={{ fontSize: 48 }}>{c.emoji}</div>
                </div>

                <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {cards.map((_, k) => (
                      <div key={k} style={{ flex: 1, height: 4, borderRadius: 2,
                        background: k <= idx ? 'var(--ink)' : 'var(--muted)' }} />
                    ))}
                  </div>
                  <button
                    onClick={() => setIdx((idx + 1) % cards.length)}
                    className="sk-btn sk-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 18 }}>
                    {c.cta} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sk-label" style={{ textAlign: 'center', marginTop: 4 }}>
          ← 카드를 밀어 이전 단계
        </div>

        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'space-around',
          padding: '8px 12px', borderTop: '1.2px solid var(--line)', background: 'var(--paper)' }}>
          {['홈','팀','연차','설정'].map((n,i) => (
            <div key={n} style={{ textAlign: 'center', opacity: i===0?1:0.5 }}>
              <div style={{ fontSize: 16 }}>{['🏠','👥','🗓','⚙'][i]}</div>
              <div className="sk-label" style={{ fontSize: 10 }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobA_Slide, MobB_Tap, MobC_Cards });
