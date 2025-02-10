<template>
  <div>
    <div :class="['sidebar', { 'sidebar-open': isOpen }]">
      <div class="sidebar-header">
        <h5>Menu</h5>
      </div>
      <ul class="sidebar-list">
        <li class="sidebar-item">
          <router-link to="/projects" class="sidebar-link">
            <i class="bi bi-folder"></i> Projects
          </router-link>
        </li>
        <li class="sidebar-item">
          <router-link to="/reports" class="sidebar-link">
            <i class="bi bi-file-earmark-text"></i> Reports
          </router-link>
        </li>
        <li class="sidebar-item">
          <router-link to="/calendar" class="sidebar-link">
            <i class="bi bi-file-earmark-text"></i> Calendar
          </router-link>
        </li>
      </ul>
    </div>
    <button class="toggle-btn" @click="toggleSidebar">
      <i :class="['bi', isOpen ? 'bi-chevron-double-left' : 'bi-chevron-double-right']"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'SideBar',
  data() {
    return {
      isOpen: true // Установите начальное состояние в true
    };
  },
  methods: {
    toggleSidebar() {
      this.isOpen = !this.isOpen;
      this.$emit('sidebar-toggle', this.isOpen);
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #343a40;
  color: #ffffff;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  transform: translateX(0); /* Открыто по умолчанию */
  transition: transform 0.3s ease;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.sidebar.sidebar-open {
  transform: translateX(0);
}

.sidebar:not(.sidebar-open) {
  transform: translateX(-100%); /* Скрыто */
}

.sidebar-header {
  margin-bottom: 20px;
}

.sidebar-header h5 {
  color: #ffffff;
  font-weight: bold;
}

.sidebar-list {
  list-style: none;
  padding: 0;
}

.sidebar-item {
  margin-bottom: 15px;
}

.sidebar-link {
  color: #ffffff;
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.sidebar-link:hover {
  background-color: #495057;
}

.sidebar-link i {
  margin-right: 10px;
  font-size: 1.2rem;
}

.toggle-btn {
  background: #ffcc00; /* Яркий цвет для выделения кнопки */
  border: none;
  color: #343a40;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  position: fixed;
  top: 50%;
  left: 250px; /* Расположение кнопки справа от sidebar */
  transform: translateY(-50%);
  z-index: 1001;
  transition: left 0.3s ease;
}

.toggle-btn:hover {
  background-color: #ffbb00; /* Эффект при наведении */
}

.sidebar:not(.sidebar-open) + .toggle-btn {
  left: 20px; /* Кнопка сдвигается, когда sidebar закрыт */
}
</style>
