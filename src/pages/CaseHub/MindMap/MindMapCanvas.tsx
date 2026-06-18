/**
 * MindMapCanvas —— 自由脑图画布
 *
 * 设计原则:完全脱离 IPlanModule 树,是一个按 plan_id 持久化的独立 JSON 笔记
 * - 根节点固定为"中心主题",用户可点击改名
 * - 增 / 改 / 删 / 拖动 全部自由,不需要映射任何后端表
 * - 数据存进 test_case_mind.mind_node(结构:{ nodeData: { id, topic, children: [...] } })
 *
 * 视觉方向:Atlas Manuscript
 * - 节点=索引卡,发丝边
 * - 黑底白字中心主题 + 米黄纸 + 网格底
 * - 全部色值由 antd theme token 派生
 *
 * 布局约定(很关键,避免被父级 flex 链影响):
 *   - 自身直接撑满父级(position: absolute; inset: 0)
 *   - 父级必须 position: relative 且有明确高度
 *   - mind-elixir 内部 100% 高度链:el → .map-container → .map-canvas
 */
import {
  getTestCaseMind,
  insertTestCaseMind,
  updateTestCaseMind,
} from '@/api/case/testCase';
import { message } from 'antd';
import MindElixir, { Options } from 'mind-elixir';
import type { NodeObj } from 'mind-elixir/dist/types/types';
import { Operation } from 'mind-elixir/dist/types/utils/pubsub';
import 'mind-elixir/style.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import MetaDrawer from './MetaDrawer';
import { useMindMapStyles } from './styles';
import ToolBar from './ToolBar';
import {
  applyTypeIcons,
  CASE_LEVELS,
  getCurrentNodeObj,
  inferDefaultTopic,
  inferTypeFromParent,
  installBoxSelectionHack,
  migrateToV1,
  NODE_TYPE_ICON_MAP,
  setNodeType,
  syncNodeTypeAttrs,
  type CaseMeta,
  type MindNode,
} from './utils';

const SAVE_DEBOUNCE_MS = 1500;

/**
 * 默认脑图:使用 mind-elixir 自带 `new(topic)` 工厂方法,
 * 拿到的是正确的 { nodeData: { id, topic, children: [] } } 结构。
 */
const buildDefaultMind = (topic = '中心主题') => MindElixir.new(topic);

