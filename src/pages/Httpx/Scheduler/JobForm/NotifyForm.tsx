import { queryPushConfig } from '@/api/base/pushConfig';
import {
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { FC, useEffect, useState } from 'react';

interface Props {
  setNotifyName: (value: any) => void;
}

const NotifyForm: FC<Props> = ({ setNotifyName }) => {
  const [pushOptions, setPushOptions] = useState<
    { value: number; label: string }[]
  >([]);

  useEffect(() => {
    queryPushConfig().then(async ({ code, data }) => {
      if (code === 0 && data.length > 0) {
        setPushOptions(
          data.map((item) => {
            return { label: item.push_name, value: item.id };
          }),
        );
      }
    });
  }, []);
  return (
    <>
      <ProFormRadio.Group
        label="是否通知"
        name="job_notify_type"
        options={[
          { label: '通知', value: 0 },
          { label: '不通知', value: 1 },
        ]}
        initialValue={1}
        required
        rules={[{ required: true, message: '选择是否通知' }]}
      />
      <ProFormDependency name={['job_notify_type']}>
        {({ job_notify_type }) => {
          if (job_notify_type === 0) {
            return (
              <>
                <ProFormSelect
                  name="job_notify_id"
                  label="通知方式"
                  options={pushOptions}
                  onChange={(value) => {
                    const finallyValue = pushOptions.find(
                      (item) => item.value === value,
                    )?.label;
                    if (finallyValue) {
                      setNotifyName(finallyValue);
                    }
                  }}
                />
                <ProFormText name={'job_notify_name'} hidden={true} />
                <ProFormSelect
                  name="job_notify_on"
                  label="通知时机"
                  mode="multiple"
                  options={[
                    { label: '任务开始', value: 0 },
                    { label: '任务成功', value: 1 },
                    { label: '任务失败', value: 2 },
                  ]}
                  initialValue={[0, 1, 2]}
                />
              </>
            );
          }
          return null;
        }}
      </ProFormDependency>
    </>
  );
};

export default NotifyForm;
