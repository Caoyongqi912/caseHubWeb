import {
  copyCaseContentStep,
  removeCaseContentStep,
  updateCaseContent,
} from '@/api/inter/interCase';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { CaseContentType } from '@/utils/config';
import {
  CopyOutlined,
  DeleteOutlined,
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
  const { token } = useToken();

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
      content_id: caseContent.id,
    });
    if (code === 0) {
      message.success(msg);
      callback && callback();
    }
  };

  return (
    <Space size={4}>
      {show && (
        <Space size={4}>
          {caseContent.content_type !== CaseContentType.GROUP && (
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
          value={caseContent.enable}
          style={{
            marginLeft: 8,
          }}
          onClick={async (checked, _) => {
            const { code } = await updateCaseContent({
              content_id: caseContent.id,
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
