import type { AssetDomain } from "../config/assetDomains";
import {
  ASSET_DOMAIN_ENABLED,
  ASSET_DOMAIN_LABELS,
  ASSET_DOMAIN_LOCKED,
  ASSET_DOMAIN_ORDER,
} from "../config/assetDomains";
import type { ProjectLink } from "../types";
import { ProjectList } from "./ProjectList";

interface ProjectSidebarProps {
  collapsed: boolean;
  activeDomain: AssetDomain;
  domainCounts: Record<AssetDomain, number>;
  projects: ProjectLink[];
  selectedId: string | null;
  onToggle: () => void;
  onDomainChange: (domain: AssetDomain) => void;
  onSelect: (id: string) => void;
  onDelete: (project: ProjectLink) => void;
  onNewProject: () => void;
}

export function ProjectSidebar({
  collapsed,
  activeDomain,
  domainCounts,
  projects,
  selectedId,
  onToggle,
  onDomainChange,
  onSelect,
  onDelete,
  onNewProject,
}: ProjectSidebarProps) {
  const canCreate = ASSET_DOMAIN_ENABLED[activeDomain];
  const domainLabel = ASSET_DOMAIN_LABELS[activeDomain];

  if (collapsed) {
    return (
      <aside className="sidebar is-collapsed">
        <button
          type="button"
          className="sidebar-rail-btn"
          onClick={onToggle}
          title="展开项目列表"
        >
          <span className="rail-icon">▶</span>
          <span className="rail-label">{domainLabel}</span>
          {projects.length > 0 && <span className="rail-count">{projects.length}</span>}
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="domain-tabs" role="tablist" aria-label="资产大类">
        {ASSET_DOMAIN_ORDER.map((domain) => {
          const locked = ASSET_DOMAIN_LOCKED[domain];
          const count = domainCounts[domain];
          return (
            <button
              key={domain}
              type="button"
              role="tab"
              aria-selected={activeDomain === domain}
              disabled={locked}
              className={`domain-tab ${activeDomain === domain ? "active" : ""} ${locked ? "is-disabled" : ""}`}
              onClick={() => onDomainChange(domain)}
              title={
                locked
                  ? `${ASSET_DOMAIN_LABELS[domain]}（即将支持）`
                  : ASSET_DOMAIN_LABELS[domain]
              }
            >
              <span className="domain-tab-label">{ASSET_DOMAIN_LABELS[domain]}</span>
              {count > 0 && <span className="domain-tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="sidebar-header">
        <h2>{domainLabel}项目</h2>
        <div className="sidebar-header-actions">
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={onNewProject}
            disabled={!canCreate}
            title={canCreate ? "新建项目" : "该大类尚未开放新建"}
          >
            +
          </button>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggle}
            title="收起项目列表"
          >
            ◀
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="domain-empty">
          {canCreate ? (
            <p>暂无{domainLabel}项目，点击 + 新建。</p>
          ) : (
            <p>暂无{domainLabel}项目。</p>
          )}
        </div>
      ) : (
        <ProjectList
          projects={projects}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      )}
    </aside>
  );
}
