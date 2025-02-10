<template>
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Login</h3>
              <form @submit.prevent="login">
                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" class="form-control" v-model="email" required>
                </div>
                <div class="form-group">
                  <label for="password">Password</label>
                  <input type="password" class="form-control" v-model="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoginView',
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      login() {
        // Логика входа в систему
        this.$router.push('/dashboard');
      }
    }
  };
  </script>
  
  <style scoped>
  /* Добавьте стили для страницы входа */
  </style>
  