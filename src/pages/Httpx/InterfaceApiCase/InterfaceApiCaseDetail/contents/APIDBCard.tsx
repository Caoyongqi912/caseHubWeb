import { updateCaseContent } from '@/api/inter/interCase';
import DBContentCard, {
  DBContentInfo,
} from '@/components/ContentCard/DBContentCard';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { FC, useState } from 'react';

/**
 * Props接口
 */
interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  callback?: () => void;
}

/**
 * ApidbCard组件
 * 接口流程的数据库步骤内容组件
 */
const ApidbCard: FC<Props> = (props) => {
  const { id, step, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);

  /**
   * 更新内容标题
   * 使用Inter模块的updateCaseContent API
   */
  const handleUpdateContentTitle = async (data: {
    id: number;
    content_name?: string;
  }) => {
    return updateCaseContent({
      content_id: data.id,
    });
  };

  /**
   * 构造DB内容信息
   */
  const contentInfo: DBContentInfo = {
    id: caseContent.id,
    content_name: caseContent.content_name,
    target_id: caseContent.target_id,
  };

  return (
    <DBContentCard
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
      updateContentTitle={handleUpdateContentTitle}
    />
  );
};

export default ApidbCard;
