<template>
    <UModal v-model="isOpen" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
            <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Agregar nueva ubicación del medidor
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
            </div>
        </template>
        
        <MapboxMap
            map-id="map1"
            :options="{
                style, // style URL
                center: markerCoordinates, // starting position [lng, lat] using the marker's position
                zoom: 16, // starting zoom
                projection: 'mercator',
            }"
            :style="{
                height: `65vh`
            }"
                @click="handleMapClick"
                @styleload="() => {
                console.log('style loaded');
            }"
        >
            <!-- Actualización dinámica del marcador -->
            <MapboxDefaultMarker marker-id="cosaaltstandard" :lnglat="markerCoordinates"></MapboxDefaultMarker>
        </MapboxMap>

        <div class="mt-2">
            <UButton @click="captureLocation"> Capturar Ubicación </UButton>
            <div v-if="clickedCoordinates">
            <p>Coordenadas: {{ clickedCoordinates }}</p>
            </div>
        </div>
        
        </UCard>
    </UModal>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';

    let style = ref("mapbox://styles/mapbox/streets-v12");
    let clickedCoordinates = ref<[number, number] | null>(null);

    // Coordenadas iniciales del marcador
    let markerCoordinates = ref<[number, number]>([-64.726741, -21.535039]);

    interface Props {
        open: boolean;
    }

    const props = defineProps<Props>();
    const emit = defineEmits(['hidden', 'updateCoordinates']);
    const isOpen = ref(props.open);

    watch(() => props.open, (newVal) => {
        isOpen.value = newVal;
    });

    watch(isOpen, (newVal) => {
        if (!newVal) {
        emit('hidden');
        }
    });

    // Función que maneja el clic en el mapa
    const handleMapClick = (event: any) => {
        const lngLat = event.lngLat; // Obtener las coordenadas del clic
        clickedCoordinates.value = [lngLat.lng, lngLat.lat]; // Guardar las coordenadas
        markerCoordinates.value = [lngLat.lng, lngLat.lat]; // Actualizar la posición del marcador
    };

    const captureLocation = () => {
        if (clickedCoordinates.value) {
            emit('updateCoordinates', clickedCoordinates.value); // Emitir las coordenadas al componente padre
        }
    };

    defineShortcuts({
        escape: {
        usingInput: true,
        whenever: [isOpen],
        handler: () => {
            isOpen.value = false;
        },
        },
    });
</script>
