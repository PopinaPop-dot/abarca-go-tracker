import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown, ChevronRight, Lock, Unlock,
  CheckCircle2, Circle, Target, CalendarCheck,
  CalendarClock, AlertTriangle, X, Calendar, List
} from 'lucide-react';

// ─── CONFIG ──────────────────────────────────────────────────
const PIN = '259999*'; // ← CAMBIÁ POR TU PIN REAL
const APPS_SCRIPT_URL = 'TU_URL_EXEC_ACÁ';
const USE_BACKEND = APPS_SCRIPT_URL !== 'TU_URL_EXEC_ACÁ';

// ─── Data ────────────────────────────────────────────────────
const INITIAL_PROJECTS = [
  {
    id: 'setup',
    name: '⚙️ Setup Compartido',
    color: '#6366f1',
    hito: { label: 'Entorno listo + 4 apps online', scheduled: '2026-04-18', real: '2026-04-15' },
    tasks: [
      { id: 's01', text: 'S01: Instalar Node.js + Claude Code', done: true, date: '2026-04-15' },
      { id: 's02', text: 'S02: Configurar Git + GitHub (PopinaPop-dot)', done: true, date: '2026-04-15' },
      { id: 's03', text: 'S03: Crear 4 repos GitHub', done: true, date: '2026-04-15' },
      { id: 's04', text: 'S04: Crear 4 proyectos React+Vite', done: true, date: '2026-04-15' },
      { id: 's05', text: 'S05: Crear cuenta Vercel (popinapop-dot)', done: true, date: '2026-04-15' },
      { id: 's06', text: 'S06: Deploy 4 apps en Vercel', done: true, date: '2026-04-15' },
      { id: 's07', text: 'S07: Probar URLs en celular Android', done: false, date: '2026-04-24' },
    ],
  },
  // 🥇 PRIORIDAD 1
  {
    id: 'pop',
    name: '📦 Abarca GO POP',
    color: '#f97316',
    hito: { label: 'Gestión POP en producción', scheduled: '2026-05-16', real: '' },
    tasks: [
      { id: 'p01', text: 'P01: Prototipo v1.3 validado en artifact', done: true, date: '2026-04-15' },
      { id: 'p02', text: 'P02: Correcciones post-prueba celular', done: false, date: '2026-04-28' },
      { id: 'p03', text: 'P03: Catálogo real 28 productos en Google Sheet', done: false, date: '2026-04-29' },
      { id: 'p04', text: 'P04: Padrón de clientes cargado (500-2000)', done: false, date: '2026-04-30' },
      { id: 'p05', text: 'P05: Backend Apps Script — pedidos + catálogo', done: false, date: '2026-05-05' },
      { id: 'p06', text: 'P06: Alertas canal/categoría + comodato', done: false, date: '2026-05-07' },
      { id: 'p07', text: 'P07: 4 roles funcionando (Usuario/Enlace/Gestor/Stocker)', done: false, date: '2026-05-12' },
      { id: 'p08', text: 'P08: Offline + localStorage + semáforo sync', done: false, date: '2026-05-14' },
      { id: 'p09', text: 'P09: Piloto con preventistas reales', done: false, date: '2026-05-16' },
    ],
  },
  // 🥈 PRIORIDAD 2
  {
    id: 'cobranzas',
    name: '💰 Abarca GO Cobranzas',
    color: '#ef4444',
    hito: { label: 'Simulación 3 roles aprobada por el equipo', scheduled: '2026-04-30', real: '' },
    tasks: [
      { id: 'c01', text: 'C01: Prototipo v3.5 validado con Juan Ángel', done: true, date: '2026-04-09' },
      { id: 'c02', text: 'C02: Construir simulación sistema completo (3 roles)', done: false, date: '2026-04-28' },
      { id: 'c03', text: 'C03: Validar simulación con Tesorería + Cuentas Corrientes', done: false, date: '2026-04-30' },
      { id: 'c04', text: 'C04: v4.0 Entregable 1 — base (6 mejoras)', done: false, date: '2026-05-14' },
      { id: 'c05', text: 'C05: v4.0 Entregable 2 — nuevos medios de pago', done: false, date: '2026-05-21' },
      { id: 'c06', text: 'C06: v4.0 Entregable 3 — vales y flujo final', done: false, date: '2026-05-28' },
      { id: 'c07', text: 'C07: Testing Moto Edge 60 + iPhone Juan Ángel', done: false, date: '2026-06-04' },
      { id: 'c08', text: 'C08: Deploy en Claude Code + Vercel', done: false, date: '2026-06-05' },
      { id: 'c09', text: 'C09: Backend real — Google Sheets + Apps Script', done: false, date: '2026-06-11' },
      { id: 'c10', text: 'C10: Roles Tesorería + Cuentas Corrientes construidos', done: false, date: '2026-06-20' },
    ],
  },
  // 🥉 PRIORIDAD 3
  {
    id: 'migracion',
    name: '📧 Migración Automática Emails',
    color: '#64748b',
    hito: { label: 'Migración completa + bajas de licencias', scheduled: '2026-06-30', real: '' },
    tasks: [
      { id: 'm01', text: 'M01: Diseño arquitectura + scripts inventario', done: true, date: '2026-04-20' },
      { id: 'm02', text: 'M02: Crear proyecto Google Cloud + Service Account', done: false, date: '2026-04-24' },
      { id: 'm03', text: 'M03: Habilitar Gmail API + Admin SDK', done: false, date: '2026-04-24' },
      { id: 'm04', text: 'M04: Configurar delegación de dominio', done: false, date: '2026-04-25' },
      { id: 'm05', text: 'M05: Validar inventario con datos reales — para reunión', done: false, date: '2026-04-25' },
      { id: 'm06', text: 'M06: Crear 11 cuentas @gmail destino', done: false, date: '2026-04-30' },
      { id: 'm07', text: 'M07: Scripts de migración desarrollados', done: false, date: '2026-05-05' },
      { id: 'm08', text: 'M08: Dry run + piloto Manuel', done: false, date: '2026-05-07' },
      { id: 'm09', text: 'M09: Tandas 1-3 (Manuel, Orlando, Nora, Delia, Nicolás, Diego)', done: false, date: '2026-05-14' },
      { id: 'm10', text: 'M10: Tandas 4-6 (Julio, José M., Victoria, Juan Á., José I.)', done: false, date: '2026-05-28' },
      { id: 'm11', text: 'M11: Transición — auto-respuesta + entrega a usuarios', done: false, date: '2026-06-04' },
      { id: 'm12', text: 'M12: Baja de 11 licencias Workspace (~USD 126/mes ahorrados)', done: false, date: '2026-06-30' },
    ],
  },
  // 4️⃣ PRIORIDAD 4
  {
    id: 'visitas',
    name: '📍 Abarca GO Visitas',
    color: '#8b5cf6',
    hito: { label: 'Módulo operativo en piloto con repositores', scheduled: '2026-05-30', real: '' },
    tasks: [
      { id: 'vis01', text: 'VIS01: Validar flujo final con dueños', done: false, date: '2026-05-12' },
      { id: 'vis02', text: 'VIS02: Construir prototipo en Claude Code', done: false, date: '2026-05-13' },
      { id: 'vis03', text: 'VIS03: Prueba en celular real + correcciones', done: false, date: '2026-05-14' },
      { id: 'vis04', text: 'VIS04: Backend Google Sheets + Apps Script', done: false, date: '2026-05-19' },
      { id: 'vis05', text: 'VIS05: Login abarcano + PIN + GPS + foto', done: false, date: '2026-05-20' },
      { id: 'vis06', text: 'VIS06: Offline + semáforo sync 🟢/🟡', done: false, date: '2026-05-21' },
      { id: 'vis07', text: 'VIS07: Piloto con 2-3 repositores reales', done: false, date: '2026-05-27' },
      { id: 'vis08', text: 'VIS08: Correcciones post-piloto', done: false, date: '2026-05-30' },
    ],
  },
  // ⏸️ EN PAUSA
  {
    id: 'catalogo',
    name: '🌐 Catálogo Combos Abarca',
    color: '#0ea5e9',
    hito: { label: 'Catálogo publicado con imágenes y hosting', scheduled: '2026-04-23', real: '2026-04-23' },
    tasks: [
      { id: 'cat01', text: 'CAT01: Diseño v2 construido y validado', done: true, date: '2026-04-17' },
      { id: 'cat02', text: 'CAT02: 60+ combos del ERP cargados', done: true, date: '2026-04-17' },
      { id: 'cat03', text: 'CAT03: Modo admin + exportar HTML funcionando', done: true, date: '2026-04-17' },
      { id: 'cat04', text: 'CAT04: Hosting decidido y configurado', done: true, date: '2026-04-23' },
      { id: 'cat05', text: 'CAT05: Logo real de Abarca en header', done: true, date: '2026-04-23' },
      { id: 'cat06', text: 'CAT06: Imágenes combos cargadas', done: true, date: '2026-04-23' },
      { id: 'cat07', text: 'CAT07: Filtro por stock disponibles', done: true, date: '2026-04-23' },
      { id: 'cat08', text: 'CAT08: Publicado y probado', done: true, date: '2026-04-23' },
    ],
  },
  {
    id: 'recibos',
    name: '🧾 Organizador Recibos Humand',
    color: '#f59e0b',
    hito: { label: 'v2.1 validada + empaquetada .exe', scheduled: '2026-05-30', real: '' },
    tasks: [
      { id: 'r01', text: 'R01: Correr v2.1 con los 402 PDFs reales', done: false, date: '2026-05-19' },
      { id: 'r02', text: 'R02: Verificar que errores bajaron vs v2.0', done: false, date: '2026-05-19' },
      { id: 'r03', text: 'R03: Validar 66 recibos sin firma con RRHH', done: false, date: '2026-05-20' },
      { id: 'r04', text: 'R04: Revisar ~6 PDFs sin período detectado', done: false, date: '2026-05-20' },
      { id: 'r05', text: 'R05: Verificar Salida A — por empleado (84 PDFs)', done: false, date: '2026-05-21' },
      { id: 'r06', text: 'R06: Verificar Salida B — por mes', done: false, date: '2026-05-21' },
      { id: 'r07', text: 'R07: Cruzar 84 empleados detectados vs nómina real (~90)', done: false, date: '2026-05-27' },
      { id: 'r08', text: 'R08: Empaquetar como .exe para distribución sin Python', done: false, date: '2026-05-30' },
    ],
  },
  {
    id: 'vacaciones',
    name: '🏖️ Smart Vacaciones Humand',
    color: '#10b981',
    hito: { label: 'Dashboard con datos reales de API funcionando', scheduled: '2026-06-13', real: '' },
    tasks: [
      { id: 'v01', text: 'V01: Revisar estado actual del dashboard', done: false, date: '2026-06-01' },
      { id: 'v02', text: 'V02: Probar endpoints API Humand con key real', done: false, date: '2026-06-01' },
      { id: 'v03', text: 'V03: Mapear campos API → dashboard (círculo, líder)', done: false, date: '2026-06-02' },
      { id: 'v04', text: 'V04: Conectar datos reales al dashboard', done: false, date: '2026-06-04' },
      { id: 'v05', text: 'V05: Validar datos 32 empleados vs Humand', done: false, date: '2026-06-09' },
      { id: 'v06', text: 'V06: Decidir embed vs hosting externo', done: false, date: '2026-06-11' },
      { id: 'v07', text: 'V07: Publicar y entregar al equipo', done: false, date: '2026-06-13' },
    ],
  },
];

