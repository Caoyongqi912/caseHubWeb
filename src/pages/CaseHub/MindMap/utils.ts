/**
 * MindMap 工具函数 + 节点类型扩展
 *
 * 设计 brief: docs/mindmap-redesign-2026-06-17.md
 * 节点结构升级: 加 type (module/case/note) + meta (case 专属结构化字段)
 * JSON 根加 schema_version 字段, 老数据加载时自动迁移到 v1.
 */
import type { NodeObj } from 'mind-elixir/dist/types/docs';

export type NodeType = 'module' | 'case' | 'step' | 'expected' | 'note';

export interface CaseMeta {
  case_id?: number;
  case_level?: 'P0-最高' | 'P1-高' | 'P2-中' | 'P3-低';
  case_type?: '功能测试' | '冒烟' | '回归' | '其他';
  case_tag?: string[];
  case_mark?: string;
  case_setup?: string;
  // 老字段保留兼容, 但 UI 不再编辑
  tags?: string[];
  steps?: string[];
  expected?: string[];
}

/**
 * 扩展后的 MindNode. 保留 mind-elixir 的 NodeObj 全字段,
 * 追加 type + meta. 用 type assertion `node as MindNode` 互转.
 */
export interface MindNode extends NodeObj {
  topic: string;
  id: string;
  children?: MindNode[];
  type?: NodeType;
  meta?: CaseMeta;
}

export const SCHEMA_VERSION = 1;

/** 用例等级 4 档 (按 P0→P3 降级排序) —— 右键菜单升/降一级循环用 */
export const CASE_LEVELS = ['P0-最高', 'P1-高', 'P2-中', 'P3-低'] as const;

/** 用例类型 4 种 —— 右键菜单直接切 */
export const CASE_TYPES = ['功能测试', '冒烟', '回归', '其他'] as const;

/**
 * 把 mind-elixir 的 getData() 输出当成 MindNode 处理.
 * 内部是 { nodeData, arrows, summaries ... }, 我们只关心 nodeData.
 */
export interface MindData {
  nodeData?: MindNode;
  arrows?: any[];
  summaries?: any[];
  // 内部字段
  schema_version?: number;
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  module: '目录',
  case: '用例',
  step: '步骤',
  expected: '预期',
  note: '注释',
};

export const NODE_TYPE_ICONS: Record<NodeType, string> = {
  module: '🗂️',
  case: '🧪',
  step: '👣',
  expected: '✅',
  note: '📝',
};

/**
 * type → 单 emoji 映射. 用于 mind-elixir 原生 icons 字段, 渲染在 topic 文字后.
 * 不污染 topic 字符串, 不靠 CSS ::before 遮挡文字.
 */
export const NODE_TYPE_ICON_MAP: Record<NodeType, string> = {
  module: '🗂️',
  case: '🧪',
  step: '👣',
  expected: '✅',
  note: '📝',
};

/**
 * 老数据迁移: 缺 schema_version 补 1; 节点缺 type 补 'note'.
 * 原地改原对象, 不深拷贝 (避免破坏 mind-elixir 内部引用).
 */
export function migrateToV1(data: any): any {
  if (!data) return data;
  if (typeof data.schema_version !== 'number') {
    data.schema_version = SCHEMA_VERSION;
  }
  if (data.nodeData) {
    migrateNode(data.nodeData);
  }
  return data;
}

function migrateNode(node: any): void {
  if (!node || typeof node !== 'object') return;
  if (!node.type) {
    // mind-elixir 5.x 没有 root 标记, 走 parent 引用识别: 根 = parent 不存在
    // 这里兜底给所有节点默认 'note' (最不侵入); 根节点会在 applyTypeIcons 里被识别并升级为 module
    node.type = 'note';
  }
  if (node.type !== 'case') {
    // module / note 节点不应携带 meta, 清理掉
    if (node.meta) delete node.meta;
  }
  if (Array.isArray(node.children)) {
    for (const c of node.children) migrateNode(c);
  }
}

/**
 * 递归给 nodeData 写 icons 字段, 让 mind-elixir 自己的 be 渲染器能读到.
 * - 根节点 (无 parent) 默认 module
 * - 已有 type 的节点按 type 翻译成单 emoji icons 数组
 * - 没 type 的节点 (脏数据) 不动
 *
 * 通常在 mind.init() / mind.refresh() 之前调用.
 */
