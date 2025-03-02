<template>
  <form @submit.prevent="handleLogin">
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input v-model="email" type="email" class="form-control" id="email" required />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Пароль</label>
      <input v-model="password" type="password" class="form-control" id="password" required />
    </div>
    <button type="submit" class="btn btn-primary">Войти</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = () => {
  // Здесь будет запрос к бэкенду для авторизации
  const userData = {
    id: 1,
    email: email.value,
    role: 'admin', // Роль будет приходить с бэкенда
  };
  authStore.login(userData);
  router.push('/projects');
};
</script>