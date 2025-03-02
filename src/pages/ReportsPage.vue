<template>
    <div class="reports-page p-3">
      <h2>Отчёты</h2>
      <div v-for="report in reports" :key="report.id" class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">{{ report.task }}</h5>
          <p class="card-text">{{ report.description }}</p>
          <button @click="approveReport(report.id)" class="btn btn-success">Принять</button>
          <button @click="rejectReport(report.id)" class="btn btn-danger ms-2">Отклонить</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Липовый список отчётов
  const reports = ref([
    { id: 1, task: 'Задача 1', description: 'Отчёт по задаче 1' },
    { id: 2, task: 'Задача 2', description: 'Отчёт по задаче 2' },
  ]);
  
  const approveReport = (id) => {
    alert(`Отчёт ${id} принят`);
  };
  
  const rejectReport = (id) => {
    alert(`Отчёт ${id} отклонён`);
  };
  </script>
  
  <style scoped>
  .reports-page {
    max-width: 800px;
    margin: 0 auto;
  }
  </style>