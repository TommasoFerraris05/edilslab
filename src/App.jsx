export default function App() {
  useEffect(() => {
    if (document.getElementById('es-global-style')) return;
    const s = document.createElement('style');
    s.id = 'es-global-style';
    s.innerHTML = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
`;
    document.head.appendChild(s);
  }, []);

  const [screen, setScreen] = useState('home');
  const [user, setUser] = useState(() => {
    try {
      const u = sessionStorage.getItem('es_u');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });
  const [page, setPage] = useState('dashboard');
  const [users, setUsers] = useState(INITIAL_USERS);
  const [pending, setPending] = useState(INITIAL_PENDING);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mob = useIsMobile();
  const [sharedHistory, setSharedHistory] = useState([]);

  const handleDeleteAccount = (email) => {
    setUsers((us) => us.filter((u) => u.email !== email));
    logout();
  };

  useEffect(() => {
    if (user) setScreen('dashboard');
    try {
      const saved = localStorage.getItem('es_shared_history');
      if (saved) setSharedHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const addToHistory = (title, mode, userName) => {
    setSharedHistory((prev) => {
      const entry = {
        id: Date.now(),
        title,
        mode,
        user: userName,
        date: new Date().toLocaleDateString('it-CH'),
      };
      const updated = [entry, ...prev.filter((h) => h.title !== title)].slice(0, 30);
      try { localStorage.setItem('es_shared_history', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const login = (u) => { setUser(u); setScreen('dashboard'); };
  const logout = () => {
    setUser(null); setScreen('home'); setPage('dashboard');
    try { sessionStorage.removeItem('es_u'); } catch (e) {}
  };
  const addPending = (u) => setPending((p) => [...p, u]);
  const approve = (email) => {
    const u = pending.find((p) => p.email === email);
    if (u) {
      setUsers((us) => [...us, { ...u, role: 'user', status: 'approved' }]);
      setPending((p) => p.filter((p) => p.email !== email));
    }
  };
  const reject = (email) => setPending((p) => p.filter((p) => p.email !== email));

  if (screen === 'home') return <Homepage onLogin={() => setScreen('login')} onRegister={() => setScreen('register')} />;
  if (screen === 'login') return <Login users={users} onLogin={login} onRegister={() => setScreen('register')} />;
  if (screen === 'register') return <Register users={users} pending={pending} onBack={() => setScreen('login')} onSuccess={(u) => { addPending(u); setScreen('pending'); }} />;
  if (screen === 'pending') return <PendingScreen onBack={() => setScreen('login')} />;
  if (!user) return <Homepage onLogin={() => setScreen('login')} />;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'chat_docs', label: 'Chat Documenti', icon: 'docs' },
    { id: 'chat_ai', label: 'Chat Edilizia', icon: 'chat' },
    { id: 'ranking', label: 'Graduatorie', icon: 'podio' },
    { id: 'gantt', label: 'Programma Lavori', icon: 'gantt' },
    { id: 'reports', label: 'Rapporti Tecnici', icon: 'file' },
    ...(user.role === 'admin' ? [{ id: 'docs', label: 'Gestione Documenti', icon: 'folder' }] : []),
    { id: 'progetti', label: 'Cartelle Progetto', icon: 'folder' },
    { id: 'profile', label: 'Profilo', icon: 'user' },
    ...(user.role === 'admin' ? [{ id: 'admin', label: 'Gestione utenti', icon: 'users' }] : []),
  ];

  const titles = {
    dashboard: 'Dashboard', chat_docs: 'Chat Documenti', chat_ai: 'Chat Edilizia',
    ranking: 'Graduatorie', gantt: 'Programma Lavori', reports: 'Rapporti Tecnici',
    docs: 'Documenti', profile: 'Profilo', admin: 'Gestione utenti', progetti: 'Cartelle Progetto',
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid ' + T.sidebarBorder }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: T.gradBlue, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={PATHS.building} size={18} stroke="#fff" />
          </div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 17 }}>Edilslab</div>
            <div style={{ color: '#475569', fontSize: 10 }}>Svizzera Italiana</div>
          </div>
          {mob && (
            <div onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', color: '#475569', cursor: 'pointer' }}>
              <Icon d={PATHS.close} size={18} />
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '14px 10px', flex: 1, overflow: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', marginBottom: 8 }}>Menu</div>
        {navItems.map((n) => (
          <div
            key={n.id}
            onClick={() => { setPage(n.id); setSidebarOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, cursor: 'pointer', marginBottom: 2, background: page === n.id ? 'rgba(59,130,246,0.15)' : 'transparent', color: page === n.id ? '#60a5fa' : '#64748b', fontSize: 13, fontWeight: page === n.id ? 700 : 400 }}
          >
            <Icon d={PATHS[n.icon]} size={16} />
            {n.label}
            {n.id === 'admin' && pending.length > 0 && (
              <span style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: T.amber, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pending.length}</span>
            )}
          </div>
        ))}

        <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', padding: '12px 8px 8px', marginTop: 4 }}>Recenti</div>
        {sharedHistory.length === 0 && (
          <div style={{ fontSize: 11, color: '#334155', padding: '4px 12px', fontStyle: 'italic' }}>Nessuna conversazione</div>
        )}
        {sharedHistory.slice(0, 8).map((h) => (
          <div
            key={h.id}
            onClick={() => { setPage(h.mode === 'docs' ? 'chat_docs' : 'chat_ai'); setSidebarOpen(false); }}
            style={{ padding: '7px 12px', borderRadius: 7, cursor: 'pointer', marginBottom: 2, color: '#475569', fontSize: 12, display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <Icon d={PATHS.clock} size={12} />
            <div style={{ minWidth: 0 }}>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#94a3b8', fontSize: 10 }}>{h.user}</div>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.title}</div>
            </div>
            <span style={{ fontSize: 10, color: '#334155', flexShrink: 0, marginLeft: 4 }}>{h.date}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 10px', borderTop: '1px solid ' + T.sidebarBorder }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.gradBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>{user.role}</div>
          </div>
          <div onClick={logout} style={{ cursor: 'pointer', color: '#475569', padding: 4 }}>
            <Icon d={PATHS.logout} size={15} />
          </div>
        </div>
      </div>
    </div>
  );

  // Larghezza massima contenuto per pagina — full su Gantt, ampia su dashboard
  const contentMaxWidth = {
    gantt: '100%',
    dashboard: 1400,
    ranking: 1100,
    chat_docs: 1000,
    chat_ai: 1000,
  };
  const maxW = contentMaxWidth[page] || 900;

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", minHeight: '100vh', background: T.surfaceAlt, color: T.text, display: 'flex' }}>
      {/* Sidebar desktop */}
      {!mob && (
        <div style={{ width: 240, background: T.sidebar, minHeight: '100vh', flexShrink: 0, borderRight: '1px solid ' + T.sidebarBorder }}>
          <SidebarContent />
        </div>
      )}

      {/* Sidebar mobile overlay */}
      {mob && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ width: 240, background: T.sidebar, height: '100vh', borderRight: '1px solid ' + T.sidebarBorder }}>
            <SidebarContent />
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: T.surface, borderBottom: '1px solid ' + T.border, padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {mob && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textSub, padding: 6 }}>
                <Icon d={PATHS.menu} size={22} />
              </button>
            )}
            {page !== 'dashboard' && (
              <button onClick={() => setPage('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: T.textSub, padding: '4px 6px', borderRadius: 7, fontSize: 12, fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                {!mob && 'Dashboard'}
              </button>
            )}
            {page !== 'dashboard' && <span style={{ color: T.border, fontSize: 16 }}>/</span>}
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>{titles[page]}</div>
          </div>

          {/* Destra topbar: solo badge Admin se admin, nient'altro */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user.role === 'admin' && (
              <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: '#eff6ff', color: T.blue }}>Admin</span>
            )}
          </div>
        </div>

        {/* Contenuto pagine — centrato con max-width adattivo */}
        <div style={{ flex: 1, overflow: 'auto', padding: mob ? 14 : '26px 32px' }}>
          <div style={{ maxWidth: maxW, margin: '0 auto', width: '100%' }}>
            {page === 'dashboard' && <DashHome user={user} setPage={setPage} users={users} />}
            {page === 'chat_docs' && <Chat user={user} mode="docs" onAddHistory={addToHistory} />}
            {page === 'chat_ai' && <Chat user={user} mode="general" onAddHistory={addToHistory} />}
            {page === 'ranking' && <Ranking />}
            {page === 'gantt' && <GanttPlanner user={user} />}
            {page === 'reports' && <Reports user={user} />}
            {page === 'docs' && (user.role === 'admin' ? <Documents /> : <AccessDenied />)}
            {page === 'profile' && <Profile user={user} onDeleteAccount={handleDeleteAccount} />}
            {page === 'progetti' && <Progetti user={user} users={users} />}
            {page === 'admin' && (user.role === 'admin' ? <AdminUsers users={users} pending={pending} onApprove={approve} onReject={reject} /> : <AccessDenied />)}
          </div>
        </div>
      </div>
    </div>
  );
}
