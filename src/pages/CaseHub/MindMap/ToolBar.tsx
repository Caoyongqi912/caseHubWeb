import { exportAsJson } from '@/pages/CaseHub/MindMap/utils';
import { AddOne, DeleteOne, Download, Refresh, Save } from '@icon-park/react';
import { Button, Divider, message, Space, Tooltip } from 'antd';
import React, { FC } from 'react';

interface Props {
  mind: React.MutableRefObject<any>;
}

const ToolBar: FC<Props> = (props) => {
  const { mind } = props;

  /**
   * 添加子node
   */
  const handleAddChild = () => {
    if (!mind.current) return;
    console.log('handleAddChild', mind.current);
    try {
      mind.current.addChild();
    } catch (e) {
      console.error('Error adding child:', e);
    }
  };
  /**
   * 添加兄弟node
   */
  const handleAddSibling = async () => {
    if (!mind.current) return;
    try {
      await mind.current.insertSibling('after');
    } catch (error) {
      console.error('Error adding sibling:', error);
    }
  };

  /**
   * 删除node
   */
  const handleDeleteNode = async () => {
    if (!mind.current) return;
    try {
      await mind.current.removeNode();
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };

  const handleReset = () => {
    mind?.current.scale(1);
    mind?.current.toCenter();
  };

  const handleExport = async () => {
    try {
      exportAsJson(mind?.current.getData(), 'mindmap.json');
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: 16,
        transform: 'none',
        zIndex: 1000,
        padding: '6px 12px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <Space size={4}>
        <Tooltip title="添加子节点 (Tab)">
          <Button
            type="text"
            size="small"
            icon={<AddOne theme="outline" size="18" />}
            onClick={handleAddChild}
          />
        </Tooltip>
        <Tooltip title="添加同级节点 (Enter)">
          <Button
            type="text"
            size="small"
            icon={
              <AddOne
                theme="outline"
                size="18"
                style={{ transform: 'rotate(90deg)' }}
              />
            }
            onClick={handleAddSibling}
          />
        </Tooltip>
        <Tooltip title="删除节点 (Delete)">
          <Button
            type="text"
            size="small"
            icon={<DeleteOne theme="outline" size="18" />}
            onClick={handleDeleteNode}
          />
        </Tooltip>
        <Divider type="vertical" style={{ margin: '0 4px' }} />
        <Tooltip title="重置视图">
          <Button
            type="text"
            size="small"
            icon={<Refresh theme="outline" size="18" />}
            onClick={handleReset}
          />
        </Tooltip>
        <Divider type="vertical" style={{ margin: '0 4px' }} />
        <Button
          type="text"
          size="small"
          onClick={handleExport}
          icon={<Download theme="outline" size="18" />}
        />
        <Tooltip title="保存">
          <Button
            type="text"
            size="small"
            icon={<Save theme="outline" size="18" />}
            onClick={() => console.log(mind?.current.getData())}
          />
        </Tooltip>
      </Space>
    </div>
  );
};

export default ToolBar;
