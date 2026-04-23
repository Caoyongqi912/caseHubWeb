import { ModalForm } from '@ant-design/pro-components';
import { FormInstance } from 'antd';
import { FC, useEffect } from 'react';

interface Props {
  onFinish: (values: any) => Promise<any>;
  title?: string;
  trigger?: JSX.Element;
  form?: FormInstance<any>;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  initialValues?: Record<string, any>;
  children?: React.ReactNode;
}

const Index: FC<Props> = (props) => {
  const { onFinish, open, setOpen, trigger, form, title, initialValues } =
    props;

  useEffect(() => {
    if (open && form && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [open, form, initialValues]);

  return (
    <ModalForm
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      modalProps={{
        destroyOnClose: true,
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
