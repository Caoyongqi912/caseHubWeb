import { clearPlayCaseResult, pagePlayCaseResult } from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import { IUIResult } from '@/pages/Play/componets/uiTypes';
import PlayCaseResultDetail from '@/pages/Play/PlayResult/PlayCaseResultDetail';
import { CONFIG } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { FC, useCallback, useRef, useState } from 'react';

interface PlayDebugResultProps {
  caseId?: number;
}

const PlayCaseResultTable: FC<PlayDebugResultProps> = ({ caseId }) => {
  const [currentUid, setCurrentUid] = useState<string>();
  const [open, setOpen] = useState(false);
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发

  const fetchDebugResult = useCallback(
    async (params: any) => {
      const { code, data } = await pagePlayCaseResult({
        ...params,
        ui_case_Id: caseId,
      });
      return pageData(code, data);
    },
    [caseId],
  );

  const columns: ProColumns<IUIResult>[] = [
    {
      title: 'uid',
      dataIndex: 'uid',
      valueType: 'text',
      copyable: true,
      fixed: 'left',
      width: '10%',
    },
    // {
    //   title: '用例名称',
    //   dataIndex: 'ui_case_name',
    //   valueType: 'text',
    //   render: (_, record) => {
    //     if (caseId !== undefined) {
    //       return record.ui_case_name;
    //     } else {
    //       return (
    //         <a
    //           onClick={() => {
    //             history.push(`/ui/case/detail/caseId=${record.ui_case_Id}`);
    //           }}
    //         >
    //           {record.ui_case_name}
    //         </a>
    //       );
    //     }
    //   },
    // },

    {
      title: '开始时间',
      dataIndex: 'start_time',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      valueType: 'select',

      valueEnum: CONFIG.UI_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.UI_STATUS_ENUM[record.status].tag;
      },
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      valueType: 'select',

      valueEnum: CONFIG.UI_RESULT_ENUM,
      render: (_, record) => {
        return CONFIG.UI_RESULT_ENUM[record.result]?.tag;
      },
    },
    {
      title: '执行人',
      dataIndex: 'starter_name',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'action',
      valueType: 'option',
      width: '10%',
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 'DONE') {
          return (
            <a
              onClick={() => {
                setCurrentUid(record.uid);
                setOpen(true);
              }}
            >
              详情
            </a>
          );
        }
      },
    },
  ];

  const Clear = (
    <>
      {caseId && (
        <Button
          type={'primary'}
          onClick={async () => {
            if (caseId) {
              clearPlayCaseResult({ caseId: caseId }).then(({ code, msg }) => {
                if (code === 0) {
                  message.success(msg);
                  actionRef.current?.reload();
                }
              });
            }
          }}
        >
          Clear All
        </Button>
      )}
    </>
  );
  return (
    <>
      <MyDrawer name={'测试详情'} open={open} width={'80%'} setOpen={setOpen}>
        <PlayCaseResultDetail resultId={currentUid} />
      </MyDrawer>
      <MyProTable
        toolBarRender={() => [Clear]}
        rowKey={'uid'}
        search={!caseId}
        actionRef={actionRef}
        columns={columns}
        request={fetchDebugResult}
      />
    </>
  );
};

export default PlayCaseResultTable;
