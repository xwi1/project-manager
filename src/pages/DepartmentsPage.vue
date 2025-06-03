<template>
  <div class="departments-page p-3">
    <div class="container">
      <h2 class="mb-4">Отделы</h2>

      <!-- Панель управления: поиск и создание отдела -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <!-- Поле поиска -->
        <div class="input-group w-75">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск отделов..."
            class="form-control"
          />
        </div>

        <!-- Кнопка "Создать отдел" -->
        <button
          @click="openCreateDepartmentModal"
          class="btn btn-primary"
        >
          Создать отдел
        </button>
      </div>

      <!-- Список отделов -->
      <div v-if="filteredDepartments.length > 0" class="list-group">
        <div
          v-for="department in filteredDepartments"
          :key="department.id"
          class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
        >
          <!-- Название отдела -->
          <div class="d-flex flex-column w-100">
            <strong>{{ department.name }}</strong>
            <small class="text-muted mt-1">
              Пользователи: {{ department.users?.length || 0 }}
            </small>
          </div>

          <!-- Иконка настроек -->
          <font-awesome-icon
            icon="gear"
            class="settings-icon cursor-pointer"
            title="Настройки отдела"
            @click.stop.prevent="openSettingsModal(department.id)"
          />
        </div>
      </div>

      <!-- Сообщение, если отделов нет -->
      <div v-else class="alert alert-info">
        Нет доступных отделов.
      </div>
    </div>

    <!-- Модальное окно для создания отдела -->
    <div v-if="isCreateModalOpen" class="modal-overlay">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header d-flex justify-content-between align-items-center">
            <h5 class="modal-title">Создание отдела</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeCreateDepartmentModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createDepartment">
              <div class="mb-3">
                <label for="departmentNameInput" class="form-label">Название отдела</label>
                <input
                  v-model="newDepartmentName"
                  type="text"
                  id="departmentNameInput"
                  class="form-control"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary">Создать</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для настроек отдела -->
    <div v-if="isSettingsModalOpen" class="modal-overlay">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header d-flex justify-content-between align-items-center">
            <h5 class="modal-title">Настройки отдела</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeSettingsModal"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Поле для редактирования названия отдела -->
            <div class="mb-3">
              <label for="departmentNameInput" class="form-label">Название отдела</label>
              <input
                v-model="editedDepartmentName"
                type="text"
                id="departmentNameInput"
                class="form-control"
                required
              />
            </div>

            <!-- Добавление пользователей -->
            <div class="mb-3">
              <button
                @click="openAddUserModal"
                class="btn btn-secondary w-100"
              >
                Добавить пользователя
              </button>
            </div>

            <!-- Таблица сотрудников отдела -->
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Роль</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in departmentUsers" :key="user.id">
                  <td>{{ user.email }}</td>
                  <td>
                    <select v-model="user.role" class="form-select">
                      <option value="admin">Администратор</option>
                      <option value="manager">Менеджер</option>
                      <option value="employee">Сотрудник</option>
                      <option value="remove">Удалить из отдела</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer d-flex flex-column align-items-center">
            <!-- Кнопка "Сохранить изменения" -->
            <button
              type="button"
              class="btn btn-primary w-100 mb-2"
              @click="saveDepartmentSettings"
            >
              Сохранить изменения
            </button>
            <!-- Кнопка "Удалить отдел" -->
            <button
              type="button"
              class="btn btn-danger w-100"
              @click="deleteDepartment"
            >
              Удалить отдел
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для добавления пользователя -->
    <div v-if="isAddUserModalOpen" class="modal-overlay">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header d-flex justify-content-between align-items-center">
            <h5 class="modal-title">Добавить пользователя</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeAddUserModal"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Поле поиска -->
            <div class="input-group mb-3">
              <input
                v-model="userSearchQuery"
                type="text"
                placeholder="Поиск пользователя..."
                class="form-control"
              />
            </div>

            <!-- Список пользователей -->
            <ul class="list-group">
              <li
                v-for="user in filteredUnassignedUsers"
                :key="user.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{{ user.email }}</span>
                <button
                  @click="addUserToDepartment(user.id)"
                  class="btn btn-sm btn-primary"
                >
                  Добавить
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDepartmentStore } from '@/stores/useDepartmentStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const departmentStore = useDepartmentStore();
const router = useRouter();

// Состояния модальных окон
const isCreateModalOpen = ref(false);
const isSettingsModalOpen = ref(false);
const isAddUserModalOpen = ref(false);

// Временные данные
const newDepartmentName = ref('');
const editedDepartmentName = ref('');
const selectedDepartmentId = ref(null);
const departmentUsers = ref([]);
const userSearchQuery = ref('');

// Поисковый запрос
const searchQuery = ref('');

