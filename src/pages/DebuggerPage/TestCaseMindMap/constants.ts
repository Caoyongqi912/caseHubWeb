export const DEFAULT_TEST_CASE_DATA = {
  data: {
    uid: 'root',
    text: '测试用例',
    isRoot: true,
    expand: true,
  },
  children: [
    {
      data: {
        uid: 'test-case-1',
        text: '登录功能测试',
        testCaseId: 'TC001',
        priority: 'high',
        status: 'passed',
        tags: ['功能测试', '登录'],
        expand: true,
      },
      children: [
        {
          data: {
            uid: 'test-step-1-1',
            text: '输入用户名',
            preConditions: '用户已注册',
            testSteps: [
              {
                stepId: 'step-1',
                stepNumber: 1,
                description: '在用户名输入框输入有效用户名',
                expectedResult: '用户名输入框显示输入的值',
                actionType: 'input',
                targetElement: '#username-input',
              },
            ],
            expectedResult: '用户名输入成功',
          },
        },
        {
          data: {
            uid: 'test-step-1-2',
            text: '输入密码',
            testSteps: [
              {
                stepId: 'step-2',
                stepNumber: 1,
                description: '在密码输入框输入正确密码',
                expectedResult: '密码输入框显示掩码',
                actionType: 'input',
                targetElement: '#password-input',
              },
            ],
            expectedResult: '密码输入成功',
          },
        },
        {
          data: {
            uid: 'test-step-1-3',
            text: '点击登录按钮',
            testSteps: [
              {
                stepId: 'step-3',
                stepNumber: 1,
                description: '点击登录按钮',
                expectedResult: '跳转到首页',
                actionType: 'click',
                targetElement: '#login-button',
              },
            ],
            expectedResult: '登录成功，跳转到首页',
          },
        },
      ],
    },
    {
      data: {
        uid: 'test-case-2',
        text: '用户注册测试',
        testCaseId: 'TC002',
        priority: 'medium',
        status: 'pending',
        tags: ['功能测试', '注册'],
        expand: true,
      },
      children: [
        {
          data: {
            uid: 'test-step-2-1',
            text: '填写注册表单',
            testSteps: [
              {
                stepId: 'step-4',
                stepNumber: 1,
                description: '填写用户名、密码、确认密码',
                expectedResult: '表单填写完成',
              },
            ],
            expectedResult: '表单验证通过',
          },
        },
        {
          data: {
            uid: 'test-step-2-2',
            text: '提交注册',
            testSteps: [
              {
                stepId: 'step-5',
                stepNumber: 1,
                description: '点击注册按钮',
                expectedResult: '显示注册成功提示',
                actionType: 'click',
                targetElement: '#register-button',
              },
            ],
            expectedResult: '注册成功',
          },
        },
      ],
    },
  ],
};

export const MIND_MAP_CONFIG = {
  scaleRatio: 0.1,
  translateRatio: 1,
  minZoomRatio: 20,
  maxZoomRatio: 400,
  mousewheelAction: 'zoom',
  mousewheelMoveStep: 10,
  mouseScaleCenterUseMousePosition: true,
  mousewheelZoomActionReverse: true,
  disableTouchZoom: true,
  disableMouseWheelZoom: true,
  useLeftKeySelectionRightKeyDrag: true,
  isShowExpandNum: true,
  initRootNodePosition: ['center'],
};

export const THEME_OPTIONS = [
  { label: '脑图经典', value: 'autumn' },
  { label: '暗黑模式', value: 'blackHumour' },
  { label: '淡蓝主题', value: 'blueSky' },
  { label: '默认主题', value: 'default' },
];

export const LAYOUT_OPTIONS = [
  { label: '逻辑结构图', value: 'logicalStructure' },
  { label: '思维导图', value: 'mindMap' },
  { label: '组织结构图', value: 'organizationStructure' },
  { label: '目录组织图', value: 'catalogOrganization' },
];

export const PRIORITY_OPTIONS = [
  { label: '高优先级', value: 'high', color: '#ff4d4f' },
  { label: '中优先级', value: 'medium', color: '#faad14' },
  { label: '低优先级', value: 'low', color: '#52c41a' },
];

export const STATUS_OPTIONS = [
  { label: '待执行', value: 'pending', color: '#d9d9d9' },
  { label: '执行中', value: 'running', color: '#1890ff' },
  { label: '通过', value: 'passed', color: '#52c41a' },
  { label: '失败', value: 'failed', color: '#ff4d4f' },
];
