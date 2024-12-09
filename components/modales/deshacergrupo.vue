<template>
    <UModal v-model="isOpen" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        
        <template #header>
            <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                ¿Está seguro que desea deshacer el grupo?
                </h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
            </div>
        </template>
        
        <UForm :state="state" @submit="onSubmit">
            <div class="flex justify-center items-center">
                <h1 class="font-bold"> {{ state.nombreUsuario }} </h1>
                <img aria-hidden="true" alt="profile" src="/images/flechabg.png" class="w-16 h-22" />
                <h1 class="font-bold"> {{ state.nombreRuta }} </h1>
            </div>
            <div class="mt-6 flex justify-center items-center">
                <UButton class="m-2" color="blue" type="submit"> Deshacer </UButton>
                <UButton class="m-2" color="blue" @click="isOpen = false"> Cancelar </UButton>
            </div>
        </UForm>

    </UCard>
    </UModal>
</template>

<script setup lang="ts">
    // Importaciones
    import type { FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server'

    // Interfaces
    interface Props {
        open: boolean,
        id_grupo: number,
        // id_lecturador: number
    }

    // Variables
    let props = defineProps<Props>();
    let emit = defineEmits(['hidden', 'refreshList']);
    let isOpen = ref(props.open)
    let DatoGrupo = ref()
    // console.log("id_grupo: " + props.id_grupo)

    const state = reactive({
        nombreUsuario: '',
        nombreRuta: '',
        codUsuario: 0
    })

    // Funciones
    watch(() => props.open, (newVal) => {
        isOpen.value = newVal;
    });

    watch(isOpen, (newVal) =>{
        if(!newVal){
            emit('hidden');
        }
    });
    
    onMounted( async () => {
        getGrupo()    
    })
    
    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })
    
    async function onSubmit(event: FormSubmitEvent<any>) {
        event.preventDefault();
        try {
            const response1 : any = await $fetch(`${server.HOST}/api/v1/grupos/quitar-grupo/${state.codUsuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const response2 : any = await $fetch(`${server.HOST}/api/v1/grupos/eliminar-grupo/${props.id_grupo}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            isOpen.value = false;
            emit('refreshList')
        } catch (e: any) {
            console.log(e);
        }
    }
    async function getGrupo() {
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/grupos/' + props.id_grupo) // cambiar a lecturadores
            DatoGrupo.value = response
            state.nombreRuta = DatoGrupo.value.nombre_ruta
            state.nombreUsuario = DatoGrupo.value.nombre_usuario
            state.codUsuario = DatoGrupo.value.cod_usuario
        } catch (e:any){
            console.log(e)
        }
    }
</script>
