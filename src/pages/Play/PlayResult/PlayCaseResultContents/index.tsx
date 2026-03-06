import { queryCaseContentResult } from '@/api/play/playCase';
import { IPlayCaseContentResultResponse } from '@/pages/Play/componets/uiTypes';
import PlayStepAssertsResultContent from '@/pages/Play/PlayResult/PlayCaseResultContents/PlayStepAssertsResultContent';
import PlayStepDBResultContent from '@/pages/Play/PlayResult/PlayCaseResultContents/PlayStepDBResultContent';
import PlayStepGroupResultContents from '@/pages/Play/PlayResult/PlayCaseResultContents/PlayStepGroupResultContents';
import PlayStepInterfaceResultContent from '@/pages/Play/PlayResult/PlayCaseResultContents/PlayStepInterfaceResultContent';
import PlayStepResultContent from '@/pages/Play/PlayResult/PlayCaseResultContents/PlayStepResultContent';
import PlayStepScriptResultContent from '@/pages/Play/PlayResult/PlayCaseResultContents/PlayStepScriptResultContent';
import { ProCard } from '@ant-design/pro-components';
import { Button, Empty } from 'antd';
import { FC, useEffect, useState } from 'react';

const CaseContentType = {
  Play: 1,
  Play_GROUP: 2,
  Play_CONDITION: 3,
  Play_SCRIPT: 5,
  Play_DB: 8,
  Play_API: 4,
  Play_ASSERT: 6,
};

interface SelfProps {
  play_case_id?: number;
}

const Index: FC<SelfProps> = ({ play_case_id }) => {
  const [failOnly, setFailOnly] = useState(false);
  const [originalData, setOriginalData] = useState<
    IPlayCaseContentResultResponse[]
  >([]); // 保存原始数据
  const [stepContentResult, setStepContentResult] =
    useState<IPlayCaseContentResultResponse[]>();

  // 根据 failOnly 状态过滤数据
  useEffect(() => {
    if (originalData.length === 0) return;

    if (failOnly) {
      setStepContentResult(
        originalData.filter((item) => !item.result.content_result),
      );
    } else {
      setStepContentResult([...originalData]);
    }
  }, [failOnly, originalData]);

  useEffect(() => {
    if (play_case_id) {
      queryCaseContentResult(play_case_id).then(async ({ code, data }) => {
        if (code === 0) {
          setOriginalData(data);
          setStepContentResult(data);
        }
      });
    }
  }, [play_case_id]);
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
        stepContentResult.map((item, index) => {
          switch (item.result.content_type) {
            case CaseContentType.Play_ASSERT:
              return (
                <div key={index}>
                  <PlayStepAssertsResultContent content={item.result} />
                </div>
              );
            case CaseContentType.Play_API:
              return (
                <div key={index}>
                  <PlayStepInterfaceResultContent
                    content={item.result}
                    result={item.result.target_result}
                  />
                </div>
              );
            case CaseContentType.Play_SCRIPT:
              return (
                <div key={index}>
                  <PlayStepScriptResultContent content={item.result} />
                </div>
              );
            case CaseContentType.Play:
              return (
                <div key={index}>
                  <PlayStepResultContent content={item.result} />
                </div>
              );
            case CaseContentType.Play_DB:
              return (
                <div key={index}>
                  <PlayStepDBResultContent content={item.result} />
                </div>
              );
            case CaseContentType.Play_GROUP:
              return (
                <div key={index}>
                  <PlayStepGroupResultContents content={item} />
                </div>
              );
          }
        })
      ) : (
        <Empty />
      )}
    </ProCard>
  );
};

export default Index;
