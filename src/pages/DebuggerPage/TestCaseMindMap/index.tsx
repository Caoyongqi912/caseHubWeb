/**
 * TestCaseMindMap 组件
 * 用于测试用例的脑图编辑与管理
 *
 * 功能特点：
 * 1. 支持脑图节点的创建、编辑、删除、复制等操作
 * 2. 实现树形结构的拖拽移动功能，支持平滑拖动和精确定位
 * 3. 提供主题切换功能，支持多种风格的主题方案
 * 4. 响应式设计，适配不同屏幕尺寸
 * 5. 优化的UI界面，提升用户体验
 * 6. 支持双指触摸操作，实现整个树形结构的拖拽功能
 *
 * 使用方法：
 * <TestCaseMindMap
 *   initialData={testCaseData}
 *   onSave={handleSave}
 *   height="80vh"
 * />
 *
 * 参数说明：
 * - initialData: 初始脑图数据
 * - onSave: 保存回调函数
 * - height: 组件高度
 */
import {
  Copy,
  Delete,
  Download,
  Plus,
  Reload,
  Save,
  ZoomIn,
  ZoomOut,
} from '@icon-park/react';
import { Button, FloatButton, Select, Space, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import MindMap from 'simple-mind-map';
import Drag from 'simple-mind-map/src/plugins/Drag.js';
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame.js';
import RichText from 'simple-mind-map/src/plugins/RichText.js';
import Scrollbar from 'simple-mind-map/src/plugins/Scrollbar.js';
import TouchEvent from 'simple-mind-map/src/plugins/TouchEvent.js';

import {
  DEFAULT_TEST_CASE_DATA,
  LAYOUT_OPTIONS,
  MIND_MAP_CONFIG,
  THEME_OPTIONS,
} from './constants';
import { formatTestCaseForExport } from './utils';

const TestCaseMindMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindMapRef = useRef<MindMap | null>(null);

  const [mindMapData, setMindMapData] = useState<any>(DEFAULT_TEST_CASE_DATA);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [currentNodes, setCurrentNodes] = useState<any[]>([]);
  const [selectedNodeUid, setSelectedNodeUid] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('mindMapTheme') || 'autumn';
  });
  const [currentLayout, setCurrentLayout] = useState<string>(() => {
    return localStorage.getItem('mindMapLayout') || 'logicalStructure';
  });
  const [isTwoFingerDragging, setIsTwoFingerDragging] =
    useState<boolean>(false);
  const [lastTouchPos, setLastTouchPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  /**
   * 初始化脑图实例
   *
   * 功能描述：
   * - 销毁已存在的脑图实例（如果有）
   * - 注册Drag插件，支持节点和画布拖拽
   * - 创建新的脑图实例，配置相关参数
   * - 绑定脑图事件监听器
   *
   * 注意事项：
   * - 确保containerRef.current存在
   * - 配置了拖拽相关参数，提升用户拖拽体验
   */
  const initMindMap = () => {
    if (!containerRef.current) return;

    if (mindMapRef.current) {
      mindMapRef.current.destroy();
    }

    MindMap.usePlugin(Drag);
    MindMap.usePlugin(RichText, {});
    MindMap.usePlugin(OuterFrame);
    MindMap.usePlugin(Scrollbar);
    MindMap.usePlugin(TouchEvent);
    mindMapRef.current = new MindMap({
      el: containerRef.current,
      data: mindMapData,
      layout: currentLayout,
      theme: currentTheme,
      drag: {
        enable: true,
        enableDragNode: true,
        enableDragCanvas: true,
        dragNodeSpeed: 0.8,
        dragCanvasSpeed: 1.0,
        minDragDistance: 5,
        autoScroll: true,
        autoScrollSpeed: 5,
        autoScrollTriggerDistance: 50,
      },
      ...MIND_MAP_CONFIG,
    } as any);

    mindMapRef.current.on('node_active', handleNodeActive);
    mindMapRef.current.on('node_click', handleNodeClick);
    mindMapRef.current.on('node_contextmenu', handleNodeContextMenu);
    mindMapRef.current.on('draw_click', handleDrawClick);
  };

  const handleNodeActive = (node: any, activeNodeList: any[]) => {
    setCurrentNode(node);
    setCurrentNodes(activeNodeList);
    if (node) {
      setSelectedNodeUid(node.getData('uid'));
    }
  };

  const handleNodeClick = (node: any, e: any) => {
    if (node) {
      setSelectedNodeUid(node.getData('uid'));
    }
  };

  const handleNodeContextMenu = (e: any, node: any) => {
    e.preventDefault();
    if (node) {
      setSelectedNodeUid(node.getData('uid'));
    }
  };

  const handleDrawClick = () => {
    setSelectedNodeUid('');
    setCurrentNode(null);
  };

  const handleAddChildNode = () => {
    if (!mindMapRef.current || !selectedNodeUid) {
      return;
    }

    const activeNodes = mindMapRef.current.renderer.activeNodeList;
    if (activeNodes && activeNodes.length > 0) {
      mindMapRef.current.renderer.insertChildNode(true, [], {
        text: '新节点',
      });
    }
  };

  const handleAddSiblingNode = () => {
    if (!mindMapRef.current || !selectedNodeUid) {
      return;
    }

    const activeNodes = mindMapRef.current.renderer.activeNodeList;
    if (activeNodes && activeNodes.length > 0) {
      mindMapRef.current.renderer.insertNode();
    }
  };

  const handleDeleteNode = () => {
    if (!mindMapRef.current || !selectedNodeUid) {
      return;
    }

    const activeNodes = mindMapRef.current.renderer.activeNodeList;
    if (activeNodes && activeNodes.length > 0) {
      mindMapRef.current?.renderer.removeNode();
      setSelectedNodeUid('');
      setCurrentNode(null);
    }
  };

  const handleCopyNode = () => {
    if (!mindMapRef.current || !selectedNodeUid) {
      return;
    }

    const activeNodes = mindMapRef.current.renderer.activeNodeList;
    if (activeNodes && activeNodes.length > 0) {
      mindMapRef.current?.renderer.copy();
      mindMapRef.current?.renderer.paste();
    }
  };

  const handleSave = () => {
    const data = mindMapRef.current?.getData(true);
    if (onSave) {
      onSave(data);
    }
  };

  const handleExport = () => {
    const data = mindMapRef.current?.getData(true);
    const formattedText = formatTestCaseForExport(data);
    const blob = new Blob([formattedText], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test-cases.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => {
    mindMapRef.current?.view.enlarge(null, null, false);
  };

  const handleZoomOut = () => {
    mindMapRef.current?.view.narrow(null, null, false);
  };

  const handleResetView = () => {
    mindMapRef.current?.view.reset();
  };

  /**
   * 处理主题变更
   *
   * 功能描述：
   * - 更新当前主题状态
   * - 将主题偏好保存到localStorage，实现跨会话记忆
   *
   * 参数：
   * @param theme - 主题名称
   */
  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('mindMapTheme', theme);
  };

  /**
   * 处理布局变更
   *
   * 功能描述：
   * - 更新当前布局状态
   * - 将布局偏好保存到localStorage，实现跨会话记忆
   *
   * 参数：
   * @param layout - 布局名称
   */
  /**
   * 处理触摸开始事件
   *
   * 功能描述：
   * - 检测是否是双指触摸
   * - 如果是双指触摸，记录初始触摸位置并开始拖拽
   *
   * 参数：
   * @param e - 触摸事件对象
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsTwoFingerDragging(true);
      setLastTouchPos({
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      });
    }
  };

  /**
   * 处理触摸移动事件
   *
   * 功能描述：
   * - 检测是否正在进行双指拖拽
   * - 计算拖拽距离并移动画布
   * - 更新触摸位置，以便下一次计算
   *
   * 参数：
   * @param e - 触摸事件对象
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTwoFingerDragging && e.touches.length === 2 && mindMapRef.current) {
      const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      const deltaX = currentX - lastTouchPos.x;
      const deltaY = currentY - lastTouchPos.y;

      // 移动画布
      mindMapRef.current.view.move(deltaX, deltaY);

      // 更新触摸位置
      setLastTouchPos({ x: currentX, y: currentY });
    }
  };

  /**
   * 处理触摸结束事件
   *
   * 功能描述：
   * - 重置双指拖拽状态
   * - 清空触摸位置记录
   */
  const handleTouchEnd = () => {
    setIsTwoFingerDragging(false);
    setLastTouchPos({ x: 0, y: 0 });
  };

  useEffect(() => {
    initMindMap();
    return () => {
      mindMapRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (mindMapRef.current) {
      mindMapRef.current.setTheme(currentTheme);
      mindMapRef.current.setLayout(currentLayout);
    }
  }, [currentTheme, currentLayout]);

  useEffect(() => {
    if (mindMapRef.current) {
      mindMapRef.current.setData(mindMapData);
    }
  }, [mindMapData]);

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />

      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          gap: '12px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Space size="middle">
          <Select
            defaultValue={currentTheme}
            onChange={handleThemeChange}
            options={THEME_OPTIONS}
            style={{ width: 120, borderRadius: '8px' }}
            size="middle"
          />
          <Select
            defaultValue={currentLayout}
            options={LAYOUT_OPTIONS}
            style={{ width: 140, borderRadius: '8px' }}
            size="middle"
          />
          <Tooltip title="添加子节点">
            <Button
              type="primary"
              icon={<Plus />}
              onClick={handleAddChildNode}
              disabled={!selectedNodeUid}
              style={{
                borderRadius: '8px',
                fontWeight: 500,
              }}
            >
              子节点
            </Button>
          </Tooltip>
          <Tooltip title="同级节点">
            <Button
              icon={<Plus />}
              onClick={handleAddSiblingNode}
              disabled={!selectedNodeUid}
              style={{
                borderRadius: '8px',
                fontWeight: 500,
              }}
            >
              同级
            </Button>
          </Tooltip>

          <Tooltip title="复制节点">
            <Button
              icon={<Copy />}
              onClick={handleCopyNode}
              disabled={!selectedNodeUid}
              style={{
                borderRadius: '8px',
                fontWeight: 500,
              }}
            >
              复制
            </Button>
          </Tooltip>
          <Tooltip title="删除节点">
            <Button
              danger
              icon={<Delete />}
              onClick={handleDeleteNode}
              disabled={!selectedNodeUid}
              style={{
                borderRadius: '8px',
                fontWeight: 500,
              }}
            >
              删除
            </Button>
          </Tooltip>
        </Space>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          display: 'flex',
          gap: '12px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          padding: '12px 16px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Space size="small">
          <Tooltip title="放大">
            <Button
              type="text"
              icon={<ZoomIn />}
              onClick={handleZoomIn}
              style={{
                borderRadius: '6px',
              }}
            />
          </Tooltip>
          <Tooltip title="缩小">
            <Button
              type="text"
              icon={<ZoomOut />}
              onClick={handleZoomOut}
              style={{
                borderRadius: '6px',
              }}
            />
          </Tooltip>
          <Tooltip title="重置视图">
            <Button
              type="text"
              icon={<Reload />}
              onClick={handleResetView}
              style={{
                borderRadius: '6px',
              }}
            />
          </Tooltip>
        </Space>
      </div>

      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{
          right: 32,
          bottom: 32,
        }}
        icon={<Save />}
      >
        <FloatButton
          icon={<Save />}
          tooltip="保存"
          onClick={handleSave}
          style={{
            backgroundColor: '#52c41a',
            boxShadow: '0 8px 24px rgba(82, 196, 26, 0.45)',
            borderRadius: '50%',
            width: 56,
            height: 56,
            fontSize: 18,
          }}
        />
        <FloatButton
          icon={<Download />}
          tooltip="导出"
          onClick={handleExport}
          style={{
            backgroundColor: '#1890ff',
            boxShadow: '0 8px 24px rgba(24, 144, 255, 0.45)',
            borderRadius: '50%',
            width: 56,
            height: 56,
            fontSize: 18,
          }}
        />
      </FloatButton.Group>
    </div>
  );
};

export default TestCaseMindMap;
