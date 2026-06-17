/**
 * MindMap · ToolBar
 *
 * 文牍式排版 + 中文标签 + hairline 分隔
 * - 主操作「保存」用细线方框强调；其它为「下划线 hover」文字操作
 * - 完全跟随 antd token，亮/暗自动反色
 */
import type { MindNode, NodeType } from '@/pages/CaseHub/MindMap/utils';
import {
  exportAsJson,
  getCurrentNodeObj,
  NODE_TYPE_ICONS,
  setNodeType,
} from '@/pages/CaseHub/MindMap/utils';
import { message, Tooltip } from 'antd';
import React, { FC, useCallback, useState } from 'react';
import { useMindMapStyles } from './styles';

interface Props {
  mind: React.MutableRefObject<any>;
  saveMap: () => Promise<void>;
  /** type='case' 节点触发: 父组件打开 MetaDrawer */
  onEditCaseMeta: (node: MindNode) => void;
}

interface OpProps {
  label: string;
  hint?: string;
  onClick: () => void;
  primary?: boolean;
}

/** 文字操作：下划线 hover 出现 */
const Op: FC<OpProps> = ({ label, hint, onClick, primary }) => {
  const styles = useMindMapStyles();
  const [hover, setHover] = useState(false);
  const baseColor = primary ? styles.ink[900] : styles.ink[700];
  const hoverColor = styles.ink[900];
  return (
    <Tooltip title={hint} mouseEnterDelay={0.4}>
      <span
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          cursor: 'pointer',
          color: hover ? hoverColor : baseColor,
          textDecoration: hover ? 'underline' : 'none',
          textUnderlineOffset: 4,
          textDecorationColor: styles.ink[900],
          textDecorationThickness: 1,
          fontSize: 11,
          letterSpacing: '0.12em',
          fontWeight: primary ? 600 : 500,
          padding: primary ? '2px 10px' : '2px 0',
          border: primary
            ? `1px solid ${styles.ink[900]}`
            : '1px solid transparent',
          borderRadius: 2,
          transition: 'color 160ms ease',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </Tooltip>
  );
};

/** 分隔：竖直发丝 */
const Sep: FC = () => {
  const styles = useMindMapStyles();
  return (
    <span
      style={{
        width: 1,
        height: 12,
        background: styles.ink[300],
        display: 'inline-block',
      }}
    />
  );
};

