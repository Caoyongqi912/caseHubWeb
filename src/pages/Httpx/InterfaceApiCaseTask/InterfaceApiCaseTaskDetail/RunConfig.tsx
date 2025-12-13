import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import { EnvironmentOutlined, RocketOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Checkbox, CheckboxProps, Select, Typography } from 'antd';
import React, { FC, useEffect, useState } from 'react';

const { Text } = Typography;

const CheckboxGroup = Checkbox.Group;

interface SelfProps {
  currentProjectId?: string;
  onEnvChange: (value: number) => void;
  setRunningOption: (values: string[]) => void;
  runArea: React.ReactElement;
}

const plainOptions = ['API', 'CASE'];

const RunConfig: FC<SelfProps> = ({
  currentProjectId,
  setRunningOption,
  onEnvChange,
  runArea,
}) => {
  const [apiEnvs, setApiEnvs] = useState<{ value: number; label: string }[]>(
    [],
  );
  const [checkedList, setCheckedList] = useState<string[]>([]);

  useEffect(() => {
    if (currentProjectId) {
      queryEnvBy({ project_id: parseInt(currentProjectId) } as IEnv).then(
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

  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    setCheckedList(e.target.checked ? plainOptions : []);
    setRunningOption(e.target.checked ? plainOptions : []);
  };
  const onChange = (list: string[]) => {
    setCheckedList(list);
    setRunningOption(list);
  };
  return (
    <ProCard
      boxShadow
      style={{
        height: '100%',
        background: 'linear-gradient(135deg, #fafbff 0%, #f5f7ff 100%)',
      }}
      bodyStyle={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        borderRadius: '12px',
      }}
    >
      {/* 运行环境卡片 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
          border: '1px solid #e1e8ff',
          boxShadow: '0 2px 12px rgba(59, 130, 246, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <EnvironmentOutlined
            style={{
              color: '#3b82f6',
              fontSize: '18px',
            }}
          />
          <Text
            strong
            style={{
              fontSize: '16px',
              color: '#1e40af',
              margin: 0,
            }}
          >
            运行环境
          </Text>
        </div>
        <Select
          placeholder="请选择运行环境"
          style={{
            width: '100%',
            borderRadius: '8px',
          }}
          options={apiEnvs}
          onChange={onEnvChange}
          allowClear
          showSearch
          optionFilterProp="label"
          size="large"
        />
      </div>

      {/* 选择运行卡片 */}
      <div
        style={{
          borderRadius: '12px',
          border: '1px solid #e1e8ff',
          backgroundColor: '#fff',
          boxShadow: '0 2px 12px rgba(59, 130, 246, 0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderBottom: '1px solid #bae6fd',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RocketOutlined style={{ color: '#0ea5e9' }} />
              <Text
                strong
                style={{
                  fontSize: '16px',
                  color: '#0369a1',
                  margin: 0,
                }}
              >
                选择
              </Text>
            </div>
            <Checkbox
              indeterminate={
                checkedList.length > 0 &&
                checkedList.length < plainOptions.length
              }
              onChange={onCheckAllChange}
              checked={plainOptions.length === checkedList.length}
            >
              <Text
                style={{
                  fontWeight: 600,
                  color: '#0ea5e9',
                  fontSize: '14px',
                }}
              >
                ALL
              </Text>
            </Checkbox>
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #fafbff 0%, #f8faff 50%)',
          }}
        >
          <CheckboxGroup
            options={plainOptions}
            value={checkedList}
            onChange={onChange}
          />
        </div>
      </div>
      {/* 运行按钮 */}
      {runArea}
    </ProCard>
  );
};

export default RunConfig;
