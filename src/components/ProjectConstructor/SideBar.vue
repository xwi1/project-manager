<template>
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
        <option value="date">Дата</option>
        <option value="control">Контроль</option>
      </select>
      <input v-model="newBlock.color" type="color" class="form-control mb-2" />
      <button @click="addNewBlock" class="btn btn-primary w-100">Добавить блок</button>
      <div v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>
    </div>

    <!-- Список блоков в сайдбаре -->
    <div class="blocks-container">
      <vuedraggable
        v-model="sidebarItems"
        group="blocks"
        item-key="id"
        ghost-class="ghost"
        @change="onDragEnd"
      >
        <template #item="{ element }">
          <div
            class="d-flex align-items-center justify-content-between draggable-item p-2 mb-2 text-center"
            :style="{ backgroundColor: element.color }"
          >
            <span>{{ element.label }}</span>
            <font-awesome-icon
              icon="trash"
              class="text-danger cursor-pointer"
              @click.stop="deleteBlock(element.id)"
              title="Удалить блок"
            />
          </div>
        </template>
      </vuedraggable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import { useProjectStore } from '@/stores/useProjectStore';
import vuedraggable from 'vuedraggable';

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const store = useProjectStore();

// Локальное состояние для нового блока
const newBlock = ref({
  label: '',
  type: 'text',
  color: '#f0f0f0',
  order: null
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
  store.addBlock(props.projectId, newBlock.value);
  newBlock.value = { label: '', type: 'text', color: '#f0f0f0' }; // Сброс формы
};

// Получение данных из хранилища
const sidebarItems = computed({
  get: () => store.getSidebarItems(props.projectId),
  set: (value) => store.updateSidebarItems(props.projectId, value),
});

// Обработчик изменения порядка элементов
const onDragEnd = (event) => {
  if (event.added) {
    const blockId = event.added.element.id;
    store.moveBlockToWorkspace(props.projectId, blockId);
  }
};

// Удаление блока
const deleteBlock = (blockId) => {
  store.deleteBlock(props.projectId, blockId);
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px); /* Ограничиваем высоту сайдбара */
}

.blocks-container {
  flex-grow: 1; /* Занимает оставшееся пространство */
  overflow-y: auto; /* Вертикальная прокрутка для списка блоков */
  padding-top: 10px;
}

.draggable-item {
  cursor: grab;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.draggable-item span {
  flex-grow: 1;
  text-align: left;
  margin-right: 10px;
}
</style>