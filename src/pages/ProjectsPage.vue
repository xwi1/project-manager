<template>
  <div class="projects-page p-3">
    <h2>Проекты</h2>

    <!-- Форма для создания нового проекта -->
    <div v-if="authStore.isAdmin || authStore.isManager" class="mb-4">
      <input
        v-model="newProjectName"
        type="text"
        placeholder="Название проекта"
        class="form-control mb-2"
        required
      />
      <button @click="createProject" class="btn btn-primary">Создать проект</button>
    </div>

    <!-- Список проектов -->
    <div v-if="projectStore.projects.length > 0" class="list-group">
      <router-link
        v-for="project in projectStore.projects"
        :key="project.id"
        :to="`/project/${project.id}`"
        class="list-group-item list-group-item-action"
      >
        {{ project.name }}
        <span v-if="project.departmentId === null" class="badge bg-secondary ms-2">Без отдела</span>
        <span v-if="project.userId === null" class="badge bg-info ms-2">Без автора</span>
      </router-link>
    </div>

    <!-- Сообщение, если проектов нет -->
    <div v-else class="alert alert-info">
      Нет доступных проектов.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const projectStore = useProjectStore();
const router = useRouter();

// Новое название проекта
const newProjectName = ref('');

// Проверка авторизации при загрузке страницы
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }

  // Загружаем проекты. userId может быть null
  await projectStore.loadProjects(authStore.user?.id || null);
});

// Создание нового проекта
const createProject = async () => {
  try {
    if (!newProjectName.value.trim()) {
      alert('Введите название проекта!');
      return;
    }

    await projectStore.createProject(
      newProjectName.value,
      authStore.user?.id || null // userId может быть null
    );

    newProjectName.value = ''; // Очищаем поле после создания
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
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
}

.badge {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
}
</style>