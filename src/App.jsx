import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://kqaezucuyudszdqgsdgd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYWV6dWN1eXVkc3pkcWdzZGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDE5MzIsImV4cCI6MjA5NDAxNzkzMn0._tIRHUR4pBO1qz3K6Uercjn15PUh71AU1VVjfZizIJ8";
const API = `${SUPABASE_URL}/rest/v1/tasks`;
const HEADERS = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "return=representation"
};

const MEMBERS = ["Яна", "Моника", "Виктория", "Анна", "иное"];
const PRIORITIES = ["Высокий", "Средний", "Низкий"];
const STATUSES = ["В очереди", "В работе", "Готово"];

const PRIORITY_COLORS = {
  "Высокий": { bg: "#FF4444", light: "#FF444422", text: "#FF4444" },
  "Средний": { bg: "#FF9F0A", light: "#FF9F0A22", text: "#FF9F0A" },
  "Низкий": { bg: "#30D158", light: "#30D15822", text: "#30D158" },
};
const STATUS_COLORS = {
  "В очереди": { bg: "#636366", light: "#63636622" },
  "В работе": { bg: "#0A84FF", light: "#0A84FF22" },
  "Готово": { bg: "#30D158", light: "#30D15822" },
};

function daysLeft(deadline) {
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.ceil((new Date(deadline) - today) / 86400000);
}

function DeadlineBadge({ deadline }) {
  const days = daysLeft(deadline);
  const color = days < 0 ? "#FF4444" : days <= 3 ? "#FF4444" : days <= 7 ? "#FF9F0A" : "#30D158";
  const label = days < 0 ? `Просрочено ${Math.abs(days)}д` : days === 0 ? "Сегодня" : `${days} дн.`;
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "18", borderRadius: 6, padding: "2px 8px" }}>{label}</span>;
}

