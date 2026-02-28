import { updateCaseContent } from '@/api/play/playCase';
import DBContentCard, {
  DBContentInfo,
} from '@/components/ContentCard/DBContentCard';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import { FC, useState } from 'react';

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
 * PlayStepDBContent组件
 * UI流程的数据库步骤内容组件
 */
const Index: FC<Props> = (props) => {
  const { id, step, caseId, stepContent, callback } = props;
  const [showOption, setShowOption] = useState(false);

  /**
   * 更新内容标题
   * 使用Play模块的updateCaseContent API
   */
  const handleUpdateContentTitle = async (data: {
    id: number;
    content_name?: string;
  }) => {
    return updateCaseContent(data);
  };

  /**
   * 构造DB内容信息
   */
  const contentInfo: DBContentInfo = {
    id: stepContent.id,
    content_name: stepContent.content_name,
    target_id: stepContent.target_id,
  };

  return (
    <DBContentCard
      id={id}
      step={step}
      caseId={caseId}
      contentInfo={contentInfo}
      callback={callback}
      extra={
        <ContentExtra
          stepContent={stepContent}
          caseId={caseId}
          callback={callback}
          show={showOption}
        />
      }
      showExtra={showOption}
      onMouseEnter={() => setShowOption(true)}
      onMouseLeave={() => setShowOption(false)}
      updateContentTitle={handleUpdateContentTitle}
    />
  );
};

export default Index;
