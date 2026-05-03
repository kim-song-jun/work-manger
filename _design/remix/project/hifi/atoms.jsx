// Shared atoms for hi-fi screens
// Icons (minimal stroke SVGs, 24x24 viewBox)

const Icon = {
  home: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>),
  team: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M17 11a3 3 0 1 0 0-6M21 20c-.3-2.2-1.6-3.9-3.5-4.7"/></svg>),
  calendar: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>),
  user: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>),
  settings: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>),
  bell: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a2 2 0 0 0 3.4 0"/></svg>),
  chevR: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 6l6 6-6 6"/></svg>),
  chevL: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 6l-6 6 6 6"/></svg>),
  chevD: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>),
  close: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>),
  plus: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>),
  search: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>),
  map: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s-7-7-7-12a7 7 0 1 1 14 0c0 5-7 12-7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>),
  clock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>),
  moon: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>),
  sun: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>),
  coffee: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 8h14v6a5 5 0 0 1-10 0V8zM17 10h2a3 3 0 0 1 0 6h-2M6 3v2M10 3v2M14 3v2"/></svg>),
  lock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>),
  inbox: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2M5 3h14l3 9v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7z"/></svg>),
  chart: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18M7 14l4-4 3 3 5-6"/></svg>),
  filter: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h18l-7 9v5l-4 2v-7z"/></svg>),
  edit: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>),
  building: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></svg>),
  house: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l9-8 9 8M5 9v11h14V9"/></svg>),
};

function StatusBar({ dark }) {
  return (
    <div className="hf-status">
      <span>9:41</span>
      <svg width="60" height="14" viewBox="0 0 60 14" fill={dark ? '#fff' : 'currentColor'}>
        <path d="M2 4h3v6H2zM8 3h3v7H8zM14 2h3v8h-3zM20 1h3v9h-3z"/>
        <rect x="30" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
        <rect x="32" y="5" width="6" height="4" rx="0.5"/>
        <rect x="46" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/>
        <rect x="48" y="5" width="8" height="4" rx="0.5"/>
      </svg>
    </div>
  );
}

function Avatar({ n, size = 40, src, color }) {
  const initials = n?.[0] || '?';
  const hue = (n || '').charCodeAt(0) * 137 % 360;
  const bg = color || `hsl(${hue}, 70%, 88%)`;
  const fg = color ? '#fff' : `hsl(${hue}, 60%, 35%)`;
  return (
    <div className="hf-avatar" style={{ width: size, height: size, fontSize: size * 0.4, background: bg, color: fg }}>
      {initials}
    </div>
  );
}

