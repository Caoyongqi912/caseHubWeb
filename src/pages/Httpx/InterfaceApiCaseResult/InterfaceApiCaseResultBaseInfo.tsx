import { IInterfaceCaseResult } from '@/pages/Httpx/types';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { FC } from 'react';

interface SelfProps {
  caseResultInfo?: IInterfaceCaseResult;
}

const InterfaceApiCaseResultBaseInfo: FC<SelfProps> = ({ caseResultInfo }) => {
  return (
    <ProDescriptions column={2} bordered style={{ marginTop: 10 }}>
      <ProDescriptions.Item
        span={2}
        label={'用例名称'}
        valueType="text"
        contentStyle={{
          maxWidth: '80%',
        }}
      >
        {caseResultInfo?.interfaceCaseName +
          `【${caseResultInfo?.interfaceCaseUid}】`}
      </ProDescriptions.Item>
      <ProDescriptions.Item
        span={2}
        label={'结果ID'}
        valueType="text"
        contentStyle={{
          maxWidth: '80%',
        }}
        ellipsis
      >
        {caseResultInfo?.uid}
      </ProDescriptions.Item>
      <ProDescriptions.Item span={2} valueType="textarea" label={'用例描述'}>
        {caseResultInfo?.interfaceCaseDesc}
      </ProDescriptions.Item>

      <ProDescriptions.Item valueType="text" span={2} label={'执行人'}>
        {caseResultInfo?.starterName}
      </ProDescriptions.Item>
      <ProDescriptions.Item valueType="text" span={2} label={'运行环境'}>
        {caseResultInfo?.running_env_name}
      </ProDescriptions.Item>
      <ProDescriptions.Item valueType="text" label={'执行开始时间'}>
        {caseResultInfo?.startTime}
      </ProDescriptions.Item>
      <ProDescriptions.Item valueType="text" label={'总用时'}>
        {caseResultInfo?.useTime}
      </ProDescriptions.Item>
      <ProDescriptions.Item label={'总步长'}>
        {caseResultInfo?.total_num}
      </ProDescriptions.Item>
      {/*<ProDescriptions.Item label={'错误步骤'}>*/}
      {/*  <Tag color={'red'}>{caseResultInfo?.interfaceErrorStep || ''}</Tag>*/}
      {/*</ProDescriptions.Item>*/}
      <ProDescriptions.Item label="测试结果" span={2}>
        <Tag color={caseResultInfo?.result === 'SUCCESS' ? 'green' : 'red'}>
          {caseResultInfo?.result}
        </Tag>
      </ProDescriptions.Item>
    </ProDescriptions>
  );
};

export default InterfaceApiCaseResultBaseInfo;
