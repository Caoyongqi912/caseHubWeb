import {
  getPlayTaskResultById,
  queryPlayCaseReportByTaskId,
} from '@/api/play/playTask';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import { IUIResult } from '@/pages/Play/componets/uiTypes';
import PlayCaseResultDetail from '@/pages/Play/PlayResult/PlayCaseResultDetail';
import { CONFIG } from '@/utils/config';
import { history, useParams } from '@@/exports';
import { Pie } from '@ant-design/charts';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  FrownTwoTone,
  LikeTwoTone,
  SmileTwoTone,
} from '@ant-design/icons';
import {
  ActionType,
  ProCard,
  ProColumns,
  StatisticCard,
} from '@ant-design/pro-components';
import { Button, Col, Descriptions, Row, Spin, Tag } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import { useEffect, useRef, useState } from 'react';

const PlayTaskResult = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [currentDetailId, setCurrentDetailId] = useState<number>();
  const [openResult, setOpenResult] = useState(false);
  const [failOnly, setFailOnly] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [baseInfo, setBaseInfo] = useState<any>();
  const [caseResultSource, setCaseResultSource] = useState<any[]>([]);
  const [originalCaseResultSource, setOriginalCaseResultSource] = useState<
    any[]
  >([]);

  //查询基本、 查询用例结果
  useEffect(() => {
    if (resultId) {
      getPlayTaskResultById({ resultId: resultId }).then(
        async ({ code, data }) => {
          if (code === 0) {
            setLoading(false);
            setBaseInfo(data);
          }
        },
      );
      queryPlayCaseReportByTaskId({ resultId: resultId }).then(
        async ({ code, data }) => {
          if (code === 0) {
            setCaseResultSource(data);
            setOriginalCaseResultSource(data);
          }
        },
      );
    }
  }, [resultId]);

  useEffect(() => {
    if (failOnly) {
      const filteredResults = originalCaseResultSource.filter(
        (item) => item.result === 'FAIL',
      );
      setCaseResultSource(filteredResults);
    } else {
      //全部
      setCaseResultSource(originalCaseResultSource);
    }
  }, [failOnly]);

  const columns: ProColumns<IUIResult>[] = [
    {
      title: '用例名称',
      dataIndex: 'ui_case_name',
      valueType: 'text',
      fixed: 'left',
      width: '10%',
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              history.push(`/ui/case/detail/caseId=${record.ui_case_Id}`);
            }}
          >
            {record.ui_case_name}
          </a>
        );
      },
    },
    {
      title: '用例描述',
      dataIndex: 'ui_case_description',
      valueType: 'textarea',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '步长',
      dataIndex: 'ui_case_step_num',
      valueType: 'text',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '运行时间',
      dataIndex: 'start_time',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInSearch: true,
      valueEnum: CONFIG.UI_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.UI_STATUS_ENUM[record.status].tag;
      },
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      valueType: 'select',
      valueEnum: CONFIG.UI_RESULT_ENUM,
      render: (_, record) => {
        return CONFIG.UI_RESULT_ENUM[record.result]?.tag;
      },
    },
    {
      title: '执行人',
      dataIndex: 'starter_name',
      valueType: 'text',
    },
    {
      title: '操作',
      dataIndex: 'action',
      valueType: 'option',
      render: (_, record) => {
        if (record.status === 'DONE') {
          return (
            <a
              onClick={() => {
                setCurrentDetailId(record.id);
                setOpenResult(true);
              }}
            >
              详情
            </a>
          );
        }
      },
    },
  ];

  const PieData = [
    {
      type: '成功',
      value: baseInfo?.success_number,
    },
    {
      type: '失败',
      value: baseInfo?.fail_number,
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
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <ProCard split={'horizontal'}>
      <MyDrawer
        name={'测试详情'}
        open={openResult}
        width={'80%'}
        setOpen={setOpenResult}
      >
        <PlayCaseResultDetail resultId={currentDetailId} />
      </MyDrawer>
      <ProCard>
        <Spin tip={'努力加载中。。'} size={'large'} spinning={loading}>
          {baseInfo && (
            <ProCard title={`${baseInfo.task_name} 自动化测试报告`}>
              <Row gutter={[8, 8]}>
                <Col span={17}>
                  <Row gutter={8}>
                    <Col span={6}>
                      <ProCard hoverable bordered={false}>
                        <StatisticCard
                          statistic={{
                            title: '用例总数',
                            value: baseInfo.total_number,
                            prefix: <SmileTwoTone />,
                          }}
                        />
                      </ProCard>
                    </Col>
                    <Col span={6}>
                      <ProCard hoverable bordered={false}>
                        <StatisticCard
                          statistic={{
                            title: '成功数量',
                            value: baseInfo.success_number || 0,
                            prefix: (
                              <CheckCircleTwoTone twoToneColor="rgb(63, 205, 127)" />
                            ),
                          }}
                        />
                      </ProCard>
                    </Col>
                    <Col span={6}>
                      <ProCard
                        hoverable
                        bordered={false}
                        className={'statisticCard'}
                      >
                        <StatisticCard
                          statistic={{
                            title: '失败数量',
                            value: baseInfo.fail_number || 0,
                            prefix: (
                              <CloseCircleTwoTone twoToneColor="rgb(230, 98, 97)" />
                            ),
                          }}
                        />
                      </ProCard>
                    </Col>
                    <Col span={6}>
                      <ProCard
                        hoverable
                        bordered={false}
                        className={'statisticCard'}
                      >
                        <StatisticCard
                          statistic={{
                            title: '测试通过率',
                            value: baseInfo.rate_number
                              ? baseInfo.rate_number
                              : 0,
                            prefix:
                              baseInfo.rate_number > 90 ? (
                                <LikeTwoTone />
                              ) : (
                                <FrownTwoTone />
                              ),
                            suffix: '%',
                          }}
                        />
                      </ProCard>
                    </Col>
                  </Row>
                  <Descriptions style={{ marginTop: 10 }}>
                    <DescriptionsItem label="执行状态">
                      <Tag
                        color={baseInfo.status === 'RUNNING' ? 'blue' : 'green'}
                      >
                        {baseInfo.status}
                      </Tag>
                    </DescriptionsItem>
                    <DescriptionsItem label="执行人">
                      <Tag color={'orange'}>{baseInfo.starter_name}</Tag>
                    </DescriptionsItem>
                    <DescriptionsItem label="开始时间">
                      <Tag color={'processing'}>{baseInfo.start_time}</Tag>
                    </DescriptionsItem>
                    <DescriptionsItem label="结束时间">
                      <Tag color={'processing'}>{baseInfo.end_time}</Tag>
                    </DescriptionsItem>
                    <DescriptionsItem label="耗时">
                      <Tag color={'processing'}>{baseInfo.total_usetime}</Tag>
                    </DescriptionsItem>
                  </Descriptions>
                </Col>
                <Col span={7}>
                  <Pie {...PieConfig} />
                </Col>
              </Row>
            </ProCard>
          )}
        </Spin>
      </ProCard>
      <ProCard>
        <MyProTable
          search={false}
          actionRef={actionRef}
          x={1000}
          toolBarRender={() => [
            <Button
              type={failOnly ? 'primary' : 'default'}
              onClick={() => {
                setFailOnly(!failOnly);
              }}
            >
              只看失败
            </Button>,
          ]}
          dataSource={caseResultSource}
          columns={columns}
          rowKey={'id'}
        />
      </ProCard>
    </ProCard>
  );
};

export default PlayTaskResult;
