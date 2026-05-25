import { Tabs } from 'antd';
import { TabPlacement } from 'antd/es/tabs';
import React, { FC } from 'react';

interface IProps {
  defaultActiveKey: string;
  activeKey?: string;
  tabBarExtraContent?: React.ReactNode;
  items: any[];
  tabPlacement?: TabPlacement;
  title?: string;
  onChangeKey?: (key: string) => void;
  type?: 'line' | 'card' | 'editable-card';
  size?: 'small' | 'middle' | 'large';
  style?: any;
}

const Index: FC<IProps> = ({
  defaultActiveKey,
  tabPlacement = 'top',
  size = 'large',
  items,
  activeKey,
  tabBarExtraContent,
  title,
  onChangeKey,
  type,
  style,
}) => {
  return (
    <Tabs
      title={title}
      type={type || 'card'}
      size={size}
      onChange={(key: string) => {
        onChangeKey?.(key);
      }}
      style={{ ...style, overflow: 'hidden' }}
      activeKey={activeKey}
      tabPlacement={tabPlacement}
      defaultActiveKey={defaultActiveKey}
      items={items}
      tabBarExtraContent={tabBarExtraContent}
    />
  );
};
export default Index;
