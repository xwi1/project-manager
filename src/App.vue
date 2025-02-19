<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* Базовая стилизация */
nav {
  padding: 10px;
  background-color: #f0f0f0;
}
nav a {
  text-decoration: none;
  color: #333;
}
</style>

