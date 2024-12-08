<template>
    <div class="bg-cyan-400 h-screen">
        <header class="py-4 bg-slate-800">
            <h1 class="text-2xl text-center font-bold"> LISTA DE RUTAS </h1>
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
                <UButton icon="i-heroicons-plus-20-solid" color="gray" label="Nueva Ruta" @click="isOpen = true" />
            </div>
            <div class="flex items-center justify-end space-x-4">
                <UInput v-model="q" placeholder="Filtrar rutas..." />
                <UPagination v-model="page" :page-count="pageCount" :total="Rutas.length" />
            </div>
        </div>

        <div>
            <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Agregar Ruta
                    </h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                </div>
                </template>
                <!-- Formulario -->
                 <UForm :validate="validate" :state="state" @submit="onSubmit">
                    <UFormGroup class="ml-5 mr-5 mb-5" label="Nombre de Ruta" name="nombre">
                        <UInput v-model="state.nombre" />
                    </UFormGroup>
                    <UFormGroup class="ml-5 mr-5" label="Zona" name="zona">
                        <UInput v-model="state.zona" />
                    </UFormGroup>
                    <br>
                    <UButton class="ml-5 mr-5 mb-5" color="blue" type="submit" :disabled="hasErrors" > Agregar </UButton>
                 </UForm>
            </UCard>
            </UModal>
        </div>
        <div>
            <UTable 
                :loading="isLoading"
                :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Cargando...' }"
                :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Sin lecturadores.' }"
                class="p-10 mt-5 mb-5 ml-10 mr-10 bg-slate-800" 
                :rows="paginatedRutas" 
                :columns="columnas">
                <template #actions-data="{ row }">
                    <UDropdown class="bg-slate-800" :items="items(row)" :ui="{background: 'bg-white dark:bg-gray-800'}" >
                        <UButton color="white" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                    </UDropdown>
                </template>
            </UTable>
            
        </div>
    </div>
    <modificarRuta @refreshList="getRutas(), onSuccess()" :id="indice"  :open="isOpenModificarRuta" v-if="isOpenModificarRuta" @hidden="isOpenModificarRuta = false"/>
</template>

<script setup lang="ts">
    // Importaciones
    import modificarRuta from '~/components/modales/modificarRuta.vue';
    import type { FormError, FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server';
    
    // Variables
    let isOpenModificarRuta = ref(false);
    let Rutas = ref([])
    let indice = ref()
    let isOpen = ref(false)
    let q = ref('')
    let page = ref(1)
    const pageCount = 4
    const isLoading = ref(false)
    let showAlert = ref(false)
    let alertMessage = ref('')

    let columnas = [ 
        { key: 'cod', label: 'Codigo de Ruta', sortable: true },
        { key: 'nombre', label: 'Nombre de Ruta', sortable: true }, 
        { key: 'zona', label: 'Zona', sortable: true },
        { key: 'estado', label: 'Estado', sortable: true },
        { key: 'actions'}
    ]

    let items = (row:any) => [
    [{
        label: 'Modificar',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () =>{
            isOpenModificarRuta.value = true;
            indice.value = row.cod
        }
    }]]
    
    let state = reactive({
        nombre: undefined,
        zona: undefined,
        estado: 'activo'
    })
    let validate = (state : any) :FormError[] => {
        const error = []
        if(!state.nombre) error.push({path: 'nombre', message: 'Nombre requerido'})
        if(!state.zona) error.push({path: 'zona', message: 'Zona requerida'})
        return error
    }
    let hasErrors = computed ( () => {
        const errors = validate(state)
        return errors.length > 0
    })
    // Funciones
    definePageMeta({
        layout: 'menu'
    })

    onMounted(() => {
        getRutas()
    })
    
    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })

    // Asincronas
    async function getRutas(){
        isLoading.value = true
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/rutas')
            Rutas.value = JSON.parse(response)
        } catch(e:any){
            console.log(e)
        } finally {
            isLoading.value = false
        }
    }
    
    async function onSubmit(event: FormSubmitEvent<any>) {
        event.preventDefault();
        try {
            const response : any = await $fetch(`${server.HOST}/api/v1/rutas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state)
            });
            await getRutas(); // Actualizar la lista de medidores
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

    const paginatedRutas = computed(() => {
        const start = (page.value - 1) * pageCount;
        const end = page.value * pageCount;
        return filteredRutas.value.slice(start, end);
    });

    const filteredRutas = computed(() => {
        if (!q.value) {
            return Rutas.value;
        }
        return Rutas.value.filter((ruta) =>
            Object.values(ruta).some((value) =>
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