<template>
    <div class="container">
      <h1 class="my-4">Projects</h1>
      <div class="row">
        <div class="col-md-4" v-for="project in projects" :key="project.id">
          <ProjectCard :project="project" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import ProjectCard from '@/components/ProjectCard.vue';
  
  export default {
    name: 'ProjectsView',
    components: {
      ProjectCard
    },
    data() {
      return {
        projects: [
          { id: 1, name: 'Project 1', description: 'Description of Project 1', status: 'active' },
          { id: 2, name: 'Project 2', description: 'Description of Project 2', status: 'completed' },
          { id: 2, name: 'Project 2', description: 'Description of Project 2', status: 'completed' },
          { id: 2, name: 'Project 2', description: 'Description of Project 2', status: 'completed' },
          { id: 2, name: 'Project 2', description: 'Description of Project 2', status: 'completed' },
          { id: 2, name: 'Project 2', description: 'Description of Project 2', status: 'completed' },
          { id: 2, name: 'Project 2', description: 'Description of Project 2', status: 'completed' },
          { id: 2, name: 'Project 2', description: 'Description of Project 2', status: 'completed' },
          { id: 2, name: 'Project 2', description: 'Description of Project 2', status: 'completed' }
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  /* Добавьте стили для страницы проектов */
  </style>
  