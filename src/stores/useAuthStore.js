// stores/useAuthStore.js
import { defineStore } from 'pinia';
import api from '@/utils/api';
import { ref } from 'vue';
import router from '@/router'; // Импортируем router напрямую

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: ref(null), // Текущий пользователь
    isAuthenticated: ref(false), // Флаг авторизации
  }),
  actions: {
    // Логин пользователя
    async login(credentials) {
      try {
        const response = await api.post('/auth/login', {
          email: credentials.email,
          password: credentials.password,
        });

        this.user = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          roles: response.data.roles || [], // Массив ролей
        };

        this.isAuthenticated = true;
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Ошибка авторизации',
        };
      }
    },

    // Регистрация пользователя
    async register(userData) {
      try {
        const response = await api.post('/auth/register', {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          roleNames: [userData.role], // Передаем массив ролей
        });

        this.user = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          roles: response.data.roles || [], // Массив ролей
        };

        this.isAuthenticated = true;
        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Ошибка регистрации',
        };
      }
    },

    // Логаут пользователя
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      router.push('/login');
    },
  },
  getters: {
    // Проверка роли пользователя
    isAdmin: (state) => state.user?.roles.includes('admin'),
    isManager: (state) => state.user?.roles.includes('manager'), // Менеджер
    isEmployee: (state) => state.user?.roles.includes('employee'), // Сотрудник
  },
});