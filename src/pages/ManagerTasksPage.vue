<template>
  <div class="manager-tasks-page p-4">
    <!-- Список задач, сгруппированных по проектам -->
    <div v-for="project in groupedTasks" :key="project.id" class="project-card mb-5">
      <!-- Заголовок проекта -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="text-secondary m-0">{{ project.name }}</h4>
          <!-- Отображение названия отдела для администратора -->
          <span v-if="authStore.isAdmin" class="text-muted small">
            Отдел: {{ getDepartmentName(project.departmentId) }}
          </span>
        </div>
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
        <!-- Информация о просроченных задачах -->
        <div v-if="getOverdueTasksCount(project.tasks)" class="ms-auto text-danger">
          Есть просроченные задачи - {{ getOverdueTasksCount(project.tasks) }}
        </div>
      </div>

      <!-- Пространство с задачами -->
      <div
        v-if="isProjectVisible(project.id)"
        class="task-container"
      >
        <!-- Отображение задач -->
        <div v-if="filteredTasks(project.tasks, activeTab[project.id]).length > 0" class="row">
          <div
            v-for="task in filteredTasks(project.tasks, activeTab[project.id])"
            :key="task.id"
            class="col-md-6 col-lg-4 mb-4"
          >
            <div
              class="card shadow-sm h-100"
              :class="{
                'approaching-deadline': isDeadlineApproaching(task),
                'overdue-task': isTaskOverdue(task)
              }"
            >
              <div class="card-body d-flex flex-column">
                <!-- Отображение ячеек задачи -->
                <div v-for="(cell, blockId) in task.cells" :key="blockId" class="mb-2">
                  <strong class="text-muted">
                    {{ getCellLabel(blockId) }}:
                  </strong>

                  <span v-if="cell.type !== 'date'" class="d-block">
                    {{ cell.value || 'Нет данных' }}
                  </span>

                  <span v-if="cell.type === 'date'" class="d-block">
                    <!-- Отображение даты -->
                    {{ formatDate(cell.value) }}
                    <!-- Вывод информации о количестве дней -->
                    <span v-if="isDeadlineApproaching(task)" :style="{ color: 'red' }">
                      ({{ getDaysLeft(cell.value) }})
                    </span>
                    <span v-else-if="isTaskOverdue(task)" :style="{ color: 'red' }">
                      ({{ getDaysLeft(cell.value) }})
                    </span>
                  </span>
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
import { useDepartmentStore } from '@/stores/useDepartmentStore';


const authStore = useAuthStore();
const projectStore = useProjectStore();
const departmentStore = useDepartmentStore();

// Состояние активной вкладки для каждого проекта
const activeTab = reactive({});
const visibleProjects = reactive({});

// Загрузка данных при монтировании
onMounted(async () => {
  try {
    await projectStore.loadProjects(authStore.user.id); // Загружаем все проекты
    await departmentStore.loadDepartments(); // Загружаем данные об отделах
  } catch (error) {
    console.error('Ошибка загрузки проектов:', error);
  }
});

// Группировка задач по проектам с сортировкой по дате
const groupedTasks = computed(() => {
  if (!Array.isArray(projectStore.projects)) return [];

  const grouped = {};
  projectStore.projects.forEach((project) => {
    // Сортируем задачи внутри проекта по дате
    const sortedTasks = [...project.tableRows]
      .map((row) => ({
        ...row,
        cells: ensureControlBlock(project, row),
      }))
      .sort((a, b) => {
        const dateA = getDeadlineDate(a); // Получаем дату задачи A
        const dateB = getDeadlineDate(b); // Получаем дату задачи B

        // Если у одной из задач нет даты, она помещается в конец
        if (!dateA) return 1;
        if (!dateB) return -1;

        // Сравниваем даты
        return new Date(dateA) - new Date(dateB);
      });

    grouped[project.id] = {
      id: project.id,
      name: project.name,
      tasks: sortedTasks,
      departmentId: project.departmentId
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

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return 'Нет данных';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Проверка, приближается ли срок сдачи (7 дней и менее)
const isDeadlineApproaching = (task) => {
  const deadlineDate = getDeadlineDate(task);
  if (!deadlineDate) return false;

  const today = new Date();
  const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  return daysLeft <= 7 && daysLeft > 0;
};

// Проверка, просрочена ли задача
const isTaskOverdue = (task) => {
  const deadlineDate = getDeadlineDate(task);
  if (!deadlineDate) return false;

  const today = new Date();
  return today > deadlineDate;
};

// Получение даты срока сдачи из блока типа "дата"
const getDeadlineDate = (task) => {
  const dateCell = Object.values(task.cells || {}).find(
    (cell) => cell.type === 'date'
  );
  return dateCell?.value ? new Date(dateCell.value) : null;
};

// Вычисление количества дней до срока сдачи или просрочки
const getDaysLeft = (dateString) => {
  const deadlineDate = new Date(dateString);
  const today = new Date();
  const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

  if (daysLeft > 0) {
    return `Осталось ${daysLeft} ${getDayWord(daysLeft)}`;
  } else {
    const overdueDays = Math.abs(daysLeft);
    return `Просрочено на ${overdueDays} ${getDayWord(overdueDays)}`;
  }
};

// Получение правильного склонения слова "день"
const getDayWord = (days) => {
  if (days % 10 === 1 && days % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
  return 'дней';
};
// Подсчет количества просроченных задач
const getOverdueTasksCount = (tasks) => {
  return tasks.filter((task) => {
    const deadlineDate = getDeadlineDate(task);
    if (!deadlineDate) return false;

    const today = new Date();
    return today > deadlineDate;
  }).length;
};

// Получение названия отдела по его ID
const getDepartmentName = (departmentId) => {
  console.log(departmentId)
  if (!departmentId) return 'Нет отдела'; // Если departmentId отсутствует
  const department = departmentStore.departments.find(
    (dep) => dep.id === departmentId
  );
  return department ? department.name : 'Неизвестный отдел';
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

/* Карточки с приближающимся сроком */
.approaching-deadline {
  background-color: #fff9e6; /* Легкий желтоватый фон */
}

/* Просроченные карточки */
.overdue-task {
  background-color: #ffe6e6; /* Легкий красноватый фон */
}

/* Стиль для текста с информацией о сроках */
.card-body span {
  font-size: 0.9rem;
}

.text-danger {
  font-size: 0.9rem;
  font-weight: 500;
}

.text-muted.small {
  font-size: 0.8rem;
}
</style>