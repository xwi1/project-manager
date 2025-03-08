<template>
  <div class="reports-page p-3">
    <h2 class="mb-4">Отчёты</h2>
    <div v-for="report in pendingReports" :key="report.id" class="card mb-4 shadow-sm">
      <div class="card-body">
        <h5 class="card-title">{{ report.taskName }}</h5>
        <p class="card-text">
          <strong>Проект:</strong> {{ report.projectName }}<br />
          <!-- Отображаем только те поля "Отчётность", которые не помечены как "Нет" -->
          <template v-for="block in report.workspaceBlocks" :key="block.id">
            <template v-if="block.type === 'report' && report.cells[block.id]?.type !== 'Нет'">
              <strong>{{ block.label }}:</strong>
              <a
                v-if="report.cells[block.id]?.file"
                :href="getFileUrl(report.cells[block.id].file)"
                download
                class="text-decoration-none"
              >
                <span class="badge bg-primary">Скачать файл</span>
              </a>
              <span v-else class="text-muted">Нет файла</span>
              <br />
            </template>
          </template>
          <strong>Дата и время отправки:</strong> {{ report.submittedAt }}
        </p>
        <div class="d-flex gap-2">
          <button @click="approveReport(report.id)" class="btn btn-success">Принять</button>
          <button @click="rejectReport(report.id)" class="btn btn-danger">Отклонить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useProjectStore } from '@/stores/useProjectStore';

const projectStore = useProjectStore();

// Получаем все задачи, которые находятся на рассмотрении
const pendingReports = computed(() => {
  const reports = [];
  projectStore.projects.forEach((project) => {
    project.tableRows.forEach((row) => {
      if (row.status === 'на рассмотрении') {
        const taskName = row.cells.taskName || 'Без названия';
        const workspaceBlocks = project.workspaceOrder
          .map((blockId) => project.blocks.find((block) => block.id === blockId))
          .filter((block) => block !== undefined); // Получаем только блоки из рабочей зоны

        reports.push({
          id: row.id,
          projectId: project.id,
          projectName: project.name, // Название проекта
          taskName,
          workspaceBlocks, // Блоки из рабочей зоны
          cells: row.cells, // Данные из таблицы
          submittedAt: row.submittedAt || 'Не указано', // Дата и время отправки
        });
      }
    });
  });
  return reports;
});

// Одобрение отчёта
const approveReport = (reportId) => {
  projectStore.updateTaskStatus(reportId, 'сдано');
  alert('Отчёт принят. Задача выполнена.');
};

// Отклонение отчёта
const rejectReport = (reportId) => {
  projectStore.updateTaskStatus(reportId, 'не сдано');
  alert('Отчёт отклонён. Задача возвращена в статус "не сдано".');
};

// Получение URL для скачивания файла
const getFileUrl = (file) => {
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  return ''; // Если это не файл, возвращаем пустую строку
};
</script>

<style scoped>
.reports-page {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  border: none;
  border-radius: 8px;
  background-color: #ffffff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
}

.card-text {
  margin-bottom: 1.5rem;
  color: #555;
}

.card-text strong {
  color: #333;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.text-muted {
  color: #6c757d;
}
</style>