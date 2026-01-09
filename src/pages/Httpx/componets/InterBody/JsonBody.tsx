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
    const body = form.getFieldValue('body');
    if (body) {
      setBody(JSON.stringify(body, null, 2));
    }
  }, []);
  const handleOnChange = async (newValue: any) => {
    // 取消之前的验证计时器
    console.log('handleOnChange', newValue);
    clearTimeout(timeoutRef.current);
    setBody(newValue);
    // 设置新的计时器
    timeoutRef.current = setTimeout(async () => {
      if (newValue) {
        try {
          form.setFieldValue('body', JSON.parse(newValue));
          setShowError(false);
          await FormEditableOnValueChange(form, 'body', false).then(() => {
            setIsSaved(true);
            // 2秒后设置回 false
            setTimeout(() => {
              setIsSaved(false);
            }, 2000);
          });
        } catch (error) {
          setShowError(true);
          return;
        }
      } else {
        form.setFieldValue('body', null);
      }
    }, 2000); // 延迟1秒钟进行验证
  };
  return (
    <ProCard
      bodyStyle={{ padding: 0 }}
      style={{ marginTop: 8 }}
      extra={
        <a
          onClick={() =>
            handleOnChange(JSON.stringify(form.getFieldValue('body'), null, 2))
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
