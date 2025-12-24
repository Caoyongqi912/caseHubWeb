import {
  getPlayGroup,
  queryPlayGroupSubSteps,
  reOrderSubSteps,
} from '@/api/play/playCase';
import DnDDraggable from '@/components/DnDDraggable';
import MyDrawer from '@/components/MyDrawer';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import PlayStepGroupCollapsible from '@/pages/Play/PlayStep/PlayStepGroup/PlayStepGroupCollapsible';
import PlayStepInfo from '@/pages/Play/PlayStep/PlayStepInfo';
import { useParams } from '@@/exports';
import { ProCard } from '@ant-design/pro-components';
import { Button, Empty } from 'antd';
import { useEffect, useState } from 'react';

const PlayStepGroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [subSteps, setSubSteps] = useState<IUICaseSteps[]>([]);
  const [subStepsContent, setSubStepsContent] = useState<any[]>([]);
  const [openAddSubStep, setOpenAddSubStep] = useState(false);
  const [refresh, setRefresh] = useState<number>(0);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [moduleId, setModuleId] = useState<number>();

  /**
   * 通过组ID
   * 查询组下的所有子步骤
   * 查询组信息
   */
  useEffect(() => {
    if (groupId) {
      Promise.all([
        getPlayGroup(groupId),
        queryPlayGroupSubSteps(parseInt(groupId)),
      ]).then(async ([detail, steps]) => {
        if (detail.code === 0) {
          setProjectId(detail.data.project_id);
          setModuleId(detail.data.module_id);
        }
        if (steps.code === 0) {
          setSubSteps(steps.data);
        }
      });
    }
  }, [groupId, refresh]);

  useEffect(() => {
    if (subSteps && subSteps.length > 0) {
      setSubStepsContent(
        subSteps.map((item, index) => ({
          id: index,
          step_id: item.id,
          content: (
            <PlayStepGroupCollapsible
              step={index + 1}
              currentProjectId={projectId}
              subStepInfo={item}
              callBackFunc={handelRefresh}
              groupId={parseInt(groupId!)}
            />
          ),
        })),
      );
    }
  }, [subSteps, refresh]);

  const handelRefresh = async () => {
    setRefresh(refresh + 1);
    setOpenAddSubStep(false);
  };
  const onDragEnd = async (reorderedUIContents: any[]) => {
    if (groupId) {
      const reorderData = reorderedUIContents.map((item) => item.step_id);
      reOrderSubSteps({
        groupId: parseInt(groupId),
        stepIdList: reorderData,
      }).then(async () => {
        await handelRefresh();
      });
    }
  };

  const CardExtra = (
    <>
      {groupId && (
        <Button
          onClick={() => {
            setOpenAddSubStep(true);
          }}
          type="primary"
        >
          Add Step
        </Button>
      )}
    </>
  );

  return (
    <ProCard
      bordered
      bodyStyle={{
        minHeight: '100vh',
      }}
      extra={CardExtra}
    >
      {subSteps.length > 0 ? (
        <DnDDraggable
          items={subStepsContent}
          setItems={setSubStepsContent}
          orderFetch={onDragEnd}
        />
      ) : (
        <Empty description={'暂无子步骤'} />
      )}
      <MyDrawer
        name={'Step'}
        width={'auto'}
        open={openAddSubStep}
        setOpen={setOpenAddSubStep}
      >
        {groupId && (
          <PlayStepInfo
            currentModuleId={moduleId}
            currentProjectId={projectId}
            is_common_step={false}
            callback={handelRefresh}
            play_group_id={parseInt(groupId)}
            readonly={false}
          />
        )}
      </MyDrawer>
    </ProCard>
  );
};

export default PlayStepGroupDetail;
