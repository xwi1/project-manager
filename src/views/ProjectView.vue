<template>
    <div class="container mt-4">
      <!-- Заголовок проекта -->
      <h1 class="mb-4">{{ project.name }}</h1>
  
      <!-- Описание проекта -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Описание проекта</h5>
          <p class="card-text">{{ project.description }}</p>
        </div>
      </div>
  
      <!-- Ответственные за проект -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Ответственные</h5>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <strong>Подразделение:</strong> {{ project.department }}
            </li>
            <li class="list-group-item">
              <strong>Менеджер:</strong> {{ project.manager }}
            </li>
            <li class="list-group-item">
              <strong>Сотрудники:</strong>
              <ul>
                <li v-for="employee in project.employees" :key="employee">{{ employee }}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
  
      <!-- Стадии проекта -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Стадии проекта</h5>
          <ul class="list-group list-group-flush">
            <li
              v-for="stage in project.stages"
              :key="stage.name"
              class="list-group-item"
            >
              <strong>{{ stage.name }}:</strong> {{ stage.description }}
              <ul>
                <li v-for="task in stage.tasks" :key="task">{{ task }}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ProjectView",
    data() {
      return {
        project: {
          id: this.$route.params.id, // ID проекта из маршрута
          name: "Проект " + this.$route.params.id,
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          department: "Отдел разработки",
          manager: "Иван Иванов",
          employees: ["Петр Петров", "Сидор Сидоров", "Мария Иванова"],
          stages: [
            {
              name: "Стадия 1",
              description: "Планирование и анализ требований",
              tasks: ["Задача 1.1", "Задача 1.2", "Задача 1.3"],
            },
            {
              name: "Стадия 2",
              description: "Разработка и тестирование",
              tasks: ["Задача 2.1", "Задача 2.2"],
            },
            {
              name: "Стадия 3",
              description: "Внедрение и поддержка",
              tasks: ["Задача 3.1"],
            },
          ],
        },
      };
    },
  };
  </script>
  
  <style scoped>
  .card {
    margin-bottom: 1rem;
  }
  .list-group-item {
    border: none;
    padding: 0.5rem 0;
  }
  </style>