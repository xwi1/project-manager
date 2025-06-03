import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.css';
import router from './router';
import './assets/styles/main.css';
import { createPinia } from 'pinia';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons'; // Импортируем все solid-иконки
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(fas); // Добавляем все solid-иконки в библиотеку

const app = createApp(App);
const pinia = createPinia();

app.component('font-awesome-icon', FontAwesomeIcon);
app.use(pinia);
app.use(router);
app.mount('#app');