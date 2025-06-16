<template>
  <div class="users-page p-3">
    <h2>Пользователи</h2>

    <!-- Панель управления: поиск -->
    <div class="input-group w-75 mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск пользователей..."
        class="form-control"
      />
    </div>

    <!-- Список пользователей -->
    <div v-if="filteredUsers.length > 0" class="list-group">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
        @click="openUserModal(user)"
      >
        <div>
          <strong>{{ user.name }}</strong>
          <span v-if="user.departmentId" class="badge bg-info ms-2">{{ getDepartmentName(user.departmentId) }}</span>
          <span v-else class="badge bg-secondary ms-2">Нет отдела</span>
        </div>
        <span class="badge bg-primary">{{ getRoleName(user.roles) }}</span>
      </div>
    </div>

    <!-- Сообщение, если пользователей нет -->
    <div v-else class="alert alert-info">
      Нет доступных пользователей.
    </div>

    <!-- Модальное окно для просмотра/редактирования пользователя -->
    <div v-if="isUserModalOpen" class="modal-overlay">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header d-flex justify-content-between align-items-center">
            <h5 class="modal-title">Редактирование пользователя</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeUserModal"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Имя -->
            <div class="mb-3">
              <label for="nameInput" class="form-label">Имя</label>
              <input
                v-model="selectedUser.name"
                id="nameInput"
                class="form-control"
                required
              />
            </div>

            <!-- Email -->
            <div class="mb-3">
              <label for="emailInput" class="form-label">Email</label>
              <input
                v-model="selectedUser.email"
                type="email"
                id="emailInput"
                class="form-control"
                required
              />
            </div>

            <!-- Отдел -->
            <div class="mb-3">
              <label for="departmentSelect" class="form-label">Отдел</label>
              <select
                v-model="selectedUser.departmentId"
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

            <!-- Роль -->
            <div class="mb-3">
              <label for="roleSelect" class="form-label">Роль</label>
              <select
                v-model="selectedUser.role"
                id="roleSelect"
                class="form-select"
              >
                <option value="admin">Администратор</option>
                <option value="manager">Менеджер</option>
                <option value="employee">Сотрудник</option>
              </select>
            </div>
          </div>
          <div class="modal-footer d-flex flex-column align-items-center">
            <!-- Кнопка "Сохранить изменения" -->
            <button
              type="button"
              class="btn btn-primary w-100 mb-2"
              @click="saveUserChanges"
            >
              Сохранить изменения
            </button>
            <!-- Кнопка "Удалить пользователя" -->
            <button
              type="button"
              class="btn btn-danger w-100"
              @click="deleteUser"
            >
              Удалить пользователя
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { useDepartmentStore } from '@/stores/useDepartmentStore';

const authStore = useAuthStore();
const userStore = useUserStore();
const departmentStore = useDepartmentStore();
const router = useRouter();

// Поисковый запрос
const searchQuery = ref('');

// Фильтрация пользователей по поисковому запросу
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    return userStore.users;
  }
  const query = searchQuery.value.toLowerCase();
  return userStore.users.filter((user) =>
    user.name.toLowerCase().includes(query)
  );
});

// Состояние модального окна
const isUserModalOpen = ref(false);

// Выбранный пользователь
const selectedUser = ref({
  id: null,
  name: '',
  email: '',
  password: '',
  departmentId: null,
  role: '', // Роль теперь одна
});


// Загрузка данных при монтировании
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }

  // Загружаем пользователей и отделы
  await userStore.loadUsers();
  await departmentStore.loadDepartments();
});

// Открытие модального окна с данными пользователя
const openUserModal = (user) => {
  selectedUser.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '', // Оставляем пустым для безопасности
    departmentId: user.departmentId,
    role: user.roles?.[0] || '', // Берем первую роль из массива
  };
  isUserModalOpen.value = true;
};

// Закрытие модального окна
const closeUserModal = () => {
  isUserModalOpen.value = false;
  selectedUser.value = {
    id: null,
    name: '',
    email: '',
    password: '',
    departmentId: null,
    role: '',
  };
};

// Сохранение изменений пользователя
const saveUserChanges = async () => {
  try {
    await userStore.updateUser(selectedUser.value.id, {
      name: selectedUser.value.name,
      email: selectedUser.value.email,
      password: selectedUser.value.password || undefined, // Если пароль пустой, не отправляем его
      departmentId: selectedUser.value.departmentId,
      roles: [selectedUser.value.role], // Передаем роль как массив из одного элемента
    });
    closeUserModal();
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
};

// Удаление пользователя
const deleteUser = async () => {
  try {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    await userStore.deleteUser(selectedUser.value.id);
    closeUserModal();
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
};

// Вспомогательные методы

// Получить название отдела по ID
const getDepartmentName = (departmentId) => {
  const department = departmentStore.departments.find((dep) => dep.id === departmentId);
  return department ? department.name : 'Неизвестный отдел';
};

// Получить название роли
const getRoleName = (roles) => {
  if (!roles || roles.length === 0) return 'Неизвестная роль';
  const role = roles[0]; // Берем первую роль из массива
  switch (role) {
    case 'admin':
      return 'Администратор';
    case 'manager':
      return 'Менеджер';
    case 'employee':
      return 'Сотрудник';
    default:
      return 'Неизвестная роль';
  }
};
</script>

<style scoped>
.users-page {
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
}
</style>