<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Система управления</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <!-- Ссылка на страницу проектов -->
          <li v-if="authStore.isAdmin" class="nav-item">
            <router-link to="/projects" class="nav-link">Проекты</router-link>
          </li>

          <!-- Ссылка на страницу отчётов (только для менеджеров) -->
          <li v-if="authStore.isManager" class="nav-item">
            <router-link to="/reports" class="nav-link">Отчёты</router-link>
          </li>

          <!-- Ссылка на страницу отделов (только для администраторов) -->
          <li v-if="authStore.isAdmin" class="nav-item">
            <router-link to="/departments" class="nav-link">Отделы</router-link>
          </li>

          <!-- Ссылка на страницу пользователей (только для администраторов) -->
          <li v-if="authStore.isAdmin" class="nav-item">
            <router-link to="/users" class="nav-link">Пользователи</router-link>
          </li>

          <!-- Ссылка на страницу с задачами (для всех) -->
          <li v-if="authStore.isAuthenticated" class="nav-item d-flex align-items-center">
            <router-link to="/tasks" class="nav-link">Мои задачи</router-link>
            <div v-if="upcomingTasksCount > 0" class="badge bg-warning rounded-circle me-1">
              {{ upcomingTasksCount }}
            </div>
            <div v-if="overdueTasksCountForUser > 0" class="badge bg-danger rounded-circle">
              {{ overdueTasksCountForUser }}
            </div>
          </li>

          <!-- Ссылка на страницу просмотра задач отдела (только для менеджеров и админов) -->
          <li v-if="authStore.isManager || authStore.isAdmin" class="nav-item d-flex align-items-center">
            <router-link to="/manager-tasks" class="nav-link">
              {{ authStore.isManager ? 'Задачи отдела' : 'Задачи проектов' }}
            </router-link>
            <div v-if="overdueTasksCount > 0" class="badge bg-danger rounded-circle">
              {{ overdueTasksCount }}
            </div>
          </li>
        </ul>

        <!-- Кнопка выхода -->
        <div v-if="authStore.user" class="me-3">{{ authStore.user.name }}</div>
        <button v-if="authStore.isAuthenticated" @click="handleLogout" class="btn btn-outline-danger">
          Выйти
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/useAuthStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useRouter } from 'vue-router';
import { computed } from 'vue';



const authStore = useAuthStore();
const router = useRouter();
const projectStore = useProjectStore();

// Обработка выхода из системы
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Подсчет задач с приближающимися сроками для текущего пользователя
const upcomingTasksCount = computed(() => {
  const allTasks = projectStore.projects.flatMap((project) => project.tableRows);
  return allTasks.filter((task) => {
    const deadlineDate = getDeadlineDate(task);
    if (!deadlineDate) return false;

    const isAssignedToUser = Object.values(task.cells || {}).some(
      (cell) => cell.type === 'control' && cell.assignedUser === authStore.user.id
    );

    if (!isAssignedToUser) return false;

    const today = new Date();
    const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 7;
  }).length;
});

// Подсчет просроченных задач для текущего пользователя
const overdueTasksCountForUser = computed(() => {
  const allTasks = projectStore.projects.flatMap((project) => project.tableRows);
  return allTasks.filter((task) => {
    const deadlineDate = getDeadlineDate(task);
    if (!deadlineDate) return false;

    const isAssignedToUser = Object.values(task.cells || {}).some(
      (cell) => cell.type === 'control' && cell.assignedUser === authStore.user.id
    );

    if (!isAssignedToUser) return false;

    const today = new Date();
    return today > deadlineDate;
  }).length;
});

// Подсчет просроченных задач для всех задач (для "Задачи отдела" или "Задачи проектов")
const overdueTasksCount = computed(() => {
  const allTasks = projectStore.projects.flatMap((project) => project.tableRows);
  return allTasks.filter((task) => {
    const deadlineDate = getDeadlineDate(task);
    if (!deadlineDate) return false;

    const today = new Date();
    return today > deadlineDate;
  }).length;
});

// Получение даты срока сдачи из ячейки типа "date"
const getDeadlineDate = (task) => {
  const dateCell = Object.values(task.cells || {}).find(
    (cell) => cell.type === 'date'
  );
  return dateCell?.value ? new Date(dateCell.value) : null;
};
</script>

<style scoped>
.navbar {
  margin-bottom: 20px;
}

/* Стиль для меток */
.badge {
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
}
</style>