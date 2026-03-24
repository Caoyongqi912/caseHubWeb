# PlayConditionContent 组件优化重构计划

## 组件概述

| 文件 | 职责 |
|------|------|
| `index.tsx` | 条件卡片包装组件，负责展示和交互状态管理 |
| `ConditionContentInfo.tsx` | 条件内容详情，包含表单和步骤表格 |

---

## 问题分析

### index.tsx 问题

| 问题 | 位置 | 说明 |
|------|------|------|
| 空 useEffect | 25-29 行 | useEffect 内部没有任何实际操作，setState 后又设置相同值 |
| 未使用导入 | 1-7 行 | `GlobalOutlined` 未使用 |
| 样式重复 | 38-48 行 | Tag 样式硬编码，未使用 token |
| 未使用变量 | 18 行 | `conditionTitle` 每次渲染都重新创建 |

### ConditionContentInfo.tsx 问题

| 问题 | 位置 | 说明 |
|------|------|------|
| Tag 样式重复 | 118-158 行 | 公共/私有 Tag 样式重复，未抽取组件 |
| 未使用导入 | 13 行 | `GlobalOutlined` 未使用 |
| timeoutRef 类型 | 54 行 | `useRef<any>` 应明确类型 |
| columns key 重复 | 86-186 行 | `key` 和 `dataIndex` 重复 |
| 冗余 Fragment | 187-256 行 | `formRender` 多层 Fragment 包装 |
| PlayStepDetail Props | 373-396 行 | `play_condition_content_id` 非标准 Props |

---

## 重构方案

### 文件结构调整

```
PlayConditionContent/
├── index.tsx                      # 主组件（精简）
├── ConditionContentInfo.tsx       # 详情组件（精简）
├── components/
│   ├── ConditionForm.tsx          # 条件表单组件
│   ├── ConditionStepsTable.tsx    # 步骤表格组件
│   └── VisibilityTag.tsx          # 公共/私有标签组件
├── hooks/
│   └── useConditionSteps.ts       # 步骤数据 Hook
└── types.ts                       # 类型定义
```

### 步骤 1：创建 VisibilityTag 组件

创建 `components/VisibilityTag.tsx`：

```typescript
import { GlobalOutlined, LockOutlined } from '@ant-design/icons';
import { Tag, theme } from 'antd';
import { FC, memo } from 'react';

interface VisibilityTagProps {
  isCommon: boolean;
}

const VisibilityTag: FC<VisibilityTagProps> = memo(({ isCommon }) => {
  const { token } = theme.useToken();

  const config = {
    isCommon: {
      label: '公共',
      color: '#059669',
      bgColor: '#d1fae5',
      borderColor: '#05966920',
      icon: GlobalOutlined,
    },
    isPrivate: {
      label: '私有',
      color: '#dc2626',
      bgColor: '#fee2e2',
      borderColor: '#dc262620',
      icon: LockOutlined,
    },
  };

  const { label, color, bgColor, borderColor, icon: Icon } = isCommon
    ? config.isCommon
    : config.isPrivate;

  return (
    <Tag
      icon={<Icon />}
      style={{
        background: bgColor,
        color,
        border: `1px solid ${borderColor}`,
        fontWeight: 500,
        fontSize: '12px',
        padding: '2px 8px',
        borderRadius: token.borderRadiusSM,
      }}
    >
      {label}
    </Tag>
  );
});

VisibilityTag.displayName = 'VisibilityTag';
export default VisibilityTag;
```

### 步骤 2：创建 useConditionSteps Hook

创建 `hooks/useConditionSteps.ts`：

