<template>
    <UModal v-model="isOpen" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
            <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Modificar Ruta
                </h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
            </div>
        </template>
        
        <UForm :state="state" @submit="onSubmit">
            <UFormGroup label="Nombre de Ruta" name="nombre">
                <UInput v-model="state.nombre" />
            </UFormGroup>
            <UFormGroup label="Zona" name="zona">
                <UInput v-model="state.zona" />
            </UFormGroup>
            <br>
            <UButton type="submit"> Modificar </UButton>
        </UForm>

    </UCard>
    </UModal>
</template>

<script setup lang="ts">
    // Importaciones
    import type { FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server';

    // Interfaces
    interface Props {
        open: boolean,
        id: number
    }

    // Variables
    let props = defineProps<Props>();
    let emit = defineEmits(['hidden', 'refreshList']);
    let isOpen = ref(props.open)
    
    let Ruta:Ref<any> = ref()
    
    let state = reactive({
        nombre: undefined,
        zona: undefined,
        estado: undefined
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

    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })

    // Asincronas
    onMounted( async () => {
        getRuta()
    })

    async function getRuta(){
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/rutas/' + props.id)
            Ruta.value = JSON.parse(response)
            state.nombre = Ruta.value.nombre
            state.zona = Ruta.value.zona
        } catch(e:any){
            console.log(e)
        }
    }
    
    async function onSubmit(event: FormSubmitEvent<any>) {
        Ruta.value.nombre = state.nombre
        Ruta.value.zona = state.zona
        event.preventDefault();
        try {
            const response : any = await $fetch(`${server.HOST}/api/v1/rutas/${Ruta.value.cod}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Ruta.value)
            });
            isOpen.value = false;
            emit('refreshList', 'success')
        } catch (e: any) {
            console.log(e);
        }
    }

</script>
