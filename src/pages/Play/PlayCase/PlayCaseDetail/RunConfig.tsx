import {
  MessageOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  SettingFilled,
  WarningOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Flex, Radio, Space, Switch, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;
const RunConfig: FC<{
  onMenuClick: (e: any) => void;
  onErrorJumpChange: (e: any) => void;
  run: () => void;
}> = ({ onMenuClick, onErrorJumpChange, run }) => {
  return (
    <div>
      <ProCard
        style={{
          height: '100%',
          width: '100%',
        }}
        bodyStyle={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderRadius: '12px',
        }}
      >
        {/* 运行方式选择 */}
        <>
          <ProCard
            bordered
            style={{
              display: 'flex',
              gap: '8px',
              borderRadius: '8px',
              border: '1px solid #e1e8ff',
            }}
          >
            <Space style={{ marginBottom: 20 }}>
              <SettingFilled style={{ color: '#3b82f6' }} />
              <Text strong style={{ fontSize: '14px', margin: 0 }}>
                运行方式
              </Text>
            </Space>
            <Radio.Group
              defaultValue={1}
              onChange={onMenuClick}
              options={[
                {
                  label: (
                    // @ts-ignore
                    <Flex gap="small" justify="center" align="center">
                      <RobotOutlined style={{ fontSize: 18 }} />
                      后台执行
                    </Flex>
                  ),
                  value: 1,
                },
                {
                  label: (
                    // @ts-ignore
                    <Flex gap="small" justify="center" align="center">
                      <MessageOutlined style={{ fontSize: 18 }} />
                      实时日志
                    </Flex>
                  ),
                  value: 2,
                },
              ]}
            />
          </ProCard>
        </>

        {/* 错误处理设置 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e1e8ff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <WarningOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <Text strong style={{ fontSize: '14px' }}>
                遇到错误继续
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: '12px', color: '#64748b' }}
              >
                启用后遇到错误不会中断执行
              </Text>
            </div>
          </div>
          <Switch
            onChange={onErrorJumpChange}
            defaultChecked={false}
            checkedChildren="开"
            unCheckedChildren="关"
          />
        </div>
        <Button
          type="primary"
          size="large"
          onClick={run}
          style={{
            height: '48px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            fontSize: '16px',
            fontWeight: 600,
            marginTop: '8px',
          }}
        >
          <Space>
            <PlayCircleOutlined style={{ fontSize: '18px' }} />
            <span style={{ fontWeight: 600 }}>开始运行</span>
          </Space>
        </Button>
      </ProCard>
    </div>
  );
};

export default RunConfig;
