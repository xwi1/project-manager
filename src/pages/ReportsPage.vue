<template>
  <div class="reports-page p-4">
    <!-- Список задач на рассмотрении -->
    <div v-if="pendingReports.length > 0" class="row">
      <div
        v-for="report in pendingReports"
        :key="report.id"
        class="col-md-6 col-lg-4 mb-4"
      >
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <!-- Заголовок задачи -->
            <h5 class="card-title text-secondary">{{ report.projectName }}</h5>

            <!-- Отображение полей задачи -->
            <div class="task-details mb-3">
              <div v-for="block in report.workspaceBlocks" :key="block.id" class="mb-2">
                <strong>{{ block.label }}: </strong> <!-- Пробел после двоеточия -->
                <!-- Если это поле типа "Документ" -->
                <template v-if="block.type === 'file'">
                  <a
                    v-if="report.cells[block.id]?.file"
                    :href="getFileUrl(report.cells[block.id].file)"
                    download
                    class="text-decoration-none"
                  >
                    <span class="badge bg-primary rounded-pill">Скачать файл</span>
                  </a>
                  <span v-else class="text-muted">Нет файла</span>
                </template>
                <!-- Для остальных типов полей -->
                <template v-else>
                  {{ report.cells[block.id]?.value || 'Не указано' }}
                </template>
              </div>
            </div>

            <!-- Дата отправки -->
            <small class="text-muted mt-auto">
              <i class="bi bi-clock me-1"></i> Отправлено: {{ formatDate(report.submittedAt) }}
            </small>

            <!-- Кнопки действий -->
            <div class="mt-3 d-flex gap-2">
              <button
                @click="approveReport(report.id)"
                class="btn btn-success btn-sm"
              >
                <i class="bi bi-check-circle me-1"></i> Принять
              </button>
              <button
                @click="rejectReport(report.id)"
                class="btn btn-danger btn-sm"
              >
                <i class="bi bi-x-circle me-1"></i> Отклонить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Сообщение, если задач на рассмотрении нет -->
    <div v-else class="alert alert-info text-center">
      Нет задач на рассмотрении.
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
      if (row.status === 'under_review') {
        const workspaceBlocks = project.workspaceOrder
          .map((blockId) => project.blocks.find((block) => block.id === blockId))
          .filter((block) => block !== undefined);

        reports.push({
          id: row.id,
          projectId: project.id,
          projectName: project.name || 'Без названия',
          workspaceBlocks,
          cells: row.cells || {},
          submittedAt: row.submittedAt || new Date().toISOString(),
        });
      }
    });
  });
  return reports;
});

// Одобрение отчёта
const approveReport = async (reportId) => {
  try {
    await projectStore.updateTaskStatus(reportId, 'completed');
    alert('Отчёт принят. Задача выполнена.');
  } catch (error) {
    alert('Ошибка при принятии отчёта!');
  }
};

// Отклонение отчёта
const rejectReport = async (reportId) => {
  try {
    await projectStore.updateTaskStatus(reportId, 'in_progress');
    alert('Отчёт отклонён. Задача возвращена в работу.');
  } catch (error) {
    alert('Ошибка при отклонении отчёта!');
  }
};

// Получение URL для скачивания файла
const getFileUrl = (file) => {
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  return ''; // Если это не файл, возвращаем пустую строку
};

// Форматирование даты
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};
</script>

<style scoped>
.reports-page {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.25rem;
}

.task-details {
  font-size: 0.9rem;
}

.text-muted {
  font-size: 0.875rem;
}

.btn-success {
  background-color: #198754;
  border-color: #198754;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.badge {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
}
</style>