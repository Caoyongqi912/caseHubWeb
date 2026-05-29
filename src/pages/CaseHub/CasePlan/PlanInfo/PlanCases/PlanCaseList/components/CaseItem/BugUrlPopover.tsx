import { LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, message, Popover, Tooltip } from 'antd';
import { useState } from 'react';

import { CaseSubStep } from '@/pages/CaseHub/types';

interface BugUrlInputProps {
  onConfirm: (value: string) => void;
  onClose: () => void;
}

/**
 * 缺陷链接输入组件
 * 内部独立管理输入状态，避免输入时触发父组件重渲染
 */
const BugUrlInput: React.FC<BugUrlInputProps> = ({ onConfirm, onClose }) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      message.warning('请输入缺陷链接');
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div style={{ width: 280 }}>
      <Input
        placeholder="请输入缺陷URL"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onPressEnter={handleConfirm}
        autoFocus
      />
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <Button size="small" onClick={onClose} style={{ marginRight: 8 }}>
          取消
        </Button>
        <Button type="primary" size="small" onClick={handleConfirm}>
          确认
        </Button>
      </div>
    </div>
  );
};

interface BugUrlPopoverProps {
  record: CaseSubStep;
  onConfirm: (bugUrl: string) => void;
}

/**
 * 缺陷链接 Popover 组件
 * 独立管理 popover 展开状态，避免影响父组件的 columns 重建
 */
const BugUrlPopover: React.FC<BugUrlPopoverProps> = ({ record, onConfirm }) => {
  const [open, setOpen] = useState(false);

  if (record.bug_url) {
    return (
      <Tooltip title={`跳转至: ${record.bug_url}`}>
        <a
          href={record.bug_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <LinkOutlined />
          <span
            style={{
              maxWidth: 80,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            BUG
          </span>
        </a>
      </Tooltip>
    );
  }

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      content={
        <BugUrlInput
          onConfirm={(value) => {
            onConfirm(value);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      }
    >
      <Button
        type="link"
        size="small"
        icon={<PlusOutlined />}
        onClick={(e) => e.stopPropagation()}
      >
        添加缺陷
      </Button>
    </Popover>
  );
};

export default BugUrlPopover;
