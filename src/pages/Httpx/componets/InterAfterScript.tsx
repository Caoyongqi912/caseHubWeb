import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { IInterfaceAPI } from '@/pages/Interface/types';
import { ProCard } from '@ant-design/pro-components';
import { FormInstance } from 'antd';
import { FC, useEffect, useState } from 'react';

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
  mode: number;
}

const InterAfterScript: FC<SelfProps> = ({ form, mode }) => {
  const [scriptData, setScriptData] = useState<any>();
  const [readonly, setReadonly] = useState(false);
  useEffect(() => {
    console.log(mode);
    if (mode) {
      if (mode === 1) {
        setReadonly(true);
      } else {
        setReadonly(false);
      }
    }
  }, [mode]);
  useEffect(() => {
    const script = form.getFieldValue('afterScript');
    if (script) {
      setScriptData(script);
    }
  }, []);
  const handleOnChange = (value: any) => {
    if (value) {
      setScriptData(value);
      form.setFieldsValue({ afterScript: value });
    }
  };
  return (
    <ProCard>
      <AceCodeEditor
        value={scriptData}
        onChange={handleOnChange}
        height={'40vh'}
        readonly={readonly}
        _mode={'python'}
      />
    </ProCard>
  );
};

export default InterAfterScript;
