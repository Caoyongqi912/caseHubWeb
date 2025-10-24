import { queryPushConfig } from '@/api/base/pushConfig';
import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import React, { FC, useState } from 'react';

import { IModuleEnum } from '@/api';
import { CONFIG } from '@/utils/config';
import { useModel } from '@@/exports';

interface SelfProps {
  setCurrentProjectId: React.Dispatch<React.SetStateAction<number | undefined>>;
  moduleEnum: IModuleEnum[];
}

const InterfaceTaskBaseForm: FC<SelfProps> = (props) => {
  const { setCurrentProjectId, moduleEnum } = props;
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const { API_LEVEL_SELECT } = CONFIG;
  const [isAuto, setIsAuto] = useState<boolean>(false);

  return (
    <>
      <ProForm.Group>
        <ProFormSelect
          width={'md'}
          options={projects}
          label={'所属项目'}
          name={'project_id'}
          required={true}
          onChange={(value) => {
            setCurrentProjectId(value as number);
          }}
        />
        <ProFormTreeSelect
          required
          name="module_id"
          label="所属模块"
          allowClear
          rules={[{ required: true, message: '所属模块必选' }]}
          fieldProps={{
            onChange: (value) => {
              setCurrentModuleId(value);
            },
            value: currentModuleId,
            treeData: moduleEnum,
            fieldNames: {
              label: 'title',
            },
            filterTreeNode: true,
          }}
          width={'md'}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          width={'md'}
          name="title"
          label="任务标题"
          required={true}
          rules={[{ required: true, message: '用例标题必填' }]}
        />
        <ProFormSelect
          name="level"
          label="优先级"
          width={'md'}
          initialValue={'P1'}
          options={API_LEVEL_SELECT}
          required={true}
          rules={[{ required: true, message: '用例优先级必选' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          label={'重试次数'}
          name={'retry'}
          width={'md'}
          required={true}
          // hidden={true}
          initialValue={0}
          max={5}
          min={0}
        />
        <ProFormDigit
          tooltip={'设置大于0后日志可能会混乱'}
          label={'并行执行'}
          name={'parallel'}
          required={true}
          width={'md'}
          // hidden={true}
          initialValue={0}
          max={5}
          min={0}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSwitch
          name={'is_auto'}
          label={'自动化运行'}
          checkedChildren="开"
          unCheckedChildren="关"
          initialValue={isAuto}
          fieldProps={{
            onChange: (checked) => {
              setIsAuto(checked);
            },
          }}
        />
        {isAuto ? (
          <ProFormText
            width={'md'}
            tooltip={'m h d M (day of month)'}
            name={'cron'}
            label={'Cron表达式'}
            required={isAuto}
            placeholder={'* * * * *'}
            rules={[{ required: isAuto, message: '表达式必填' }]}
          />
        ) : null}
        <ProFormSelect
          label={'推送方式'}
          name={'push_id'}
          width={'md'}
          request={async () => {
            const { code, data } = await queryPushConfig();
            if (code === 0 && data.length > 0) {
              return data.map((item) => {
                return { label: item.push_name, value: item.id };
              });
            }
            return [];
          }}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormTextArea
          width={'md'}
          name="desc"
          label="用例描述"
          required={true}
          rules={[{ required: true, message: '用例描述必填' }]}
        />
      </ProForm.Group>
    </>
  );
};

export default InterfaceTaskBaseForm;
