import { v4 as uuidv4 } from 'uuid';
import { defineStore } from 'pinia';
import { reactive } from 'vue';
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
        ? project.blocks.filter((b) => !project.workspaceOrder.includes(b.id))
        : [];
    },

    // Получить заголовки таблицы (блоки в рабочей зоне)
    getTableHeaders: (state) => (projectId) => {
      const project = state.projects.find((project) => project.id === projectId);
      return project
        ? project.workspaceOrder
            .map((id) => project.blocks.find((b) => b.id === id))
            .filter((b) => b)
        : [];
    },
  },
  actions: {
    // Загрузка проектов
    async loadProjects(userId) {
      try {
        const response = await api.get(`/projects?userId=${userId || ''}`);
        this.projects = response.data.map((project) => {
          const mappedProject = this.mapProjectFromServer(project);
  
          // Синхронизируем ячейки для блоков в рабочей зоне
          mappedProject.workspaceOrder.forEach((blockId) => {
            this.syncCellsForBlock(mappedProject.id, blockId);
          });
  
          return mappedProject;
        });
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
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
          type: block.type,
          color: block.color,
          order: project.workspaceOrder.includes(block.id)
            ? project.workspaceOrder.indexOf(block.id)
            : null,
        })),
        tasks: project.tableRows.map((row) => ({
          id: row.id,
          parentId: row.parentId,
          order: row.order,
          status: row.status,
          cells: Object.entries(row.cells).reduce((acc, [blockId, cellData]) => {
            acc[blockId] = {
              value: cellData.value || '',
              type: cellData.type || 'text', // Указываем тип ячейки
            };
            return acc;
          }, {}),
        })),
      };
    
      try {
        await api.put(`/projects/${projectId}/save`, requestData);
      } catch (error) {
        console.error('Ошибка сохранения проекта:', error);
        throw error;
      }
    },

    // Создание нового проекта
    async createProject(name, userId) {
      try {
        const response = await api.post('/projects', {
          name,
          userId: userId || null, // userId может быть null
        });

        const newProject = this.mapProjectFromServer(response.data);
        this.projects.push(newProject);
        return newProject;
      } catch (error) {
        console.error('Ошибка создания проекта:', error);
        throw error;
      }
    },

    // Добавление нового блока
    addBlock(projectId, newBlock) {
      const project = this.getProjectById(projectId);
      if (project) {
        project.blocks.push({
          id: uuidv4(),
          ...newBlock,
        });
      }
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

    // Синхронизация ячеек для блока
    syncCellsForBlock(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      const block = project.blocks.find((b) => b.id === blockId);
      if (!block) return;

      project.tableRows.forEach((row) => {
        if (!row.cells[blockId]) {
          row.cells[blockId] =
            block.type === 'file'
              ? reactive({ type: 'Нет', file: null })
              : '';
        }
      });
    },

    // Перемещение блока обратно в сайдбар
    moveBlockToSidebar(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (project) {
        project.workspaceOrder = project.workspaceOrder.filter(
          (id) => id !== blockId
        );
        project.tableRows.forEach((row) => {
          delete row.cells[blockId];
        });
      }
    },

    // Создать строку
    addRow(projectId) {
      const project = this.getProjectById(projectId);
      if (!project) return;
    
      const newRow = reactive({
        id: uuidv4(),
        cells: [], // Массив ячеек
        status: 'не сдано',
      });
    
      this.getTableHeaders(projectId).forEach((header) => {
        newRow.cells.push({
          blockId: header.id,
          value: header.type === 'file' ? null : '', // Значение по умолчанию
          type: header.type || 'text', // Тип ячейки
        });
      });
    
      project.tableRows.push(newRow);
    },

    // Удаление строки из таблицы
    async deleteRow(taskId) {
      try {
        await api.delete('/tasks', { data: { taskId } });
        this.loadProjects(); // Обновляем список проектов
      } catch (error) {
        console.error('Ошибка удаления строки:', error);
      }
    },

    // Метод для маппинга данных с сервера
    mapProjectFromServer(project) {
      return reactive({
        id: project.id.toString(),
        name: project.name,
        blocks: project.blocks?.map((block) => ({
          id: block.id,
          label: block.label || '',
          type: block.type || 'text',
          color: block.color || '#f0f0f0',
        })) || [],
        workspaceOrder: project.workspaceOrder || [],
        tableRows: reactive(
          project.tasks?.map((task) => ({
            id: task.id.toString(),
            parentId: task.parentId,
            order: task.order,
            status: task.status,
            cells: reactive(task.cells || {}), // Применяем объект cells
          })) || []
        ),
      });
    },

    // Обновление порядка заголовков таблицы
    updateTableHeaders(projectId, newHeaders) {
      const project = this.getProjectById(projectId);
      if (project) {
        const newOrder = newHeaders.map((h) => h.id);
        project.workspaceOrder = newOrder;

        // Синхронизируем ячейки для новых блоков
        const addedBlocks = newOrder.filter((id) => !project.workspaceOrder.includes(id));
        addedBlocks.forEach((blockId) => {
          this.syncCellsForBlock(projectId, blockId);
        });
      }
    },

    // Обновление элементов сайдбара
    updateSidebarItems(projectId, newSidebarItems) {
      const project = this.getProjectById(projectId);
      if (project) {
        const sidebarIds = newSidebarItems.map((item) => item.id);
        project.workspaceOrder = project.workspaceOrder.filter(
          (id) => !sidebarIds.includes(id)
        );
      }
    },

    // Обновление статуса задачи
    async updateTaskStatus(taskId, newStatus) {
      try {
        const response = await api.put(`/tasks/${taskId}`, { newStatus });
        console.log(response);

        this.projects.forEach((project) => {
          const task = project.tableRows.find((row) => row.id === taskId);
          if (task) task.status = newStatus;
        });
      } catch (error) {
        console.error('Ошибка обновления статуса задачи:', error);
      }
    },
  },
});