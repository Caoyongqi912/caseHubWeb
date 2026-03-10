import { GlobalOutlined, LockOutlined } from '@ant-design/icons';

export const TagConfig = {
  API: {
    GET: {
      label: 'GET',
      color: '#059669',
      bgColor: '#d1fae5',
      borderColor: '#05966920',
    },
    POST: {
      label: 'POST',
      color: '#d97706',
      bgColor: '#fef3c7',
      borderColor: '#d9770620',
    },
    PUT: {
      label: 'PUT',
      color: '#2563eb',
      bgColor: '#dbeafe',
      borderColor: '#2563eb20',
    },
    DELETE: {
      label: 'DELETE',
      color: '#dc2626',
      bgColor: '#fee2e2',
      borderColor: '#dc2626',
    },
  },
  VISIBILITY: {
    PUBLIC: {
      label: '公共',
      color: '#059669',
      bgColor: '#d1fae5',
      borderColor: '#05966920',
      icon: GlobalOutlined,
    },
    PRIVATE: {
      label: '私有',
      color: '#dc2626',
      bgColor: '#fee2e2',
      borderColor: '#dc262620',
      icon: LockOutlined,
    },
  },
  ASSERT: {
    label: '断言',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#05966920',
  },
  CONDITION: {
    label: 'IF',
    color: '#d97706',
    bgColor: '#fef3c7',
    borderColor: '#d9770620',
  },
  LOOP: {
    label: 'Loop',
    color: '#ca8a04',
    bgColor: '#fef9c3',
    borderColor: '#ca8a0420',
  },
  GROUP: {
    label: '分组',
    color: '#3b82f6',
    bgColor: '#e0f2fe',
    borderColor: '#3b82f620',
  },
  WAIT: {
    label: '等待',
    color: '#9333ea',
    bgColor: '#f3e8ff',
    borderColor: '#9333ea20',
  },
  DB: {
    label: 'DB',
    color: '#9333ea',
    bgColor: '#f3e8ff',
    borderColor: '#9333ea20',
  },
  SCRIPT: {
    label: 'Script',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#2563eb20',
  },
} as const;

export type HttpMethod = keyof typeof TagConfig.API;
