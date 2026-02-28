import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import PlayGroupContent from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayGroupContent';
import PlayScriptContent from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayScriptContent';
import PlayStepContent from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayStepContent';
import PlayStepDBContent from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayStepDBContent';
import { FC } from 'react';

const CaseContentType = {
  Play: 1,
  Play_GROUP: 2,
  Play_CONDITION: 3,
  Play_SCRIPT: 5,
  Play_DB: 8,
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
        return (
          <PlayGroupContent
            id={id}
            step={step}
            caseId={caseId}
            stepContent={stepContent}
            callback={callback}
          />
        );
      case CaseContentType.Play_DB:
        return (
          <PlayStepDBContent
            id={id}
            step={step}
            caseId={caseId}
            stepContent={stepContent}
            callback={callback}
          />
        );
      case CaseContentType.Play_SCRIPT:
        return (
          <PlayScriptContent
            id={id}
            step={step}
            caseId={caseId}
            stepContent={stepContent}
            callback={callback}
          />
        );
    }
  };
  return <div key={props.id}>{dispatch()}</div>;
};

export default Index;