export function applyTypeIcons(mind: any): void {
  if (!mind?.nodeData) return;
  // 根节点 (无 parent 引用) 默认 module
  if (!mind.nodeData.type) {
    mind.nodeData.type = 'module';
  }
  const visit = (n: any) => {
    // step / expected 是纯文字节点, 不显示 type icon
    const TYPES_WITH_ICON: NodeType[] = ['module', 'case', 'note'];
    if (
      n.type &&
      TYPES_WITH_ICON.includes(n.type) &&
      NODE_TYPE_ICON_MAP[n.type]
    ) {
      const expected = NODE_TYPE_ICON_MAP[n.type];
      if (!Array.isArray(n.icons) || n.icons[0] !== expected) {
        n.icons = [expected];
      }
    } else if (n.icons && n.icons.length) {
      n.icons = [];
    }
    // case 节点的 case_tag 同步到 mind-elixir 原生 tags 字段, 让 be 渲染器输出 tag chip
    if (n.type === 'case') {
      const metaTags = Array.isArray(n.meta?.case_tag) ? n.meta.case_tag : [];
      const tagsEq =
        Array.isArray(n.tags) &&
        n.tags.length === metaTags.length &&
        n.tags.every((t: any, i: number) => t === metaTags[i]);
      if (!tagsEq) n.tags = [...metaTags];
    } else if (n.tags) {
      // 非 case 节点不应携带 tags
      n.tags = [];
    }
    if (Array.isArray(n.children)) n.children.forEach(visit);
  };
  visit(mind.nodeData);
}

/**
 * 在树里根据 id 找节点 (引用, 方便外部修改).
 */
export function findNodeById(
  root: MindNode | undefined,
  id: string,
): MindNode | undefined {
  if (!root) return undefined;
  if (root.id === id) return root;
  if (Array.isArray(root.children)) {
    for (const c of root.children) {
      const hit = findNodeById(c, id);
      if (hit) return hit;
    }
  }
  return undefined;
}

/**
 * 拿到当前选中节点的 NodeObj 引用 (来自 mind-elixir 内部).
 * 转换: 当前节点的 Topic DOM 元素 .nodeObj 字段, 或者从 instance.currentNode 推.
 */
export function getCurrentNodeObj(mind: any): MindNode | undefined {
  if (!mind) return undefined;
  const cur = mind.currentNode;
  if (!cur) return undefined;
  return cur.nodeObj as MindNode;
}

/**
 * 设置节点 type. 直接改引用 + mind-elixir 内部会响应式更新.
 * 改完应调 mind.reshapeNode() 触发 icons 重新渲染.
 */
export function setNodeType(node: MindNode, type: NodeType): void {
  node.type = type;
  // step / expected 是纯文字节点, 不显示 type icon
  const TYPES_WITH_ICON: NodeType[] = ['module', 'case', 'note'];
  if (TYPES_WITH_ICON.includes(type) && NODE_TYPE_ICON_MAP[type]) {
    node.icons = [NODE_TYPE_ICON_MAP[type]];
  } else {
    node.icons = [];
  }
  if (type !== 'case') {
    // 切走: 清掉 meta + tags
    if (node.meta) delete node.meta;
    if (node.tags) node.tags = [];
  } else {
    // 切到 case: 拉 meta.case_tag 到 tags
    const metaTags = Array.isArray(node.meta?.case_tag)
      ? node.meta.case_tag
      : [];
    node.tags = [...metaTags];
  }
}

/**
 * 根据父节点 type 推断子节点 type. Tab 自动推断链:
 *   根/module/note  → case
 *   case            → step
 *   step            → expected
 *   expected        → null  (禁掉 Tab, 预期是一组 case 的终点)
 *   undefined       → case  (新数据)
 *
 * 返回 null 时, 调用方应禁止添加子节点 (而不是兜底为 note).
 */
export function inferTypeFromParent(
  parentType: NodeType | undefined,
): NodeType | null {
  switch (parentType) {
    case 'module':
    case 'note':
    case undefined:
      return 'case';
    case 'case':
      return 'step';
    case 'step':
      return 'expected';
    case 'expected':
      return null; // 禁掉 Tab
    default:
      return 'case';
  }
}

/**
 * 根据推断出的 type 生成默认 topic 文案.
 * - case          → "测试用例"
 * - step          → "操作{N}"  (N = 父节点下 type=step 的子节点数 + 1)
 * - expected      → "预期{N}"  (N = 父节点下 type=expected 的子节点数 + 1, 拦截后通常 = 1)
 * - module        → "目录"
 * - note          → "注释"
 * - 其他兜底      → "New Node"
 *
 * Tab 快速添加时, 用户立即看到中文占位, 比 New Node 更明确.
 */
export function inferDefaultTopic(
  parentNode: MindNode | undefined,
  newType: NodeType,
): string {
  if (newType === 'case') return '测试用例';
  if (newType === 'step') {
    const count = (parentNode?.children ?? []).filter(
      (c: any) => c?.type === 'step',
    ).length;
    return `操作${count + 1}`;
  }
  if (newType === 'expected') {
    const count = (parentNode?.children ?? []).filter(
      (c: any) => c?.type === 'expected',
    ).length;
    return `预期${count + 1}`;
  }
  if (newType === 'module') return '目录';
  if (newType === 'note') return '注释';
  return 'New Node';
}

