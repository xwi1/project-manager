<template>
  <div class="workspace">
    <!-- Подсказка, если нет блоков -->
    <div v-if="workspaceHeaders.length === 0" class="drop-hint text-center my-5">
      Перетащите блоки сюда
    </div>

    <!-- Контейнер для заголовков и строк таблицы -->
    <div class="table-container">
      <!-- Заголовки таблицы -->
      <div class="headers no-wrap">
        <vuedraggable
          v-model="workspaceHeaders"
          group="blocks"
          item-key="id"
          ghost-class="ghost"
          @change="onDragEnd"
          class="d-flex gap-2 mb-3 draggable-zone"
        >
          <template #item="{ element }">
            <div
              class="draggable-item p-2 text-center rounded d-flex align-items-center justify-content-center"
              :style="{ backgroundColor: element.color, width: '200px', height: '50px' }"
            >
              {{ element.label }}
            </div>
          </template>
        </vuedraggable>
      </div>

      <!-- Строки таблицы -->
      <div
        v-for="(row) in tableRows"
        :key="row.id"
        class="table-row d-flex gap-2 mb-2 align-items-center no-wrap"
      >
        <!-- Ячейки таблицы -->
        <div
          v-for="header in workspaceHeaders"
          :key="header.id"
          class="table-cell position-relative"
        >
          <input
            v-if="header.type === 'text'"
            v-model="row.cells[header.id].value"
            type="text"
            class="form-control h-100 w-100 border-0"
            placeholder="Введите текст"
          />
          <!-- <input
            v-if="header.type === 'number'"
            v-model="row.cells[header.id].value"
            type="number"
            class="form-control h-100 w-100 border-0"
            placeholder="Введите число"
          /> -->
          <input
            v-if="header.type === 'date'"
            v-model="row.cells[header.id].value"
            type="date"
            class="form-control h-100 w-100 border-0"
          />
          <!-- <input
            v-if="header.type === 'file'"
            type="file"
            class="form-control h-100 w-100 border-0"
            @change="handleFileUpload($event, row, header)"
          /> -->
        </div>

        <!-- Кнопка удаления строки -->
        <button
          @click="handleDeleteRow(row.id)"
          class="btn btn-sm btn-danger"
        >
          Удалить
        </button>
      </div>
    </div>

    <!-- Кнопка добавления строки -->
    <button
      v-if="workspaceHeaders.length > 0"
      @click="addRow"
      class="btn btn-success mt-3 fixed-button"
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

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const projectStore = useProjectStore();

// Заголовки рабочей зоны
const workspaceHeaders = computed({
  get: () => projectStore.getTableHeaders(props.projectId),
  set: (value) => projectStore.updateTableHeaders(props.projectId, value),
});

// Строки таблицы
const tableRows = computed(() => projectStore.getProjectById(props.projectId)?.tableRows || []);

// Добавление строки
const addRow = () => {
  projectStore.addRow(props.projectId);
};

// Удаление строки
const handleDeleteRow = (taskId) => {
  projectStore.deleteRow(taskId);
};

// Обработка загрузки файла
// const handleFileUpload = (event, row, header) => {
//   const file = event.target.files[0];
//   if (!file) return;

//   // Инициализируем ячейку, если её нет
//   if (!row.cells[header.id]) {
//     row.cells[header.id] = null;
//   }

//   // Сохраняем файл в ячейке
//   row.cells[header.id] = file;
// };

// Обработчик изменения порядка заголовков
const onDragEnd = (event) => {
  if (event.added) {
    const blockId = event.added.element.id;
    const newHeader = event.added.element;

    // Добавляем новую ячейку для всех строк
    tableRows.value.forEach((row) => {
      if (!row.cells[blockId]) {
        row.cells[blockId] = { value: '', type: newHeader.type || 'text' };
      }
    });

    // Перемещаем блок в рабочую зону
    projectStore.moveBlockToWorkspace(props.projectId, blockId);
  }

  if (event.removed) {
    const blockId = event.removed.element.id;

    // Удаляем ячейки, связанные с этим блоком, из всех строк
    tableRows.value.forEach((row) => {
      delete row.cells[blockId];
    });

    // Перемещаем блок в сайдбар
    projectStore.moveBlockToSidebar(props.projectId, blockId);
  }

  // Обновляем порядок блоков
  updateBlockOrder();
};

// Обновление порядка блоков
const updateBlockOrder = () => {
  workspaceHeaders.value.forEach((block, index) => {
    block.order = index; // Устанавливаем порядок в зависимости от позиции
  });

  // Обновляем данные в хранилище
  projectStore.updateTableHeaders(props.projectId, workspaceHeaders.value);
};
</script>

<style scoped>
.workspace {
  padding: 20px;
  border: 1px dashed #ccc;
  background-color: #f9f9f9;
  position: relative;
}

.drop-hint {
  font-size: 1.2rem;
  color: #888;
}

.table-container {
  overflow-x: auto; /* Включаем горизонтальную прокрутку */
  max-height: calc(100vh - 300px); /* Ограничение высоты для вертикальной прокрутки */
  overflow-y: auto;
  padding: 10px 20px; /* Добавлены отступы */
}

.headers {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap; /* Запрещаем перенос строк */
  min-width: 100%; /* Минимальная ширина для активации прокрутки */
}

.draggable-item {
  cursor: grab; /* Курсор для перетаскивания */
  width: 200px; /* Фиксированная ширина блока */
  height: 50px; /* Фиксированная высота блока */
  display: flex;
  align-items: center; /* Выравнивание по центру по вертикали */
  justify-content: center; /* Выравнивание по центру по горизонтали */
  border-radius: 4px; /* Скругление углов */
  flex-shrink: 0; /* Запрещаем сжатие блоков */
}

.draggable-zone {
  min-height: 60px; /* Минимальная высота контейнера */
  width: 100%; /* Занимает всю ширину родительского контейнера */
  background-color: #f9f9f9; /* Фон для визуального выделения */
  border-radius: 4px; /* Скругление углов */
  box-sizing: border-box; /* Учитываем padding и border в размерах */
}

.table-row {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap; /* Запрещаем перенос строк */
  min-width: 100%; /* Минимальная ширина для активации прокрутки */
}

.table-cell {
  width: 200px; /* Фиксированная ширина ячейки */
  height: 50px; /* Фиксированная высота ячейки */
  flex-shrink: 0; /* Запрещаем сжатие ячеек */
  position: relative; /* Для позиционирования input */
}

.table-cell input {
  width: 100%; /* Поле ввода занимает всю ширину ячейки */
  height: 100%; /* Поле ввода занимает всю высоту ячейки */
  box-sizing: border-box; /* Учитываем padding и border в размерах */
  border: 1px solid #ccc; /* Граница для поля ввода */
  border-radius: 4px; /* Скругление углов */
  padding: 5px; /* Отступы внутри поля ввода */
  font-size: 14px; /* Размер текста */
  background-color: #e9ecef; /* Фон для поля ввода */
  outline: none; /* Убираем стандартное выделение при фокусе */
}

.table-cell input:focus {
  border-color: #007bff; /* Изменяем цвет границы при фокусе */
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Добавляем легкую тень для акцента */
}

.fixed-button {
  position: sticky;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}
</style>