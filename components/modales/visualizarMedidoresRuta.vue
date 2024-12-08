<template>
    <UModal 
        v-model="isOpen" fullscreen>
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
            <MapboxMap
                map-id="map1"
                :options="{
                    style,
                    center: [-64.723551, -21.539157],
                    zoom: 13.8,
                    projection: 'mercator',
                }"
                :style="{ height: '81vh' }">
                <MapboxDefaultMarker v-for="marker in Medidores"
                    :marker-id="'mp' + marker.codMedidor"
                    :lnglat="[marker.longitud, marker.latitud]"
                    :option="{}" >
                    <MapboxDefaultPopup
                        :popup-id="'mp' + marker.nombre"
                        :lnglat="[marker.longitud, marker.latitud]"
                        :options="{ closeOnClick: true }" >
                            <h1 class="text-black">
                                {{ marker.nombre }}
                            </h1>
                    </MapboxDefaultPopup>
                </MapboxDefaultMarker>
            </MapboxMap>
        </UCard>
    </UModal>
</template>


<script setup lang="ts">
    import { ref, watch, onMounted } from 'vue';
    import { server } from '~/server/server';

    // Props y variables
    interface Props {
        open: boolean,
        cod_ruta: number
    }
    let style = ref("mapbox://styles/mapbox/streets-v12");

    let props = defineProps<Props>()
    let emit = defineEmits(['hidden'])
    let Medidores = ref([])
    let isOpen = ref(props.open)

    // Sincronizar `isOpen` con `props.open`
    watch(() => props.open, async (newVal) => {
        isOpen.value = newVal;
    });

    // Emitir el evento `hidden` cuando `isOpen` cambia a `false`
    watch(isOpen, (newVal) => {
        if (!newVal) {
            emit('hidden');
        }
    })
    
    onMounted( async () => {
        getMedidoresByRuta()
    })
    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })

    // Función para obtener los medidores por ruta
    async function getMedidoresByRuta() {
        try {
            const response: any = await $fetch(`${server.HOST}/api/v1/medidores/byrutaweb/${props.cod_ruta}`);
            Medidores.value = JSON.parse(response);
            // console.log(Medidores.value)
        } catch (e: any) {
            console.error('Error al obtener medidores', e);
        }
    }
</script>
