import { defineStore } from 'pinia';
// import { ref, computed } from 'vue';
import api from '@/utils/api';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [], // Список всех проектов
  }),
  getters: {
    // Получить проект по ID
    getProjectById: (state) => (projectId) => {
      return state.projects.find((project) => project.id === projectId);
    },

    // Получить блоки, которые находятся в сайдбаре
    getSidebarItems: (state) => (projectId) => {
      const project = state.projects.find((project) => project.id === projectId);
      return project
        ? project.blocks.filter((block) => !project.workspaceOrder.includes(block.id))
        : [];
    },

    // Получить заголовки таблицы (блоки в рабочей зоне)
    getTableHeaders: (state) => (projectId) => {
      const project = state.projects.find((project) => project.id === projectId);
      return project
        ? project.workspaceOrder.map((id) => project.blocks.find((block) => block.id === id))
        : [];
    },
  },
  actions: {
    // Загрузка проектов
    async loadProjects(userId = null) {
      try {
        const response = await api.get('/projects', { params: { userId } });
        this.projects = response.data.map((project) => this.mapProjectFromServer(project));
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      }
    },

    // Создание нового проекта
    async createProject(name, userId = null, departmentId = null) {
      try {
        const response = await api.post('/projects', { name, userId, departmentId });
        const newProject = this.mapProjectFromServer(response.data);
        this.projects.push(newProject);
        return newProject;
      } catch (error) {
        console.error('Ошибка создания проекта:', error);
        throw error;
      }
    },

    // Обновление проекта
    async updateProject(projectId, updatedData) {
      try {
        // Отправляем запрос на сервер для обновления проекта
        const response = await api.put(`/projects/${projectId}`, updatedData);

        // Находим проект в локальном состоянии и обновляем его данные
        const projectIndex = this.projects.findIndex((project) => project.id === projectId);
        if (projectIndex !== -1) {
          this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            ...this.mapProjectFromServer(response.data),
            departmentId: updatedData.departmentId || null, // Убедитесь, что departmentId обновляется
          };
        }
      } catch (error) {
        console.error('Ошибка обновления проекта:', error);
        throw error;
      }
    },

    // Удаление проекта
    async deleteProject(projectId) {
      try {
        // Отправляем запрос на сервер для удаления проекта
        await api.delete(`/projects/${projectId}`);

        // Удаляем проект из локального состояния
        this.projects = this.projects.filter((project) => project.id !== projectId);
      } catch (error) {
        console.error('Ошибка удаления проекта:', error);
        throw error;
      }
    },
    

    // Сохранение проекта
    async saveProject(projectId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      const requestData = {
        blocks: project.blocks.map((block) => ({
          id: block.id,
          label: block.label,
          color: block.color,
          type: block.type,
          order: block.order,
        })),
        tasks: project.tableRows.map((row) => ({
          id: row.id,
          parentId: row.parentId,
          order: row.order,
          status: row.status,
          cells: Object.fromEntries(
            Object.entries(row.cells).map(([blockId, cellData]) => {
              return [blockId, { value: cellData.value, type: cellData.type || 'text' }];
            })
          ),
        })),
      };

      try {
        await api.put(`/projects/${projectId}/save`, requestData);
      } catch (error) {
        console.error('Ошибка сохранения проекта:', error);
        throw error;
      }
    },

    // Добавление нового блока
    addBlock(projectId, newBlock) {
      const project = this.getProjectById(projectId);
      if (project) {
        project.blocks.push({ ...newBlock, id: Date.now().toString() });
      }
    },
    
    // Удаление блока
    deleteBlock(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      // Удаляем блок из массива blocks
      project.blocks = project.blocks.filter((block) => block.id !== blockId);

      // Удаляем блок из workspaceOrder, если он там есть
      project.workspaceOrder = project.workspaceOrder.filter((id) => id !== blockId);

      // Удаляем ячейки, связанные с этим блоком, из всех строк
      project.tableRows.forEach((row) => {
        delete row.cells[blockId];
      });
    },

    // Перемещение блока в рабочую зону
    moveBlockToWorkspace(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      if (!project.workspaceOrder.includes(blockId)) {
        project.workspaceOrder.push(blockId);
        this.syncCellsForBlock(projectId, blockId);
      }
    },

    // Перемещение блока обратно в сайдбар
    moveBlockToSidebar(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      project.workspaceOrder = project.workspaceOrder.filter((id) => id !== blockId);
      project.tableRows.forEach((row) => {
        delete row.cells[blockId];
      });
    },
    updateTableHeaders(projectId, newHeaders) {
      const project = this.getProjectById(projectId);
      if (project) {
        // Обновляем порядок заголовков
        project.workspaceOrder = newHeaders.map((header) => header.id);

        // Синхронизируем ячейки для новых блоков
        newHeaders.forEach((header) => {
          this.syncCellsForBlock(projectId, header.id);
        });
      }
    },

    syncCellsForBlock(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      const block = project.blocks.find((b) => b.id === blockId);
      if (!block) return;

      // Для каждой строки таблицы добавляем ячейку для нового блока
      project.tableRows.forEach((row) => {
        if (!row.cells[blockId]) {
          row.cells[blockId] =
            block.type === 'file'
              ? { type: 'Нет', file: null } // Для файлов
              : ''; // Для других типов
        }
      });
    },

    updateSidebarItems(projectId, newSidebarItems) {
      const project = this.getProjectById(projectId);
      if (project) {
        // Обновляем порядок элементов в сайдбаре
        const sidebarIds = newSidebarItems.map((item) => item.id);

        // Удаляем блоки из рабочей зоны, если они были перемещены в сайдбар
        project.workspaceOrder = project.workspaceOrder.filter(
          (id) => !sidebarIds.includes(id)
        );
      }
    },

    // Создать строку в таблице
    addRow(projectId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      const newRow = {
        id: Date.now().toString(),
        cells: Object.fromEntries(
          this.getTableHeaders(projectId).map((header) => [
            header.id,
            { value: '', type: header.type || 'text' },
          ])
        ),
        status: 'не сдано',
      };

      console.log('Новая строка:', newRow);

      project.tableRows.push(newRow);
    },

    // Удаление строки из таблицы
    async deleteRow(taskId) {
      try {
        await api.delete('/tasks', { data: { taskId } });
        this.projects.forEach((project) => {
          project.tableRows = project.tableRows.filter((row) => row.id !== taskId);
        });
      } catch (error) {
        console.error('Ошибка удаления строки:', error);
      }
    },

    // Обновление статуса задачи
    async updateTaskStatus(taskId, newStatus) {
      try {
        await api.put(`/tasks/${taskId}`, { newStatus });
        this.projects.forEach((project) => {
          const task = project.tableRows.find((row) => row.id === taskId);
          if (task) task.status = newStatus;
        });
      } catch (error) {
        console.error('Ошибка обновления статуса задачи:', error);
      }
    },

    // Метод для маппинга данных с сервера
    mapProjectFromServer(project) {
      return {
        id: project.id.toString(),
        name: project.name,
        departmentId: project.departmentId || null, // Добавьте это поле
        blocks: project.blocks || [],
        workspaceOrder: this.initializeWorkspaceOrder(project.blocks),
        tableRows: project.tasks?.map((task) => ({
          id: task.id.toString(),
          parentId: task.parentId,
          order: task.order,
          status: task.status,
          cells: Object.fromEntries(
            Object.entries(task.cells || {}).map(([blockId, cellData]) => {
              // Преобразуем строки обратно в числа, если тип данных — число
              const value = cellData.type === 'number' ? parseInt(cellData.value) : cellData.value;
              return [blockId, { value: value, type: cellData.type || 'text' }];
            })
          ),
        })) || [],
      };
    },

    // Метод для инициализации workspaceOrder на основе order блоков
    initializeWorkspaceOrder(blocks) {
      if (!blocks || blocks.length === 0) return [];

      // Фильтруем блоки, у которых есть значение order (не null)
      const orderedBlocks = blocks
        .filter((block) => block.order !== null && block.order >= 0)
        .sort((a, b) => a.order - b.order); // Сортируем по значению order

      // Возвращаем массив ID блоков в порядке их order
      return orderedBlocks.map((block) => block.id);
    },
  },
});