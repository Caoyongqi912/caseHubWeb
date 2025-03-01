import { IProject } from '@/api';
import { data2LabelValue } from '@/utils/somefunc';
import { ProjectTwoTone } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Select, Typography } from 'antd';
import React, { FC } from 'react';

const { Title } = Typography;

interface IProps {
  currentProjectId?: number;
  projects: IProject[];
  setCurrentProjectId: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const ProjectSelect: FC<IProps> = ({
  currentProjectId,
  projects,
  setCurrentProjectId,
}) => {
  return (
    <>
      {currentProjectId ? (
        <ProCard ghost={true} bodyStyle={{ padding: 0, marginTop: 15 }}>
          <Title
            level={3}
            onClick={() => setCurrentProjectId(undefined)}
            style={{
              marginLeft: 12,
              marginBottom: 20,
            }}
          >
            <ProjectTwoTone style={{ marginRight: 10 }} />
            {projects.find((item) => item.id === currentProjectId)?.title}
          </Title>
        </ProCard>
      ) : (
        <Select
          style={{ width: '100%', marginBottom: 10, marginTop: 20 }}
          size={'large'}
          showSearch
          allowClear
          autoFocus
          placeholder={'请选择项目'}
          options={data2LabelValue(projects)}
          onChange={(value: number) => {
            setCurrentProjectId(value);
          }}
        />
      )}
    </>
  );
};

export default ProjectSelect;
