/**
 * Admin Code Editor — Full Termux-like IDE
 *
 * Features:
 *   - Full recursive file tree with expand/collapse
 *   - Multi-tab code editor with line numbers and syntax hints
 *   - Create / Delete / Rename files and directories (with recursive delete)
 *   - Live save with auto-backup
 *   - Integrated terminal with command history
 *   - NPM Package Manager (install, uninstall, search, run scripts)
 *   - Git integration (status, commit, push, pull, log)
 *   - Deploy to server (build + rsync/scp)
 *   - Find & Replace across files
 *   - File search
 *   - Backup management (restore previous versions)
 *   - Project stats & download as zip
 *   - Breadcrumb navigation
 *   - Keyboard shortcuts (Ctrl+S save, Ctrl+P search, Ctrl+Shift+F find-replace)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, FolderOpen, File, FileCode, FileText, Image, Save, Plus,
  Trash2, Edit3, ChevronRight, ChevronDown, Search, Terminal,
  Download, Upload, RefreshCw, X, Check, Copy, ArrowLeft,
  FolderPlus, FilePlus, AlertTriangle, Eye, EyeOff, History,
  HardDrive, Play, Square, FolderUp, Home, MoreVertical,
  GitBranch, GitCommit, GitPullRequest, Rocket, Package,
  SearchCode, ArrowRightLeft, Server, RotateCcw, Minus, PlusSquare,
  Settings, Box, ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useT, useI18n } from "@/contexts/i18n-context";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------
interface FileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  modified: string;
  extension: string | null;
  children?: FileEntry[];
}

interface FileContent {
  content: string;
  path: string;
  size: number;
  modified: string;
  extension: string;
}

interface BackupEntry {
  name: string;
  size: number;
  modified: string;
}

interface TerminalLine {
  type: "input" | "output" | "error" | "system";
  text: string;
  timestamp: string;
}

interface TabInfo {
  path: string;
  name: string;
  isDirty: boolean;
}

interface NpmPackage {
  name: string;
  version: string;
  isDev?: boolean;
}

interface GitStatus {
  changed: { status: string; file: string }[];
  branch: string;
  recentCommits: string[];
  hasGit: boolean;
}

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------
function getLanguage(ext: string | null): string {
  if (!ext) return "text";
  const map: Record<string, string> = {
    ".ts": "typescript", ".tsx": "typescript", ".js": "javascript", ".jsx": "javascript",
    ".json": "json", ".css": "css", ".scss": "scss", ".html": "html", ".md": "markdown",
    ".py": "python", ".prisma": "prisma", ".sql": "sql", ".yaml": "yaml", ".yml": "yaml",
    ".env": "env", ".sh": "bash", ".bash": "bash", ".gitignore": "gitignore",
    ".svg": "xml", ".xml": "xml",
  };
  return map[ext] || "text";
}

function getFileIcon(entry: FileEntry) {
  if (entry.type === "directory") return <Folder className="text-yellow-400" size={14} />;
  const ext = entry.extension;
  if ([".ts", ".tsx"].includes(ext || "")) return <FileCode className="text-blue-400" size={14} />;
  if ([".js", ".jsx"].includes(ext || "")) return <FileCode className="text-yellow-300" size={14} />;
  if ([".css", ".scss"].includes(ext || "")) return <FileCode className="text-pink-400" size={14} />;
  if ([".json", ".yaml", ".yml"].includes(ext || "")) return <FileText className="text-green-400" size={14} />;
  if ([".png", ".jpg", ".svg", ".gif", ".webp"].includes(ext || "")) return <Image className="text-purple-400" size={14} />;
  if ([".md"].includes(ext || "")) return <FileText className="text-gray-400" size={14} />;
  if ([".prisma"].includes(ext || "")) return <FileCode className="text-cyan-400" size={14} />;
  if ([".sh", ".bash"].includes(ext || "")) return <FileText className="text-orange-400" size={14} />;
  return <File className="text-muted-foreground" size={14} />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

// ---------------------------------------------------------------------------
//  Component
// ---------------------------------------------------------------------------
export default function AdminCodeEditor() {
  const { user } = useAuth();
  const t = useT();
  const { dir } = useI18n();
  const { toast } = useToast();

  // Core state
  const [currentDir, setCurrentDir] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [fullTree, setFullTree] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tabs
  const [openTabs, setOpenTabs] = useState<TabInfo[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Terminal
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalRunning, setTerminalRunning] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Search & Find-Replace
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findResults, setFindResults] = useState<any>(null);
  const [findRunning, setFindRunning] = useState(false);

  // Dialogs
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newItemType, setNewItemType] = useState<"file" | "directory">("file");
  const [newItemName, setNewItemName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Panels
  const [showBackups, setShowBackups] = useState(false);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [projectStats, setProjectStats] = useState<any>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([""]));
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);

  // NPM Panel
  const [showNpm, setShowNpm] = useState(false);
  const [npmPackages, setNpmPackages] = useState<{ dependencies: Record<string, string>; devDependencies: Record<string, string>; scripts: Record<string, string> }>({ dependencies: {}, devDependencies: {}, scripts: {} });
  const [npmSearchQuery, setNpmSearchQuery] = useState("");
  const [npmSearchResults, setNpmSearchResults] = useState<any[]>([]);
  const [npmInstallName, setNpmInstallName] = useState("");
  const [npmInstallDev, setNpmInstallDev] = useState(false);

  // Git Panel
  const [showGit, setShowGit] = useState(false);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [gitCommitMsg, setGitCommitMsg] = useState("");
  const [gitPushing, setGitPushing] = useState(false);

  // Deploy Panel
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployHost, setDeployHost] = useState("");
  const [deployUser, setDeployUser] = useState("");
  const [deployPath, setDeployPath] = useState("");
  const [deployKey, setDeployKey] = useState("");
  const [deployMethod, setDeployMethod] = useState<"rsync" | "scp">("rsync");
  const [deploying, setDeploying] = useState(false);

  // Sidebar width
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [resizing, setResizing] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  // Load directory contents
  const loadDirectory = useCallback(async (dirPath: string) => {
    setLoading(true);
    try {
      const res = await apiGet<{ items: FileEntry[]; cwd: string }>(`/admin/files/tree?dir=${encodeURIComponent(dirPath)}`);
      setFiles(res.items);
      setCurrentDir(res.cwd);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load full tree
  const loadFullTree = useCallback(async () => {
    try {
      const res = await apiGet<{ tree: FileEntry[] }>(`/admin/files/full-tree?depth=3`);
      setFullTree(res.tree);
    } catch {}
  }, []);

  // Load file content
  const loadFile = useCallback(async (file: FileEntry) => {
    if (isDirty && selectedFile) {
      if (!confirm("لديك تغييرات غير محفوظة. هل تريد المتابعة؟")) return;
    }
    setSelectedFile(file);
    try {
      const res = await apiGet<FileContent>(`/admin/files/read?file=${encodeURIComponent(file.path)}`);
      setFileContent(res);
      setEditedContent(res.content);
      setIsDirty(false);

      // Add tab if not open
      if (!openTabs.find(t => t.path === file.path)) {
        setOpenTabs(prev => [...prev, { path: file.path, name: file.name, isDirty: false }]);
      }
      setActiveTab(file.path);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  }, [isDirty, selectedFile, openTabs, toast]);

  // Save file
  const saveFile = useCallback(async () => {
    if (!selectedFile || !isDirty) return;
    setSaving(true);
    try {
      await apiPut("/admin/files/write", { file: selectedFile.path, content: editedContent });
      setIsDirty(false);
      setFileContent((prev) => prev ? { ...prev, content: editedContent } : null);
      setOpenTabs(prev => prev.map(t => t.path === selectedFile.path ? { ...t, isDirty: false } : t));
      toast({ title: "تم الحفظ", description: selectedFile.path });
    } catch (e: any) {
      toast({ title: "خطأ في الحفظ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [selectedFile, editedContent, isDirty, toast]);

  // Create new file/dir
  const createItem = useCallback(async () => {
    if (!newItemName.trim()) return;
    try {
      const fullPath = currentDir ? `${currentDir}/${newItemName}` : newItemName;
      await apiPost("/admin/files/create", { path: fullPath, type: newItemType, content: "" });
      setShowNewDialog(false);
      setNewItemName("");
      loadDirectory(currentDir);
      loadFullTree();
      toast({ title: "تم الإنشاء", description: fullPath });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  }, [currentDir, newItemName, newItemType, loadDirectory, loadFullTree, toast]);

  // Delete file/dir
  const deleteItem = useCallback(async () => {
    if (!selectedFile) return;
    try {
      await apiDelete("/admin/files/delete", { path: selectedFile.path, recursive: true });
      setShowDeleteConfirm(false);
      setSelectedFile(null);
      setFileContent(null);
      setEditedContent("");
      setIsDirty(false);
      setOpenTabs(prev => prev.filter(t => t.path !== selectedFile.path));
      if (activeTab === selectedFile.path) setActiveTab(null);
      loadDirectory(currentDir);
      loadFullTree();
      toast({ title: "تم الحذف", description: selectedFile.path });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  }, [selectedFile, currentDir, activeTab, loadDirectory, loadFullTree, toast]);

  // Rename
  const renameItem = useCallback(async () => {
    if (!selectedFile || !renameValue.trim()) return;
    try {
      const parentDir = selectedFile.path.includes("/") ? selectedFile.path.substring(0, selectedFile.path.lastIndexOf("/")) : "";
      const newPath = parentDir ? `${parentDir}/${renameValue}` : renameValue;
      await apiPost("/admin/files/rename", { oldPath: selectedFile.path, newPath });
      setShowRenameDialog(false);
      setRenameValue("");
      loadDirectory(currentDir);
      loadFullTree();
      setSelectedFile(null);
      setFileContent(null);
      setIsDirty(false);
      toast({ title: "تم إعادة التسمية", description: newPath });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  }, [selectedFile, renameValue, currentDir, loadDirectory, loadFullTree, toast]);

  // Search files
  const searchFiles = useCallback(async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await apiGet<{ files: string[] }>(`/admin/files/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.files);
    } catch (e: any) {
      toast({ title: "خطأ في البحث", description: e.message, variant: "destructive" });
    }
  }, [searchQuery, toast]);

  // Find & Replace
  const executeFindReplace = useCallback(async (doReplace: boolean) => {
    if (!findText.trim()) return;
    setFindRunning(true);
    try {
      const res = await apiPost<any>("/admin/files/find-replace", {
        find: findText,
        replace: doReplace ? replaceText : undefined,
      });
      setFindResults(res);
      if (doReplace && res.count > 0) {
        loadDirectory(currentDir);
        loadFullTree();
        if (selectedFile) loadFile(selectedFile);
        toast({ title: `تم استبدال ${res.count} مرة`, description: `في ${res.files?.length || 0} ملف` });
      }
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setFindRunning(false);
    }
  }, [findText, replaceText, currentDir, selectedFile, loadDirectory, loadFullTree, loadFile, toast]);

  // Execute terminal command
  const executeCommand = useCallback(async (cmd: string) => {
    const now = new Date().toLocaleTimeString();
    setTerminalLines((prev) => [...prev, { type: "input", text: `$ ${cmd}`, timestamp: now }]);
    setTerminalRunning(true);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    try {
      const res = await apiPost<{ success: boolean; stdout: string; stderr: string; exitCode: number }>("/admin/files/terminal", { command: cmd });
      if (res.stdout) setTerminalLines((prev) => [...prev, { type: "output", text: res.stdout, timestamp: now }]);
      if (res.stderr) setTerminalLines((prev) => [...prev, { type: "error", text: res.stderr, timestamp: now }]);
      if (!res.stdout && !res.stderr && res.exitCode === 0) {
        setTerminalLines((prev) => [...prev, { type: "system", text: "✓ تم بنجاح", timestamp: now }]);
      }
      if (res.exitCode !== 0) {
        setTerminalLines((prev) => [...prev, { type: "error", text: `Exit code: ${res.exitCode}`, timestamp: now }]);
      }
      // Refresh file tree after npm/git commands
      if (cmd.includes("npm install") || cmd.includes("npm uninstall") || cmd.includes("git pull") || cmd.includes("git checkout")) {
        loadFullTree();
        loadDirectory(currentDir);
      }
    } catch (e: any) {
      setTerminalLines((prev) => [...prev, { type: "error", text: e.message, timestamp: now }]);
    } finally {
      setTerminalRunning(false);
    }
  }, [loadFullTree, loadDirectory, currentDir]);

  // Load backups
  const loadBackups = useCallback(async () => {
    try {
      const res = await apiGet<{ backups: BackupEntry[] }>("/admin/files/backups");
      setBackups(res.backups);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  // Restore backup
  const restoreBackup = useCallback(async (backupName: string) => {
    try {
      await apiPost("/admin/files/backups/restore", { backupName });
      toast({ title: "تمت الاستعادة", description: backupName });
      loadBackups();
      if (selectedFile) loadFile(selectedFile);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  }, [toast, selectedFile, loadFile, loadBackups]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const res = await apiGet<any>("/admin/files/stats");
      setProjectStats(res);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  // Load NPM packages
  const loadNpmPackages = useCallback(async () => {
    try {
      const res = await apiGet<any>("/admin/files/npm/list");
      setNpmPackages(res);
    } catch {}
  }, []);

  // NPM install
  const npmInstall = useCallback(async (pkgName: string, dev: boolean = false) => {
    if (!pkgName.trim()) return;
    setTerminalRunning(true);
    setShowNpm(false);
    setShowTerminal(true);
    const now = new Date().toLocaleTimeString();
    setTerminalLines(prev => [...prev, { type: "system", text: `📦 تثبيت ${pkgName}...`, timestamp: now }]);
    try {
      const res = await apiPost<any>("/admin/files/npm/install", { packages: [pkgName], dev, workdir: "client" });
      setTerminalLines(prev => [...prev, 
        { type: res.success ? "output" : "error", text: res.stdout || res.stderr || "تم", timestamp: now }
      ]);
      loadNpmPackages();
      loadFullTree();
    } catch (e: any) {
      setTerminalLines(prev => [...prev, { type: "error", text: e.message, timestamp: now }]);
    } finally {
      setTerminalRunning(false);
    }
  }, [loadNpmPackages, loadFullTree]);

  // NPM uninstall
  const npmUninstall = useCallback(async (pkgName: string, dev: boolean = false) => {
    setTerminalRunning(true);
    setShowTerminal(true);
    const now = new Date().toLocaleTimeString();
    setTerminalLines(prev => [...prev, { type: "system", text: `🗑️ إزالة ${pkgName}...`, timestamp: now }]);
    try {
      const res = await apiPost<any>("/admin/files/npm/uninstall", { packages: [pkgName], dev });
      setTerminalLines(prev => [...prev, 
        { type: res.success ? "output" : "error", text: res.stdout || res.stderr || "تم", timestamp: now }
      ]);
      loadNpmPackages();
    } catch (e: any) {
      setTerminalLines(prev => [...prev, { type: "error", text: e.message, timestamp: now }]);
    } finally {
      setTerminalRunning(false);
    }
  }, [loadNpmPackages]);

  // NPM search
  const npmSearch = useCallback(async () => {
    if (!npmSearchQuery.trim()) return;
    try {
      const res = await apiGet<{ results: any[] }>(`/admin/files/npm/search?q=${encodeURIComponent(npmSearchQuery)}`);
      setNpmSearchResults(res.results);
    } catch {}
  }, [npmSearchQuery]);

  // Git status
  const loadGitStatus = useCallback(async () => {
    try {
      const res = await apiGet<GitStatus>("/admin/files/git/status");
      setGitStatus(res);
    } catch {}
  }, []);

  // Git commit
  const gitCommit = useCallback(async () => {
    if (!gitCommitMsg.trim()) return;
    setTerminalRunning(true);
    setShowTerminal(true);
    try {
      const res = await apiPost<any>("/admin/files/git/commit", { message: gitCommitMsg, addAll: true });
      setTerminalLines(prev => [...prev, 
        { type: res.success ? "output" : "error", text: res.stdout || res.stderr || "تم الكوميت", timestamp: new Date().toLocaleTimeString() }
      ]);
      setGitCommitMsg("");
      loadGitStatus();
    } catch (e: any) {
      setTerminalLines(prev => [...prev, { type: "error", text: e.message, timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setTerminalRunning(false);
    }
  }, [gitCommitMsg, loadGitStatus]);

  // Git push
  const gitPush = useCallback(async () => {
    setGitPushing(true);
    setTerminalRunning(true);
    setShowTerminal(true);
    try {
      const res = await apiPost<any>("/admin/files/git/push", {});
      setTerminalLines(prev => [...prev, 
        { type: res.success ? "output" : "error", text: res.stdout || res.stderr || "تم الدفع", timestamp: new Date().toLocaleTimeString() }
      ]);
      loadGitStatus();
    } catch (e: any) {
      setTerminalLines(prev => [...prev, { type: "error", text: e.message, timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setGitPushing(false);
      setTerminalRunning(false);
    }
  }, [loadGitStatus]);

  // Deploy
  const deployProject = useCallback(async () => {
    if (!deployHost || !deployUser || !deployPath) {
      toast({ title: "خطأ", description: "يجب ملء جميع بيانات السيرفر", variant: "destructive" });
      return;
    }
    setDeploying(true);
    setShowTerminal(true);
    setTerminalLines(prev => [...prev, { type: "system", text: "🚀 بدء البناء والنشر...", timestamp: new Date().toLocaleTimeString() }]);
    try {
      const res = await apiPost<any>("/admin/files/deploy", {
        host: deployHost, user: deployUser, path: deployPath, key: deployKey, method: deployMethod,
      });
      setTerminalLines(prev => [...prev,
        { type: res.success ? "output" : "error", text: res.stdout || res.stderr || (res.step === "build" ? "فشل البناء" : "تم النشر"), timestamp: new Date().toLocaleTimeString() }
      ]);
      if (res.success) toast({ title: "تم النشر بنجاح!" });
    } catch (e: any) {
      setTerminalLines(prev => [...prev, { type: "error", text: e.message, timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setDeploying(false);
    }
  }, [deployHost, deployUser, deployPath, deployKey, deployMethod, toast]);

  // Build project
  const buildProject = useCallback(async () => {
    setTerminalRunning(true);
    setShowTerminal(true);
    setTerminalLines(prev => [...prev, { type: "system", text: "🔨 بدء البناء...", timestamp: new Date().toLocaleTimeString() }]);
    try {
      const res = await apiPost<any>("/admin/files/build", {});
      setTerminalLines(prev => [...prev,
        { type: res.success ? "output" : "error", text: res.stdout || res.stderr || (res.success ? "تم البناء بنجاح!" : "فشل البناء"), timestamp: new Date().toLocaleTimeString() }
      ]);
    } catch (e: any) {
      setTerminalLines(prev => [...prev, { type: "error", text: e.message, timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setTerminalRunning(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadDirectory(""); loadFullTree(); }, [loadDirectory, loadFullTree]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty) saveFile();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setShowSearch(!showSearch);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setShowFindReplace(!showFindReplace);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDirty, saveFile, showSearch, showFindReplace]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!currentDir) return [{ name: "zero-landing-v4", path: "" }];
    const parts = currentDir.split("/");
    return [
      { name: "zero-landing-v4", path: "" },
      ...parts.map((p, i) => ({ name: p, path: parts.slice(0, i + 1).join("/") })),
    ];
  }, [currentDir]);

  // Line numbers
  const lineCount = editedContent.split("\n").length;

  // Tab key handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = editedContent.substring(0, start) + "  " + editedContent.substring(end);
      setEditedContent(newContent);
      setIsDirty(true);
      setTimeout(() => { target.selectionStart = target.selectionEnd = start + 2; }, 0);
    }
  };

  // Toggle directory in tree
  const toggleDir = (dirPath: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(dirPath)) next.delete(dirPath);
      else next.add(dirPath);
      return next;
    });
  };

  // Close tab
  const closeTab = (tabPath: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const tab = openTabs.find(t => t.path === tabPath);
    if (tab?.isDirty) {
      if (!confirm("الملف فيه تغييرات غير محفوظة. تأكيد الإغلاق؟")) return;
    }
    const newTabs = openTabs.filter(t => t.path !== tabPath);
    setOpenTabs(newTabs);
    if (activeTab === tabPath) {
      if (newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        setActiveTab(lastTab.path);
        loadFile({ name: lastTab.name, path: lastTab.path, type: "file", size: 0, modified: "", extension: null });
      } else {
        setActiveTab(null);
        setSelectedFile(null);
        setFileContent(null);
        setEditedContent("");
        setIsDirty(false);
      }
    }
  };

  // Terminal history navigation
  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && terminalInput.trim()) {
      executeCommand(terminalInput.trim());
      setTerminalInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setTerminalInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setTerminalInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setTerminalInput("");
      }
    }
  };

  // Sidebar resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizing) {
      const newWidth = Math.max(200, Math.min(500, dir === "rtl" ? window.innerWidth - e.clientX : e.clientX));
      setSidebarWidth(newWidth);
    }
  }, [resizing, dir]);
  const handleMouseUp = useCallback(() => setResizing(false), []);
  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  // Render tree item recursively
  const renderTreeItem = (entry: FileEntry, depth: number = 0) => {
    const isExpanded = expandedDirs.has(entry.path);
    const isActive = selectedFile?.path === entry.path;

    if (entry.type === "directory") {
      return (
        <div key={entry.path}>
          <button
            onClick={() => toggleDir(entry.path)}
            className={`w-full flex items-center gap-1.5 px-2 py-1 text-[11px] hover:bg-background/50 transition-colors ${
              isActive ? "bg-primary/10 text-primary" : "text-foreground"
            }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {isExpanded ? <ChevronDown size={10} className="text-muted-foreground/50 flex-shrink-0" /> : <ChevronRight size={10} className="text-muted-foreground/50 flex-shrink-0" />}
            {isExpanded ? <FolderOpen className="text-yellow-400 flex-shrink-0" size={13} /> : <Folder className="text-yellow-400 flex-shrink-0" size={13} />}
            <span className="truncate font-mono">{entry.name}</span>
          </button>
          <AnimatePresence>
            {isExpanded && entry.children && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
                {entry.children.map(child => renderTreeItem(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <button
        key={entry.path}
        onClick={() => loadFile(entry)}
        onContextMenu={(e) => { e.preventDefault(); setSelectedFile(entry); }}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-[11px] hover:bg-background/50 transition-colors ${
          isActive ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-foreground"
        }`}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
      >
        {getFileIcon(entry)}
        <span className="truncate font-mono flex-1 text-left">{entry.name}</span>
        {openTabs.find(t => t.path === entry.path) && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
      </button>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-0 overflow-hidden" dir="ltr">
      {/* Top toolbar */}
      <div className="flex items-center justify-between bg-card/80 border border-border rounded-t-lg px-3 py-1.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal size={14} className="text-primary flex-shrink-0" />
          <span className="font-mono text-[10px] text-primary font-bold">ZERO IDE</span>
          {selectedFile && (
            <span className="font-mono text-[10px] text-muted-foreground truncate">
              — {selectedFile.path}
              {isDirty && <span className="text-yellow-400 ml-1">●</span>}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={() => loadDirectory(currentDir)} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-primary transition-colors" title="Refresh">
            <RefreshCw size={13} />
          </button>
          <button onClick={() => { setShowSearch(!showSearch); }} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-primary transition-colors" title="Search Files (Ctrl+P)">
            <Search size={13} />
          </button>
          <button onClick={() => setShowFindReplace(!showFindReplace)} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-primary transition-colors" title="Find & Replace (Ctrl+Shift+F)">
            <ArrowRightLeft size={13} />
          </button>
          <div className="w-px h-3.5 bg-border mx-0.5" />
          <button onClick={() => { setShowNewDialog(true); setNewItemType("file"); }} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-primary transition-colors" title="New File">
            <FilePlus size={13} />
          </button>
          <button onClick={() => { setShowNewDialog(true); setNewItemType("directory"); }} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-primary transition-colors" title="New Folder">
            <FolderPlus size={13} />
          </button>
          {selectedFile && (
            <>
              <button onClick={() => saveFile()} disabled={!isDirty || saving} className={`p-1.5 rounded hover:bg-background/50 transition-colors ${isDirty ? "text-green-400 hover:text-green-300" : "text-muted-foreground"}`} title="Save (Ctrl+S)">
                <Save size={13} />
              </button>
              <button onClick={() => { setRenameValue(selectedFile.name); setShowRenameDialog(true); }} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-yellow-400 transition-colors" title="Rename">
                <Edit3 size={13} />
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                <Trash2 size={13} />
              </button>
            </>
          )}
          <div className="w-px h-3.5 bg-border mx-0.5" />
          {/* NPM */}
          <button onClick={() => { setShowNpm(!showNpm); if (!showNpm) loadNpmPackages(); }} className={`p-1.5 rounded hover:bg-background/50 transition-colors ${showNpm ? "text-primary" : "text-muted-foreground hover:text-primary"}`} title="NPM Packages">
            <Package size={13} />
          </button>
          {/* Git */}
          <button onClick={() => { setShowGit(!showGit); if (!showGit) loadGitStatus(); }} className={`p-1.5 rounded hover:bg-background/50 transition-colors ${showGit ? "text-primary" : "text-muted-foreground hover:text-primary"}`} title="Git">
            <GitBranch size={13} />
          </button>
          {/* Deploy */}
          <button onClick={() => setShowDeploy(!showDeploy)} className={`p-1.5 rounded hover:bg-background/50 transition-colors ${showDeploy ? "text-primary" : "text-muted-foreground hover:text-primary"}`} title="Deploy">
            <Rocket size={13} />
          </button>
          {/* Build */}
          <button onClick={buildProject} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-primary transition-colors" title="Build Project">
            <Play size={13} />
          </button>
          <div className="w-px h-3.5 bg-border mx-0.5" />
          <button onClick={() => setShowBackups(!showBackups)} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-primary transition-colors" title="Backups">
            <History size={13} />
          </button>
          <button onClick={() => { setShowStats(!showStats); loadStats(); }} className="p-1.5 rounded hover:bg-background/50 text-muted-foreground hover:text-primary transition-colors" title="Stats">
            <HardDrive size={13} />
          </button>
          <button onClick={() => setShowLineNumbers(!showLineNumbers)} className={`p-1.5 rounded hover:bg-background/50 transition-colors ${showLineNumbers ? "text-primary" : "text-muted-foreground"}`} title="Line Numbers">
            {showLineNumbers ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button onClick={() => setShowTerminal(!showTerminal)} className={`p-1.5 rounded hover:bg-background/50 transition-colors ${showTerminal ? "text-primary" : "text-muted-foreground"}`} title="Terminal">
            <Terminal size={13} />
          </button>
        </div>
      </div>

      {/* Tabs bar */}
      {openTabs.length > 0 && (
        <div className="flex items-center bg-[#161b22] border-b border-[#21262d] overflow-x-auto scrollbar-none">
          {openTabs.map(tab => (
            <button
              key={tab.path}
              onClick={() => {
                setActiveTab(tab.path);
                loadFile({ name: tab.name, path: tab.path, type: "file", size: 0, modified: "", extension: null });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono border-r border-[#21262d] min-w-0 max-w-[160px] ${
                activeTab === tab.path ? "bg-[#0d1117] text-foreground" : "text-muted-foreground hover:bg-[#0d1117]/50"
              }`}
            >
              {getFileIcon({ name: tab.name, path: tab.path, type: "file", size: 0, modified: "", extension: tab.name.includes(".") ? `.${tab.name.split(".").pop()}` : null })}
              <span className="truncate">{tab.name}</span>
              {tab.isDirty && <span className="text-yellow-400 text-[8px]">●</span>}
              <span onClick={(e) => closeTab(tab.path, e)} className="ml-1 hover:text-red-400 text-muted-foreground/50">
                <X size={10} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden border border-t-0 border-border rounded-b-lg">
        {/* Sidebar — File Explorer */}
        <div className="flex-shrink-0 bg-[#0d1117] border-r border-[#21262d] flex flex-col overflow-hidden relative" style={{ width: sidebarWidth }}>
          {/* Sidebar header */}
          <div className="px-3 py-2 border-b border-[#21262d] flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Explorer</span>
            <div className="flex items-center gap-1">
              <button onClick={() => { setShowNewDialog(true); setNewItemType("file"); }} className="p-0.5 rounded hover:bg-[#21262d] text-muted-foreground hover:text-primary">
                <FilePlus size={12} />
              </button>
              <button onClick={() => { setShowNewDialog(true); setNewItemType("directory"); }} className="p-0.5 rounded hover:bg-[#21262d] text-muted-foreground hover:text-primary">
                <FolderPlus size={12} />
              </button>
              <button onClick={loadFullTree} className="p-0.5 rounded hover:bg-[#21262d] text-muted-foreground hover:text-primary">
                <RefreshCw size={11} />
              </button>
            </div>
          </div>

          {/* Full tree */}
          <div className="flex-1 overflow-y-auto py-1">
            {fullTree.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw size={14} className="animate-spin text-primary" />
              </div>
            ) : (
              fullTree.map(entry => renderTreeItem(entry))
            )}
          </div>

          {/* Bottom info */}
          <div className="px-3 py-1.5 border-t border-[#21262d] text-[9px] font-mono text-muted-foreground/50 flex items-center justify-between">
            <span>{fullTree.reduce((acc: number, e: any) => acc + (e.type === "file" ? 1 : 0), 0)} ملف</span>
            <span>ZERO IDE v2.0</span>
          </div>

          {/* Resize handle */}
          <div
            className="absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 z-10"
            style={{ [dir === "rtl" ? "left" : "right"]: 0 }}
            onMouseDown={() => setResizing(true)}
          />
        </div>

        {/* Editor + Terminal area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {fileContent ? (
              <>
                {/* File info bar */}
                <div className="flex items-center justify-between px-3 py-0.5 bg-[#161b22] border-b border-[#21262d]">
                  <div className="flex items-center gap-2">
                    {getFileIcon(selectedFile!)}
                    <span className="font-mono text-[10px] text-muted-foreground">{selectedFile?.path}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/40">
                      {getLanguage(fileContent.extension)} — {formatSize(fileContent.size)} — {lineCount} lines
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWordWrap(!wordWrap)}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${wordWrap ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {wordWrap ? "Wrap" : "No Wrap"}
                    </button>
                    {isDirty && (
                      <span className="text-[9px] font-mono text-yellow-400 animate-pulse">Unsaved</span>
                    )}
                    {saving && (
                      <span className="text-[9px] font-mono text-green-400">Saving...</span>
                    )}
                  </div>
                </div>

                {/* Code editor */}
                <div className="flex-1 overflow-auto bg-[#0d1117] relative">
                  <div className="flex min-h-full">
                    {showLineNumbers && (
                      <div className="flex-shrink-0 py-3 px-2 text-right select-none bg-[#0d1117] border-r border-[#21262d]">
                        {Array.from({ length: lineCount }, (_, i) => (
                          <div key={i} className="text-[11px] font-mono leading-[20px] text-[#484f58]">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea
                      ref={editorRef}
                      value={editedContent}
                      onChange={(e) => {
                        setEditedContent(e.target.value);
                        setIsDirty(true);
                        setOpenTabs(prev => prev.map(t => t.path === selectedFile?.path ? { ...t, isDirty: true } : t));
                      }}
                      onKeyDown={handleKeyDown}
                      className="flex-1 p-3 bg-transparent text-[#c9d1d9] font-mono text-[11px] leading-[20px] resize-none outline-none min-h-full"
                      style={{ whiteSpace: wordWrap ? "pre-wrap" : "pre", tabSize: 2 }}
                      spellCheck={false}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
                <div className="text-center space-y-4">
                  <Terminal size={48} className="text-primary/20 mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground">اختر ملفاً للتعديل</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1 font-mono">Ctrl+S حفظ | Ctrl+P بحث | Ctrl+Shift+F استبدال</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terminal panel */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 220 }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-[#21262d] bg-[#0d1117] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-3 py-1 bg-[#161b22] border-b border-[#21262d]">
                  <div className="flex items-center gap-2">
                    <Terminal size={11} className="text-primary" />
                    <span className="font-mono text-[10px] text-primary">TERMINAL</span>
                    {terminalRunning && <RefreshCw size={10} className="animate-spin text-yellow-400" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={buildProject} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-primary/10 text-primary hover:bg-primary/20" title="Build">
                      ▶ Build
                    </button>
                    <button onClick={() => setTerminalLines([])} className="p-0.5 rounded hover:bg-[#21262d] text-muted-foreground" title="Clear">
                      <Trash2 size={10} />
                    </button>
                    <button onClick={() => setShowTerminal(false)} className="text-muted-foreground hover:text-foreground">
                      <X size={11} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px] leading-[16px]">
                  {terminalLines.length === 0 && (
                    <div className="text-[#484f58]">
                      <p>ZERO Terminal v2.0 — اكتب أمراً واضغط Enter</p>
                      <p>أوامر سريعة: npm install, npm run build, git status, ls, cat</p>
                    </div>
                  )}
                  {terminalLines.map((line, i) => (
                    <div key={i} className={
                      line.type === "input" ? "text-[#58a6ff]" :
                      line.type === "error" ? "text-[#f85149]" :
                      line.type === "system" ? "text-[#8b949e]" :
                      "text-[#c9d1d9]"
                    }>
                      {line.text.split("\n").map((l, j) => (
                        <div key={j}>{l}</div>
                      ))}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border-t border-[#21262d]">
                  <span className="text-[#58a6ff] font-mono text-[10px]">$</span>
                  <input
                    ref={terminalInputRef}
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleTerminalKeyDown}
                    className="flex-1 bg-transparent text-[#c9d1d9] font-mono text-[10px] outline-none"
                    placeholder="اكتب أمراً..."
                    disabled={terminalRunning}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* =================== MODALS & PANELS =================== */}

      {/* Search modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-32"
            onClick={() => setShowSearch(false)}
          >
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl w-[520px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#21262d]">
                <Search size={14} className="text-primary" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") searchFiles(); }}
                  className="flex-1 bg-transparent text-sm outline-none text-foreground"
                  placeholder="ابحث عن ملف... (Ctrl+P)"
                  autoFocus
                />
                <button onClick={searchFiles} className="text-xs text-primary hover:underline font-mono">بحث</button>
              </div>
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((file, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const name = file.split("/").pop() || file;
                        const ext = name.includes(".") ? `.${name.split(".").pop()}` : null;
                        loadFile({ name, path: file, type: "file", size: 0, modified: "", extension: ext });
                        setShowSearch(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs hover:bg-[#21262d] transition-colors"
                    >
                      <FileCode size={13} className="text-primary" />
                      <span className="font-mono truncate text-[#c9d1d9]">{file}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Find & Replace modal */}
      <AnimatePresence>
        {showFindReplace && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 w-96"
          >
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d]">
                <span className="text-xs font-mono text-primary flex items-center gap-1.5"><ArrowRightLeft size={12} /> Find & Replace</span>
                <button onClick={() => setShowFindReplace(false)}><X size={12} className="text-muted-foreground" /></button>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex gap-2">
                  <input value={findText} onChange={e => setFindText(e.target.value)} className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs font-mono outline-none text-foreground focus:border-primary" placeholder="بحث عن..." />
                  <button onClick={() => executeFindReplace(false)} disabled={findRunning} className="px-3 py-1.5 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 font-mono">بحث</button>
                </div>
                <div className="flex gap-2">
                  <input value={replaceText} onChange={e => setReplaceText(e.target.value)} className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs font-mono outline-none text-foreground focus:border-primary" placeholder="استبدال بـ..." />
                  <button onClick={() => executeFindReplace(true)} disabled={findRunning} className="px-3 py-1.5 rounded text-xs bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 font-mono">استبدال</button>
                </div>
                {findResults && (
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {findResults.dryRun ? `${findResults.count} ملف مطابق` : `تم استبدال ${findResults.count} مرة في ${findResults.files?.length || 0} ملف`}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New item dialog */}
      <AnimatePresence>
        {showNewDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setShowNewDialog(false)}
          >
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-foreground">
                {newItemType === "file" ? <FilePlus size={16} className="text-primary" /> : <FolderPlus size={16} className="text-primary" />}
                {newItemType === "file" ? "ملف جديد" : "مجلد جديد"}
              </h3>
              <input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createItem(); }}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm font-mono outline-none text-foreground focus:border-primary mb-3"
                placeholder={newItemType === "file" ? "example.tsx" : "my-folder"}
                autoFocus
              />
              <div className="flex gap-2 mb-4">
                <button onClick={() => setNewItemType("file")} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs ${newItemType === "file" ? "bg-primary/15 text-primary border border-primary/30" : "bg-[#0d1117] border border-[#30363d] text-muted-foreground"}`}>
                  <File size={13} /> ملف
                </button>
                <button onClick={() => setNewItemType("directory")} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs ${newItemType === "directory" ? "bg-primary/15 text-primary border border-primary/30" : "bg-[#0d1117] border border-[#30363d] text-muted-foreground"}`}>
                  <Folder size={13} /> مجلد
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowNewDialog(false)} className="flex-1 px-3 py-2 rounded-lg text-xs bg-[#0d1117] border border-[#30363d] text-muted-foreground hover:text-foreground">إلغاء</button>
                <button onClick={createItem} className="flex-1 px-3 py-2 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90">إنشاء</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {showDeleteConfirm && selectedFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-[#161b22] border border-red-500/30 rounded-xl p-5 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-red-400" />
                <h3 className="text-sm font-bold text-red-400">تأكيد الحذف</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                هل أنت متأكد من حذف <span className="text-foreground font-mono">{selectedFile.path}</span>؟
                <br />سيتم إنشاء نسخة احتياطية قبل الحذف.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-3 py-2 rounded-lg text-xs bg-[#0d1117] border border-[#30363d] text-muted-foreground">إلغاء</button>
                <button onClick={deleteItem} className="flex-1 px-3 py-2 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600">حذف</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename dialog */}
      <AnimatePresence>
        {showRenameDialog && selectedFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowRenameDialog(false)}>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-foreground">
                <Edit3 size={16} className="text-yellow-400" /> إعادة تسمية
              </h3>
              <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") renameItem(); }}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm font-mono outline-none text-foreground focus:border-primary mb-4" autoFocus />
              <div className="flex gap-2">
                <button onClick={() => setShowRenameDialog(false)} className="flex-1 px-3 py-2 rounded-lg text-xs bg-[#0d1117] border border-[#30363d] text-muted-foreground">إلغاء</button>
                <button onClick={renameItem} className="flex-1 px-3 py-2 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90">تأكيد</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NPM Panel */}
      <AnimatePresence>
        {showNpm && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 left-0 h-full w-96 bg-[#0d1117] border-r border-[#30363d] shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d]">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground"><Package size={14} className="text-primary" /> NPM Package Manager</h3>
              <button onClick={() => setShowNpm(false)}><X size={14} className="text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Install */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-primary uppercase">تثبيت حزمة</h4>
                <div className="flex gap-2">
                  <input value={npmInstallName} onChange={e => setNpmInstallName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") npmInstall(npmInstallName, npmInstallDev); }}
                    className="flex-1 bg-[#161b22] border border-[#30363d] rounded px-2 py-1.5 text-xs font-mono outline-none text-foreground" placeholder="package-name" />
                  <button onClick={() => npmInstall(npmInstallName, npmInstallDev)} className="px-3 py-1.5 rounded text-xs bg-primary text-primary-foreground font-mono">Install</button>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={npmInstallDev} onChange={e => setNpmInstallDev(e.target.checked)} className="rounded" />
                  --save-dev
                </label>
              </div>

              {/* Search npm */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-primary uppercase">بحث في NPM</h4>
                <div className="flex gap-2">
                  <input value={npmSearchQuery} onChange={e => setNpmSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") npmSearch(); }}
                    className="flex-1 bg-[#161b22] border border-[#30363d] rounded px-2 py-1.5 text-xs font-mono outline-none text-foreground" placeholder="بحث..." />
                  <button onClick={npmSearch} className="px-3 py-1.5 rounded text-xs bg-[#21262d] text-foreground font-mono">بحث</button>
                </div>
                {npmSearchResults.slice(0, 5).map((pkg: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1.5 bg-[#161b22] rounded border border-[#30363d]">
                    <div>
                      <p className="text-xs font-mono text-foreground">{pkg.name}</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{pkg.description}</p>
                    </div>
                    <button onClick={() => npmInstall(pkg.name)} className="px-2 py-0.5 rounded text-[9px] bg-primary/10 text-primary font-mono flex-shrink-0">Install</button>
                  </div>
                ))}
              </div>

              {/* Installed packages */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-primary uppercase">الحزم المثبتة ({Object.keys(npmPackages.dependencies || {}).length + Object.keys(npmPackages.devDependencies || {}).length})</h4>
                {Object.entries(npmPackages.dependencies || {}).map(([name, version]) => (
                  <div key={name} className="flex items-center justify-between px-2 py-1 bg-[#161b22] rounded border border-[#30363d]">
                    <span className="text-[10px] font-mono text-foreground truncate">{name}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[9px] font-mono text-muted-foreground">{version as string}</span>
                      <button onClick={() => npmUninstall(name)} className="text-[9px] text-red-400 hover:text-red-300 px-1">✕</button>
                    </div>
                  </div>
                ))}
                {Object.entries(npmPackages.devDependencies || {}).map(([name, version]) => (
                  <div key={name} className="flex items-center justify-between px-2 py-1 bg-[#161b22] rounded border border-[#30363d]">
                    <span className="text-[10px] font-mono text-foreground truncate">{name} <span className="text-muted-foreground/50">(dev)</span></span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[9px] font-mono text-muted-foreground">{version as string}</span>
                      <button onClick={() => npmUninstall(name, true)} className="text-[9px] text-red-400 hover:text-red-300 px-1">✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scripts */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-primary uppercase">السكريبتات</h4>
                {Object.entries(npmPackages.scripts || {}).map(([name, script]) => (
                  <button key={name} onClick={() => executeCommand(`npm run ${name}`)} className="w-full flex items-center justify-between px-2 py-1.5 bg-[#161b22] rounded border border-[#30363d] hover:border-primary/30 text-left">
                    <span className="text-[10px] font-mono text-primary">{name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[200px]">{script as string}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Git Panel */}
      <AnimatePresence>
        {showGit && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 left-0 h-full w-96 bg-[#0d1117] border-r border-[#30363d] shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d]">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground"><GitBranch size={14} className="text-primary" /> Git</h3>
              <button onClick={() => setShowGit(false)}><X size={14} className="text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {gitStatus && (
                <>
                  <div className="flex items-center gap-2 text-xs">
                    <GitBranch size={12} className="text-primary" />
                    <span className="font-mono text-foreground">{gitStatus.branch || "no branch"}</span>
                  </div>

                  {gitStatus.changed.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-primary uppercase">تغييرات ({gitStatus.changed.length})</h4>
                      {gitStatus.changed.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1 bg-[#161b22] rounded border border-[#30363d] text-[10px] font-mono">
                          <span className={`w-5 text-center ${c.status.includes("M") ? "text-yellow-400" : c.status.includes("D") ? "text-red-400" : "text-green-400"}`}>{c.status}</span>
                          <span className="text-foreground truncate">{c.file}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono text-primary uppercase">Commit</h4>
                    <div className="flex gap-2">
                      <input value={gitCommitMsg} onChange={e => setGitCommitMsg(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") gitCommit(); }}
                        className="flex-1 bg-[#161b22] border border-[#30363d] rounded px-2 py-1.5 text-xs font-mono outline-none text-foreground" placeholder="رسالة الكوميت..." />
                      <button onClick={gitCommit} className="px-3 py-1.5 rounded text-xs bg-primary text-primary-foreground font-mono">Commit</button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={gitPush} disabled={gitPushing} className="flex-1 px-3 py-1.5 rounded text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 font-mono flex items-center justify-center gap-1">
                        <Upload size={10} /> Push
                      </button>
                      <button onClick={async () => { executeCommand("git pull"); }} className="flex-1 px-3 py-1.5 rounded text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-mono flex items-center justify-center gap-1">
                        <Download size={10} /> Pull
                      </button>
                    </div>
                  </div>

                  {gitStatus.recentCommits.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-primary uppercase">آخر الكوميتات</h4>
                      {gitStatus.recentCommits.map((c, i) => (
                        <div key={i} className="px-2 py-1 bg-[#161b22] rounded text-[10px] font-mono text-muted-foreground">{c}</div>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button onClick={loadGitStatus} className="w-full px-3 py-2 rounded-lg text-xs bg-[#21262d] text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                <RefreshCw size={12} /> تحديث الحالة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deploy Panel */}
      <AnimatePresence>
        {showDeploy && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 left-0 h-full w-96 bg-[#0d1117] border-r border-[#30363d] shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d]">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground"><Rocket size={14} className="text-primary" /> Deploy to Server</h3>
              <button onClick={() => setShowDeploy(false)}><X size={14} className="text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-[10px] text-yellow-400">
                ⚠️ سيتم البناء أولاً ثم رفع الملفات للسيرفر. تأكد من صحة البيانات.
              </div>
              <input value={deployHost} onChange={e => setDeployHost(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1.5 text-xs font-mono outline-none text-foreground" placeholder="Server IP / Hostname" />
              <input value={deployUser} onChange={e => setDeployUser(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1.5 text-xs font-mono outline-none text-foreground" placeholder="Username (e.g. root)" />
              <input value={deployPath} onChange={e => setDeployPath(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1.5 text-xs font-mono outline-none text-foreground" placeholder="Deploy path (e.g. /var/www/html)" />
              <input value={deployKey} onChange={e => setDeployKey(e.target.value)} className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1.5 text-xs font-mono outline-none text-foreground" placeholder="SSH Key path (optional, e.g. ~/.ssh/id_rsa)" />
              <div className="flex gap-2">
                <button onClick={() => setDeployMethod("rsync")} className={`flex-1 py-1.5 rounded text-xs font-mono ${deployMethod === "rsync" ? "bg-primary/15 text-primary border border-primary/30" : "bg-[#161b22] border border-[#30363d] text-muted-foreground"}`}>rsync</button>
                <button onClick={() => setDeployMethod("scp")} className={`flex-1 py-1.5 rounded text-xs font-mono ${deployMethod === "scp" ? "bg-primary/15 text-primary border border-primary/30" : "bg-[#161b22] border border-[#30363d] text-muted-foreground"}`}>scp</button>
              </div>
              <button onClick={deployProject} disabled={deploying} className="w-full py-2 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-mono flex items-center justify-center gap-2">
                <Rocket size={12} /> {deploying ? "جاري النشر..." : "بناء ونشر"}
              </button>
              <button onClick={buildProject} className="w-full py-2 rounded-lg text-xs bg-[#21262d] text-foreground hover:bg-[#30363d] font-mono flex items-center justify-center gap-2">
                <Play size={12} /> بناء فقط (Build)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backups panel */}
      <AnimatePresence>
        {showBackups && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 left-0 h-full w-80 bg-[#0d1117] border-r border-[#30363d] shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d]">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground"><History size={14} className="text-primary" /> النسخ الاحتياطية</h3>
              <button onClick={() => setShowBackups(false)}><X size={14} className="text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {backups.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">لا توجد نسخ احتياطية</div>
              ) : (
                backups.map((b, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#161b22] rounded-lg border border-[#30363d]">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-foreground truncate">{b.name}</p>
                      <p className="text-[9px] text-muted-foreground">{formatTime(b.modified)} — {formatSize(b.size)}</p>
                    </div>
                    <button onClick={() => restoreBackup(b.name)} className="text-[10px] text-primary hover:underline px-2 py-1 flex-shrink-0">استعادة</button>
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-3 border-t border-[#21262d]">
              <button onClick={loadBackups} className="w-full px-3 py-2 rounded-lg text-xs bg-[#21262d] text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                <RefreshCw size={12} /> تحديث القائمة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats panel */}
      <AnimatePresence>
        {showStats && projectStats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 bg-[#161b22] border border-[#30363d] rounded-xl p-4 shadow-2xl z-50 w-64">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground"><HardDrive size={14} className="text-primary" /> إحصائيات المشروع</h3>
              <button onClick={() => setShowStats(false)}><X size={12} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">الملفات</span><span className="font-mono text-foreground">{projectStats.stats?.FILES || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">المجلدات</span><span className="font-mono text-foreground">{projectStats.stats?.DIRS || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الحجم</span><span className="font-mono text-foreground">{projectStats.stats?.SIZE || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الحزم</span><span className="font-mono text-foreground">{Object.keys(npmPackages.dependencies || {}).length}</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#21262d]">
              <a href="/api/admin/files/download" className="w-full py-1.5 rounded text-[10px] bg-primary/10 text-primary hover:bg-primary/20 font-mono flex items-center justify-center gap-1">
                <Download size={10} /> تحميل المشروع ZIP
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
