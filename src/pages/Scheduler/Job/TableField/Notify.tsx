import { IObjGet } from '@/api';
import { update_aps_job } from '@/api/base/aps';
import { queryPushConfig } from '@/api/base/pushConfig';
import MyModal from '@/components/MyModal';
import { IJob } from '@/pages/Project/types';
import { BellOutlined, EditOutlined } from '@ant-design/icons';
import {
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Form, message, theme, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  record: IJob;
  callback: () => void;
}

const Notify: FC<Props> = ({ record, callback }) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [notifyType, setNotifyType] = useState(record.job_notify_type ?? 1);
  const [pushOptions, setPushOptions] = useState<
    { value: number; label: string }[]
  >([]);

  useEffect(() => {
    queryPushConfig().then(({ code, data }) => {
      if (code === 0 && data?.length > 0) {
        setPushOptions(
          data.map((item) => ({ label: item.push_name, value: item.id })),
        );
      }
    });
  }, []);

  const notifyTypeConfig: IObjGet = {
    0: {
      label: '通知',
      bg: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
      color: '#fff',
    },
    1: {
      label: '不通知',
      bg: token.colorFillAlter,
      color: token.colorTextSecondary,
    },
  };

  const styles = useMemo(
    () => ({
      container: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 8px',
        borderRadius: 8,
        background: hovered ? token.colorPrimaryBg : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
      notifyBadge: (isActive: boolean, bg: string) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 6,
        background: isActive ? bg : token.colorFillAlter,
        color: isActive ? '#fff' : token.colorTextSecondary,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: 'nowrap' as const,
      }),
      notifyName: {
        padding: '3px 8px',
        borderRadius: 6,
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBgHover} 100%)`,
        color: token.colorPrimary,
        fontSize: 12,
        maxWidth: 80,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
      },
      emptyBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 10px',
        borderRadius: 8,
        background: hovered ? token.colorPrimaryBg : token.colorFillAlter,
        border: `1px dashed ${token.colorBorderSecondary}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
      emptyIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 6,
        background: token.colorFillSecondary,
      },
      emptyText: {
        fontSize: 12,
        color: token.colorTextSecondary,
      },
    }),
    [token, hovered],
  );

  const typeConfig =
    notifyTypeConfig[record.job_notify_type] || notifyTypeConfig[1];
  const isActive = record.job_notify_type === 0;

  const handleOpenModal = () => {
    setOpen(true);
    setNotifyType(record.job_notify_type ?? 1);
  };

  const updateJobNotify = async (values: any) => {
    const { code } = await update_aps_job({ ...values, uid: record.uid });
    if (code === 0) {
      message.success('保存成功');
      callback();
    }
    return true;
  };

  const renderForm = () => (
    <>
      <ProFormRadio.Group
        name="job_notify_type"
        label="是否通知"
        options={[
          { label: '通知', value: 0 },
          { label: '不通知', value: 1 },
        ]}
        initialValue={record.job_notify_type ?? 1}
        fieldProps={{
          onChange: (e) => setNotifyType(e.target.value),
        }}
      />
      <ProFormDependency name={['job_notify_type']}>
        {({ job_notify_type }) => {
          if (job_notify_type === 0) {
            return (
              <>
                <ProFormSelect
                  name="job_notify_id"
                  label="通知方式"
                  options={pushOptions}
                  rules={[{ required: true, message: '请选择通知方式' }]}
                />
                <ProFormSelect
                  name="job_notify_on"
                  label="通知时机"
                  mode="multiple"
                  options={[
                    { label: '任务开始', value: 0 },
                    { label: '任务成功', value: 1 },
                    { label: '任务失败', value: 2 },
                  ]}
                  initialValue={record.job_notify_on ?? [0, 1, 2]}
                />
              </>
            );
          }
          return null;
        }}
      </ProFormDependency>
    </>
  );

  if (!isActive) {
    return (
      <>
        <div
          style={styles.emptyBtn}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenModal();
          }}
        >
          <div style={styles.emptyIcon}>
            <BellOutlined
              style={{ fontSize: 11, color: token.colorTextSecondary }}
            />
          </div>
          <span style={styles.emptyText}>不通知</span>
          <EditOutlined
            style={{
              fontSize: 10,
              color: token.colorTextSecondary,
              marginLeft: 'auto',
            }}
          />
        </div>

        <MyModal
          form={form}
          onFinish={updateJobNotify}
          setOpen={setOpen}
          open={open}
          initialValues={record}
        >
          {renderForm()}
        </MyModal>
      </>
    );
  }

  return (
    <>
      <div
        style={styles.container}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpenModal();
        }}
      >
        <div style={styles.notifyBadge(isActive, typeConfig.bg)}>
          <BellOutlined style={{ fontSize: 11 }} />
          <span>{typeConfig.label}</span>
        </div>

        {record.job_notify_name && (
          <Text style={styles.notifyName} title={record.job_notify_name}>
            {record.job_notify_name}
          </Text>
        )}

        <EditOutlined
          style={{
            fontSize: 10,
            color: token.colorPrimary,
            marginLeft: 'auto',
            opacity: hovered ? 1 : 0.5,
          }}
        />
      </div>

      <MyModal
        form={form}
        onFinish={updateJobNotify}
        setOpen={setOpen}
        open={open}
        initialValues={record}
      >
        {renderForm()}
      </MyModal>
    </>
  );
};

export default Notify;
