<template>
    <UModal v-model="isOpen" fullscreen>
        <UCard
            :ui="{
                base: 'h-full flex flex-col',
                rounded: '',
                divide: 'divide-y divide-gray-100 dark:divide-gray-800',
                body: { base: 'grow' }
            }">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                        Visualizando medidores por Ruta
                    </h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                </div>
            </template>
            <div>
                <div id="map"></div>
            </div>
        </UCard>
    </UModal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import mapboxgl from 'mapbox-gl';

// Props para el componente
interface Props {
  open: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(['hidden']);

// Estado reactivo para manejar el modal
const isOpen = ref(props.open);

// Datos de los medidores
const Medidores = [
  {
    codMedidor: 1,
    estado: 'activo',
    medicion: 0,
    nombre: 'A-01',
    propietario: 'Victor Manuel',
    codRuta: 1,
    latitud: -21.528734,
    longitud: -64.73265,
  },
  {
    codMedidor: 2,
    estado: 'activo',
    medicion: 0,
    nombre: 'A-02',
    propietario: 'Manuel Arenas',
    codRuta: 1,
    latitud: -21.529243,
    longitud: -64.73236,
  },
  {
    codMedidor: 3,
    estado: 'activo',
    medicion: 0,
    nombre: 'A-03',
    propietario: 'David Villa',
    codRuta: 1,
    latitud: -21.529064,
    longitud: -64.73221,
  },
];

let map: mapboxgl.Map | null = null;

// Observa cambios en las props y ajusta el estado del modal
watch(() => props.open, (newVal) => {
  isOpen.value = newVal;
  if (newVal) {
    setTimeout(() => initializeMap(), 300); // Espera a que el modal se renderice completamente
  }
});

// Limpia el mapa cuando el modal se cierra
watch(isOpen, (newVal) => {
  if (!newVal) {
    emit('hidden');
    if (map) {
      map.remove();
      map = null;
    }
  }
});

// Inicializa el mapa
function initializeMap() {
  mapboxgl.accessToken = 'pk.eyJ1IjoicmlraXNhYmUiLCJhIjoiY2xpYWM4MTZiMDF2aDNqbXE2YTl5ajh0NCJ9.JjjjSt0aDejclb9xNddA_w';
  map = new mapboxgl.Map({
    container: 'map', // Contenedor del mapa
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-64.73265, -21.528734], // Coordenadas iniciales
    zoom: 14,
  });

}
</script>

<style>
    .map-container {
    width: 100%;
    height: 100%; /* Se ajusta a la altura completa del modal */
    }
</style>
