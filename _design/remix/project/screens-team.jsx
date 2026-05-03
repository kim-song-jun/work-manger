// Mobile team status — 3 variations

function MobTeam_A_Grid() {
  const t = useT();
  const people = usePeople();
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? people : people.filter((p) => p.s === filter);
  return (
    <div className="sk-phone">
      <div className="sk-phone-inner">
        <StatusBar />
        <div style={{ padding: '6px 10px' }}>
          <div className="sk-hand" style={{ fontSize: 22 }}>{t('team_status')}</div>
          <div className="sk-box-sm" style={{ padding: '6px 10px', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ opacity: 0.5, fontSize: 13 }}>🔍</span>
            <div className="sk-label" style={{ fontSize: 12 }}>{t('search')}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8, overflow: 'hidden' }}>
            {[
              ['all', t('all'), people.length],
              ['on', t('in_office'), people.filter(p=>p.s==='on').length],
              ['wfh', t('wfh'), people.filter(p=>p.s==='wfh').length],
              ['leave', t('leave'), people.filter(p=>p.s==='leave').length],
            ].map(([k,l,n]) => (
              <button key={k} onClick={() => setFilter(k)} className="sk-chip" style={{
                flex: 1, justifyContent: 'center', padding: '5px 2px',
                background: filter === k ? 'var(--ink)' : 'var(--paper)',
                color: filter === k ? 'var(--paper)' : 'var(--ink)', fontSize: 12
              }}>{l} {n}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: '10px 10px 4px' }}>
          {filtered.slice(0, 12).map((p, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div className="sk-avatar" style={{ width: 46, height: 46, fontSize: 18 }}>
                  {p.n[0]}
                </div>
                <span className={`sk-dot ${p.s}`} style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 14, height: 14, border: '2px solid var(--paper)',
                }} />
              </div>
              <div className="sk-hand" style={{ fontSize: 12, marginTop: 2, lineHeight: 1 }}>{p.n}</div>
              <div className="sk-label" style={{ fontSize: 9 }}>{p.r}</div>
            </div>
          ))}
        </div>

        {/* legend */}
        <div className="sk-box-sm" style={{ margin: '4px 10px', padding: '6px 8px', display: 'flex', gap: 10, justifyContent: 'space-between', fontSize: 10 }}>
          <span><span className="sk-dot on" /> 본사</span>
          <span><span className="sk-dot wfh" /> 재택</span>
          <span><span className="sk-dot break" /> 휴게</span>
          <span><span className="sk-dot leave" /> 연차</span>
          <span><span className="sk-dot off" /> 퇴근</span>
        </div>

        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'space-around',
          padding: '8px 12px', borderTop: '1.2px solid var(--line)', background: 'var(--paper)' }}>
          {['홈','팀','연차','설정'].map((n,i) => (
            <div key={n} style={{ textAlign: 'center', opacity: i===1?1:0.5 }}>
              <div style={{ fontSize: 16 }}>{['🏠','👥','🗓','⚙'][i]}</div>
              <div className="sk-label" style={{ fontSize: 10 }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobTeam_B_Teams() {
  const t = useT();
  const people = usePeople();
  const teams = {};
  people.forEach((p) => { (teams[p.t] ||= []).push(p); });
  return (
    <div className="sk-phone">
      <div className="sk-phone-inner" style={{ overflowY: 'auto' }}>
        <StatusBar />
        <div style={{ padding: '6px 10px 0' }}>
          <div className="sk-hand" style={{ fontSize: 22 }}>{t('team_status')}</div>
          <div className="sk-label">팀별 그룹</div>
        </div>

        <div style={{ padding: '8px 10px 56px' }}>
          {Object.entries(teams).map(([team, list]) => {
            const on = list.filter((p)=>p.s==='on' || p.s==='wfh').length;
            return (
              <div key={team} className="sk-box" style={{ padding: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="sk-hand" style={{ fontSize: 17 }}>{team}</div>
                  <div className="sk-label" style={{ fontSize: 11 }}>{on}/{list.length} 근무 중</div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {list.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5,
                      padding: '3px 8px 3px 3px', border: '1.2px solid var(--line)', borderRadius: 999,
                      background: 'var(--paper-2)' }}>
                      <div style={{ position: 'relative' }}>
                        <div className="sk-avatar" style={{ width: 22, height: 22, fontSize: 11 }}>{p.n[0]}</div>
                        <span className={`sk-dot ${p.s}`} style={{
                          position: 'absolute', bottom: -1, right: -1,
                          width: 8, height: 8, border: '1.5px solid var(--paper-2)',
                        }} />
                      </div>
                      <span className="sk-hand" style={{ fontSize: 12 }}>{p.n}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'space-around',
          padding: '8px 12px', borderTop: '1.2px solid var(--line)', background: 'var(--paper)' }}>
          {['홈','팀','연차','설정'].map((n,i) => (
            <div key={n} style={{ textAlign: 'center', opacity: i===1?1:0.5 }}>
              <div style={{ fontSize: 16 }}>{['🏠','👥','🗓','⚙'][i]}</div>
              <div className="sk-label" style={{ fontSize: 10 }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobTeam_C_Timeline() {
  const t = useT();
  const people = usePeople().slice(0, 8);
  // Each row: horizontal bar 0-24h with blocks
  const blocks = [
    [{ s: 8.5, e: 12, k: 'on' }, { s: 12, e: 13, k: 'break' }, { s: 13, e: 18, k: 'on' }],
    [{ s: 9, e: 13, k: 'wfh' }, { s: 13, e: 14, k: 'break' }, { s: 14, e: 18, k: 'wfh' }],
    [{ s: 8, e: 12.5, k: 'on' }, { s: 12.5, e: 13.5, k: 'break' }, { s: 13.5, e: 19.2, k: 'on' }],
    [{ s: 9.5, e: 18, k: 'wfh' }],
    [{ s: 0, e: 24, k: 'break' }],
    [{ s: 0, e: 24, k: 'leave' }],
    [{ s: 8.2, e: 17.8, k: 'on' }],
    [{ s: 10, e: 15, k: 'on' }],
  ];
  const now = 15.4;
  return (
    <div className="sk-phone">
      <div className="sk-phone-inner">
        <StatusBar />
        <div style={{ padding: '6px 10px 4px' }}>
          <div className="sk-hand" style={{ fontSize: 22 }}>실시간 타임라인</div>
          <div className="sk-label">오늘 · 수 4.22 · 현재 15:24</div>
        </div>

        {/* hour rule */}
        <div style={{ padding: '0 10px' }}>
          <div style={{ position: 'relative', height: 14, marginBottom: 4 }}>
            {[6,9,12,15,18,21].map((h) => (
              <div key={h} style={{ position: 'absolute', left: `${(h/24)*100}%`, top: 0,
                fontFamily: 'var(--hand)', fontSize: 9, color: 'var(--ink-3)',
                transform: 'translateX(-50%)' }}>{h}</div>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            {/* now line */}
            <div style={{ position: 'absolute', left: `${(now/24)*100}%`, top: -2, bottom: 0,
              width: 1.5, background: 'var(--accent)', zIndex: 2,
              borderTop: '5px solid var(--accent)' }} />
            {people.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0', height: 22 }}>
                <div className="sk-avatar" style={{ width: 22, height: 22, fontSize: 10 }}>{p.n[0]}</div>
                <div className="sk-label" style={{ fontSize: 10, width: 38, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.n}</div>
                <div style={{ flex: 1, height: 14, position: 'relative',
                  background: 'repeating-linear-gradient(to right, rgba(26,26,26,0.06) 0 1px, transparent 1px 30px)',
                  border: '1px solid var(--muted)', borderRadius: 3 }}>
                  {blocks[i].map((b, j) => (
                    <div key={j} style={{
                      position: 'absolute', left: `${(b.s/24)*100}%`, width: `${((b.e-b.s)/24)*100}%`,
                      top: 0, bottom: 0,
                      background: b.k === 'on' ? 'var(--good)' :
                                  b.k === 'wfh' ? 'var(--sky)' :
                                  b.k === 'break' ? 'var(--accent)' :
                                  b.k === 'leave' ? 'var(--warn)' : 'var(--muted)',
                      border: '1px solid var(--line)',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="sk-box-sm" style={{ padding: '6px 8px', marginTop: 8, display: 'flex', gap: 8, fontSize: 10, flexWrap: 'wrap' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--good)', border: '1px solid var(--line)' }} /> 본사</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--sky)', border: '1px solid var(--line)' }} /> 재택</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--accent)', border: '1px solid var(--line)' }} /> 휴게</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--warn)', border: '1px solid var(--line)' }} /> 연차</span>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'space-around',
          padding: '8px 12px', borderTop: '1.2px solid var(--line)', background: 'var(--paper)' }}>
          {['홈','팀','연차','설정'].map((n,i) => (
            <div key={n} style={{ textAlign: 'center', opacity: i===1?1:0.5 }}>
              <div style={{ fontSize: 16 }}>{['🏠','👥','🗓','⚙'][i]}</div>
              <div className="sk-label" style={{ fontSize: 10 }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobTeam_A_Grid, MobTeam_B_Teams, MobTeam_C_Timeline });
