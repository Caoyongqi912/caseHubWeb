import { FormEditableOnValueChange } from '@/pages/Httpx/componets/FormEditableOnValueChange';
import APIFormData from '@/pages/Httpx/componets/InterBody/APIFormData';
import JsonBody from '@/pages/Httpx/componets/InterBody/JsonBody';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { ProCard, ProFormSelect } from '@ant-design/pro-components';
import { Empty, FormInstance, Radio, Space, Typography } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { FC, useEffect, useState } from 'react';

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
  readonly?: boolean;
}

const Index: FC<SelfProps> = (props) => {
  const { readonly = false } = props;
  const [bodyType, setBodyType] = useState(0);
  useEffect(() => {
    const t = props.form.getFieldValue('body_type');
    if (t) {
      setBodyType(t);
    }
  }, []);
  const BodyMap = () => {
    switch (bodyType) {
      case 0:
        return (
          <ProCard
            bordered
            style={{
              lineHeight: '10vh',
              textAlign: 'center',
            }}
          >
            <Empty
              description={
                <Typography.Text type={'secondary'}>
                  This request does not have a body
                </Typography.Text>
              }
            />
          </ProCard>
        );
      case 1:
        return <JsonBody {...props} />;
      case 2:
        return <APIFormData type={'form_data'} {...props} />;
      case 3:
        return <APIFormData type={'urlencoded'} {...props} />;
    }
  };

  const onGroupChange = async (e: RadioChangeEvent) => {
    setBodyType(e.target.value);
    props.form.setFieldValue('body_type', e.target.value);
    await FormEditableOnValueChange(props.form, 'body_type', false);
  };
  return (
    <>
      <Radio.Group
        disabled={readonly}
        defaultValue={bodyType}
        value={bodyType}
        onChange={onGroupChange}
        options={[
          {
            label: 'none',
            value: 0,
          },

          {
            label: 'form-data',
            value: 2,
          },
          {
            label: 'urlencoded',
            value: 3,
          },
          {
            label: (
              <Space>
                <Typography.Text>raw</Typography.Text>
                <ProFormSelect
                  disabled={readonly}
                  hidden={bodyType !== 1}
                  noStyle
                  onChange={async (value) => {
                    props.form.setFieldValue('raw_type', value);
                    await FormEditableOnValueChange(
                      props.form,
                      'raw_type',
                      false,
                    );
                  }}
                  options={[
                    {
                      label: 'JSON',
                      value: 'json',
                    },
                    {
                      label: 'TEXT',
                      value: 'text',
                    },
                  ]}
                  name={'raw_type'}
                />
              </Space>
            ),
            value: 1,
          },
        ]}
      />
      {BodyMap()}
    </>
  );
};

export default Index;
