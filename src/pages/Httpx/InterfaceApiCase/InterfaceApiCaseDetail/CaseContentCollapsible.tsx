import ApidbCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/APIDBCard';
import ApiProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/APIProCard';
import AssertProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/AssertProCard';
import ConditionProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/ConditionProCard';
import GroupProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/GroupProCard';
import ScriptProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/ScriptProCard';
import WaitProCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/WaitProCard';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { FC, useEffect } from 'react';

const CaseContentType = {
  API: 1,
  GROUP: 2,
  CONDITION: 3,
  WAIT: 6,
  SCRIPT: 4,
  ASSERT: 8,
  DB: 5,
};

interface SelfProps {
  id: number;
  top?: any;
  step: number;
  moduleId?: number;
  projectId?: number;
  caseContent: IInterfaceCaseContent;
  caseId: number;
  collapsible: boolean;
  callback?: () => void;
  apiOpen?: boolean;
}

const CaseContentCollapsible: FC<SelfProps> = (props) => {
  const { projectId, caseContent, caseId, callback } = props;
  useEffect(() => {
    console.log(props);
  }, []);
  const dispatch = () => {
    switch (caseContent.content_type) {
      case CaseContentType.API:
        return (
          <ApiProCard
            open={props.apiOpen}
            id={props.id}
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.GROUP:
        return (
          <GroupProCard
            id={props.id}
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.WAIT:
        return (
          <WaitProCard
            id={props.id}
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.CONDITION:
        return (
          <ConditionProCard
            id={props.id}
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
            id={props.id}
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.ASSERT:
        return (
          <AssertProCard
            id={props.id}
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
      case CaseContentType.DB:
        return (
          <ApidbCard
            id={props.id}
            step={props.step}
            caseId={caseId}
            caseContent={caseContent}
            callback={callback}
          />
        );
    }
  };
  return <div>{dispatch()}</div>;
};

export default CaseContentCollapsible;
