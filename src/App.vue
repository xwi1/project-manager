<template>
  <div id="app" :class="{ 'sidebar-open': isSidebarOpen }">
    <Navbar />
    <Sidebar @sidebar-toggle="handleSidebarToggle" />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/NavBar.vue';
import Sidebar from '@/components/SideBar.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Sidebar
  },
  data() {
    return {
      isSidebarOpen: true
    };
  },
  methods: {
    handleSidebarToggle(isOpen) {
      this.isSidebarOpen = isOpen;
    }
  }
};
</script>

<style>
.content {
  padding: 20px;
  transition: margin-left 0.3s ease;
}

#app.sidebar-open .content {
  margin-left: 270px; /* Учитываем ширину sidebar */
}

.navbar {
  transition: margin-left 0.3s ease;
}

#app.sidebar-open .navbar {
  margin-left: 250px; /* Учитываем ширину sidebar */
}
</style>
