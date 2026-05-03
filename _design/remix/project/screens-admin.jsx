// Admin screens — 3 variations for each of: employee mgmt, approvals, reports

// ─── Employees ──────────────────────────────────────────────
function AdminEmp_A_Table() {
  const people = usePeople();
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>admin · 직원 관리</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        <AdminNav active="emp" />
        <div style={{ padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <div className="sk-label">관리자</div>
              <div className="sk-hand" style={{ fontSize: 22 }}>직원 · 전체 {people.length}명</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div className="sk-box-sm" style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔍 <span className="sk-label" style={{ fontSize: 11 }}>검색</span>
              </div>
              <button className="sk-btn" style={{ fontSize: 13, padding: '6px 12px' }}>+ 직원 추가</button>
            </div>
          </div>

          <div className="sk-box" style={{ padding: 0, overflow: 'hidden' }}>
            {/* table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 0.8fr 0.6fr',
              padding: '8px 12px', borderBottom: '1.2px solid var(--line)', background: 'var(--paper-2)',
              fontFamily: 'var(--hand)', fontSize: 12, color: 'var(--ink-3)' }}>
              <span>이름</span><span>팀</span><span>현재</span><span>이번 주</span><span>잔여연차</span><span></span>
            </div>
            {people.slice(0, 10).map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 0.8fr 0.6fr',
                padding: '8px 12px', borderBottom: '1px dashed var(--muted)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="sk-avatar" style={{ width: 24, height: 24, fontSize: 11 }}>{p.n[0]}</div>
                  <span className="sk-hand" style={{ fontSize: 14 }}>{p.n}</span>
                </div>
                <span className="sk-label" style={{ fontSize: 12 }}>{p.t}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  <span className={`sk-dot ${p.s}`} /> <span className="sk-hand">{p.r}</span>
                </span>
                <span className="sk-hand" style={{ fontSize: 13 }}>{(28 + i * 0.5).toFixed(1)}h</span>
                <span className="sk-hand" style={{ fontSize: 13 }}>{11 - (i % 4)}일</span>
                <span className="sk-label" style={{ fontSize: 11, textAlign: 'right' }}>···</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminEmp_B_Cards() {
  const people = usePeople();
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>admin · 직원</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        <AdminNav active="emp" />
        <div style={{ padding: 16, overflow: 'auto' }}>
          <div className="sk-hand" style={{ fontSize: 22 }}>직원 카드</div>
          <div className="sk-label" style={{ marginBottom: 10 }}>한 명씩 근태 상태를 한눈에</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {people.slice(0, 9).map((p, i) => {
              const pct = 40 + ((i * 13) % 55);
              return (
                <div key={i} className="sk-box" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div className="sk-avatar">{p.n[0]}</div>
                    <div>
                      <div className="sk-hand" style={{ fontSize: 15 }}>{p.n}</div>
                      <div className="sk-label" style={{ fontSize: 11 }}>{p.t}</div>
                    </div>
                    <span className={`sk-dot ${p.s}`} style={{ marginLeft: 'auto', width: 12, height: 12 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
                    <span className="sk-label">주간</span>
                    <span className="sk-hand">{(28 + i * 0.4).toFixed(1)}h / 40h</span>
                  </div>
                  <div className="sk-progress" style={{ marginTop: 4 }}><span style={{ width: `${pct}%` }} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
                    <span className="sk-chip" style={{ fontSize: 11 }}>연차 {11 - (i%4)}일</span>
                    <span className="sk-chip" style={{ fontSize: 11 }}>초과 {(i%3)+1}h</span>
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

function AdminEmp_C_Detail() {
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>admin · 김지우 상세</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        <AdminNav active="emp" />
        <div style={{ padding: 16, overflow: 'auto' }}>
          <div className="sk-label">← 직원 목록</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 6 }}>
            <div className="sk-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>김</div>
            <div>
              <div className="sk-hand" style={{ fontSize: 22 }}>김지우</div>
              <div className="sk-label">디자인팀 · 프로덕트 디자이너 · 2023.03 입사</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <button className="sk-btn" style={{ fontSize: 12, padding: '4px 10px' }}>메시지</button>
              <button className="sk-btn" style={{ fontSize: 12, padding: '4px 10px' }}>근태 수정</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
            {[
              ['정시 출근율', '96%'],
              ['평균 근무', '8h 24m'],
              ['누적 초과', '14h 20m'],
              ['잔여 연차', '11일'],
            ].map(([l,v]) => (
              <div key={l} className="sk-box-sm" style={{ padding: 10 }}>
                <div className="sk-label" style={{ fontSize: 11 }}>{l}</div>
                <div className="sk-hand" style={{ fontSize: 20 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* monthly calendar */}
          <div className="sk-box" style={{ padding: 12, marginTop: 12 }}>
            <div className="sk-hand" style={{ fontSize: 15 }}>4월 출근 기록</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginTop: 8 }}>
              {['일','월','화','수','목','금','토'].map((d) => (
                <div key={d} className="sk-label" style={{ fontSize: 10, textAlign: 'center' }}>{d}</div>
              ))}
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const weekend = (day + 1) % 7 === 0 || (day + 1) % 7 === 1;
                const leave = day === 8 || day === 14;
                const ot = day === 11 || day === 18;
                return (
                  <div key={day} style={{ height: 32, padding: 3, border: '1px solid var(--muted)',
                    background: weekend ? 'var(--paper-2)' : leave ? 'var(--warn-soft)' : ot ? 'var(--accent-soft)' : 'var(--paper)',
                    fontFamily: 'var(--hand)', fontSize: 10, position: 'relative' }}>
                    {day}
                    {!weekend && !leave && <div style={{ fontSize: 8, marginTop: 2 }}>8.{(day%9)+1}h</div>}
                    {leave && <div style={{ fontSize: 8 }}>연차</div>}
                    {ot && <div style={{ fontSize: 8, color: 'var(--accent)' }}>+{day%3+1}h</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Approvals (leave + OT + expiring) ──────────────────────
function AdminAppr_A_Inbox() {
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>admin · 승인 대기</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        <AdminNav active="appr" />
        <div style={{ padding: 16, overflow: 'auto' }}>
          <div className="sk-hand" style={{ fontSize: 22 }}>승인함 · 7건</div>
          <div style={{ display: 'flex', gap: 6, margin: '8px 0 12px' }}>
            {[['전체 7','on'],['연차 3',''],['초과 4',''],['소멸 안내 2','']].map(([l,a], i) => (
              <div key={i} className="sk-chip" style={{
                background: a==='on' ? 'var(--ink)' : 'var(--paper)',
                color: a==='on' ? 'var(--paper)' : 'var(--ink)', fontSize: 12 }}>{l}</div>
            ))}
          </div>

          {[
            { k:'OT', e:'김지우', t:'디자인', s:'18:00~20:00 릴리즈 QA', ago:'1분 전', hot: true },
            { k:'연차', e:'박서연', t:'디자인', s:'4/28 ~ 4/29 (2일) · 개인사유', ago:'12분 전' },
            { k:'OT', e:'이도현', t:'개발', s:'19:00~22:00 장애 대응', ago:'24분 전', hot: true },
            { k:'연차', e:'윤소라', t:'마케팅', s:'5/2 반차 오후 · 병원 방문', ago:'1시간 전' },
            { k:'소멸', e:'장민호', t:'마케팅', s:'12.31까지 소멸 3일 · 안내 발송 권장', ago:'자동' },
          ].map((r, i) => (
            <div key={i} className="sk-box" style={{ padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
              background: r.hot ? 'var(--accent-soft)' : 'var(--paper)' }}>
              <div className="sk-chip" style={{ fontSize: 11, minWidth: 44, justifyContent: 'center',
                background: r.k==='OT' ? 'var(--accent-soft)' : r.k==='연차' ? 'var(--warn-soft)' : 'var(--sky-soft)' }}>{r.k}</div>
              <div className="sk-avatar" style={{ width: 30, height: 30, fontSize: 13 }}>{r.e[0]}</div>
              <div style={{ flex: 1 }}>
                <div className="sk-hand" style={{ fontSize: 15 }}>{r.e} <span className="sk-label" style={{ fontSize: 11 }}>· {r.t}</span></div>
                <div className="sk-label" style={{ fontSize: 12 }}>{r.s}</div>
              </div>
              <span className="sk-label" style={{ fontSize: 11 }}>{r.ago}</span>
              {r.k === '소멸' ? (
                <button className="sk-btn" style={{ fontSize: 12, padding: '4px 10px' }}>📩 안내</button>
              ) : (
                <>
                  <button className="sk-btn" style={{ fontSize: 12, padding: '4px 10px' }}>반려</button>
                  <button className="sk-btn sk-btn-primary" style={{ fontSize: 12, padding: '4px 10px' }}>승인 ✓</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminAppr_B_Expiring() {
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>admin · 소멸 예정 연차</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        <AdminNav active="appr" />
        <div style={{ padding: 16, overflow: 'auto' }}>
          <div className="sk-hand" style={{ fontSize: 22 }}>소멸 예정 연차 안내</div>
          <div className="sk-label" style={{ marginBottom: 10 }}>규칙에 따라 자동 감지 · 수동 재발송 가능</div>

          <div className="sk-box" style={{ padding: 12, marginBottom: 12, background: 'var(--warn-soft)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div className="sk-hand" style={{ fontSize: 16 }}>12월 31일 소멸 예정 · 총 18일 (직원 8명)</div>
                <div className="sk-label">지금부터 매월 1일 자동 안내 발송 (D-60, D-30, D-7)</div>
              </div>
              <button className="sk-btn sk-btn-accent" style={{ fontSize: 13 }}>일괄 안내 📩</button>
            </div>
          </div>

          <div className="sk-box" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
              padding: '8px 12px', background: 'var(--paper-2)', borderBottom: '1.2px solid var(--line)',
              fontFamily: 'var(--hand)', fontSize: 12, color: 'var(--ink-3)' }}>
              <span>직원</span><span>소멸일</span><span>소멸 예정</span><span>최근 안내</span><span></span>
            </div>
            {[
              ['김지우','디자인','12.31','3일','D-30 · 3/31'],
              ['박서연','디자인','12.31','2일','D-60 · 3/1'],
              ['정유진','개발','12.31','4일','미발송'],
              ['오민석','개발','12.31','1일','D-30 · 3/31'],
              ['한예린','운영','6.30','2일','D-60 · 4/1'],
              ['강보람','재무','12.31','3일','D-30 · 3/31'],
            ].map(([n,t,d,days,last], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
                padding: '10px 12px', borderBottom: '1px dashed var(--muted)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="sk-avatar" style={{ width: 24, height: 24, fontSize: 11 }}>{n[0]}</div>
                  <div>
                    <div className="sk-hand" style={{ fontSize: 14, lineHeight: 1 }}>{n}</div>
                    <div className="sk-label" style={{ fontSize: 10 }}>{t}</div>
                  </div>
                </div>
                <span className="sk-hand" style={{ fontSize: 13 }}>{d}</span>
                <span className="sk-chip warn" style={{ fontSize: 11, width: 'fit-content' }}>{days}</span>
                <span className="sk-label" style={{ fontSize: 11 }}>{last}</span>
                <button className="sk-btn" style={{ fontSize: 11, padding: '3px 8px', width: 'fit-content' }}>📩 재발송</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminAppr_C_Decision() {
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>admin · 승인 상세</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        <AdminNav active="appr" />
        <div style={{ padding: 16, overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* left: request */}
          <div>
            <div className="sk-label">← 승인함</div>
            <div className="sk-hand" style={{ fontSize: 20, marginTop: 4 }}>초과근무 요청</div>

            <div className="sk-box" style={{ padding: 14, marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="sk-avatar">김</div>
                <div>
                  <div className="sk-hand" style={{ fontSize: 16 }}>김지우</div>
                  <div className="sk-label" style={{ fontSize: 11 }}>디자인 · 프로덕트 디자이너</div>
                </div>
                <span className="sk-chip" style={{ marginLeft: 'auto', fontSize: 11 }}>방금 전</span>
              </div>
              <div className="sk-hr" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div className="sk-label" style={{ fontSize: 11 }}>요청 시간</div>
                  <div className="sk-hand" style={{ fontSize: 16 }}>18:00 ~ 20:00</div>
                </div>
                <div>
                  <div className="sk-label" style={{ fontSize: 11 }}>총 시간</div>
                  <div className="sk-hand" style={{ fontSize: 16 }}>+2h 00m</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div className="sk-label" style={{ fontSize: 11 }}>사유</div>
                  <div className="sk-hand" style={{ fontSize: 14 }}>"릴리즈 QA 마무리. 내일 오전 10시 배포 예정."</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button className="sk-btn" style={{ flex: 1, justifyContent: 'center', padding: '12px 0' }}>반려</button>
              <button className="sk-btn sk-btn-accent" style={{ flex: 2, justifyContent: 'center', padding: '12px 0', fontSize: 16 }}>
                승인하기 ✓
              </button>
            </div>
          </div>

          {/* right: context */}
          <div>
            <div className="sk-hand" style={{ fontSize: 15 }}>맥락</div>
            <div className="sk-label">결정에 도움되는 정보</div>

            <div className="sk-box" style={{ padding: 12, marginTop: 8 }}>
              <div className="sk-label" style={{ fontSize: 11 }}>이번 달 김지우 초과근무</div>
              <div className="sk-hand" style={{ fontSize: 22 }}>4h 20m / 12h</div>
              <div className="sk-progress" style={{ marginTop: 4 }}><span style={{ width: '35%' }} /></div>
              <div className="sk-label" style={{ fontSize: 11, marginTop: 4 }}>월 상한까지 7h 40m 남음</div>
            </div>

            <div className="sk-box" style={{ padding: 12, marginTop: 8 }}>
              <div className="sk-label" style={{ fontSize: 11 }}>최근 초과근무</div>
              <div className="sk-hand" style={{ fontSize: 13 }}>4/18 릴리즈 QA · 2h</div>
              <div className="sk-hand" style={{ fontSize: 13 }}>4/11 고객 이슈 · 1h 20m</div>
              <div className="sk-hand" style={{ fontSize: 13 }}>4/4 디자인 리뷰 · 1h</div>
            </div>

            <div className="sk-box" style={{ padding: 12, marginTop: 8, background: 'var(--good-soft)' }}>
              <div className="sk-hand" style={{ fontSize: 13 }}>💡 주 40시간 이내 · 월 상한 이내</div>
              <div className="sk-label" style={{ fontSize: 11 }}>규정상 승인 가능</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reports ────────────────────────────────────────────────
function AdminRpt_A_Monthly() {
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>admin · 월간 리포트</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        <AdminNav active="rpt" />
        <div style={{ padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div className="sk-label">2026년 4월</div>
              <div className="sk-hand" style={{ fontSize: 22 }}>월간 근태 리포트</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="sk-btn" style={{ fontSize: 12 }}>◀ 3월</button>
              <button className="sk-btn" style={{ fontSize: 12 }}>CSV 내보내기</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 12 }}>
            {[
              ['정시 출근율', '94.2%', '↑ 1.3 vs 3월', 'good'],
              ['평균 근무', '8h 18m', '정규 8h', 'warn'],
              ['누적 초과', '126h', '직원 12명', 'accent'],
              ['연차 사용', '28일', '지급 180일 중', 'sky'],
            ].map(([l,v,s,c], i) => (
              <div key={i} className="sk-box" style={{ padding: 12 }}>
                <div className="sk-label">{l}</div>
                <div className="sk-hand" style={{ fontSize: 26, lineHeight: 1 }}>{v}</div>
                <div className={`sk-chip ${c === 'good' ? 'good' : c === 'warn' ? 'warn' : c === 'sky' ? 'sky' : 'filled'}`}
                  style={{ fontSize: 10, marginTop: 4 }}>{s}</div>
              </div>
            ))}
          </div>

          {/* daily bar chart */}
          <div className="sk-box" style={{ padding: 12, marginTop: 12 }}>
            <div className="sk-hand" style={{ fontSize: 14 }}>전사 평균 근무시간 / 일</div>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 120, marginTop: 10, paddingBottom: 14, position: 'relative' }}>
              {Array.from({ length: 30 }, (_, i) => {
                const weekend = (i+2) % 7 === 0 || (i+2) % 7 === 6;
                const h = weekend ? 0 : 7 + Math.sin(i * 0.5) * 1.5 + (i % 5 === 0 ? 1.2 : 0);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ width: '100%', height: `${h*10}px`,
                      background: h > 8 ? 'var(--accent)' : h > 0 ? 'var(--ink)' : 'transparent',
                      border: h > 0 ? '1px solid var(--line)' : 'none' }} />
                    {(i % 3 === 0) && <div className="sk-label" style={{ fontSize: 9, position: 'absolute', bottom: 0, transform: `translateX(${(i - 15) * 18}px)` }}>{i+1}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* team breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <div className="sk-box" style={{ padding: 12 }}>
              <div className="sk-hand" style={{ fontSize: 14 }}>팀별 초과근무</div>
              {[['개발', 64],['디자인', 28],['운영', 18],['마케팅', 10],['재무', 6]].map(([t,v]) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                  <span className="sk-label" style={{ fontSize: 11, width: 50 }}>{t}</span>
                  <div style={{ flex: 1, height: 10, background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
                    <div style={{ width: `${(v/70)*100}%`, height: '100%', background: 'var(--accent)' }} />
                  </div>
                  <span className="sk-hand" style={{ fontSize: 12, width: 40, textAlign: 'right' }}>{v}h</span>
                </div>
              ))}
            </div>
            <div className="sk-box" style={{ padding: 12 }}>
              <div className="sk-hand" style={{ fontSize: 14 }}>근무 형태 비율</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 10, height: 26, border: '1px solid var(--line)' }}>
                <div style={{ flex: 62, background: 'var(--good)' }} />
                <div style={{ flex: 28, background: 'var(--sky)' }} />
                <div style={{ flex: 10, background: 'var(--warn)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
                <span><span className="sk-dot on" /> 본사 62%</span>
                <span><span className="sk-dot wfh" /> 재택 28%</span>
                <span><span className="sk-dot leave" /> 연차 10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRpt_B_Weekly() {
  const people = usePeople();
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>admin · 주간 리포트</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        <AdminNav active="rpt" />
        <div style={{ padding: 16, overflow: 'auto' }}>
          <div className="sk-hand" style={{ fontSize: 22 }}>주간 리포트 · 4/21 ~ 4/27</div>
          <div className="sk-label" style={{ marginBottom: 10 }}>한 주 한눈에 · 직원별 히트맵</div>

          <div className="sk-box" style={{ padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr) 60px', gap: 4,
              paddingBottom: 6, borderBottom: '1.2px solid var(--line)',
              fontFamily: 'var(--hand)', fontSize: 11, color: 'var(--ink-3)' }}>
              <span>이름</span>
              {['월 21','화 22','수 23','목 24','금 25','토','일'].map((d) => (
                <span key={d} style={{ textAlign: 'center' }}>{d}</span>
              ))}
              <span style={{ textAlign: 'right' }}>합계</span>
            </div>
            {people.slice(0, 9).map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr) 60px', gap: 4,
                padding: '6px 0', alignItems: 'center', borderBottom: '1px dashed var(--muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="sk-avatar" style={{ width: 20, height: 20, fontSize: 10 }}>{p.n[0]}</div>
                  <span className="sk-hand" style={{ fontSize: 12 }}>{p.n}</span>
                </div>
                {Array.from({ length: 7 }, (_, d) => {
                  const weekend = d >= 5;
                  const h = weekend ? 0 : 7.5 + ((i + d) % 4) * 0.5;
                  const ot = !weekend && ((i + d) % 7 === 2);
                  const leave = (i === 5 && d === 2) || (i === 3 && d === 4);
                  const bg = leave ? 'var(--warn-soft)' :
                             weekend ? 'var(--paper-2)' :
                             ot ? 'var(--accent-soft)' :
                             h > 8 ? 'var(--ink)' : 'var(--good-soft)';
                  const fg = (h > 8 && !ot && !leave && !weekend) ? 'var(--paper)' : 'var(--ink)';
                  return (
                    <div key={d} style={{ height: 26, background: bg, border: '1px solid var(--line)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--hand)', fontSize: 11, color: fg }}>
                      {leave ? '연차' : weekend ? '' : h.toFixed(1)}
                    </div>
                  );
                })}
                <span className="sk-hand" style={{ fontSize: 13, textAlign: 'right' }}>
                  {(38 + (i % 5)).toFixed(1)}h
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: 11 }}>
            <span><span style={{ display: 'inline-block', width: 14, height: 10, background: 'var(--good-soft)', border: '1px solid var(--line)' }} /> 정규</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 10, background: 'var(--ink)', border: '1px solid var(--line)' }} /> 8h 초과</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 10, background: 'var(--accent-soft)', border: '1px solid var(--line)' }} /> 초과근무</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 10, background: 'var(--warn-soft)', border: '1px solid var(--line)' }} /> 연차</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRpt_C_Insights() {
  return (
    <div className="sk-web">
      <div className="sk-web-bar"><i/><i/><i/>
        <span className="sk-label" style={{ fontSize: 11, marginLeft: 8 }}>admin · 인사이트</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 28px)' }}>
        <AdminNav active="rpt" />
        <div style={{ padding: 16, overflow: 'auto' }}>
          <div className="sk-hand" style={{ fontSize: 22 }}>이번 주 살필 것들</div>
          <div className="sk-label" style={{ marginBottom: 12 }}>자동 감지한 주의 포인트</div>

          {[
            { icon:'🚨', title:'주 52시간 근접', who:'이도현 · 개발', detail:'이번 주 48.5h (정규 40 + 초과 8.5). 앞으로 3h 이상시 규정 위반 위험', color:'var(--danger-soft)' },
            { icon:'⚠️', title:'초과근무 집중 — 개발팀', detail:'릴리즈 주간으로 팀 초과 28h 집중. 다음 주 인원 재배치 고려', color:'var(--warn-soft)' },
            { icon:'🗓', title:'연차 소멸 임박', detail:'8명 · 총 18일 · D-60 알림 이미 발송됨. 개별 면담 권장', color:'var(--sky-soft)' },
            { icon:'✅', title:'정시 출근율 ↑', detail:'전사 94.2% (3월 대비 +1.3). 디자인팀 100% 달성', color:'var(--good-soft)' },
          ].map((card, i) => (
            <div key={i} className="sk-box" style={{ padding: 14, marginBottom: 10, background: card.color, display: 'flex', gap: 12 }}>
              <div style={{ fontSize: 28 }}>{card.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="sk-hand" style={{ fontSize: 16 }}>{card.title}</div>
                <div className="sk-label" style={{ fontSize: 12, marginTop: 2 }}>{card.detail}</div>
                {card.who && <div className="sk-chip" style={{ marginTop: 6, fontSize: 11 }}>{card.who}</div>}
              </div>
              <button className="sk-btn" style={{ fontSize: 12, padding: '4px 10px', alignSelf: 'center' }}>자세히 →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sidebar (shared)
function AdminNav({ active }) {
  const items = [
    ['dash', '대시보드', '📊'],
    ['appr', '승인함', '📬', 7],
    ['emp', '직원', '👥'],
    ['leave', '연차', '🗓', 3],
    ['rpt', '리포트', '📈'],
    ['set', '조직 설정', '⚙'],
  ];
  return (
    <div style={{ borderRight: '1.2px solid var(--line)', padding: 14, background: 'var(--paper-2)' }}>
      <div className="sk-hand" style={{ fontSize: 18 }}>관리자</div>
      <div className="sk-label" style={{ fontSize: 11 }}>회사명 · HR</div>
      <div className="sk-hr" />
      {items.map(([k, n, ic, badge]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
          background: active === k ? 'var(--ink)' : 'transparent',
          color: active === k ? 'var(--paper)' : 'var(--ink)',
          borderRadius: 6, marginBottom: 2, fontFamily: 'var(--hand)', fontSize: 14 }}>
          <span>{ic}</span><span style={{ flex: 1 }}>{n}</span>
          {badge && <span className="sk-chip" style={{
            fontSize: 10, padding: '0 6px',
            background: active === k ? 'var(--paper)' : 'var(--accent)',
            color: active === k ? 'var(--ink)' : 'var(--paper)',
            borderColor: 'var(--line)' }}>{badge}</span>}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  AdminEmp_A_Table, AdminEmp_B_Cards, AdminEmp_C_Detail,
  AdminAppr_A_Inbox, AdminAppr_B_Expiring, AdminAppr_C_Decision,
  AdminRpt_A_Monthly, AdminRpt_B_Weekly, AdminRpt_C_Insights,
});
