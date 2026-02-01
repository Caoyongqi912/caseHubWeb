import {
  getPlayGroup,
  queryPlayGroupSubSteps,
  reOrderSubSteps,
} from '@/api/play/playCase';
import DnDDraggable from '@/components/DnDDraggable';
import MyDrawer from '@/components/MyDrawer';
import { IPlayStepDetail } from '@/pages/Play/componets/uiTypes';
import PlayCommonChoiceTable from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCommonChoiceTable';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import PlayStepGroupCollapsible from '@/pages/Play/PlayStep/PlayStepGroup/PlayStepGroupCollapsible';
import { useParams } from '@@/exports';
import { EditOutlined, SelectOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Dropdown, Empty } from 'antd';
import { useEffect, useState } from 'react';

const PlayStepGroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [subSteps, setSubSteps] = useState<IPlayStepDetail[]>([]);
  const [subStepsContent, setSubStepsContent] = useState<any[]>([]);
  const [openAddSubStep, setOpenAddSubStep] = useState(false);
  const [refresh, setRefresh] = useState<number>(0);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [moduleId, setModuleId] = useState<number>();
  const [openChoiceStepDrawer, setOpenChoiceStepDrawer] = useState(false);

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
              id={index}
              step={index + 1}
              currentProjectId={projectId}
              stepInfo={item}
              callback={handelRefresh}
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
    setOpenChoiceStepDrawer(false);
  };
  const onDragEnd = async (reorderedUIContents: any[]) => {
    if (groupId) {
      const reorderData = reorderedUIContents.map((item) => item.step_id);
      reOrderSubSteps({
        group_id: parseInt(groupId),
        step_list: reorderData,
      }).then(async () => {
        await handelRefresh();
      });
    }
  };

  const CardExtra = (
    <>
      {groupId && (
        <Dropdown.Button
          menu={{
            items: [
              {
                key: 'add_step',
                label: '添加私有步骤',
                icon: <EditOutlined style={{ color: 'orange' }} />,
                onClick: () => setOpenAddSubStep(true),
              },
              {
                type: 'divider',
              },

              {
                key: 'choice_step',
                label: '选择公共步骤',
                icon: <SelectOutlined style={{ color: 'blue' }} />,
                onClick: () => setOpenChoiceStepDrawer(true),
              },
            ],
          }}
          type="primary"
        >
          添加
        </Dropdown.Button>
      )}
    </>
  );

  return (
    <>
      <MyDrawer
        width={'auto'}
        open={openAddSubStep}
        setOpen={setOpenAddSubStep}
      >
        {groupId && (
          <PlayStepDetail
            currentModuleId={moduleId}
            currentProjectId={projectId}
            callback={handelRefresh}
            play_group_id={parseInt(groupId)}
          />
        )}
      </MyDrawer>

      <MyDrawer
        name={'关联公共步骤'}
        open={openChoiceStepDrawer}
        setOpen={setOpenChoiceStepDrawer}
      >
        <PlayCommonChoiceTable
          projectId={projectId?.toString()}
          callBackFunc={handelRefresh}
          groupId={groupId}
        />
      </MyDrawer>
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
      </ProCard>
    </>
  );
};

export default PlayStepGroupDetail;
