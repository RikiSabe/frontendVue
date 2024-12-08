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
                        Visualizando todos los medidores
                    </h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                </div>
            </template>
            <MapboxMap
                map-id="map1"
                :options="{
                    style,
                    center: [-64.723551, -21.539157],
                    zoom: 13,
                    projection: 'mercator',
                }"
                :style="{ height: '81vh' }">
                <MapboxDefaultMarker v-for="marker in Medidores"
                    :marker-id="'mp' + marker.nombre"
                    :lnglat="[marker.longitud, marker.latitud]"
                    :option="{}" >
                    <MapboxDefaultPopup
                        :popup-id="'mp' + marker.nombre"
                        :lnglat="[marker.longitud, marker.latitud]"
                        :options="{ closeOnClick: true }" >
                            <h1 :class="getColorClass(marker.nombre)" class="text-black font-bold">
                                {{ marker.propietario }} <br>
                                medidor: {{ marker.nombre }} 
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
        open: boolean
    }
    let style = ref("mapbox://styles/mapbox/streets-v12");

    let props = defineProps<Props>()
    let emit = defineEmits(['hidden'])
    let Medidores = ref([])
    let isOpen = ref(props.open)

    // Sincronizar isOpen con props.open
    watch(() => props.open, async (newVal) => {
        isOpen.value = newVal;
    });

    // Emitir el evento hidden cuando isOpen cambia a false
    watch(isOpen, (newVal) => {
        if (!newVal) {
            emit('hidden');
        }
    })
    
    onMounted( async () => {
        getUbicacionesMedidores()
    })

    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })

    // Función para obtener los medidores por ruta
    async function getUbicacionesMedidores() {
        try {
            const response: any = await $fetch(server.HOST + '/api/v1/medidores/ubicacionesmedidores')
            Medidores.value = response
            console.log(Medidores.value)
        } catch (e: any) {
            console.error('Error al obtener ubicaciones de medidores', e);
        }
    }
    function getColorClass(nombre: string): string {
        const prefix = nombre.split('-')[0];
        switch (prefix) {
            case 'A': return 'text-red-500';
            case 'B': return 'text-blue-500';
            case 'C': return 'text-green-500';
            case 'D': return 'text-yellow-500';
            case 'E': return 'text-purple-500';
            case 'F': return 'text-pink-500';
            case 'G': return 'text-orange-500';
            case 'H': return 'text-teal-500';
            case 'I': return 'text-indigo-500';
            case 'J': return 'text-emerald-500';
            case 'K': return 'text-cyan-500';
            case 'L': return 'text-lime-500';
            case 'M': return 'text-amber-500';
            case 'N': return 'text-rose-500';
            case 'O': return 'text-gray-500';
            case 'P': return 'text-sky-500';
            case 'Q': return 'text-violet-500';
            case 'R': return 'text-stone-500';
            case 'S': return 'text-fuchsia-500';
            case 'T': return 'text-slate-500';
            case 'U': return 'text-zinc-500';
            case 'V': return 'text-neutral-500';
            case 'W': return 'text-cool-gray-500';
            case 'X': return 'text-warm-gray-500';
            case 'Y': return 'text-coral-500';
            case 'Z': return 'text-charcoal-500';
            default: return 'text-black'; // Color por defecto
        }
    }

</script>