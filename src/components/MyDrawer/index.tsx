import { Drawer, theme } from 'antd';
import React, { FC, useMemo } from 'react';

interface SelfProps {
  name?: string | JSX.Element;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  width?: string | number;
  extra?: React.ReactNode;
  onClose?: () => void;
  height?: string | number;
  loading?: boolean;
  children?: React.ReactNode;
  drawerStyles?: {
    header?: React.CSSProperties;
    body?: React.CSSProperties;
    mask?: React.CSSProperties;
    wrapper?: React.CSSProperties;
    footer?: React.CSSProperties;
  };
}

const Index: FC<SelfProps> = (props) => {
  const { open, setOpen, loading, name, height, width, onClose, drawerStyles } =
    props;
  const { token } = theme.useToken();

  const defaultDrawerStyles = useMemo(
    () => ({
      header: {
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
        borderBottom: `1px solid ${token.colorBorder}`,
        padding: `${token.paddingLG}px ${token.paddingXL}px`,
        fontWeight: 600,
        fontSize: token.fontSizeLG,
      },
      body: {
        padding: token.paddingLG,
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const,
        background: token.colorBgContainer,
      },
      mask: {
        background: `rgba(0, 0, 0, 0.45)`,
        backdropFilter: 'blur(4px)',
      },
      wrapper: {
        boxShadow: `-4px 0 24px rgba(0, 0, 0, 0.12)`,
      },
      footer: {
        borderTop: `1px solid ${token.colorBorder}`,
        padding: `${token.paddingMD}px ${token.paddingLG}px`,
        background: token.colorBgContainer,
      },
    }),
    [token],
  );

  const mergedStyles = useMemo(
    () => ({
      header: { ...defaultDrawerStyles.header, ...drawerStyles?.header },
      body: { ...defaultDrawerStyles.body, ...drawerStyles?.body },
      mask: { ...defaultDrawerStyles.mask, ...drawerStyles?.mask },
      wrapper: { ...defaultDrawerStyles.wrapper, ...drawerStyles?.wrapper },
      footer: { ...defaultDrawerStyles.footer, ...drawerStyles?.footer },
    }),
    [defaultDrawerStyles, drawerStyles],
  );

  return (
    <Drawer
      autoFocus
      loading={loading}
      styles={mergedStyles}
      open={open}
      destroyOnClose={true}
      height={height || 'auto'}
      width={width || '65%'}
      title={name || false}
      extra={props.extra}
      onClose={onClose || (() => setOpen(false))}
      maskClosable={false}
      placement="right"
    >
      {props.children}
    </Drawer>
  );
};

export default Index;
