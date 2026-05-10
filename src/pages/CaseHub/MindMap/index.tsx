import {
  getTestCaseMind,
  insertTestCaseMind,
  updateTestCaseMind,
} from '@/api/case/testCase';
import ToolBar from '@/pages/CaseHub/MindMap/ToolBar';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { useParams } from '@@/exports';
import { ProCard } from '@ant-design/pro-components';
import { message } from 'antd';
import MindElixir, { Options } from 'mind-elixir';
import type { NodeObj } from 'mind-elixir/dist/types/types';
import { Operation } from 'mind-elixir/dist/types/utils/pubsub';
import 'mind-elixir/style.css';
import { useEffect, useMemo, useRef, useState } from 'react';

const Index = () => {
  const { reqId, projectId, moduleId } = useParams<{
    reqId: string;
    projectId: string;
    moduleId: string;
  }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const mindRef = useRef<any | null>(null);
  const [mindData, setMindData] = useState<any>();
  const [currentMindId, setCurrentMindId] = useState<number>();
  const { token, colors, spacing, borderRadius } = useCaseHubTheme();

  useEffect(() => {
    if (!reqId) return;
    getTestCaseMind({ requirement_id: reqId }).then(async ({ code, data }) => {
      if (code === 0 && data?.mind_node) {
        setMindData(data.mind_node);
        setCurrentMindId(data.id);
      }
    });
  }, [reqId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const option: Options = {
      el: '#mind-elixir-container',
      direction: MindElixir.RIGHT,
      draggable: true,
      toolBar: true,
      keypress: true,
      locale: 'zh_CN',
      theme: MindElixir.THEME,
      mouseSelectionButton: 0,
      editable: true,
    };

    const mindInstance = new MindElixir(option);
    const initDataToUse = mindData || MindElixir.new('中心主题');
    // mindInstance.install();
    mindInstance.init(initDataToUse);

    mindInstance.bus.addListener('operation', operationHandle);
    mindInstance.bus.addListener('selectNodes', selectNodesHandle);
    mindInstance.bus.addListener('selectNewNode', selectNodeHandle);

    mindRef.current = mindInstance;

    return () => {
      if (mindInstance) {
        mindInstance.bus?.removeListener('operation', operationHandle);
        mindInstance.bus?.removeListener('selectNodes', selectNodesHandle);
        mindInstance.bus?.removeListener('selectNewNode', selectNodeHandle);
        mindInstance.destroy();
      }
    };
  }, [mindData]);

  const operationHandle = (info: Operation) => {
    console.log('operationHandle', info);
  };

  const selectNodesHandle = (nodeObjs: NodeObj[]) => {
    console.log('selectNodesHandle', nodeObjs);
  };

  const selectNodeHandle = (nodeObj: NodeObj, e?: MouseEvent) => {
    console.log('selectNodeHandle', nodeObj, e);
  };

  const saveMap = async () => {
    if (!mindRef.current) {
      message.warning('脑图未初始化');
      return;
    }
    if (!reqId || !moduleId || !projectId) {
      message.error('缺少必要参数');
      return;
    }

    try {
      const value = mindRef.current.getData();

      if (currentMindId) {
        const { code, data } = await updateTestCaseMind({
          mind_node: value,
          id: currentMindId,
        });
        if (code === 0) {
          setMindData(data.mind_node);
          message.success('保存成功');
        }
      } else {
        const { code, data } = await insertTestCaseMind({
          requirement_id: reqId,
          mind_node: value,
          module_id: moduleId,
          project_id: projectId,
        });

        if (code === 0) {
          setMindData(data.mind_node);
          message.success('保存成功');
        }
      }
    } catch (error) {
      console.error('Error saving mind map:', error);
      message.error('保存失败');
    }
  };

  const containerStyle = useMemo(
    () => ({
      height: '90vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      background: `linear-gradient(135deg, ${colors.bgLayout} 0%, ${colors.bgContainer} 100%)`,
      borderRadius: borderRadius.xl,
    }),
    [colors, borderRadius],
  );

  return (
    <ProCard
      bordered
      title={<ToolBar mind={mindRef} saveMap={saveMap} />}
      bodyStyle={containerStyle}
      headStyle={{
        background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${spacing.md}px ${spacing.lg}px`,
      }}
      style={{
        borderRadius: borderRadius.xl,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 2px 8px ${colors.bgContainer}20`,
        overflow: 'hidden' as const,
      }}
    >
      <div
        id="mind-elixir-container"
        ref={containerRef}
        style={{
          flex: 1,
          width: '100%',
          overflow: 'auto',
        }}
      />
    </ProCard>
  );
};

export default Index;
