import ApiProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/APIProCard';
import AssertProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/AssertProCard';
import ConditionProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/ConditionProCard';
import GroupProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/GroupProCard';
import ScriptProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/ScriptProCard';
import WaitProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/WaitProCard';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { FC } from 'react';

const CaseContentType = {
  API: 1,
  GROUP: 2,
  CONDITION: 3,
  WAIT: 6,
  SCRIPT: 4,
  ASSERT: 8,
};

interface SelfProps {
  top?: any;
  step: number;
  moduleId?: number;
  projectId?: number;
  caseContent: IInterfaceCaseContent;
  caseId: number;
  collapsible: boolean;
  callback?: () => void;
}

const CaseContentCollapsible: FC<SelfProps> = (props) => {
  const { projectId, caseContent, caseId, callback } = props;
  const dispatch = () => {
    switch (caseContent.content_type) {
      case CaseContentType.API:
        return (
          <ApiProCard
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.GROUP:
        return (
          <GroupProCard
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.WAIT:
        return (
          <WaitProCard
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.CONDITION:
        return (
          <ConditionProCard
            projectId={projectId}
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.SCRIPT:
        return (
          <ScriptProCard
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.ASSERT:
        return (
          <AssertProCard
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
    }
  };
  return <>{dispatch()}</>;
};

export default CaseContentCollapsible;
