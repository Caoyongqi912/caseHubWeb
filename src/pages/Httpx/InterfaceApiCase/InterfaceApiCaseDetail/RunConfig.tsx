import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import {
  MessageOutlined,
  PlayCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Flex,
  Radio,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
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
      <Text strong style={{ fontSize: '14px', marginBottom: '4px' }}>
        运行方式
      </Text>
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
      ></Radio.Group>
      {/* 运行环境选择 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Text strong>运行环境</Text>
        <Select
          placeholder="选择运行环境"
          style={{
            width: '100%',
            borderRadius: '8px',
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
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Text strong>遇到错误继续</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            启用后遇到错误不会中断执行
          </Text>
        </div>
        <Switch
          onChange={onErrorJumpChange}
          defaultChecked={false}
          checkedChildren="开"
          unCheckedChildren="关"
        />
      </div>
      <Divider />
      <Button type="primary" size={'large'} onClick={run}>
        <Space>
          <PlayCircleOutlined />
          <span style={{ fontWeight: 500 }}>Run</span>
        </Space>
      </Button>
    </ProCard>
  );
};

export default RunConfig;
