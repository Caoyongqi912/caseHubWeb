import { Tabs } from 'antd';
import React, { FC } from 'react';

interface IProps {
  defaultActiveKey: string;
  activeKey?: string;
  tabBarExtraContent?: React.ReactNode;
  items: any[];
  tabPosition?: 'top' | 'left';
  title?: string;
  onChangeKey?: (key: string) => void;
  type?: 'line' | 'card' | 'editable-card';
  size?: 'small' | 'middle' | 'large';
}

const Index: FC<IProps> = ({
  defaultActiveKey,
  tabPosition = 'top',
  size = 'large',
  items,
  activeKey,
  tabBarExtraContent,
  title,
  onChangeKey,
  type,
}) => {
  return (
    <Tabs
      title={title}
      type={type || 'card'}
      size={size}
      onChange={(key: string) => {
        onChangeKey?.(key);
      }}
      activeKey={activeKey}
      tabPosition={tabPosition}
      defaultActiveKey={defaultActiveKey}
      items={items}
      tabBarExtraContent={tabBarExtraContent}
    />
  );
};
export default Index;
