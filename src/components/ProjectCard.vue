<template>
    
    <router-link to="/project/1">
      <div class="card project-card">
        <div class="card-body">
          <h5 class="card-title">{{ project.name }}</h5>
          <p class="card-text">{{ project.description }}</p>
          <p class="card-text"><small class="text-muted">Status: {{ project.status }}</small></p>
        </div>
      </div>
    </router-link>
  </template>
  
  <script>
  export default {
    name: 'ProjectCard',
    props: {
      project: {
        type: Object,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  * {

  }

  .project-card {
    margin-bottom: 20px;
  }
  </style>
  