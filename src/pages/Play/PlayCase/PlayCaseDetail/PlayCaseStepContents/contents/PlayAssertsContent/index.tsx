import { updateCaseContent } from '@/api/play/playCase';
import Handler from '@/components/DnDDraggable/handler';
import { AssertOption } from '@/pages/Httpx/componets/assertEnum';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import { EditOutlined, QuestionOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, Input, message, Space, Tag, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

interface Props {
  id: number;
  step: number;
  caseId: number;
  stepContent: IPlayStepContent;
  callback: () => void;
}

const Index: FC<Props> = ({ id, step, caseId, stepContent, callback }) => {
  const [form] = Form.useForm();
  const [showOption, setShowOption] = useState(false);
  const [showAssertInput, setShowAssertInput] = useState(true);
  const [assertName, setAssertName] = useState<string>();
  const [showEditIcon, setShowEditIcon] = useState(false);

  useEffect(() => {
    const { content_name } = stepContent;
    if (content_name) {
      setAssertName(content_name);
      setShowAssertInput(false);
    }
    if (stepContent.assert_list) {
      form.setFieldsValue({ assert_list: stepContent.assert_list });
    }
  }, [stepContent]);

  /**
   * 更新脚本内容
   * 使用Play模块的updateCaseContent API
   */
  const handleUpdateTitle = async (content_name?: string) => {
    if (!content_name) return;
    const { code, data } = await updateCaseContent({
      id: stepContent.id,
      content_name,
    });
    if (code === 8) {
      setAssertName(data.content_name);
      setShowAssertInput(false);
    }
  };

  const Assert = () => {
    if (assertName && !showAssertInput) {
      return (
        <>
          <Text>{assertName}</Text>
          {showEditIcon && (
            <EditOutlined
              onClick={(event) => {
                event.stopPropagation();
                setShowAssertInput(true);
              }}
            />
          )}
        </>
      );
    } else {
      return (
        <Input
          style={{ width: '100%' }}
          // @ts-ignore
          variant={'underlined'}
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.value) setAssertName(e.target.value);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onBlur={async () => await handleUpdateTitle(assertName)}
          onPressEnter={async () => await handleUpdateTitle(assertName)}
        />
      );
    }
  };

  return (
    <div>
      <ProCard
        bordered
        collapsible
        hoverable
        defaultCollapsed
        onMouseEnter={() => {
          setShowOption(true);
          setShowEditIcon(true);
        }}
        onMouseLeave={() => {
          setShowOption(false);
          setShowEditIcon(false);
        }}
        extra={
          <ContentExtra
            stepContent={stepContent}
            caseId={caseId}
            callback={callback}
            show={showOption}
          />
        }
        collapsibleIconRender={({}) => {
          return (
            <Space>
              <Handler id={id} step={step} />
              <Tag color={'red-inverse'} icon={<QuestionOutlined />} />
              <Tag color={'red-inverse'}>断言</Tag>
              {Assert()}
            </Space>
          );
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <ProCard bordered={false} layout={'center'}>
          <ProForm
            form={form}
            onFinish={async (values) => {
              console.log(values);
              const { code, data } = await updateCaseContent({
                id: stepContent.id,
                ...values,
              });
              if (code === 0) {
                form.setFieldsValue(data);
                message.success('保存成功');
              }
            }}
            submitter={{
              searchConfig: {
                submitText: '保存',
              },
              resetButtonProps: {
                style: {
                  display: 'none',
                },
              },
            }}
          >
            <ProFormList
              name={'assert_list'}
              creatorButtonProps={{
                creatorButtonText: '添加断言',
              }}
            >
              <ProFormGroup>
                <ProFormText
                  name={'assert_key'}
                  placeholder={'请输入断言变量 不需要{{}}'}
                  required
                  rules={[{ required: true, message: '请输入变量' }]}
                />
                <ProFormSelect
                  name={'assert_type'}
                  options={AssertOption}
                  required
                  rules={[{ required: true, message: '请选择条件' }]}
                />
                <ProFormText
                  name={'assert_value'}
                  rules={[{ required: true, message: '请输入对比值' }]}
                  placeholder={'请输入断言值 不需要{{}}'}
                  required
                />
              </ProFormGroup>
            </ProFormList>
          </ProForm>
        </ProCard>
      </ProCard>
    </div>
  );
};

export default Index;
