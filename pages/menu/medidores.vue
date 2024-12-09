<template>
    <div class="bg-cyan-400 h-screen">
        <header class="py-4 bg-slate-800">
            <h1 class="text-2xl text-center font-bold"> LISTA DE MEDIDORES </h1>
            <div v-if="showAlert" class="alert-container">
                <UAlert
                    icon="i-heroicons-command-line"
                    color="green"
                    variant="solid"
                    :description="alertMessage"
                />
            </div>
        </header>

        <div class="grid grid-cols-2 ml-10 mr-10 mt-5 mb-0 border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
                <UButton icon="i-heroicons-plus-20-solid" color="gray" label="Nuevo Medidor" @click="isOpen = true" />
            </div>
            <div class="flex items-center justify-end space-x-4">
                <UInput v-model="q" placeholder="Filtrar medidores..." />
                <UPagination v-model="page" :page-count="pageCount" :total="Medidores.length" />
            </div>
        </div>

        <div>
            <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                        Agregar nuevo Medidor
                        </h3>
                        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                    </div>
                </template>
                <!-- Formulario -->
                 <UForm :validate="validate" :state="state" @submit="onSubmit">
                    <UFormGroup class="mb-5 ml-5 mr-5" label="Nombre" name="nombre">
                        <UInput v-model="state.nombre" />
                    </UFormGroup>
                    <UFormGroup class="m-5" label="Propietario" name="propietario">
                        <UInput v-model="state.propietario" />
                    </UFormGroup>
                    <UFormGroup class="m-5" label="Tipo" name="tipo">
                        <UInputMenu label="Tipo" name="tipo"  type="none" v-model="state.tipo" :options="tipos"/>
                    </UFormGroup>
                    <UFormGroup class="m-5" label="Ruta" name="ruta">
                        <UInputMenu 
                            label="Ruta" 
                            name="ruta"  
                            type="none" 
                            v-model="state.codRuta" 
                            :options="Rutas"
                            value-attribute="cod"
                            option-attribute="nombre" />
                    </UFormGroup>
                    <UFormGroup class="m-5 mb-0" label="Ubicación" name="ubicacion">
                        <div class="flex items-center">
                            <UInput class="w-max mr-1" v-model="state.longitud" /> 
                            <UInput class="w-max mr-1" v-model="state.latitud" /> 
                            <UButton color="blue" @click="openUbicacionModal"> Capturar dirección </UButton>
                        </div>
                    </UFormGroup>
                    <br>
                    <UButton color="blue" class="ml-5 mr-5" type="submit" :disabled="hasErrors"> Agregar </UButton>
                 </UForm>
            </UCard>
            </UModal>
        </div>
        <div>
            <UTable 
            :loading="isLoading"
                :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Cargando...' }"
                :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Sin medidores.' }"
                class="p-10 mb-5 ml-10 mr-10 mt-5 bg-slate-800" 
                :rows="paginatedMedidores" 
                :columns="columnas">
                <template #actions-data="{ row }">
                    <UDropdown class="bg-slate-800" :items="items(row)" :ui="{background: 'bg-white dark:bg-gray-800'}" >
                        <UButton color="white" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                    </UDropdown>
                </template>
            </UTable>
            
        </div>
        
    </div>

    <agregarnuevomedidor @updateCoordinates="handleUpdateCoordinates" :open="isOpenNuevaUbicacion" v-if="isOpenNuevaUbicacion" @hidden="isOpenNuevaUbicacion = false"/>
    <modificarMedidor @refreshList="getMedidores(), onSuccess()" :id="indice" :open="isOpenModificarMedidor" v-if="isOpenModificarMedidor" @hidden="isOpenModificarMedidor = false"/>
</template>

