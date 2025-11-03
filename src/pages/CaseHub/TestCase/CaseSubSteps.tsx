import {
  copyTestCaseStep,
  handleAddTestCaseStep,
  queryTestCaseSupStep,
  removeTestCaseStep,
  reorderTestCaseStep,
  updateTestCase,
  updateTestCaseStep,
} from '@/api/case/testCase';
import { CaseSubStep } from '@/pages/CaseHub/type';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  DragSortTable,
  ProCard,
  ProColumns,
  ProForm,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Spin, Switch, Typography } from 'antd';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

const { Text } = Typography;

const caseInfoColumn: ProColumns<CaseSubStep>[] = [
  {
    title: '步骤',
    dataIndex: 'sort',
    width: '5%',
    editable: false,
  },
  {
    title: '操作步骤',
    dataIndex: 'action',
    valueType: 'textarea',
    ellipsis: true,
    fieldProps: {
      rows: 2,
      autoSize: { minRows: 2, maxRows: 10 },
      placeholder: '请输入操作步骤',
      allowClear: true,
      fontWeight: 'bold',
      variant: 'filled',
    },
  },
  {
    title: '预期结果',
    dataIndex: 'expected_result',
    valueType: 'textarea',
    ellipsis: true,
    fieldProps: {
      rows: 2,
      autoSize: { minRows: 2, maxRows: 10 },
      variant: 'filled',
      placeholder: '请输入预期结果',
      allowClear: true,
    },
  },
  {
    title: '操作',
    valueType: 'option',
    fixed: 'right',
    width: '8%',
  },
];

interface IProps {
  caseId?: number;
  case_status?: number;
  callback?: () => void;
  hiddenStatusBut?: boolean;
}

