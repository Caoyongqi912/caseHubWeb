import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import {
  EnvironmentOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  SettingFilled,
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
  /**
   * 运行配置组件
   * 提供运行环境选择、运行方式配置和错误处理设置
   */
  return (
    <ProCard
      style={{
        height: '100%',
        width: '100%',
      }}
      bodyStyle={{
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
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
          <Space direction={'vertical'}>
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
          </Space>
        </ProCard>
      </>

      {/* 运行环境选择 */}
      <ProCard
        bordered
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          padding: 16,
        }}
      >
        <Space direction={'vertical'}>
          {/* 运行环境标题 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EnvironmentOutlined
              style={{ color: '#3b82f6', fontSize: '16px' }}
            />
            <Text strong style={{ fontSize: '14px', margin: 0 }}>
              运行环境
            </Text>
          </div>
          {/* 运行环境选择器 */}
          <Select
            placeholder="请选择运行环境"
            style={{
              width: 'auto',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e1e8ff',
              transition: 'all 0.3s ease',
            }}
            options={apiEnvs}
            onChange={onEnvChange}
            allowClear
            showSearch
            optionFilterProp="label"
            size="large"
          />
        </Space>
      </ProCard>
      {/* 错误处理设置 */}
      <ProCard
        bordered={true}
        bodyStyle={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* 错误处理标题和说明 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <WarningOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
        {/* 错误处理开关 */}
        <Switch
          onChange={onErrorJumpChange}
          defaultChecked={false}
          checkedChildren="开"
          unCheckedChildren="关"
          style={{
            borderRadius: 16,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
          }}
        />
      </ProCard>
      {/* 开始运行按钮 */}
      <Button
        type="primary"
        size="large"
        onClick={run}
        style={{
          height: '48px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          fontSize: '16px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
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