```typescript
import { useCallback, useState } from 'react';
import {
  choicePlayCaseConditionContentStep,
  getPlayCaseConditionContentSteps,
  removeCaseConditionContentstep,
  reorderPlayCaseConditionContentStep,
} from '@/api/play/playCase';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import { queryData } from '@/utils/somefunc';

interface UseConditionStepsOptions {
  conditionId: number;
}

export const useConditionSteps = (options: UseConditionStepsOptions) => {
  const { conditionId } = options;
  const [loading, setLoading] = useState(false);

  const fetchSteps = useCallback(async () => {
    const { code, data } = await getPlayCaseConditionContentSteps({
      condition_id: conditionId,
    });
    return queryData(code, data);
  }, [conditionId]);

  const removeStep = useCallback(async (contentId: number) => {
    setLoading(true);
    try {
      const { code } = await removeCaseConditionContentstep({
        content_id: contentId,
        condition_id: conditionId,
      });
      return code === 0;
    } finally {
      setLoading(false);
    }
  }, [conditionId]);

  const reorderSteps = useCallback(async (stepIds: number[]) => {
    const { code } = await reorderPlayCaseConditionContentStep({
      condition_id: conditionId,
      content_child_list_id: stepIds,
    });
    return code === 0;
  }, [conditionId]);

  const choiceSteps = useCallback(async (quote: boolean, stepIds: number[]) => {
    const { code } = await choicePlayCaseConditionContentStep({
      quote,
      condition_id: conditionId,
      play_step_id_list: stepIds,
    });
    return code === 0;
  }, [conditionId]);

  return {
    fetchSteps,
    removeStep,
    reorderSteps,
    choiceSteps,
    loading,
  };
};
```

### 步骤 3：创建 ConditionForm 组件

创建 `components/ConditionForm.tsx`：

