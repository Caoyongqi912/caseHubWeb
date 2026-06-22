import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyDrawer from '@/components/MyDrawer';
import FuncScriptDesc from '@/pages/Httpx/componets/funcScriptDesc';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { ProCard } from '@ant-design/pro-components';
import { Button, Form, FormInstance } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
  mode: number;
}

const InterAfterScript: FC<SelfProps> = ({ form, mode }) => {
  const [scriptData, setScriptData] = useState<any>();
  const [readonly, setReadonly] = useState(false);
  const [funcOpen, setFuncOpen] = useState(false);

  useEffect(() => {
    if (mode) {
      if (mode === 1) {
        setReadonly(true);
      } else {
        setReadonly(false);
      }
    }
  }, [mode]);
  // 等接口详情回填后，再把后置脚本同步到本地。原先空依赖 effect 拿不到值。
  const watchedScript = Form.useWatch('interface_after_script', form);
  const seededScript = useRef(false);
  useEffect(() => {
    if (seededScript.current) return;
    if (watchedScript === undefined) return;
    if (watchedScript) setScriptData(watchedScript);
    seededScript.current = true;
  }, [watchedScript]);
  const handleOnChange = (value: any) => {
    if (value) {
      setScriptData(value);
      form.setFieldsValue({ interface_after_script: value });
    }
  };
  return (
    <ProCard
      extra={
        <Button onClick={() => setFuncOpen(true)} type={'primary'}>
          内置func
        </Button>
      }
    >
      <MyDrawer open={funcOpen} width={'30%'} setOpen={setFuncOpen} name={''}>
        <FuncScriptDesc />
      </MyDrawer>
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