export interface MindMapCanvasProps {
  /** 计划脑图模式:传 plan_id 即按计划维度 */
  planId?: number;
  /** 需求脑图模式:仅传 requirement_id 时按需求维度(兼容老入口) */
  requirementId?: string;
  /** 项目 ID(必填) */
  projectId: number;
  /**
   * 保存状态变化回调. 父组件 (如 PlanMindMap) 可在右上角展示 loading.
   * @param saving 正在保存
   * @param lastSavedAt 成功保存后的时间戳 (ms), 失败 / 静默时为 undefined
   */
  onSavingChange?: (saving: boolean, lastSavedAt?: number) => void;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  planId,
  requirementId,
  projectId,
  onSavingChange,
}) => {
  const styles = useMindMapStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  const mindRef = useRef<any | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  // 用 lazy 初始 state,挂载时立即有一个"中心主题"可用,
  // 这样首屏一定能看到根节点,不再"什么都没有"。
  const [mindData, setMindData] = useState<any>(() => buildDefaultMind());
  const [currentMindId, setCurrentMindId] = useState<number>();
  const [metaDrawerOpen, setMetaDrawerOpen] = useState(false);
  const [metaDrawerNode, setMetaDrawerNode] = useState<MindNode | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * context menu 状态刷新函数. 在 useEffect 内 init 时注册, 给 selectNodesHandle 调用.
   * 用于: 选中变化时根据节点 type 隐藏 case-only 菜单项.
   */
  const updateContextMenuRef = useRef<((m: any) => void) | null>(null);

  const isPlanMode = !!planId;

  /** 注入样式(注入一次,主题变化时更新内容) */
  useEffect(() => {
    if (styleTagRef.current) return;
    const tag = document.createElement('style');
    tag.setAttribute('data-mindmap-style', 'true');
    tag.textContent = styles.containerCss;
    document.head.appendChild(tag);
    styleTagRef.current = tag;
    return () => {
      tag.remove();
      styleTagRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 1. 拉取后端脑图:拿到则替换 mindData;没拿到就保留默认"中心主题" */
  useEffect(() => {
    if (isPlanMode && planId) {
      getTestCaseMind({ plan_id: planId }).then(({ code, data }) => {
        if (code === 0 && data?.mind_node) {
          const node = data.mind_node;
          if (node?.nodeData && Array.isArray(node.nodeData.children)) {
            console.info('[MindMap] 加载后端脑图 (plan)', {
              schema_version: node.schema_version,
            });
            // 老数据自动迁移到 v1: 补 schema_version, 节点缺 type 补 'note'
            const migrated = migrateToV1(node);
            setMindData(migrated);
            setCurrentMindId(data.id);
          } else {
            console.warn('[MindMap] 检测到过时结构,使用默认"中心主题"');
            setMindData(buildDefaultMind());
            setCurrentMindId(data.id);
          }
        } else {
          console.info('[MindMap] 后端无数据,使用默认"中心主题"');
          setMindData(buildDefaultMind());
        }
      });
    } else if (requirementId) {
      getTestCaseMind({ requirement_id: requirementId }).then(
        ({ code, data }) => {
          if (code === 0 && data?.mind_node) {
            const node = data.mind_node;
            if (node?.nodeData && Array.isArray(node.nodeData.children)) {
              console.info('[MindMap] 加载后端脑图 (requirement)', {
                schema_version: node.schema_version,
              });
              const migrated = migrateToV1(node);
              setMindData(migrated);
              setCurrentMindId(data.id);
            } else {
              setMindData(buildDefaultMind());
              setCurrentMindId(data.id);
            }
          }
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, requirementId]);

  /** 2. 初始化 mind-elixir 实例(mindData 变化时重新初始化) */
  useEffect(() => {
    if (!containerRef.current || !mindData) return;
    console.info('[MindMap] 初始化 mind-elixir 实例', {
      isDark: styles.isDark,
      hasContainer: !!containerRef.current,
      containerSize: {
        w: containerRef.current.offsetWidth,
        h: containerRef.current.offsetHeight,
      },
    });

    // 使用 antd 派生的主题(cssVar + 调色板)
    // 内置 toolBar 关闭:我们自己有一套底部工具条
    // 内置 contextMenu 用 zh_CN 词条,避免英文
    const option: Options = {
      el: '#mind-elixir-container',
      direction: MindElixir.RIGHT,
      toolBar: false,
      keypress: true,
      editable: true,
      compact: true,
      overflowHidden: false,
      // mind-elixir 5.12.1 内部分发器只在 button=0 时设 ptState=BoxSelect,
      // viselect 的 triggers 与此对齐才能让拉框触发. 详见 installBoxSelectionHack.
      mouseSelectionButton: 0,
      // 自定义 contextMenu: 在 mind-elixir 默认菜单 (Add child / Remove / Move / Focus / Summary / Link) 末尾
      // 追加 6 项快速操作: 3 个 type 切换 + 2 个等级升降 + 1 个打开 meta 抽屉.
      // mind-elixir 创建 li 时 li.id = extend 项 name, 文本也用 name; 我们后面用 fixContextMenuLabels 改
      contextMenu: {
        focus: true,
        link: true,
        extend: [
          {
            name: 'cm-mark-case',
            key: '1',
            onclick: () => handleContextSetType('case'),
          },
          {
            name: 'cm-mark-module',
            key: '2',
            onclick: () => handleContextSetType('module'),
          },
          {
            name: 'cm-mark-note',
            key: '3',
            onclick: () => handleContextSetType('note'),
          },
          {
            name: 'cm-bump-up',
            key: ']',
            onclick: () => handleContextBumpLevel(+1),
          },
          {
            name: 'cm-bump-down',
            key: '[',
            onclick: () => handleContextBumpLevel(-1),
          },
          {
            name: 'cm-edit-meta',
            key: 'E',
            onclick: () => handleContextOpenMeta(),
          },
        ],
      },
      theme: {
        name: 'antd-mindmap',
        type: styles.isDark ? 'dark' : 'light',
        palette: [
          styles.ink[800],
          styles.ink[600],
          styles.ink[500],
          styles.ink[400],
        ],
        cssVar: styles.mindCssVar as any,
      },
    };

    // ============= 右键菜单扩展 (3 个 type 切换 + 2 个等级 + 打开 meta) =============
    // 直接在 init 之前定义, onclick 闭包即可捕获 option.
    const setTypeAndReshape = (type: any) => {
      const cur = mindInstance.currentNode;
      if (!cur?.nodeObj) return;
      const node = cur.nodeObj as MindNode;
      if (node.type === type) {
        message.info(
          `已是${
            type === 'module' ? '目录' : type === 'case' ? '用例' : '注释'
          }`,
        );
        return;
      }
      setNodeType(node, type);
      try {
        mindInstance.reshapeNode(cur, { type, icons: node.icons } as any);
      } catch (e) {
        console.warn('[MindMap] reshapeNode after setType failed', e);
      }
      syncNodeTypeAttrs(mindInstance);
    };
    const handleContextSetType = (type: any) => {
      const cur = mindInstance.currentNode;
      if (!cur) {
        message.warning('请先选中一个节点');
        return;
      }
      setTypeAndReshape(type);
      message.success(
        `已标记为${
          NODE_TYPE_ICON_MAP[type as keyof typeof NODE_TYPE_ICON_MAP]
        } ${type === 'module' ? '目录' : type === 'case' ? '用例' : '注释'}`,
      );
    };
    const handleContextBumpLevel = (delta: number) => {
      const cur = mindInstance.currentNode;
      const node = cur?.nodeObj as MindNode | undefined;
      if (!node) {
        message.warning('请先选中一个节点');
        return;
      }
      if (node.type !== 'case') {
        message.warning('只有用例节点可以改等级, 请先标记为用例');
        return;
      }
      const curLevel = node.meta?.case_level;
      const idx = curLevel
        ? (CASE_LEVELS as readonly string[]).indexOf(curLevel)
        : -1;
      // 没等级时 delta=+1 走 P0, delta=-1 走 P3
      const next =
        CASE_LEVELS[
          ((idx < 0 ? -1 : idx) + delta + CASE_LEVELS.length * 2) %
            CASE_LEVELS.length
        ];
      node.meta = {
        ...(node.meta ?? {}),
        case_level: next as CaseMeta['case_level'],
      };
      try {
        mindInstance.reshapeNode(cur!, { meta: node.meta } as any);
      } catch (e) {
        console.warn('[MindMap] reshapeNode after bump level failed', e);
      }
      message.success(`等级已设为 ${next}`);
    };
    const handleContextOpenMeta = () => {
      const node = getCurrentNodeObj(mindInstance) as MindNode | undefined;
      if (!node) {
        message.warning('请先选中一个节点');
        return;
      }
      if (node.type !== 'case') {
        message.warning('只有用例节点可以编辑元数据, 请先标记为用例');
        return;
      }
      handleOpenMetaDrawer(node);
    };

    const mindInstance = new MindElixir(option);
    const initDataToUse = mindData || buildDefaultMind();
    mindInstance.init(initDataToUse);

    // ============= fix context menu: 改 li 显示文本 + 给非 case 节点隐藏 case-only 项 =============
    // mind-elixir 把 extend 项的 name 同时用作 id 和显示文本 (li.innerHTML = <span>name</span>)
    // 我们这里手动把显示文本改成中文, 并设置稳定的 id (cm-xxx) 方便后续按 id 操作.
    const EXTEND_LABELS: Array<{
      id: string;
      label: string;
      caseOnly: boolean;
    }> = [
      { id: 'cm-mark-case', label: '🧪 标记为用例', caseOnly: false },
      { id: 'cm-mark-module', label: '🗂️ 标记为目录', caseOnly: false },
      { id: 'cm-mark-note', label: '📝 标记为注释', caseOnly: false },
      { id: 'cm-bump-up', label: '↑ 等级 +1', caseOnly: true },
      { id: 'cm-bump-down', label: '↓ 等级 -1', caseOnly: true },
      { id: 'cm-edit-meta', label: '✏️ 编辑元数据', caseOnly: true },
    ];
    /**
     * 隐藏的默认菜单 id 列表. mind-elixir 5.x 的 In() 函数给默认 li 设固定 id:
     *   cm-add_child, cm-add_parent, cm-add_sibling, cm-remove_child,
     *   cm-fucus (typo), cm-unfucus (typo), cm-up, cm-down, cm-summary,
     *   cm-link, cm-link-bidirectional
     * Tab/Enter/Delete/上下移动 跟我们的 Tab 自动推断重复了, 隐藏以免用户困惑.
     * 保留: 专注 node / 取消专注 / summary / link / 双向 link.
     */
    const HIDE_DEFAULT_LI_IDS = new Set([
      'cm-add_child',
      'cm-add_parent',
      'cm-add_sibling',
      'cm-remove_child',
      'cm-up',
      'cm-down',
    ]);
    const fixContextMenuLabels = (mind: any) => {
      const ul = mind?.container?.querySelector('.context-menu .menu-list');
      if (!ul) return;
      const allLi = Array.from(ul.querySelectorAll('li')) as HTMLElement[];
      // 1) 隐藏不需要的默认项
      allLi.forEach((li) => {
        if (HIDE_DEFAULT_LI_IDS.has(li.id)) {
          li.style.display = 'none';
        }
      });
      // 2) extend 项在 ul 末尾, 顺序与 EXTEND_LABELS 一一对应; 改 id + 中文 label
      const startIdx = allLi.length - EXTEND_LABELS.length;
      EXTEND_LABELS.forEach((ex, i) => {
        const li = allLi[startIdx + i];
        if (!li) return;
        li.id = ex.id;
        const textSpan = li.querySelector('span:first-child');
        if (textSpan) textSpan.textContent = ex.label;
      });
    };
    const updateContextMenuState = (mind: any) => {
      const ul = mind?.container?.querySelector('.context-menu .menu-list');
      if (!ul) return;
      const nodeType = mind.currentNode?.nodeObj?.type;
      const allLi = Array.from(ul.querySelectorAll('li')) as HTMLElement[];
      const startIdx = allLi.length - EXTEND_LABELS.length;
      EXTEND_LABELS.forEach((ex, i) => {
        const li = allLi[startIdx + i];
        if (!li) return;
        li.style.display = ex.caseOnly && nodeType !== 'case' ? 'none' : '';
      });
    };
    // 注册到 ref, 让 selectNodesHandle 选中时刷新
    updateContextMenuRef.current = updateContextMenuState;
    fixContextMenuLabels(mindInstance);
    updateContextMenuState(mindInstance);

    mindInstance.bus.addListener('operation', operationHandle);
    mindInstance.bus.addListener('selectNodes', selectNodesHandle);
    mindInstance.bus.addListener('selectNewNode', selectNodeHandle);

    // ============= 关键:首次渲染补 type 视觉化 =============
    // mind-elixir.init() 同步跑 be 渲染 me-tpc, 但 nodeObj.icons 还没设,
    // 所以首次加载时所有节点都没有 type icon / data-type, 看着像默认 note.
    // 修复: 1) 给所有 nodeObj 写 icons; 2) refresh() 重画 (layout → be 读 icons);
    //       3) raf 后 syncNodeTypeAttrs 写 data-type 给 me-parent.
    applyTypeIcons(mindInstance);
    mindInstance.refresh();

    // ============= 包装 addChild: Tab 添加子节点 =============
    // 拦截规则:
    //   1. expected 节点下禁 addChild (预期是一组 case 的终点)
    //   2. step 节点下已有 expected 时禁 addChild (一个步骤只能配一个预期)
    // 预生成带 type + icons 的 obj, 让 mind-elixir 自己的 be 渲染 icons
    const origAddChild = mindInstance.addChild.bind(mindInstance);
    mindInstance.addChild = function (parentEl?: any, obj?: any) {
      const parentNode = parentEl?.nodeObj ?? mindInstance.currentNode?.nodeObj;
      const parentType = (parentNode as MindNode | undefined)?.type;
      if (parentType === 'expected') {
        console.info('[MindMap] expected 节点下不允许添加子节点');
        return undefined as any;
      }
      if (parentType === 'step') {
        const hasExpected = parentNode?.children?.some(
          (c: any) => c?.type === 'expected',
        );
        if (hasExpected) {
          console.info('[MindMap] step 节点下已有 expected, 不能再加');
          return undefined as any;
        }
      }
      // 预生成带 type + icons + 默认 topic 的新节点
      // 默认 topic 跟 type 走 (测试用例 / 操作{N} / 预期{N}), 比 New Node 更明确
      let newObj = obj;
      if (!newObj) {
        newObj = mindInstance.generateNewObj();
        const newType = inferTypeFromParent(parentType) ?? 'note';
        newObj.type = newType;
        // step / expected 是纯文字节点, 不写 icons
        if (newType === 'step' || newType === 'expected') {
          newObj.icons = [];
        } else {
          newObj.icons = [
            NODE_TYPE_ICON_MAP[newType as keyof typeof NODE_TYPE_ICON_MAP],
          ];
        }
        newObj.topic = inferDefaultTopic(parentNode, newType);
      }
      const result = origAddChild(parentEl, newObj);
      // be 已经在 origAddChild 内部同步跑完, DOM 节点已存在, 直接同步设 data-type
      syncNodeTypeAttrs(mindInstance);
      return result;
    };

    // ============= 包装 insertSibling: Enter 添加同级 =============
    // 跟选中节点同 type. 原版 insertSibling 不接受 newObj 参数,
    // 只能在调用前算序号 + 调用后改 nodeObj.type/icons/topic + reshapeNode 重渲染.
    const origInsertSibling = mindInstance.insertSibling.bind(mindInstance);
    mindInstance.insertSibling = function (
      direction: 'before' | 'after' = 'after',
    ) {
      const cur = mindInstance.currentNode;
      const siblingType = (cur?.nodeObj as MindNode | undefined)?.type;
      const parentNode = cur?.nodeObj?.parent as MindNode | undefined;
      // 在 origInsertSibling 之前算默认 topic, 此时 parentNode.children 不含新节点
      // 序号 = 父节点下同 type 兄弟数 + 1
      const newType = siblingType ?? 'case';
      const defaultTopic = inferDefaultTopic(parentNode, newType);
      const result = origInsertSibling(direction);
      const newNode = mindInstance.currentNode?.nodeObj as MindNode | undefined;
      if (newNode) {
        newNode.type = newType;
        // step / expected 是纯文字节点, 不写 icons
        if (newType === 'step' || newType === 'expected') {
          newNode.icons = [];
        } else {
          newNode.icons = [
            NODE_TYPE_ICON_MAP[newType as keyof typeof NODE_TYPE_ICON_MAP],
          ];
        }
        newNode.topic = defaultTopic;
        // 触发 be 重渲染 (reshapeNode 内部 Object.assign + be)
        try {
          mindInstance.reshapeNode(mindInstance.currentNode!, {
            icons: newNode.icons,
            topic: defaultTopic,
          });
        } catch (e) {
          console.warn('[MindMap] reshapeNode after insertSibling failed', e);
        }
      }
      syncNodeTypeAttrs(mindInstance);
      return result;
    };

    // ============= 包装 refresh: 同步 data-type 到 me-parent =============
    // ToolBar setNodeType / changeTheme / 外部重画 都会调, 兜底同步视觉.
    const origRefresh = mindInstance.refresh.bind(mindInstance);
    mindInstance.refresh = function (data?: any) {
      const r = origRefresh(data);
      requestAnimationFrame(() => syncNodeTypeAttrs(mindInstance));
      return r;
    };

    mindRef.current = mindInstance;

    // raf 后做最后的视觉同步 + 自动选中根节点
    // (refresh 内部已经调过 layout → be 渲染 icons, 这里只补 data-type)
    requestAnimationFrame(() => {
      syncNodeTypeAttrs(mindInstance);
      try {
        const rootEl = mindInstance.root?.querySelector('me-tpc');
        if (rootEl) {
          mindInstance.selectNode(rootEl as any, true);
        }
      } catch (e) {
        console.warn('[MindMap] 自动选中根节点失败', e);
      }
    });

    // 高度链兜底:mind-elixir 的 toCenter() 依赖容器尺寸,
    // 父级 flex 链可能在 mount 时尚未 settle,所以多重 raf + timeout 兜底
    const recenter = () => {
      try {
        mindInstance.toCenter();
      } catch (e) {
        // ignore
      }
    };
    const rafIds: number[] = [];
    rafIds.push(requestAnimationFrame(recenter));
    rafIds.push(requestAnimationFrame(() => requestAnimationFrame(recenter)));
    setTimeout(recenter, 80);
    setTimeout(recenter, 240);

    if (containerRef.current && 'ResizeObserver' in window) {
      const ro = new ResizeObserver(() => recenter());
      ro.observe(containerRef.current);
      resizeObserverRef.current = ro;
    }

    // ============= 拉框多选 hack =============
    // mind-elixir 5.12.1 在 pointerdown 分发器与 viselect beforestart 各有一道
    // `target.className === "map-container"` 闸, 实际画布的 target 几乎都是
    // .map-canvas / .map-svg, 闸门拒绝, 拉框不工作. installBoxSelectionHack
    // 在 container 上挂 capture 阶段 pointerdown 监听, 把 target 的 className
    // 临时伪装成 "map-container" 让两道闸都过, 派发链跑完再还原.
    const disposeBoxSelection = installBoxSelectionHack(mindInstance);

    return () => {
      disposeBoxSelection();
      for (const id of rafIds) cancelAnimationFrame(id);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mindInstance) {
        mindInstance.bus?.removeListener('operation', operationHandle);
        mindInstance.bus?.removeListener('selectNodes', selectNodesHandle);
        mindInstance.bus?.removeListener('selectNewNode', selectNodeHandle);
        // 还原包装的方法, 避免下次 init 时叠 wrapper
        mindInstance.addChild = origAddChild;
        mindInstance.insertSibling = origInsertSibling;
        mindInstance.refresh = origRefresh;
        mindInstance.destroy();
      }
      mindRef.current = null;
      updateContextMenuRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mindData]);

  /** 3. 主题变化时 → 调 changeTheme 热更新(不重建实例) */
  useEffect(() => {
    if (!mindRef.current) return;
    try {
      mindRef.current.changeTheme(
        {
          name: 'antd-mindmap',
          type: styles.isDark ? 'dark' : 'light',
          palette: [
            styles.ink[800],
            styles.ink[600],
            styles.ink[500],
            styles.ink[400],
          ],
          cssVar: styles.mindCssVar as any,
        },
        true,
      );
    } catch (e) {
      console.error('changeTheme error:', e);
    }
  }, [styles.isDark, styles.ink, styles.mindCssVar]);

  /** 4. 同步 containerCss 到 style 标签 */
  useEffect(() => {
    if (styleTagRef.current) {
      styleTagRef.current.textContent = styles.containerCss;
    }
  }, [styles.containerCss]);

  /** 防抖保存 */
  const scheduleSave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveMapRef.current();
    }, SAVE_DEBOUNCE_MS);
  }, []);

  /**
   * 通知父组件 saving 状态变化. 用 ref + callback 避免 MindMapCanvas 自身重渲染.
   * 父组件 (PlanMindMap) 拿到 saving 后在右上角展示 Spin.
   */
  const fireSavingChange = useCallback(
    (saving: boolean, lastSavedAt?: number) => {
      try {
        onSavingChange?.(saving, lastSavedAt);
      } catch (e) {
        console.warn('[MindMap] onSavingChange handler error', e);
      }
    },
    [onSavingChange],
  );

  /** 立即保存 */
  const saveMap = useCallback(async () => {
    if (!mindRef.current) {
      message.warning('脑图未初始化');
      return;
    }
    if (!projectId) {
      message.error('缺少项目信息');
      return;
    }
    if (!isPlanMode && !requirementId) {
      message.error('缺少计划或需求信息');
      return;
    }
    // 关键:用户正在编辑节点时(input-box 存在),nodeObj.topic 还没提交,
    // 此时 getData() 会拿到默认的 "New Node"。
    // 跳过本次保存,等 finishEdit 事件触发下一次防抖保存。
    if (document.getElementById('input-box')) {
      return;
    }

    fireSavingChange(true);
    try {
      const value = mindRef.current.getData();
      // 强制带 schema_version=1, 老数据加载时虽然已经迁过, 但保险起见再写一次
      if (value && typeof value === 'object') {
        value.schema_version = 1;
      }
      const basePayload = {
        mind_node: value,
        project_id: projectId,
      };
      const savedAt = Date.now();

      if (currentMindId) {
        const { code } = await updateTestCaseMind({
          ...basePayload,
          id: currentMindId,
          plan_id: isPlanMode ? planId : undefined,
        });
        if (code === 0) {
          // 不再 setMindData:后端把 mind_node 原样存为 JSON,
          // 本地 mind 实例已经持有最新数据,重建会吹掉正在编辑的 input。
          fireSavingChange(false, savedAt);
        } else {
          fireSavingChange(false);
        }
      } else {
        const payload = isPlanMode
          ? { ...basePayload, plan_id: planId }
          : { ...basePayload, requirement_id: requirementId };
        const { code, data } = await insertTestCaseMind(payload);
        if (code === 0) {
          // 首次插入:只需记录 id,mind 实例本身不需要重建。
          setCurrentMindId(data.id);
          message.success('已保存');
          fireSavingChange(false, savedAt);
        } else {
          fireSavingChange(false);
        }
      }
    } catch (error) {
      console.error('Error saving mind map:', error);
      message.error('保存失败');
      fireSavingChange(false);
    }
  }, [
    projectId,
    isPlanMode,
    planId,
    requirementId,
    currentMindId,
    fireSavingChange,
  ]);

  // saveMap 依赖 currentMindId,首次保存后该值会变;
  // scheduleSave 用空依赖闭包了旧 saveMap,所以走 ref 永远拿最新的。
  const saveMapRef = useRef(saveMap);
  saveMapRef.current = saveMap;

  /** 5. 事件:任意操作都触发防抖保存(不联动任何后端表) */
  const operationHandle = useCallback(
    (info: Operation) => {
      scheduleSave();
      // 复制节点后清空 case_id (复制粘贴会产生重复 case_id 冲突, 重新打通用例时再补)
      const obj = (info as any).obj;
      if (info.name === 'copyNode' && obj?.meta?.case_id) {
        delete obj.meta.case_id;
      }
      if (info.name === 'copyNodes' && Array.isArray(info.objs)) {
        (info.objs as any[]).forEach((o) => {
          if (o?.meta?.case_id) delete o.meta.case_id;
        });
      }
    },
    [scheduleSave],
  );

  const selectNodesHandle = useCallback((_nodeObjs: NodeObj[]) => {
    // 选中变化时刷新 context menu 状态 (隐藏 case-only 项)
    if (mindRef.current && updateContextMenuRef.current) {
      try {
        updateContextMenuRef.current(mindRef.current);
      } catch (e) {
        // ignore
      }
    }
  }, []);
  const selectNodeHandle = useCallback(
    (_nodeObj: NodeObj, _e?: MouseEvent) => {},
    [],
  );

  /** 打开 meta 编辑器: 工具栏 / 双击 case 节点时调用 */
  const handleOpenMetaDrawer = useCallback((node: MindNode) => {
    setMetaDrawerNode(node);
    setMetaDrawerOpen(true);
  }, []);

  /** meta 保存: 写回节点引用 + 同步 case_tag 到 mind-elixir 原生 tags, 触发重绘, 关闭抽屉 */
  const handleSaveMeta = useCallback(
    (meta: MindNode['meta']) => {
      if (!metaDrawerNode) return;
      metaDrawerNode.meta = meta;
      // 同步 case_tag → nodeObj.tags, 让 be 渲染器在脑图上输出 tag chip
      const newTags = Array.isArray(meta?.case_tag) ? [...meta.case_tag] : [];
      metaDrawerNode.tags = newTags;
      try {
        if (mindRef.current) {
          const tpcEl = mindRef.current.findEle(metaDrawerNode.id);
          if (tpcEl) {
            mindRef.current.reshapeNode(tpcEl, {
              meta: metaDrawerNode.meta,
              tags: newTags,
            });
          }
        }
      } catch (e) {
        console.warn('reshapeNode after meta save failed', e);
      }
      setMetaDrawerOpen(false);
    },
    [metaDrawerNode],
  );

  // 双击 = mind-elixir 默认行为: 进入 topic 内联编辑.
  // 元数据 (等级/类型) 通过工具栏 '编辑等级' 按钮 → MetaDrawer 改.
  // 这里不再拦截 dblclick.

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 480,
        overflow: 'hidden',
        borderRadius: 8,
        border: `1px solid ${styles.ink[200]}`,
        boxShadow: styles.shadows.card,
        background: styles.paper.canvas,
      }}
    >
      {/* 画布本体 —— mind-elixir 注入到这里,直接 absolute 填满父级 */}
      <div
        ref={containerRef}
        id="mind-elixir-container"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* 底部条带:左 = 工具条,右 = 手势提示 */}
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <ToolBar
            mind={mindRef}
            saveMap={saveMap}
            onEditCaseMeta={handleOpenMetaDrawer}
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: styles.ink[500],
            fontFamily: 'inherit',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <span>空格 + 拖动 · 平移</span>
          <span style={{ width: 1, height: 10, background: styles.ink[300] }} />
          <span>滚轮 · 缩放</span>
        </div>
      </div>

      <MetaDrawer
        open={metaDrawerOpen}
        node={metaDrawerNode}
        onClose={() => setMetaDrawerOpen(false)}
        onSave={handleSaveMeta}
      />
    </div>
  );
};

export default MindMapCanvas;
