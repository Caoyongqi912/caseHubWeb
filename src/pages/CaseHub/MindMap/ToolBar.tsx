import { exportAsJson } from '@/pages/CaseHub/MindMap/utils';
import { AddOne, DeleteOne, Download, Refresh, Save } from '@icon-park/react';
import { Button, Divider, message, Space, Tooltip } from 'antd';
import React, { FC } from 'react';

interface Props {
  mind: React.MutableRefObject<any>;
  saveMap: () => Promise<void>;
}

const ToolBar: FC<Props> = (props) => {
  const { mind, saveMap } = props;

  /**
   * 添加子node
   */
  const handleAddChild = () => {
    if (!mind.current) {
      message.warning('脑图未初始化');
      return;
    }
    try {
      const currentNode = mind.current.currentNode;
      if (!currentNode) {
        message.warning('请先选择一个节点');
        return;
      }
      mind.current.addChild();
      message.success('添加子节点成功');
    } catch (e) {
      console.error('Error adding child:', e);
      message.error('添加子节点失败');
    }
  };

  /**
   * 添加兄弟node
   */
  const handleAddSibling = async () => {
    if (!mind.current) {
      message.warning('脑图未初始化');
      return;
    }
    try {
      const currentNode = mind.current.currentNode;
      if (!currentNode) {
        message.warning('请先选择一个节点');
        return;
      }
      if (currentNode.root) {
        message.warning('根节点不能添加同级节点');
        return;
      }
      await mind.current.insertSibling('after');
      message.success('添加同级节点成功');
    } catch (error) {
      console.error('Error adding sibling:', error);
      message.error('添加同级节点失败');
    }
  };

  /**
   * 删除node
   */
  const handleDeleteNode = async () => {
    if (!mind.current) {
      message.warning('脑图未初始化');
      return;
    }
    try {
      const currentNode = mind.current.currentNode;
      if (!currentNode) {
        message.warning('请先选择一个节点');
        return;
      }
      if (currentNode.root) {
        message.warning('根节点不能删除');
        return;
      }
      await mind.current.removeNode();
      message.success('删除节点成功');
    } catch (error) {
      console.error('Error deleting node:', error);
      message.error('删除节点失败');
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
    <div>
      <Space.Compact block>
        <Tooltip title="添加子节点 (Tab)">
          <Button
            type="primary"
            size="large"
            icon={<AddOne theme="outline" size="18" />}
            onClick={handleAddChild}
          />
        </Tooltip>
        <Tooltip title="添加同级节点 (Enter)">
          <Button
            type="primary"
            size="large"
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
            type="primary"
            size="large"
            icon={<DeleteOne theme="outline" size="18" />}
            onClick={handleDeleteNode}
          />
        </Tooltip>
        <Divider type="vertical" style={{ margin: '0 4px' }} />
        <Tooltip title="重置视图">
          <Button
            type="primary"
            size="large"
            icon={<Refresh theme="outline" size="18" />}
            onClick={handleReset}
          />
        </Tooltip>
        <Divider type="vertical" style={{ margin: '0 4px' }} />
        <Tooltip title="导出JSON">
          <Button
            type="primary"
            size="large"
            onClick={handleExport}
            icon={<Download theme="outline" size="18" />}
          />
        </Tooltip>
        <Tooltip title="保存">
          <Button
            type="primary"
            size="large"
            icon={<Save theme="outline" size="18" />}
            onClick={async () => {
              console.log(mind?.current.getData());
              await saveMap();
            }}
          />
        </Tooltip>
      </Space.Compact>
    </div>
  );
};

export default ToolBar;
