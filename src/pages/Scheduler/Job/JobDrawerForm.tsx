import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import { add_aps_job, update_aps_job } from '@/api/base/aps';
import { IJob } from '@/pages/Project/types';
import ApiTaskChoiceTable from '@/pages/Scheduler/Job/APITaskChoiceTable';
import {
  ApiOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
  ScheduleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormList,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { ProFormDateTimePicker } from '@ant-design/pro-form';
import { Button, Form, message, theme, Typography } from 'antd';
import moment from 'moment';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { queryPushConfig } from '@/api/base/pushConfig';
import JobTasksList from '@/pages/Scheduler/Job/JobTasksList';
import PlayTaskChoiceTable from '@/pages/Scheduler/Job/PlayTaskChoiceTable';

const { useToken } = theme;
const { Text, Title } = Typography;

const TriggerType = {
  once: 1,
  cron: 2,
  fixedRate: 3,
};

interface SelfProps {
  callback: () => void;
  currentModuleId?: number;
  currentProjectId?: number;
  currentJob?: IJob;
}

const JobDrawerForm: FC<SelfProps> = (props) => {
  const { currentProjectId, currentModuleId, currentJob, callback } = props;
  const { token } = useToken();
  const [form] = Form.useForm();
  const [jobType, setJobType] = useState<number>(currentJob?.job_type || 1);
  const [apiEnvs, setApiEnvs] = useState<{ value: number; label: string }[]>(
    [],
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showChoiceTable, setShowChoiceTable] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValid, setFormValid] = useState(false);
  const [pushOptions, setPushOptions] = useState<
    { value: number; label: string }[]
  >([]);

  const steps = [
    { key: 0, title: '基础信息', icon: <SettingOutlined />, color: '#6366f1' },
    {
      key: 1,
      title: '选择任务',
      icon: <CheckCircleOutlined />,
      color: '#8b5cf6',
    },
    {
      key: 2,
      title: '设置定时',
      icon: <ClockCircleOutlined />,
      color: '#06b6d4',
    },
    { key: 3, title: '通知配置', icon: <BellOutlined />, color: '#10b981' },
  ];

  const styles = useMemo(
    () => ({
      container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        background: token.colorBgContainer,
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        flexShrink: 0,
      },
      headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      },
      headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      },
      stepTabs: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      },
      stepTab: (isActive: boolean, disabled: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        background: isActive ? token.colorPrimaryBg : 'transparent',
        border: `1px solid ${isActive ? token.colorPrimary : 'transparent'}`,
        opacity: disabled ? 0.5 : 1,
      }),
      stepTabIcon: (
        isActive: boolean,
        isCompleted: boolean,
        color: string,
      ) => ({
        width: 24,
        height: 24,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isCompleted
          ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
          : isActive
          ? `${color}20`
          : token.colorFillAlter,
        color: isCompleted
          ? '#fff'
          : isActive
          ? color
          : token.colorTextSecondary,
        fontSize: 12,
      }),
      btnPrimary: {
        height: 36,
        padding: '0 20px',
        borderRadius: 8,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
      btnDefault: {
        height: 36,
        padding: '0 16px',
        borderRadius: 8,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      },
      content: {
        flex: 1,
        padding: 20,
        overflow: 'auto',
      },
      contentWrapper: {
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
      },
      card: {
        background: token.colorBgContainer,
        borderRadius: 10,
        border: `1px solid ${token.colorBorderSecondary}`,
        marginBottom: 12,
        overflow: 'hidden',
      },
      cardHeader: {
        padding: '10px 14px',
        background: `linear-gradient(90deg, ${token.colorPrimaryBg} 0%, transparent 100%)`,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      cardBody: {
        padding: 14,
      },
      typeCardRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
      },
      typeCard: (isSelected: boolean, color: string) => ({
        padding: 12,
        borderRadius: 8,
        border: `2px solid ${isSelected ? color : token.colorBorderSecondary}`,
        background: isSelected ? `${color}08` : token.colorBgContainer,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative' as const,
        overflow: 'hidden',
      }),
      typeIconBg: (isSelected: boolean, color: string) => ({
        position: 'absolute' as const,
        top: -8,
        right: -8,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: isSelected ? `${color}15` : 'transparent',
        transition: 'all 0.3s ease',
      }),
      stepContent: (visible: boolean) => ({
        display: visible ? 'block' : 'none',
      }),
    }),
    [token],
  );

  useEffect(() => {
    if (!currentJob) return;
    setShowChoiceTable(false);
    setSelectedRowKeys(currentJob.job_task_id_list);
    setJobType(currentJob.job_type);
    form.setFieldsValue({
      ...currentJob,
      job_execute_time: currentJob.job_execute_time
        ? moment(currentJob.job_execute_time)
        : undefined,
    });
    setFormValid(true);
  }, [currentJob, form]);

  useEffect(() => {
    if (!currentProjectId) return;
    queryEnvBy({ project_id: currentProjectId } as IEnv).then(
      async ({ code, data }) => {
        if (code === 0) {
          setApiEnvs(
            data.map((item: IEnv) => ({
              value: item.id,
              label: item.name,
            })),
          );
        }
      },
    );
  }, [currentProjectId]);

  useEffect(() => {
    queryPushConfig().then(async ({ code, data }) => {
      if (code === 0 && data.length > 0) {
        setPushOptions(
          data.map((item) => ({
            label: item.push_name,
            value: item.id,
          })),
        );
      }
    });
  }, []);

  const setJobs = (rowKeys: React.Key[]) => {
    setSelectedRowKeys(rowKeys);
  };

  const setNotifyName2Form = (value: string) => {
    form.setFieldsValue({ job_notify_name: value });
  };

  const handleJobTypeChange = (value: number) => {
    const prevJobType = jobType;
    setJobType(value);
    form.setFieldsValue({ job_type: value });
    if (prevJobType !== value && selectedRowKeys.length > 0) {
      setSelectedRowKeys([]);
      setShowChoiceTable(true);
      if (currentJob) {
        message.info('任务类型已变更，请重新选择任务');
      }
    }
  };

  const validateStep0 = async () => {
    try {
      const values = await form.validateFields([
        'job_name',
        'job_type',
        'job_env_id',
      ]);
      if (values.job_name && values.job_type) {
        if (values.job_type === 1 && !values.job_env_id) {
          message.error('请选择运行环境');
          return false;
        }
        setFormValid(true);
        return true;
      }
      return false;
    } catch {
      message.error('请完成基础信息填写');
      return false;
    }
  };

  const handleStepChange = async (targetStep: number) => {
    if (targetStep > currentStep) {
      if (currentStep === 0) {
        const valid = await validateStep0();
        if (!valid) return;
      }
      if (currentStep === 1 && selectedRowKeys.length === 0) {
        message.error('请选择任务');
        return;
      }
    }
    setCurrentStep(targetStep);
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      const valid = await validateStep0();
      if (!valid) return;
    }
    if (currentStep === 1 && selectedRowKeys.length === 0) {
      message.error('请选择任务');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        job_task_id_list: selectedRowKeys as string[],
        job_execute_time: values.job_execute_time
          ? moment(values.job_execute_time).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
      };

      if (currentJob) {
        const { code, msg } = await update_aps_job({
          ...submitData,
          uid: currentJob.uid,
        });
        if (code === 0) {
          callback();
          message.success(msg);
        }
      } else {
        if (currentProjectId && currentModuleId) {
          const { code, msg } = await add_aps_job({
            ...submitData,
            module_id: currentModuleId,
            project_id: currentProjectId,
          });
          if (code === 0) {
            callback();
            message.success(msg);
          }
        }
      }
    } catch {
      message.error('请完成表单填写');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <ScheduleOutlined style={{ fontSize: 18, color: '#fff' }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, fontSize: 15 }}>
              {currentJob ? '编辑定时任务' : '创建定时任务'}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {currentJob ? `任务ID: ${currentJob.uid}` : '配置自动化执行计划'}
            </Text>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.stepTabs}>
            {steps.map((step) => {
              const isActive = currentStep === step.key;
              const isCompleted = currentStep > step.key;
              const disabled = step.key > 0 && !formValid && !currentJob;
              return (
                <div
                  key={step.key}
                  style={styles.stepTab(isActive, disabled)}
                  onClick={() => {
                    if (disabled) return;
                    handleStepChange(step.key);
                  }}
                >
                  <div
                    style={styles.stepTabIcon(
                      isActive,
                      isCompleted,
                      step.color,
                    )}
                  >
                    {isCompleted ? <CheckCircleOutlined /> : step.icon}
                  </div>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 500 : 400,
                      color: disabled
                        ? token.colorTextDisabled
                        : isActive
                        ? token.colorText
                        : token.colorTextSecondary,
                    }}
                  >
                    {step.title}
                  </Text>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {currentStep > 0 && (
              <Button
                style={styles.btnDefault}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <LeftOutlined /> 上一步
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                style={styles.btnPrimary}
                onClick={handleNext}
              >
                下一步 <RightOutlined />
              </Button>
            ) : (
              <Button
                type="primary"
                style={styles.btnPrimary}
                onClick={handleSubmit}
              >
                <CheckCircleOutlined /> {currentJob ? '保存修改' : '创建任务'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.contentWrapper}>
          <ProForm form={form} submitter={false} layout="vertical">
            {/* Step 0: 基础信息 - 始终渲染，用CSS控制显示 */}
            <div style={styles.stepContent(currentStep === 0)}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <ScheduleOutlined
                    style={{ color: token.colorPrimary, fontSize: 12 }}
                  />
                  <Text strong style={{ fontSize: 13 }}>
                    任务名称
                  </Text>
                </div>
                <div style={styles.cardBody}>
                  <ProFormText
                    name="job_name"
                    placeholder="输入任务名称，如：每日回归测试"
                    rules={[{ required: true, message: '请输入任务名称' }]}
                    proFieldProps={{ mode: 'edit' }}
                    fieldProps={{ style: { marginBottom: 0 } }}
                  />
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <ThunderboltOutlined
                    style={{ color: token.colorPrimary, fontSize: 12 }}
                  />
                  <Text strong style={{ fontSize: 13 }}>
                    任务类型
                  </Text>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.typeCardRow}>
                    <div
                      style={styles.typeCard(jobType === 1, '#6366f1')}
                      onClick={() => handleJobTypeChange(1)}
                    >
                      <div
                        style={styles.typeIconBg(jobType === 1, '#6366f1')}
                      />
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          position: 'relative' as const,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background:
                              jobType === 1 ? '#6366f1' : token.colorFillAlter,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ApiOutlined
                            style={{
                              fontSize: 16,
                              color:
                                jobType === 1
                                  ? '#fff'
                                  : token.colorTextSecondary,
                            }}
                          />
                        </div>
                        <div>
                          <Text
                            strong
                            style={{
                              display: 'block',
                              fontSize: 13,
                              color:
                                jobType === 1 ? '#6366f1' : token.colorText,
                            }}
                          >
                            API 测试
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            接口自动化
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div
                      style={styles.typeCard(jobType === 2, '#10b981')}
                      onClick={() => handleJobTypeChange(2)}
                    >
                      <div
                        style={styles.typeIconBg(jobType === 2, '#10b981')}
                      />
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          position: 'relative' as const,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background:
                              jobType === 2 ? '#10b981' : token.colorFillAlter,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <DesktopOutlined
                            style={{
                              fontSize: 16,
                              color:
                                jobType === 2
                                  ? '#fff'
                                  : token.colorTextSecondary,
                            }}
                          />
                        </div>
                        <div>
                          <Text
                            strong
                            style={{
                              display: 'block',
                              fontSize: 13,
                              color:
                                jobType === 2 ? '#10b981' : token.colorText,
                            }}
                          >
                            UI 测试
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            界面自动化
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ProFormText name="job_type" initialValue={1} hidden />
                </div>
              </div>

              {jobType === 1 && (
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <EnvironmentOutlined
                      style={{ color: token.colorPrimary, fontSize: 12 }}
                    />
                    <Text strong style={{ fontSize: 13 }}>
                      运行环境
                    </Text>
                  </div>
                  <div style={styles.cardBody}>
                    <ProFormSelect
                      name="job_env_id"
                      placeholder="选择测试环境"
                      options={apiEnvs}
                      rules={[{ required: true, message: '请选择运行环境' }]}
                      onChange={(value) => {
                        form.setFieldsValue({
                          job_env_name: apiEnvs.find(
                            (item) => item.value === value,
                          )?.label,
                        });
                      }}
                    />
                    <ProFormText name="job_env_name" hidden />
                  </div>
                </div>
              )}

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <PlusOutlined
                    style={{ color: token.colorPrimary, fontSize: 12 }}
                  />
                  <Text strong style={{ fontSize: 13 }}>
                    运行参数
                  </Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, marginLeft: 'auto' }}
                  >
                    可选
                  </Text>
                </div>
                <div style={styles.cardBody}>
                  <ProFormList
                    name="job_kwargs"
                    copyIconProps={false}
                    deleteIconProps={false}
                  >
                    <ProForm.Group key="group">
                      <ProFormText name="key" placeholder="参数名" />
                      <ProFormText name="value" placeholder="参数值" />
                    </ProForm.Group>
                  </ProFormList>
                </div>
              </div>
            </div>

            {/* Step 1: 选择任务 - 始终渲染，用CSS控制显示 */}
            <div style={styles.stepContent(currentStep === 1)}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <CheckCircleOutlined
                    style={{ color: token.colorPrimary, fontSize: 12 }}
                  />
                  <Text strong style={{ fontSize: 13 }}>
                    选择任务
                  </Text>
                </div>
                <div style={{ ...styles.cardBody, padding: 0 }}>
                  {showChoiceTable ? (
                    jobType === 1 ? (
                      <ApiTaskChoiceTable
                        currentProjectId={currentProjectId}
                        setJobs={setJobs}
                      />
                    ) : (
                      <PlayTaskChoiceTable
                        currentProjectId={currentProjectId}
                        setJobs={setJobs}
                      />
                    )
                  ) : (
                    <JobTasksList
                      setShowChoiceTable={setShowChoiceTable}
                      jobId={currentJob?.uid}
                      setJobs={setJobs}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: 设置定时 - 始终渲染，用CSS控制显示 */}
            <div style={styles.stepContent(currentStep === 2)}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <ClockCircleOutlined
                    style={{ color: token.colorPrimary, fontSize: 12 }}
                  />
                  <Text strong style={{ fontSize: 13 }}>
                    定时配置
                  </Text>
                </div>
                <div style={styles.cardBody}>
                  <ProForm.Group>
                    <ProFormSelect
                      name="job_trigger_type"
                      label="触发类型"
                      required
                      width="md"
                      rules={[{ required: true, message: '请选择触发类型' }]}
                      options={[
                        { label: '单次执行', value: 1 },
                        { label: '周期执行', value: 2 },
                        { label: '固定频率', value: 3 },
                      ]}
                    />
                    <ProFormSelect
                      name="job_execute_strategy"
                      label="执行策略"
                      width="md"
                      tooltip="当任务正在执行时，新触发的任务如何处理"
                      options={[
                        { label: '并行执行', value: 2 },
                        { label: '跳过执行', value: 1 },
                        { label: '等待执行', value: 3 },
                      ]}
                      initialValue={2}
                    />
                  </ProForm.Group>

                  <ProFormDependency name={['job_trigger_type']}>
                    {({ job_trigger_type }) => {
                      if (job_trigger_type === TriggerType.once) {
                        return (
                          <ProForm.Group>
                            <ProFormDateTimePicker
                              name="job_execute_time"
                              label="执行时间"
                              required
                              rules={[
                                { required: true, message: '请选择执行时间' },
                              ]}
                              fieldProps={{
                                format: 'YYYY-MM-DD HH:mm:ss',
                                showTime: true,
                                disabledDate: (current) => {
                                  return (
                                    current && current < moment().startOf('day')
                                  );
                                },
                              }}
                            />
                          </ProForm.Group>
                        );
                      }
                      return null;
                    }}
                  </ProFormDependency>

                  <ProFormDependency name={['job_trigger_type']}>
                    {({ job_trigger_type }) => {
                      if (job_trigger_type === TriggerType.cron) {
                        return (
                          <ProForm.Group>
                            <ProFormText
                              name="job_execute_cron"
                              label="Cron表达式"
                              required
                              rules={[
                                { required: true, message: '请输入Cron表达式' },
                              ]}
                              tooltip={
                                <div>
                                  <div>格式: 分 时 日 月 周</div>
                                  <div>示例:</div>
                                  <div>0 12 * * * - 每天12点执行</div>
                                  <div>5 * * * * - 每5分钟执行</div>
                                </div>
                              }
                              placeholder="例如: 0 0 12 * * ?"
                            />
                          </ProForm.Group>
                        );
                      }
                      return null;
                    }}
                  </ProFormDependency>

                  <ProFormDependency name={['job_trigger_type']}>
                    {({ job_trigger_type }) => {
                      if (job_trigger_type === TriggerType.fixedRate) {
                        return (
                          <ProForm.Group>
                            <ProFormDigit
                              name="job_execute_interval"
                              label="执行间隔"
                              width="md"
                              required
                              rules={[
                                { required: true, message: '请输入执行间隔' },
                              ]}
                              fieldProps={{
                                addonAfter: (
                                  <ProFormSelect
                                    initialValue="seconds"
                                    noStyle
                                    name="job_execute_interval_unit"
                                    options={[
                                      { label: '秒', value: 'seconds' },
                                      { label: '分', value: 'minutes' },
                                      { label: '时', value: 'hours' },
                                      { label: '周', value: 'weeks' },
                                    ]}
                                  />
                                ),
                                min: 1,
                                max: 2000,
                              }}
                              tooltip="任务执行的固定时间间隔"
                            />
                          </ProForm.Group>
                        );
                      }
                      return null;
                    }}
                  </ProFormDependency>

                  <ProForm.Group>
                    <ProFormDigit
                      name="job_max_retry_count"
                      label="最大重试次数"
                      initialValue={0}
                      fieldProps={{
                        min: 0,
                        max: 10,
                      }}
                      tooltip="任务执行失败时的最大重试次数"
                    />
                    <ProFormDigit
                      name="job_retry_interval"
                      label="重试间隔"
                      initialValue={60}
                      fieldProps={{
                        addonAfter: '秒',
                        min: 0,
                        max: 3600,
                      }}
                      tooltip="任务执行失败后的重试间隔时间"
                    />
                  </ProForm.Group>

                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <ProFormSwitch
                      name="job_enabled"
                      label="立即启用"
                      initialValue={true}
                      tooltip="是否立即启用该定时任务"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: 通知配置 - 始终渲染，用CSS控制显示 */}
            <div style={styles.stepContent(currentStep === 3)}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <BellOutlined
                    style={{ color: token.colorPrimary, fontSize: 12 }}
                  />
                  <Text strong style={{ fontSize: 13 }}>
                    通知设置
                  </Text>
                </div>
                <div style={styles.cardBody}>
                  <ProFormSelect
                    label="是否通知"
                    name="job_notify_type"
                    options={[
                      { label: '通知', value: 0 },
                      { label: '不通知', value: 1 },
                    ]}
                    initialValue={1}
                    required
                    rules={[{ required: true, message: '选择是否通知' }]}
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
                              onChange={(value) => {
                                const finallyValue = pushOptions.find(
                                  (item) => item.value === value,
                                )?.label;
                                if (finallyValue) {
                                  setNotifyName2Form(finallyValue);
                                }
                              }}
                            />
                            <ProFormText name="job_notify_name" hidden />
                            <ProFormSelect
                              name="job_notify_on"
                              label="通知时机"
                              mode="multiple"
                              options={[
                                { label: '任务开始', value: 0 },
                                { label: '任务成功', value: 1 },
                                { label: '任务失败', value: 2 },
                              ]}
                              initialValue={[0, 1, 2]}
                            />
                          </>
                        );
                      }
                      return null;
                    }}
                  </ProFormDependency>
                </div>
              </div>
            </div>
          </ProForm>
        </div>
      </div>
    </div>
  );
};

export default JobDrawerForm;
