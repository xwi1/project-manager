import { createRouter, createWebHistory } from 'vue-router'
import Projects from '@/views/ProjectsView.vue';
import Login from '@/views/LoginView.vue';
import Test from '@/views/TestView.vue';
import Calendar from '@/views/CalendarView.vue';
import ReportsView from '@/views/ReportsView.vue';
import ProjectView from '@/views/ProjectView.vue';


const routes = [
  { path: '/login', component: Login },
  { path: '/projects', component: Projects },
  { path: '/reports', component: ReportsView },
  { path: '/test', component: Test },
  { path: '/calendar', component: Calendar },
  { path: '/project/:id', component: ProjectView },
  { path: '/:pathMatch(.*)*', redirect: '/projects' } // Редирект на дашборд по умолчанию
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes
})

export default router;