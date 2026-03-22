import {
  copyCaseStep,
  removePlayStepContent,
  updateCaseContent,
} from '@/api/play/playCase';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  Button,
  message,
  Popconfirm,
  Space,
  Switch,
  theme,
  Tooltip,
} from 'antd';
import { FC } from 'react';

const { useToken } = theme;

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
  const { token } = useToken();

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
    <Space size={4}>
      {show && (
        <Space size={4}>
          {stepContent.content_type === CaseContentType.Play_GROUP && (
            <Tooltip title="查看分组详情">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() =>
                  window.open(
                    `/ui/group/detail/groupId=${stepContent.target_id}`,
                  )
                }
                style={{
                  color: token.colorPrimary,
                  borderRadius: token.borderRadiusSM,
                }}
              />
            </Tooltip>
          )}
          {stepContent.content_type !== CaseContentType.Play_API &&
            stepContent.content_type !== CaseContentType.Play_CONDITION && (
              <Tooltip title="复制步骤">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={copyContentStep}
                  style={{
                    color: token.colorInfo,
                    borderRadius: token.borderRadiusSM,
                  }}
                />
              </Tooltip>
            )}
          <Popconfirm
            title="确认删除"
            description="确定要删除这个步骤吗？"
            onConfirm={removeContentStep}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="删除步骤">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                style={{
                  color: token.colorError,
                  borderRadius: token.borderRadiusSM,
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )}
      <Tooltip
        title={
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>步骤控制</div>
            <div>开启：运行此步骤</div>
            <div>关闭：跳过此步骤</div>
          </div>
        }
      >
        <Switch
          checkedChildren={<PlayCircleOutlined />}
          unCheckedChildren={<StopOutlined />}
          value={stepContent.enable}
          style={{
            marginLeft: 8,
          }}
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
