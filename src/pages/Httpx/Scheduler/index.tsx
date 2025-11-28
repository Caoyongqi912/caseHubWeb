import MyProTable from '@/components/Table/MyProTable';
import ConfigForm from '@/pages/Httpx/Scheduler/ConfigForm';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useState } from 'react';

const Index = () => {
  const [modalVisit, setModalVisit] = useState(false);

  const columns = [{}];
  return (
    <div>
      <ModalForm
        title="Create New Form"
        open={modalVisit}
        onFinish={async () => {
          return true;
        }}
        onOpenChange={setModalVisit}
      >
        <ConfigForm />
      </ModalForm>
      <MyProTable
        columns={columns}
        rowKey={'id'}
        toolBarRender={() => [
          <Button
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

export default Index;
