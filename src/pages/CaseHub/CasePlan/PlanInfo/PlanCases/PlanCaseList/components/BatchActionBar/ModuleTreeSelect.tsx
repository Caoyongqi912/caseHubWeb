import { getPlanModules } from '@/api/case/caseplan';
import type { IPlanModule } from '@/pages/CaseHub/types';
import { Spin, TreeSelect } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

export interface ModuleTreeSelectProps {
  planId?: number;
  value?: number;
  onChange?: (moduleId: number | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

interface TreeDataNode {
  label: string;
  value: number;
  children?: TreeDataNode[];
}

const ModuleTreeSelect: FC<ModuleTreeSelectProps> = ({
  planId,
  value,
  onChange,
  disabled = false,
  placeholder = '请选择目录',
}) => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = useCallback(
    (modules: IPlanModule[]): TreeDataNode[] =>
      modules.map((module) => ({
        label: module.title,
        value: module.id,
        children:
          module.children && module.children.length > 0
            ? convertToTreeData(module.children)
            : undefined,
      })),
    [],
  );

  const fetchModules = useCallback(async () => {
    if (!planId) {
      setTreeData([]);
      return;
    }

    setLoading(true);
    try {
      const { code, data } = await getPlanModules(planId);
      if (code === 0) {
        const converted = convertToTreeData(data || []);
        setTreeData(converted);
      } else {
        setTreeData([]);
      }
    } catch {
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  }, [planId, convertToTreeData]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleChange = useCallback(
    (newValue: number) => {
      const selectedValue = newValue === null ? undefined : newValue;
      onChange?.(selectedValue);
    },
    [onChange],
  );

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Spin size="small" description="加载目录..." />
      </div>
    );
  }

  if (!planId) {
    return (
      <div
        style={{
          padding: 12,
          color: '#999',
          textAlign: 'center',
        }}
      >
        请先选择测试计划
      </div>
    );
  }

  return (
    <TreeSelect
      value={value}
      onChange={handleChange}
      treeData={treeData}
      placeholder={placeholder}
      allowClear
      treeDefaultExpandAll
      disabled={disabled}
      showSearch
      treeNodeFilterProp="label"
      style={{ width: '100%' }}
    />
  );
};

export default ModuleTreeSelect;
