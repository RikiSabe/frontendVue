<template>
    <div class="bg-cyan-400 h-screen">
        <header class="py-4 bg-slate-800">
            <h1 class="text-2xl text-center"> REPORTES DISPONIBLES </h1>
            <div v-if="showAlert" class="alert-container">
                <UAlert
                    icon="i-heroicons-command-line"
                    color="red"
                    variant="solid"
                    :title="'¡Atención!'"
                    :description="alertMessage"
                />
            </div>
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
                        @click="isOpenLec = true"
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

                <UModal v-model="isOpenLec" prevent-close>
                    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                        <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="ml-10 text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            Filtro por lecturador
                            </h3>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpenLec = false" />
                        </div>
                        </template>
                        <!-- Formulario -->
                        <UForm :state="state" @submit="onSubmit">
                            <UFormGroup class="ml-10 mr-10 mb-5" label="Lecturadores" name="Lecturadores">
                                <UInputMenu
                                    type="none" 
                                    v-model="codlecturador" 
                                    :options="Lecturadores"
                                    value-attribute="codUsuario"
                                    option-attribute="usuario"
                                />
                            </UFormGroup>
                            <UButton class="ml-10 mr-5 mt-0" color="blue" @click="reporteLecturaciones()"> Obtener </UButton>
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
    let isOpenLec = ref(false)
    let isOpenVisualizarMedidores = ref(false)
    let state = reactive ({
        cod_ruta: 0
    })
    let codlecturador = ref()
    let Rutas = ref([])
    let Lecturadores = ref([])
    let showAlert = ref(false)
    let alertMessage = ref('')

    // Funciones
    definePageMeta({
        layout: 'menu'
    })

    onMounted( async () => {
        getRutas()
        getLecturadores()
    })

    async function getLecturadores(){
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/usuarios/lecturador') // cambiar a lecturadores
            Lecturadores.value = JSON.parse(response)
            console.log(Lecturadores.value)
        } catch (e:any){
            console.log(e)
        } finally {
        }
    }

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
            isOpenLec.value = false
            alertMessage.value = 'Error al descargar el PDF. Por favor, inténtalo nuevamente.';
            showAlert.value = true;
            setTimeout(() => {
                showAlert.value = false;
            }, 5000);
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
        descargarPDF(server.HOST + '/api/v1/lecturaciones/pdf/' + codlecturador.value, 'reporte_lecturacion.pdf')
    }
    async function onSubmit(){
        isOpenVisualizarMedidores.value = true
        isOpen.value = false
    }

</script>

<style scoped>
.alert-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 50;
    max-width: 400px;
    width: 100%;
    animation: fadeOut 5s forwards;
}

@keyframes fadeOut {
    0% {
        opacity: 1;
    }
    80% {
        opacity: 1;
    }
    100% {
        opacity: 0;
        /* transform: translateY(-20px); */
    }
}
</style>
