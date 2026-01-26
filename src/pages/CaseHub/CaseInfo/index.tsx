import {
  addDefaultTestCase,
  queryCasesByRequirement,
  queryTagsByRequirement,
  reorderTestCase,
  uploadTestCase,
} from '@/api/case/testCase';
import DnDDraggable from '@/components/DnDDraggable';
import { DraggableItem } from '@/components/DnDDraggable/type';
import CaseStepSearchForm from '@/pages/CaseHub/CaseInfo/CaseStepSearchForm';
import ChoiceSettingArea from '@/pages/CaseHub/component/ChoiceSettingArea';
import TestCase from '@/pages/CaseHub/TestCase';
import { CaseSearchForm, ITestCase } from '@/pages/CaseHub/type';
import { useParams } from '@@/exports';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { ModalForm, ProCard } from '@ant-design/pro-components';
import { ProFormUploadDragger } from '@ant-design/pro-form';
import { Button, Empty, Form, message, Space, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

const Index = () => {
  const { reqId, projectId, moduleId } = useParams<{
    reqId: string;
    projectId: string;
    moduleId: string;
  }>();
  // 添加用例
  const topRef = useRef<HTMLElement>(null);
  const [fileForm] = Form.useForm();
  const [caseStepsContent, setCaseStepsContent] = useState<DraggableItem[]>([]);
  const [testCases, setTestCases] = useState<ITestCase[]>([]);
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);

  const [showCheckButton, setShowCheckButton] = useState<boolean>(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [reload, setReload] = useState(0);
  const [searchInfo, setSearchInfo] = useState<CaseSearchForm>({});

  const [selectedCase, setSelectedCase] = useState<number[]>([]);
  useEffect(() => {
    selectedCase.length > 0
      ? setShowCheckButton(true)
      : setShowCheckButton(false);
  }, [selectedCase]);

  // 获取用例数据
  useEffect(() => {
    if (!reqId) return;

    const fetchCases = async () => {
      try {
        const searchValues = {
          requirement_id: reqId,
          ...searchInfo,
        };
        const { code, data } = await queryCasesByRequirement(searchValues);
        if (code === 0) {
          setTestCases(data);
        }
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      }
    };

    fetchCases();
  }, [reqId, reload, searchInfo]);

  useEffect(() => {
    if (!reqId) return;
    queryTagsByRequirement({ requirement_id: parseInt(reqId) }).then(
      async ({ code, data }) => {
        if (code === 0 && data.length > 0) {
          setTags(data.map((tag) => ({ label: tag, value: tag })));
        }
      },
    );
  }, [reqId]);
  useEffect(() => {
    if (testCases) {
      setCaseStepsContent(transformData2Content(testCases));
    }
  }, [testCases, tags, selectedCase]);

  // 添加滚动效果
  useEffect(() => {
    if (shouldScroll) {
      // 使用setTimeout确保DOM已更新
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShouldScroll(false);
      }, 100);
    }
  }, [shouldScroll]);
  const handelReload = () => {
    setReload(reload + 1);
  };
  const transformData2Content = (data: ITestCase[]) => {
    return data.map((item, index) => ({
      id: index,
      step_id: item.id,
      content: (
        <TestCase
          selectedCase={selectedCase}
          top={topRef}
          reqId={reqId}
          tags={tags}
          setTags={setTags}
          callback={handelReload}
          testcaseData={item}
          collapsible={false}
          setSelectedCase={setSelectedCase}
        />
      ),
    }));
  };

  const handleAddCase = async () => {
    if (reqId) {
      const { code } = await addDefaultTestCase({
        requirement_id: parseInt(reqId),
      });
      if (code === 0) {
        handelReload();
        setShouldScroll(true);
      }
    }
  };

  const orderFetch = async (newItems: any[]) => {
    const orderIds = newItems.map((item) => item.step_id);
    await reorderTestCase({
      requirement_id: parseInt(reqId!),
      caseIds: orderIds,
    });
  };
  const uploadCase = async (values: any) => {
    const formData = new FormData();
    const fileValue = values.file;
    formData.append('file', fileValue[0].originFileObj);
    formData.append('module_id', moduleId!);
    formData.append('requirement_id', reqId!);
    formData.append('project_id', projectId!);

    const { code, msg } = await uploadTestCase(formData);
    if (code === 0) {
      handelReload();
      message.success(msg);
    }
    fileForm.resetFields();
    return true;
  };

  const UploadForm = (
    <ModalForm
      form={fileForm}
      trigger={
        <Button type="primary">
          <UploadOutlined />
          附件上传
        </Button>
      }
      onFinish={uploadCase}
    >
      <ProCard>
        <ProFormUploadDragger
          title={false}
          max={1}
          description="上传文件"
          accept=".xlsx,.xls"
          name="file"
        />
      </ProCard>
    </ModalForm>
  );

  const ExtraContent = (
    <Space>
      {UploadForm}
      <Button type={'primary'} onClick={handleAddCase}>
        <PlusOutlined />
        添加用例
      </Button>
    </Space>
  );

  return (
    <ProCard split={'horizontal'} bodyStyle={{ padding: 1 }}>
      <CaseStepSearchForm tags={tags} setSearchForm={setSearchInfo} />

      <ProCard
        split={'horizontal'}
        extra={ExtraContent}
        bodyStyle={{ padding: 4 }}
      >
        <ChoiceSettingArea
          callback={handelReload}
          allTestCase={testCases}
          showCheckButton={showCheckButton}
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
        />
        {testCases.length === 0 ? (
          <Empty
            style={{ height: '85vh' }}
            description={<Typography.Text>暂无用例</Typography.Text>}
          />
        ) : (
          <div
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '10px',
              borderRadius: '8px',
            }}
          >
            <DnDDraggable
              items={caseStepsContent}
              setItems={setCaseStepsContent}
              orderFetch={orderFetch}
            />
            {/* 滚动提示 */}
            {caseStepsContent.length > 10 && (
              <div
                style={{
                  position: 'sticky',
                  bottom: 0,
                  background: 'linear-gradient(transparent, #f0f2f5)',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '12px',
                }}
              >
                滚动查看更多
              </div>
            )}
          </div>
        )}
      </ProCard>
    </ProCard>
  );
};

export default Index;