/**
 * 全树同步 type 视觉化: 写 data-type 到 me-parent (CSS 选择器) / me-root (根节点).
 * 不做 DOM icons 注入, icons 由 mind-elixir 自己的 be 渲染器负责.
 * 通常在 mind.refresh() 之后调, 或在 addChild/insertSibling 之后 raf 一帧调.
 */
export function syncNodeTypeAttrs(mind: any): void {
  if (!mind?.container) return;
  const tpcEls = mind.container.querySelectorAll('me-tpc');
  tpcEls.forEach((tpc: any) => {
    const nodeObj = tpc.nodeObj;
    if (!nodeObj) return;
    const parent = tpc.parentElement;
    if (!parent) return;
    if (nodeObj.type) {
      parent.setAttribute('data-type', nodeObj.type);
    } else {
      parent.removeAttribute('data-type');
    }
  });
}

/**
 * 导出 JSON 工具 (ToolBar 用).
 */
export const exportAsJson = (
  data: MindNode,
  filename: string = 'mindmap.json',
): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * mind-elixir 5.12.1 拉框多选 hack
 *
 * 背景: mind-elixir 内部两处硬编码 `target.className === "map-container"`:
 *   1) pointerdown 分发器 (u): left button + className==="map-container" 才设 ptState=BoxSelect
 *   2) viselect 的 beforestart: 同样要 className==="map-container" 才允许拉框
 *
 * 实际画布 DOM: .map-container > .map-canvas > [svg + me-parent ...]
 * 用户点击的 target 几乎都是 .map-canvas / .map-svg, className 不等于 "map-container",
 * 两道闸都拒绝, 拉框完全无法触发.
 *
 * 解法: 在 mindInstance.container 上挂 capture 阶段 pointerdown 监听,
 * 命中画布空白区域时, 用 Object.defineProperty 临时把 target.className 伪装成
 * "map-container", 派发链跑完后再还原. mouseSelectionButton 需配 0 (左键).
 *
 * 排除 me-tpc / tags / context-menu / toolbar / input-box, 让这些区域的点击
 * 走原本的 mind-elixir 行为 (选中节点 / 打开菜单 / 工具栏等).
 */
export function installBoxSelectionHack(mindInstance: any): () => void {
  const container: HTMLElement | null = mindInstance?.container;
  if (!container) return () => undefined;
  const HIJACK_ORIG = '__mindOrigClassName';

  const shouldHijack = (target: HTMLElement): boolean => {
    if (target.className === 'map-container') return false;
    if (!(target instanceof Element)) return false;
    if (!target.closest('.map-container')) return false;
    // 这些区域留给 mind-elixir 自己的处理
    if (target.closest('me-tpc')) return false;
    if (
      target.closest(
        '.tags, .context-menu, .mind-elixir-toolbar, #input-box, .icon-menu, .menu-list, .tips, .svg-label, [contenteditable], .selected',
      )
    )
      return false;
    return true;
  };

  const restoreOne = (el: any) => {
    if (!el || el[HIJACK_ORIG] === undefined) return;
    try {
      delete el.className;
      el.className = el[HIJACK_ORIG];
    } catch {
      // ignore
    }
    delete el[HIJACK_ORIG];
  };

  // 拦截 mindInstance.move: 拉框期间 (ptState === 5) panHelper 会调 move 平移画布,
  // 这跟 viselect 拉框冲突, 表现为画布抖动. 拉框期间直接短路 move.
  const origMove = mindInstance.move?.bind(mindInstance);
  mindInstance.move = function (dx: number, dy: number, ...rest: any[]) {
    if (mindInstance.ptState === 5) return;
    return origMove?.(dx, dy, ...rest);
  };

  const onPointerDown = (ev: PointerEvent) => {
    if (ev.button !== 0) return;
    if (ev.pointerType && ev.pointerType !== 'mouse') return;
    const target = ev.target as HTMLElement | null;
    if (!target || !shouldHijack(target)) return;
    const el = target as any;
    if (el[HIJACK_ORIG] !== undefined) return; // 已在劫持中
    el[HIJACK_ORIG] = target.className;
    Object.defineProperty(target, 'className', {
      configurable: true,
      get() {
        return 'map-container';
      },
      set(v: string) {
        el[HIJACK_ORIG] = v;
      },
    });
  };

  const restoreAll = () => {
    const root = container.querySelector('.map-container') || container;
    const all = root.querySelectorAll('*');
    all.forEach((n) => restoreOne(n));
  };

  const onPointerEnd = (ev: PointerEvent) => {
    if (ev.button !== 0) return;
    restoreAll();
  };

  container.addEventListener('pointerdown', onPointerDown, true);
  container.addEventListener('pointerup', onPointerEnd);
  container.addEventListener('pointercancel', onPointerEnd);

  return () => {
    container.removeEventListener('pointerdown', onPointerDown, true);
    container.removeEventListener('pointerup', onPointerEnd);
    container.removeEventListener('pointercancel', onPointerEnd);
    if (origMove) mindInstance.move = origMove;
    restoreAll();
  };
}
