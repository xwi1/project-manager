<template>
  <div class="manager-tasks-page p-4">
    <!-- Список задач, сгруппированных по проектам -->
    <div v-for="project in groupedTasks" :key="project.id" class="project-card mb-5">
      <!-- Заголовок проекта -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="text-secondary m-0">{{ project.name }}</h4>
        <button
          @click="toggleProjectVisibility(project.id)"
          class="btn btn-sm btn-outline-secondary"
        >
          {{ isProjectVisible(project.id) ? 'Скрыть задачи' : 'Показать задачи' }}
        </button>
      </div>

      <!-- Вкладки для фильтрации задач -->
      <div class="d-flex gap-2 mb-3">
        <button
          v-for="tab in tabs"
          :key="tab.status"
          @click="setActiveTab(project.id, tab.status)"
          :class="[
            'btn',
            activeTab[project.id] === tab.status ? 'btn-outline-primary' : 'btn-outline-dark'
          ]"
          :style="{ color: getTabColor(tab.status), borderColor: getTabColor(tab.status) }"
        >
          {{ tab.label }} ({{ getTaskCount(project.tasks, tab.status) }})
        </button>
      </div>

      <!-- Пространство с задачами -->
      <div v-if="isProjectVisible(project.id)" class="task-container">
        <!-- Отображение задач -->
        <div v-if="filteredTasks(project.tasks, activeTab[project.id]).length > 0" class="row">
          <div
            v-for="task in filteredTasks(project.tasks, activeTab[project.id])"
            :key="task.id"
            class="col-md-6 col-lg-4 mb-4"
          >
            <div class="card shadow-sm h-100">
              <div class="card-body d-flex flex-column">
                <!-- Отображение ячеек задачи -->
                <div v-for="(cell, blockId) in task.cells" :key="blockId" class="mb-2">
                  <strong v-if="cell.type !== 'control'" class="text-muted">
                    {{ getCellLabel(blockId) }}:
                  </strong>
                  <span v-if="cell.type !== 'control'" class="d-block">
                    {{ cell.value || 'Нет данных' }}
                  </span>
                </div>

                <!-- Выбор статуса задачи -->
                <div class="mt-auto d-flex justify-content-between align-items-center">
                  <select
                    v-model="task.status"
                    @change="updateTaskStatus(task)"
                    class="form-select mt-1"
                  >
                    <option value="not_assigned">Не назначена</option>
                    <option value="in_progress">В работе</option>
                    <option value="under_review">На рассмотрении</option>
                    <option value="completed">Выполнена</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Сообщение, если задач нет -->
        <div v-else class="alert alert-info text-center">
          Нет задач
        </div>
      </div>
    </div>

    <!-- Сообщение, если проекты отсутствуют -->
    <div v-if="!groupedTasks.length" class="alert alert-info text-center">
      Нет доступных проектов.
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProjectStore } from '@/stores/useProjectStore';

const authStore = useAuthStore();
const projectStore = useProjectStore();

// Состояние активной вкладки для каждого проекта
const activeTab = reactive({});
const visibleProjects = reactive({});

// Загрузка данных при монтировании
onMounted(async () => {
  try {
    await projectStore.loadProjects(authStore.user.id); // Загружаем все проекты
  } catch (error) {
    console.error('Ошибка загрузки проектов:', error);
  }
});

// Группировка задач по проектам
const groupedTasks = computed(() => {
  if (!Array.isArray(projectStore.projects)) return [];

  const grouped = {};
  projectStore.projects.forEach((project) => {
    grouped[project.id] = {
      id: project.id,
      name: project.name,
      tasks: project.tableRows.map((row) => ({
        ...row,
        cells: ensureControlBlock(project, row),
      })),
    };
  });
  return Object.values(grouped);
});

// Убедимся, что задача имеет блок типа "control"
const ensureControlBlock = (project, task) => {
  const controlBlock = project.blocks.find((block) => block.type === 'control');
  if (!controlBlock) {
    // Создаем новый блок типа "control", если его нет
    const newBlockId = Date.now().toString();
    projectStore.addBlock(project.id, {
      id: newBlockId,
      type: 'control',
      label: 'Контроль',
    });

    // Добавляем ячейки для всех строк
    project.tableRows.forEach((row) => {
      if (!row.cells[newBlockId]) {
        row.cells[newBlockId] = { type: 'control', assignedUser: null };
      }
    });
  }

  return task.cells;
};

// Получение ID блока "control" для проекта
const getControlBlockId = (project) => {
  const controlBlock = project.blocks.find((block) => block.type === 'control');
  return controlBlock?.id;
};

// Получение названия блока по его ID
const getCellLabel = (blockId) => {
  if (!Array.isArray(projectStore.projects)) return 'Неизвестный блок';

  for (const project of projectStore.projects) {
    const block = project.blocks?.find((b) => b.id === blockId);
    if (block) return block.label;
  }

  return 'Неизвестный блок';
};

// Вкладки для фильтрации задач
const tabs = [
  { label: 'Не назначена', status: 'not_assigned' },
  { label: 'В работе', status: 'in_progress' },
  { label: 'На рассмотрении', status: 'under_review' },
  { label: 'Выполнено', status: 'completed' },
];

// Цвета для вкладок
const getTabColor = (status) => {
  switch (status) {
    case 'not_assigned':
      return '#6c757d'; // Серый
    case 'in_progress':
      return '#0d6efd'; // Синий
    case 'under_review':
      return '#ffc107'; // Желтый
    case 'completed':
      return '#198754'; // Зеленый
    default:
      return '#6c757d'; // Серый
  }
};

// Установка активной вкладки
const setActiveTab = (projectId, status) => {
  activeTab[projectId] = status;
};

// Фильтрация задач по статусу
const filteredTasks = (tasks, status) => {
  return tasks.filter((task) => task.status === status);
};

// Подсчет количества задач по статусу
const getTaskCount = (tasks, status) => {
  return tasks.filter((task) => task.status === status).length;
};

// Переключение видимости проекта
const toggleProjectVisibility = (projectId) => {
  visibleProjects[projectId] = !visibleProjects[projectId];
};

// Проверка видимости проекта
const isProjectVisible = (projectId) => {
  return visibleProjects[projectId] !== false;
};

// Обновление статуса задачи
const updateTaskStatus = async (task) => {
  try {
    // Находим проект, к которому принадлежит задача
    const project = projectStore.projects.find((project) =>
      project.tableRows.some((row) => row.id === task.id)
    );

    if (!project) {
      throw new Error('Проект для задачи не найден');
    }

    // const projectId = project.id;
    const controlBlockId = getControlBlockId(project);

    // Если статус "Не назначена", обнуляем назначенного пользователя
    if (task.status === 'not_assigned') {
      task.cells[controlBlockId].assignedUser = null;
    }

    // Отправляем обновленный статус на сервер
    await projectStore.updateTaskStatus(task.id, task.status);

    alert('Статус задачи обновлен.');
  } catch (error) {
    alert('Ошибка при обновлении статуса задачи!');
    console.error(error);
  }
};
</script>

<style scoped>
.manager-tasks-page {
  max-width: 1200px;
  margin: 0 auto;
}

.project-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background-color: #fff;
  transition: box-shadow 0.3s ease-in-out;
}

.project-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.task-container {
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  max-height: 1000px; /* Максимальная высота для развернутого состояния */
  opacity: 1;
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

.text-muted {
  font-size: 0.9rem;
}

.form-select {
  width: 100%;
  padding: 0.3rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}
</style>