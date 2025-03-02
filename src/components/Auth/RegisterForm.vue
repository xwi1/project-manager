<template>
  <form @submit.prevent="handleRegister">
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input v-model="email" type="email" class="form-control" id="email" required />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Пароль</label>
      <input v-model="password" type="password" class="form-control" id="password" required />
    </div>
    <div class="mb-3">
      <label for="role" class="form-label">Роль</label>
      <select v-model="role" class="form-control" id="role" required>
        <option value="admin">Администратор</option>
        <option value="manager">Менеджер</option>
        <option value="employee">Сотрудник</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const role = ref('employee'); // По умолчанию роль "Сотрудник"
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = () => {
  // Здесь будет запрос к бэкенду для регистрации
  const userData = {
    id: Date.now(),
    email: email.value,
    role: role.value,
  };
  authStore.register(userData);
  router.push('/projects');
};
</script>