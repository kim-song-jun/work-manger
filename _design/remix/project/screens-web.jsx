// Web personal dashboard — 3 variations

function WebDash_A_Classic() {
  const t = useT();
  const remaining = 11;
  const used = 4;
  const total = 15;
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>work.company.co.kr / 내 근무</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        {/* left nav */}
        <div style={{ borderRight: '1.2px solid var(--line)', padding: 14, background: 'var(--paper-2)' }}>
          <div className="sk-hand" style={{ fontSize: 18 }}>근무</div>
          <div className="sk-hr" />
          {['내 근무','팀 상태','연차','초과근무','리포트','설정'].map((n,i) => (
            <div key={n} className="sk-hand" style={{ fontSize: 14, padding: '5px 8px',
              background: i===0?'var(--ink)':'transparent', color: i===0?'var(--paper)':'var(--ink)',
              borderRadius: 6, marginBottom: 2 }}>{n}</div>
          ))}
        </div>

        <div style={{ padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="sk-label">수요일 · 4월 22일 · 현재 15:24</div>
              <div className="sk-hand" style={{ fontSize: 26 }}>{t('good_day')}, 지우 님</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div className="sk-chip good">🟢 {t('working')} · 6h 30m</div>
              <div className="sk-chip">🏢 {t('at_office')}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12, marginTop: 14 }}>
            {/* this week */}
            <div className="sk-box" style={{ padding: 12 }}>
              <div className="sk-label">{t('this_week')}</div>
              <div className="sk-hand" style={{ fontSize: 22, marginTop: 2 }}>32h 14m / 40h</div>
              <div className="sk-progress" style={{ marginTop: 6 }}><span style={{ width: '80%' }} /></div>
              {/* week bars */}
              <div style={{ display: 'flex', gap: 4, marginTop: 14, alignItems: 'flex-end', height: 60 }}>
                {['월','화','수','목','금'].map((d, i) => {
                  const h = [8.2, 8.5, 6.5, 0, 0][i];
                  return (
                    <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div className="sk-hand" style={{ fontSize: 9 }}>{h ? h.toFixed(1)+'h' : '—'}</div>
                      <div style={{ width: '100%', height: `${(h/10)*52}px`,
                        background: i === 2 ? 'var(--accent)' : 'var(--ink)',
                        border: '1px solid var(--line)' }} />
                      <div className="sk-label" style={{ fontSize: 10 }}>{d}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* annual leave */}
            <div className="sk-box" style={{ padding: 12 }}>
              <div className="sk-label">{t('annual_leave')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--muted)" strokeWidth="10" strokeDasharray="3,2" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--accent)" strokeWidth="10"
                    strokeDasharray={`${(remaining/total)*201} 201`} transform="rotate(-90 40 40)" strokeLinecap="round" />
                  <text x="40" y="44" textAnchor="middle" fontFamily="var(--hand)" fontSize="18">{remaining}일</text>
                </svg>
                <div>
                  <div className="sk-hand" style={{ fontSize: 14 }}>{t('remaining')} {remaining}일</div>
                  <div className="sk-label">{t('used')} {used}일 · {t('total')} {total}일</div>
                  <div className="sk-chip warn" style={{ marginTop: 4 }}>⚠ 12월 31일 소멸 3일</div>
                </div>
              </div>
            </div>

            {/* overtime */}
            <div className="sk-box" style={{ padding: 12 }}>
              <div className="sk-label">이번 달 초과근무</div>
              <div className="sk-hand" style={{ fontSize: 22, marginTop: 2 }}>4h 20m</div>
              <div className="sk-label">승인됨 3 · 대기 0</div>
              <div className="sk-hr" />
              <div className="sk-label" style={{ fontSize: 11 }}>최근</div>
              <div className="sk-hand" style={{ fontSize: 13 }}>4/18 릴리즈 QA · 2h</div>
              <div className="sk-hand" style={{ fontSize: 13 }}>4/11 고객 이슈 · 1h 20m</div>
            </div>
          </div>

          {/* today timeline */}
          <div className="sk-box" style={{ padding: 12, marginTop: 12 }}>
            <div className="sk-label">오늘 타임라인</div>
            <div style={{ position: 'relative', marginTop: 10, height: 30,
              background: 'repeating-linear-gradient(to right, rgba(0,0,0,0.06) 0 1px, transparent 1px 30px)',
              border: '1px solid var(--line)' }}>
              <div style={{ position: 'absolute', left: '25%', width: '14.5%', top: 0, bottom: 0,
                background: 'var(--good)', border: '1px solid var(--line)' }} />
              <div style={{ position: 'absolute', left: '39.5%', width: '4%', top: 0, bottom: 0,
                background: 'var(--accent)', border: '1px solid var(--line)' }} />
              <div style={{ position: 'absolute', left: '43.5%', width: '20.5%', top: 0, bottom: 0,
                background: 'var(--good)', border: '1px solid var(--line)' }} />
              {/* now */}
              <div style={{ position: 'absolute', left: '64%', top: -4, bottom: -4, width: 2, background: 'var(--accent)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, fontFamily: 'var(--hand)', color: 'var(--ink-3)' }}>
              <span>6</span><span>9</span><span>12</span><span>15</span><span>18</span><span>21</span><span>24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebDash_B_Wide() {
  const t = useT();
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>work.company.co.kr</span>
      </div>
      {/* top bar */}
      <div style={{ padding: '10px 16px', borderBottom: '1.2px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="sk-hand" style={{ fontSize: 18 }}>근무</div>
        <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--hand)', fontSize: 14 }}>
          <span className="sk-underline">내 근무</span>
          <span>팀</span><span>연차</span><span>리포트</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="sk-chip good">🟢 6h 30m</span>
          <div className="sk-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>지</div>
        </div>
      </div>

      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
        {[
          { l: '오늘 근무', v: '6h 30m', s: '09:00 ~ 진행중' },
          { l: '이번 주', v: '32h 14m', s: '정규 40h' },
          { l: '잔여 연차', v: '11일', s: '사용 4 / 지급 15' },
          { l: '초과 누적', v: '4h 20m', s: '승인 3건' },
        ].map((c) => (
          <div key={c.l} className="sk-box" style={{ padding: 12 }}>
            <div className="sk-label">{c.l}</div>
            <div className="sk-hand" style={{ fontSize: 28, lineHeight: 1 }}>{c.v}</div>
            <div className="sk-label" style={{ fontSize: 11 }}>{c.s}</div>
          </div>
        ))}
      </div>

      {/* team calendar */}
      <div style={{ padding: '0 16px' }}>
        <div className="sk-box" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="sk-hand" style={{ fontSize: 16 }}>{t('team_calendar')}</div>
            <div className="sk-label">4월</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(14, 1fr)', gap: 2, marginTop: 8, fontSize: 10 }}>
            <div />
            {Array.from({ length: 14 }, (_, i) => 15 + i).map((d) => (
              <div key={d} className="sk-label" style={{ textAlign: 'center', fontSize: 10 }}>{d}</div>
            ))}
            {usePeople().slice(0, 7).map((p, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div className="sk-avatar" style={{ width: 18, height: 18, fontSize: 9 }}>{p.n[0]}</div>
                  <span className="sk-hand" style={{ fontSize: 11 }}>{p.n}</span>
                </div>
                {Array.from({ length: 14 }, (_, j) => {
                  // random leave blocks
                  const leave = (i === 1 && (j === 2 || j === 3)) || (i === 3 && j === 5) || (i === 5 && (j >= 7 && j <= 9));
                  const wfh = !leave && (j + i) % 5 === 0;
                  const weekend = (j + 15) % 7 === 0 || (j + 15) % 7 === 6;
                  return (
                    <div key={j} style={{ height: 16,
                      background: leave ? 'var(--warn-soft)' : wfh ? 'var(--sky-soft)' : weekend ? 'var(--paper-2)' : 'var(--paper)',
                      border: '1px solid var(--muted)' }} />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: 10 }}>
            <span><span className="sk-dot leave" /> 연차</span>
            <span><span className="sk-dot wfh" /> 재택</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebDash_C_Focus() {
  const t = useT();
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>내 근무 · 집중 모드</span>
      </div>
      <div style={{ padding: 24, height: 'calc(100% - 28px)', display: 'flex', gap: 24 }}>
        {/* hero clock */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="sk-label">수요일 · 4월 22일</div>
          <div className="sk-hand" style={{ fontSize: 92, lineHeight: 0.9, marginTop: 6 }}>15:24</div>
          <div className="sk-hand" style={{ fontSize: 22, color: 'var(--accent)', marginTop: 4 }}>
            근무 중 · 6h 30m 째
          </div>
          <div className="sk-box" style={{ padding: 12, marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 12, width: 'fit-content' }}>
            <div>
              <div className="sk-label">출근</div>
              <div className="sk-hand" style={{ fontSize: 18 }}>08:54</div>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--line)' }} />
            <div>
              <div className="sk-label">예정 퇴근</div>
              <div className="sk-hand" style={{ fontSize: 18 }}>18:00</div>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--line)' }} />
            <div>
              <div className="sk-label">위치</div>
              <div className="sk-hand" style={{ fontSize: 16 }}>🏢 본사</div>
            </div>
            <button className="sk-btn sk-btn-primary" style={{ marginLeft: 10 }}>{t('clock_out')}</button>
          </div>
        </div>

        {/* right sidebar summary */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="sk-box" style={{ padding: 14 }}>
            <div className="sk-label">이번 달 초과 누적</div>
            <div className="sk-hand" style={{ fontSize: 26 }}>4h 20m</div>
            <div className="sk-progress" style={{ marginTop: 6 }}><span style={{ width: '35%' }} /></div>
            <div className="sk-label" style={{ marginTop: 4, fontSize: 11 }}>월 상한 12h</div>
          </div>

          <div className="sk-box" style={{ padding: 14, background: 'var(--warn-soft)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20 }}>🗓</span>
              <div>
                <div className="sk-hand" style={{ fontSize: 16 }}>소멸 예정 연차 3일</div>
                <div className="sk-label" style={{ fontSize: 11 }}>12.31 까지 사용 권장</div>
              </div>
            </div>
            <button className="sk-btn" style={{ marginTop: 8, width: '100%', justifyContent: 'center', fontSize: 14 }}>
              연차 신청하기 →
            </button>
          </div>

          <div className="sk-box" style={{ padding: 12 }}>
            <div className="sk-label">지금 팀</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {usePeople().slice(0,8).map((p,i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div className="sk-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{p.n[0]}</div>
                  <span className={`sk-dot ${p.s}`} style={{
                    position: 'absolute', bottom: -1, right: -1,
                    width: 10, height: 10, border: '1.5px solid var(--paper)',
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WebDash_A_Classic, WebDash_B_Wide, WebDash_C_Focus });
