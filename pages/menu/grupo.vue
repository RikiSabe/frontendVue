<template>
    <div class="bg-cyan-400 h-screen">
        <header class="py-4 bg-slate-800">
            <h1 class="text-2xl text-center font-bold"> LISTA DE GRUPOS </h1>
        </header>

        <div class="grid grid-cols-2 ml-10 mr-10 mt-5 mb-0 border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
                <UButton icon="i-heroicons-plus-20-solid" color="gray" label="Nuevo Grupo" @click="isOpen = true" />
            </div>
            <div class="flex items-center justify-end space-x-4">
                <UInput v-model="q" placeholder="Filtrar grupo..." />
                <UPagination v-model="page" :page-count="pageCount" :total="Grupos?.length || 0" />
            </div>
        </div>

        <div>
            <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Agrupación de un lecturador con una ruta
                    </h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                </div>
                </template>
                 <UForm :state="state" @submit="onSubmit">
                    <UFormGroup class="ml-5 mr-5 mb-5" label="Lecturador" name="lecturador">
                        <UInputMenu
                            type="none"
                            v-model="state.cod_usuario" 
                            :options="Lecturadores"
                            value-attribute="codPersona"
                            option-attribute="usuario"
                        />
                    </UFormGroup>
                    <UFormGroup class="ml-5 mr-5 mb-0" label="Ruta" name="ruta">
                        <UInputMenu
                            type="none" 
                            v-model="state.cod_ruta" 
                            :options="Rutas"
                            value-attribute="cod_ruta"
                            option-attribute="nombre_ruta"
                        />
                    </UFormGroup>
                    <br>
                    <UButton class="mb-5 mr-5 ml-5" color="blue" type="submit" :disabled="hasErrors"> Agregar </UButton>
                 </UForm>
            </UCard>
            </UModal>
        </div>
        <div>
            <UTable 
                :loading="isLoading"
                :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Cargando...' }"
                :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Sin grupos.' }"
                class="p-10 ml-10 mr-10 mt-5 mb-5 bg-slate-800" 
                :rows="paginatedGrupos" 
                :columns="columnas">
                <template #actions-data="{ row }">
                    <UDropdown 
                        class="bg-slate-800" 
                        :items="items(row)" 
                        :ui="{background: 'bg-white dark:bg-gray-800'}" >
                        <UButton color="white" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                    </UDropdown>
                </template>
            </UTable>   
            
        </div>
    </div>
    <Deshacergrupo @refreshList="getGrupos(), getLecturadoresLibres(), getRutasLibres()" :id_grupo="indice" :open="isOpenDeshacerGrupo" v-if="isOpenDeshacerGrupo" @hidden="isOpenDeshacerGrupo = false"/>
</template>

<script setup lang="ts">
    // Importaciones
    import type { FormSubmitEvent } from '#ui/types'
    import Deshacergrupo from '~/components/modales/deshacergrupo.vue';
    import { server } from '~/server/server';

    // Variables
    let columnas = [
        { key: 'cod', label: 'Número de Grupo', sortable: true },
        { key: 'nombre_usuario', label: 'Usuario del Lecturador', sortable: true },
        { key: 'nombre_ruta', label: 'Ruta Asignada', sortable: true },
        { key: 'actions'}
    ]

    let isOpenDeshacerGrupo = ref(false)
    let Lecturadores = ref([])
    let Rutas = ref([])
    let Grupos = ref([])
    let isOpen = ref(false)
    let q = ref('')
    let page = ref(1)
    const pageCount = 4
    const isLoading = ref(false)
    let indice = ref()

    let state = reactive({
        cod_usuario: 0,
        cod_ruta: 0
    })

    let hasErrors = computed(() => !state.cod_usuario || !state.cod_ruta);

    let items = (row: any) => [[{
        label: 'Deshacer',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () =>{
            isOpenDeshacerGrupo.value = true
            indice.value = row.cod
            // cod.value = row.cod_usuario
        }
    }]]

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

    onMounted( async () => {
        await getLecturadoresLibres()
        await getRutasLibres()
        await getGrupos()
    })

    // Asincronas
    async function getLecturadoresLibres() {
        try {
            const response: any = await $fetch(server.HOST + '/api/v1/usuarios/lecturador-libre')
            const allLecturadores = JSON.parse(response)
            Lecturadores.value = allLecturadores
        } catch (e: any) {
            console.log(e)
        }
    }
    
    async function getRutasLibres() {
        try {
            const response: any = await $fetch(server.HOST + '/api/v1/rutas/libres')
            Rutas.value = JSON.parse(response)
        } catch (e: any) {
            console.log(e)
        }
    }

    async function getGrupos() {
        isLoading.value = true
        try {
            const response: any = await $fetch(server.HOST + '/api/v1/grupos');
            // Grupos.value = JSON.parse(response);
            Grupos.value = typeof response === 'string' ? JSON.parse(response) : response
            // Grupos.value = Array.isArray(grupos) ? grupos : []
            console.log(Grupos.value)

        } catch (e: any) {
            console.log(e)
            Grupos.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function onSubmit(event: FormSubmitEvent<any>) {
        event.preventDefault()
        try {
            const response: any = await $fetch(server.HOST + '/api/v1/grupos/agregar-grupo/' + state.cod_usuario, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state)
            })
            await getGrupos()
            await getLecturadoresLibres()
            await getRutasLibres()
            isOpen.value = false;
        } catch (e: any) {
            console.log(e)
        }
    }

    const paginatedGrupos = computed(() => {
        const start = (page.value - 1) * pageCount;
        const end = page.value * pageCount;
        const grupos = Array.isArray(filteredGrupos.value) ? filteredGrupos.value : [];
        return grupos.slice(start, end);
    });


    const filteredGrupos = computed(() => {
        if (!q.value) {
            return Array.isArray(Grupos.value) ? Grupos.value : [];
        }
        return (Array.isArray(Grupos.value) ? Grupos.value : []).filter((grupo) =>
            Object.values(grupo).some((value) =>
                String(value).toLowerCase().includes(q.value.toLowerCase())
            )
        );
    });

    
</script>