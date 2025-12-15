import { ModalForm } from '@ant-design/pro-components';
import { FormInstance } from 'antd';
import { FC } from 'react';

interface Props {
  onFinish: (values: any) => Promise<any>;
  title?: string;
  trigger?: JSX.Element;
  form: FormInstance<any>;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const Index: FC<Props> = (props, context) => {
  const { onFinish, open, setOpen, trigger, form, title } = props;
  return (
    <ModalForm
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => console.log('run'),
      }}
      title={title}
      form={form}
      onFinish={onFinish}
    >
      {props.children}
    </ModalForm>
  );
};

export default Index;
