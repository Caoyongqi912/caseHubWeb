import MyModal from '@/components/MyModal';
import GroupBaseInfo from '@/pages/Httpx/Interface/interfaceApiGroup/GroupBaseInfo';
import { IInterfaceGroup } from '@/pages/Httpx/types';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { FormInstance } from 'antd/es/form';
import { FC } from 'react';

interface AddGroupButtonProps {
  form: FormInstance<IInterfaceGroup>;
  currentModuleId?: number;
  onFinish: (values: IInterfaceGroup) => Promise<boolean>;
  onClick: () => void;
}

const AddGroupButton: FC<AddGroupButtonProps> = ({
  form,
  currentModuleId,
  onFinish,
  onClick,
}) => {
  const addBtnStyle = {
    height: 36,
    borderRadius: 8,
  };

  return (
    <MyModal
      key="add"
      form={form}
      onFinish={onFinish}
      trigger={
        <Button
          hidden={currentModuleId === undefined}
          type="primary"
          style={addBtnStyle}
          icon={<PlusOutlined />}
          onClick={onClick}
        >
          添加接口组
        </Button>
      }
    >
      <GroupBaseInfo />
    </MyModal>
  );
};

export default AddGroupButton;
