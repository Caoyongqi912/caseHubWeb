import { updateCaseContent } from '@/api/play/playCase';
import AssertContentCard, {
  AssertContentInfo,
} from '@/components/ContentCard/AssertContentCard';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import { FC, useMemo, useState } from 'react';

interface Props {
  id: number;
  step: number;
  caseId: number;
  stepContent: IPlayStepContent;
  callback: () => void;
}

const Index: FC<Props> = ({ id, step, caseId, stepContent, callback }) => {
  const [showOption, setShowOption] = useState(false);

  const handleUpdateAssert = async (data: {
    id: number;
    content_name?: string;
    assert_list?: any[];
  }) => {
    return updateCaseContent(data);
  };

  const contentInfo: AssertContentInfo = useMemo(
    () => ({
      id: stepContent.id,
      content_name: stepContent.content_name,
      assert_list: stepContent.assert_list,
    }),
    [stepContent.id, stepContent.content_name, stepContent.assert_list],
  );

  return (
    <AssertContentCard
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
      updateAssert={handleUpdateAssert}
    />
  );
};

export default Index;
