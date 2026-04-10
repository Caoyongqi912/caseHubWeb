import { updateCaseContent } from '@/api/inter/interCase';
import ScriptContentCard, {
  ScriptContentInfo,
} from '@/components/ContentCard/ScriptContentCard';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { FC, useMemo, useState } from 'react';

/**
 * Props接口
 */
interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

/**
 * ScriptProCard组件
 * 接口流程的脚本步骤内容组件
 */
const Index: FC<Props> = (props) => {
  const { id, step, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);

  /**
   * 更新脚本内容
   * 使用Inter模块的updateCaseContent API
   */
  const handleUpdateScript = async (data: {
    id: number;
    script_text?: string;
    content_name?: string;
  }) => {
    return updateCaseContent({
      content_id: data.id,
      content_name: data.content_name,
      script_text: data.script_text,
    });
  };

  /**
   * 构造脚本内容信息
   * 使用useMemo避免每次渲染创建新对象导致useEffect循环触发
   */
  const contentInfo: ScriptContentInfo = useMemo(
    () => ({
      id: caseContent.id,
      content_name: caseContent.content_name,
      script_text: caseContent.script_text,
    }),
    [caseContent.id, caseContent.content_name, caseContent.script_text],
  );

  return (
    <ScriptContentCard
      id={id}
      step={step}
      caseId={caseId}
      contentInfo={contentInfo}
      callback={callback}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      showExtra={showOption}
      onMouseEnter={() => setShowOption(true)}
      onMouseLeave={() => setShowOption(false)}
      updateScript={handleUpdateScript}
    />
  );
};

export default Index;
