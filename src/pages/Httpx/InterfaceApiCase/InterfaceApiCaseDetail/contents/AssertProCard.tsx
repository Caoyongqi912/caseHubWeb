import {
  detailContentAssert,
  updateCaseContent,
  updateContentAssert,
} from '@/api/inter/interCase';
import { AssertOption } from '@/pages/Httpx/componets/assertEnum';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import {
  EditOutlined,
  QuestionOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, Input, Space, Tag, Typography } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

const { Text } = Typography;

interface Props {
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

const AssertProCard: FC<Props> = (props) => {
  const timeoutRef = useRef<any>(null);

  const [form] = Form.useForm();
  const { step, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showAssertInput, setShowAssertInput] = useState(true);
  const [assertName, setAssertName] = useState<string>();
  const [editingIndex, setEditingIndex] = useState<number | null>(0); // 当前正在编辑的行索引
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    const { content_name, target_id } = caseContent;
    if (content_name) {
      setAssertName(content_name);
      setShowAssertInput(false);
    }
    detailContentAssert(target_id).then(async ({ code, data }) => {
      if (code === 0) {
        form.setFieldsValue(data);
      }
    });
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

  const onValuesChange = async (changedValues: any, allValues: any) => {
    console.log('changedValues', changedValues);
    console.log('allValues', allValues);

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const { code, data } = await updateContentAssert({
        id: caseContent.target_id,
        ...allValues,
      });
      if (code === 0) {
        form.setFieldsValue(data);
      }
    }, 2000);
  };
  return (
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
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      collapsibleIconRender={({ collapsed }) => {
        return (
          <Space>
            <UnorderedListOutlined
              style={{ color: '#c3cad4', marginRight: 20 }}
            />
            <Tag color={'green-inverse'}>STEP_{step}</Tag>
            <Tag color={'red-inverse'} icon={<QuestionOutlined />} />
            {Assert()}
          </Space>
        );
      }}
    >
      <ProCard bodyStyle={{ padding: 20 }} layout={'center'}>
        <ProForm form={form} onValuesChange={onValuesChange} submitter={false}>
          <ProForm.Group>
            <ProFormText
              width={'lg'}
              name={'assert_key'}
              placeholder={'请输入断言变量 不需要{{}}'}
              required
            />
            <ProFormSelect
              width={'sm'}
              name={'assert_type'}
              options={AssertOption}
              required
            />
            <ProFormText
              width={'lg'}
              name={'assert_value'}
              placeholder={'请输入断言值 不需要{{}}'}
              required
            />
          </ProForm.Group>
        </ProForm>
      </ProCard>
    </ProCard>
  );
};

export default AssertProCard;
