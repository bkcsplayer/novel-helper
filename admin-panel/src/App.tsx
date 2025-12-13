import { useEffect, useMemo, useState } from "react";

type User = { id: number; name: string; email: string };
type Chapter = {
  id: number;
  user_id: number;
  title: string;
  anchor_prompt?: string | null;
  audio_url?: string | null;
  transcript_text?: string | null;
  polished_text?: string | null;
  status: string;
};
type Book = { id: number; user_id: number; title: string; pdf_url?: string | null };

const DEFAULT_API_BASE =
  window.location.port === "18080" || window.location.port === "" || window.location.port === "80" || window.location.port === "443"
    ? `${window.location.origin}/api`
    : `${window.location.protocol}//${window.location.hostname}:18888`;
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? DEFAULT_API_BASE;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function deleteResource(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

async function postJson<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [u, c, b] = await Promise.all([
          fetchJson<User[]>("/users"),
          fetchJson<Chapter[]>("/get_chapters"),
          fetchJson<Book[]>("/books"),
        ]);
        setUsers(u);
        setChapters(c);
        setBooks(b);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingCount = useMemo(() => chapters.filter((c) => c.status === "pending").length, [chapters]);

  const handleDeleteChapter = async (id: number) => {
    if (!confirm("Delete this chapter?")) return;
    try {
      setDeletingId(`c-${id}`);
      await deleteResource(`/chapters/${id}`);
      setChapters((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRepolishChapter = async (id: number) => {
    try {
      setDeletingId(`p-${id}`);
      const updated = await postJson<Chapter>(`/chapters/${id}/polish`, {});
      setChapters((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setActionMsg(`Re-polished chapter ${id}`);
    } catch (e: any) {
      alert(e?.message || "Re-polish failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateBook = async (userId: number) => {
    const title = prompt("Book title", "Memory Book");
    if (!title) return;
    const chapterIds = chapters.filter((c) => c.user_id === userId).map((c) => c.id);
    if (chapterIds.length === 0) {
      alert("No chapters for this user.");
      return;
    }
    try {
      setDeletingId(`g-${userId}`);
      const res = await postJson<{ book_url?: string; book_title: string }>(`/generate_book`, {
        user_id: userId,
        title,
        chapter_ids: chapterIds,
      });
      setActionMsg(`Book generated: ${res.book_title}`);
      // refresh books
      const refreshed = await fetchJson<Book[]>(`/books`);
      setBooks(refreshed);
    } catch (e: any) {
      alert(e?.message || "Generate book failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm("Delete this book?")) return;
    try {
      setDeletingId(`b-${id}`);
      await deleteResource(`/books/${id}`);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-semibold">BioWeaver Admin</h1>
        <p className="text-sm text-slate-500">Review audio, transcripts, and exports.</p>
        <p className="text-xs text-slate-400 mt-1">API: {API_BASE}</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
        {actionMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded">{actionMsg}</div>
        )}

        <section className="bg-white border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Create User</p>
            <p className="text-sm text-slate-500">Create a user before uploading audio (you’ll use the returned User ID).</p>
          </div>
          <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={newUser.name}
              onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
              placeholder="Name"
              className="rounded-lg border px-3 py-2"
            />
            <input
              value={newUser.email}
              onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
              placeholder="Email"
              className="rounded-lg border px-3 py-2"
            />
            <button
              onClick={async () => {
                try {
                  const created = await postJson<User>("/users", newUser);
                  setUsers((prev) => [created, ...prev]);
                  setNewUser({ name: "", email: "" });
                  setActionMsg(`User created: ${created.email} (id=${created.id})`);
                } catch (e: any) {
                  alert(e?.message || "Create user failed");
                }
              }}
              className="rounded-lg bg-slate-900 text-white px-3 py-2"
            >
              Create
            </button>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={async () => {
                try {
                  setActionMsg(null);
                  await postJson("/admin/seed_demo", {});
                  const [u, c, b] = await Promise.all([
                    fetchJson<User[]>("/users"),
                    fetchJson<Chapter[]>("/get_chapters"),
                    fetchJson<Book[]>("/books"),
                  ]);
                  setUsers(u);
                  setChapters(c);
                  setBooks(b);
                  setActionMsg("Demo data seeded. Refreshing lists.");
                } catch (e: any) {
                  alert(e?.message || "Seed demo failed");
                }
              }}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Seed demo data
            </button>
            <p className="text-xs text-slate-500 mt-2">
              Creates 1 demo user + 20 chapters + 1 demo book (with a silent audio file) so you can preview the workflow.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-sm text-slate-500">Users</p>
            <p className="text-3xl font-semibold">{loading ? "…" : users.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-sm text-slate-500">Chapters</p>
            <p className="text-3xl font-semibold">{loading ? "…" : chapters.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-sm text-slate-500">Pending Polishing</p>
            <p className="text-3xl font-semibold">{loading ? "…" : pendingCount}</p>
          </div>
        </section>

        <section className="bg-white border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Chapters</p>
              <p className="text-sm text-slate-500">Audio + transcript listing</p>
            </div>
          </div>
          <div className="divide-y">
            {loading && <p className="px-4 py-3 text-sm text-slate-500">Loading…</p>}
            {!loading && chapters.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No chapters yet.</p>}
            {chapters.map((chapter) => {
              const user = users.find((u) => u.id === chapter.user_id);
              return (
                <div key={chapter.id} className="px-4 py-3 grid grid-cols-1 sm:grid-cols-6 gap-2 items-start">
                  <div>
                    <p className="font-semibold">{chapter.title}</p>
                    <p className="text-xs text-slate-500">Anchor: {chapter.anchor_prompt || "—"}</p>
                  </div>
                  <p className="text-sm text-slate-600">{user ? user.name : `User ${chapter.user_id}`}</p>
                  <p className="text-sm text-slate-600">{chapter.status}</p>
                  {chapter.audio_url ? (
                    <a href={chapter.audio_url} className="text-sm text-blue-600 underline">
                      Audio
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">No audio</span>
                  )}
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {chapter.polished_text || chapter.transcript_text || "No transcript"}
                  </p>
                  <button
                    onClick={() => handleDeleteChapter(chapter.id)}
                    disabled={deletingId === `c-${chapter.id}`}
                    className="text-sm text-red-600 underline disabled:text-slate-400"
                  >
                    {deletingId === `c-${chapter.id}` ? "Deleting…" : "Delete"}
                  </button>
                  <button
                    onClick={() => handleRepolishChapter(chapter.id)}
                    disabled={deletingId === `p-${chapter.id}`}
                    className="text-sm text-amber-600 underline disabled:text-slate-400"
                  >
                    {deletingId === `p-${chapter.id}` ? "Re-polishing…" : "Re-polish"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Users</p>
              <p className="text-sm text-slate-500">Basic directory</p>
            </div>
          </div>
          <div className="divide-y">
            {loading && <p className="px-4 py-3 text-sm text-slate-500">Loading…</p>}
            {!loading && users.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No users yet.</p>}
            {users.map((user) => (
              <div key={user.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-600">
                    Chapters: {chapters.filter((c) => c.user_id === user.id).length}
                  </p>
                  <button
                    onClick={() => handleGenerateBook(user.id)}
                    disabled={deletingId === `g-${user.id}`}
                    className="text-sm text-blue-600 underline disabled:text-slate-400"
                  >
                    {deletingId === `g-${user.id}` ? "Generating…" : "Generate book"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Books</p>
              <p className="text-sm text-slate-500">Generated outputs</p>
            </div>
          </div>
          <div className="divide-y">
            {loading && <p className="px-4 py-3 text-sm text-slate-500">Loading…</p>}
            {!loading && books.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No books yet.</p>}
            {books.map((book) => {
              const user = users.find((u) => u.id === book.user_id);
              return (
                <div key={book.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold">{book.title}</p>
                    <p className="text-sm text-slate-500">{user ? user.name : `User ${book.user_id}`}</p>
                  </div>
                  {book.pdf_url ? (
                    <a href={book.pdf_url} className="text-sm text-blue-600 underline">
                      Open
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">No file</span>
                  )}
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    disabled={deletingId === `b-${book.id}`}
                    className="text-sm text-red-600 underline disabled:text-slate-400"
                  >
                    {deletingId === `b-${book.id}` ? "Deleting…" : "Delete"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
