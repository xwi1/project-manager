import { createRouter, createWebHistory } from 'vue-router';
import ProjectsPage from '@/pages/ProjectsPage.vue';
import ProjectPage from '@/pages/ProjectPage.vue';
import ReportsPage from '@/pages/ReportsPage.vue';
import LoginPage from '@/pages/LoginPage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import DepartmentsPage from '@/pages/DepartmentsPage.vue';
import UsersPage from '@/pages/UsersPage.vue';
import TasksPage from '@/pages/TasksPage.vue';
import ManagerTasksPage from '@/pages/ManagerTasksPage.vue';


const routes = [
  { path: '/', redirect: '/projects' },
  { path: '/projects', component: ProjectsPage },
  { path: '/project/:id', component: ProjectPage },
  { path: '/reports', component: ReportsPage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/departments', component: DepartmentsPage },
  { path: '/users', component: UsersPage },
  { path: '/tasks', component: TasksPage },
  { path: '/manager-tasks', component: ManagerTasksPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;