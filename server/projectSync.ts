import type { MasterWorkspace, ProjectLink } from "./types.js";
import { suggestProjectLinks } from "./scanner.js";

export async function autoLinkWorkspaceProjects(workspace: MasterWorkspace): Promise<{
  projects: ProjectLink[];
  added: ProjectLink[];
}> {
  const suggestions = await suggestProjectLinks(workspace);
  if (suggestions.length === 0) {
    return { projects: workspace.projects, added: [] };
  }

  const linkedConcept = new Set(workspace.projects.map((p) => p.conceptPath));
  const linkedBlender = new Set(workspace.projects.map((p) => p.blenderPath));
  const existingIds = new Set(workspace.projects.map((p) => p.id));

  const added: ProjectLink[] = [];
  const projects = [...workspace.projects];

  for (const link of suggestions) {
    if (linkedConcept.has(link.conceptPath) || linkedBlender.has(link.blenderPath)) continue;
    if (existingIds.has(link.id)) continue;
    projects.push(link);
    added.push(link);
    linkedConcept.add(link.conceptPath);
    linkedBlender.add(link.blenderPath);
    existingIds.add(link.id);
  }

  return { projects, added };
}
