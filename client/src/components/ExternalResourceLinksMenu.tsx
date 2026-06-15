import { useEffect, useRef, useState } from "react";
import {
  EXTERNAL_RESOURCE_LINKS,
  groupExternalResourceLinks,
} from "../config/externalLinks";

function openExternalLink(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function ExternalResourceLinksMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const groups = groupExternalResourceLinks(EXTERNAL_RESOURCE_LINKS);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={menuRef}>
      <button
        type="button"
        className={`btn-ghost ${open ? "active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="免费在线资产与工具站点"
      >
        在线资源 ▾
      </button>
      {open && (
        <div className="dropdown-menu dropdown-menu-wide external-links-menu">
          <div className="external-links-menu-header">免费在线工具与资产</div>
          {groups.map((group) => (
            <div key={group.category} className="external-links-group">
              <div className="external-links-group-label">{group.label}</div>
              {group.items.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  className="external-link-item"
                  onClick={() => {
                    setOpen(false);
                    openExternalLink(link.url);
                  }}
                >
                  <span className="external-link-name">{link.name}</span>
                  <span className="external-link-desc">{link.description}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
