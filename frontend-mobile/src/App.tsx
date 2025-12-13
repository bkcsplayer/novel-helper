import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

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

const DEFAULT_API_BASE =
  window.location.port === "18080" || window.location.port === "" || window.location.port === "80" || window.location.port === "443"
    ? `${window.location.origin}/api`
    : `${window.location.protocol}//${window.location.hostname}:18888`;
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? DEFAULT_API_BASE;

async function fetchChapters(): Promise<Chapter[]> {
  const res = await fetch(`${API_BASE}/get_chapters`);
  if (!res.ok) throw new Error("Failed to load chapters");
  return res.json();
}

async function uploadChapter(form: { userId: string; title: string; anchorPrompt: string; file: File }) {
  const fd = new FormData();
  fd.append("user_id", form.userId || "1");
  fd.append("title", form.title);
  if (form.anchorPrompt) fd.append("anchor_prompt", form.anchorPrompt);
  fd.append("file", form.file);
  const res = await fetch(`${API_BASE}/upload_audio`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return (await res.json()) as Chapter;
}

const statusStyles: Record<string, string> = {
  completed: "border-green-500 text-green-800",
  polished: "border-green-500 text-green-800",
  current: "border-accent text-accent",
  pending: "border-slate-200 text-slate-400",
  locked: "border-slate-200 text-slate-400",
};

export default function App() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    userId: "1",
    title: "",
    anchorPrompt: "",
    file: null as File | null,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [lastUploadId, setLastUploadId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchChapters();
        setChapters(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!lastUploadId) return;
    const interval = setInterval(async () => {
      try {
        const data = await fetchChapters();
        setChapters(data);
        const found = data.find((c) => c.id === lastUploadId);
        if (found && (found.transcript_text || found.polished_text)) {
          setMessage("Transcription updated.");
          clearInterval(interval);
          setLastUploadId(null);
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [lastUploadId]);

  const anchorPrompt = useMemo(() => chapters[0]?.anchor_prompt || "The Stethoscope", [chapters]);

  const handleUpload = async () => {
    if (!form.file || !form.title.trim()) {
      setMessage("Please select a file and title.");
      return;
    }
    try {
      setUploading(true);
      setMessage(null);
      const created = await uploadChapter({
        userId: form.userId,
        title: form.title,
        anchorPrompt: form.anchorPrompt,
        file: form.file,
      });
      setChapters((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      setForm({ ...form, title: "", anchorPrompt: "", file: null });
      setMessage("Uploaded. Transcription will appear shortly.");
      setLastUploadId(created.id);
    } catch (e: any) {
      setMessage(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">BioWeaver</p>
          <h1 className="font-serif text-3xl">Memory Lane</h1>
          <p className="text-sm text-slate-600">
            Capture voice fragments for each chapter. We will stitch them into a Slumdog-style montage.
          </p>
          <p className="text-xs text-slate-400">API: {API_BASE}</p>
        </header>

        <section className="card-surface rounded-2xl p-4 border border-[#E6E1D8]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Anchor Prompt</p>
          <h2 className="font-serif text-2xl mt-2">{anchorPrompt}</h2>
          <p className="text-sm text-slate-600 mt-1">Speak freely. We handle multi-segment stories up to 20 minutes per recording.</p>
        </section>

        <section className="card-surface rounded-2xl p-4 border border-[#E6E1D8] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Upload Recording</p>
            <span className="text-xs text-slate-500">{uploading ? "Uploading…" : "Ready"}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">User ID</label>
              <input
                type="number"
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                className="rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Memory 1"
                className="rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Anchor Prompt (optional)</label>
              <input
                type="text"
                value={form.anchorPrompt}
                onChange={(e) => setForm((f) => ({ ...f, anchorPrompt: e.target.value }))}
                placeholder="e.g., The Stethoscope"
                className="rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Audio File (≤ 20 mins)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                className="text-sm"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-full bg-accent text-white font-semibold py-3 shadow-md disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
            {message && <p className="text-xs text-slate-600">{message}</p>}
          </div>
        </section>

        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

        <section className="space-y-3">
          {loading && <p className="text-sm text-slate-500">Loading chapters…</p>}
          {!loading && chapters.length === 0 && (
            <p className="text-sm text-slate-500">No chapters yet. Start recording to create your first memory.</p>
          )}
          {chapters.map((card) => {
            const statusKey = statusStyles[card.status] ? card.status : "pending";
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: card.id * 0.02 }}
                className={`card-surface rounded-2xl p-4 border ${statusStyles[statusKey]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Chapter {card.id}</p>
                    <h3 className="font-serif text-xl mt-1">{card.title}</h3>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/60 border border-[#E6E1D8]">
                    {card.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 min-h-[32px]">
                  {card.polished_text || card.transcript_text || "Voice segments pending."}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 rounded-full bg-white/70 border border-[#E6E1D8]">
                    Anchor: {card.anchor_prompt || "—"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 safe-area-bottom flex justify-center">
        <motion.button
          whileTap={{ scale: 0.96 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="w-[86vw] max-w-lg mx-auto mb-4 bg-accent text-white font-semibold text-lg py-4 rounded-full shadow-lg"
        >
          Hold to record (≤ 20 mins)
        </motion.button>
      </div>
    </div>
  );
}
