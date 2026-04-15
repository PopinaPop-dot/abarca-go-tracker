import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  CheckCircle2,
  Circle,
  Target,
  CalendarCheck,
  CalendarClock,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────
const INITIAL_PROJECTS = [
  {
    id: 'setup',
    name: '⚙️ Setup Compartido',
    emoji: '',
    color: '#6366f1',
    hito: { label: 'Entorno listo + 4 apps online', scheduled: '2026-04-18', real: '' },
    tasks: [
      { id: 's01', text: 'S01-SETUP: Instalar Node.js en notebook', done: false },
      { id: 's02', text: 'S02-SETUP: Instalar Claude Code', done: false },
      { id: 's03', text: 'S03-SETUP: Configurar Git (user + email)', done: false },
      { id: 's04', text: 'S04-SETUP: Verificar cuenta GitHub', done: false },
      { id: 's05', text: 'S05-SETUP: Crear repo abarca-go-visitas', done: false },
      { id: 's06', text: 'S06-SETUP: Crear repo abarca-go-pop', done: false },
      { id: 's07', text: 'S07-SETUP: Crear repo abarca-go-cobranzas', done: false },
      { id: 's08', text: 'S08-SETUP: Crear proyecto React+Vite (Visitas)', done: false },
      { id: 's09', text: 'S09-SETUP: Crear proyecto React+Vite (POP)', done: false },
      { id: 's10', text: 'S10-SETUP: Crear proyecto React+Vite (Cobros)', done: false },
      { id: 's11', text: 'S11-DEPLOY: Crear cuenta Vercel', done: false },
      { id: 's12', text: 'S12-DEPLOY: Conectar Vercel → Visitas', done: false },
      { id: 's13', text: 'S13-DEPLOY: Conectar Vercel → POP', done: false },
      { id: 's14', text: 'S14-DEPLOY: Conectar Vercel → Cobros', done: false },
      { id: 's15', text: 'S15-TEST: Probar URLs en celular Android', done: false },
    ],
  },
  {
    id: 'visitas',
    name: '📍 Abarca GO Visitas',
    emoji: '',
    color: '#10b981',
    hito: { label: 'Módulo de visitas operativo', scheduled: '2026-06-01', real: '' },
    tasks: [
      { id: 'v1', text: 'Diseñar flujo de registro de visitas', done: false },
      { id: 'v2', text: 'Crear formulario de alta de visita', done: false },
      { id: 'v3', text: 'Implementar geolocalización', done: false },
      { id: 'v4', text: 'Dashboard de visitas por zona', done: false },
      { id: 'v5', text: 'Reportes exportables (PDF/Excel)', done: false },
    ],
  },
  {
    id: 'pop',
    name: '📦 Abarca GO POP',
    emoji: '',
    color: '#f59e0b',
    hito: { label: 'Gestión POP en producción', scheduled: '2026-07-01', real: '' },
    tasks: [
      { id: 'p1', text: 'Catálogo de materiales POP', done: false },
      { id: 'p2', text: 'Sistema de solicitudes de material', done: false },
      { id: 'p3', text: 'Control de stock y distribución', done: false },
      { id: 'p4', text: 'Registro fotográfico de instalación', done: false },
      { id: 'p5', text: 'Métricas de efectividad POP', done: false },
    ],
  },
  {
    id: 'cobranzas',
    name: '💰 Abarca GO Cobros',
    emoji: '',
    color: '#ef4444',
    hito: { label: 'Cobranzas automatizadas', scheduled: '2026-08-01', real: '' },
    tasks: [
      { id: 'c1', text: 'Modelo de datos de cuentas por cobrar', done: false },
      { id: 'c2', text: 'Integración con sistema contable', done: false },
      { id: 'c3', text: 'Alertas de vencimientos', done: false },
      { id: 'c4', text: 'Panel de seguimiento de pagos', done: false },
      { id: 'c5', text: 'Reportes de morosidad', done: false },
    ],
  },
  {
    id: 'tracker',
    name: '📊 Abarca GO Tracker',
    emoji: '',
    color: '#8b5cf6',
    hito: { label: 'Tracker operativo y publicado', scheduled: '2026-04-18', real: '' },
    tasks: [
      { id: 't1', text: 'Diseñar tracker con tareas y hitos', done: false },
      { id: 't2', text: 'Deployar en Vercel', done: false },
      { id: 't3', text: 'Configurar modo admin con PIN', done: false },
      { id: 't4', text: 'Configurar vista pública solo lectura', done: false },
      { id: 't5', text: 'Agregar fechas programadas vs reales en hitos', done: false },
    ],
  },
];

