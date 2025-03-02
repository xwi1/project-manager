<template>
  <div class="project-page">
    <h2 class="project-title">{{ project.name }}</h2>
    <div class="constructor d-flex">
      <SideBar v-if="!authStore.isEmployee" :project-id="projectId" />
      <WorkSpace :is-employee="authStore.isEmployee" :project-id="projectId" />
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
onMounted(() => {
  if (!project.value) {
    // Если проект не найден, перенаправляем на страницу с проектами
    router.push('/projects');
  }
});
</script>

<style scoped>
.project-page {
  padding: 20px;
}

.project-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
}
</style>