import { Drawer } from 'antd';
import React, { FC } from 'react';

interface SelfProps {
  name?: string | JSX.Element;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  width?: string | number;
  extra?: any;
  onClose?: () => void;
  height?: string | number;
  loading?: boolean;
}

const Index: FC<SelfProps> = (props) => {
  const { open, setOpen, loading, name, height, width, onClose } = props;

  return (
    <Drawer
      autoFocus
      loading={loading}
      styles={{
        body: {
          padding: 5,
          overflowY: 'auto',
          overflowX: 'hidden',
        },
      }}
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
