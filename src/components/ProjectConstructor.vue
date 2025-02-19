<template>
  <div class="constructor d-flex">
    <!-- Боковая панель (sidebar) -->
    <div class="sidebar p-3 border-end">
      <!-- Форма для создания нового блока -->
      <div class="mb-4">
        <h5>Создать новый блок</h5>
        <input
          v-model="newBlock.label"
          type="text"
          placeholder="Название блока"
          class="form-control mb-2"
          required
        />
        <select v-model="newBlock.type" class="form-control mb-2">
          <option value="text">Текст</option>
          <option value="number">Число</option>
          <option value="date">Дата</option>
          <option value="priority">Приоритет</option>
          <option value="report">Отчётность</option>
        </select>
        <input v-model="newBlock.color" type="color" class="form-control mb-2" />
        <button @click="addNewBlock" class="btn btn-primary w-100">Добавить блок</button>
        <div v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>
      </div>

      <!-- Список блоков в сайдбаре -->
      <vuedraggable
        v-model="sidebarItems"
        group="blocks"
        item-key="id"
        ghost-class="ghost"
        @change="onDragEnd"
      >
        <template #item="{ element }">
          <div
            class="draggable-item p-2 mb-2 text-center"
            :style="{ backgroundColor: element.color }"
          >
            {{ element.label }}
          </div>
        </template>
      </vuedraggable>
    </div>

    <!-- Рабочая область (workspace) -->
    <div class="workspace flex-grow-1 p-3">
      <!-- Заголовки таблицы -->
      <vuedraggable
        v-model="tableHeaders"
        group="blocks"
        item-key="id"
        ghost-class="ghost"
        @change="onDragEnd"
        class="d-flex gap-2 mb-3"
      >
        <template #item="{ element }">
          <div
            class="draggable-item p-2 text-center"
            :style="{ backgroundColor: element.color, width: '200px' }"
          >
            {{ element.label }}
          </div>
        </template>
      </vuedraggable>

      <!-- Строки таблицы -->
      <div v-for="(row, rowIndex) in tableRows" :key="rowIndex" class="d-flex gap-2 mb-2">
        <div
          v-for="header in tableHeaders"
          :key="header.id"
          class="table-cell"
          :style="{ width: '200px' }" 
        >
          <!-- Ввод данных в зависимости от типа блока -->
          <input
            v-if="header.type === 'text'"
            v-model="row.cells[header.id]"
            type="text"
            class="form-control w-100"
            placeholder="Введите текст"
          />
          <input
            v-if="header.type === 'number'"
            v-model="row.cells[header.id]"
            type="number"
            class="form-control w-100"
            placeholder="Введите число"
          />
          <input
            v-if="header.type === 'date'"
            v-model="row.cells[header.id]"
            type="date"
            class="form-control w-100"
          />
          <select
            v-if="header.type === 'priority'"
            v-model="row.cells[header.id]"
            class="form-control w-100"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
          <select
            v-if="header.type === 'report'"
            v-model="row.cells[header.id]"
            class="form-control w-100"
          >
            <option value="link">Ссылка</option>
            <option value="pdf">PDF-файл</option>
            <option value="word">Word-файл</option>
            <option value="image">Изображение</option>
            <option value="any">Любой файл</option>
          </select>
        </div>
      </div>

      <!-- Кнопка для добавления строки -->
      <button
        v-if="tableHeaders.length > 0"
        @click="addRow"
        class="btn btn-success mt-3"
      >
        Добавить строку
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTableStore } from '@/stores/useTableStore';
import vuedraggable from 'vuedraggable';

const store = useTableStore();

// Локальное состояние для нового блока
const newBlock = ref({
  label: '',
  type: 'text',
  color: '#f0f0f0',
});

// Сообщение об ошибке
const errorMessage = ref('');

// Добавление нового блока
const addNewBlock = () => {
  if (!newBlock.value.label.trim()) {
    errorMessage.value = 'Название блока не может быть пустым!';
    return;
  }
  errorMessage.value = '';
  store.addBlock(newBlock.value);
  newBlock.value = { label: '', type: 'text', color: '#f0f0f0' }; // Сброс формы
};

// Получение данных из хранилища
const sidebarItems = computed({
  get: () => store.sidebarItems,
  set: (value) => store.updateSidebarItems(value),
});

const tableHeaders = computed({
  get: () => store.tableHeaders,
  set: (value) => store.updateTableHeaders(value),
});

const tableRows = computed(() => store.tableRows);

// Добавление строки
const addRow = () => {
  store.addRow();
};
</script>

<style scoped>
.constructor {
  height: 100vh;
}

.sidebar {
  width: 250px;
}

.draggable-item {
  cursor: grab;
  border-radius: 4px;
}

.workspace {
  min-height: 400px;
  border: 2px dashed #ccc;
  padding: 20px;
  background-color: #f9f9f9;
}

.table-cell {
  width: 200px; /* Фиксированная ширина ячейки */
}

.table-cell input,
.table-cell select {
  width: 100%;
  box-sizing: border-box; /* Учитываем padding и border в ширине */
}

.add-row-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-row-button:hover {
  background-color: #45a049;
}
</style>