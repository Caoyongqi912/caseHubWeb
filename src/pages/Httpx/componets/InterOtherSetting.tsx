import { IInterfaceAPI } from '@/pages/Httpx/types';
import {
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormSelect,
} from '@ant-design/pro-components';
import { FormInstance } from 'antd';
import { FC } from 'react';

interface Props {
  currentMode: number;
  form?: FormInstance<IInterfaceAPI>;
}

const InterOtherSetting: FC<Props> = (props) => {
  const { currentMode, form } = props;
  return (
    <ProCard>
      <>
        <ProForm.Group>
          <ProFormSelect
            disabled={currentMode === 1}
            width={'sm'}
            label={'是否重定向'}
            name={'follow_redirects'}
            initialValue={0}
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDigit
            disabled={currentMode === 1}
            width={'sm'}
            label={'请求超时(s)'}
            name={'connect_timeout'}
            initialValue={6}
            min={0}
          />
          <ProFormDigit
            disabled={currentMode === 1}
            width={'sm'}
            label={'响应超时(s)'}
            initialValue={6}
            min={0}
            name={'response_timeout'}
          />
        </ProForm.Group>
      </>
    </ProCard>
  );
};

export default InterOtherSetting;
