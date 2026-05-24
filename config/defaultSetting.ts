import { Settings as LayoutSettings } from '@ant-design/pro-components';

const Settings: LayoutSettings & {
  pwa?: boolean;
  https?: boolean;
  logo?: string;
  apiUrl?: string;
} = {
  logo: '/icons/logo.png',
  // 设置标题的 title
  title: 'Case Hub',
  layout: 'side',
  menu: {
    type: 'sub',
  },
  contentWidth: 'Fixed',
  fixedHeader: true,
  fixSiderbar: true,
  splitMenus: false,
};

export default Settings;
