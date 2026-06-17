import { useEffect, useState } from "react";
import type { WorkspaceResponse } from "./types";
import { fetchWorkspace } from "./api";
import App from "./App";
import { NoWorkspaceScreen } from "./components/NoWorkspaceScreen";
import { useDisableBrowserContextMenu } from "./hooks/useDisableBrowserContextMenu";
import { debugLog } from "./lib/debugLog";

function useWorkspaceLoader() {
  const [data, setData] = useState<WorkspaceResponse | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async (): Promise<WorkspaceResponse> => {
    const firstLoad = data === null;
    debugLog("workspace", "reload start", { firstLoad });
    if (firstLoad) {
      setInitialLoading(true);
    }
    setError(null);
    try {
      const result = await fetchWorkspace();
      setData(result);
      debugLog("workspace", "reload ok", {
        workspaceId: result.active?.id ?? null,
        projectCount: result.active?.projects.length ?? 0,
      });
      return result;
    } catch (err) {
      debugLog("workspace", "reload error", { error: String(err) });
      setError(String(err));
      throw err;
    } finally {
      if (firstLoad) {
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return { data, initialLoading, error, reload };
}

export default function Bootstrap() {
  useDisableBrowserContextMenu();
  const workspace = useWorkspaceLoader();

  if (workspace.initialLoading) {
    return <div className="loading-screen">正在加载 Workspace...</div>;
  }

  if (workspace.error || !workspace.data) {
    return (
      <div className="loading-screen error">
        <p>加载失败：{workspace.error}</p>
        <button onClick={() => void workspace.reload()}>重试</button>
      </div>
    );
  }

  if (!workspace.data.active) {
    return <NoWorkspaceScreen onReady={() => workspace.reload()} />;
  }

  return (
    <App
      workspace={workspace.data as WorkspaceResponse & { active: NonNullable<WorkspaceResponse["active"]> }}
      onRefresh={workspace.reload}
    />
  );
}
