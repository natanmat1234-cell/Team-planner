import { useState, useEffect, useRef } from "react";
const SUPABASE_URL = "https://kqaezucuyudszdqgsdgd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYWV6dWN1eXVkc3pkcWdzZGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDE5MzIsImV4cCI6MjA5NDAxNzkzMn0._tIRHUR4pBO1qz3K6Uercjn15PUh71AU1VVjfZizIJ8";
const API = `${SUPABASE_URL}/rest/v1/tasks`;
const HEADERS = { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization"
const MEMBERS = ["Алексей", "Мария", "Дмитрий", "Анна", "Иван"];
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
const color = days < 0 ? "#FF4444" : days <= 3 ? "#FF4444" : days <= 7 ? "#FF9F0A" : "#30D1
const label = days < 0 ? `Просрочено ${Math.abs(days)}д` : days === 0 ? "Сегодня" : `${days
return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "18", borde
}
function TaskCard({ task, onEdit, onDelete }) {
const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS["Средний"];
const sc = STATUS_COLORS[task.status] || STATUS_COLORS["В очереди"];
return (
<div style={{ background: "#1C1C1E", borderRadius: 16, padding: "18px 20px", marginBottom
onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTar
onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxSha
<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: p
<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ fontWeight: 700, fontSize: 15, color: "#F5F5F7", marginBottom: 6 }}>{
<div style={{ fontSize: 12, color: "#636366", marginBottom: 10 }}>{task.description
<div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
<span style={{ fontSize: 11, background: sc.light, color: "#EBEBF5", borderRadius
<span style={{ fontSize: 11, background: pc.light, color: pc.text, borderRadius:
{task.project && <span style={{ fontSize: 11, background: "#2C2C2E", color: "#8E8
{task.assignee && <span style={{ fontSize: 11, background: "#2C2C2E", color: "#8E
{task.deadline && <DeadlineBadge deadline={task.deadline} />}
</div>
</div>
<div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
<button onClick={() => onEdit(task)} style={{ background: "#2C2C2E", border: "none"
<button onClick={() => onDelete(task.id)} style={{ background: "#2C2C2E", border: "
</div>
</div>
</div>
);
}
function Modal({ task, onSave, onClose, saving }) {
const [form, setForm] = useState(task || { title: "", project: "", assignee: MEMBERS[0], pr
const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
return (
<div style={{ position: "fixed", inset: 0, background: "#000000CC", zIndex: 1000, display
onClick={e => e.target === e.currentTarget && onClose()}>
<div style={{ background: "#1C1C1E", borderRadius: 20, padding: 28, width: "100%", maxW
<div style={{ fontSize: 20, fontWeight: 800, color: "#F5F5F7", marginBottom: 20 }}>{t
{[{ label: "Название", key: "title" }, { label: "Проект", key: "project" }, { label:
<div key={key} style={{ marginBottom: 14 }}>
<div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: <input value={form[key] || ""} onChange={e => set(key, e.target.value)}
style={{ width: "100%", background: "#2C2C2E", border: "1px solid #3A3A3C", bor
600, t
</div>
))}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom:
{[{ label: "Исполнитель", key: "assignee", options: MEMBERS }, { label: "Приоритет"
<div key={key}>
<div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 600,
<select value={form[key] || ""} onChange={e => set(key, e.target.value)}
style={{ width: "100%", background: "#2C2C2E", border: "1px solid #3A3A3C", b
{options.map(o => <option key={o}>{o}</option>)}
</select>
</div>
))}
<div>
<div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 600, t
<input type="date" value={form.deadline || ""} onChange={e => set("deadline", e.t
style={{ width: "100%", background: "#2C2C2E", border: "1px solid #3A3A3C", bor
</div>
</div>
<div style={{ display: "flex", gap: 10, marginTop: 6 }}>
<button onClick={onClose} style={{ flex: 1, background: "#2C2C2E", border: "none",
<button onClick={() => onSave(form)} disabled={saving || !form.title}
style={{ flex: 2, background: saving ? "#0A84FF88" : "#0A84FF", border: "none", b
{saving ? "Сохраняем..." : "Сохранить"}
</button>
</div>
</div>
</div>
);
}
function AIPanel({ tasks, onClose }) {
const [messages, setMessages] = useState([{ role: "assistant", text: "Привет! Я AI-помощник
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const bottomRef = useRef(null);
useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages])
async function send() {
if (!input.trim() || loading) return;
const userMsg = input.trim();
setInput("");
setMessages(m => [...m, { role: "user", text: userMsg }]);
setLoading(true);
try {
const taskSummary = tasks.map(t => `- "${t.title}" [${t.status}] приоритет: ${t.priorit
const res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "claude-sonnet-4-20250514", max_tokens: 1000,
system: `Ты умный AI-помощник для команды. Отвечай кратко, по делу, на русском язык
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
<div style={{ position: "fixed", inset: 0, background: "#000000CC", zIndex: 1000, display
onClick={e => e.target === e.currentTarget && onClose()}>
<div style={{ background: "#1C1C1E", borderRadius: 20, width: "100%", maxWidth: 400, he
<div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #2C2C2E", display:
<div>
<div style={{ fontWeight: 800, fontSize: 16, color: "#F5F5F7" }}> AI-помощник</
<div style={{ fontSize: 12, color: "#30D158", marginTop: 2 }}>● Онлайн</div>
</div>
<button onClick={onClose} style={{ background: "#2C2C2E", border: "none", borderRad
</div>
<div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flex
{messages.map((m, i) => (
<div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-
<div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: m.role === "
</div>
))}
{loading && <div style={{ display: "flex" }}><div style={{ background: "#2C2C2E", b
<div ref={bottomRef} />
</div>
<div style={{ padding: "12px 16px", borderTop: "1px solid #2C2C2E", display: "flex",
<input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key
placeholder="Спросите что-нибудь..." style={{ flex: 1, background: "#2C2C2E", bor
<button onClick={send} disabled={loading || !input.trim()} style={{ background: "#0
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
} else {
await fetch(`${API}?id=eq.${id}`, { method: "PATCH", headers: HEADERS, body: JSON.str
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
if (filter.search && !t.title?.toLowerCase().includes(filter.search.toLowerCase()) return true;
}).sort((a, b) => {
const po = { "Высокий": 0, "Средний": 1, "Низкий": 2 };
return (po[a.priority] ?? 1) - (po[b.priority] ?? 1) || new Date(a.deadline) - new && !t.
Date(b
});
const stats = {
total: tasks.length,
done: tasks.filter(t => t.status === "Готово").length,
inProgress: tasks.filter(t => t.status === "В работе").length,
overdue: tasks.filter(t => t.deadline && daysLeft(t.deadline) < 0 && t.status !== "Готово
};
return (
<div style={{ minHeight: "100vh", background: "#000000", fontFamily: "'SF Pro Display', -
<style>{`* { box-sizing: border-box; } input, select { color-scheme: dark; }`}</style>
<div style={{ padding: "28px 28px 0", maxWidth: 900, margin: "0 auto" }}>
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
<div>
<div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Планировщик</
<div style={{ fontSize: 13, color: "#636366", marginTop: 2, display: "flex", alig
<span style={{ width: 6, height: 6, borderRadius: "50%", background: "#30D158",
Синхронизация с командой · {tasks.length} задач
</div>
</div>
<div style={{ display: "flex", gap: 10 }}>
<button onClick={fetchTasks} title="Обновить" style={{ background: "#1C1C1E", bor
<button onClick={() => setAiOpen(true)} style={{ background: "#1C1C1E", border: "
<button onClick={() => setModal({})} style={{ background: "#0A84FF", border: "non
</div>
</div>
{error && <div style={{ background: "#FF444422", border: "1px solid #FF4444", borderR
<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, margin
{[{ label: "Всего", value: stats.total, color: "#F5F5F7" }, { label: "В работе", va
<div key={s.label} style={{ background: "#1C1C1E", borderRadius: 14, padding: "16
<div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{
<div style={{ fontSize: 12, color: "#636366", marginTop: 4, fontWeight: 500 }}>
</div>
))}
</div>
<div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
<input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.targe
placeholder=" Поиск..." style={{ flex: 1, minWidth: 200, background: "#1C1C1E",
{[{ key: "status", opts: ["Все", ...STATUSES] }, { key: "priority", opts: ["Все", .
<select key={key} value={filter[key]} onChange={e => setFilter(f => ({ ...f, [key
style={{ background: "#1C1C1E", border: "1px solid #2C2C2E", borderRadius: 10,
{opts.map(o => <option key={o}>{o}</option>)}
</select>
))}
</div>
<div style={{ paddingBottom: 40 }}>
{loading && <div style={{ textAlign: "center", color: "#636366", padding: "60px 0"
{!loading && filtered.length === 0 && <div style={{ textAlign: "center", color: "#6
{filtered.map(task => <TaskCard key={task.id} task={task} onEdit={t => setModal(t)}
</div>
}
);
</div>
</div>
{modal !== null && <Modal task={modal?.id ? modal : null} onSave={saveTask} onClose={()
{aiOpen && <AIPanel tasks={tasks} onClose={() => setAiOpen(false)} />}
