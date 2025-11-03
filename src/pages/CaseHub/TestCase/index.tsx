import {
  copyTestCase,
  removeTestCase,
  saveTestCase,
  updateTestCase,
} from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import CaseLevelSelect from '@/pages/CaseHub/component/CaseLevelSelect';
import CaseTagSelect from '@/pages/CaseHub/component/CaseTagSelect';
import CaseTypeSelect from '@/pages/CaseHub/component/CaseTypeSelect';
import CaseSubSteps from '@/pages/CaseHub/TestCase/CaseSubSteps';
import DynamicInfo from '@/pages/CaseHub/TestCase/DynamicInfo';
import { ITestCase } from '@/pages/CaseHub/type';
import {
  CopyOutlined,
  DeleteOutlined,
  MessageOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { ProCard, ProForm, ProFormText } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Checkbox,
  Dropdown,
  Form,
  MenuProps,
  message,
  Space,
  Tag,
} from 'antd';
import React, { FC, useEffect, useState } from 'react';

interface Props {
  top: any;
  reqId?: string;
  tags?: { label: string; value: string }[];
  setTags: React.Dispatch<
    React.SetStateAction<{ label: string; value: string }[]>
  >;
  selectedCase: number[];
  testcaseData: ITestCase;
  setSelectedCase: React.Dispatch<React.SetStateAction<number[]>>;
  callback: () => void;
  collapsible: boolean;
}

const Index: FC<Props> = (props) => {
  const {
    top,
    callback,
    selectedCase,
    setSelectedCase,
    testcaseData,
    reqId,
    tags,
    setTags,
  } = props;
  let timeout: NodeJS.Timeout | null = null;
  const [form] = Form.useForm<ITestCase>();
  const [openDynamic, setOpenDynamic] = useState(false);
  const { CASE_STATUS_TEXT_ENUM, CASE_STATUS_COLOR_ENUM } = CaseHubConfig;
  const [status, setStatus] = useState(0);
  const [openCaseSteps, setOpenCaseSteps] = useState(false);

  useEffect(() => {
    if (testcaseData) {
      form.setFieldsValue(testcaseData);
    }
  }, [testcaseData]);

  useEffect(() => {
    if (selectedCase) {
      console.log(selectedCase);
    }
  }, [selectedCase]);
  const reloadCaseStep = () => {
    setStatus(status + 1);
    callback();
  };

  const CardTitle = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minHeight: 32,
        flexWrap: 'nowrap',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Space size={'small'}>
        <Checkbox
          checked={selectedCase.includes(testcaseData.id!)} // 控制选中状态
          onChange={(e) => {
            const checked = e.target.checked;
            const testCaseId = testcaseData.id;
            if (testCaseId) {
              setSelectedCase((pre) =>
                checked
                  ? pre.includes(testCaseId)
                    ? pre
                    : [...pre, testCaseId]
                  : pre.filter((id) => id !== testCaseId),
              );
            }
          }}
        />
      </Space>

      <Space size={'small'} style={{ marginLeft: 10 }}>
        <Tag color={'#87d068'}>{testcaseData?.uid}</Tag>
        <ProFormText
          style={{ fontWeight: 'bold', width: 'auto' }}
          fieldProps={{
            variant: 'outlined',
            style: {
              borderRadius: 20,
              height: 'auto',
              width: '500px', // 添加宽度限制
            },
          }}
          allowClear
          noStyle
          name={'case_name'}
          placeholder={'请输入用例标题'}
          required
          tooltip={'最长20位'}
          rules={[{ required: true, message: '标题不能为空' }]}
        />
      </Space>
    </div>
  );

  const menuItems: MenuProps['items'] = [
    {
      label: '动态',
      key: '1',
      icon: <MessageOutlined />,
    },
    {
      label: '复制',
      key: '2',
      icon: <CopyOutlined />,
    },
    {
      label: '删除',
      key: '3',
      icon: <DeleteOutlined />,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    switch (e.key) {
      case '1':
        setOpenDynamic(true);
        return;
      case '2':
        await copyStepCase();
        return;
      case '3':
        await deleteStepCase();
    }
  };

  const copyStepCase = async () => {
    if (testcaseData?.id) {
      const { code, msg } = await copyTestCase({
        requirementId: reqId ? parseInt(reqId) : null,
        caseId: testcaseData.id,
      });
      if (code === 0) {
        message.success(msg);
        callback();
      }
    }
  };
  const deleteStepCase = async () => {
    if (testcaseData?.id) {
      const { code, msg } = await removeTestCase({
        requirementId: reqId ? parseInt(reqId) : null,
        caseId: testcaseData.id,
      });
      if (code === 0) {
        message.success(msg);
        callback();
      }
    }
  };

  const ExtraOpt = (
    <Space style={{ marginRight: 30 }}>
      <CaseTagSelect
        tags={tags}
        setTags={setTags}
        testcaseData={testcaseData}
      />
      <CaseLevelSelect testcaseData={testcaseData} />
      <CaseTypeSelect testcaseData={testcaseData} />

      <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }}>
        <Button type={'link'} icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  );

  // 监听表单值变化
  const handleValuesChange = async (
    changedValues: any,
    allValues: ITestCase,
  ) => {
    const values = form.getFieldsValue(true);
    console.log('all', values);
    console.log('表单值变化:', changedValues);
    if (timeout) {
      clearTimeout(timeout);
    }

    if (form.getFieldValue('id')) {
      changedValues.id = values.id;
      timeout = setTimeout(async () => {
        console.log('发送更新请求，当前值：', allValues);

        const { code, msg } = await updateTestCase(values);
        if (code === 0) {
          message.success(msg);
        }
      }, 3000); // 延时3秒
    } else {
      timeout = setTimeout(async () => {
        console.log('发送插入请求，当前值：', values);
        if (values.case_name && values.case_tag) {
          console.log(allValues);
          const { code, msg } = await saveTestCase(values);
          if (code === 0) {
            message.success(msg);
          }
        }
      }, 3000); // 延时3秒
    }
  };

  return (
    <>
      <MyDrawer
        name={'动态'}
        width={'40%'}
        open={openDynamic}
        setOpen={setOpenDynamic}
      >
        <DynamicInfo caseId={testcaseData?.id} />
      </MyDrawer>
      <MyDrawer
        name={testcaseData.case_name}
        open={openCaseSteps}
        setOpen={setOpenCaseSteps}
      >
        <CaseSubSteps
          caseId={testcaseData?.id}
          case_status={testcaseData?.case_status}
          callback={reloadCaseStep}
        />
      </MyDrawer>
      <ProForm<ITestCase>
        form={form}
        submitter={false}
        onValuesChange={handleValuesChange}
      >
        <Badge.Ribbon
          text={CASE_STATUS_TEXT_ENUM[testcaseData!.case_status!]}
          color={CASE_STATUS_COLOR_ENUM[testcaseData!.case_status!]}
        >
          <ProCard
            ref={top}
            hoverable
            title={CardTitle}
            extra={ExtraOpt}
            bordered
            collapsible
            defaultCollapsed
            collapsibleIconRender={({ collapsed }) => null}
            onClick={() => {
              setOpenCaseSteps(true);
            }}
            headerBordered
            headStyle={{
              height: 80,
              padding: '0 16px',
            }}
          ></ProCard>
        </Badge.Ribbon>
      </ProForm>
    </>
  );
};
export default Index;
