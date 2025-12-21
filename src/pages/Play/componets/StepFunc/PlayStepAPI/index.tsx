import { detailInterApiById } from '@/api/inter';
import {
  associationStepInterApi,
  removeAssociationStepInterApi,
} from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import ApiRender from '@/pages/Play/componets/StepFunc/PlayStepAPI/ApiRender';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import {
  ProCard,
  ProForm,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';
import { Empty, Form, Space, Typography } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

const { Text } = Typography;

const Index: FC<{
  projectId: number;
  callback: () => void;
  playStepInfo: IUICaseSteps;
}> = ({ projectId, callback, playStepInfo }) => {
  const [form] = Form.useForm<{
    interface_fail_stop: number;
    interface_a_or_b: number;
    apiId: number;
  }>();
  const timeoutRef = useRef<any>(null);

  const [openChoiceAPIDrawer, setOpenChoiceAPIDrawer] = useState(false);
  const [selectedApiId, setSelectedApiId] = useState<number>();
  const [apiInfo, setApiInfo] = useState<IInterfaceAPI>();
  useEffect(() => {
    if (!playStepInfo.interface_id) return;
    form.setFieldsValue({
      interface_a_or_b: playStepInfo.interface_a_or_b,
      interface_fail_stop: playStepInfo.interface_fail_stop,
      apiId: playStepInfo.interface_id,
    });
    setSelectedApiId(playStepInfo.interface_id);
  }, [playStepInfo]);

  useEffect(() => {
    if (!selectedApiId) return;
    detailInterApiById({ interfaceId: selectedApiId }).then(
      async ({ code, data }) => {
        if (code === 0) {
          setApiInfo(data);
        }
      },
    );
  }, [selectedApiId]);

  const onAPISelect = (values?: number[]) => {
    if (values && values.length > 0) {
      const newSelectedApiId = values[0];
      setOpenChoiceAPIDrawer(false);
      setSelectedApiId(newSelectedApiId);

      const currentValues = form.getFieldsValue();
      const newFormValues = {
        ...currentValues,
        apiId: newSelectedApiId,
        interface_a_or_b: currentValues.interface_a_or_b || 1, // 默认值
        interface_fail_stop: currentValues.interface_fail_stop || 0, // 默认值
      };

      form.setFieldsValue(newFormValues);

      // 手动触发更新
      handleFormChange(newFormValues);
    }
  };

  const handleFormChange = async (newValues: any) => {
    try {
      await form.validateFields();
    } catch (e) {
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      if (newValues.apiId) {
        await associationStepInterApi({
          ...newValues,
          stepId: playStepInfo.id,
        });
      }
    }, 3000);
  };

  const onChange = async (_: any, values: any) => {
    console.log(values);
    await handleFormChange(values);
  };

  const removeAPI = async () => {
    const { code, msg } = await removeAssociationStepInterApi({
      stepId: playStepInfo.id,
    });
    if (code === 0) {
      form.resetFields();
      setSelectedApiId(undefined);
      callback();
    }
  };
  return (
    <div>
      <MyDrawer
        name={'API选择'}
        open={openChoiceAPIDrawer}
        setOpen={setOpenChoiceAPIDrawer}
      >
        <InterfaceCaseChoiceApiTable
          projectId={projectId}
          currentStepId={playStepInfo.id}
          refresh={onAPISelect}
        />
      </MyDrawer>
      <ProCard
        bordered
        extra={selectedApiId && <a onClick={removeAPI}>移除</a>}
        bodyStyle={{ padding: 6, alignItems: 'center' }}
      >
        {selectedApiId ? (
          <ProForm submitter={false} form={form} onValuesChange={onChange}>
            <ProFormText name={'apiId'} hidden={true} />
            <ProForm.Group style={{ marginLeft: 20 }}>
              <ProFormRadio.Group
                required={true}
                label={'该UI步骤前后运行'}
                radioType={'button'}
                name={'interface_a_or_b'}
                disabled={false}
                width={'md'}
                initialValue={1}
                rules={[{ required: true, message: '选择执行策略' }]}
                options={[
                  {
                    label: '前置运行',
                    value: 1,
                  },
                  {
                    label: '后置运行',
                    value: 0,
                  },
                ]}
              />
              <ProFormRadio.Group
                initialValue={0}
                required={true}
                disabled={false}
                label={'API断言失败停止'}
                radioType={'button'}
                name={'interface_fail_stop'}
                width={'md'}
                rules={[{ required: true, message: '选择是否停止' }]}
                options={[
                  {
                    label: '停止',
                    value: 1,
                  },
                  {
                    label: '不停止',
                    value: 0,
                  },
                ]}
              />
            </ProForm.Group>
            <ProCard
              title={'已选API'}
              bordered
              extra={<a onClick={() => setOpenChoiceAPIDrawer(true)}>重选</a>}
            >
              <ApiRender apiInfo={apiInfo} />
            </ProCard>
          </ProForm>
        ) : (
          <Empty
            description={
              <Space direction={'vertical'}>
                <Text type={'secondary'}>无接口配置</Text>
                <a onClick={() => setOpenChoiceAPIDrawer(true)}>去选择</a>
              </Space>
            }
          />
        )}
      </ProCard>
    </div>
  );
};

export default Index;