const CaseSubSteps: FC<IProps> = ({
  caseId,
  case_status,
  hiddenStatusBut = false,
  callback,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // 0 啥也每干 1 编辑 2 已保存
  const [editStatus, setEditStatus] = useState(0);
  const [caseSubStepDataSource, setCaseSubStepDataSource] = useState<
    CaseSubStep[]
  >([]);
  const [addLine, setAddLine] = useState(0);

  useEffect(() => {
    if (!caseId) return;
    queryTestCaseSupStep(caseId.toString()).then(async ({ code, data }) => {
      if (code === 0) {
        setCaseSubStepDataSource(data);
      }
    });
  }, [caseId, addLine]);

  // 使用 useCallback 来确保 handleDragSortEnd 不会在每次渲染时重新定义
  const handleDragSortEnd = useCallback(
    async (_: number, __: number, newDataSource: any) => {
      setCaseSubStepDataSource(newDataSource);
      const orderIds = newDataSource.map((item: CaseSubStep) => item.id);
      await reorderTestCaseStep({ stepIds: orderIds });
    },
    [caseSubStepDataSource],
  );

  const saveStep = async (data: CaseSubStep) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const { code } = await updateTestCaseStep(data);
      if (code === 0) {
        setEditStatus(2);
        // 2秒后恢复为初始状态
        setTimeout(() => {
          setEditStatus(0);
        }, 1500);
      }
    }, 3000);
  };

  // 行编辑进行3s后保存
  // const saveRecord = async (data: CaseSubStep[]) => {
  //   console.log('=====', data);
  //   // 如果定时器存在，先清除掉
  //   if (timerRef.current) clearTimeout(timerRef.current);
  //
  //   // 设置一个新的定时器，5秒后执行保存请求
  //   timerRef.current = setTimeout(async () => {
  //     setEditStatus(1);
  //
  //     // 使用 Promise.all 来并行处理多个保存请求
  //     const savePromises = data.map(async (item) => {
  //       const { code, msg } = await updateTestCaseStep(item);
  //       return { code, msg, item };
  //     });
  //
  //     const results = await Promise.all(savePromises);
  //
  //     // 检查所有保存结果
  //     const failedItems = results.filter((result) => result.code !== 0);
  //
  //     if (failedItems.length === 0) {
  //       setEditStatus(2);
  //       // 2秒后恢复为初始状态
  //       setTimeout(() => {
  //         setEditStatus(0);
  //       }, 1000);
  //     } else {
  //       setEditStatus(0);
  //     }
  //   }, 1500); // 3秒后执行保存
  // };

  useEffect(() => {
    if (caseSubStepDataSource) {
      setEditableRowKeys(
        caseSubStepDataSource.map((item: CaseSubStep) => item.uid),
      );
    }
  }, [caseSubStepDataSource]);

  const addSubStepLine = () => {
    // 如果当前是折叠状态，则展开
    if (caseId) {
      handleAddTestCaseStep({ caseId: caseId }).then(async ({ code }) => {
        if (code === 0) {
          setAddLine(addLine + 1);
        }
      });
    }
  };

  const StatusArea = (status: number) => {
    let statusText = null;
    switch (status) {
      case 0:
        statusText = null;
        break;
      case 2:
        statusText = <Text type={'secondary'}>已保存</Text>;
        break;
    }

    return (
      <Space>
        {status === 1 ? <Spin size="small" /> : null}
        {statusText}
      </Space>
    );
  };

  const onChange = async (checked: boolean) => {
    console.log(`switch to ${checked}`);
    if (!caseId) return;
    // @ts-ignore
    const { code } = await updateTestCase({
      id: caseId,
      case_status: checked ? 1 : 2,
    });
    if (code === 0) {
      callback?.();
    }
  };
  return (
    <ProCard
      actions={
        <Button onClick={addSubStepLine} type={'link'}>
          <PlusOutlined />
          步骤
        </Button>
      }
      title={
        !hiddenStatusBut && (
          <Space
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%',
            }}
          >
            <Switch
              checkedChildren={<CheckCircleTwoTone twoToneColor="#52c41a" />}
              unCheckedChildren={
                <CloseCircleTwoTone twoToneColor={'#f74649'} />
              }
              value={case_status === 1}
              onChange={onChange}
            />
            {/*<Button*/}
            {/*  type={'text'}*/}
            {/*  icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}*/}
            {/*  onClick={async () => {*/}
            {/*    if (caseId) {*/}
            {/*      // @ts-ignore*/}
            {/*      const { code } = await updateTestCase({*/}
            {/*        id: caseId,*/}
            {/*        case_status: 1,*/}
            {/*      });*/}
            {/*      if (code === 0) {*/}
            {/*        callback();*/}
            {/*      }*/}
            {/*    }*/}
            {/*  }}*/}
            {/*/>*/}
            {/*<Button*/}
            {/*  icon={<CloseCircleTwoTone twoToneColor={'#f74649'} />}*/}
            {/*  type={'text'}*/}
            {/*  onClick={async () => {*/}
            {/*    if (caseId) {*/}
            {/*      // @ts-ignore*/}
            {/*      const { code } = await updateTestCase({*/}
            {/*        id: caseId,*/}
            {/*        case_status: 2,*/}
            {/*      });*/}
            {/*      if (code === 0) {*/}
            {/*        callback();*/}
            {/*      }*/}
            {/*    }*/}
            {/*  }}*/}
            {/*/>*/}
          </Space>
        )
      }
    >
      <ProFormTextArea
        name={'case_setup'}
        placeholder={'请输入用例前置'}
        fieldProps={{
          variant: 'filled',
          rows: 3,
        }}
      />
      <ProForm.Item name={'case_sub_step'}>
        <DragSortTable<CaseSubStep>
          columns={caseInfoColumn}
          rowKey="uid"
          search={false}
          pagination={false}
          toolBarRender={false}
          dataSource={caseSubStepDataSource}
          dragSortKey="sort"
          onDragSortEnd={handleDragSortEnd}
          dragSortHandlerRender={() => (
            <MenuOutlined style={{ cursor: 'grab', color: 'gold' }} />
          )}
          editable={{
            type: 'multiple',
            editableKeys,
            // @ts-ignore
            actionRender: (row, _, __) => {
              return (
                <>
                  {row.id && (
                    <Space>
                      <a
                        onClick={async () => {
                          const { code } = await copyTestCaseStep({
                            stepId: row.id,
                          });
                          if (code === 0) {
                            setAddLine(addLine + 1);
                          }
                        }}
                      >
                        复制
                      </a>
                      <Popconfirm
                        title="用例删除"
                        description="未存到用例库将彻底删除"
                        onConfirm={async () => {
                          const { code } = await removeTestCaseStep({
                            stepId: row.id,
                          });
                          if (code === 0) {
                            setAddLine(addLine + 1);
                          }
                        }}
                        okText="是"
                        cancelText="否"
                      >
                        <a>删除</a>
                      </Popconfirm>
                    </Space>
                  )}
                </>
              );
            },
            onValuesChange: async (
              step: CaseSubStep,
              records: CaseSubStep[],
            ) => {
              console.log('_===', step);
              console.log('records===', records);
              await saveStep(step);
              // const modifiedRecords = records.filter((r) => {
              //   // 比较原始记录和修改后的记录，
              //   const originalRecord = caseSubStepDataSource?.find(
              //     (data) => data.id === r.id,
              //   );
              //   return (
              //     r.action !== originalRecord?.action ||
              //     r.expected_result !== originalRecord?.expected_result
              //   );
              // });
              // if (modifiedRecords.length > 0) {
              //   await saveRecord(records); // 只提交修改过的记录
              // }
            },
            onChange: setEditableRowKeys,
          }}
        />
      </ProForm.Item>
      <ProFormTextArea
        name={'case_mark'}
        placeholder={'请输入备注'}
        fieldProps={{
          variant: 'filled',
          rows: 3,
        }}
      />
      {StatusArea(editStatus)}
    </ProCard>
  );
};

export default CaseSubSteps;
