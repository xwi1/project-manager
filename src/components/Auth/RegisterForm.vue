<template>
  <form @submit.prevent="handleRegister" class="auth-form">
     <div class="mb-3">
      <label class="form-label">Имя</label>
      <input
        v-model="name"
        class="form-control"
        id="name"
        placeholder="Введите ваше имя"
        required
      />
    </div>
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
    <button type="submit" class="btn btn-primary w-100">Зарегистрироваться</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';

const name = ref('')
const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  const userData = {
    name: name.value,
    email: email.value,
    password: password.value, // Добавляем пароль
    role: 'employee'
  };

  const result = await authStore.register(userData);
  if (result.success) {
    router.push('/projects');
  } else {
    alert(result.error);
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