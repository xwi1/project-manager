<template>
  <div class="projects-page p-3">
    <h2>Проекты</h2>
    <!-- Форма для создания нового проекта -->
    <div v-if="authStore.isAdmin" class="mb-4">
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
    <div class="list-group">
      <router-link
        v-for="project in projectStore.projects"
        :key="project.id"
        :to="`/project/${project.id}`"
        class="list-group-item list-group-item-action"
      >
        {{ project.name }}
      </router-link>
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

const newProjectName = ref('');

// Проверка авторизации при загрузке страницы
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }
  await projectStore.loadProjects(authStore.user.id)
});

// Создание нового проекта
const createProject = async () => {
  try {
    await projectStore.createProject(
      newProjectName.value,
      authStore.user.id // Должно быть числом (например, 1)
    );
  } catch (error) {
    alert(`Ошибка: ${error.response?.data?.details || error.message}`);
  }
}
</script>

<style scoped>
.projects-page {
  max-width: 800px;
  margin: 0 auto;
}
</style>