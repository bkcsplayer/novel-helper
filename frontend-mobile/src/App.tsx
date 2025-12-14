import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 认证配置
const AUTH_CONFIG = {
  username: "ffthelper",
  password: "1q2w3e4R.",
  storageKey: "bioweaver_auth",
};

// 检查是否已登录
function isAuthenticated(): boolean {
  const token = localStorage.getItem(AUTH_CONFIG.storageKey);
  return token === btoa(`${AUTH_CONFIG.username}:${AUTH_CONFIG.password}`);
}

// 登录
function login(username: string, password: string): boolean {
  if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
    localStorage.setItem(AUTH_CONFIG.storageKey, btoa(`${username}:${password}`));
    return true;
  }
  return false;
}

// 登出
function logout() {
  localStorage.removeItem(AUTH_CONFIG.storageKey);
}

// 登录页面组件
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 模拟延迟
    setTimeout(() => {
      if (login(username, password)) {
        onLogin();
      } else {
        setError("用户名或密码错误");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo 区域 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#D4A373] to-[#8B5A2B] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">🎭</span>
            </div>
          </motion.div>
          <h1 className="text-3xl font-serif font-bold text-[#2C2C2C]">BioWeaver</h1>
          <p className="text-[#6B6B6B] mt-2">编织你的人生故事</p>
        </div>

        {/* 登录卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-[#E8E4DF]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all"
                placeholder="请输入用户名"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all"
                placeholder="请输入密码"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#D4A373] to-[#8B5A2B] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  登录中...
                </span>
              ) : (
                "登录"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E8E4DF] text-center text-sm text-[#8B8B8B]">
            <p>Memory Lane · 记录生命的足迹</p>
          </div>
        </motion.div>

        {/* 底部装饰 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[#A0A0A0] text-xs mt-6"
        >
          © 2024 BioWeaver. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}

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

// 格式化录音时间
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// 主应用包装器 - 处理认证
export default function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return <MainApp onLogout={() => setAuthenticated(false)} />;
}

// 主应用内容
function MainApp({ onLogout }: { onLogout: () => void }) {
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

  // 录音相关状态
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 登出处理
  const handleLogout = () => {
    logout();
    onLogout();
  };

  // 最大录音时间（20分钟 = 1200秒）
  const MAX_RECORDING_TIME = 1200;

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

  // 检查麦克风权限
  useEffect(() => {
    async function checkPermission() {
      try {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setMicPermission(result.state as "granted" | "denied" | "prompt");
        result.onchange = () => setMicPermission(result.state as "granted" | "denied" | "prompt");
      } catch {
        // Safari 不支持 permissions API，默认为 prompt
        setMicPermission("prompt");
      }
    }
    checkPermission();
  }, []);

  useEffect(() => {
    if (!lastUploadId) return;
    const interval = setInterval(async () => {
      try {
        const data = await fetchChapters();
        setChapters(data);
        const found = data.find((c) => c.id === lastUploadId);
        if (found && (found.transcript_text || found.polished_text)) {
          setMessage("✅ 转录完成！AI 正在润色中...");
          if (found.polished_text) {
            setMessage("✅ AI 润色完成！");
            clearInterval(interval);
            setLastUploadId(null);
          }
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [lastUploadId]);

  const anchorPrompt = useMemo(() => chapters[0]?.anchor_prompt || "我的听诊器", [chapters]);

  // 开始录音
  const startRecording = async () => {
    try {
      setMessage(null);
      setAudioBlob(null);
      setAudioUrl(null);
      audioChunksRef.current = [];

      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      streamRef.current = stream;
      setMicPermission("granted");

      // 创建 MediaRecorder
      // iOS Safari 支持的格式
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") 
        ? "audio/webm;codecs=opus" 
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setMessage("🎙️ 录音完成！请填写标题后上传。");
        
        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // 每秒收集一次数据
      setIsRecording(true);
      setRecordingTime(0);

      // 计时器
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error("录音启动失败:", err);
      if (err.name === "NotAllowedError") {
        setMicPermission("denied");
        setMessage("❌ 麦克风权限被拒绝。请在浏览器设置中允许访问麦克风。");
      } else {
        setMessage(`❌ 无法启动录音: ${err.message}`);
      }
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // 取消录音
  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setMessage(null);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // 上传录音
  const handleUploadRecording = async () => {
    if (!audioBlob || !form.title.trim()) {
      setMessage("⚠️ 请先录音并填写标题。");
      return;
    }

    try {
      setUploading(true);
      setMessage("⏳ 上传中...");

      // 将 Blob 转换为 File
      const extension = audioBlob.type.includes("mp4") ? "m4a" : "webm";
      const file = new File([audioBlob], `recording_${Date.now()}.${extension}`, { type: audioBlob.type });

      const created = await uploadChapter({
        userId: form.userId,
        title: form.title,
        anchorPrompt: form.anchorPrompt,
        file: file,
      });

      setChapters((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      setForm({ ...form, title: "", anchorPrompt: "" });
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setMessage("✅ 上传成功！正在转录...");
      setLastUploadId(created.id);
    } catch (e: any) {
      setMessage(`❌ 上传失败: ${e?.message}`);
    } finally {
      setUploading(false);
    }
  };

  // 文件上传（保留原有功能）
  const handleFileUpload = async () => {
    if (!form.file || !form.title.trim()) {
      setMessage("⚠️ 请选择文件并填写标题。");
      return;
    }
    try {
      setUploading(true);
      setMessage("⏳ 上传中...");
      const created = await uploadChapter({
        userId: form.userId,
        title: form.title,
        anchorPrompt: form.anchorPrompt,
        file: form.file,
      });
      setChapters((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      setForm({ ...form, title: "", anchorPrompt: "", file: null });
      setMessage("✅ 上传成功！正在转录...");
      setLastUploadId(created.id);
    } catch (e: any) {
      setMessage(`❌ 上传失败: ${e?.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text pb-48">
      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">BioWeaver</p>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-full bg-[#F5F5F0] text-[#8B5A2B] hover:bg-[#E8E4DF] transition-colors border border-[#E6E1D8]"
            >
              退出 →
            </button>
          </div>
          <h1 className="font-serif text-3xl">Memory Lane</h1>
          <p className="text-sm text-slate-600">
            用声音记录您的人生故事，AI 将它们编织成优美的传记。
          </p>
        </header>

        {/* 锚定提示卡片 */}
        <section className="card-surface rounded-2xl p-4 border border-[#E6E1D8]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">今日锚定提示</p>
          <h2 className="font-serif text-2xl mt-2">{anchorPrompt}</h2>
          <p className="text-sm text-slate-600 mt-1">
            想想这个物件/时刻对您的意义，然后点击下方按钮开始录音。
          </p>
        </section>

        {/* 录音区域 */}
        <section className="card-surface rounded-2xl p-5 border-2 border-accent/30 bg-gradient-to-b from-white to-amber-50/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-700">🎙️ 语音录制</p>
              <p className="text-xs text-slate-500">点击按钮开始录音（最长 20 分钟）</p>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-lg font-mono text-red-600">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {/* 录音按钮 */}
          <div className="flex justify-center py-6">
            {!isRecording && !audioBlob && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                disabled={micPermission === "denied"}
                className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all
                  ${micPermission === "denied" 
                    ? "bg-slate-300 cursor-not-allowed" 
                    : "bg-gradient-to-br from-accent to-amber-600 hover:from-amber-600 hover:to-accent"
                  }`}
              >
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </motion.button>
            )}

            {isRecording && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                onClick={stopRecording}
                className="w-28 h-28 rounded-full bg-red-500 flex items-center justify-center shadow-xl"
              >
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              </motion.button>
            )}

            {audioBlob && !isRecording && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg font-medium text-green-700">
                    录音完成 ({formatTime(recordingTime)})
                  </span>
                </div>
                {audioUrl && (
                  <audio controls src={audioUrl} className="w-full max-w-xs" />
                )}
                <button
                  onClick={cancelRecording}
                  className="text-sm text-slate-500 hover:text-red-500 underline"
                >
                  重新录制
                </button>
              </div>
            )}
          </div>

          {/* 权限提示 */}
          {micPermission === "denied" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              ❌ 麦克风权限被拒绝。请在浏览器设置中允许访问麦克风后刷新页面。
            </div>
          )}

          {/* 标题和锚定提示 */}
          {(audioBlob || form.file) && (
            <div className="space-y-3 mt-4 pt-4 border-t border-[#E6E1D8]">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600 font-medium">标题 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="例如：第一次出诊"
                  className="rounded-xl border border-[#E6E1D8] bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600 font-medium">锚定提示（可选）</label>
                <input
                  type="text"
                  value={form.anchorPrompt}
                  onChange={(e) => setForm((f) => ({ ...f, anchorPrompt: e.target.value }))}
                  placeholder="例如：那把旧听诊器"
                  className="rounded-xl border border-[#E6E1D8] bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent"
                />
              </div>
              <button
                onClick={audioBlob ? handleUploadRecording : handleFileUpload}
                disabled={uploading}
                className="w-full rounded-full bg-accent text-white font-semibold py-4 shadow-md disabled:opacity-60 transition-all hover:bg-amber-600"
              >
                {uploading ? "⏳ 上传中..." : "📤 上传并转录"}
              </button>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${
              message.includes("❌") ? "bg-red-50 text-red-700" :
              message.includes("✅") ? "bg-green-50 text-green-700" :
              message.includes("⚠️") ? "bg-yellow-50 text-yellow-700" :
              "bg-blue-50 text-blue-700"
            }`}>
              {message}
            </div>
          )}
        </section>

        {/* 文件上传备选 */}
        <details className="card-surface rounded-2xl border border-[#E6E1D8]">
          <summary className="p-4 cursor-pointer text-sm text-slate-600 hover:text-slate-900">
            📁 或者上传已有的录音文件...
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">音频文件（≤ 20 分钟）</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                className="text-sm"
              />
            </div>
            {form.file && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">标题 *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="例如：童年回忆"
                    className="rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600">锚定提示（可选）</label>
                  <input
                    type="text"
                    value={form.anchorPrompt}
                    onChange={(e) => setForm((f) => ({ ...f, anchorPrompt: e.target.value }))}
                    placeholder="例如：老照片"
                    className="rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="w-full rounded-full bg-slate-700 text-white font-semibold py-3 shadow-md disabled:opacity-60"
                >
                  {uploading ? "上传中..." : "上传文件"}
                </button>
              </>
            )}
          </div>
        </details>

        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>}

        {/* 章节列表 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-slate-700">📚 我的记忆章节</h2>
          
          {loading && <p className="text-sm text-slate-500">加载中...</p>}
          {!loading && chapters.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-4xl mb-3">🎙️</p>
              <p>还没有录制任何章节</p>
              <p className="text-sm mt-1">点击上方的麦克风按钮开始录制您的第一段回忆</p>
            </div>
          )}
          {chapters.map((card) => {
            const statusKey = statusStyles[card.status] ? card.status : "pending";
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: card.id * 0.02 }}
                className={`card-surface rounded-2xl p-4 border-2 ${statusStyles[statusKey]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">第 {card.id} 章</p>
                    <h3 className="font-serif text-xl mt-1">{card.title}</h3>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    card.status === "polished" ? "bg-green-100 text-green-700" :
                    card.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {card.status === "polished" ? "✅ 已润色" : 
                     card.status === "pending" ? "⏳ 处理中" : card.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-3">
                  {card.polished_text || card.transcript_text || "正在转录中..."}
                </p>
                {card.anchor_prompt && (
                  <div className="mt-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                      🔗 {card.anchor_prompt}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
