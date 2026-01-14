import { updateCaseContent } from '@/api/inter/interCase';
import Handler from '@/components/DnDDraggable/handler';
import { AssertOption } from '@/pages/Httpx/componets/assertEnum';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
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
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
  setCanDraggable?: (canDraggable: boolean) => void;
}

const AssertProCard: FC<Props> = (props) => {
  const [form] = Form.useForm();
  const { step, id, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showAssertInput, setShowAssertInput] = useState(true);
  const [assertName, setAssertName] = useState<string>();
  const [isCollapsed, setIsCollapsed] = useState(true); // 控制展开状态

  useEffect(() => {
    const { content_name } = caseContent;
    if (content_name) {
      setAssertName(content_name);
      setShowAssertInput(false);
    }
    if (caseContent.api_assert_list) {
      form.setFieldsValue({ api_assert_list: caseContent.api_assert_list });
    }
  }, [caseContent]);

  const updateContentTitle = async (value: string | undefined) => {
    if (value) {
      const { code, data } = await updateCaseContent({
        id: caseContent.id,
        content_name: value,
      });
      if (code === 0) {
        setAssertName(data.content_name);
        setShowAssertInput(false);
      }
    } else {
      setShowAssertInput(true);
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
          onBlur={async () => await updateContentTitle(assertName)}
          onPressEnter={async () => await updateContentTitle(assertName)}
        />
      );
    }
  };

  return (
    <ProCard
      bordered
      collapsible
      hoverable
      defaultCollapsed
      // collapsed={isCollapsed}
      // onCollapse={(collapsed) => props.setCanDraggable?.(collapsed)}
      onMouseEnter={() => {
        setShowOption(true);
        setShowEditIcon(true);
      }}
      onMouseLeave={() => {
        setShowOption(false);
        setShowEditIcon(false);
      }}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      collapsibleIconRender={({}) => {
        return (
          <Space>
            <Handler id={id} step={step} />
            {/*<Tag color={'green-inverse'}>STEP_{step}</Tag>*/}
            <Tag color={'red-inverse'} icon={<QuestionOutlined />} />
            {Assert()}
          </Space>
        );
      }}
    >
      <ProCard bodyStyle={{ padding: 10 }}>
        <ProForm
          form={form}
          onFinish={async (values) => {
            console.log(values);
            const { code, data } = await updateCaseContent({
              id: caseContent.id,
              ...values,
            });
            if (code === 0) {
              form.setFieldsValue(data);
              message.success('保存成功');
            }
          }}
        >
          <ProFormList name={'api_assert_list'}>
            <ProFormGroup>
              <ProFormText
                width={'md'}
                name={'assert_key'}
                placeholder={'请输入断言变量 不需要{{}}'}
                required
                rules={[{ required: true, message: '请输入变量' }]}
              />
              <ProFormSelect
                width={'sm'}
                name={'assert_type'}
                options={AssertOption}
                required
                rules={[{ required: true, message: '请选择条件' }]}
              />
              <ProFormText
                width={'md'}
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
  );
};

export default AssertProCard;
