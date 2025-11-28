import { caseAPIResultsByCase } from '@/api/inter/interCase';
import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import AssertResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/AssertResult';
import GroupResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/GroupResult';
import ScriptResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/ScriptResult';
import WaitResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/WaitResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { CaseContentType } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { FC, useEffect, useState } from 'react';
import ConditionResult from './ResultComponents/ConditionResult';

interface Props {
  caseResultId?: number | string;
}
const Index: FC<Props> = ({ caseResultId }) => {
  const [stepContentResult, setStepContentResult] =
    useState<ICaseContentResult[]>();
  useEffect(() => {
    if (caseResultId) {
      caseAPIResultsByCase({ caseResultId: caseResultId }).then(
        ({ code, data }) => {
          if (code === 0) {
            console.log(data);
            setStepContentResult(data);
          }
        },
      );
    }
    return () => {
      setStepContentResult([]);
    };
  }, [caseResultId]);

  return (
    <ProCard loading={stepContentResult?.length === 0}>
      {stepContentResult &&
        stepContentResult.map((item, index) => {
          switch (item.content_type) {
            case CaseContentType.API:
              return <APIResult result={item} prefix={'STEP'} />;
            case CaseContentType.GROUP:
              return <GroupResult result={item} index={index} />;
            case CaseContentType.CONDITION:
              return <ConditionResult result={item} />;
            case CaseContentType.WAIT:
              return <WaitResult result={item} />;
            case CaseContentType.SCRIPT:
              return <ScriptResult result={item} />;
            case CaseContentType.ASSERT:
              return <AssertResult result={item} />;
          }
        })}
    </ProCard>
  );
};

export default Index;
