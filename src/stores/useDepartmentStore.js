import { defineStore } from 'pinia';
import api from '@/utils/api';

export const useDepartmentStore = defineStore('department', {
  state: () => ({
    departments: [], // Список всех отделов
  }),
  actions: {
    
    // Загрузка отделов
    async loadDepartments() {
      try {
        const response = await api.get('/departments');
        this.departments = response.data.map((department) => ({
          ...department,
          users: department.users || [], // Убедитесь, что поле users всегда определено
        }));
      } catch (error) {
        console.error('Ошибка загрузки отделов:', error);
      }
    },

    // Получение всех пользователей
    async getAllUsers() {
      try {
        const response = await api.get('/departments/users');
        return response.data;
      } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        return [];
      }
    },

    // Получение пользователей без отдела
    async getUnassignedUsers() {
      try {
        const response = await api.get('/departments/users/unassigned');
        return response.data;
      } catch (error) {
        console.error('Ошибка получения пользователей без отдела:', error);
        return [];
      }
    },

    // Получение пользователей отдела с их ролями
    async getUsersWithRoles(departmentId) {
      try {
        const response = await api.get(`/departments/${departmentId}/users-with-roles`);
        return response.data;
      } catch (error) {
        console.error('Ошибка получения пользователей с ролями:', error);
        throw error;
      }
    },

    // Создание нового отдела
    async createDepartment(name) {
      try {
        const response = await api.post('/departments', { name });
        this.departments.push(response.data);
      } catch (error) {
        console.error('Ошибка создания отдела:', error);
        throw error;
      }
    },

    // Обновление отдела
    async updateDepartment(departmentId, updatedData) {
      try {
        // Отправляем запрос на сервер
        const response = await api.put(`/departments/${departmentId}`, updatedData);

        // Обновляем локальное состояние
        const index = this.departments.findIndex((d) => d.id === departmentId);
        if (index !== -1) {
          this.departments[index] = response.data; // Заменяем старый отдел новыми данными
        }
      } catch (error) {
        console.error('Ошибка обновления отдела:', error);
        throw error;
      }
    },

    // Удаление отдела
    async deleteDepartment(departmentId) {
      try {
        await api.delete(`/departments/${departmentId}`);
        this.departments = this.departments.filter((d) => d.id !== departmentId);
      } catch (error) {
        console.error('Ошибка удаления отдела:', error);
        throw error;
      }
    },
  },
});