import ToolBar from '@/pages/CaseHub/MindMap/ToolBar';
import { generateId } from '@/pages/CaseHub/MindMap/utils';
import nodeMenu from '@mind-elixir/node-menu-neo';
import MindElixir, { Options } from 'mind-elixir';
import type { NodeObj } from 'mind-elixir/dist/types/types';
import { Operation } from 'mind-elixir/dist/types/utils/pubsub';
import { useEffect, useRef, useState } from 'react';

const option: Options = {
  el: '#mind-elixir-container',
  direction: MindElixir.RIGHT,
  draggable: true,
  toolBar: true,
  keypress: true,
  locale: 'zh_CN',
  theme: MindElixir.DARK_THEME,
  mouseSelectionButton: 0,
};
const initData = {
  nodeData: {
    topic: '测试脑图',
    id: generateId(),
    direction: 0,
    expanded: true,
    nodeMenu: true,
    children: [
      {
        topic: '功能模块',
        id: generateId(),
        children: [
          { topic: '用户管理', id: generateId() },
          { topic: '权限控制', id: generateId() },
          { topic: '数据统计', id: generateId() },
        ],
      },
      {
        topic: '技术栈',
        id: generateId(),
        children: [
          { topic: 'React', id: generateId() },
          { topic: 'TypeScript', id: generateId() },
          { topic: 'Mind Elixir', id: generateId() },
        ],
      },
      {
        topic: '开发计划',
        id: generateId(),
        children: [
          { topic: '需求分析', id: generateId() },
          { topic: '设计阶段', id: generateId() },
          { topic: '开发实现', id: generateId() },
          { topic: '测试验收', id: generateId() },
        ],
      },
    ],
  },
};
const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindRef = useRef<any | null>(null);
  const [mindData, setMindData] = useState<any>(initData);

  useEffect(() => {
    setMindData(initData);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const mindInstance = new MindElixir(option);

    const initData = mindData || MindElixir.new('中心主题');
    mindInstance.install(nodeMenu);
    mindInstance.init(initData);

    mindInstance.bus.addListener('operation', operationHandle);
    mindInstance.bus.addListener('selectNodes', selectNodesHandle);
    mindInstance.bus.addListener('selectNode', selectNodeHandle);

    mindRef.current = mindInstance;

    return () => {
      if (mindInstance) {
        mindInstance.bus?.removeListener('operation', operationHandle);
        mindInstance.bus?.removeListener('selectNodes', selectNodesHandle);
        mindInstance.bus?.removeListener('selectNode', selectNodeHandle);
        mindInstance.destroy();
      }
    };
  }, []);

  const operationHandle = (info: Operation) => {
    console.log('operationHandle', info);
  };

  const selectNodesHandle = (nodeObjs: NodeObj[]) => {
    console.log('selectNodesHandle', nodeObjs);
  };

  const selectNodeHandle = (nodeObj: NodeObj, e?: MouseEvent) => {
    console.log('selectNodeHandle', nodeObj, e);
  };

  return (
    <div
      style={{
        height: 'calc(100vh - 64px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <div
        style={{
          flex: '0 0 auto',
          padding: '12px 16px',
          zIndex: 10,
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <ToolBar mind={mindRef} />
      </div>
      <div
        id="mind-elixir-container"
        ref={containerRef}
        style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    </div>
  );
};

export default Index;