const STORAGE_KEY = 'abarca-go-tracker';
const PIN = '5689*';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function mergeWithDefaults(saved) {
  if (!saved) return INITIAL_PROJECTS;
  return INITIAL_PROJECTS.map((def) => {
    const s = saved.find((p) => p.id === def.id);
    if (!s) return def;
    return {
      ...def,
      hito: { ...def.hito, real: s.hito?.real || '' },
      tasks: def.tasks.map((t) => {
        const st = s.tasks?.find((x) => x.id === t.id);
        return st ? { ...t, done: st.done } : t;
      }),
    };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pct(tasks) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
}

function globalPct(projects) {
  const all = projects.flatMap((p) => p.tasks);
  return pct(all);
}

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Components ──────────────────────────────────────────────────────────────

function ProgressBar({ value, color, height = 10 }) {
  return (
    <div
      style={{
        width: '100%',
        background: '#e5e7eb',
        borderRadius: height / 2,
        overflow: 'hidden',
        height,
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          background: color,
          borderRadius: height / 2,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

function HitoSection({ hito, color, isAdmin, onChange }) {
  return (
    <div
      style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '12px 16px',
        marginBottom: 12,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <Target size={18} color={color} style={{ flexShrink: 0 }} />
      <span style={{ fontWeight: 600, color: '#334155', fontSize: 14 }}>
        HITO: {hito.label}
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 13,
          color: '#64748b',
        }}
      >
        <CalendarClock size={14} /> Programado: {fmtDate(hito.scheduled)}
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 13,
          color: hito.real ? '#16a34a' : '#94a3b8',
        }}
      >
        <CalendarCheck size={14} /> Real:{' '}
        {isAdmin ? (
          <input
            type="date"
            value={hito.real}
            onChange={(e) => onChange(e.target.value)}
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 13,
              color: '#334155',
              background: '#fff',
            }}
          />
        ) : (
          fmtDate(hito.real)
        )}
      </span>
    </div>
  );
}

function TaskItem({ task, color, isAdmin, onToggle }) {
  const Icon = task.done ? CheckCircle2 : Circle;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 0',
        borderBottom: '1px solid #f1f5f9',
        cursor: isAdmin ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      onClick={isAdmin ? onToggle : undefined}
    >
      <Icon
        size={20}
        color={task.done ? color : '#cbd5e1'}
        fill={task.done ? color : 'none'}
        style={{ flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: 14,
          color: task.done ? '#94a3b8' : '#334155',
          textDecoration: task.done ? 'line-through' : 'none',
          transition: 'color 0.2s',
        }}
      >
        {task.text}
      </span>
    </div>
  );
}

function ProjectCard({ project, isAdmin, onToggleTask, onHitoChange }) {
  const [open, setOpen] = useState(false);
  const progress = pct(project.tasks);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        marginBottom: 16,
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Card header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Chevron size={20} color="#64748b" />
        <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', flex: 1 }}>
          {project.name}
        </span>
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: project.color,
            minWidth: 44,
            textAlign: 'right',
          }}
        >
          {progress}%
        </span>
      </div>

      {/* Progress bar under header */}
      <div style={{ padding: '0 20px 12px' }}>
        <ProgressBar value={progress} color={project.color} />
      </div>

      {/* Expandable body */}
      {open && (
        <div style={{ padding: '0 20px 20px' }}>
          <HitoSection
            hito={project.hito}
            color={project.color}
            isAdmin={isAdmin}
            onChange={(val) => onHitoChange(project.id, val)}
          />
          {project.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              color={project.color}
              isAdmin={isAdmin}
              onToggle={() => onToggleTask(project.id, task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [projects, setProjects] = useState(() => mergeWithDefaults(loadState()));
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    saveState(projects);
  }, [projects]);

  const toggleTask = useCallback((projectId, taskId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t
              ),
            }
          : p
      )
    );
  }, []);

  const setHitoReal = useCallback((projectId, value) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, hito: { ...p.hito, real: value } } : p
      )
    );
  }, []);

  const handlePinSubmit = () => {
    if (pinInput === PIN) {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const gPct = globalPct(projects);

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: 0.5 }}>
            ABARCA GO — Tracker de Proyectos
          </h1>
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <ProgressBar value={gPct} color="#38bdf8" height={8} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#38bdf8', minWidth: 40 }}>
              {gPct}%
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (isAdmin) {
              setIsAdmin(false);
            } else {
              setShowPinModal(true);
            }
          }}
          style={{
            background: isAdmin ? '#16a34a' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: 10,
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {isAdmin ? <Unlock size={16} /> : <Lock size={16} />}
          {isAdmin ? 'Admin activo' : 'Modo admin'}
        </button>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 40px' }}>
        {isAdmin && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              borderRadius: 10,
              padding: '10px 16px',
              marginBottom: 20,
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Unlock size={16} />
            Modo administrador — podés editar tareas e hitos
          </div>
        )}

        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isAdmin={isAdmin}
            onToggleTask={toggleTask}
            onHitoChange={setHitoReal}
          />
        ))}
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '20px 16px',
          color: '#64748b',
          fontSize: 13,
          borderTop: '1px solid #e2e8f0',
          background: '#fff',
        }}
      >
        Gloria Voelker — Transformación Digital — Abarca SRL — 2026
      </footer>

      {/* PIN Modal */}
      {showPinModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => {
            setShowPinModal(false);
            setPinInput('');
            setPinError(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 340,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Lock size={32} color="#6366f1" />
              <h2 style={{ margin: '12px 0 4px', fontSize: 18, color: '#1e293b' }}>
                Acceso Admin
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Ingresá el PIN para editar
              </p>
            </div>
            <input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 20,
                textAlign: 'center',
                letterSpacing: 8,
                border: `2px solid ${pinError ? '#ef4444' : '#e2e8f0'}`,
                borderRadius: 10,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            {pinError && (
              <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', margin: '8px 0 0' }}>
                PIN incorrecto
              </p>
            )}
            <button
              onClick={handlePinSubmit}
              style={{
                width: '100%',
                padding: '12px 0',
                marginTop: 16,
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Ingresar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
