<template>
    <div class="flex max-h-dvh bg-cyan-600">
        <div class="w-56 bg-slate-800 p-4">
            <div class="flex items-center">
                <img aria-hidden="true" alt="logo" src="/images/cosaalt_logo.png" class="w-20 h-20 mb-4" />
                <p class="font-extrabold mb-4"> COSAALT LTA </p>
            </div>
            <button
            class="w-full py-2 px-4 mb-2 text-white text-left rounded hover:bg-blue-700"
            :class="isActive('/menu/perfil') ? 'bg-slate-600' : 'bg-blue-500'"
            @click="NavegateTo('/menu/perfil')"
            >
            Perfil
            </button>
            <button
            class="w-full py-2 px-4 mb-2 text-white text-left rounded hover:bg-blue-700"
            :class="isActive('/menu/monitoreo') ? 'bg-slate-600' : 'bg-blue-500'"
            @click="NavegateTo('/menu/monitoreo')"
            >
            Monitoreo
            </button>
            <button
            class="w-full py-2 px-4 mb-2 text-white text-left rounded hover:bg-blue-700"
            :class="isActive('/menu/lecturadores') ? 'bg-slate-600' : 'bg-blue-500'"
            @click="NavegateTo('/menu/lecturadores')"
            >
            Lecturadores
            </button>
            <button
            class="w-full py-2 px-4 mb-2 text-white text-left rounded hover:bg-blue-700"
            :class="isActive('/menu/rutas') ? 'bg-slate-600' : 'bg-blue-500'"
            @click="NavegateTo('/menu/rutas')"
            >
            Rutas
            </button>
            <button
            class="w-full py-2 px-4 mb-2 text-white text-left rounded hover:bg-blue-700"
            :class="isActive('/menu/medidores') ? 'bg-slate-600' : 'bg-blue-500'"
            @click="NavegateTo('/menu/medidores')"
            >
            Medidores
            </button>
            <button
            class="w-full py-2 px-4 mb-2 text-white text-left rounded hover:bg-blue-700"
            :class="isActive('/menu/criticas') ? 'bg-slate-600' : 'bg-blue-500'"
            @click="NavegateTo('/menu/criticas')"
            >
            Críticas
            </button>
            <button
            class="w-full py-2 px-4 mb-2 text-white text-left rounded hover:bg-blue-700"
            :class="isActive('/menu/grupo') ? 'bg-slate-600' : 'bg-blue-500'"
            @click="NavegateTo('/menu/grupo')"
            >
            Grupos
            </button>
            <button
            class="w-full py-2 px-4 mb-2 text-white text-left rounded hover:bg-blue-700"
            :class="isActive('/menu/reportes') ? 'bg-slate-600' : 'bg-blue-500'"
            @click="NavegateTo('/menu/reportes')"
            >
            Reportes
            </button>
            <button
            class="w-full py-2 px-4 bg-red-500 text-white text-left rounded hover:bg-red-700"
            @click="NavegateTo('')"
            >
            Cerrar Sesión
            </button>
        </div>
        <div class="flex-grow h-dvh">
            <NuxtPage />
        </div>
    </div>
</template>
  
<script setup lang="ts">
    import { ref } from 'vue';
    const activeRoute = ref<string>('');
    function NavegateTo(ruta: string) {
        activeRoute.value = ruta;
        navigateTo(ruta);
    }
    function isActive(route: string) {
        return activeRoute.value === route;
    }
</script>
  