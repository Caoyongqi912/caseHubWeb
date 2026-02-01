import { pagePlayLocators } from '@/api/play/playCase';
import MyProTable from '@/components/Table/MyProTable';
import { ILocator } from '@/pages/Play/componets/uiTypes';
import { pageData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { useCallback, useRef } from 'react';

const Index = () => {
  const actionRef = useRef<ActionType>();

  const pageLocator = useCallback(async (values: any) => {
    const { code, data } = await pagePlayLocators({ ...values });
    return pageData(code, data);
  }, []);
  const columns: ProColumns<ILocator>[] = [
    {
      title: '定位器名称',
      dataIndex: 'getter_name',
      fixed: 'left',
    },
    {
      title: '描述',
      dataIndex: 'getter_desc',
      valueType: 'textarea',
      search: false,
    },
    {
      title: '演示',
      dataIndex: 'getter_demo',
      valueType: 'jsonCode',
      search: false,
    },
  ];
  return (
    <div>
      <MyProTable
        actionRef={actionRef}
        columns={columns}
        request={pageLocator}
        x={1000}
        rowKey={'uid'}
      />
    </div>
  );
};

export default Index;
