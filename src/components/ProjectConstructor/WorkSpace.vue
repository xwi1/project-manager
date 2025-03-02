<template>
  <div class="workspace flex-grow-1 p-3">
    <!-- Заголовки таблицы -->
    <vuedraggable
      v-model="workspaceHeaders"
      group="blocks"
      item-key="id"
      ghost-class="ghost"
      @change="onDragEnd"
      class="d-flex gap-2 mb-3"
      :disabled="props.isEmployee"
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
    <div v-for="(row, rowIndex) in tableRows" :key="rowIndex" class="d-flex gap-2 mb-2 align-items-center">
      <!-- Ячейки таблицы -->
      <div
        v-for="header in workspaceHeaders"
        :key="header.id"
        class="table-cell"
        :style="{ width: '200px' }"
      >
        <!-- Если это блок "Контроль", показываем select с сотрудниками -->
        <template v-if="header.type === 'control'">
          <select
            v-model="row.cells[header.id]"
            class="form-control w-100"
            :disabled="props.isEmployee"
          >
            <option value="">Выберите сотрудника</option>
            <option v-for="employee in employees" :key="employee.id" :value="employee.name">
              {{ employee.name }}
            </option>
          </select>
        </template>

        <!-- Если это блок "Отчётность" -->
        <template v-else-if="header.type === 'report'">
          <!-- Для сотрудника: одно поле в зависимости от выбора менеджера -->
          <template v-if="props.isEmployee">
            <!-- Если выбрана ссылка -->
            <input
              v-if="row.cells[header.id] === 'link'"
              v-model="row.reportValue"
              type="text"
              class="form-control w-100"
              placeholder="Введите ссылку"
            />

            <!-- Если выбран файл -->
            <input
              v-else-if="row.cells[header.id] !== 'Нет'"
              type="file"
              class="form-control w-100"
              @change="handleFileUpload($event, row)"
            />

            <!-- Если выбрано "Нет" -->
            <span v-else>Нет</span>
          </template>

          <!-- Для менеджера и администратора: select для выбора типа отчётности -->
          <template v-else>
            <select
              v-model="row.cells[header.id]"
              class="form-control w-100"
            >
              <option value="Нет">Нет</option>
              <option value="link">Ссылка</option>
              <option value="pdf">PDF-файл</option>
              <option value="word">Word-файл</option>
              <option value="image">Изображение</option>
              <option value="any">Любой файл</option>
            </select>
          </template>
        </template>

        <!-- Для остальных блоков -->
        <template v-else>
          <input
            v-if="header.type === 'text'"
            v-model="row.cells[header.id]"
            type="text"
            class="form-control w-100"
            placeholder="Введите текст"
            :disabled="props.isEmployee"
          />
          <input
            v-if="header.type === 'number'"
            v-model="row.cells[header.id]"
            type="number"
            class="form-control w-100"
            placeholder="Введите число"
            :disabled="props.isEmployee"
          />
          <input
            v-if="header.type === 'date'"
            v-model="row.cells[header.id]"
            type="date"
            class="form-control w-100"
            :disabled="props.isEmployee"
          />
        </template>
      </div>

      <!-- Кнопка "Отметить выполнение" (справа от строки) -->
      <button
        v-if="props.isEmployee"
        @click="markTaskAsCompleted(row)"
        class="btn btn-sm"
        :class="{
          'btn-secondary': row.status === 'сдано',
          'btn-success': row.status !== 'сдано',
        }"
        :disabled="row.status === 'сдано' || !canMarkAsCompleted(row)"
      >
        {{ row.status === 'сдано' ? 'Выполнено' : 'Отметить выполнение' }}
      </button>
    </div>

    <!-- Кнопка для добавления строки (скрыта для сотрудника) -->
    <button
      v-if="workspaceHeaders.length > 0 && !props.isEmployee"
      @click="addRow"
      class="btn btn-success mt-3"
    >
      Добавить строку
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { defineProps } from 'vue'; // Добавляем импорт defineProps
import vuedraggable from 'vuedraggable';
import { useProjectStore } from '@/stores/useProjectStore';

// Используем defineProps для получения projectId и isEmployee
const props = defineProps({
  isEmployee: {
    type: Boolean,
    default: false,
  },
  projectId: {
    type: String,
    required: true,
  },
});

const projectStore = useProjectStore();

// Получаем проект по ID
const project = computed(() => projectStore.getProjectById(props.projectId));

// Получаем workspaceHeaders и tableRows из проекта
const workspaceHeaders = computed({
  get: () => projectStore.getTableHeaders(props.projectId),
  set: (value) => projectStore.updateTableHeaders(props.projectId, value),
});

const tableRows = computed(() => project.value?.tableRows || []);

// Липовый список сотрудников
const employees = [
  { id: 1, name: 'Иванов Иван' },
  { id: 2, name: 'Петров Петр' },
  { id: 3, name: 'Сидорова Анна' },
  { id: 4, name: 'Кузнецов Алексей' },
];

// Добавление строки
const addRow = () => {
  projectStore.addRow(props.projectId);
};

// Обработка загрузки файла
const handleFileUpload = (event, row) => {
  const file = event.target.files[0];
  if (file) {
    row.reportValue = file.name; // Сохраняем имя файла
  }
};

// Проверка, можно ли отметить задачу как выполненную
const canMarkAsCompleted = (row) => {
  const reportHeader = workspaceHeaders.value.find((header) => header.type === 'report');
  if (reportHeader) {
    const reportType = row.cells[reportHeader.id];
    if (reportType === 'Нет') {
      return true; // Если отчётность не требуется, можно отметить
    }
    return !!row.reportValue; // Проверяем, заполнено ли поле отчётности
  }
  return true;
};

// Отметка задачи как выполненной
const markTaskAsCompleted = (row) => {
  if (canMarkAsCompleted(row)) {
    row.status = 'на рассмотрении'; // Меняем статус задачи
  }
};

// Обработчик изменения порядка элементов
const onDragEnd = (event) => {
  if (event.removed) {
    // Если блок был удалён из рабочей зоны, возвращаем его в сайдбар
    const blockId = event.removed.element.id;
    projectStore.moveBlockToSidebar(props.projectId, blockId);
  }
};
</script>

<style scoped>
.draggable-item {
  cursor: grab;
  border-radius: 4px;
}

.workspace {
  min-height: 500px; /* Увеличиваем высоту */
  border: 2px dashed #ccc;
  padding: 20px;
  background-color: #f9f9f9;
}

.table-cell {
  width: 200px;
}

.table-cell input,
.table-cell select {
  width: 100%;
  box-sizing: border-box;
}
</style>