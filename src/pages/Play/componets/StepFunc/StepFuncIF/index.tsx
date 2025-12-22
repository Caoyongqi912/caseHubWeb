import { removePlayStepCondition, updatePlayStep } from '@/api/play/playCase';
import {
  IUICaseStepCondition,
  IUICaseSteps,
} from '@/pages/Play/componets/uiTypes';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, message, Popconfirm, Space, Tag } from 'antd';
import { FC, useEffect, useState } from 'react';

interface Self {
  currentProjectId: number;
  subStepInfo: IUICaseSteps;
  callback: () => void;
}

const Index: FC<Self> = (props) => {
  const { subStepInfo, callback } = props;
  const [form] = Form.useForm<IUICaseStepCondition>();
  const [condition, setCondition] = useState<IUICaseStepCondition>();
  const [currentStep, setCurrentStep] = useState<IUICaseSteps>();

  useEffect(() => {
    if (subStepInfo) {
      setCondition(subStepInfo.condition);
      setCurrentStep(subStepInfo);
      form.setFieldsValue(subStepInfo.condition);
    }
  }, [subStepInfo]);

  const saveCondition = async () => {
    const values = await form.validateFields();
    const data = {
      condition: values,
      id: subStepInfo.id,
    };
    const { code, msg } = await updatePlayStep(data as IUICaseSteps);
    if (code === 0) {
      message.success(msg);
      callback();
    }
  };

  const removeCondition = async () => {
    const { code, msg } = await removePlayStepCondition({
      stepId: subStepInfo.id,
    });
    if (code === 0) {
      setCondition(undefined);
      form.resetFields();
      message.success(msg);
      callback();
    }
  };

  return (
    <ProCard split={'horizontal'}>
      <ProCard
        headerBordered={true}
        subTitle={<span>若条件符合、改步骤将执行、否则跳过</span>}
        extra={
          <Space>
            <Button onClick={saveCondition} type={'primary'}>
              Save
            </Button>
            <Popconfirm
              title={'确定要添加子步骤吗？'}
              onConfirm={removeCondition}
            >
              <Button>Remove</Button>
            </Popconfirm>
          </Space>
        }
      >
        <ProForm form={form} submitter={false}>
          <ProForm.Group>
            <ProFormText
              addonBefore={<Tag color={'green'}>IF</Tag>}
              name={'key'}
              placeholder={'{{变量名}}'}
              rules={[{ required: true, message: '变量名不能为空 !' }]}
              required={true}
            />
            <ProFormSelect
              noStyle
              initialValue={1}
              name={'operator'}
              required={true}
              rules={[{ required: true, message: '条件不能为空 !' }]}
              options={[
                { label: '==', value: 1 },
                { label: '!=', value: 2 },
              ]}
            />
            <ProFormText
              name={'value'}
              rules={[{ required: true, message: '变量名不能为空 !' }]}
              required={true}
              placeholder={'{{变量名}}'}
            />
          </ProForm.Group>
        </ProForm>
      </ProCard>
      {/*<ProCard*/}
      {/*  extra={*/}
      {/*    condition && (*/}
      {/*      <Button onClick={() => setOpenStepDetailDrawer(true)}>添加</Button>*/}
      {/*    )*/}
      {/*  }*/}
      {/*>*/}
      {/*  {condition && (*/}
      {/*    <DnDDraggable*/}
      {/*      items={conditionStepsContent}*/}
      {/*      setItems={setConditionStepsContent}*/}
      {/*      orderFetch={onDragEnd}*/}
      {/*    />*/}
      {/*  )}*/}
      {/*</ProCard>*/}
      {/*<MyDrawer*/}
      {/*  width={'auto'}*/}
      {/*  name={''}*/}
      {/*  open={openStepDetailDrawer}*/}
      {/*  setOpen={setOpenStepDetailDrawer}*/}
      {/*>*/}
      {/*  <PlayStepDetail*/}
      {/*    callBack={() => {*/}
      {/*      setOpenStepDetailDrawer(false);*/}
      {/*      callback();*/}
      {/*    }}*/}
      {/*    conditionStepId={subStepInfo.id}*/}
      {/*  />*/}
      {/*</MyDrawer>*/}
    </ProCard>
  );
};

export default Index;
