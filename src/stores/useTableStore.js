// stores/useTableStore.js
import { defineStore } from 'pinia';

export const useTableStore = defineStore('table', {
  state: () => ({
    blocks: [
      { id: 'taskName', label: 'Название задачи', type: 'text', color: '#f0f0f0' },
      { id: 'deadline', label: 'Срок сдачи', type: 'date', color: '#e0f7fa' },
      { id: 'report', label: 'Отчётность', type: 'report', color: '#fff3e0' },
      { id: 'control', label: 'Контроль', type: 'control', color: '#ffe0b2' }, // Тип изменён на 'control'
    ],
    workspaceOrder: [],
    tableRows: [],
  }),
  getters: {
    sidebarItems: (state) =>
      state.blocks.filter((block) => !state.workspaceOrder.includes(block.id)),
    tableHeaders: (state) =>
      state.workspaceOrder
        .map((id) => state.blocks.find((block) => block.id === id))
        .filter((block) => block !== undefined),
  },
  actions: {
    addBlock(newBlock) {
      const block = {
        id: Date.now().toString(),
        label: newBlock.label,
        type: newBlock.type,
        color: newBlock.color,
      };
      this.blocks.push(block);
    },
    updateSidebarItems(newSidebarItems) {
      const sidebarIds = newSidebarItems.map((item) => item.id);
      this.workspaceOrder = this.workspaceOrder.filter((id) => !sidebarIds.includes(id));
    },
    updateTableHeaders(newTableHeaders) {
      this.workspaceOrder = newTableHeaders.map((header) => header.id);
    },
    addRow() {
      const newRow = {
        id: Date.now(),
        cells: {},
        status: 'не сдано', // Статус задачи
      };
      this.tableHeaders.forEach((header) => {
        newRow.cells[header.id] = '';
      });
      this.tableRows.push(newRow);
    },
  },
});