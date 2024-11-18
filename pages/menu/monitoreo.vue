<template>
    <body>
        <div class="bg-white">
            <header class="py-4 bg-slate-800">
                <h1 class="text-2xl text-center font-bold"> MONITOREO </h1>
            </header>
            <div class="flex">
                <div class="flex-1">
                    <MapboxMap
                        map-id="map1"
                        :options="{
                            style,
                            center: [-64.723551, -21.539157],
                            zoom: 13.8,
                            projection: 'mercator',
                        }"
                        :style="{ height: `89.5vh` }" >
                        <MapboxDefaultMarker v-for="marker in markers"
                            :marker-id="'mp' + marker.title"
                            :lnglat="[marker.lng, marker.lat]"
                            :option="{}" >
                            <MapboxDefaultPopup
                                :popup-id="'mp' + marker.title"
                                :lnglat="[marker.lng, marker.lat]"
                                :options="{ closeOnClick: true }" >
                                    <h1 class="text-black">
                                        Nombre de usuario: {{ marker.title }}
                                    </h1>
                                    <h1 class="text-black">
                                        Ultima vez: {{ marker.ultimaVez }}
                                    </h1>
                            </MapboxDefaultPopup>
                        </MapboxDefaultMarker>
                    </MapboxMap>
                </div>
            </div>
        </div>
    </body>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { server } from '~/server/server';

    interface trabajador {
        lng: number;
        lat: number;
        title: string;
        ultimaVez: string
    }

    const style = ref("mapbox://styles/mapbox/streets-v12");
    let markers:Ref<trabajador[]> = ref([]);
    let wsLive: WebSocket | null = null;
    
    function obtenerUbicacionesWS() {
        let reconnectInterval = 1000; // Initial reconnect interval in ms
        const maxReconnectInterval = 30000; // Max reconnect interval in ms
        const connect = () => {
            wsLive = new WebSocket(server.HOST + "/ws/v1/ubicacion-lecturador/all");
            wsLive.onopen = () => {
                reconnectInterval = 1000; // Reset reconnect interval
            };
            wsLive.onmessage = (event) => {
                try {
                    const ubicaciones:Map<string, trabajador> = JSON.parse(event.data);
                    //console.log(ubicaciones);
                    // markers = Array.from(ubicaciones)
                    markers.value = Object.entries(ubicaciones).map(([title, location]) => ({
                        lng: location.longitud, lat: location.latitud, title: title, ultimaVez:location.ultimaVez
                    }));
                } catch (error) {
                    console.error(error);
                }
            };
            wsLive.onclose = (event) => {
                if (event.code !== 1000) {
                // Attempt to reconnect
                setTimeout(() => {
                    if (reconnectInterval < maxReconnectInterval) {
                    reconnectInterval *= 2; // Exponential backoff
                    }
                    connect();
                }, reconnectInterval);
                }
            };
            wsLive.onerror = (_error) => {
                wsLive?.close();
            };
        };
        connect();
    }
    
    onMounted(async () => {
        obtenerUbicacionesWS()
    })
    
    definePageMeta({
        layout: 'menu'
    })
    
</script>
