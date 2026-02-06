import { queryCaseContentResult } from '@/api/play/playCase';
import { IPlayCaseContentResult } from '@/pages/Play/componets/uiTypes';
import PlayStepResultContent from '@/pages/Play/PlayResult/PlayCaseResultContents/PlayStepResultContent';
import { ProCard } from '@ant-design/pro-components';
import { Button, Empty } from 'antd';
import { FC, useEffect, useState } from 'react';

const CaseContentType = {
  Play: 1,
  Play_GROUP: 2,
  Play_CONDITION: 3,
  Play_SCRIPT: 6,
};

interface SelfProps {
  play_case_id?: number;
}

const Index: FC<SelfProps> = ({ play_case_id }) => {
  const [failOnly, setFailOnly] = useState(false);
  const [originalData, setOriginalData] = useState<IPlayCaseContentResult[]>(
    [],
  ); // 保存原始数据
  const [stepContentResult, setStepContentResult] =
    useState<IPlayCaseContentResult[]>();

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
          switch (item.content_type) {
            case CaseContentType.Play:
              return (
                <div key={index}>
                  <PlayStepResultContent content={item} />
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
