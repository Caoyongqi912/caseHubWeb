import { defineConfig } from 'umi';
import Settings from './defaultSetting';
import proxy from './proxy';
import routes from './routes';

const { APP_ENV = 'dev' } = process.env;
export default defineConfig({
  esbuildMinifyIIFE: true,
  fastRefresh: true,
  proxy: proxy[APP_ENV],
  layout: {
    ...Settings,
    defaultCollapsed: true,
    breakpoint: false,
  },
  routes,
  model: {},
  antd: {
    // compact:true,
    configProvider: {},
  },
  request: {
    dataField: '',
  },
  initialState: {},
  dva: {},
  hash: true,
  access: {},
  plugins: [],
  manifest: {
    basePath: '/',
  },
  mfsu: {
    chainWebpack(config: any) {
      return config;
    },
  },
});