const STORAGE_KEY = 'abarca-go-tracker-v3';

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocal(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function mergeState(saved) {
  if (!saved) return INITIAL_PROJECTS;
  return INITIAL_PROJECTS.map(def => {
    const s = saved.find(p => p.id === def.id);
    if (!s) return def;
    return {
      ...def,
      hito: { ...def.hito, real: s.hito?.real || def.hito.real || '' },
      tasks: def.tasks.map(t => {
        const st = s.tasks?.find(x => x.id === t.id);
        return st ? { ...t, done: st.done, block: st.block || '', date: st.date || t.date || '' } : t;
      }),
    };
  });
}

async function fetchState() {
  if (!USE_BACKEND) return null;
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const data = await res.json();
    return data.ok ? data : null;
  } catch { return null; }
}

async function postChange(payload) {
  if (!USE_BACKEND) return;
  try { await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) }); }
  catch { }
}

function applyBackend(projects, backendData) {
  if (!backendData) return projects;
  const { tasks = [], blocks = [], hitos = [] } = backendData;
  return projects.map(p => {
    const hitoData = hitos.find(h => h.project_id === p.id);
    return {
      ...p,
      hito: { ...p.hito, real: hitoData?.real_date || p.hito.real || '' },
      tasks: p.tasks.map(t => {
        const td = tasks.find(x => x.task_id === t.id);
        const bd = blocks.find(x => x.task_id === t.id);
        return { ...t, done: td ? td.done : t.done, block: bd ? bd.comment : (t.block || '') };
      }),
    };
  });
}

