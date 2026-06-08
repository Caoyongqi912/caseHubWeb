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
import { useMindMapStyles } from './styles';
import ToolBar from './ToolBar';

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
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  planId,
  requirementId,
  projectId,
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

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            console.info('[MindMap] 加载后端脑图 (plan)');
            setMindData(node);
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
              console.info('[MindMap] 加载后端脑图 (requirement)');
              setMindData(node);
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
      mouseSelectionButton: 2,
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

    const mindInstance = new MindElixir(option);
    const initDataToUse = mindData || buildDefaultMind();
    mindInstance.init(initDataToUse);

    mindInstance.bus.addListener('operation', operationHandle);
    mindInstance.bus.addListener('selectNodes', selectNodesHandle);
    mindInstance.bus.addListener('selectNewNode', selectNodeHandle);

    mindRef.current = mindInstance;

    // 自动选中根节点
    try {
      const rootEl = mindInstance.root?.querySelector('me-tpc');
      if (rootEl) {
        mindInstance.selectNode(rootEl as any, true);
      }
    } catch (e) {
      console.warn('[MindMap] 自动选中根节点失败', e);
    }

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

    return () => {
      for (const id of rafIds) cancelAnimationFrame(id);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mindInstance) {
        mindInstance.bus?.removeListener('operation', operationHandle);
        mindInstance.bus?.removeListener('selectNodes', selectNodesHandle);
        mindInstance.bus?.removeListener('selectNewNode', selectNodeHandle);
        mindInstance.destroy();
      }
      mindRef.current = null;
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

    try {
      const value = mindRef.current.getData();
      const basePayload = {
        mind_node: value,
        project_id: projectId,
      };

      if (currentMindId) {
        const { code } = await updateTestCaseMind({
          ...basePayload,
          id: currentMindId,
          plan_id: isPlanMode ? planId : undefined,
        });
        if (code === 0) {
          // 不再 setMindData:后端把 mind_node 原样存为 JSON,
          // 本地 mind 实例已经持有最新数据,重建会吹掉正在编辑的 input。
          message.success('已保存');
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
        }
      }
    } catch (error) {
      console.error('Error saving mind map:', error);
      message.error('保存失败');
    }
  }, [projectId, isPlanMode, planId, requirementId, currentMindId]);

  // saveMap 依赖 currentMindId,首次保存后该值会变;
  // scheduleSave 用空依赖闭包了旧 saveMap,所以走 ref 永远拿最新的。
  const saveMapRef = useRef(saveMap);
  saveMapRef.current = saveMap;

  /** 5. 事件:任意操作都触发防抖保存(不联动任何后端表) */
  const operationHandle = useCallback(
    (info: Operation) => {
      scheduleSave();
      void info;
    },
    [scheduleSave],
  );

  const selectNodesHandle = useCallback((_nodeObjs: NodeObj[]) => {}, []);
  const selectNodeHandle = useCallback(
    (_nodeObj: NodeObj, _e?: MouseEvent) => {},
    [],
  );

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
          <ToolBar mind={mindRef} saveMap={saveMap} />
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
    </div>
  );
};

export default MindMapCanvas;