<script setup lang="ts">
    // Importaciones
    import modificarMedidor from '~/components/modales/modificarMedidor.vue'
    import agregarnuevomedidor from '~/components/modales/agregarnuevomedidor.vue'
    import type { FormError, FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server'
    import { useRouter } from 'vue-router'

    // Variables
    let isOpenModificarMedidor = ref(false);
    let isOpenNuevaUbicacion = ref(false);
    let Medidores = ref([])
    let isOpen = ref(false)
    let indice = ref()
    let q = ref('')
    let page = ref(1)
    const pageCount = 4
    const isLoading = ref(false)
    let showAlert = ref(false)
    let alertMessage = ref('')
    let token = "none"
    let router = useRouter()

    let tipos = ['domicilio', 'residencia']
    let Rutas = ref()

    let columnas = [ 
        {key: 'nombre', label: 'Nombre', sortable: true }, 
        { key: 'propietario', label: 'Propietario', sortable: true }, 
        { key: 'nombreRuta', label: 'Ruta', sortable: true },
        { key: 'estado', label: 'Estado', sortable: true },
        { key: 'actions'}
    ]

    let validate = (state : any): FormError[] => {
        const error = []
        if(!state.nombre) error.push({path: 'nombre', message: 'Nombre Requerido'})
        if(!state.propietario) error.push({path: 'propietario', message: 'Propietario Requerido'})
        if(!state.longitud || !state.latitud) error.push({path: 'ubicacion', message: 'Ambas coordenadas son Requeridas'})
        return error;
    }

    let hasErrors = computed( ()=> {
        const errors = validate(state)
        return errors.length > 0
    })

    let items = (row:any) => [[{
        label: 'Modificar',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => { 
            isOpenModificarMedidor.value = true;
            indice.value = row.cod
        }
    }]]

    let state = reactive({
        nombre: '',
        propietario: '',
        estado: 'activo',
        codRuta: 0,
        longitud: 0.0,
        latitud: 0.0,
        tipo : 'domicilio',
        ruta: ''
    })

    onMounted( () => {
        getMedidores()
        getRutas()
        token = localStorage.getItem('auth_token') as string
        if ( token === "none" ) {
            router.push('/no_autorizado')
            return
        }
    })

    // Funciones
    definePageMeta({
        layout: 'menu'
    })
    
    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })

    async function getRutas(){
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/rutas')
            Rutas.value = JSON.parse(response)
        } catch(e:any){
            console.log(e)
        }
    }

    function openUbicacionModal() {
        isOpenNuevaUbicacion.value = true;
    }

    function handleUpdateCoordinates(coordenadas: [number, number]) {
        state.longitud = coordenadas[0];
        state.latitud = coordenadas[1];
        isOpenNuevaUbicacion.value = false;
    }

    // Asincronas
    async function getMedidores(){
        isLoading.value = true
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/medidores')
            Medidores.value = JSON.parse(response)
        } catch(e:any){
            console.log(e)
        } finally {
            isLoading.value = false
        }
    }

    async function onSubmit(event: FormSubmitEvent<any>) {
        event.preventDefault();
        try {
            console.log(state)
            const response : any = await $fetch(`${server.HOST}/api/v1/medidores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state)
            });
            await getMedidores(); // Actualizar la lista de medidores
            isOpen.value = false; // Cerrar el modal

            alertMessage.value = 'Agregado correctamente';
            showAlert.value = true;
            setTimeout(() => {
                showAlert.value = false;
            }, 5000);
        } catch (e: any) {
            console.log(e);
        }
    }

    function onSuccess() {
        alertMessage.value = 'Modificado exitosamente'
        showAlert.value = true
        setTimeout( () => {
            showAlert.value = false
        }, 5000)
    }

    const paginatedMedidores = computed(() => {
        const start = (page.value - 1) * pageCount;
        const end = page.value * pageCount;
        return filteredMedidores.value.slice(start, end);
    });

    const filteredMedidores = computed(() => {
        if (!q.value) {
            return Medidores.value;
        }
        return Medidores.value.filter((medidor) =>
            Object.values(medidor).some((value) =>
                String(value).toLowerCase().includes(q.value.toLowerCase())
            )
        );
    });
</script>

<style scoped>
.alert-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 50;
    max-width: 250px;
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