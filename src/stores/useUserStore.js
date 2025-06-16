import { defineStore } from 'pinia';
import api from '@/utils/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [], // Список всех пользователей
  }),
  actions: {
    // Загрузка пользователей
    async loadUsers() {
      try {
        const response = await api.get('/users');
        this.users = response.data.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          departmentId: user.departmentId || null,
          roles: Array.isArray(user.roles) ? user.roles : [user.roles], // Преобразуем в массив
        }));
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
    },

    // Обновление пользователя
    async updateUser(userId, updatedData) {
      try {
        const response = await api.put(`/users/${userId}`, updatedData);

        // Находим индекс пользователя в массиве users
        const userIndex = this.users.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          // Создаем новый объект пользователя с обновленными данными
          const updatedUser = {
            ...this.users[userIndex],
            ...response.data,
            roles: updatedData.roles || this.users[userIndex].roles, // Обновляем роли
          };

          // Заменяем пользователя в массиве через splice для реактивности
          this.users.splice(userIndex, 1, updatedUser);
        }
      } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        throw error;
      }
    },

    // Удаление пользователя
    async deleteUser(userId) {
      try {
        await api.delete(`/users/${userId}`);
        this.users = this.users.filter((user) => user.id !== userId);
      } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        throw error;
      }
    },
  },
});