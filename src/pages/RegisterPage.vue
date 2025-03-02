<template>
    <div class="auth-page">
      <h2>Регистрация</h2>
      <RegisterForm />
    </div>
  </template>
  
  <script setup>
  import RegisterForm from '@/components/Auth/RegisterForm.vue';
  </script>
  
  <style scoped>
  .auth-page {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  </style>