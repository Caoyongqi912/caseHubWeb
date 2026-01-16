import { caseAPIResultsByCase } from '@/api/inter/interCase';
import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import AssertResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/AssertResult';
import BdResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/BDResult';
import GroupResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/GroupResult';
import ScriptResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/ScriptResult';
import WaitResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/WaitResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { CaseContentType } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { Button, Empty } from 'antd';
import { FC, useEffect, useState } from 'react';
import ConditionResult from './ResultComponents/ConditionResult';

interface Props {
  caseResultId?: number | string;
}

const Index: FC<Props> = ({ caseResultId }) => {
  const [failOnly, setFailOnly] = useState(false);
  const [stepContentResult, setStepContentResult] =
    useState<ICaseContentResult[]>();
  const [originalData, setOriginalData] = useState<ICaseContentResult[]>([]); // 保存原始数据

  // 根据 failOnly 状态过滤数据
  useEffect(() => {
    if (originalData.length === 0) return;

    if (failOnly) {
      setStepContentResult(originalData.filter((item) => !item.content_result));
    } else {
      setStepContentResult([...originalData]);
    }
  }, [failOnly, originalData]);

  useEffect(() => {
    if (caseResultId) {
      caseAPIResultsByCase({ caseResultId: caseResultId }).then(
        ({ code, data }) => {
          if (code === 0) {
            console.log(data);
            setOriginalData(data); // 保存原始数据
            setStepContentResult(data);
          }
        },
      );
    }
    return () => {
      setOriginalData([]);
      setStepContentResult([]);
    };
  }, [caseResultId]);

  return (
    <ProCard
      bordered
      extra={
        <Button type={'primary'} onClick={() => setFailOnly(!failOnly)}>
          {failOnly ? '查看全部' : '只看失败'}
        </Button>
      }
    >
      {stepContentResult && stepContentResult.length > 0 ? (
        stepContentResult.map((item) => {
          switch (item.content_type) {
            case CaseContentType.API:
              return <APIResult result={item} prefix={'STEP'} />;
            case CaseContentType.GROUP:
              return <GroupResult result={item} />;
            case CaseContentType.CONDITION:
              return <ConditionResult result={item} />;
            case CaseContentType.WAIT:
              return <WaitResult result={item} />;
            case CaseContentType.SCRIPT:
              return <ScriptResult result={item} />;
            case CaseContentType.ASSERT:
              return <AssertResult result={item} />;
            case CaseContentType.DB:
              return <BdResult result={item} />;
          }
        })
      ) : (
        <Empty />
      )}
    </ProCard>
  );
};

export default Index;
