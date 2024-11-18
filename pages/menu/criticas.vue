<template>
    <div class="bg-cyan-400 h-screen">
        <header class="py-4 bg-slate-800">
            <h1 class="text-2xl text-center font-bold"> LISTA DE CRITICAS </h1>
        </header>

        <div class="grid grid-cols-2 ml-10 mr-10 mt-5 mb-0 border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
                <UButton icon="i-heroicons-plus-20-solid" color="gray" label="Nueva Critica" @click="isOpen = true" />
            </div>
            <div class="flex items-center justify-end space-x-4">
                <UInput v-model="q" placeholder="Filtrar criticas..." />
                <UPagination v-model="page" :page-count="pageCount" :total="Criticas.length" />
            </div>
        </div>

        <div >
            <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Agregar nueva Critica
                    </h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                </div>
                </template>
                <!-- Formulario para registrar nueva critica-->
                 <UForm :validate="validate" :state="state" @submit="onSubmit">
                    <UFormGroup class="ml-5 mr-5 mb-5" label="Descripcion de Crítica" name="descripcion">
                        <UInput v-model="state.descripcion" />
                    </UFormGroup>
                    <UFormGroup class="ml-5 mr-5 mb-0" label="Tipo de Crítica" name="tipo">
                        <UInputMenu label="Tipo de critica" name="tipo"  type="none" v-model="state.tipo" :options="tipos"/>
                    </UFormGroup>
                    <br>
                    <UButton class="mb-5 ml-5 mr-5" color="blue" type="submit" :disabled="hasErrors" > Agregar </UButton>
                 </UForm>
            </UCard>
            </UModal>
        </div>
        <UTable 
            :loading="isLoading"
            :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Cargando...' }"
            :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Sin criticas.' }"
            class="p-10 ml-10 mr-10 mb-5 mt-5 bg-slate-800" 
            :rows="paginatedCriticas" 
            :columns="columnas">
            <template #actions-data="{ row }">
                <UDropdown class="bg-slate-800" :items="items(row)" :ui="{background: 'bg-white dark:bg-gray-800'}" >
                    <UButton color="white" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                </UDropdown>
            </template>
        </UTable>
         
    </div>

    <!-- Visual para ver datos registrados de las criticas -->

    <UModal v-model="isCriticaRegisterDialogOpen" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Datos Registrados Exitosamente
                </h3>
            </template>
            <div class="p-4">
                <!-- Mostrar datos registrados-->
            </div>
            <div class="text-right">
                <UButton color="gray" label="Cerrar" @click="isCriticaRegisterDialogOpen = false" />
            </div>
        </UCard>
    </UModal>

    <modificarCritica @refresh-list="getCriticas()" :id="indice" :open="isOpenModificarCritica" v-if="isOpenModificarCritica" @hidden="isOpenModificarCritica = false"/>
</template>

<script setup lang="ts">
    // Importaciones
    import modificarCritica from '~/components/modales/modificarCritica.vue';
    import type { FormError, FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server';

    // Variables
    let isOpenModificarCritica = ref(false);
    let isCriticaRegisterDialogOpen = ref(false);
    let indice = ref()
    let q = ref('')
    let page = ref(1)
    const pageCount = 4
    const isLoading = ref(false)

    // Objetos
    let tipos = ['normal', 'promedio']
    let isOpen = ref(false)
    let Criticas = ref([])
    
    let columnas = [ 
        { key: 'cod', label: 'Codigo de Critica', sortable: true },
        { key: 'descripcion', label: 'Descripcion de Critica', sortable: true }, 
        { key: 'tipo', label: 'Tipo de Critica', sortable: true },
        { key: 'estado', label: 'Estado', sortable: true },
        { key: 'actions'}
    ]

    let items = (row:any) => [[{
        label: 'Modificar',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () =>{
            isOpenModificarCritica.value = true;
            indice.value = row.cod
        }
    }]]

    let state = reactive({
        descripcion: '',
        tipo: 'normal',
        estado: 'activo',
    })

    let validate = (state : any): FormError[] => {
        const error = []
        if(!state.descripcion) error.push({path: 'descripcion', message: 'Descripción Requerida'})
        return error;
    }

    let hasErrors = computed( ()=> {
        const errors = validate(state)
        return errors.length > 0
    })
    
    // Funciones 
    definePageMeta({
        layout: 'menu'
    })

    onMounted(() => {
        getCriticas()
    })
    
    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })

    // Asincronicas
    async function getCriticas(){
        isLoading.value = true
        try{
            const response:any = await $fetch(server.HOST+'/api/v1/criticas')
            Criticas.value = JSON.parse(response)
        } catch(e:any){
            console.log(e)
        } finally {
            isLoading.value = false
        }
    }
    
    async function onSubmit(event: FormSubmitEvent<any>) {
        event.preventDefault();
        try {
            const response : any = await $fetch(`${server.HOST}/api/v1/criticas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state)
            });
            isCriticaRegisterDialogOpen.value = true;
            await getCriticas(); // Actualizar la lista de medidores
            isOpen.value = false; // Cerrar el modal
        } catch (e: any) {
            console.log(e);
        }
    }
    const paginatedCriticas = computed(() => {
        const start = (page.value - 1) * pageCount;
        const end = page.value * pageCount;
        return filteredCriticas.value.slice(start, end);
    });

    const filteredCriticas = computed(() => {
        if (!q.value) {
            return Criticas.value;
        }
        return Criticas.value.filter((critica) =>
            Object.values(critica).some((value) =>
                String(value).toLowerCase().includes(q.value.toLowerCase())
            )
        );
    });
</script>