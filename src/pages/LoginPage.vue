<template>
    <div class="auth-page">
      <h2>Вход в систему</h2>
      <LoginForm />
    </div>
  </template>
  
  <script setup>
  import LoginForm from '@/components/Auth/LoginForm.vue';
  </script>
  
  <style scoped>
  .auth-page {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  </style>