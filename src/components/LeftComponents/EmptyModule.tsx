import { insertModule } from '@/api/base';
import ModuleModal from '@/components/LeftComponents/ModuleModal';
import { FolderAddOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, message, theme, Typography } from 'antd';
import { FC, useState } from 'react';

const { useToken } = theme;
const { Text, Title } = Typography;

export interface IProps {
  currentProjectId?: number;
  moduleType: number;
  callBack: () => void;
}

const EmptyModule: FC<IProps> = ({
  currentProjectId,
  moduleType,
  callBack,
}) => {
  const [open, setOpen] = useState(false);
  const { token } = useToken();

  const onFinish = async (value: { title: string }) => {
    if (currentProjectId) {
      const body = {
        title: value.title,
        project_id: currentProjectId,
        module_type: moduleType,
      };
      const { code, msg } = await insertModule(body);
      if (code === 0) {
        message.success(msg);
        setOpen(false);
        callBack();
      }
    }
  };

  return (
    <>
      <ModuleModal
        title={'创建'}
        open={open}
        onFinish={onFinish}
        setOpen={setOpen}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
          flex: 1,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: token.colorPrimaryBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <FolderAddOutlined
            style={{
              fontSize: 24,
              color: token.colorPrimary,
            }}
          />
        </div>

        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          styles={{
            image: {
              height: 60,
              marginBottom: 12,
              opacity: 0.5,
            },
          }}
          description={
            <div>
              <Title
                level={5}
                style={{
                  margin: 0,
                  color: token.colorText,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                还没有目录
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  color: token.colorTextSecondary,
                  display: 'block',
                }}
              >
                创建第一个目录来组织您的内容
              </Text>
            </div>
          }
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
          style={{ marginTop: 16 }}
        >
          去创建
        </Button>
      </div>
    </>
  );
};

export default EmptyModule;
