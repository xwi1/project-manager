import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [], // Список всех проектов
  }),
  getters: {
    // Получение проекта по ID
    getProjectById: (state) => (projectId) => {
      return state.projects.find((project) => project.id === projectId);
    },
    // Получение sidebarItems для конкретного проекта
    getSidebarItems: (state) => (projectId) => {
      const project = state.projects.find((project) => project.id === projectId);
      if (project) {
        return project.blocks.filter((block) => !project.workspaceOrder.includes(block.id));
      }
      return [];
    },
    // Получение tableHeaders для конкретного проекта
    getTableHeaders: (state) => (projectId) => {
      const project = state.projects.find((project) => project.id === projectId);
      if (project) {
        return project.workspaceOrder
          .map((id) => project.blocks.find((block) => block.id === id))
          .filter((block) => block !== undefined);
      }
      return [];
    },
  },
  actions: {
    // Создание нового проекта
    createProject(name) {
      const newProject = {
        id: Date.now().toString(), // Уникальный ID
        name: name,
        blocks: [
          { id: 'taskName', label: 'Название задачи', type: 'text', color: '#f0f0f0' },
          { id: 'deadline', label: 'Срок сдачи', type: 'date', color: '#e0f7fa' },
          { id: 'report', label: 'Отчётность', type: 'report', color: '#fff3e0' },
          { id: 'control', label: 'Контроль', type: 'control', color: '#ffe0b2' },
        ], // Начальные блоки
        workspaceOrder: [], // Порядок ID блоков в рабочей области
        tableRows: [], // Строки таблицы
      };
      this.projects.push(newProject);
    },
    // Добавление нового блока
    addBlock(projectId, newBlock) {
      const project = this.getProjectById(projectId);
      if (project) {
        const block = {
          id: Date.now().toString(), // Уникальный ID
          label: newBlock.label,
          type: newBlock.type,
          color: newBlock.color,
        };
        project.blocks.push(block);

        // Если блок добавлен в рабочую зону, инициализируем данные для всех строк
        if (project.workspaceOrder.includes(block.id)) {
          project.tableRows.forEach((row) => {
            if (block.type === 'report') {
              // Для полей "Отчётность" создаём объект с типом и файлом
              row.cells[block.id] = { type: 'Нет', file: null };
            } else {
              // Для остальных полей используем пустую строку
              row.cells[block.id] = '';
            }
          });
        }
      }
    },
    // Обновление tableHeaders (рабочей области)
    updateTableHeaders(projectId, newHeaders) {
      const project = this.getProjectById(projectId);
      if (project) {
        project.workspaceOrder = newHeaders.map((header) => header.id);
      }
    },
    // Обновление sidebarItems (сайдбара)
    updateSidebarItems(projectId, newSidebarItems) {
      const project = this.getProjectById(projectId);
      if (project) {
        const sidebarIds = newSidebarItems.map((item) => item.id);
        project.workspaceOrder = project.workspaceOrder.filter((id) => !sidebarIds.includes(id));
      }
    },
    // Перемещение блока в рабочую зону
    moveBlockToWorkspace(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (project) {
        if (!project.workspaceOrder.includes(blockId)) {
          project.workspaceOrder.push(blockId);
        }
      }
    },
    // Перемещение блока обратно в сайдбар
    moveBlockToSidebar(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (project) {
        project.workspaceOrder = project.workspaceOrder.filter((id) => id !== blockId);
        // Очищаем данные по этому столбцу во всех строках
        project.tableRows.forEach((row) => {
          delete row.cells[blockId];
        });
      }
    },
    // Добавление строки
    addRow(projectId, newRow) {
      const project = this.getProjectById(projectId);
      if (project) {
        // Инициализируем ячейки для всех заголовков
        const headers = this.getTableHeaders(projectId);
        headers.forEach((header) => {
          if (header.type === 'report') {
            // Для полей "Отчётность" создаём объект с типом и файлом
            newRow.cells[header.id] = { type: 'Нет', file: null };
          } else {
            // Для остальных полей используем пустую строку
            newRow.cells[header.id] = '';
          }
        });

        project.tableRows.push(newRow);
      }
    },
    // Обновление статуса задачи
    updateTaskStatus(taskId, newStatus) {
      this.projects.forEach((project) => {
        const task = project.tableRows.find((row) => row.id === taskId);
        if (task) {
          task.status = newStatus;
        }
      });
    },
  },
});