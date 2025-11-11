import { setCurl2InterApi } from '@/api/inter';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import InterBody from '@/pages/Httpx/componets/InterBody';
import InterHeader from '@/pages/Httpx/componets/InterHeader';
import InterParam from '@/pages/Httpx/componets/InterParam';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { CodeOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, FormInstance, Modal, TabsProps } from 'antd';
import React, { Dispatch, FC, useEffect, useState } from 'react';

interface IProps {
  currentMode: number;
  interfaceApiInfo?: IInterfaceAPI;
  interApiForm: FormInstance<IInterfaceAPI>;
  setTitle?: Dispatch<React.SetStateAction<string>>;
  setSubCardTitle?: Dispatch<React.SetStateAction<string>>;
  envs: { label: string; value: number | null }[];
}

const ApiDetailForm: FC<IProps> = (props) => {
  const {
    currentMode,
    interfaceApiInfo,
    envs,
    interApiForm,
    setTitle,
    setSubCardTitle,
  } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [script, setScript] = useState();
  const { API_REQUEST_METHOD } = CONFIG;
  const [headersLength, setHeadersLength] = useState<number>();
  const [queryLength, setQueryLength] = useState<number>();
  const [bodyLength, setBodyLength] = useState<number>();
  const { API_LEVEL_SELECT, API_STATUS_SELECT } = CONFIG;

  useEffect(() => {
    if (interfaceApiInfo) {
      setQueryLength(interfaceApiInfo.params?.length);
      setHeadersLength(interfaceApiInfo.headers?.length);
      if (interfaceApiInfo.body_type) {
        if (interfaceApiInfo.body_type !== 1) {
          setBodyLength(1);
        } else {
          setBodyLength(undefined);
        }
      }
    }
  }, [interfaceApiInfo]);
  const renderTab = (type: number) => {
    // 定义一个映射表，用于存储每个 type 对应的名称和长度变量
    const tabMap: { [key: number]: { name: string; lengthVar: any } } = {
      1: { name: 'Headers', lengthVar: headersLength },
      2: { name: 'Query', lengthVar: queryLength },
      3: { name: 'Body', lengthVar: bodyLength },
    };
    // 获取当前 type 对应的配置
    const tabConfig = tabMap[type];
    // 确保 lengthVar 是有效的数字
    const length =
      typeof tabConfig.lengthVar === 'number' && tabConfig.lengthVar > 0
        ? tabConfig.lengthVar
        : 0;
    // 根据长度动态渲染内容
    return (
      <span>
        {tabConfig.name}{' '}
        {length > 0 && <span style={{ color: 'green' }}>({length})</span>}
      </span>
    );
  };

  // url before ENV
  const addonBefore = (
    <>
      <ProFormSelect
        disabled={currentMode === 1}
        noStyle
        name={'env_id'}
        options={envs}
        required={true}
        placeholder={'环境选择'}
        label={'Env'}
      />
    </>
  );
  // url after METHOD
  const addonAfter = (
    <>
      <ProFormSelect
        disabled={currentMode === 1}
        noStyle
        className={'method'}
        name={'method'}
        label={'method'}
        initialValue={'POST'}
        options={API_REQUEST_METHOD}
        required={true}
        rules={[{ required: true, message: 'method 不能为空' }]}
      />
    </>
  );
  const onModelFinish = async () => {
    if (script) {
      const { code, data } = await setCurl2InterApi({ script: script });
      if (code === 0) {
        interApiForm.setFieldsValue(data);
        setIsModalOpen(false);
      }
    }
  };
  const TabItems: TabsProps['items'] = [
    {
      key: '1',
      label: renderTab(1),
      children: <InterHeader form={interApiForm} readonly={false} />,
    },
    {
      key: '2',
      label: renderTab(2),
      children: <InterParam form={interApiForm} readonly={false} />,
    },
    {
      key: '3',
      label: renderTab(3),
      children: <InterBody form={interApiForm} readonly={false} />,
    },
  ];

  /**
   * 导入curl 只有首次创建 渲染
   */
  const InputCURL = (
    <>
      {currentMode === 2 && (
        <span style={{ float: 'right' }}>
          <CodeOutlined style={{ color: 'gray' }} />
          <Button
            type={'link'}
            style={{ color: 'gray' }}
            onClick={() => setIsModalOpen(true)}
          >
            CURL 快速导入
          </Button>
        </span>
      )}
    </>
  );
  return (
    <>
      <Modal
        title="导入CURL"
        open={isModalOpen}
        onOk={onModelFinish}
        onCancel={() => {
          setIsModalOpen(false);
        }}
      >
        <span style={{ color: 'gray' }}>curl格式内容 快速导入到请求参数</span>
        <AceCodeEditor
          _mode={'text'}
          onChange={(value: any) => setScript(value)}
          value={script}
        />
      </Modal>
      {InputCURL}
      <ProForm.Group>
        <ProFormText
          disabled={currentMode === 1}
          label={'接口名称'}
          name={'name'}
          width={'md'}
          required={true}
          rules={[{ required: true, message: '步骤名称不能为空' }]}
          fieldProps={{
            onChange: (e) => {
              if (setTitle) setTitle(e.target.value);
            },
          }}
        />
        <ProFormText
          label={'URL'}
          disabled={currentMode === 1}
          addonBefore={addonBefore}
          name={'url'}
          width={'md'}
          rules={[{ required: true, message: '请输入请求url' }]}
          addonAfter={addonAfter}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            disabled={currentMode === 1}
            name="level"
            label="优先级"
            width={'sm'}
            initialValue={'P1'}
            options={API_LEVEL_SELECT}
            required={true}
            rules={[{ required: true, message: '用例优先级必选' }]}
          />
          <ProFormSelect
            disabled={currentMode === 1}
            name="status"
            label="状态"
            initialValue={'DEBUG'}
            width={'sm'}
            options={API_STATUS_SELECT}
            required={true}
            rules={[{ required: true, message: '用例状态必须选' }]}
          />
        </ProForm.Group>
        <ProFormTextArea
          label={'步骤描述'}
          disabled={currentMode === 1}
          name={'description'}
          width={'lg'}
          required={true}
          fieldProps={{
            rows: 2,
            onChange: (e) => {
              if (setSubCardTitle) setSubCardTitle(e.target.value);
            },
          }}
        />
      </ProForm.Group>
      <ProCard bodyStyle={{ padding: 0 }}>
        <MyTabs
          type={'line'}
          size={'small'}
          defaultActiveKey={'2'}
          items={TabItems}
        />
      </ProCard>
    </>
  );
};

export default ApiDetailForm;
