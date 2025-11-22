import { Drawer } from 'antd';
import React, { FC } from 'react';

interface SelfProps {
  name?: string | JSX.Element;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  width?: string | null;
  extra?: any;
  onClose?: () => void;
  height?: string | null;
  loading?: boolean;
}

const Index: FC<SelfProps> = (props) => {
  const { open, setOpen, loading, name, height, width, onClose } = props;

  return (
    <Drawer
      autoFocus
      loading={loading}
      styles={{ body: { padding: 0 } }}
      open={open}
      destroyOnClose={true}
      height={height || 'auto'}
      width={width || '65%'}
      title={name || false}
      extra={props.extra}
      onClose={onClose || (() => setOpen(false))}
      maskClosable={false}
    >
      {props.children}
    </Drawer>
  );
};

export default Index;
