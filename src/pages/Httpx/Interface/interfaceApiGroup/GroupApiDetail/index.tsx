import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import {
  queryInterfaceGroupApis,
  reorderInterfaceGroupApis,
  tryInterfaceGroup,
} from '@/api/inter/interGroup';
import DnDDraggable from '@/components/DnDDraggable';
import MyDrawer from '@/components/MyDrawer';
import GroupApiCollapsibleCard from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiCollapsibleCard';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import InterfaceApiResponseDetail from '@/pages/Httpx/InterfaceApiResponse/InterfaceApiResponseDetail';
import { IInterfaceAPI, ITryResponseInfo } from '@/pages/Httpx/types';
import { SendOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Dropdown, Empty, Space, Spin } from 'antd';
import { FC, useEffect, useState } from 'react';

interface SelfProps {
  groupId?: number;
  projectId?: number;
}
const Index: FC<SelfProps> = ({ groupId, projectId }) => {
  const [apisContent, setApisContent] = useState<any[]>([]);
  const [queryApis, setQueryApis] = useState<IInterfaceAPI[]>([]);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [tryResponses, setTryResponses] = useState<ITryResponseInfo[]>([]);
  const [reload, setReload] = useState(0);
  const [tryEnvs, setTryEnvs] = useState<{ key: number; label: string }[]>([]);

  const [showTryResponses, setShowTryResponses] = useState<boolean>(false);
  const [showTryResponsesLoading, setShowTryResponsesLoading] =
    useState<boolean>(false);
  const handleReload = async () => {
    setReload(reload + 1);
  };

  // 根据API 所属项目 查询 ENV Module
  useEffect(() => {
    if (projectId) {
      queryEnvBy({ project_id: projectId } as IEnv).then(
        async ({ code, data }) => {
          if (code === 0) {
            setTryEnvs(
              data.map((item: IEnv) => ({
                key: item.id,
                label: item.name,
              })),
            );
          }
        },
      );
    }
  }, [projectId]);

  useEffect(() => {
    if (groupId) {
      queryInterfaceGroupApis(groupId).then(async ({ code, data }) => {
        if (code === 0) {
          setQueryApis(data);
        }
      });
    }
  }, [reload, groupId]);

  useEffect(() => {
    if (queryApis) {
      setApisContent(
        queryApis.map((item, index) => ({
          id: (index + 1).toString(),
          api_Id: item.id,
          content: (
            <GroupApiCollapsibleCard
              step={index + 1}
              interfaceApiInfo={item}
              groupId={groupId!}
              callback={handleReload}
            />
          ),
        })),
      );
    }
  }, [queryApis]);

  const onDragEnd = (reorderedAPIContents: any[]) => {
    setApisContent(reorderedAPIContents);
    if (groupId) {
      const reorderData = reorderedAPIContents.map((item) => item.api_Id);
      reorderInterfaceGroupApis({ groupId: groupId, apiIds: reorderData }).then(
        async ({ code }) => {
          if (code === 0) {
            console.log('reorder success');
          }
        },
      );
    }
  };

  const TryGroup = async (e: any) => {
    console.log(e);
    const { key } = e;
    if (groupId) {
      setShowTryResponses(true);
      setShowTryResponsesLoading(true);
      const { code, data } = await tryInterfaceGroup({
        groupId: groupId,
        envId: key,
      });
      if (code === 0) {
        setTryResponses(data);
        setShowTryResponsesLoading(false);
      }
    }
  };

  return (
    <>
      <MyDrawer name={''} open={choiceOpen} setOpen={setChoiceOpen}>
        <InterfaceCaseChoiceApiTable
          currentGroupId={groupId}
          projectId={projectId}
          refresh={handleReload}
        />
      </MyDrawer>
      <MyDrawer
        name={'响应结果'}
        width={'80%'}
        open={showTryResponses}
        setOpen={setShowTryResponses}
      >
        <Spin
          tip={'接口请求中。。'}
          size={'large'}
          spinning={showTryResponsesLoading}
        >
          <InterfaceApiResponseDetail responses={tryResponses} />
        </Spin>
      </MyDrawer>
      <ProCard
        bodyStyle={{ padding: 20 }}
        extra={
          <Space>
            <Button type={'primary'} onClick={() => setChoiceOpen(true)}>
              Choice API
            </Button>
            {apisContent.length > 0 && (
              <Dropdown.Button
                type={'primary'}
                menu={{ items: tryEnvs, onClick: TryGroup }}
              >
                <SendOutlined />
                Try
              </Dropdown.Button>
            )}
          </Space>
        }
      >
        {apisContent.length === 0 && <Empty description={'No API'} />}
        <DnDDraggable
          items={apisContent}
          setItems={setApisContent}
          orderFetch={onDragEnd}
        />
      </ProCard>
    </>
  );
};

export default Index;
