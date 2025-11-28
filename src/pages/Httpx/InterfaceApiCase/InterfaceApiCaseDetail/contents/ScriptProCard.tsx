import { updateCaseContent } from '@/api/inter/interCase';
import ApiScriptContent from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/apiScriptContent';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import {
  EditOutlined,
  PythonOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Input, Space, Tag, Typography } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

const { Text } = Typography;

interface Props {
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

const ScriptProCard: FC<Props> = (props) => {
  const timeoutRef = useRef<any>(null);

  const { step, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [saveScript, setSaveScript] = useState(false);
  const [scriptText, setScriptText] = useState<string>();
  const [scriptTextName, setScriptTextName] = useState<string>();
  const [showScriptInput, setShowScriptInput] = useState(true);
  const [showEditIcon, setShowEditIcon] = useState(false);

  useEffect(() => {
    const { api_script_text } = caseContent;
    if (api_script_text) {
      setScriptTextName(caseContent.content_name);
      setScriptText(caseContent.api_script_text);
      setShowScriptInput(false);
    }
  }, [caseContent]);
  const handleScriptOnChange = (value: string) => {
    clearTimeout(timeoutRef.current);
    setScriptText(value);
    timeoutRef.current = setTimeout(async () => {
      updateCaseContent({ id: caseContent.id, api_script_text: value }).then(
        async ({ code }) => {
          if (code === 0) {
            setSaveScript(true);
            setTimeout(() => {
              setSaveScript(false);
            }, 2000);
          }
        },
      );
    }, 3000);
  };

  const updateContentTitle = async (value: string | undefined) => {
    if (value) {
      const { code, data } = await updateCaseContent({
        id: caseContent.id,
        content_name: value,
      });
      if (code === 0) {
        setScriptTextName(data.content_name);
        setShowScriptInput(false);
      }
    } else {
      setShowScriptInput(true);
    }
  };

  const SCRIPT = () => {
    if (scriptTextName && !showScriptInput) {
      return (
        <>
          <Text>{scriptTextName}</Text>
          {showEditIcon && (
            <EditOutlined
              style={{ marginLeft: 10 }}
              onClick={(event) => {
                event.stopPropagation();
                setShowScriptInput(true);
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
            if (e.target.value) setScriptTextName(e.target.value);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onBlur={async () => await updateContentTitle(scriptTextName)}
          onPressEnter={async () => await updateContentTitle(scriptTextName)}
        />
      );
    }
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
      collapsibleIconRender={({}) => {
        return (
          <Space>
            <UnorderedListOutlined
              style={{ color: '#c3cad4', marginRight: 20 }}
            />
            <Tag color={'green-inverse'}>STEP_{step}</Tag>
            <Tag color={'geekblue-inverse'} icon={<PythonOutlined />} />
            <div style={{ marginLeft: 10 }}>{SCRIPT()}</div>
          </Space>
        );
      }}
    >
      <ApiScriptContent
        isSave={saveScript}
        script_text={scriptText}
        onChange={handleScriptOnChange}
      />
    </ProCard>
  );
};

export default ScriptProCard;
