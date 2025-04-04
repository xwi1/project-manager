// useProjectStore.js
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import api from '@/utils/api';

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
    async loadProjects(userId) {
      try {
        const response = await api.get(`/projects?userId=${userId}`);
        this.projects = response.data.map(project => this.mapProjectFromServer(project));
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      }
    },
    async saveProject(projectId) {
      const project = this.getProjectById(projectId);
      if (!project) return;

      try {
        await api.put(`/projects/${projectId}`, {
          blocks: project.blocks,
          workspaceOrder: project.workspaceOrder,
          tableRows: project.tableRows
        });
      } catch (error) {
        console.error('Ошибка сохранения проекта:', error);
        throw error;
      }
    },
    async createProject(name, userId) {
      try {
        const response = await api.post('/projects', { name, userId });
        console.log('Server response:', response.data); // Добавьте это
        
        const newProject = this.mapProjectFromServer(response.data);
        console.log('Mapped project:', newProject); // И это
        
        this.projects.push(newProject);
        return newProject;
      } catch (error) {
        console.error('Ошибка создания проекта:', error);
        throw error;
      }
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
        id: crypto.randomUUID(), // Временный ID
        cells: reactive({}),
        status: 'не сдано',
      });
    
      this.getTableHeaders(projectId).forEach(header => {
        newRow.cells[header.id] = header.type === 'file' 
          ? reactive({ type: 'Нет', file: null }) 
          : '';
      });
    
      project.tableRows.push(newRow);
    },
    
    async deleteRow(taskId) {
      const response = await api.delete('/tasks', { data: { taskId }} )
      // костыль
      this.loadProjects()
      console.log(response)
    },

    mapProjectFromServer(project) {
      return reactive({
        id: project.id.toString(),
        name: project.name,
        blocks: project.blocks?.map(block => ({
          id: block.id.toString(),
          label: block.label || '',
          type: block.type || 'text',
          color: block.color || '#f0f0f0'
        })) || [],
        workspaceOrder: project.workspaceOrder?.map(id => id.toString()) || [],
        tableRows: reactive(
          project.tasks?.map(task => ({
            id: task.id.toString(),
            cells: reactive(task.cells || {}),
            status: task.status || 'не сдано',
            submittedAt: task.submittedAt || null
          })) || []
        )
      });
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
    async updateTaskStatus(taskId, newStatus) {
      try {
        const response = await api.put(`/tasks/${taskId}`, { newStatus })
        console.log(response)
        this.projects.forEach(project => {
          const task = project.tableRows.find(row => row.id === taskId);
          if (task) task.status = newStatus;
        });
      } catch (error) {
        console.log(error)
      }
      
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