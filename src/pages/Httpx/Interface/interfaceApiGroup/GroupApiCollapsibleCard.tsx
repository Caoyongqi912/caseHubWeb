import { removeInterfaceGroupApis } from '@/api/inter/interGroup';
import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import {
  ApiOutlined,
  DeleteOutlined,
  GlobalOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { message, Tooltip, Typography } from 'antd';
import React, { FC, useState } from 'react';

const { Text } = Typography;

interface SelfProps {
  step: number;
  groupId: number;
  interfaceApiInfo: IInterfaceAPI;
  callback: () => void;
}

const METHOD_TAG: Record<string, { bg: string; color: string }> = {
  GET: { bg: '#d4edda', color: '#155724' },
  POST: { bg: '#fff3cd', color: '#856404' },
  PUT: { bg: '#cce5ff', color: '#004085' },
  DELETE: { bg: '#f8d7da', color: '#721c24' },
  PATCH: { bg: '#e2d5f3', color: '#6f42c1' },
};

const GroupApiCollapsibleCard: FC<SelfProps> = ({
  step,
  interfaceApiInfo,
  groupId,
  callback,
}) => {
  const [showAPIDetail, setShowAPIDetail] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const method = interfaceApiInfo?.interface_method?.toUpperCase() || 'GET';
  const methodStyle = METHOD_TAG[method] || { bg: '#f0f0f0', color: '#595959' };
  const isPublic = interfaceApiInfo?.is_common === 1;

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    try {
      const { code, msg } = await removeInterfaceGroupApis({
        group_id: groupId,
        interface_id: interfaceApiInfo?.id,
      });
      if (code === 0) {
        callback?.();
        message.success('已解除关联');
      } else {
        message.error(msg || '解除失败');
      }
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setShowAPIDetail(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 40,
          padding: '0 12px',
          marginBottom: 6,
          borderRadius: 6,
          border: `1px solid ${isHovered ? '#1890ff' : '#e8e8e8'}`,
          backgroundColor: '#fff',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isHovered
            ? '0 2px 8px rgba(24, 144, 255, 0.1)'
            : '0 1px 2px rgba(0, 0, 0, 0.02)',
          transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 10,
              fontFamily: '"SF Mono", "Fira Code", monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {step}
          </div>

          <span
            style={{
              padding: '1px 6px',
              borderRadius: 3,
              fontSize: 10,
              fontWeight: 600,
              backgroundColor: methodStyle.bg,
              color: methodStyle.color,
              flexShrink: 0,
            }}
          >
            {method}
          </span>

          <Text
            strong
            style={{
              fontSize: 13,
              color: '#262626',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {interfaceApiInfo?.interface_name}
          </Text>

          <Tooltip title={isPublic ? '公共接口' : '私有接口'}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                color: isPublic ? '#52c41a' : '#bfbfbf',
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {isPublic ? <GlobalOutlined /> : <LockOutlined />}
            </span>
          </Tooltip>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="查看详情">
            <button
              onClick={() => setShowAPIDetail(true)}
              style={{
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                borderRadius: 4,
                backgroundColor: isHovered ? '#e6f7ff' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                color: isHovered ? '#1890ff' : '#bfbfbf',
              }}
            >
              <ApiOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>
          <Tooltip title="解除关联">
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              style={{
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                borderRadius: 4,
                backgroundColor: isHovered ? '#fff1f0' : 'transparent',
                cursor: isRemoving ? 'wait' : 'pointer',
                transition: 'all 0.15s ease',
                color: isHovered ? '#ff4d4f' : '#bfbfbf',
              }}
            >
              <DeleteOutlined style={{ fontSize: 13 }} spin={isRemoving} />
            </button>
          </Tooltip>
        </div>
      </div>

      <MyDrawer
        width={'75%'}
        name={interfaceApiInfo?.interface_name}
        open={showAPIDetail}
        setOpen={setShowAPIDetail}
      >
        <InterfaceApiDetail
          interfaceId={interfaceApiInfo?.id}
          callback={() => {}}
        />
      </MyDrawer>
    </>
  );
};

export default GroupApiCollapsibleCard;
