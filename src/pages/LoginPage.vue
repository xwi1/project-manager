<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Вход в систему</h2>
      <LoginForm />
      <p class="auth-link">
        Нет аккаунта? <router-link to="/register">Зарегистрируйтесь</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import LoginForm from '@/components/Auth/LoginForm.vue';
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.auth-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.auth-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.auth-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.auth-link a {
  color: #007bff;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>