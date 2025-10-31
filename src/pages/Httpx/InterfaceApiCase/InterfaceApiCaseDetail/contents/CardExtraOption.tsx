import {
  copyCaseContentStep,
  removeCaseContentStep,
  updateCaseContent,
} from '@/api/inter/interCase';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { CaseContentType } from '@/utils/config';
import {
  CopyTwoTone,
  DeleteTwoTone,
  InfoCircleTwoTone,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { message, Space, Switch, Tooltip } from 'antd';
import { FC } from 'react';

interface SelfProps {
  caseContent: IInterfaceCaseContent;
  caseId: number;
  callback?: () => void;
  show: boolean;
}

const CardExtraOption: FC<SelfProps> = ({
  caseContent,
  show,
  callback,
  caseId,
}) => {
  const copyContentStep = async () => {
    const { code, msg } = await copyCaseContentStep({
      case_id: caseId,
      content_id: caseContent.id,
    });
    if (code === 0) {
      message.success(msg);
      callback && callback();
    }
  };

  const removeContentStep = async () => {
    const { code, msg } = await removeCaseContentStep({
      case_id: caseId,
      content_step_id: caseContent.id,
    });
    if (code === 0) {
      message.success(msg);
      callback && callback();
    }
  };
  return (
    <Space>
      <Space hidden={!show}>
        {caseContent.content_type === CaseContentType.GROUP && (
          <Tooltip title="查看分组">
            <InfoCircleTwoTone
              onClick={() =>
                window.open(
                  `/interface/group/detail/groupId=${caseContent.target_id}`,
                )
              }
            />
          </Tooltip>
        )}
        <Tooltip title="复制步骤">
          <CopyTwoTone onClick={copyContentStep} />
        </Tooltip>
        <Tooltip title="删除步骤">
          <DeleteTwoTone onClick={removeContentStep} />
        </Tooltip>
      </Space>
      <Tooltip title="关闭后此步骤将不运行、只在用例场景中生效">
        <Switch
          style={{ marginLeft: 10, marginRight: 20 }}
          checkedChildren={<PlayCircleOutlined />}
          unCheckedChildren={<StopOutlined />}
          value={caseContent.enable}
          onClick={async (checked, _) => {
            const { code, data } = await updateCaseContent({
              id: caseContent.id,
              enable: checked,
            });
            if (code === 0) {
              callback?.();
            }
          }}
        />
      </Tooltip>
    </Space>
  );
};
export default CardExtraOption;
