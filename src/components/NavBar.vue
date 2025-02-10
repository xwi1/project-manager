<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="#">
      <!-- <img src="@/assets/logo.png" alt="Logo" width="30" height="30" class="d-inline-block align-top"> -->
      Project Management
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <!-- Здесь можно добавить другие элементы навигации, если нужно -->
    </div>
    <button class="btn btn-primary create-project-btn" @click="createProject">Create Project</button>
  </nav>
</template>

<script>
export default {
  name: 'TheNavbar',
  methods: {
    createProject() {
      // Логика создания нового проекта
      alert('Create Project button clicked');
    }
  }
};
</script>

<style scoped>
.navbar {
  padding: 0.5% 1%;
  box-shadow: 0 4px 2px -2px gray;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.nav-link {
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #ffcc00 !important;
}

.create-project-btn {
  margin-left: auto; /* Располагает кнопку на самом правом краю */
}
</style>
