<template>
  <form @submit.prevent="handleLogin" class="auth-form">
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input
        v-model="email"
        type="email"
        class="form-control"
        id="email"
        placeholder="Введите ваш email"
        required
      />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Пароль</label>
      <input
        v-model="password"
        type="password"
        class="form-control"
        id="password"
        placeholder="Введите ваш пароль"
        required
      />
    </div>
    <button type="submit" class="btn btn-primary w-100">Войти</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref(''); // Добавляем ref для пароля
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  const result = await authStore.login({
    email: email.value,
    password: password.value // Передаем пароль
  });

  if (result.success) {
    router.push('/projects');
  } else {
    alert(result.error); // Показываем ошибку
  }
};
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-label {
  font-weight: 500;
  color: #333;
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.btn-primary {
  background-color: #007bff;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>