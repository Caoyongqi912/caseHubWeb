import { getInterTaskResultDetail } from '@/api/inter/interTask';
import MyTabs from '@/components/MyTabs';
import InterfaceApiCaseResultTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultTable';
import InterfaceApiResultTable from '@/pages/Httpx/InterfaceApiTaskResult/InterfaceApiResultTable';
import { IInterfaceTaskResult } from '@/pages/Httpx/types';
import { Pie } from '@ant-design/charts';
import {
  ApiOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  FrownTwoTone,
  LikeTwoTone,
  SlidersOutlined,
  SmileTwoTone,
} from '@ant-design/icons';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Col, Descriptions, Row, Tag } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'umi';

const InterfaceApiTaskResultDetail: FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [interfaceTaskResultInfo, setInterfaceTaskResultInfo] =
    useState<IInterfaceTaskResult>();
  const [rateNumber, setRateNumber] = useState(0);
  useEffect(() => {
    if (resultId) {
      getInterTaskResultDetail(resultId).then(async ({ code, data }) => {
        if (code === 0) {
          setInterfaceTaskResultInfo(data);
          const r = Math.trunc(
            (data.success_num / (data.fail_num + data.success_num)) * 100,
          );
          setRateNumber(r);
        }
      });
    }
  }, [resultId]);
  const PieData = [
    {
      type: '成功',
      value: interfaceTaskResultInfo?.success_num,
    },
    {
      type: '失败',
      value: interfaceTaskResultInfo?.fail_num,
    },
  ];
  const PieConfig = {
    height: 230,
    appendPadding: 10,
    data: PieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
    },
    color: ['#52c41a', '#ff4d4f'], // 成功-绿色，失败-红色

    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const TabsItem = [
    {
      label: '业务流用例结果',
      key: '1',
      icon: <SlidersOutlined />,
      children: <InterfaceApiCaseResultTable taskResultId={resultId} />,
    },
    {
      label: '单接口用例结果',
      key: '2',
      icon: <ApiOutlined />,
      children: <InterfaceApiResultTable taskResultId={resultId} />,
    },
  ];
  return (
    <ProCard split={'horizontal'}>
      <ProCard title={'测试报告'} variant={'outlined'} hoverable>
        <Row gutter={[8, 8]}>
          <Col span={17}>
            <Row gutter={8}>
              <Col span={6}>
                <ProCard hoverable variant={'borderless'}>
                  <StatisticCard
                    statistic={{
                      title: '用例总数',
                      value: interfaceTaskResultInfo?.total_num,
                      prefix: <SmileTwoTone />,
                    }}
                  />
                </ProCard>
              </Col>
              <Col span={6}>
                <ProCard hoverable variant={'borderless'}>
                  <StatisticCard
                    statistic={{
                      title: '成功数量',
                      value: interfaceTaskResultInfo?.success_num,
                      prefix: (
                        <CheckCircleTwoTone twoToneColor="rgb(63, 205, 127)" />
                      ),
                    }}
                  />
                </ProCard>
              </Col>
              <Col span={6}>
                <ProCard hoverable variant={'borderless'}>
                  <StatisticCard
                    statistic={{
                      title: '失败数量',
                      value: interfaceTaskResultInfo?.fail_num,
                      prefix: (
                        <CloseCircleTwoTone twoToneColor="rgb(230, 98, 97)" />
                      ),
                    }}
                  />
                </ProCard>
              </Col>
              <Col span={6}>
                <ProCard hoverable variant={'borderless'}>
                  <StatisticCard
                    statistic={{
                      title: '测试通过率',
                      value: rateNumber ? rateNumber : 0,
                      prefix:
                        rateNumber > 90 ? <LikeTwoTone /> : <FrownTwoTone />,
                      suffix: '%',
                    }}
                  />
                </ProCard>
              </Col>
            </Row>
            <Descriptions style={{ marginTop: 10 }}>
              <Descriptions.Item label="执行状态">
                <Tag
                  color={
                    interfaceTaskResultInfo?.status === 'RUNNING'
                      ? 'blue'
                      : 'green'
                  }
                >
                  {interfaceTaskResultInfo?.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="运行环境">
                <Tag color={'orange'}>
                  {interfaceTaskResultInfo?.running_env_name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="执行人">
                <Tag color={'orange'}>
                  {interfaceTaskResultInfo?.starter_name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">
                <Tag color={'processing'}>
                  {interfaceTaskResultInfo?.create_time}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="结束时间">
                <Tag color={'processing'}>
                  {interfaceTaskResultInfo?.end_time}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="耗时">
                <Tag color={'processing'}>
                  {interfaceTaskResultInfo?.total_use_time}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={7}>
            <Pie {...PieConfig} />
          </Col>
        </Row>
      </ProCard>
      <ProCard
        variant={'outlined'}
        hoverable
        style={{ overflow: 'hidden' }}
        styles={{ body: { padding: 10 } }}
      >
        <MyTabs defaultActiveKey={'1'} items={TabsItem} />
      </ProCard>
    </ProCard>
  );
};

export default InterfaceApiTaskResultDetail;
