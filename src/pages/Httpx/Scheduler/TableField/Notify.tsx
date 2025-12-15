import { IObjGet } from '@/api';
import { update_aps_job } from '@/api/base/aps';
import MyModal from '@/components/MyModal';
import NotifyForm from '@/pages/Httpx/Scheduler/JobForm/NotifyForm';
import { IJob } from '@/pages/Project/types';
import {
  BellFilled,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  NotificationOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Form, message, Space, Tag, Tooltip, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';

const { Text, Link } = Typography;

interface Props {
  record: IJob;
  callback: () => void;
}

const Notify: FC<Props> = ({ record, callback }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  useEffect(() => {
    if (!record) return;
    form.setFieldsValue(record);
  }, [record]);
  // 通知类型配置
  const notifyTypeConfig: IObjGet = {
    0: { label: '通知', color: 'success', icon: <BellFilled /> },
    1: { label: '不通知', color: 'warning', icon: <BellOutlined /> },
  };

  // 通知时机配置
  const notifyOnConfig: IObjGet = {
    0: { label: '任务开始', color: 'blue', icon: <PlayCircleOutlined /> },
    1: { label: '任务成功', color: 'green', icon: <CheckCircleOutlined /> },
    2: { label: '任务失败', color: 'red', icon: <CloseCircleOutlined /> },
  };

  const typeConfig =
    notifyTypeConfig[record.job_notify_type] || notifyTypeConfig[1];
  const notifyOnArray = Array.isArray(record.job_notify_on)
    ? record.job_notify_on
    : [];
  const updateJobNotify = async (values: IJob) => {
    const { code } = await update_aps_job({
      ...values,
      uid: record.uid,
    });
    if (code === 0) {
      message.success('参数保存成功');
      callback();
    }
    return true;
  };
  return (
    <>
      <ProCard
        onMouseEnter={() => {
          setShowEdit(true);
        }}
        onMouseLeave={() => {
          setShowEdit(false);
        }}
        size="small"
        layout="center"
        style={{
          borderRadius: '6px',
        }}
        bodyStyle={{
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* 通知名称和类型 */}
        {record.job_notify_type === 0 && (
          <Space align="center" style={{ width: '100%' }}>
            <Tooltip title="推送通知">
              <NotificationOutlined
                style={{
                  color: '#722ed1',
                  fontSize: '14px',
                  marginRight: '8px',
                }}
              />
            </Tooltip>
            <Tag
              color={typeConfig.color}
              icon={typeConfig.icon}
              style={{ margin: 0 }}
            >
              {typeConfig.label}
            </Tag>
            {record.job_notify_name && (
              <Tag color={'blue'}>{record.job_notify_name}</Tag>
            )}
            {showEdit && (
              <Link
                style={{
                  fontSize: '12px',
                  marginLeft: 'auto',
                }}
                onClick={(e) => {
                  setOpen(true);
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                修改
              </Link>
            )}
          </Space>
        )}

        {/* 通知时机 */}
        {notifyOnArray.length > 0 ? (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              通知时机:
            </Text>
            <Space wrap size={[4, 4]}>
              {notifyOnArray.map((onType) => {
                const config = notifyOnConfig[onType];
                if (!config) return null;
                return (
                  <Tag
                    key={onType}
                    color={config.color}
                    style={{
                      margin: 0,
                      fontSize: '10px',
                      padding: '1px 6px',
                    }}
                  >
                    {config.label}
                  </Tag>
                );
              })}
            </Space>
          </Space>
        ) : (
          <Space
            direction="vertical"
            align="center"
            size={2}
            style={{ width: '100%' }}
          >
            <Text
              type="secondary"
              style={{
                fontSize: '11px',
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              未配置通知时机
            </Text>

            <Link
              style={{ fontSize: '12px' }}
              onClick={(e) => {
                setOpen(true);
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              添加
            </Link>
          </Space>
        )}
      </ProCard>
      <MyModal
        onFinish={updateJobNotify}
        setOpen={setOpen}
        open={open}
        form={form}
      >
        <NotifyForm
          setNotifyName={(value) => {
            form.setFieldsValue({
              job_notify_name: value,
            });
          }}
        />
      </MyModal>
    </>
  );
};

export default Notify;
