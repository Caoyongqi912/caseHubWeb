import { updateCaseContent } from '@/api/play/playCase';
import ScriptContentCard, {
  ScriptContentInfo,
} from '@/components/ContentCard/ScriptContentCard';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import { FC, useMemo, useState } from 'react';

/**
 * Props接口
 */
interface Props {
  id: number;
  step: number;
  caseId: number;
  stepContent: IPlayStepContent;
  callback: () => void;
}

/**
 * PlayScriptContent组件
 * UI流程的脚本步骤内容组件
 */
const Index: FC<Props> = (props) => {
  const { id, step, stepContent, caseId, callback } = props;
  const [showOption, setShowOption] = useState(false);

  const selfCallback = () => {
    callback();
  };

  /**
   * 更新脚本内容
   * 使用Play模块的updateCaseContent API
   */
  const handleUpdateScript = async (data: {
    id: number;
    script_text?: string;
    content_name?: string;
  }) => {
    return updateCaseContent(data);
  };

  /**
   * 构造脚本内容信息
   * 使用useMemo避免每次渲染创建新对象导致useEffect循环触发
   */
  const contentInfo: ScriptContentInfo = useMemo(
    () => ({
      id: stepContent.id,
      content_name: stepContent.content_name,
      script_text: stepContent.script_text,
    }),
    [stepContent.id, stepContent.content_name, stepContent.script_text],
  );

  return (
    <>
      <ScriptContentCard
        id={id}
        step={step}
        caseId={caseId}
        contentInfo={contentInfo}
        callback={selfCallback}
        extra={
          <>
            <ContentExtra
              stepContent={stepContent}
              caseId={caseId}
              callback={selfCallback}
              show={showOption}
            />
          </>
        }
        showExtra={showOption}
        onMouseEnter={() => setShowOption(true)}
        onMouseLeave={() => setShowOption(false)}
        updateScript={handleUpdateScript}
        scriptTextKey="script_text"
      />
    </>
  );
};

export default Index;