function TabBar({ active = 'home', t, badges = {} }) {
  const tabs = [
    ['home', Icon.home, t ? t('nav_home') : '홈'],
    ['team', Icon.team, t ? t('nav_team') : '팀'],
    ['leave', Icon.calendar, t ? t('nav_leave') : '연차'],
    ['me', Icon.user, t ? t('nav_me') : '마이'],
  ];
  return (
    <div className="hf-tabbar">
      {tabs.map(([k, IC, l]) => (
        <div key={k} className={`hf-tab ${active === k ? 'active' : ''}`} style={{ position: 'relative' }}>
          <IC />
          <span>{l}</span>
          {badges[k] && <span style={{
            position: 'absolute', top: 4, right: '28%',
            background: 'var(--danger)', color: '#fff',
            fontSize: 10, fontWeight: 700,
            minWidth: 16, height: 16, padding: '0 4px',
            borderRadius: 999, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
          }}>{badges[k]}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── State primitives (DESIGN.md §14) ─────────────────────────────

// Empty state: 한 줄 설명 + 선택적 한 개의 약한 CTA (blue50/blue500)
function EmptyState({ title, action, onAction, icon, compact }) {
  return (
    <div style={{
      padding: compact ? '24px 20px' : '40px 20px',
      textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      {icon && (
        <div style={{
          width: 48, height: 48, borderRadius: 24,
          background: 'var(--grey-100)', color: 'var(--grey-400)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
      )}
      <div className="t-body" style={{ color: 'var(--grey-700)', maxWidth: 260 }}>
        {title}
      </div>
      {action && (
        <button className="hf-btn hf-btn-weak hf-btn-medium" onClick={onAction} className="mt-4">
          {action}
        </button>
      )}
    </div>
  );
}

// Loading skeleton block
function Skeleton({ w = '100%', h = 16, r = 8, style }) {
  return <div className="hf-skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

// Success confirmation screen (돈 이동 아닌, 승인/제출 완료 등)
function SuccessConfirm({ title, subtitle, detail, primary, onPrimary, secondary, onSecondary }) {
  return (
    <div style={{
      padding: '60px 24px 32px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', textAlign: 'center',
      height: '100%', background: 'var(--white)',
    }}>
      {/* 체크마크 — spring으로 한번 그려짐 */}
      <div style={{
        width: 72, height: 72, borderRadius: 36,
        background: 'var(--success-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <svg className="anim-check" viewBox="0 0 24 24" width="36" height="36" fill="none"
             stroke="var(--success)" strokeWidth="3"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <div className="t-display-lg mb-8">{title}</div>
      {subtitle && <div className="t-body-lg c-muted mb-20">{subtitle}</div>}
      {detail && (
        <div style={{
          background: 'var(--grey-50)',
          borderRadius: 12,
          padding: '16px 20px',
          width: '100%', maxWidth: 280,
          marginTop: 12,
        }}>{detail}</div>
      )}
      <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {primary && <button className="hf-btn hf-btn-primary hf-btn-big hf-btn-block" onClick={onPrimary}>{primary}</button>}
        {secondary && <button className="hf-btn hf-btn-ghost hf-btn-medium hf-btn-block" onClick={onSecondary}>{secondary}</button>}
      </div>
    </div>
  );
}

// Inline error (form field)
function FieldError({ message }) {
  if (!message) return null;
  return <div className="hf-field-error">{message}</div>;
}

// Toast
function Toast({ message }) {
  return (
    <div style={{
      position: 'absolute', left: 20, right: 20, bottom: 24,
      background: 'var(--grey-900)', color: '#fff',
      padding: '14px 16px', borderRadius: 12,
      fontSize: 14, fontWeight: 400,
      boxShadow: 'var(--shadow-3)',
      zIndex: 20,
    }}>{message}</div>
  );
}

// 큰 숫자 디스플레이 — breathing room 보장
function BigNumber({ value, unit, label, color, size = 'lg' }) {
  const cls = size === 'xl' ? 't-number-xl' : size === 'md' ? 't-number-md' : 't-number-lg';
  return (
    <div className="col g-6">
      {label && <div className="t-caption-strong c-mute">{label}</div>}
      <div className={cls} style={{ color: color || 'var(--grey-900)', display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span>{value}</span>
        {unit && <span style={{ fontSize: '0.55em', fontWeight: 600, color: 'var(--grey-500)' }}>{unit}</span>}
      </div>
    </div>
  );
}

// ─── Reusable primitives (DESIGN.md unified components) ───────────

// Mobile page header (date + greeting + bell)
function PageHeader({ date, title, subtitle, action, hasBadge, theme = 'light' }) {
  const dark = theme === 'dark';
  return (
    <div className="hf-appbar" style={{ background: dark ? 'var(--grey-900)' : 'var(--grey-50)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {date && <div className="t-caption" style={{ color: dark ? 'rgba(255,255,255,0.6)' : 'var(--grey-500)' }}>{date}</div>}
        <h1 style={{ marginTop: 2, color: dark ? '#fff' : 'var(--grey-900)' }}>{title}</h1>
        {subtitle && <div className="t-body-sm" style={{ color: dark ? 'rgba(255,255,255,0.7)' : 'var(--grey-600)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action !== undefined ? action : (
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Icon.bell style={{ width: 24, height: 24, color: dark ? '#fff' : 'var(--grey-700)' }} />
          {hasBadge && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--danger)', borderRadius: 999, border: '2px solid ' + (dark ? 'var(--grey-900)' : 'var(--grey-50)') }} />}
        </div>
      )}
    </div>
  );
}

// Section title — used above lists/cards everywhere
function SectionTitle({ title, action, onAction, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
        <div className="t-subtitle" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {hint && <div className="t-caption c-mute">{hint}</div>}
      </div>
      {action && (
        <span onClick={onAction} className="t-caption-strong" style={{ color: 'var(--brand)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {action}<Icon.chevR className="icon-12" />
        </span>
      )}
    </div>
  );
}

// Card primitive — replaces ad-hoc div patterns
function Card({ children, padding = 16, variant = 'plain', onClick, style }) {
  const cls = variant === 'elevated' ? 'hf-card-featured' : variant === 'subtle' ? '' : 'hf-card';
  const subtleBg = variant === 'subtle' ? { background: 'var(--grey-100)', borderRadius: 'var(--r-md)' } : {};
  return (
    <div className={cls} onClick={onClick} style={{ padding, cursor: onClick ? 'pointer' : 'default', ...subtleBg, ...style }}>
      {children}
    </div>
  );
}

// KPI stat card — caption + big number + optional delta
function KPIStat({ label, value, unit, delta, deltaPositive, hint, color, size = 'md' }) {
  const numCls = size === 'lg' ? 't-number-lg' : size === 'xl' ? 't-number-xl' : 't-number-md';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <div className="t-caption-strong c-mute">{label}</div>
      <div className={numCls} style={{ color: color || 'var(--grey-900)', display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span>{value}</span>
        {unit && <span style={{ fontSize: '0.5em', fontWeight: 600, color: 'var(--grey-500)' }}>{unit}</span>}
      </div>
      {(delta || hint) && (
        <div className="row g-4">
          {delta && <span className="t-caption-strong" style={{ color: deltaPositive ? 'var(--success)' : 'var(--danger)' }}>{delta}</span>}
          {hint && <span className="t-caption c-mute">{hint}</span>}
        </div>
      )}
    </div>
  );
}

// List row — avatar/icon + title + sub + meta + chevron
function ListRow({ leading, title, subtitle, meta, trailing = 'chevron', onClick, selected, danger, divider = true }) {
  const trail = trailing === 'chevron'
    ? <Icon.chevR style={{ width: 16, height: 16, color: 'var(--grey-400)', flexShrink: 0 }} />
    : trailing;
  return (
    <div onClick={onClick} className="tap" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      borderBottom: divider ? '1px solid var(--grey-100)' : 'none',
      background: selected ? 'var(--brand-soft)' : 'transparent',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {leading && <div className="shrink-0">{leading}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="t-body-strong" style={{
          color: selected ? 'var(--brand)' : danger ? 'var(--danger)' : 'var(--grey-900)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{title}</div>
        {subtitle && <div className="t-caption" style={{ color: 'var(--grey-500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>}
      </div>
      {meta && <div className="t-caption num c-mute shrink-0">{meta}</div>}
      {trail}
    </div>
  );
}

// Form field wrapper — label + control + helper/error
function FormField({ label, error, hint, children, required }) {
  return (
    <div className="mb-16">
      {label && (
        <label className="hf-field-label row g-4">
          {label}
          {required && <span className="c-danger">*</span>}
        </label>
      )}
      {children}
      {error ? <div className="hf-field-error">{error}</div> : hint ? <div className="hf-field-hint">{hint}</div> : null}
    </div>
  );
}

// Status chip with built-in dot
function StatusChip({ status, label, size }) {
  const map = {
    office: ['success', '본사'],
    wfh: ['brand', '재택'],
    leave: ['warn', '연차'],
    break: ['caution', '휴게'],
    off: ['', '오프'],
    pending: ['warn', '대기'],
    approved: ['success', '승인'],
    rejected: ['danger', '반려'],
  };
  const [variant, defaultLabel] = map[status] || ['', status];
  return (
    <span className={`hf-chip ${variant}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, ...(size === 'sm' ? { fontSize: 11, padding: '2px 8px' } : {}) }}>
      <span className={`hf-dot ${status}`} style={{ width: size === 'sm' ? 5 : 6, height: size === 'sm' ? 5 : 6 }} />
      {label || defaultLabel}
    </span>
  );
}

// Stat row — 3 evenly-spaced label+value cells
function StatRow({ items, color }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ minWidth: 0 }}>
          <div className="t-caption" style={{ color: color === 'inverse' ? 'rgba(255,255,255,0.7)' : 'var(--grey-500)' }}>{it.label}</div>
          <div className="num t-body-strong" style={{ marginTop: 4, color: color === 'inverse' ? '#fff' : 'var(--grey-900)' }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

// Bottom sheet handle bar
function SheetHandle() {
  return <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--grey-300)', margin: '0 auto 14px' }} />;
}

Object.assign(window, {
  Icon, StatusBar, Avatar, TabBar,
  EmptyState, Skeleton, SuccessConfirm, FieldError, Toast, BigNumber,
  PageHeader, SectionTitle, Card, KPIStat, ListRow, FormField, StatusChip, StatRow, SheetHandle,
});
