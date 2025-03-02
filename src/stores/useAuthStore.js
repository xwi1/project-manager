// stores/useAuthStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: ref(null), // Текущий пользователь
    isAuthenticated: ref(false), // Флаг авторизации
  }),
  actions: {
    // Логин пользователя
    login(userData) {
      this.user = userData;
      this.isAuthenticated = true;
    },
    // Логаут пользователя
    logout() {
      this.user = null;
      this.isAuthenticated = false;
    },
    // Регистрация пользователя
    register(userData) {
      this.user = userData;
      this.isAuthenticated = true;
    },
  },
  getters: {
    // Проверка роли пользователя
    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager', // Менеджер
    isEmployee: (state) => state.user?.role === 'employee', // Сотрудник
  },
});