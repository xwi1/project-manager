<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Система планирования</a>
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
          <li class="nav-item">
            <router-link to="/projects" class="nav-link">Проекты</router-link>
          </li>

          <!-- Ссылка на страницу отчётов (только для менеджеров) -->
          <li v-if="authStore.isManager" class="nav-item">
            <router-link to="/reports" class="nav-link">Отчёты</router-link>
          </li>
        </ul>

        <!-- Кнопка выхода -->
        <button @click="handleLogout" class="btn btn-outline-danger">
          Выйти
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Обработка выхода из системы
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  margin-bottom: 20px;
}
</style>