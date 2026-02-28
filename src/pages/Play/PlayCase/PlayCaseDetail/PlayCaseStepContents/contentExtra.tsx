import {
  copyCaseStep,
  removePlayStepContent,
  updateCaseContent,
} from '@/api/play/playCase';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import {
  CopyTwoTone,
  DeleteTwoTone,
  InfoCircleTwoTone,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { message, Space, Switch, Tooltip } from 'antd';
import { FC } from 'react';

const CaseContentType = {
  Play: 1,
  Play_GROUP: 2,
  Play_CONDITION: 3,
  Play_SCRIPT: 6,
  Play_API: 4,
};

interface SelfProps {
  stepContent: IPlayStepContent;
  caseId: number;
  callback: () => void;
  show: boolean;
}

const ContentExtra: FC<SelfProps> = (props) => {
  const { stepContent, callback, show, caseId } = props;

  const copyContentStep = async () => {
    const { code, msg } = await copyCaseStep({
      case_id: caseId,
      content_id: stepContent.id,
    });
    if (code === 0) {
      message.success(msg);
      callback();
    }
  };
  const removeContentStep = async () => {
    const { code, msg } = await removePlayStepContent({
      case_id: caseId,
      content_id: stepContent.id,
    });
    if (code === 0) {
      message.success(msg);
      callback();
    }
  };

  return (
    <Space>
      <Space hidden={!show}>
        {stepContent.content_type === CaseContentType.Play_GROUP && (
          <Tooltip title="查看分组">
            <InfoCircleTwoTone
              onClick={() =>
                window.open(`/ui/group/detail/groupId=${stepContent.target_id}`)
              }
            />
          </Tooltip>
        )}
        {stepContent.content_type !== CaseContentType.Play_API && (
          <Tooltip title="复制步骤">
            <CopyTwoTone onClick={copyContentStep} />
          </Tooltip>
        )}

        <Tooltip title="删除步骤">
          <DeleteTwoTone onClick={removeContentStep} />
        </Tooltip>
      </Space>
      <Tooltip title="关闭后此步骤将不运行、只在用例场景中生效">
        <Switch
          style={{ marginLeft: 10, marginRight: 20 }}
          checkedChildren={<PlayCircleOutlined />}
          unCheckedChildren={<StopOutlined />}
          value={stepContent.enable}
          onClick={async (checked, _) => {
            const { code } = await updateCaseContent({
              id: stepContent.id,
              enable: checked,
            });
            if (code === 0) {
              callback();
            }
          }}
        />
      </Tooltip>
    </Space>
  );
};

export default ContentExtra;
