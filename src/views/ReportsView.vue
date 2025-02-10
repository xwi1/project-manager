<template>
    <div class="reports-page">
      <h1 class="my-4">Reports</h1>
      <div class="report-list">
        <div class="report-item" v-for="report in reports" :key="report.id">
          <h2>{{ report.title }}</h2>
          <p><strong>Project:</strong> {{ report.projectName }}</p>
          <p><strong>Status:</strong> {{ report.status }}</p>
          <p><strong>Completion:</strong> {{ report.completion }}%</p>
          <p><strong>Deadline:</strong> {{ report.deadline }}</p>
          <p><strong>Description:</strong> {{ report.description }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ReportsPage',
    data() {
      return {
        reports: [
          {
            id: 1,
            title: 'Project Alpha Report',
            projectName: 'Project Alpha',
            status: 'In Progress',
            completion: 65,
            deadline: '2024-12-01',
            description: 'This is a detailed report on the progress of Project Alpha.'
          },
          {
            id: 2,
            title: 'Project Beta Report',
            projectName: 'Project Beta',
            status: 'Completed',
            completion: 100,
            deadline: '2024-11-15',
            description: 'This report outlines the completion of Project Beta.'
          },
          {
            id: 3,
            title: 'Project Gamma Report',
            projectName: 'Project Gamma',
            status: 'Pending',
            completion: 30,
            deadline: '2024-12-20',
            description: 'This report details the current status of Project Gamma.'
          }
          // Добавьте другие отчеты по мере необходимости
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  .reports-page {
    padding: 20px;
  }
  
  .report-list {
    list-style: none;
    padding: 0;
  }
  
  .report-item {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
    margin-bottom: 20px;
    background-color: #f9f9f9;
    transition: box-shadow 0.3s ease;
  }
  
  .report-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .report-item h2 {
    margin-top: 0;
  }
  </style>
  