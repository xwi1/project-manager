import ConstructorView from '@/views/ConstructorView.vue';
import { createRouter, createWebHistory } from 'vue-router'



const routes = [
  { path: '/constructor', component: ConstructorView },
  { path: '/:pathMatch(.*)*', redirect: '/constructor' } // Редирект на дашборд по умолчанию
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes
})

export default router;