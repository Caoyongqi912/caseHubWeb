import { queryDBConfig, tryDBScript } from '@/api/base/dbConfig';
import { removePlayStepDBInfo, updatePlayStep } from '@/api/play/playCase';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyDrawer from '@/components/MyDrawer';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import { IDBConfig } from '@/pages/Project/types';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ProCard, ProFormSelect } from '@ant-design/pro-components';
import { Button, message, Popover, Radio, Space, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';

const { Paragraph, Text } = Typography;

interface Self {
  currentProjectId: number;
  subStepInfo: IUICaseSteps;
  callback: () => void;
}

const Index: FC<Self> = (props) => {
  const { callback, subStepInfo } = props;
  const [canTry, setCanTry] = useState<boolean>(false);
  const [sqlValue, setSqlValue] = useState<string | null>(null);
  const [currentDBId, setCurrentDBId] = useState<number | null>(null);
  const [currentDBAB, setCurrentDBAB] = useState<number | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [tryData, setTryData] = useState<any>();

  useEffect(() => {
    if (subStepInfo) {
      setCurrentDBId(subStepInfo?.db_id || null);
      setSqlValue(subStepInfo?.sql_script || null);
      setCurrentDBAB(subStepInfo?.db_a_or_b || null);
    }
  }, [subStepInfo]);

  useEffect(() => {
    if (sqlValue) {
      setCanTry(true);
    } else {
      setCanTry(false);
    }
  }, [sqlValue]);

  const contentSQL = (
    <Paragraph>
      <ul>
        <li>
          <Text>仅支持一条SQL</Text>
        </li>
        <li>
          变量查询
          <ul>
            <li>
              <Text code>select name form table .. </Text>
            </li>
            <li>
              <Text>name将被处理为变量名，对应的值是搜索返回的第一个</Text>
            </li>
          </ul>
        </li>
        <li>
          使用as
          <ul>
            <li>
              <Text code>
                select username as u,password as p form table ..{' '}
              </Text>
            </li>
            <li>
              <Text>u,p 将被处理为变量名，对应的值是搜索返回的第一个</Text>
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          <Text strong>{'支持 上文 变量{{xx}} 写入SQL'}</Text>
          <ul>
            <li>
              <Text code>{'select * from table where id = {{ID}}'}</Text>
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          {'使用Oracle 注意⚠️'}
          <li>
            <Text>
              Oracle
              返回变量字段名皆为大写，设置变量名需大写，否则无法获取到变量值。
            </Text>
          </li>
        </li>
      </ul>
    </Paragraph>
  );

  const updateStepSqlInfo = async () => {
    const data = {
      db_id: currentDBId,
      db_a_or_b: 1,
      sql_script: sqlValue,
      id: subStepInfo.id,
    };
    const { code, msg } = await updatePlayStep(data as IUICaseSteps);
    if (code === 0) {
      message.success(msg);
      callback();
    }
  };
  const removeStepSqlInfo = async () => {
    const data = {
      stepId: subStepInfo.id,
    };
    const { code, msg } = await removePlayStepDBInfo(data);
    if (code === 0) {
      message.success(msg);
      setSqlValue(null);
      setCurrentDBId(null);
      setCurrentDBAB(null);
      callback();
    }
  };

  return (
    <ProCard split={'horizontal'}>
      <ProCard
        title={
          <>
            {' '}
            <ProFormSelect
              disabled={false}
              noStyle={true}
              width={'md'}
              name={'before_db_id'}
              required={true}
              fieldProps={{
                value: currentDBId,
              }}
              request={async () => {
                const { code, data } = await queryDBConfig();
                if (code === 0) {
                  return data.map((item: IDBConfig) => {
                    return {
                      label: item.db_name,
                      value: item.id,
                    };
                  });
                }
                return [];
              }}
              onChange={(value: number) => {
                setCurrentDBId(value);
              }}
            />
          </>
        }
        subTitle={
          <Radio.Group
            options={[
              {
                label: '前置运行',
                value: 1,
              },
              {
                label: '后置运行',
                value: 0,
              },
            ]}
            value={currentDBAB}
            onChange={(target) => {
              setCurrentDBAB(target.target.value);
            }}
          />
        }
        extra={
          <Space>
            <>
              {canTry && (
                <Button
                  disabled={false}
                  type={'primary'}
                  onClick={async () => {
                    if (sqlValue && currentDBId) {
                      const { code, data } = await tryDBScript({
                        db_id: currentDBId,
                        script: sqlValue,
                      });
                      if (code === 0) {
                        setTryData(JSON.stringify(data, null, 2));
                        setOpen(true);
                      }
                    }
                  }}
                >
                  Try
                  <Popover content={'SQL 不支持变量的调试'}>
                    <QuestionCircleOutlined />
                  </Popover>
                </Button>
              )}
            </>
            {canTry && (
              <Space>
                <Button disabled={false} onClick={updateStepSqlInfo}>
                  提交
                </Button>
                <Button disabled={false} onClick={removeStepSqlInfo}>
                  删除
                </Button>
              </Space>
            )}
            <Popover content={contentSQL}>
              <Button type="primary">
                在SQL语法中设置与使用变量
                <QuestionCircleOutlined />
              </Button>
            </Popover>
          </Space>
        }
      >
        <AceCodeEditor
          value={sqlValue}
          onChange={(value) => setSqlValue(value)}
          height={'20vh'}
          _mode={'mysql'}
        />
      </ProCard>
      <MyDrawer name={'db'} open={open} setOpen={setOpen}>
        <AceCodeEditor
          value={tryData}
          readonly={true}
          _mode={'json'}
          height={'100vh'}
        />
      </MyDrawer>
    </ProCard>
  );
};

export default Index;
