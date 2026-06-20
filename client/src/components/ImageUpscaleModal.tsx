import { useEffect, useMemo, useState } from "react";
import type { FileNode } from "../types";
import { fileUrl, getUpscaleStatus, upscaleImage, type UpscaleStatus } from "../api";

interface ImageUpscaleModalProps {
  file: FileNode;
  /** Sibling images in the current view, for batch selection. Includes `file`. */
  images: FileNode[];
  onClose: () => void;
  onExported: () => void;
}

type SaveMode = "new" | "overwrite";
type ItemStatus = "idle" | "pending" | "done" | "error";

interface ItemResult {
  status: ItemStatus;
  path?: string;
  width?: number;
  height?: number;
  error?: string;
}

const SCALES = [2, 3, 4] as const;

function modelLabel(id: string): string {
  if (/anime/i.test(id)) return `${id}（风格化/动漫，推荐）`;
  if (/x4plus/i.test(id)) return `${id}（通用照片）`;
  return id;
}

export function ImageUpscaleModal({ file, images, onClose, onExported }: ImageUpscaleModalProps) {
  const [status, setStatus] = useState<UpscaleStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [scale, setScale] = useState<(typeof SCALES)[number]>(4);
  const [model, setModel] = useState<string>("");
  const [saveMode, setSaveMode] = useState<SaveMode>("new");
  const [selected, setSelected] = useState<Set<string>>(() => new Set([file.path]));
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [error, setError] = useState<string | null>(null);

  // De-duplicate the candidate list and make sure the opened file is present.
  const candidates = useMemo(() => {
    const map = new Map<string, FileNode>();
    map.set(file.path, file);
    for (const img of images) map.set(img.path, img);
    return Array.from(map.values());
  }, [file, images]);

  useEffect(() => {
    let alive = true;
    getUpscaleStatus()
      .then((s) => {
        if (!alive) return;
        setStatus(s);
        const preferred =
          s.models.find((m) => /^realesrgan-x4plus-anime$/i.test(m)) ||
          s.models.find((m) => /x4plus/i.test(m)) ||
          s.models.find((m) => /anime/i.test(m)) ||
          s.models[0] ||
          "";
        setModel(preferred);
      })
      .catch((err) => {
        if (alive) setStatusError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      alive = false;
    };
  }, []);

  const toggle = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const allSelected = selected.size === candidates.length && candidates.length > 0;
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(candidates.map((c) => c.path)));
  };

  const handleRun = async () => {
    const targets = candidates.filter((c) => selected.has(c.path));
    if (targets.length === 0) return;
    setRunning(true);
    setError(null);
    setProgress({ done: 0, total: targets.length });
    const overwrite = saveMode === "overwrite";

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      setResults((prev) => ({ ...prev, [t.path]: { status: "pending" } }));
      try {
        const res = await upscaleImage(t.path, scale, model || undefined, overwrite);
        setResults((prev) => ({
          ...prev,
          [t.path]: { status: "done", path: res.path, width: res.width, height: res.height },
        }));
      } catch (err) {
        setResults((prev) => ({
          ...prev,
          [t.path]: { status: "error", error: err instanceof Error ? err.message : String(err) },
        }));
      }
      setProgress({ done: i + 1, total: targets.length });
    }
    setRunning(false);
  };

  const available = status?.available ?? false;
  const selectedList = candidates.filter((c) => selected.has(c.path));
  const singleSel = selectedList.length === 1 ? selectedList[0] : null;
  const singleResult = singleSel ? results[singleSel.path] : undefined;
  const doneCount = Object.values(results).filter((r) => r.status === "done").length;
  const anyDone = doneCount > 0;

  return (
    <div className="modal-overlay image-split-overlay" onClick={onClose}>
      <div className="image-split-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-split-header">
          <h2>高清化</h2>
          <span className="image-split-filename">
            {selected.size > 1 ? `已选 ${selected.size} 张` : file.name}
          </span>
          <button type="button" className="image-split-close" onClick={onClose} title="关闭">
            ×
          </button>
        </div>

        <div className="image-split-body">
          <div className="image-split-canvas-wrap upscale-compare">
            {singleSel ? (
              <>
                <figure className="upscale-figure">
                  <img src={fileUrl(singleSel.path)} alt="原图" draggable={false} />
                  <figcaption>原图</figcaption>
                </figure>
                <figure className="upscale-figure">
                  {singleResult?.status === "done" && singleResult.path ? (
                    <img src={fileUrl(singleResult.path, Date.now())} alt="高清结果" draggable={false} />
                  ) : (
                    <div className="upscale-placeholder">
                      {singleResult?.status === "pending"
                        ? "正在高清化…"
                        : singleResult?.status === "error"
                          ? "失败"
                          : "高清结果将显示在此"}
                    </div>
                  )}
                  <figcaption>
                    高清结果
                    {singleResult?.width ? ` · ${singleResult.width}×${singleResult.height}` : ""}
                  </figcaption>
                </figure>
              </>
            ) : (
              <div className="upscale-batch-grid">
                {selectedList.map((c) => {
                  const r = results[c.path];
                  return (
                    <div key={c.path} className={`upscale-batch-item status-${r?.status ?? "idle"}`}>
                      <img src={fileUrl(c.path)} alt={c.name} draggable={false} />
                      <span className="upscale-batch-name">{c.name}</span>
                      <span className="upscale-batch-status">
                        {r?.status === "done"
                          ? `✓ ${r.width}×${r.height}`
                          : r?.status === "pending"
                            ? "…"
                            : r?.status === "error"
                              ? "✗"
                              : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="image-split-sidebar">
            <h3>AI 超分（Real-ESRGAN）</h3>

            {statusError ? (
              <p className="split-error">无法读取引擎状态：{statusError}</p>
            ) : !status ? (
              <p className="muted">正在检测高清化引擎…</p>
            ) : !available ? (
              <div className="upscale-missing">
                <p className="split-error">未检测到高清化引擎</p>
                <p className="muted">
                  请将 <code>realesrgan-ncnn-vulkan</code> 解压到下面目录后重新打开本窗口：
                </p>
                <code className="upscale-path">{status.runtimeRoot}</code>
                <p className="muted split-export-hint">
                  需包含可执行文件与 <code>models/</code>（<code>.param</code> + <code>.bin</code>）。
                </p>
              </div>
            ) : (
              <>
                <p className="muted">本地 GPU 超分，不上传图片。</p>

                <div className="split-presets">
                  <span className="split-section-label">放大倍数</span>
                  <div className="split-preset-btns">
                    {SCALES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={scale === s ? "split-preset-btn active" : "split-preset-btn"}
                        onClick={() => setScale(s)}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="split-custom">
                  <span className="split-section-label">模型</span>
                  <select
                    className="upscale-model-select"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    {status.models.map((m) => (
                      <option key={m} value={m}>
                        {modelLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="split-custom">
                  <span className="split-section-label">保存方式</span>
                  <div className="split-preset-btns">
                    <button
                      type="button"
                      className={saveMode === "new" ? "split-preset-btn active" : "split-preset-btn"}
                      onClick={() => setSaveMode("new")}
                      title="另存为同目录 _HD 文件，不动原图"
                    >
                      存为新文件
                    </button>
                    <button
                      type="button"
                      className={saveMode === "overwrite" ? "split-preset-btn active" : "split-preset-btn"}
                      onClick={() => setSaveMode("overwrite")}
                      title="用高清结果覆盖原图（保留原扩展名）"
                    >
                      覆盖原图
                    </button>
                  </div>
                </div>

                <div className="split-selection">
                  <span className="split-section-label">批量选择</span>
                  <button type="button" className="split-link-btn" onClick={toggleAll}>
                    {allSelected ? "全不选" : "全选"}
                  </button>
                  <div className="upscale-select-list">
                    {candidates.map((c) => (
                      <label key={c.path} className="upscale-select-row">
                        <input
                          type="checkbox"
                          checked={selected.has(c.path)}
                          onChange={() => toggle(c.path)}
                        />
                        <span className="upscale-select-name">{c.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="muted split-selection-hint">已选 {selected.size} / {candidates.length} 张</p>
                </div>

                {error && <p className="split-error">{error}</p>}

                <button
                  type="button"
                  className="btn-primary split-export-btn"
                  onClick={() => void handleRun()}
                  disabled={running || selected.size === 0}
                >
                  {running
                    ? `高清化中… ${progress?.done ?? 0}/${progress?.total ?? 0}`
                    : `开始高清化（${selected.size} 张）`}
                </button>

                {anyDone && !running && (
                  <button
                    type="button"
                    className="split-link-btn"
                    onClick={onExported}
                    style={{ alignSelf: "stretch", textAlign: "center" }}
                  >
                    完成并刷新文件树（成功 {doneCount} 张）
                  </button>
                )}

                <p className="muted split-export-hint">
                  {saveMode === "new"
                    ? "输出：各图同目录「<原名>_HD.png」"
                    : "覆盖：直接替换原图（保留原扩展名）"}
                </p>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