function pct(tasks) {
  if (!tasks.length) return 0;
  return Math.round(tasks.filter(t => t.done).length / tasks.length * 100);
}

function globalPct(projects) {
  return pct(projects.flatMap(p => p.tasks));
}

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fmtDateShort(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  const months = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${months[parseInt(m)]}`;
}

function progressColor(value) {
  if (value < 30) return '#ef4444';
  if (value < 60) return '#f59e0b';
  if (value < 85) return '#84cc16';
  return '#22c55e';
}

function dateStatus(iso) {
  if (!iso) return 'none';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(iso + 'T00:00:00');
  if (d < today) return 'overdue';
  if (d.getTime() === today.getTime()) return 'today';
  return 'future';
}

function getWeekDays() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

// ─── Components ──────────────────────────────────────────────

function ProgressBar({ value, color, height = 10 }) {
  const c = color || progressColor(value);
  return (
    <div style={{ width: '100%', background: '#e5e7eb', borderRadius: height / 2, overflow: 'hidden', height }}>
      <div style={{ width: `${value}%`, height: '100%', background: c, borderRadius: height / 2, transition: 'width 0.4s ease' }} />
    </div>
  );
}

function DateChip({ iso, isAdmin, onChange, done }) {
  const [editing, setEditing] = useState(false);
  if (!iso && !isAdmin) return null;
  const status = done ? 'done' : dateStatus(iso);
  const colors = {
    done: { bg: '#f1f5f9', text: '#94a3b8', border: '#e2e8f0' },
    overdue: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    today: { bg: '#fff7ed', text: '#d97706', border: '#fed7aa' },
    future: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    none: { bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0' },
  };
  const c = colors[status];

  if (editing && isAdmin) {
    return (
      <input type="date" value={iso || ''} autoFocus
        onChange={e => { onChange(e.target.value); setEditing(false); }}
        onBlur={() => setEditing(false)}
        style={{ border: '1px solid #6366f1', borderRadius: 6, padding: '1px 6px', fontSize: 11, color: '#334155', background: '#fff', outline: 'none' }} />
    );
  }

  return (
    <span onClick={isAdmin ? () => setEditing(true) : undefined}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600, cursor: isAdmin ? 'pointer' : 'default', flexShrink: 0 }}>
      📅 {iso ? fmtDateShort(iso) : 'sin fecha'}
      {status === 'overdue' && !done && ' ⚠️'}
      {status === 'today' && !done && ' HOY'}
    </span>
  );
}

function HitoSection({ hito, color, isAdmin, onChange }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Target size={18} color={color} style={{ flexShrink: 0 }} />
      <span style={{ fontWeight: 600, color: '#334155', fontSize: 14 }}>HITO: {hito.label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b' }}>
        <CalendarClock size={14} /> Programado: {fmtDate(hito.scheduled)}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: hito.real ? '#16a34a' : '#94a3b8' }}>
        <CalendarCheck size={14} /> Real:{' '}
        {isAdmin ? (
          <input type="date" value={hito.real} onChange={e => onChange(e.target.value)}
            style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '2px 8px', fontSize: 13, color: '#334155', background: '#fff' }} />
        ) : fmtDate(hito.real)}
      </span>
    </div>
  );
}

function BlockBadge({ comment, isAdmin, onEdit, onClear }) {
  if (!comment && !isAdmin) return null;
  return (
    <div style={{ margin: '2px 0 4px 30px' }}>
      {comment ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: '#c2410c' }}>
          <AlertTriangle size={12} />
          <span>{comment}</span>
          {isAdmin && (
            <>
              <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c2410c', padding: '0 2px', fontSize: 11 }}>✏️</button>
              <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c2410c', padding: '0 2px' }}><X size={11} /></button>
            </>
          )}
        </div>
      ) : isAdmin ? (
        <button onClick={onEdit} style={{ background: 'none', border: '1px dashed #fed7aa', borderRadius: 6, padding: '2px 10px', fontSize: 11, color: '#94a3b8', cursor: 'pointer' }}>
          + bloqueo
        </button>
      ) : null}
    </div>
  );
}

function TaskItem({ task, color, isAdmin, onToggle, onBlockSave, onDateChange }) {
  const [editingBlock, setEditingBlock] = useState(false);
  const [draft, setDraft] = useState(task.block || '');
  const Icon = task.done ? CheckCircle2 : Circle;

  const handleSave = () => { onBlockSave(draft.trim()); setEditingBlock(false); };

  return (
    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', userSelect: 'none' }}>
        <div onClick={isAdmin ? onToggle : undefined} style={{ cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <Icon size={20} color={task.done ? color : '#cbd5e1'} fill={task.done ? color : 'none'} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: task.done ? '#94a3b8' : '#334155', textDecoration: task.done ? 'line-through' : 'none' }}>
            {task.text}
          </span>
        </div>
        <DateChip iso={task.date} isAdmin={isAdmin} onChange={onDateChange} done={task.done} />
      </div>

      {editingBlock ? (
        <div style={{ margin: '0 0 8px 30px', display: 'flex', gap: 6 }}>
          <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditingBlock(false); }}
            placeholder="Describí el bloqueo..."
            style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: 6, padding: '5px 10px', fontSize: 13, outline: 'none' }} />
          <button onClick={handleSave} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>OK</button>
          <button onClick={() => setEditingBlock(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
        </div>
      ) : (
        <BlockBadge comment={task.block} isAdmin={isAdmin}
          onEdit={() => { setDraft(task.block || ''); setEditingBlock(true); }}
          onClear={() => onBlockSave('')} />
      )}
    </div>
  );
}

function ProjectCard({ project, isAdmin, onToggleTask, onHitoChange, onBlockSave, onDateChange }) {
  const [open, setOpen] = useState(false);
  const progress = pct(project.tasks);
  const Chevron = open ? ChevronDown : ChevronRight;
  const blockedCount = project.tasks.filter(t => t.block && !t.done).length;
  const overdueCount = project.tasks.filter(t => !t.done && dateStatus(t.date) === 'overdue').length;
  const todayCount = project.tasks.filter(t => !t.done && dateStatus(t.date) === 'today').length;

  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 16, border: '1px solid #e2e8f0' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
        <Chevron size={20} color="#64748b" />
        <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', flex: 1 }}>{project.name}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {overdueCount > 0 && <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 20, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>⚠️ {overdueCount}</span>}
          {todayCount > 0 && <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#d97706', borderRadius: 20, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>HOY {todayCount}</span>}
          {blockedCount > 0 && <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', borderRadius: 20, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>🚧 {blockedCount}</span>}
          <span style={{ fontWeight: 700, fontSize: 14, color: progressColor(progress), minWidth: 44, textAlign: 'right' }}>{progress}%</span>
        </div>
      </div>
      <div style={{ padding: '0 20px 12px' }}><ProgressBar value={progress} height={8} /></div>
      {open && (
        <div style={{ padding: '0 20px 20px' }}>
          <HitoSection hito={project.hito} color={project.color} isAdmin={isAdmin} onChange={val => onHitoChange(project.id, val)} />
          {project.tasks.map(task => (
            <TaskItem key={task.id} task={task} color={project.color} isAdmin={isAdmin}
              onToggle={() => onToggleTask(project.id, task.id)}
              onBlockSave={comment => onBlockSave(project.id, task.id, comment)}
              onDateChange={date => onDateChange(project.id, task.id, date)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Resumen proyectos ────────────────────────────────────────
function ProjectsSummary({ projects }) {
  const done = projects.filter(p => pct(p.tasks) === 100);
  const inProgress = projects.filter(p => { const v = pct(p.tasks); return v > 0 && v < 100; });
  const notStarted = projects.filter(p => pct(p.tasks) === 0);
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
      {[
        { label: '✅ Terminados', count: done.length, bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
        { label: '🔧 En curso', count: inProgress.length, bg: '#fff7ed', border: '#fed7aa', color: '#d97706' },
        { label: '⏳ Sin iniciar', count: notStarted.length, bg: '#f8fafc', border: '#e2e8f0', color: '#94a3b8' },
      ].map(({ label, count, bg, border, color }) => (
        <div key={label} style={{ flex: 1, minWidth: 100, background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color }}>{count}</div>
          <div style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Vista Agenda ─────────────────────────────────────────────
function AgendaView({ projects, onToggleTask, onDateChange, onBlockSave }) {
  const [mode, setMode] = useState('week');
  const today = toISO(new Date());
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getWeekDaysFrom = (referenceDate) => {
    const d = new Date(referenceDate); d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => { const x = new Date(monday); x.setDate(monday.getDate() + i); return x; });
  };

  const thisWeekDays = getWeekDaysFrom(new Date());
  const nextWeekStart = new Date(thisWeekDays[0]);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const nextWeekDays = getWeekDaysFrom(nextWeekStart);

  const allTasks = projects.flatMap(p =>
    p.tasks.filter(t => !t.done && t.date).map(t => ({ ...t, projectName: p.name, projectColor: p.color, projectId: p.id }))
  );

  const tasksByDate = {};
  allTasks.forEach(t => { if (!tasksByDate[t.date]) tasksByDate[t.date] = []; tasksByDate[t.date].push(t); });

  const overdueTasks = allTasks.filter(t => dateStatus(t.date) === 'overdue');

  const renderTask = (task) => (
    <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 6 }}>
      <div onClick={() => onToggleTask(task.projectId, task.id)} style={{ cursor: 'pointer', marginTop: 1, flexShrink: 0 }}>
        <Circle size={18} color={task.projectColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: task.projectColor, fontWeight: 700, marginBottom: 2 }}>{task.projectName}</div>
        <div style={{ fontSize: 13, color: '#334155' }}>{task.text}</div>
        {task.block && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 4, padding: '2px 6px', fontSize: 11, color: '#c2410c', marginTop: 4 }}>
            <AlertTriangle size={10} /> {task.block}
          </div>
        )}
      </div>
      <input type="date" value={task.date || ''} onChange={e => onDateChange(task.projectId, task.id, e.target.value)}
        style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 6px', fontSize: 11, color: '#64748b', background: '#f8fafc', cursor: 'pointer' }} />
    </div>
  );

  const renderWeekList = (days) => days.map(day => {
    const iso = toISO(day);
    const dayTasks = tasksByDate[iso] || [];
    const isToday = iso === today;
    const isPast = iso < today;
    return (
      <div key={iso} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: isToday ? '#d97706' : isPast ? '#94a3b8' : '#334155' }}>
            {dayNames[day.getDay()]} {fmtDate(iso)}
          </span>
          {isToday && <span style={{ background: '#fed7aa', color: '#d97706', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 700 }}>HOY</span>}
          {dayTasks.length > 0 && <span style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>{dayTasks.length}</span>}
        </div>
        {dayTasks.length === 0
          ? <div style={{ color: '#cbd5e1', fontSize: 12, paddingLeft: 8 }}>Sin tareas</div>
          : dayTasks.map(renderTask)}
      </div>
    );
  });

  return (
    <div>
      <ProjectsSummary projects={projects} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[{ key: 'today', label: '📅 Hoy' }, { key: 'week', label: '📆 Esta semana' }, { key: 'nextweek', label: '➡️ Próxima semana' }].map(({ key, label }) => (
          <button key={key} onClick={() => setMode(key)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: mode === key ? '#1e293b' : '#e2e8f0', color: mode === key ? '#fff' : '#64748b' }}>
            {label}
          </button>
        ))}
      </div>

      {overdueTasks.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 13, marginBottom: 8 }}>⚠️ Vencidas — reprogramar ({overdueTasks.length})</div>
          {overdueTasks.map(renderTask)}
        </div>
      )}

      {mode === 'today' && (
        <div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 14, marginBottom: 10 }}>Hoy — {fmtDate(today)}</div>
          {(tasksByDate[today] || []).length === 0
            ? <div style={{ color: '#94a3b8', fontSize: 13, padding: '20px 0' }}>🎉 No hay tareas para hoy</div>
            : (tasksByDate[today] || []).map(renderTask)}
        </div>
      )}

      {mode === 'week' && (
        <div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 13, marginBottom: 12 }}>
            {fmtDate(toISO(thisWeekDays[0]))} → {fmtDate(toISO(thisWeekDays[6]))}
          </div>
          {renderWeekList(thisWeekDays)}
        </div>
      )}

      {mode === 'nextweek' && (
        <div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 13, marginBottom: 12 }}>
            {fmtDate(toISO(nextWeekDays[0]))} → {fmtDate(toISO(nextWeekDays[6]))}
          </div>
          {renderWeekList(nextWeekDays)}
        </div>
      )}
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState(() => mergeState(loadLocal()));
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    if (!USE_BACKEND) return;
    setSyncing(true);
    fetchState().then(data => {
      if (data) { setProjects(prev => applyBackend(prev, data)); setLastSync(new Date()); }
      setSyncing(false);
    });
  }, []);

  useEffect(() => { saveLocal(projects); }, [projects]);

  const toggleTask = useCallback((projectId, taskId) => {
    setProjects(prev => {
      const next = prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, done: !t.done }) });
      const task = next.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
      if (task) postChange({ type: 'toggle_task', task_id: taskId, done: task.done });
      return next;
    });
  }, []);

  const setHitoReal = useCallback((projectId, value) => {
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, hito: { ...p.hito, real: value } }));
    postChange({ type: 'set_hito', project_id: projectId, real_date: value });
  }, []);

  const saveBlock = useCallback((projectId, taskId, comment) => {
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, block: comment }) }));
    postChange({ type: 'set_block', task_id: taskId, comment });
  }, []);

  const changeDate = useCallback((projectId, taskId, date) => {
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, date }) }));
    postChange({ type: 'set_date', task_id: taskId, date });
  }, []);

  const handlePinSubmit = () => {
    if (pinInput === PIN) { setIsAdmin(true); setShowPinModal(false); setPinInput(''); setPinError(false); setActiveTab('agenda'); }
    else setPinError(true);
  };

  const gPct = globalPct(projects);
  const totalOverdue = projects.reduce((a, p) => a + p.tasks.filter(t => !t.done && dateStatus(t.date) === 'overdue').length, 0);
  const totalToday = projects.reduce((a, p) => a + p.tasks.filter(t => !t.done && dateStatus(t.date) === 'today').length, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <header style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: 0.5 }}>ABARCA GO — Tracker de Proyectos</h1>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProgressBar value={gPct} height={8} />
            <span style={{ fontWeight: 700, fontSize: 14, color: progressColor(gPct), minWidth: 40 }}>{gPct}%</span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8', flexWrap: 'wrap' }}>
            {totalOverdue > 0 && <span style={{ color: '#f87171' }}>⚠️ {totalOverdue} vencida{totalOverdue !== 1 ? 's' : ''}</span>}
            {totalToday > 0 && <span style={{ color: '#fbbf24' }}>📅 {totalToday} para hoy</span>}
            {USE_BACKEND && <span>{syncing ? '🔄 Sincronizando...' : lastSync ? `✅ ${lastSync.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : '⚠️ Sin backend'}</span>}
            {!USE_BACKEND && <span>⚠️ Modo local</span>}
          </div>
        </div>
        <button onClick={() => isAdmin ? setIsAdmin(false) : setShowPinModal(true)}
          style={{ background: isAdmin ? '#16a34a' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          {isAdmin ? <Unlock size={16} /> : <Lock size={16} />}
          {isAdmin ? 'Admin activo' : 'Modo admin'}
        </button>
      </header>

      {/* Tabs — agenda solo visible para admin */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 0, padding: '0 24px' }}>
        <button onClick={() => setActiveTab('projects')}
          style={{ padding: '12px 20px', border: 'none', borderBottom: activeTab === 'projects' ? '2px solid #6366f1' : '2px solid transparent', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === 'projects' ? '#6366f1' : '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
          <List size={15} /> Proyectos
        </button>
        {isAdmin && (
          <button onClick={() => setActiveTab('agenda')}
            style={{ padding: '12px 20px', border: 'none', borderBottom: activeTab === 'agenda' ? '2px solid #6366f1' : '2px solid transparent', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === 'agenda' ? '#6366f1' : '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={15} /> Agenda
            {(totalToday + totalOverdue) > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 11 }}>{totalToday + totalOverdue}</span>}
          </button>
        )}
      </div>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 40px' }}>
        {activeTab === 'projects' && (
          <>
            <ProjectsSummary projects={projects} />
            {isAdmin && (
              <div style={{ background: '#dcfce7', color: '#166534', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Unlock size={16} /> Modo admin — podés editar tareas, fechas, hitos y bloqueos
              </div>
            )}
            {[...projects]
              .sort((a, b) => {
                const pa = pct(a.tasks), pb = pct(b.tasks);
                if (pa === 100 && pb !== 100) return -1;
                if (pb === 100 && pa !== 100) return 1;
                return 0;
              })
              .map(project => (
                <ProjectCard key={project.id} project={project} isAdmin={isAdmin}
                  onToggleTask={toggleTask} onHitoChange={setHitoReal}
                  onBlockSave={saveBlock} onDateChange={changeDate} />
              ))}
          </>
        )}
        {activeTab === 'agenda' && isAdmin && (
          <AgendaView projects={projects} onToggleTask={toggleTask} onDateChange={changeDate} onBlockSave={saveBlock} />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '20px 16px', color: '#64748b', fontSize: 13, borderTop: '1px solid #e2e8f0', background: '#fff' }}>
        Gloria Voelker — Transformación Digital — Abarca SRL — 2026
      </footer>

      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Lock size={32} color="#6366f1" />
              <h2 style={{ margin: '12px 0 4px', fontSize: 18, color: '#1e293b' }}>Acceso Admin</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Ingresá el PIN para editar</p>
            </div>
            <input type="password" maxLength={10} placeholder="••••" value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError(false); }}
              onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
              style={{ width: '100%', padding: '12px 16px', fontSize: 20, textAlign: 'center', letterSpacing: 8, border: `2px solid ${pinError ? '#ef4444' : '#e2e8f0'}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
              autoFocus />
            {pinError && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', margin: '8px 0 0' }}>PIN incorrecto</p>}
            <button onClick={handlePinSubmit}
              style={{ width: '100%', padding: '12px 0', marginTop: 16, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Ingresar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
