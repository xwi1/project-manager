<template>
  <div class="projects-page p-3">
    <h2>Проекты</h2>

    <!-- Панель управления: поиск и создание проекта -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <!-- Поле поиска -->
      <div class="input-group w-75">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск проектов..."
          class="form-control"
        />
      </div>

      <!-- Кнопка "Создать проект" -->
      <button
        @click="openCreateProjectModal"
        class="btn btn-primary"
      >
        Создать проект
      </button>
    </div>

    <!-- Список проектов -->
    <div v-if="filteredProjects.length > 0" class="list-group">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
      >
        <!-- Название проекта -->
        <router-link
          :to="`/project/${project.id}`"
          class="d-flex flex-column w-100 text-decoration-none text-dark"
        >
          <div class="d-flex align-items-center">
            <strong>{{ project.name }}</strong>
            <span v-if="!project.departmentId" class="badge bg-secondary ms-2">Нет отдела</span>
            <span v-else class="badge bg-info ms-2">{{ getDepartmentName(project.departmentId) }}</span>
          </div>

          <!-- Дополнительная информация -->
          <small class="text-muted mt-1">
            Задачи: {{ getCompletedTasksCount(project.tableRows) }}/{{ project.tableRows.length }} |
            Блоки: {{ project.blocks.length }}
          </small>
        </router-link>

        <!-- Иконка настроек -->
        <font-awesome-icon
          icon="gear"
          class="settings-icon cursor-pointer"
          title="Настройки проекта"
          @click.stop.prevent="openSettingsModal(project.id)"
        />
      </div>
    </div>

    <!-- Сообщение, если проектов нет -->
    <div v-else class="alert alert-info">
      Нет доступных проектов.
    </div>

    <!-- Модальное окно для создания проекта -->
    <div v-if="isCreateModalOpen" class="modal-overlay">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Создание проекта</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeCreateProjectModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createProject">
              <div class="mb-3">
                <label for="projectNameInput" class="form-label">Название проекта</label>
                <input
                  v-model="newProjectName"
                  type="text"
                  id="projectNameInput"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="departmentSelect" class="form-label">Отдел</label>
                <select
                  v-model="selectedDepartmentForNewProject"
                  id="departmentSelect"
                  class="form-select"
                >
                  <option :value="null">Нет отдела</option>
                  <option
                    v-for="department in departmentStore.departments"
                    :key="department.id"
                    :value="department.id"
                  >
                    {{ department.name }}
                  </option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Создать</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для настроек проекта -->
    <div v-if="isSettingsModalOpen" class="modal-overlay">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header d-flex justify-content-between align-items-center">
            <h5 class="modal-title">Настройки проекта</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeSettingsModal"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Поле для редактирования названия проекта -->
            <div class="mb-3">
              <label for="projectNameInput" class="form-label">Название проекта</label>
              <input
                v-model="editedProjectName"
                type="text"
                id="projectNameInput"
                class="form-control"
                required
              />
            </div>
            <!-- Выбор отдела -->
            <div class="mb-3">
              <label for="departmentSelect" class="form-label">Отдел</label>
              <select
                v-model="selectedDepartmentForEdit"
                id="departmentSelect"
                class="form-select"
              >
                <option :value="null">Нет отдела</option>
                <option
                  v-for="department in departmentStore.departments"
                  :key="department.id"
                  :value="department.id"
                >
                  {{ department.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer d-flex flex-column align-items-center">
            <!-- Кнопка "Сохранить изменения" -->
            <button
              type="button"
              class="btn btn-primary w-100 mb-2"
              @click="saveProjectSettings"
            >
              Сохранить изменения
            </button>
            <!-- Кнопка "Удалить проект" -->
            <button
              type="button"
              class="btn btn-danger w-100"
              @click="deleteProject"
            >
              Удалить проект
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useDepartmentStore } from '@/stores/useDepartmentStore'; // Импортируем стор для отделов
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const projectStore = useProjectStore();
const departmentStore = useDepartmentStore(); // Инициализируем стор для отделов
const router = useRouter();

// Состояние модальных окон
const isCreateModalOpen = ref(false);
const isSettingsModalOpen = ref(false);

// Новое название проекта
const newProjectName = ref('');
const editedProjectName = ref(''); // Для редактирования названия проекта

// ID проекта, для которого открыто модальное окно
const selectedProjectId = ref(null);

// Выбранный отдел для нового проекта
const selectedDepartmentForNewProject = ref(null);

// Выбранный отдел для редактируемого проекта
const selectedDepartmentForEdit = ref(null);

// Поисковый запрос
const searchQuery = ref('');

// Фильтрация проектов по поисковому запросу
const filteredProjects = computed(() => {
  if (!searchQuery.value.trim()) {
    return projectStore.projects;
  }
  const query = searchQuery.value.toLowerCase();
  return projectStore.projects.filter((project) =>
    project.name.toLowerCase().includes(query)
  );
});

// Проверка авторизации при загрузке страницы
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }

  // Загружаем проекты и отделы
  await projectStore.loadProjects(authStore.user?.id || null);
  await departmentStore.loadDepartments(); // Загружаем список отделов
});

