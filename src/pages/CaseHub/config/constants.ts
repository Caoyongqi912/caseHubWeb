export const CaseHubConfig: any = {
  CASE_LEVEL_OPTION: [
    {
      label: 'P1',
      value: 'P1',
    },
    {
      label: 'P2',
      value: 'P2',
    },
    {
      label: 'P3',
      value: 'P3',
    },
    {
      label: 'P0',
      value: 'P0',
    },
  ],
  CASE_LEVEL_ENUM: {
    P1: { text: 'P1' },
    P2: { text: 'P2' },
    P3: { text: 'P3' },
    P0: { text: 'P0' },
  },
  CASE_LEVEL_COLOR_ENUM: {
    P1: 'orange',
    P2: 'orange',
    P3: 'geekblue',
    P0: 'red',
  },
  CASE_TYPE_OPTION: [
    {
      label: '冒烟',
      value: 1,
    },
    {
      label: '普通',
      value: 2,
    },
  ],
  CASE_TYPE_ENUM: {
    1: '冒烟',
    2: '普通',
  },
  CASE_STATUS_TEXT_ENUM: {
    0: 'WAIT',
    1: 'PASS',
    2: 'FAIL',
  },
  CASE_STATUS_COLOR_ENUM: {
    0: '#7994ef',
    1: '#0ccc49',
    2: '#f96b37',
  },
};

export const RequirementProcessEnum: {
  [key: number]: { text: string; value: number };
} = {
  1: { text: '二轮测试中', value: 1 },
  2: { text: '一轮测试中', value: 2 },
  3: { text: '待测试', value: 3 },
  4: { text: '完成', value: 4 },
  5: { text: '用例中', value: 5 },
};
export const RequirementProcessOption = [
  {
    label: '二轮测试中',
    value: 1,
  },
  {
    label: '一轮测试中',
    value: 2,
  },
  {
    label: '待测试',
    value: 3,
  },
  {
    label: '完成',
    value: 4,
  },
  {
    label: '用例中',
    value: 5,
  },
];
export const RequirementIsReviewEnum: { [key: number]: string } = {
  1: '是',
  0: '否',
};