const ToolBar: FC<Props> = ({ mind, saveMap, onEditCaseMeta }) => {
  const styles = useMindMapStyles();

  const ensure = useCallback((): boolean => {
    if (!mind.current) {
      message.warning('脑图未初始化');
      return false;
    }
    return true;
  }, [mind]);

  /**
   * 获取当前选中的节点；没选则尝试回退到根（中心主题），
   * 这样从空白画布启动时，"添加子节点" 也能直接工作。
   */
  const requireNode = useCallback((): any | null => {
    if (!mind.current) return null;
    if (mind.current.currentNode) return mind.current.currentNode;
    const rootEl = mind.current.root?.querySelector('me-tpc');
    if (rootEl) {
      mind.current.selectNode(rootEl, false);
      return mind.current.currentNode ?? rootEl;
    }
    message.warning('请先选择中心主题或任一节点');
    return null;
  }, [mind]);

  const handleAddChild = useCallback(async () => {
    if (!ensure()) return;
    const node = requireNode();
    if (!node) return;
    try {
      mind.current.addChild();
    } catch (e) {
      console.error(e);
      message.error('添加子节点失败');
    }
  }, [ensure, requireNode, mind]);

  const handleAddSibling = useCallback(async () => {
    if (!ensure()) return;
    const node = requireNode();
    if (!node) return;
    if (node.nodeObj?.root) {
      message.warning('中心主题不能添加同级');
      return;
    }
    try {
      await mind.current.insertSibling('after');
    } catch (e) {
      console.error(e);
      message.error('添加同级节点失败');
    }
  }, [ensure, requireNode, mind]);

  const handleDelete = useCallback(async () => {
    if (!ensure()) return;
    const node = requireNode();
    if (!node) return;
    if (node.nodeObj?.root) {
      message.warning('中心主题不能删除');
      return;
    }
    try {
      await mind.current.removeNode();
    } catch (e) {
      console.error(e);
      message.error('删除节点失败');
    }
  }, [ensure, requireNode, mind]);

  /**
   * 标记当前节点为指定 type. 直接改 nodeObj 引用,
   * mind-elixir 内部会响应式刷新卡片样式.
   * 改完触发防抖保存 (用 mind.current.refresh 走 operation bus).
   */
  const handleSetType = useCallback(
    (type: NodeType) => {
      if (!ensure()) return;
      const cur = mind.current?.currentNode;
      if (!cur?.nodeObj) {
        message.warning('请先选中一个节点');
        return;
      }
      const node = cur.nodeObj as MindNode;
      if (node.type === type) return;
      setNodeType(node, type);
      // 触发 mind-elixir 重绘 + operation 事件 → 防抖保存
      try {
        mind.current.refresh();
      } catch (e) {
        console.warn('refresh after setType failed', e);
      }
      message.success(
        `已标记为${NODE_TYPE_ICONS[type]} ${
          type === 'module' ? '目录' : type === 'case' ? '用例' : '注释'
        }`,
      );
      // type='case' 时, 顺手打开 meta 抽屉让用户填字段
      if (type === 'case') {
        onEditCaseMeta(node);
      }
    },
    [ensure, mind, onEditCaseMeta],
  );

  /** 选中 case 节点时, 显式打开 meta 编辑器 */
  const handleEditCaseMeta = useCallback(() => {
    if (!ensure()) return;
    const node = getCurrentNodeObj(mind.current) as MindNode | undefined;
    if (!node) {
      message.warning('请先选中一个节点');
      return;
    }
    if (node.type !== 'case') {
      message.warning('该节点不是用例节点, 请先标记为"用例"');
      return;
    }
    onEditCaseMeta(node);
  }, [ensure, mind, onEditCaseMeta]);

  const handleReset = useCallback(() => {
    if (!mind.current) return;
    mind.current.scale(1);
    mind.current.toCenter();
  }, [mind]);

  const handleExport = useCallback(() => {
    if (!mind.current) return;
    try {
      exportAsJson(mind.current.getData(), 'mindmap.json');
      message.success('导出成功');
    } catch (e) {
      console.error(e);
      message.error('导出失败');
    }
  }, [mind]);

  const handleSave = useCallback(async () => {
    await saveMap();
  }, [saveMap]);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '6px 12px',
        background: styles.paper.card,
        border: `1px solid ${styles.ink[200]}`,
        borderRadius: 4,
        boxShadow: styles.shadows.card,
      }}
    >
      <Op label="添加子节点" hint="添加子节点 (Tab)" onClick={handleAddChild} />
      <Sep />
      <Op
        label="添加同级"
        hint="添加同级节点 (Enter)"
        onClick={handleAddSibling}
      />
      <Sep />
      <Op label="删除节点" hint="删除节点 (Delete)" onClick={handleDelete} />
      <Sep />
      <Op label="重置视图" hint="重置视图" onClick={handleReset} />
      <Op label="导出 JSON" hint="导出 JSON" onClick={handleExport} />
      <Sep />
      <Op
        label="🗂️ 目录"
        hint="把当前节点标记为目录 (手动切换)"
        onClick={() => handleSetType('module')}
      />
      <Op
        label="🧪 用例"
        hint="把当前节点标记为用例 (手动切换)"
        onClick={() => handleSetType('case')}
      />
      <Sep />
      <Op label="保存" hint="保存脑图结构" onClick={handleSave} primary />
    </div>
  );
};

export default ToolBar;
