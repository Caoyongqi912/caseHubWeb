import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import {
  EnvironmentOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Flex, Radio, Select, Space, Switch, Typography } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

interface Props {
  onMenuClick: (e: RadioChangeEvent) => void;
  currentProjectId?: number;
  onEnvChange: (value: number) => void;
  onErrorJumpChange: (value: boolean) => void;
  run: () => void;
}

const RunConfig: FC<Props> = ({
  onMenuClick,
  onErrorJumpChange,
  onEnvChange,
  currentProjectId,
  run,
}) => {
  const [apiEnvs, setApiEnvs] = useState<{ value: number; label: string }[]>(
    [],
  );

  // 根据API 所属项目 查询 ENV Module
  useEffect(() => {
    if (currentProjectId) {
      queryEnvBy({ project_id: currentProjectId } as IEnv).then(
        async ({ code, data }) => {
          if (code === 0) {
            setApiEnvs(
              data.map((item: IEnv) => ({
                value: item.id,
                label: item.name,
              })),
            );
          }
        },
      );
    }
  }, [currentProjectId]);
  return (
    <ProCard
      boxShadow
      style={{
        height: '100%',
        width: '100%',
      }}
      bordered
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EnvironmentOutlined style={{ color: '#3b82f6' }} />
          <Text
            strong
            style={{
              fontSize: '16px',
              color: '#1e40af',
              margin: 0,
            }}
          >
            运行方式
          </Text>
        </div>
        <Radio.Group
          defaultValue={1}
          onChange={onMenuClick}
          options={[
            {
              label: (
                <Flex gap="small" justify="center" align="center" vertical>
                  <RobotOutlined style={{ fontSize: 18 }} />
                  后台执行
                </Flex>
              ),
              value: 1,
            },
            {
              label: (
                <Flex gap="small" justify="center" align="center" vertical>
                  <MessageOutlined style={{ fontSize: 18 }} />
                  实时日志
                </Flex>
              ),
              value: 2,
            },
          ]}
        />
      </>

      {/* 运行环境选择 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
          border: '1px solid #e1e8ff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EnvironmentOutlined style={{ color: '#3b82f6', fontSize: '16px' }} />
          <Text
            strong
            style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}
          >
            运行环境
          </Text>
        </div>
        <Select
          placeholder="请选择运行环境"
          style={{
            width: '100%',
            borderRadius: '6px',
          }}
          options={apiEnvs}
          onChange={onEnvChange}
          allowClear
          showSearch
          optionFilterProp="label"
          size="middle"
        />
      </div>
      {/* 错误处理设置 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
          border: '1px solid #e1e8ff',
          boxShadow: '0 1px 4px rgba(59, 130, 246, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <WarningOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Text strong style={{ color: '#1e40af', fontSize: '14px' }}>
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
          style={{
            background: '#cbd5e1',
          }}
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
  );
};

export default RunConfig;
