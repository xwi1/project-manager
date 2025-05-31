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
    <div
      v-for="(row) in tableRows"
      :key="row.id"
      class="d-flex gap-2 mb-2 align-items-center"
    >
      <!-- Ячейки таблицы -->
      <div
        v-for="header in workspaceHeaders"
        :key="header.id"
        class="table-cell"
        :style="{ width: '200px' }"
      >
        <!-- Если это блок "Контроль" -->
        <template v-if="header.type === 'control'">
          <select
            v-model="row.cells[header.id]"
            class="form-control w-100"
            :disabled="props.isEmployee || row.status === 'approved'"
          >
            <option value="">Выберите сотрудника</option>
            <option
              v-for="employee in employees"
              :key="employee.id"
              :value="employee.id"
            >
              {{ employee.name }}
            </option>
          </select>
        </template>

        <!-- Если это блок "Документ" -->
        <template v-else-if="header.type === 'file'">
          <!-- Для сотрудника -->
          <template v-if="props.isEmployee">
            <!-- Если выбрана ссылка -->
            <input
              v-if="row.cells[header.id]?.type === 'link'"
              v-model="row.cells[header.id].file"
              type="text"
              class="form-control w-100"
              placeholder="Введите ссылку"
              :disabled="row.status === 'approved'"
            />
            <!-- Если выбран файл -->
            <input
              v-else-if="row.cells[header.id]?.type !== 'Нет'"
              type="file"
              class="form-control w-100"
              @change="handleFileUpload($event, row, header)"
              :disabled="row.status === 'approved'"
            />
            <!-- Если выбрано "Нет" -->
            <span v-else>Нет</span>
          </template>

          <!-- Для менеджера/администратора -->
          <template v-else>
            <select
              v-model="row.cells[header.id].type"
              class="form-control w-100"
              :disabled="row.status === 'approved'"
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

        <!-- Для остальных типов блоков -->
        <template v-else>
          <input
            v-if="header.type === 'text'"
            v-model="row.cells[header.id]"
            type="text"
            class="form-control w-100"
            placeholder="Введите текст"
            :disabled="props.isEmployee || row.status === 'сдано'"
          />
          <input
            v-if="header.type === 'number'"
            v-model="row.cells[header.id]"
            type="number"
            class="form-control w-100"
            placeholder="Введите число"
            :disabled="props.isEmployee || row.status === 'сдано'"
          />
          <input
            v-if="header.type === 'date'"
            v-model="row.cells[header.id]"
            type="date"
            class="form-control w-100"
            :disabled="props.isEmployee || row.status === 'сдано'"
          />
        </template>
      </div>

      <!-- Кнопка "Отметить выполнение" для сотрудников -->
      <template v-if="props.isEmployee">
        <button
          v-if="row.status === 'not submitted'"
          @click="markTaskAsCompleted(row)"
          class="btn btn-sm btn-success"
          :disabled="!canMarkAsCompleted(row)"
        >
          Отметить выполнение
        </button>
        <button
          v-else-if="row.status === 'submitted'"
          class="btn btn-sm btn-warning"
          disabled
        >
          На рассмотрении
        </button>
        <span v-else-if="row.status === 'approved'" class="badge bg-success">Выполнено</span>
      </template>

      <!-- Кнопка удаления строки для администраторов/менеджеров -->
      <template v-if="!props.isEmployee">
        <button
          @click="handleDeleteRow(row.id)"
          class="btn btn-sm btn-danger"
        >
          Удалить
        </button>
      </template>
    </div>

    <!-- Кнопка добавления строки (доступна только администраторам/менеджерам) -->
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
import { defineProps } from 'vue';
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

// Заголовки рабочей зоны
const workspaceHeaders = computed({
  get: () => projectStore.getTableHeaders(props.projectId),
  set: (value) => projectStore.updateTableHeaders(props.projectId, value),
});

// Строки таблицы
const tableRows = computed(() => project.value?.tableRows || []);

// Липовый список сотрудников (заменить на реальный API)
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

// Удаление строки
const handleDeleteRow = (taskId) => {
  projectStore.deleteRow(taskId);
};

// Обработка загрузки файла
const handleFileUpload = (event, row, header) => {
  const file = event.target.files[0];
  if (!file) return;

  // Инициализируем ячейку, если её нет
  if (!row.cells[header.id]) {
    row.cells[header.id] = { type: 'any', file: null };
  }

  // Сохраняем файл в ячейке
  row.cells[header.id].file = file;
};

// Проверка, можно ли отметить задачу как выполненную
const canMarkAsCompleted = (row) => {
  const fileHeaders = workspaceHeaders.value.filter(
    (header) => header.type === 'file'
  );

  // Для каждого блока "Документ" проверяем, что файл выбран
  for (const header of fileHeaders) {
    const cell = row.cells[header.id];
    if (cell?.type !== 'Нет' && !cell?.value) {
      return false;
    }
  }

  return true;
};

// Отметка задачи как выполненной
const markTaskAsCompleted = (row) => {
  if (canMarkAsCompleted(row)) {
    projectStore.updateTaskStatus(row.id, 'submitted');
  }
};

// Обработчик изменения порядка заголовков
const onDragEnd = (event) => {
  if (event.removed) {
    // Если блок был удалён из рабочей зоны, перемещаем его в сайдбар
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
  min-height: 500px;
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

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}
</style>