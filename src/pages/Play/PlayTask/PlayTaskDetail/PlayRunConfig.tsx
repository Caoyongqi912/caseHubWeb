import { ProCard } from '@ant-design/pro-components';
import React, { FC } from 'react';

const PlayRunConfig: FC<{ runArea: React.ReactElement }> = ({ runArea }) => {
  return (
    <div>
      <ProCard
        style={{
          height: '100%',
        }}
        bodyStyle={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderRadius: '12px',
        }}
      >
        {runArea}
      </ProCard>
    </div>
  );
};

export default PlayRunConfig;
