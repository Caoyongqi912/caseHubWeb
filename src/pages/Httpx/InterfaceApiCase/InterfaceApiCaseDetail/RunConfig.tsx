import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import {
  EnvironmentOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  SettingFilled,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Radio, Select, Space, Switch, theme, Typography } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { FC, useEffect, useState } from 'react';

const { useToken } = theme;
const { Text, Title } = Typography;

interface Props {
  onMenuClick: (e: RadioChangeEvent) => void;
  currentProjectId?: number;
  onEnvChange: (value: number) => void;
  onErrorJumpChange: (value: boolean) => void;
  errorStop?: boolean;
  run: () => void;
}

const RunConfig: FC<Props> = ({
  onMenuClick,
  onErrorJumpChange,
  onEnvChange,
  currentProjectId,
  errorStop,
  run,
}) => {
  const { token } = useToken();
  const [apiEnvs, setApiEnvs] = useState<{ value: number; label: string }[]>(
    [],
  );

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
    <div style={{ padding: '12px', height: '100%' }}>
      {/* 标题 */}
      <ProCard
        style={{
          marginBottom: '12px',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Space>
          <ThunderboltOutlined
            style={{ fontSize: '20px', color: token.colorPrimary }}
          />
          <Title level={5} style={{ margin: 0 }}>
            运行配置
          </Title>
        </Space>
      </ProCard>

      {/* 运行方式选择 */}
      <ProCard
        title={
          <Space size={4}>
            <SettingFilled
              style={{ color: token.colorPrimary, fontSize: '14px' }}
            />
            <Text strong style={{ fontSize: '14px' }}>
              运行方式
            </Text>
          </Space>
        }
        style={{
          marginBottom: '12px',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <Radio.Group
          defaultValue={1}
          onChange={onMenuClick}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <Radio.Button
              value={1}
              style={{
                width: '100%',
                height: 'auto',
                padding: '12px 16px',
                borderRadius: token.borderRadiusSM,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Space style={{ width: '100%' }}>
                <RobotOutlined
                  style={{ fontSize: '18px', color: token.colorPrimary }}
                />
                <div>
                  <Text strong style={{ display: 'block', fontSize: '14px' }}>
                    后台执行
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    异步执行，不阻塞操作
                  </Text>
                </div>
              </Space>
            </Radio.Button>

            <Radio.Button
              value={2}
              style={{
                width: '100%',
                height: 'auto',
                padding: '12px 16px',
                borderRadius: token.borderRadiusSM,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Space style={{ width: '100%' }}>
                <MessageOutlined
                  style={{ fontSize: '18px', color: token.colorSuccess }}
                />
                <div>
                  <Text strong style={{ display: 'block', fontSize: '14px' }}>
                    实时日志
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    实时查看执行过程
                  </Text>
                </div>
              </Space>
            </Radio.Button>
          </Space>
        </Radio.Group>
      </ProCard>

      {/* 运行环境选择 */}
      <ProCard
        title={
          <Space size={4}>
            <EnvironmentOutlined
              style={{ color: token.colorPrimary, fontSize: '14px' }}
            />
            <Text strong style={{ fontSize: '14px' }}>
              运行环境
            </Text>
          </Space>
        }
        style={{
          marginBottom: '12px',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <Select
          placeholder="请选择运行环境"
          style={{ width: '100%' }}
          options={apiEnvs}
          onChange={onEnvChange}
          allowClear
          showSearch
          optionFilterProp="label"
          size="large"
          listHeight={200}
        />
        {apiEnvs.length === 0 && (
          <Text
            type="secondary"
            style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}
          >
            当前项目暂无可用环境
          </Text>
        )}
      </ProCard>

      {/* 错误处理设置 */}
      <ProCard
        title={
          <Space size={4}>
            <WarningOutlined
              style={{ color: token.colorWarning, fontSize: '14px' }}
            />
            <Text strong style={{ fontSize: '14px' }}>
              错误处理
            </Text>
          </Space>
        }
        style={{
          marginBottom: '12px',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            background: token.colorWarningBg,
            borderRadius: token.borderRadiusSM,
            border: `1px solid ${token.colorWarningBorder}`,
          }}
        >
          <div>
            <Text strong style={{ fontSize: '14px', display: 'block' }}>
              遇到错误继续
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              启用后不会中断执行
            </Text>
          </div>
          <Switch
            onChange={onErrorJumpChange}
            checked={errorStop}
            checkedChildren="停止"
            unCheckedChildren="继续"
            size="small"
          />
        </div>
      </ProCard>

      {/* 开始运行按钮 */}
      <Button
        type="primary"
        size="large"
        onClick={run}
        block
        style={{
          height: '48px',
          borderRadius: token.borderRadiusLG,
          fontSize: '15px',
          fontWeight: 600,
          boxShadow: token.boxShadowSecondary,
        }}
        icon={<PlayCircleOutlined style={{ fontSize: '18px' }} />}
      >
        开始运行
      </Button>
    </div>
  );
};

export default RunConfig;
