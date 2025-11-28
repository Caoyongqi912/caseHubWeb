import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { ProCard } from '@ant-design/pro-components';
import { FC } from 'react';

interface SelfProps {
  script_text?: string;
  onChange?: (value: string) => void;
  isSave: boolean;
}

const ApiScriptContent: FC<SelfProps> = ({ script_text, isSave, onChange }) => {
  return (
    <ProCard style={{ height: '100%' }} bodyStyle={{ padding: 30 }}>
      {isSave && <p style={{ color: 'grey' }}>已保存! </p>}
      <AceCodeEditor
        value={script_text}
        onChange={onChange}
        height={'20vh'}
        _mode={'python'}
      />
    </ProCard>
  );
};

export default ApiScriptContent;