```typescript
import { AssertOption } from '@/pages/Httpx/componets/assertEnum';
import { Form, Input, Select, Space, Text, theme } from 'antd';
import { FC, useEffect } from 'react';

interface ConditionFormProps {
  initialValues?: {
    condition_key?: string;
    condition_operator?: string;
    condition_value?: string;
  };
  onChange?: (values: {
    key?: string;
    value?: string;
    operator?: string;
    showValue?: boolean;
  }) => void;
}

const ConditionForm: FC<ConditionFormProps> = ({ initialValues, onChange }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [showValue, setShowValue] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleValuesChange = (_: any, values: any) => {
    const showValueInput = ![3, 4].includes(values.condition_operator);
    setShowValue(showValueInput);
    onChange?.({
      key: values.condition_key,
      value: values.condition_value,
      operator: values.condition_operator,
      showValue: showValueInput,
    });
  };

  return (
    <div
      style={{
        padding: '16px',
        background: token.colorBgContainer,
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorder}`,
      }}
    >
      <Form form={form} onValuesChange={handleValuesChange} layout="inline">
        <Space size="middle" align="center" wrap>
          <Text strong style={{ fontSize: '14px', color: token.colorText }}>
            判断条件
          </Text>
          <Form.Item
            name="condition_key"
            rules={[{ required: true, message: '变量名不能为空' }]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="条件值，支持{{变量名}}" style={{ width: '200px' }} />
          </Form.Item>
          <Form.Item
            name="condition_operator"
            rules={[{ required: true, message: '条件不能为空' }]}
            style={{ marginBottom: 0 }}
          >
            <Select style={{ width: '120px' }} options={AssertOption} />
          </Form.Item>
          {showValue && (
            <Form.Item
              name="condition_value"
              rules={[{ required: true, message: '比较值不能为空' }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="输入比较值" style={{ width: '200px' }} />
            </Form.Item>
          )}
        </Space>
      </Form>
    </div>
  );
};

export default ConditionForm;
```

### 步骤 4：精简 ConditionContentInfo.tsx

```typescript
import { Divider, Dropdown, Button, Popconfirm, ActionType, DragSortTable, ProColumns } from '@ant-design/pro-components';
import { DeleteOutlined, PlusOutlined, SelectOutlined } from '@ant-design/icons';
import { MenuProps, theme } from 'antd';
import { FC, useRef, useState, useCallback } from 'react';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import { updatePlayConditionContentInfo } from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import PlayCommonChoiceTable from '../../../PlayCommonChoiceTable';
import ConditionForm from './components/ConditionForm';
import VisibilityTag from './components/VisibilityTag';
import { useConditionSteps } from './hooks/useConditionSteps';

interface Props {
  case_id: number;
  stepContent: IPlayStepContent;
  setKey: (value: string) => void;
  setValue: (value: string) => void;
  setOperator: (value: string) => void;
}

const ConditionContentInfo: FC<Props> = ({ case_id, stepContent, setKey, setValue, setOperator }) => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [drawerState, setDrawerState] = useState({
    selfStep: false,
    commonStep: false,
    contentInfo: false,
  });
  const [currentStepId, setCurrentStepId] = useState<number>();

  const { fetchSteps, removeStep, reorderSteps, choiceSteps } = useConditionSteps({
    conditionId: stepContent.target_id,
  });

  const handleConditionChange = useCallback((values: { key?: string; value?: string; operator?: string }) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      if (values.key && values.operator) {
        const { code, data } = await updatePlayConditionContentInfo({
          id: stepContent.target_id,
          ...values,
        });
        if (code === 0) {
          setKey(values.key || '');
          setValue(values.value || '');
          setOperator(values.operator);
        }
      }
    }, 2000);
  }, [stepContent.target_id, setKey, setValue, setOperator]);

  const handleRemove = useCallback(async (record: IPlayStepContent) => {
    const success = await removeStep(record.id);
    if (success) actionRef.current?.reload();
  }, [removeStep]);

  const handleDragSort = useCallback(async (_: number, __: number, newDataSource: IPlayStepContent[]) => {
    const success = await reorderSteps(newDataSource.map(item => item.id));
    if (success) actionRef.current?.reload();
  }, [reorderSteps]);

  const handleChoiceSteps = useCallback(async (quote: boolean, selectedRowKeys: React.Key[]) => {
    const success = await choiceSteps(quote, selectedRowKeys as number[]);
    if (success) {
      setDrawerState(prev => ({ ...prev, commonStep: false }));
      actionRef.current?.reload();
    }
  }, [choiceSteps]);

  const openStepDetail = useCallback((stepId: number) => {
    setCurrentStepId(stepId);
    setDrawerState(prev => ({ ...prev, contentInfo: true }));
  }, []);

  const columns: ProColumns<IPlayStepContent>[] = [
    { title: '排序', dataIndex: 'sort', width: '8%' },
    { title: '名称', dataIndex: 'content_name', ellipsis: true, render: (_, record) => <a onClick={() => openStepDetail(record.target_id)}>{record.content_name}</a> },
    { title: '描述', dataIndex: 'content_desc', ellipsis: true },
    { title: '类型', dataIndex: 'is_common', render: (_, record) => <VisibilityTag isCommon={record.is_common} /> },
    {
      title: '操作',
      valueType: 'option',
      align: 'center',
      render: (_, record) => (
        <Popconfirm title="确认移除" description="确定要移除这个步骤吗？" onConfirm={() => handleRemove(record)} okText="确定" cancelText="取消">
          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const addMenuItems: MenuProps['items'] = [
    { key: 'choice_common', label: '选择公共步骤', icon: <SelectOutlined style={{ color: token.colorPrimary }} />, onClick: () => setDrawerState(prev => ({ ...prev, commonStep: true })) },
    { key: 'add_self_step', label: '添加私有步骤', icon: <PlusOutlined style={{ color: token.colorPrimary }} />, onClick: () => setDrawerState(prev => ({ ...prev, selfStep: true })) },
  ];

  return (
    <>
      <div style={{ background: token.colorBgContainer, borderRadius: token.borderRadius, padding: '16px' }}>
        <ConditionForm onChange={handleConditionChange} />
        <Divider style={{ margin: '16px 0' }} />
        <DragSortTable
          toolBarRender={() => [<Dropdown arrow menu={{ items: addMenuItems }} placement="bottomRight"><Button type="primary" icon={<PlusOutlined />}>添加</Button></Dropdown>]}
          actionRef={actionRef}
          columns={columns}
          request={fetchSteps}
          rowKey="id"
          onDragSortEnd={handleDragSort}
          search={false}
          pagination={false}
          dragSortKey="sort"
          style={{ border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius }}
        />
      </div>

      <MyDrawer width="auto" open={drawerState.selfStep} setOpen={(open) => setDrawerState(prev => ({ ...prev, selfStep: open }))}>
        <PlayStepDetail play_case_id={case_id} callback={() => { setDrawerState(prev => ({ ...prev, selfStep: false })); actionRef.current?.reload(); }} />
      </MyDrawer>

      <MyDrawer width="60%" open={drawerState.commonStep} setOpen={(open) => setDrawerState(prev => ({ ...prev, commonStep: open }))}>
        <PlayCommonChoiceTable onSelect={handleChoiceSteps} />
      </MyDrawer>

      <MyDrawer width="auto" open={drawerState.contentInfo} setOpen={(open) => setDrawerState(prev => ({ ...prev, contentInfo: open }))}>
        <PlayStepDetail play_case_id={case_id} play_step_id={currentStepId} callback={() => { setDrawerState(prev => ({ ...prev, contentInfo: false })); actionRef.current?.reload(); }} />
      </MyDrawer>
    </>
  );
};

export default ConditionContentInfo;
```

### 步骤 5：精简 index.tsx

```typescript
import Handler from '@/components/DnDDraggable/handler';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import { BranchesOutlined } from '@ant-design/icons';
import { ProCard, useToken } from '@ant-design/pro-components';
import { Space, Tag, Text, theme } from 'antd';
import { FC, useState, useCallback } from 'react';
import ContentExtra from '../../contentExtra';
import ConditionContentInfo from './ConditionContentInfo';

interface Props {
  id: number;
  step: number;
  caseId: number;
  stepContent: IPlayStepContent;
  callback: () => void;
}

const Index: FC<Props> = ({ id, step, caseId, stepContent, callback }) => {
  const { token } = useToken();
  const [showOption, setShowOption] = useState(false);
  const [conditionDisplay, setConditionDisplay] = useState({ key: '', value: '', operator: '' });

  const handleConditionChange = useCallback((values: { key?: string; value?: string; operator?: string }) => {
    setConditionDisplay(prev => ({ ...prev, key: values.key || '', value: values.value || '', operator: values.operator || '' }));
  }, []);

  const conditionTitle = (
    <Space size={8} align="center">
      <Handler id={id} step={step} />
      <Tag icon={<BranchesOutlined />} style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #d9770620', fontWeight: 600, fontSize: '12px', padding: '2px 8px', borderRadius: token.borderRadiusSM }}>
        IF
      </Tag>
      {conditionDisplay.key && <Text type="warning" strong style={{ fontSize: '14px' }}>{conditionDisplay.key}</Text>}
      {conditionDisplay.operator && <Text strong style={{ fontSize: '14px', color: token.colorText }}>{conditionDisplay.operator}</Text>}
      {conditionDisplay.value && <Text type="warning" strong style={{ fontSize: '14px' }}>{conditionDisplay.value}</Text>}
    </Space>
  );

  return (
    <ProCard
      bordered
      collapsible
      hoverable
      bodyStyle={{ padding: 0 }}
      defaultCollapsed
      style={{ borderRadius: token.borderRadiusLG, boxShadow: showOption ? `0 4px 12px ${token.colorPrimaryBg}` : `0 1px 3px ${token.colorBgLayout}`, transition: 'all 0.3s ease', borderColor: showOption ? token.colorPrimaryBorder : token.colorBorder }}
      onMouseEnter={() => setShowOption(true)}
      onMouseLeave={() => setShowOption(false)}
      collapsibleIconRender={() => conditionTitle}
      extra={<ContentExtra stepContent={stepContent} caseId={caseId} callback={callback} show={showOption} />}
    >
      <ConditionContentInfo case_id={caseId} stepContent={stepContent} setKey={(key) => setConditionDisplay(prev => ({ ...prev, key }))} setValue={(value) => setConditionDisplay(prev => ({ ...prev, value }))} setOperator={(operator) => setConditionDisplay(prev => ({ ...prev, operator }))} />
    </ProCard>
  );
};

export default Index;
```

---

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `components/VisibilityTag.tsx` | 新增 |
| `components/ConditionForm.tsx` | 新增 |
| `hooks/useConditionSteps.ts` | 新增 |
| `types.ts` | 新增（统一类型定义） |
| `index.tsx` | 重构（精简至 ~80 行） |
| `ConditionContentInfo.tsx` | 重构（精简至 ~150 行） |

---

## 优化收益

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| index.tsx 行数 | 124 | ~80 |
| ConditionContentInfo.tsx 行数 | 402 | ~150 |
| 重复代码 | Tag 样式 2 处 | 抽取为组件 |
| 状态管理 | 分散 setState | 集中在 Hook |
| 可测试性 | 耦合严重 | 组件独立可测 |
