<template>
    <div class="calendar-page">
      <h1 class="my-4">Calendar</h1>
      <FullCalendar :options="calendarOptions" />
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import FullCalendar from '@fullcalendar/vue3';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  
  export default {
    name: 'CalendarPage',
    components: {
      FullCalendar
    },
    setup() {
      const calendarOptions = ref({
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        events: [
          { title: 'Event 1', date: '2024-10-01' },
          { title: 'Event 2', date: '2024-10-05' },
          // Добавьте другие события по мере необходимости
        ],
        editable: true,
      });
  
      return {
        calendarOptions,
      };
    },
  };
  </script>
  
  <style scoped>
  .calendar-page {
    padding: 20px;
  }
  </style>
  