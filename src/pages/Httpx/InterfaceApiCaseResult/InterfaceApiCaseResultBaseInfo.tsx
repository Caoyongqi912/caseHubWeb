import { IInterfaceCaseResult } from '@/pages/Httpx/types';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  IdcardOutlined,
  StepForwardOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface SelfProps {
  caseResultInfo?: IInterfaceCaseResult;
}

// 使用memo优化性能，避免不必要的重渲染
const InterfaceApiCaseResultBaseInfo: FC<SelfProps> = ({ caseResultInfo }) => {
  // 空值处理
  if (!caseResultInfo) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
        暂无用例结果信息
      </div>
    );
  }

  return (
    <ProDescriptions
      column={2}
      bordered
      style={{ marginTop: 10 }}
      size="middle"
      layout="horizontal"
    >
      {/* 用例名称 - 突出显示 */}
      <ProDescriptions.Item
        span={2}
        label={
          <Space>
            <FileTextOutlined /> 用例名称
          </Space>
        }
        valueType="text"
        contentStyle={{
          maxWidth: '100%',
          fontWeight: 500,
          color: '#1890ff',
        }}
      >
        <Text ellipsis={{ tooltip: true }}>
          {caseResultInfo.interfaceCaseName}
          <Text type="secondary" style={{ marginLeft: 8 }}>
            【{caseResultInfo.interfaceCaseUid}】
          </Text>
        </Text>
      </ProDescriptions.Item>

      {/* 结果ID */}
      <ProDescriptions.Item
        span={2}
        label={
          <Space>
            <IdcardOutlined /> 结果ID
          </Space>
        }
        valueType="text"
        contentStyle={{
          maxWidth: '100%',
          fontFamily: 'monospace',
        }}
        ellipsis={{ showTitle: true }}
      >
        {caseResultInfo.uid}
      </ProDescriptions.Item>

      {/* 用例描述 */}
      <ProDescriptions.Item
        span={2}
        label={
          <Space>
            <FileTextOutlined /> 用例描述
          </Space>
        }
        valueType="textarea"
        contentStyle={{
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}
      >
        {caseResultInfo.interfaceCaseDesc || (
          <Text type="secondary">无描述</Text>
        )}
      </ProDescriptions.Item>

      {/* 执行人 */}
      <ProDescriptions.Item
        valueType="text"
        span={1}
        label={
          <Space>
            <UserOutlined /> 执行人
          </Space>
        }
      >
        {caseResultInfo.starterName || <Text type="secondary">未知</Text>}
      </ProDescriptions.Item>

      {/* 运行环境 */}
      <ProDescriptions.Item
        valueType="text"
        span={1}
        label={
          <Space>
            <EnvironmentOutlined /> 运行环境
          </Space>
        }
      >
        {caseResultInfo.running_env_name || (
          <Text type="secondary">未配置</Text>
        )}
      </ProDescriptions.Item>

      {/* 执行开始时间 */}
      <ProDescriptions.Item
        valueType="text"
        span={1}
        label={
          <Space>
            <ClockCircleOutlined /> 开始时间
          </Space>
        }
      >
        {caseResultInfo.startTime || <Text type="secondary">未记录</Text>}
      </ProDescriptions.Item>

      {/* 总用时 */}
      <ProDescriptions.Item
        valueType="text"
        span={1}
        label={
          <Space>
            <FieldTimeOutlined />
            总用时
          </Space>
        }
      >
        {caseResultInfo.useTime ? (
          `${caseResultInfo.useTime} ms`
        ) : (
          <Text type="secondary">未统计</Text>
        )}
      </ProDescriptions.Item>

      {/* 总步长 */}
      <ProDescriptions.Item
        span={1}
        label={
          <Space>
            <StepForwardOutlined /> 总步长
          </Space>
        }
      >
        {caseResultInfo.total_num || 0}
      </ProDescriptions.Item>

      {/* 测试结果 - 重点突出 */}
      <ProDescriptions.Item
        label={
          <Space>
            <CheckCircleOutlined /> 测试结果
          </Space>
        }
        span={1}
      >
        <Tag
          color={
            caseResultInfo.result === 'SUCCESS'
              ? 'green-inverse'
              : 'red-inverse'
          }
        >
          {caseResultInfo.result}
        </Tag>
      </ProDescriptions.Item>
    </ProDescriptions>
  );
};

export default InterfaceApiCaseResultBaseInfo;
