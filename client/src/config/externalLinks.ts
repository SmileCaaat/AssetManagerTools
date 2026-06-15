export type ExternalResourceCategory = "material" | "model" | "animation";

export interface ExternalResourceLink {
  id: string;
  name: string;
  url: string;
  description: string;
  category: ExternalResourceCategory;
}

export const EXTERNAL_RESOURCE_CATEGORY_LABELS: Record<ExternalResourceCategory, string> = {
  material: "材质工具",
  model: "3D 生成",
  animation: "动画资源",
};

/** 免费在线资产与工具站点，在此集中维护，顶部栏一键跳转 */
export const EXTERNAL_RESOURCE_LINKS: ExternalResourceLink[] = [
  {
    id: "texturewiz",
    name: "TextureWiz",
    url: "https://texturewiz.com/",
    description: "在线材质制作与编辑",
    category: "material",
  },
  {
    id: "hunyuan-3d",
    name: "混元 3D",
    url: "https://3d.hunyuan.tencent.com/",
    description: "腾讯混元 AI 3D 模型生成",
    category: "model",
  },
  {
    id: "mixamo",
    name: "Mixamo",
    url: "https://www.mixamo.com/#/",
    description: "角色动画库与自动骨骼绑定",
    category: "animation",
  },
];

export function groupExternalResourceLinks(
  links: ExternalResourceLink[],
): Array<{ category: ExternalResourceCategory; label: string; items: ExternalResourceLink[] }> {
  const order: ExternalResourceCategory[] = ["material", "model", "animation"];
  return order
    .map((category) => ({
      category,
      label: EXTERNAL_RESOURCE_CATEGORY_LABELS[category],
      items: links.filter((link) => link.category === category),
    }))
    .filter((group) => group.items.length > 0);
}
