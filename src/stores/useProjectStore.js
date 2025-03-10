// useProjectStore.js
import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
  }),
  getters: {
    getProjectById: (state) => (projectId) => {
      return state.projects.find((project) => project.id === projectId);
    },
    getSidebarItems: (state) => (projectId) => {
      const project = state.projects.find((project) => project.id === projectId);
      return project ? project.blocks.filter(b => !project.workspaceOrder.includes(b.id)) : [];
    },
    getTableHeaders: (state) => (projectId) => {
      const project = state.projects.find((project) => project.id === projectId);
      return project ? project.workspaceOrder
        .map(id => project.blocks.find(b => b.id === id))
        .filter(b => b) : [];
    },
  },
  actions: {
    createProject(name) {
      const newProject = reactive({
        id: Date.now().toString(),
        name,
        blocks: [
          { id: 'taskName', label: 'Название задачи', type: 'text', color: '#f0f0f0' },
          { id: 'deadline', label: 'Срок сдачи', type: 'date', color: '#e0f7fa' },
          { id: 'file', label: 'Документ', type: 'file', color: '#fff3e0' },
          { id: 'control', label: 'Контроль', type: 'control', color: '#ffe0b2' },
        ],
        workspaceOrder: [],
        tableRows: reactive([]),
      });
      this.projects.push(newProject);
    },

    addBlock(projectId, newBlock) {
      const project = this.getProjectById(projectId);
      if (project) {
        project.blocks.push({
          id: Date.now().toString(),
          ...newBlock,
        });
      }
    },

    // Основное изменение: добавляем cells при перемещении блока
    moveBlockToWorkspace(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      if (!project.workspaceOrder.includes(blockId)) {
        project.workspaceOrder.push(blockId);
        this.syncCellsForBlock(projectId, blockId);
      }
    },

    // Новый метод для синхронизации
    syncCellsForBlock(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      const block = project.blocks.find(b => b.id === blockId);
      if (!block) return;

      project.tableRows.forEach(row => {
        if (!row.cells[blockId]) {
          row.cells[blockId] = block.type === 'file' 
            ? reactive({ type: 'Нет', file: null }) 
            : '';
        }
      });
    },

    moveBlockToSidebar(projectId, blockId) {
      const project = this.getProjectById(projectId);
      if (project) {
        project.workspaceOrder = project.workspaceOrder.filter(id => id !== blockId);
        project.tableRows.forEach(row => {
          delete row.cells[blockId];
        });
      }
    },

    addRow(projectId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      const newRow = reactive({
        id: Date.now().toString(),
        cells: reactive({}),
        status: 'не сдано',
      });

      // Инициализация для всех текущих заголовков
      this.getTableHeaders(projectId).forEach(header => {
        newRow.cells[header.id] = header.type === 'file' 
          ? reactive({ type: 'Нет', file: null }) 
          : '';
      });

      project.tableRows.push(newRow);
    },

    updateTableHeaders(projectId, newHeaders) {
      const project = this.getProjectById(projectId);
      if (project) {
        // Синхронизируем изменения порядка
        const newOrder = newHeaders.map(h => h.id);
        const addedBlocks = newOrder.filter(id => !project.workspaceOrder.includes(id))        
        project.workspaceOrder = newOrder;
        
        // Добавляем cells для новых блоков
        addedBlocks.forEach(blockId => {
          this.syncCellsForBlock(projectId, blockId);
        });
      }
    },

    // Остальные методы остаются без изменений
    updateTaskStatus(taskId, newStatus) {
      this.projects.forEach(project => {
        const task = project.tableRows.find(row => row.id === taskId);
        if (task) task.status = newStatus;
      });
    },
    updateSidebarItems(projectId, newSidebarItems) {
      const project = this.getProjectById(projectId);
      if (project) {
        const sidebarIds = newSidebarItems.map(item => item.id);
        project.workspaceOrder = project.workspaceOrder.filter(
          id => !sidebarIds.includes(id)
        );
      }
    }
  },
});