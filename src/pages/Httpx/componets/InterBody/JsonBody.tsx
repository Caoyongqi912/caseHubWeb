import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { FormEditableOnValueChange } from '@/pages/Httpx/componets/FormEditableOnValueChange';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { ProCard } from '@ant-design/pro-components';
import { FormInstance } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
  readonly?: boolean;
}

const JsonBody: FC<SelfProps> = ({ form, readonly = false }) => {
  const [body, setBody] = useState<any>();
  const timeoutRef = useRef<any>(null);
  const [showError, setShowError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const body = form.getFieldValue('interface_body');
    if (body) {
      setBody(JSON.stringify(body, null, 2));
    }
  }, []);
  const handleOnChange = async (newValue: any) => {
    clearTimeout(timeoutRef.current);
    setBody(newValue);
    timeoutRef.current = setTimeout(async () => {
      if (newValue) {
        try {
          form.setFieldValue('interface_body', JSON.parse(newValue));
          setShowError(false);
          await FormEditableOnValueChange(form, 'interface_body', false).then(
            () => {
              setIsSaved(true);
              setTimeout(() => {
                setIsSaved(false);
              }, 2000);
            },
          );
        } catch (error) {
          setShowError(true);
          return;
        }
      } else {
        form.setFieldValue('interface_body', null);
      }
    }, 2000);
  };
  return (
    <ProCard
      bodyStyle={{ padding: 0 }}
      style={{ marginTop: 8 }}
      extra={
        <a
          onClick={() =>
            handleOnChange(
              JSON.stringify(form.getFieldValue('interface_body'), null, 2),
            )
          }
        >
          格式化
        </a>
      }
    >
      {showError && <p style={{ color: 'red' }}>JSON 格式错误，请检查。</p>}
      {isSaved && <p style={{ color: 'grey' }}>已保存! </p>}
      <AceCodeEditor
        value={body}
        onChange={handleOnChange}
        height={'40vh'}
        readonly={readonly}
        _mode={'json'}
      />
    </ProCard>
  );
};

export default JsonBody;
