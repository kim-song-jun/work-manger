// Mobile overtime approval request — 3 variations

function MobOT_A_Sheet() {
  const t = useT();
  return (
    <div className="sk-phone">
      <div className="sk-phone-inner">
        <StatusBar />
        {/* dim backdrop */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,26,0.35)', zIndex: 1 }} />
        {/* bottom sheet */}
        <div className="sk-box" style={{
          position: 'absolute', left: 8, right: 8, bottom: 44, zIndex: 2,
          padding: 16, background: 'var(--paper)',
          borderRadius: '18px 16px 4px 4px / 16px 18px 4px 4px'
        }}>
          <div style={{ width: 40, height: 4, background: 'var(--ink-3)', borderRadius: 2, margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 28 }}>🌙</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sk-hand" style={{ fontSize: 19, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('overtime_alert')}</div>
              <div className="sk-label" style={{ marginTop: 2, whiteSpace: 'nowrap' }}>18:00 지났어요 · 현재 18:42</div>
            </div>
          </div>
          <div className="sk-hr" />
          <div className="sk-hand" style={{ fontSize: 17, marginTop: 6 }}>{t('overtime_choose')}</div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="sk-btn" style={{ flex: 1, justifyContent: 'center', padding: '14px 0', fontSize: 15 }}>
              {t('clock_out_now')}
            </button>
            <button className="sk-btn sk-btn-accent" style={{ flex: 1.2, justifyContent: 'center', padding: '14px 0', fontSize: 15 }}>
              {t('request_overtime')} →
            </button>
          </div>

          <div className="sk-label" style={{ marginTop: 10, fontSize: 11, textAlign: 'center' }}>
            요청을 누르면 상급자 박PM에게 자동 전송돼요
          </div>
        </div>

        {/* background faded home */}
        <div style={{ padding: '10px 10px', opacity: 0.5 }}>
          <div className="sk-hand" style={{ fontSize: 20 }}>{t('greet_evening')}, 지우 님</div>
          <div className="sk-box-sm" style={{ padding: 10, marginTop: 10 }}>
            <div className="sk-label">{t('worked_today')}</div>
            <div className="sk-hand" style={{ fontSize: 28 }}>9h 42m</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobOT_B_Form() {
  const t = useT();
  const [reason, setReason] = React.useState('릴리즈 QA 마무리');
  const [until, setUntil] = React.useState('20:00');
  return (
    <div className="sk-phone">
      <div className="sk-phone-inner">
        <StatusBar />
        <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>←</span>
          <div className="sk-hand" style={{ fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('request_overtime')}</div>
        </div>

        <div className="sk-box" style={{ margin: '10px', padding: 14, background: 'var(--warn-soft)' }}>
          <div className="sk-label">현재</div>
          <div className="sk-hand" style={{ fontSize: 26, lineHeight: 1 }}>18:42</div>
          <div className="sk-label" style={{ marginTop: 4 }}>정규 18:00 지난 42분</div>
        </div>

        {/* duration picker */}
        <div style={{ padding: '0 10px' }}>
          <div className="sk-label" style={{ marginTop: 6 }}>{t('est_duration')}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {['19:00','20:00','21:00','22:00'].map((h) => (
              <button key={h} onClick={() => setUntil(h)} className="sk-chip"
                style={{ flex: 1, justifyContent: 'center', padding: '8px 0',
                  background: until === h ? 'var(--ink)' : 'var(--paper)',
                  color: until === h ? 'var(--paper)' : 'var(--ink)', fontSize: 14 }}>
                ~ {h}
              </button>
            ))}
          </div>

          <div className="sk-label" style={{ marginTop: 14 }}>{t('overtime_reason')}</div>
          <div className="sk-box-sm" style={{ padding: 10, marginTop: 6, minHeight: 80 }}>
            <div className="sk-hand" style={{ fontSize: 16, color: 'var(--ink)' }}>{reason}</div>
            <div className="sk-label" style={{ fontSize: 10, marginTop: 6 }}>| 커서</div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {['릴리즈 QA','고객 이슈','회의 연장','데이터 분석'].map((c) => (
              <div key={c} className="sk-chip" style={{ fontSize: 12 }}>{c}</div>
            ))}
          </div>

          <div className="sk-hr" style={{ margin: '16px 0 10px' }} />

          <div className="sk-label">{t('approver')}</div>
          <div className="sk-box-sm" style={{ padding: 10, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="sk-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>박</div>
            <div>
              <div className="sk-hand" style={{ fontSize: 15 }}>박민지 PM</div>
              <div className="sk-label" style={{ fontSize: 10 }}>디자인 · 직속</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 14 }}>🟢</div>
          </div>
        </div>

        <button className="sk-btn sk-btn-accent" style={{
          position: 'absolute', left: 10, right: 10, bottom: 16,
          justifyContent: 'center', padding: '14px 0', fontSize: 18
        }}>
          {t('send_request')} 📩
        </button>
      </div>
    </div>
  );
}

function MobOT_C_Sent() {
  const t = useT();
  return (
    <div className="sk-phone">
      <div className="sk-phone-inner">
        <StatusBar />
        <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sk-hand" style={{ fontSize: 20, whiteSpace: 'nowrap' }}>내 요청</div>
          <span style={{ fontSize: 16 }}>🔔</span>
        </div>

        {/* just-sent banner */}
        <div className="sk-box" style={{ margin: '10px', padding: 14, background: 'var(--good-soft)',
          display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 26 }}>✅</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sk-hand" style={{ fontSize: 17, whiteSpace: 'nowrap' }}>{t('request_sent')}</div>
            <div className="sk-label" style={{ marginTop: 2, whiteSpace: 'nowrap' }}>박민지 PM · 방금 전</div>
          </div>
        </div>

        {/* status timeline */}
        <div style={{ padding: '0 14px', marginTop: 6 }}>
          <div className="sk-label" style={{ marginBottom: 8 }}>진행 상태</div>
          <div style={{ position: 'relative', paddingLeft: 22 }}>
            <div style={{ position: 'absolute', left: 7, top: 6, bottom: 16, width: 1.5,
              background: 'repeating-linear-gradient(to bottom, var(--ink) 0 4px, transparent 4px 7px)' }} />
            {[
              { k: '요청 전송', t: '18:44', done: true, n: '지우 → 박PM' },
              { k: '승인 검토 중', t: '18:45', done: true, n: '알림 전달됨' },
              { k: '승인 완료', t: '대기', done: false, n: '예상 20시 전' },
              { k: '초과근무 기록', t: '퇴근 시', done: false, n: '자동' },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 14, position: 'relative' }}>
                <div style={{ position: 'absolute', left: -22, top: 2, width: 16, height: 16, borderRadius: '50%',
                  border: '1.5px solid var(--line)', background: s.done ? 'var(--good)' : 'var(--paper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                  color: 'var(--paper)' }}>{s.done ? '✓' : ''}</div>
                <div className="sk-hand" style={{ fontSize: 16 }}>{s.k}</div>
                <div className="sk-label" style={{ fontSize: 11 }}>{s.t} · {s.n}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sk-box-sm" style={{ margin: '6px 10px 0', padding: 10, background: 'var(--paper-2)' }}>
          <div className="sk-label" style={{ fontSize: 11 }}>요청 요약</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span className="sk-hand" style={{ fontSize: 14 }}>18:00 ~ 20:00</span>
            <span className="sk-hand" style={{ fontSize: 14 }}>+2시간</span>
          </div>
          <div className="sk-label" style={{ fontSize: 11, marginTop: 2 }}>릴리즈 QA 마무리</div>
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

Object.assign(window, { MobOT_A_Sheet, MobOT_B_Form, MobOT_C_Sent });
