// stores/useAuthStore.js
import { defineStore } from 'pinia';
import api from '@/utils/api'
import { ref } from 'vue';
import router from '@/router' // Импортируем router напрямую

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
          password: credentials.password // Добавляем пароль
        });

        this.user = {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role
        };

        this.isAuthenticated = true;
        return { success: true };
      } catch (error) {
        return { 
          success: false,
          error: error.response?.data?.error || 'Ошибка авторизации'
        };
      }
    },
    // Регистрация пользователя
    async register(userData) {
      try {
        const response = await api.post('/auth/register', {
          email: userData.email,
          password: userData.password,
          role: userData.role
        })

        this.user = {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role
        }
        
        this.isAuthenticated = true
        return { success: true }
      } catch (error) {
        console.error('Registration error:', error)
        return { 
          success: false, 
          error: error.response?.data?.error || 'Ошибка регистрации' 
        }
      }
    },
    // Логаут пользователя
    logout() {
      this.user = null
      this.isAuthenticated = false
      router.push('/login')
    }
  },
  getters: {
    // Проверка роли пользователя
    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager', // Менеджер
    isEmployee: (state) => state.user?.role === 'employee', // Сотрудник
  },
});