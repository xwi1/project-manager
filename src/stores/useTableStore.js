import { defineStore } from 'pinia';

export const useTableStore = defineStore('table', {
  state: () => ({
    blocks: [
      { id: 'taskName', label: 'Название задачи', type: 'text', color: '#f0f0f0' },
      { id: 'deadline', label: 'Срок сдачи', type: 'date', color: '#e0f7fa' },
      { id: 'report', label: 'Отчётность', type: 'report', color: '#fff3e0' },
    ], // Начальные блоки
    workspaceOrder: [], // Порядок ID блоков в рабочей области
    tableRows: [], // Строки таблицы
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
    // Добавление нового блока
    addBlock(newBlock) {
      const block = {
        id: Date.now().toString(), // Уникальный ID
        label: newBlock.label,
        type: newBlock.type,
        color: newBlock.color,
      };
      this.blocks.push(block);
    },
    // Обновление сайдбара
    updateSidebarItems(newSidebarItems) {
      const sidebarIds = newSidebarItems.map((item) => item.id);
      this.workspaceOrder = this.workspaceOrder.filter((id) => !sidebarIds.includes(id));
    },
    // Обновление рабочей области
    updateTableHeaders(newTableHeaders) {
      this.workspaceOrder = newTableHeaders.map((header) => header.id);
    },
    // Добавление строки
    addRow() {
      const newRow = {
        id: Date.now(),
        cells: {},
      };
      this.tableHeaders.forEach((header) => {
        newRow.cells[header.id] = '';
      });
      this.tableRows.push(newRow);
    },
  },
});