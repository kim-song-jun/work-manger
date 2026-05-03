// Widgets + desktop menu bar / taskbar extensions

// ─── Mobile widgets ─────────────────────────────────────────
function WidgetSmall() {
  const t = useT();
  return (
    <div style={{
      width: 155, height: 155, borderRadius: 22,
      border: '1.5px solid var(--line)', background: 'var(--paper)',
      padding: 14, position: 'relative', fontFamily: 'var(--body)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="sk-label" style={{ fontSize: 10 }}>근무 · 수 4/22</div>
        <span className="sk-dot on" style={{ width: 8, height: 8 }} />
      </div>
      <div className="sk-hand" style={{ fontSize: 32, lineHeight: 1, marginTop: 12 }}>6h 30m</div>
      <div className="sk-label" style={{ fontSize: 10, marginTop: 2 }}>출근 08:54</div>
      <div className="sk-progress" style={{ marginTop: 10, height: 7 }}><span style={{ width: '72%' }} /></div>
      <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14, display: 'flex',
        justifyContent: 'space-between', fontSize: 10 }}>
        <span className="sk-label">퇴근까지</span>
        <span className="sk-hand">2h 30m</span>
      </div>
    </div>
  );
}

function WidgetMedium() {
  const people = usePeople().slice(0, 6);
  return (
    <div style={{
      width: 330, height: 155, borderRadius: 22,
      border: '1.5px solid var(--line)', background: 'var(--paper)',
      padding: 14, display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 14,
      fontFamily: 'var(--body)',
    }}>
      <div style={{ borderRight: '1px dashed var(--muted)', paddingRight: 14 }}>
        <div className="sk-label" style={{ fontSize: 10 }}>오늘 · 근무 중</div>
        <div className="sk-hand" style={{ fontSize: 28, lineHeight: 1, marginTop: 6 }}>6h 30m</div>
        <div className="sk-progress" style={{ marginTop: 8, height: 7 }}><span style={{ width: '72%' }} /></div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button className="sk-btn sk-btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '5px 0' }}>퇴근</button>
          <button className="sk-btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '5px 0' }}>휴게</button>
        </div>
      </div>
      <div>
        <div className="sk-label" style={{ fontSize: 10, marginBottom: 6 }}>팀 · 지금</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {people.map((p, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div className="sk-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{p.n[0]}</div>
                <span className={`sk-dot ${p.s}`} style={{
                  position: 'absolute', bottom: -1, right: -1, width: 9, height: 9,
                  border: '1.5px solid var(--paper)'
                }} />
              </div>
              <div className="sk-hand" style={{ fontSize: 9, lineHeight: 1, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WidgetLarge() {
  return (
    <div style={{
      width: 330, height: 330, borderRadius: 22,
      border: '1.5px solid var(--line)', background: 'var(--paper)',
      padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
      fontFamily: 'var(--body)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="sk-hand" style={{ fontSize: 20 }}>근무</div>
        <div className="sk-label" style={{ fontSize: 10 }}>수 · 4월 22일</div>
      </div>

      <div className="sk-box-sm" style={{ padding: 10, background: 'var(--good-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="sk-label" style={{ fontSize: 10 }}>근무 중 · 본사</div>
            <div className="sk-hand" style={{ fontSize: 26, lineHeight: 1 }}>6h 30m</div>
          </div>
          <button className="sk-btn sk-btn-primary" style={{ fontSize: 12, padding: '6px 12px' }}>퇴근 찍기</button>
        </div>
      </div>

      <div className="sk-label" style={{ fontSize: 10 }}>오늘 타임라인</div>
      <div style={{ position: 'relative', height: 18,
        background: 'repeating-linear-gradient(to right, rgba(0,0,0,0.06) 0 1px, transparent 1px 30px)',
        border: '1px solid var(--line)' }}>
        <div style={{ position: 'absolute', left: '37%', width: '27.5%', top: 0, bottom: 0, background: 'var(--good)', border: '1px solid var(--line)' }} />
        <div style={{ position: 'absolute', left: '64%', top: -3, bottom: -3, width: 2, background: 'var(--accent)' }} />
      </div>

      <div className="sk-hr" style={{ margin: '2px 0' }} />

      <div className="sk-label" style={{ fontSize: 10 }}>이번 주</div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 50 }}>
        {['월','화','수','목','금'].map((d, i) => {
          const h = [8.2, 8.5, 6.5, 0, 0][i];
          return (
            <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: '100%', height: `${h * 4}px`,
                background: i === 2 ? 'var(--accent)' : 'var(--ink)',
                border: '1px solid var(--line)' }} />
              <div className="sk-label" style={{ fontSize: 9 }}>{d}</div>
            </div>
          );
        })}
      </div>

      <div className="sk-box-sm" style={{ padding: 8, background: 'var(--warn-soft)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🗓</span>
        <span className="sk-hand">연차 3일 · 12.31 소멸</span>
      </div>
    </div>
  );
}

// ─── macOS menu bar ─────────────────────────────────────────
function MacMenuBar({ open = false }) {
  return (
    <div style={{ width: 900, fontFamily: 'var(--body)' }}>
      {/* menu bar */}
      <div style={{
        height: 28, background: 'rgba(245, 242, 235, 0.88)',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: 16,
        fontSize: 12, color: 'var(--ink)', backdropFilter: 'blur(12px)',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: 13 }}>🍎</span>
        <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>근무</span>
        <span>File</span><span>Edit</span><span>View</span><span>Help</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center', whiteSpace: 'nowrap' }}>
          <span className="sk-hand" style={{
            padding: '2px 8px', borderRadius: 4,
            background: open ? 'rgba(26,26,26,0.1)' : 'transparent',
            display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
          }}>
            <span className="sk-dot on" style={{ width: 7, height: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--body)', whiteSpace: 'nowrap' }}>6h 30m</span>
          </span>
          <span>🔋 86%</span>
          <span>📶</span>
          <span style={{ whiteSpace: 'nowrap' }}>수 3:24 PM</span>
        </span>
      </div>

      {/* dropdown */}
      {open && (
        <div style={{ padding: '8px 10px 0 10px', display: 'flex', justifyContent: 'flex-end' }}>
          <div className="sk-box" style={{
            width: 290, padding: 14, background: 'rgba(250, 247, 240, 0.97)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="sk-hand" style={{ fontSize: 17 }}>김지우 · 근무 중</div>
              <span className="sk-dot on" />
            </div>
            <div className="sk-label" style={{ fontSize: 11 }}>출근 08:54 · 🏢 본사</div>

            <div className="sk-box-sm" style={{ padding: 10, marginTop: 10, background: 'var(--good-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div className="sk-label" style={{ fontSize: 10 }}>오늘 근무</div>
                  <div className="sk-hand" style={{ fontSize: 22, lineHeight: 1 }}>6h 30m</div>
                </div>
                <div>
                  <div className="sk-label" style={{ fontSize: 10 }}>퇴근까지</div>
                  <div className="sk-hand" style={{ fontSize: 22, lineHeight: 1 }}>2h 30m</div>
                </div>
              </div>
              <div className="sk-progress" style={{ marginTop: 6, height: 7 }}><span style={{ width: '72%' }} /></div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button className="sk-btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 0' }}>☕ 휴게</button>
              <button className="sk-btn sk-btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 0' }}>🌙 퇴근</button>
            </div>

            <div className="sk-hr" style={{ margin: '10px 0' }} />

            <div className="sk-label" style={{ fontSize: 10, marginBottom: 6 }}>팀 · 지금</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
              {usePeople().slice(0, 6).map((p, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div className="sk-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{p.n[0]}</div>
                    <span className={`sk-dot ${p.s}`} style={{
                      position: 'absolute', bottom: -1, right: -1, width: 8, height: 8,
                      border: '1.2px solid var(--paper)'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="sk-hr" style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span className="sk-hand">연차 잔여 11일</span>
              <span className="sk-chip warn">⚠ 3일 12.31 소멸</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11 }}>
              <span className="sk-label">⚙ 설정</span>
              <span className="sk-label">창 열기 →</span>
            </div>
          </div>
        </div>
      )}

      {/* desktop hint */}
      <div style={{ padding: 30, color: 'var(--ink-3)', fontFamily: 'var(--hand)',
        fontSize: 14, textAlign: 'center', opacity: 0.5 }}>
        {open ? '↑ 메뉴바 아이콘 클릭 시 드롭다운' : '↑ 메뉴바 우측에 근무시간 표시 (항시)'}
      </div>
    </div>
  );
}

// ─── Windows taskbar ────────────────────────────────────────
function WinTaskbar({ open = false }) {
  return (
    <div style={{ width: 900, height: 360, position: 'relative', fontFamily: 'var(--body)',
      background: 'linear-gradient(135deg, #e8d8c8 0%, #d4c5b2 100%)',
      borderRadius: 6, overflow: 'hidden', border: '1.5px solid var(--line)' }}>

      <div style={{ padding: 30, color: 'var(--ink-3)', fontFamily: 'var(--hand)',
        fontSize: 14, textAlign: 'center', opacity: 0.5 }}>
        {open ? '↓ 시스템 트레이 아이콘 팝업' : '↓ 작업표시줄 시스템 트레이에 고정'}
      </div>

      {/* flyout */}
      {open && (
        <div className="sk-box" style={{
          position: 'absolute', bottom: 56, right: 10, width: 300, padding: 14,
          background: 'rgba(250, 247, 240, 0.98)',
          boxShadow: '0 -6px 24px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="sk-avatar" style={{ width: 32, height: 32, fontSize: 14 }}>지</div>
            <div style={{ flex: 1 }}>
              <div className="sk-hand" style={{ fontSize: 15 }}>김지우 · 근무 중</div>
              <div className="sk-label" style={{ fontSize: 10 }}>08:54 출근 · 🏢 본사</div>
            </div>
            <span className="sk-dot on" />
          </div>

          <div className="sk-box-sm" style={{ padding: 10, marginTop: 10, background: 'var(--good-soft)' }}>
            <div className="sk-hand" style={{ fontSize: 22, lineHeight: 1 }}>6h 30m</div>
            <div className="sk-label" style={{ fontSize: 10, marginTop: 2 }}>정규 18:00 · 남은 2h 30m</div>
            <div className="sk-progress" style={{ marginTop: 6, height: 7 }}><span style={{ width: '72%' }} /></div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button className="sk-btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 0' }}>☕ 휴게</button>
            <button className="sk-btn sk-btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 0' }}>🌙 퇴근</button>
          </div>

          <div className="sk-hr" style={{ margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span className="sk-hand">이번 주 32h</span>
            <span className="sk-chip warn">연차 3일 곧 소멸</span>
          </div>
        </div>
      )}

      {/* taskbar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 44,
        background: 'rgba(240, 235, 225, 0.92)',
        borderTop: '1px solid rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6,
        backdropFilter: 'blur(14px)'
      }}>
        {/* start */}
        <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(26,26,26,0.08)', borderRadius: 4 }}>⊞</div>
        <div style={{ width: 1, height: 22, background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />
        {/* pinned */}
        {['🌐','📧','📁','📝'].map((i, k) => (
          <div key={k} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{i}</div>
        ))}
        {/* app icon for 근무 */}
        <div style={{
          height: 32, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 5,
          background: open ? 'rgba(26,26,26,0.12)' : 'transparent',
          borderRadius: 4, border: open ? '1px solid var(--line)' : '1px solid transparent'
        }}>
          <span style={{ fontSize: 13 }}>🕐</span>
          <span className="sk-hand" style={{ fontSize: 13 }}>근무</span>
        </div>

        {/* spacer */}
        <div style={{ flex: 1 }} />

        {/* system tray — with pinned work badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', fontSize: 11 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 7px', border: '1px solid var(--line)', borderRadius: 999,
            background: 'var(--good-soft)' }}>
            <span className="sk-dot on" style={{ width: 7, height: 7 }} />
            <span className="sk-hand" style={{ fontSize: 11 }}>6h 30m</span>
          </span>
          <span>📶</span>
          <span>🔊</span>
          <span>🔋</span>
          <span style={{ fontFamily: 'var(--hand)', textAlign: 'right', lineHeight: 1 }}>
            15:24<br/><span style={{ fontSize: 10 }}>2026-04-22</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications ──────────────────────────────────────────
function NotifStack() {
  return (
    <div style={{ width: 340, padding: 10, fontFamily: 'var(--body)',
      display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="sk-label" style={{ fontSize: 11 }}>시스템 알림 예시</div>

      {[
        { app: '근무', icon: '🌙', t: '정규 시간이 지났어요', b: '18:00 지났어요. 퇴근하거나 초과근무 요청을 보낼 수 있어요.', ago: '방금', actions: ['퇴근','요청'] },
        { app: '근무', icon: '✅', t: '초과근무 승인됨', b: '박민지 PM이 요청을 승인했어요. (18:00 ~ 20:00)', ago: '1분 전' },
        { app: '근무', icon: '📍', t: '재택으로 인식했어요', b: '자택 Wi-Fi가 감지되었어요. 맞으면 그대로 출근하기.', ago: '3분 전', actions: ['확인','변경'] },
        { app: '근무', icon: '🗓', t: '연차 3일 곧 소멸', b: '12월 31일까지 사용하지 않으면 사라져요.', ago: '오늘 오전' },
      ].map((n, i) => (
        <div key={i} className="sk-box" style={{ padding: 12, background: 'rgba(250, 247, 240, 0.97)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid var(--line)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🕐</div>
            <span className="sk-label" style={{ fontSize: 10 }}>{n.app}</span>
            <span className="sk-label" style={{ fontSize: 10, marginLeft: 'auto' }}>{n.ago}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <div style={{ fontSize: 20 }}>{n.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sk-hand" style={{ fontSize: 15, lineHeight: 1.1 }}>{n.t}</div>
              <div className="sk-label" style={{ fontSize: 11, marginTop: 3 }}>{n.b}</div>
            </div>
          </div>
          {n.actions && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {n.actions.map((a, k) => (
                <button key={k} className="sk-btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '5px 0' }}>{a}</button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { WidgetSmall, WidgetMedium, WidgetLarge, MacMenuBar, WinTaskbar, NotifStack });
