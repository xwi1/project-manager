<template>
  <div class="project-page">
    <h2 class="project-title">{{ project.name }}</h2>

    <!-- Кнопка сохранения для администраторов и менеджеров -->
    <button
      v-if="!authStore.isEmployee"
      @click="saveProject"
      class="btn btn-success mb-3"
    >
      Сохранить проект
    </button>

    <!-- Конструктор проекта -->
    <div class="constructor d-flex">
      <!-- Сайдбар для администраторов и менеджеров -->
      <SideBar v-if="!authStore.isEmployee" :project-id="projectId" />

      <!-- Рабочая зона -->
      <div class="workspace-container">
        <WorkSpace :is-employee="authStore.isEmployee" :project-id="projectId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/useProjectStore';
import { useAuthStore } from '@/stores/useAuthStore';
import SideBar from '@/components/ProjectConstructor/SideBar.vue';
import WorkSpace from '@/components/ProjectConstructor/WorkSpace.vue';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();

// Получаем ID проекта из маршрута
const projectId = route.params.id;

// Получаем проект по ID
const project = computed(() => projectStore.getProjectById(projectId));

// Проверяем, существует ли проект
onMounted(async () => {
  if (!project.value) {
    router.push('/projects');
  }
});

// Сохранение проекта
const saveProject = async () => {
  try {
    await projectStore.saveProject(projectId);
    alert('Проект успешно сохранён!');
  } catch (error) {
    alert('Ошибка сохранения проекта!');
  }
};
</script>

<style scoped>
.project-page {
  padding: 20px;
}

.project-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.constructor {
  display: flex;
  height: calc(100vh - 200px); /* Ограничиваем высоту контейнера */
}

/* Стили для сайдбара */
.constructor > .sidebar {
  width: 300px; /* Фиксированная ширина сайдбара */
  border-right: 1px solid #ccc; /* Разделитель между сайдбаром и рабочей зоной */
  padding-right: 10px;
  overflow-y: auto; /* Прокрутка внутри сайдбара, если содержимое выходит за пределы */
}

/* Стили для контейнера рабочей зоны */
.workspace-container {
  flex-grow: 1; /* Занимает оставшееся пространство */
  overflow-x: auto; /* Горизонтальная прокрутка */
  padding-left: 10px;
}
</style>