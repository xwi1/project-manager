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
import { useAuthStore } from '@/stores/useAuthStore';

const routes = [
  // Разрешённые всем маршруты 
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },

  // Маршруты админа
  { 
    path: '/projects', component: ProjectsPage,
    meta: { requiresAuth: true, allowedRoles: ['admin'] } 
  },
  { 
    path: '/project/:id', component: ProjectPage, 
    meta: { requiresAuth: true, allowedRoles: ['admin'] }  
  },
  { 
    path: '/departments', component: DepartmentsPage, 
    meta: { requiresAuth: true, allowedRoles: ['admin'] }  
  },
  { 
    path: '/users', component: UsersPage, 
    meta: { requiresAuth: true, allowedRoles: ['admin'] }  
  },

  // Маршруты менеджера
  { 
    path: '/reports', component: ReportsPage, 
    meta: { requiresAuth: true, allowedRoles: ['manager'] }  
  },

  // Маршруты админа и менеджера
  { 
    path: '/manager-tasks', component: ManagerTasksPage, 
    meta: { requiresAuth: true, allowedRoles: ['manager', 'admin'] }  
  },

  // Маршруты всех авторизованных
  { 
    path: '/tasks', component: TasksPage, 
    meta: { requiresAuth: true }  
  },

  // Wildcard маршрут для несуществующих путей
  { 
    path: '/:pathMatch(.*)*', 
    redirect: () => {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        return '/login'; // Неавторизованные пользователи перенаправляются на страницу входа
      }

      // Определяем роль пользователя
      const userRole = authStore.user?.roles[0] || 'employee'; // По умолчанию 'employee'

      // Перенаправляем в зависимости от роли
      switch (userRole) {
        case 'admin':
          return '/projects';
        case 'manager':
          return '/reports';
        default:
          return '/tasks';
      }
    }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Если маршрут требует авторизации
  if (to.meta.requiresAuth) {
    // Проверяем, авторизован ли пользователь
    if (!authStore.isAuthenticated) {
      return next('/login'); // Перенаправляем на страницу входа
    }

    const userRole = authStore.user.roles[0];

    // Если маршрут ограничен по ролям
    if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
      switch (userRole) {
        case 'admin':
          return next('/projects');
        case 'manager':
          return next('/reports');
        default:
          return next('/tasks');
      }
    }
  }

  // Если всё в порядке, разрешаем переход
  next();
});

export default router;