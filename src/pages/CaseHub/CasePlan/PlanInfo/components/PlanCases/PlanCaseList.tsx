import { queryPlanCases } from '@/api/case/caseplan';
import MyDrawer from '@/components/MyDrawer';
import { ITestCase } from '@/pages/CaseHub/types';
import { EllipsisOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Input, Space } from 'antd';
import { FC, useEffect, useState } from 'react';
import PlanCaseForm from './PlanCaseForm';

interface PlanCaseListProps {
  /** 测试计划 ID */
  planId?: string;
  /** 当前选中的模块 ID，null 表示全部用例 */
  moduleId?: number | null;
}

/**
 * 计划用例列表组件
 * 展示指定目录下的用例列表
 */
const Index: FC<PlanCaseListProps> = ({ planId, moduleId }) => {
  const [caseList, setCaseList] = useState<ITestCase[]>([]);
  const [openNewCaseDrawer, setOpenNewCaseDrawer] = useState<boolean>(false);
  const [openChoiceCaseDrawer, setOpenChoiceCaseDrawer] =
    useState<boolean>(false);
  useEffect(() => {
    fetchQueryPlanCases({
      plan_id: Number(planId),
      plan_module_id: moduleId,
      current: 1,
      pageSize: 10,
    });
  }, [planId, moduleId]);

  const fetchQueryPlanCases = async (values: any) => {
    const { code, data } = await queryPlanCases({
      ...values,
    });
    if (code === 0) {
      console.log(data);
      setCaseList(data || []);
    }
  };

  const CardTitle = (
    <Space>
      <Button type="primary" onClick={() => setOpenNewCaseDrawer(true)}>
        新增用例
      </Button>
      <Button type="primary" onClick={() => setOpenChoiceCaseDrawer(true)}>
        规划用例
      </Button>
    </Space>
  );

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: '批量导出',
    },
    {
      key: '2',
      label: '批量导入',
    },
  ];
  const CardExtra = (
    <Space>
      <Input placeholder="搜索用例名称" />
      <Button type="primary">排序</Button>
      <Button type="primary">筛选</Button>
      <Dropdown
        menu={{
          items,
          selectable: true,
          defaultSelectedKeys: ['3'],
        }}
      >
        <EllipsisOutlined />
      </Dropdown>
    </Space>
  );

  return (
    <>
      <ProCard title={CardTitle} extra={CardExtra} headerBordered></ProCard>
      <MyDrawer
        name={'添加用例'}
        open={openNewCaseDrawer}
        setOpen={setOpenNewCaseDrawer}
        width={'60%'}
      >
        <PlanCaseForm />
      </MyDrawer>
      <MyDrawer
        name={'规划用例'}
        open={openChoiceCaseDrawer}
        setOpen={setOpenChoiceCaseDrawer}
        width={'60%'}
      ></MyDrawer>
    </>
  );
};

export default Index;
