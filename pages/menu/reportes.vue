<template>
    <div class="bg-cyan-400 h-screen">
        <header class="py-4 bg-slate-800">
            <h1 class="text-2xl text-center"> REPORTES DISPONIBLES </h1>
        </header>
        <main class="container mx-auto py-8 p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                <div class="bg-slate-800 p-4 rounded-lg shadow-lg">
                    <h2 class="text-lg font-semibold mb-2">Reporte de Lecturadores</h2>
                    <p class="text-sm text-muted-foreground">Descarga la lista completa de todos los lecturadores</p>
                    <button 
                        class="bg-cyan-600 text-primary-foreground mt-4 py-2 px-4 rounded-md hover:bg-cyan-800"
                        @click="reporteLecturadores()"
                        >
                        Obtener
                    </button>
                </div>

                <div class="bg-slate-800 p-4 rounded-lg shadow-lg">
                    <h2 class="text-lg font-semibold mb-2">Reporte de Medidores</h2>
                    <p class="text-sm text-muted-foreground">Descarga la lista completa de todos los medidores</p>
                    <button 
                        class="bg-cyan-600 text-primary-foreground mt-4 py-2 px-4 rounded-md hover:bg-cyan-800"
                        @click="reporteMedidores()"
                        >
                        Obtener
                    </button>
                </div>

                <div class="bg-slate-800 p-4 rounded-lg shadow-lg">
                    <h2 class="text-lg font-semibold mb-2">Reporte de Criticas</h2>
                    <p class="text-sm text-muted-foreground">Descarga la lista completa de todas las criticas</p>
                    <button 
                        class="bg-cyan-600 text-primary-foreground mt-4 py-2 px-4 rounded-md hover:bg-cyan-800"
                        @click="reporteCriticas()"
                        >
                        Obtener
                    </button>
                </div>

                <div class="bg-slate-800 p-4 rounded-lg shadow-lg">
                    <h2 class="text-lg font-semibold mb-2">Reporte de Lecturaciones</h2>
                    <p class="text-sm text-muted-foreground">Descarga la lista completa de todas las lecturaciones de consumo de agua de un lecturador</p>
                    <button 
                        class="bg-cyan-600 text-primary-foreground mt-4 py-2 px-4 rounded-md hover:bg-cyan-800"
                        @click="reporteLecturaciones()"
                        >
                        Obtener
                    </button>
                </div>

                <div class="bg-slate-800 p-4 rounded-lg shadow-lg">
                    <h2 class="text-lg font-semibold mb-2">Ubicación de medidores</h2>
                    <p class="text-sm text-muted-foreground">Visualiza la ubicación de los medidores con respecto a su ruta</p>
                    <button
                        class="bg-cyan-600 text-primary-foreground mt-4 py-2 px-4 rounded-md hover:bg-cyan-800"
                        @click="isOpen = true"
                        >
                        Obtener
                    </button>
                </div>

                <div>
            <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="ml-10 text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Filtro de grafica por Ruta
                    </h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                </div>
                    </template>
                    <!-- Formulario -->
                    <UForm :state="state" @submit="onSubmit">
                        <UFormGroup class="ml-10 mr-10 mb-5" label="Rutas" name="cod_ruta">
                            <UInputMenu
                                type="none" 
                                v-model="state.cod_ruta" 
                                :options="Rutas"
                                value-attribute="cod"
                                option-attribute="nombre"
                            />
                        </UFormGroup>
                        <UButton class="ml-10 mr-5 mt-0" color="blue" type="submit"> Visualizar </UButton>
                    </UForm>
                </UCard>
                </UModal>
            </div>
            </div>
        </main>

    </div>
    <visualizarMedidoresRuta :open="isOpenVisualizarMedidores" :cod_ruta="state.cod_ruta" v-if="isOpenVisualizarMedidores" @hidden="isOpenVisualizarMedidores = false" />
</template>

<script setup lang="ts">
    // Importaciones
    import visualizarMedidoresRuta from '~/components/modales/visualizarMedidoresRuta.vue'
    import { server } from '~/server/server';
    // Variables
    let isOpen = ref(false)
    let isOpenVisualizarMedidores = ref(false)
    let state = reactive ({
        cod_ruta: 0
    })
    let Rutas = ref([])
    // Funciones
    definePageMeta({
        layout: 'menu'
    })

    onMounted( async () => {
        getRutas()        
    })

    async function getRutas(){
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/rutas')
            Rutas.value = JSON.parse(response)
            console.log(Rutas.value)
        } catch(e:any){
            console.log(e)
        }
    }

    async function descargarPDF(url: string, nombreArchivo: string) {
        try {
            const response = await fetch(url, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error('Error al descargar el PDF');
            }
            const blob = await response.blob(); // Convierte la respuesta en un Blob
            const urlBlob = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = urlBlob;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error al descargar el PDF', error);
        }
    }
    function reporteLecturadores(){
        descargarPDF(server.HOST + '/api/v1/usuarios/lecturador/pdf', 'reporte_lecturadores.pdf');
    }
    function reporteMedidores(){
        descargarPDF(server.HOST + '/api/v1/medidores/pdf', 'reporte_medidores.pdf');
    }
    function reporteCriticas(){
        descargarPDF(server.HOST + '/api/v1/criticas/pdf', 'reporte_criticas.pdf');
    }
    function reporteLecturaciones(){
        // code
    }
    
    async function onSubmit(){
        isOpenVisualizarMedidores.value = true
        isOpen.value = false
    }
</script>

<style scoped>
.window {
    margin-left: 100px;
    margin-right: 100px;    
}
.list{
    margin: 5px;
    padding: 10px;
}
.titulo{
    color: white;
    margin: 10px;
    text-align: center;
}
.button{
    margin: 10px;
    background-color: #3498DB;
    padding: 10px;
    border-radius: 5px;
}
.button-agregar{
    margin: 15px;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    align-items: end;
}
</style>