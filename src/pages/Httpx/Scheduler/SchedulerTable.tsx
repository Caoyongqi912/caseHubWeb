import MyProTable from '@/components/Table/MyProTable';
import ConfigForm from '@/pages/Httpx/Scheduler/ConfigForm';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-components';
import { Button } from 'antd';
import { FC, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const SchedulerTable: FC<SelfProps> = (props) => {
  const { currentProjectId, currentModuleId, perKey } = props;
  const [modalVisit, setModalVisit] = useState(false);
  const columns = [{}];

  return (
    <div>
      <ModalForm
        size={'small'}
        title="Create New Form"
        open={modalVisit}
        onFinish={async () => {
          return true;
        }}
        onOpenChange={setModalVisit}
      >
        <ConfigForm currentProjectId={currentProjectId} />
      </ModalForm>
      <MyProTable
        columns={columns}
        rowKey={'id'}
        toolBarRender={() => [
          <Button
            hidden={currentModuleId === undefined}
            type="primary"
            onClick={() => {
              setModalVisit(true);
            }}
          >
            <PlusOutlined />
            Show Modal
          </Button>,
        ]}
      />
    </div>
  );
};

export default SchedulerTable;