// Открытие модального окна для создания проекта
const openCreateProjectModal = () => {
  isCreateModalOpen.value = true;
};

// Закрытие модального окна для создания проекта
const closeCreateProjectModal = () => {
  isCreateModalOpen.value = false;
  newProjectName.value = '';
  selectedDepartmentForNewProject.value = null; // Очищаем выбранный отдел
};

// Создание нового проекта
const createProject = async () => {
  try {
    if (!newProjectName.value.trim()) {
      alert('Введите название проекта!');
      return;
    }

    await projectStore.createProject(
      newProjectName.value,
      authStore.user?.id || null,
      selectedDepartmentForNewProject.value // Передаем выбранный отдел
    );

    closeCreateProjectModal();
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
};

// Открытие модального окна с настройками проекта
const openSettingsModal = (projectId) => {
  const project = projectStore.projects.find((p) => p.id === projectId);
  if (!project) return;

  selectedProjectId.value = projectId;
  editedProjectName.value = project.name; // Заполняем поле текущим названием проекта
  selectedDepartmentForEdit.value = project.departmentId; // Устанавливаем текущий отдел
  isSettingsModalOpen.value = true;
};

// Закрытие модального окна с настройками проекта
const closeSettingsModal = () => {
  isSettingsModalOpen.value = false;
  selectedProjectId.value = null;
  editedProjectName.value = ''; // Очищаем поле
  selectedDepartmentForEdit.value = null; // Очищаем выбранный отдел
};

// Сохранение изменений в настройках проекта
const saveProjectSettings = async () => {
  try {
    if (!editedProjectName.value.trim()) {
      alert('Введите название проекта!');
      return;
    }

    // Логирование для отладки
    console.log('Saving project settings:', {
      projectId: selectedProjectId.value,
      name: editedProjectName.value,
      departmentId: selectedDepartmentForEdit.value,
    });

    await projectStore.updateProject(selectedProjectId.value, {
      name: editedProjectName.value,
      departmentId: selectedDepartmentForEdit.value, // Передаем выбранный отдел (или null)
    });

    closeSettingsModal(); // Закрываем модальное окно
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
};

// Удаление проекта
const deleteProject = async () => {
  try {
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) {
      return;
    }

    await projectStore.deleteProject(selectedProjectId.value);
    closeSettingsModal(); // Закрываем модальное окно
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
};

// Вспомогательные методы

// Получить название отдела по ID
const getDepartmentName = (departmentId) => {
  if (!departmentId) return 'Нет отдела'; // Если departmentId отсутствует
  const department = departmentStore.departments.find((dep) => dep.id === departmentId);
  return department ? department.name : 'Неизвестный отдел';
};

// Получить количество выполненных задач
const getCompletedTasksCount = (tasks) => {
  if (!Array.isArray(tasks)) return 0;
  return tasks.filter((task) => task.status === 'completed').length;
};
</script>

<style scoped>
.projects-page {
  max-width: 800px;
  margin: 0 auto;
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.badge {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
}

.text-muted {
  font-size: 0.9rem;
}

.cursor-pointer {
  cursor: pointer;
}

.settings-icon {
  font-size: 1.5rem; /* Увеличиваем размер иконки */
  color: gray; /* Изменяем цвет на серый */
  margin-left: 10px; /* Добавляем отступ слева */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Полупрозрачный фон */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-dialog {
  max-width: 500px;
  width: 100%;
}

.modal-content {
  background-color: white; /* Белый фон для содержимого модального окна */
  border-radius: 8px; /* Закругление углов */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Тень для эффекта возвышения */
  padding: 1rem; /* Внутренние отступы */
}

.modal-header {
  border-bottom: 1px solid #dee2e6; /* Линия под заголовком */
  padding-bottom: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  margin: 0;
}

.modal-body {
  padding: 1rem 0;
}

.modal-footer {
  border-top: 1px solid #dee2e6; /* Линия над футером */
  padding-top: 1rem;
  display: flex;
  justify-content: flex-end; /* Кнопки справа */
  gap: 0.5rem; /* Расстояние между кнопками */
}
</style>