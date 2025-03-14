import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import {key, store} from './store';
import {directive} from '/@/utils/directive';
import {i18n} from '/@/i18n/index';
import {globalComponentSize} from '/@/utils/componentSize';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '/@/theme/index.scss';
import mitt from 'mitt';
import screenShort from 'vue-web-screen-shot';
import VueGridLayout from 'vue-grid-layout';
import echarts from './utils/echarts';

const app = createApp(App);
// @ts-ignore
app
    .use(router)
    .use(store, key)
    .use(ElementPlus, {i18n: i18n.global.t, size: globalComponentSize})
    .use(i18n)
    .use(screenShort, {enableWebRtc: false})
    .use(VueGridLayout)
    .mount('#app');

app.config.globalProperties.mittBus = mitt();
app.config.globalProperties.$echarts = echarts

directive(app);