// Фильтрация отделов
const filteredDepartments = computed(() => {
  if (!searchQuery.value.trim()) {
    return departmentStore.departments;
  }
  const query = searchQuery.value.toLowerCase();
  return departmentStore.departments.filter((department) =>
    department.name.toLowerCase().includes(query)
  );
});

// Все пользователи
const allUsers = ref([]);

// Пользователи без отдела
const unassignedUsers = ref([]);

// Загрузка данных при монтировании
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }

  // Загружаем отделы
  await departmentStore.loadDepartments();

  // Загружаем всех пользователей
  allUsers.value = await departmentStore.getAllUsers();

  // Загружаем пользователей без отдела
  unassignedUsers.value = await departmentStore.getUnassignedUsers();
});

// Открытие модального окна для создания отдела
const openCreateDepartmentModal = () => {
  isCreateModalOpen.value = true;
};

// Закрытие модального окна для создания отдела
const closeCreateDepartmentModal = () => {
  isCreateModalOpen.value = false;
  newDepartmentName.value = '';
};

// Создание нового отдела
const createDepartment = async () => {
  try {
    if (!newDepartmentName.value.trim()) {
      alert('Введите название отдела!');
      return;
    }

    await departmentStore.createDepartment(newDepartmentName.value);
    closeCreateDepartmentModal();
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
};

// Открытие модального окна с настройками отдела
const openSettingsModal = async (departmentId) => {
  const department = departmentStore.departments.find((d) => d.id === departmentId);
  if (!department) return;

  selectedDepartmentId.value = departmentId;
  editedDepartmentName.value = department.name;

  // Загружаем роли пользователей через API
  try {
    const usersWithRoles = await departmentStore.getUsersWithRoles(departmentId);

    departmentUsers.value = usersWithRoles.map((user) => ({
      ...user,
      role: user.role || 'employee', // Устанавливаем роль по умолчанию
    }));
  } catch (error) {
    console.error('Ошибка загрузки пользователей с ролями:', error);
    departmentUsers.value = [];
  }

  isSettingsModalOpen.value = true;
};

// Закрытие модального окна с настройками отдела
const closeSettingsModal = () => {
  isSettingsModalOpen.value = false;
  selectedDepartmentId.value = null;
  editedDepartmentName.value = '';
  departmentUsers.value = [];
};

// Сохранение изменений в настройках отдела
const saveDepartmentSettings = async () => {
  try {
    // Формируем массив пользователей с их ролями
    const updatedUsers = departmentUsers.value
      .filter((user) => user.role !== 'remove') // Исключаем пользователей, помеченных для удаления
      .map((user) => ({
        userId: user.id, // ID пользователя
        role: user.role, // Роль пользователя
      }));

    // Отправляем запрос на обновление отдела
    await departmentStore.updateDepartment(selectedDepartmentId.value, {
      name: editedDepartmentName.value,
      users: updatedUsers, // Передаем массив пользователей с ролями
    });

    // Обновляем список пользователей без отдела
    unassignedUsers.value = await departmentStore.getUnassignedUsers();

    // Обновляем локальное состояние отделов
    await departmentStore.loadDepartments();

    // Закрываем модальное окно
    closeSettingsModal();
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
};

// Удаление отдела
const deleteDepartment = async () => {
  try {
    if (!confirm('Вы уверены, что хотите удалить этот отдел?')) {
      return;
    }

    await departmentStore.deleteDepartment(selectedDepartmentId.value);
    closeSettingsModal();
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
};

// Открытие модального окна для добавления пользователя
const openAddUserModal = () => {
  isAddUserModalOpen.value = true;
};

// Закрытие модального окна для добавления пользователя
const closeAddUserModal = () => {
  isAddUserModalOpen.value = false;
  userSearchQuery.value = '';
};

// Фильтрация пользователей без отдела
const filteredUnassignedUsers = computed(() => {
  if (!userSearchQuery.value.trim()) {
    return unassignedUsers.value;
  }
  const query = userSearchQuery.value.toLowerCase();
  return unassignedUsers.value.filter((user) => user.email.toLowerCase().includes(query));
});

// Добавление пользователя в отдел
const addUserToDepartment = (userId) => {
  const user = unassignedUsers.value.find((u) => u.id === userId);
  if (!user) return;

  departmentUsers.value.push({
    ...user,
    role: 'employee', // Устанавливаем начальную роль
  });

  closeAddUserModal();
};
</script>

<style scoped>
.departments-page {
  max-width: 800px; /* Ограничение ширины контента */
  margin: 0 auto; /* Центрирование контента */
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #dee2e6; /* Легкая граница для разделения элементов */
  border-radius: 0.25rem; /* Закругление углов */
}

.settings-icon {
  font-size: 1.5rem; /* Размер иконки */
  color: gray; /* Цвет иконки */
  margin-left: 10px; /* Отступ слева */
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