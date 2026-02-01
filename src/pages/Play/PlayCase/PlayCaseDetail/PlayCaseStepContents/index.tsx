import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import PlayStepContent from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayStepContent';
import { FC } from 'react';

const CaseContentType = {
  Play: 1,
  Play_GROUP: 2,
  Play_CONDITION: 3,
  Play_SCRIPT: 6,
};

interface SelfProps {
  id: number;
  top?: any;
  step: number;
  moduleId?: number;
  projectId?: number;
  stepContent: IPlayStepContent;
  caseId: number;
  collapsible: boolean;
  callback: () => void;
  apiOpen?: boolean;
}

const Index: FC<SelfProps> = (props) => {
  const { stepContent, id, caseId, step, callback } = props;

  const dispatch = () => {
    switch (stepContent.content_type) {
      case CaseContentType.Play:
        return (
          <PlayStepContent
            id={id}
            step={step}
            caseId={caseId}
            stepContent={stepContent}
            callback={callback}
          />
        );
      case CaseContentType.Play_GROUP:
        return null;
    }
  };
  return <div>{dispatch()}</div>;
};

export default Index;