function TaskCard({ task, onEdit, onDelete }) {
  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS["Средний"];
  const sc = STATUS_COLORS[task.status] || STATUS_COLORS["В очереди"];
  return (
    <div style={{ background: "#1C1C1E", borderRadius: 16, padding: "18px 20px", marginBottom: 10, border: "1px solid #2C2C2E", transition: "transform 0.15s, box-shadow 0.15s", position: "relative", overflow: "hidden" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px #0008"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: pc.bg, borderRadius: "16px 0 0 16px" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#F5F5F7", marginBottom: 6 }}>{task.title}</div>
          <div style={{ fontSize: 12, color: "#636366", marginBottom: 10 }}>{task.description}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, background: sc.light, color: "#EBEBF5", borderRadius: 6, padding: "2px 8px", border: `1px solid ${sc.bg}44` }}>{task.status}</span>
            <span style={{ fontSize: 11, background: pc.light, color: pc.text, borderRadius: 6, padding: "2px 8px", fontWeight: 600 }}>{task.priority}</span>
            {task.project && <span style={{ fontSize: 11, background: "#2C2C2E", color: "#8E8E93", borderRadius: 6, padding: "2px 8px" }}>📁 {task.project}</span>}
            {task.assignee && <span style={{ fontSize: 11, background: "#2C2C2E", color: "#8E8E93", borderRadius: 6, padding: "2px 8px" }}>👤 {task.assignee}</span>}
            {task.deadline && <DeadlineBadge deadline={task.deadline} />}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onEdit(task)} style={{ background: "#2C2C2E", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14 }}>✏️</button>
          <button onClick={() => onDelete(task.id)} style={{ background: "#2C2C2E", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14 }}>🗑️</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ task, onSave, onClose, saving }) {
  const [form, setForm] = useState(task || { title: "", project: "", assignee: MEMBERS[0], priority: "Средний", status: "В очереди", deadline: new Date().toISOString().slice(0,10), description: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000CC", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#1C1C1E", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, border: "1px solid #3A3A3C", boxShadow: "0 32px 80px #000A" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#F5F5F7", marginBottom: 20 }}>{task?.id ? "Редактировать задачу" : "Новая задача"}</div>
        {[{ label: "Название", key: "title" }, { label: "Проект", key: "project" }, { label: "Описание", key: "description" }].map(({ label, key }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
            <input value={form[key] || ""} onChange={e => set(key, e.target.value)}
              style={{ width: "100%", background: "#2C2C2E", border: "1px solid #3A3A3C", borderRadius: 10, padding: "10px 14px", color: "#F5F5F7", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {[{ label: "Исполнитель", key: "assignee", options: MEMBERS }, { label: "Приоритет", key: "priority", options: PRIORITIES }, { label: "Статус", key: "status", options: STATUSES }].map(({ label, key, options }) => (
            <div key={key}>
              <div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
              <select value={form[key] || ""} onChange={e => set(key, e.target.value)}
                style={{ width: "100%", background: "#2C2C2E", border: "1px solid #3A3A3C", borderRadius: 10, padding: "10px 14px", color: "#F5F5F7", fontSize: 14, outline: "none" }}>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Дедлайн</div>
            <input type="date" value={form.deadline || ""} onChange={e => set("deadline", e.target.value)}
              style={{ width: "100%", background: "#2C2C2E", border: "1px solid #3A3A3C", borderRadius: 10, padding: "10px 14px", color: "#F5F5F7", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button onClick={onClose} style={{ flex: 1, background: "#2C2C2E", border: "none", borderRadius: 12, padding: "12px", color: "#8E8E93", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Отмена</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.title}
            style={{ flex: 2, background: saving ? "#0A84FF88" : "#0A84FF", border: "none", borderRadius: 12, padding: "12px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AIPanel({ tasks, onClose }) {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Привет! Я AI-помощник вашей команды 👋\n\nМогу проанализировать задачи, найти узкие места, помочь с приоритизацией или ответить на любой вопрос о проекте." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const taskSummary = tasks.map(t => `- "${t.title}" [${t.status}] приоритет: ${t.priority}, дедлайн: ${t.deadline}, исполнитель: ${t.assignee}, проект: ${t.project}`).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Ты умный AI-помощник для команды. Отвечай кратко, по делу, на русском языке.\n\nТекущие задачи:\n${taskSummary}`,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Ошибка ответа";
      setMessages(m => [...m, { role: "assistant", text }]);
    } catch { setMessages(m => [...m, { role: "assistant", text: "Ошибка соединения." }]); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000CC", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#1C1C1E", borderRadius: 20, width: "100%", maxWidth: 400, height: "70vh", display: "flex", flexDirection: "column", border: "1px solid #3A3A3C", boxShadow: "0 32px 80px #000A" }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #2C2C2E", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#F5F5F7" }}>🤖 AI-помощник</div>
            <div style={{ fontSize: 12, color: "#30D158", marginTop: 2 }}>● Онлайн</div>
          </div>
          <button onClick={onClose} style={{ background: "#2C2C2E", border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer", color: "#8E8E93", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? "#0A84FF" : "#2C2C2E", color: "#F5F5F7", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={{ display: "flex" }}><div style={{ background: "#2C2C2E", borderRadius: "16px 16px 16px 4px", padding: "10px 16px", color: "#8E8E93", fontSize: 14 }}>●●●</div></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #2C2C2E", display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Спросите что-нибудь..." style={{ flex: 1, background: "#2C2C2E", border: "1px solid #3A3A3C", borderRadius: 12, padding: "10px 14px", color: "#F5F5F7", fontSize: 14, outline: "none" }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ background: "#0A84FF", border: "none", borderRadius: 12, width: 42, height: 42, cursor: "pointer", fontSize: 18, opacity: loading || !input.trim() ? 0.4 : 1 }}>↑</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [filter, setFilter] = useState({ status: "Все", priority: "Все", search: "" });

  async function fetchTasks() {
    try {
      const res = await fetch(`${API}?order=created_at.desc`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      setTasks(await res.json());
      setError(null);
    } catch (e) {
      setError("Не удалось загрузить задачи. Проверьте подключение к Supabase.");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  async function saveTask(form) {
    setSaving(true);
    try {
      const { id, created_at, ...body } = form;
      if (id) {
        await fetch(`${API}?id=eq.${id}`, { method: "PATCH", headers: HEADERS, body: JSON.stringify(body) });
      } else {
        await fetch(API, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
      }
      await fetchTasks();
      setModal(null);
    } catch { setError("Ошибка сохранения"); }
    setSaving(false);
  }

  async function deleteTask(id) {
    try {
      await fetch(`${API}?id=eq.${id}`, { method: "DELETE", headers: HEADERS });
      setTasks(t => t.filter(x => x.id !== id));
    } catch { setError("Ошибка удаления"); }
  }

  const filtered = tasks.filter(t => {
    if (filter.status !== "Все" && t.status !== filter.status) return false;
    if (filter.priority !== "Все" && t.priority !== filter.priority) return false;
    if (filter.search && !t.title?.toLowerCase().includes(filter.search.toLowerCase()) && !t.assignee?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const po = { "Высокий": 0, "Средний": 1, "Низкий": 2 };
    return (po[a.priority] ?? 1) - (po[b.priority] ?? 1) || new Date(a.deadline) - new Date(b.deadline);
  });

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "Готово").length,
    inProgress: tasks.filter(t => t.status === "В работе").length,
    overdue: tasks.filter(t => t.deadline && daysLeft(t.deadline) < 0 && t.status !== "Готово").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000000", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif", color: "#F5F5F7" }}>
      <style>{`* { box-sizing: border-box; } input, select { color-scheme: dark; }`}</style>
      <div style={{ padding: "28px 28px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Планировщик</div>
            <div style={{ fontSize: 13, color: "#636366", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#30D158", display: "inline-block" }} />
              Синхронизация с командой · {tasks.length} задач
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchTasks} title="Обновить" style={{ background: "#1C1C1E", border: "1px solid #3A3A3C", borderRadius: 12, padding: "10px 14px", color: "#8E8E93", fontSize: 14, cursor: "pointer" }}>🔄</button>
            <button onClick={() => setAiOpen(true)} style={{ background: "#1C1C1E", border: "1px solid #3A3A3C", borderRadius: 12, padding: "10px 16px", color: "#0A84FF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🤖 AI</button>
            <button onClick={() => setModal({})} style={{ background: "#0A84FF", border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Задача</button>
          </div>
        </div>

        {error && <div style={{ background: "#FF444422", border: "1px solid #FF4444", borderRadius: 12, padding: "12px 16px", color: "#FF4444", fontSize: 14, marginBottom: 16 }}>⚠️ {error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[{ label: "Всего", value: stats.total, color: "#F5F5F7" }, { label: "В работе", value: stats.inProgress, color: "#0A84FF" }, { label: "Готово", value: stats.done, color: "#30D158" }, { label: "Просрочено", value: stats.overdue, color: "#FF4444" }].map(s => (
            <div key={s.label} style={{ background: "#1C1C1E", borderRadius: 14, padding: "16px", border: "1px solid #2C2C2E" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#636366", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            placeholder="🔍 Поиск..." style={{ flex: 1, minWidth: 200, background: "#1C1C1E", border: "1px solid #2C2C2E", borderRadius: 10, padding: "10px 14px", color: "#F5F5F7", fontSize: 14, outline: "none" }} />
          {[{ key: "status", opts: ["Все", ...STATUSES] }, { key: "priority", opts: ["Все", ...PRIORITIES] }].map(({ key, opts }) => (
            <select key={key} value={filter[key]} onChange={e => setFilter(f => ({ ...f, [key]: e.target.value }))}
              style={{ background: "#1C1C1E", border: "1px solid #2C2C2E", borderRadius: 10, padding: "10px 14px", color: "#F5F5F7", fontSize: 14, outline: "none" }}>
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>

        <div style={{ paddingBottom: 40 }}>
          {loading && <div style={{ textAlign: "center", color: "#636366", padding: "60px 0" }}>Загрузка задач...</div>}
          {!loading && filtered.length === 0 && <div style={{ textAlign: "center", color: "#636366", padding: "60px 0", fontSize: 15 }}>Задачи не найдены — добавь первую!</div>}
          {filtered.map(task => <TaskCard key={task.id} task={task} onEdit={t => setModal(t)} onDelete={deleteTask} />)}
        </div>
      </div>

      {modal !== null && <Modal task={modal?.id ? modal : null} onSave={saveTask} onClose={() => setModal(null)} saving={saving} />}
      {aiOpen && <AIPanel tasks={tasks} onClose={() => setAiOpen(false)} />}
    </div>
  );
}
