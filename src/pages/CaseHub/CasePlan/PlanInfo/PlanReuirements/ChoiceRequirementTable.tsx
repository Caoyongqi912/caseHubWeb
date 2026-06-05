/**
 * ChoiceRequirementTable
 *
 * 用于在「关联需求」弹窗中选择需求列表。
 * 参考 RequirementTable.tsx 的字段与交互（可搜索、可勾选），
 * 区别在于：
 * - 不渲染「详情 / 用例 / 删除」等行内操作
 * - 顶部由调用方渲染一个「关联选中」按钮
 * - 排除「已关联到当前计划」的需求，避免重复关联
 *
 * Props:
 * - projectId: 当前计划所属项目，用于过滤同项目下的需求
 * - 不再传 planId：选需求弹窗拉取所有需求，重复关联由后端 INSERT IGNORE 处理
 * - onConfirm: 选中后回调，将勾选的 requirement_id[] 交给父组件发起 link
 */
import { IModuleEnum, IObjGet } from '@/api';
import { pageRequirement } from '@/api/case/requirement';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import {
  RequirementProcessEnum,
  RequirementProcessOption,
} from '@/pages/CaseHub/config/constants';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { IRequirement } from '@/pages/CaseHub/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlanRequirementStyles } from './styles';

interface Props {
  /** 当前计划所属项目 ID，用于过滤 */
  projectId?: number;
  /** 选中行 ID 集合（受控） */
  selectedRowKeys: React.Key[];
  /** 选中行变化 */
  onSelectionChange: (keys: React.Key[]) => void;
  /** 触发确认关联（由父组件传入按钮渲染） */
  onConfirm?: () => void;
  /** 是否禁用确认按钮（loading / 没选中等） */
  confirmDisabled?: boolean;
}

const ChoiceRequirementTable: FC<Props> = ({
  projectId,
  selectedRowKeys,
  onSelectionChange,
  onConfirm,
  confirmDisabled,
}) => {
  const { token, colors, borderRadius } = useCaseHubTheme();
  const styles = usePlanRequirementStyles();
  const actionRef = useRef<ActionType>();

  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);

  // 拉取项目 + 模块树
  useEffect(() => {
    if (!projectId) return;
    queryProjectEnum(setProjectEnumMap).then(async () => {
      await fetchModulesEnum(projectId, ModuleEnum.REQUIREMENT, setModuleEnum);
    });
  }, [projectId]);

  // 分页拉取需求
  // 注意：选需求弹窗故意不传 plan_id，重复关联由后端
  // plan_requirement_association 复合主键 + INSERT IGNORE 自动处理。
  // 这样既避免了双表 JOIN 的索引失效，也简化了前端逻辑。
  const fetchPageData = useCallback(
    async (params: any, sort: any) => {
      const values = {
        ...params,
        project_id: projectId,
        module_type: ModuleEnum.REQUIREMENT,
        sort,
      };
      const { code, data } = await pageRequirement(values);
      return pageData(code, data);
    },
    [projectId],
  );

  const columns: ProColumns<IRequirement>[] = useMemo(
    () => [
      {
        title: 'ID',
        key: 'uid',
        dataIndex: 'uid',
        width: 110,
        render: (text) => (
          <Tag
            style={{
              background: colors.primaryBg,
              borderColor: colors.primary,
              color: colors.primary,
              borderRadius: borderRadius.md,
              fontWeight: 500,
              margin: 0,
            }}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: '需求名',
        key: 'requirement_name',
        dataIndex: 'requirement_name',
        copyable: true,
        ellipsis: true,
        width: 260,
        render: (text) => (
          <span style={{ color: token.colorText, fontWeight: 500 }}>
            {text}
          </span>
        ),
      },
      {
        title: '所属项目',
        key: 'project_id',
        dataIndex: 'project_id',
        valueType: 'select',
        valueEnum: projectEnumMap,
        hideInTable: true,
        initialValue: projectId,
      },
      {
        title: '所属模块',
        key: 'module_id',
        dataIndex: 'module_id',
        valueType: 'treeSelect',
        hideInTable: true,
        fieldProps: {
          treeData: moduleEnum,
          fieldNames: { label: 'title', value: 'value' },
        },
      },
      {
        title: '等级',
        key: 'requirement_level',
        dataIndex: 'requirement_level',
        valueType: 'select',
        width: 90,
        valueEnum: {
          P0: { text: 'P0', status: 'Error' },
          P1: { text: 'P1', status: 'Warning' },
          P2: { text: 'P2', status: 'Processing' },
        },
      },
      {
        title: '进度',
        key: 'process',
        dataIndex: 'process',
        valueType: 'select',
        width: 120,
        valueEnum: RequirementProcessEnum,
        render: (_, record) => (
          <Tag
            style={{
              background: styles.palette.amber.bg,
              borderColor: styles.palette.amber.border,
              color: styles.palette.amber.text,
              borderRadius: borderRadius.md,
              margin: 0,
            }}
          >
            {RequirementProcessOption.find((o) => o.value === record.process)
              ?.label || '-'}
          </Tag>
        ),
      },
      {
        title: '维护人',
        key: 'maintainerName',
        dataIndex: 'maintainerName',
        width: 100,
        render: (text) => (
          <span style={{ color: token.colorTextSecondary }}>{text || '-'}</span>
        ),
      },
      {
        title: '用例数',
        key: 'case_number',
        dataIndex: 'case_number',
        width: 80,
        render: (num) => (
          <Tag
            style={{
              background: 'rgba(0, 0, 0, 0.04)',
              borderColor: 'rgba(0, 0, 0, 0.12)',
              color: token.colorText,
              borderRadius: borderRadius.md,
              margin: 0,
            }}
          >
            {num ?? 0}
          </Tag>
        ),
      },
    ],
    [colors, borderRadius, token, projectEnumMap, moduleEnum, projectId],
  );

  const rowSelection: TableRowSelection<IRequirement> = {
    selectedRowKeys,
    type: 'checkbox',
    preserveSelectedRowKeys: true,
    onChange: (newKeys) => onSelectionChange(newKeys),
  };

  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <MyProTable
        rowSelection={rowSelection}
        actionRef={actionRef}
        //@ts-ignore
        request={fetchPageData}
        columns={columns}
        rowKey="id"
        search={{ labelWidth: 'auto', showHiddenNum: true }}
        pagination={{
          showQuickJumper: true,
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        toolBarRender={
          onConfirm
            ? () => [
                <Button
                  key="link"
                  type="primary"
                  disabled={confirmDisabled}
                  onClick={onConfirm}
                  style={{
                    background: styles.isDark
                      ? 'linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%)'
                      : 'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 100%)',
                    border: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                    color: styles.isDark ? '#0a0a0a' : '#ffffff',
                  }}
                >
                  关联选中 ({selectedRowKeys.length})
                </Button>,
              ]
            : undefined
        }
      />
    </Space>
  );
};

export default ChoiceRequirementTable;
