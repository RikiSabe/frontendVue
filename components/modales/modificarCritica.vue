<template>
    <UModal v-model="isOpen" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        
        <template #header>
            <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Modificar Critica
                </h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
            </div>
        </template>
        
        <UForm :state="state" @submit="onSubmit">
            <UFormGroup label="Descripcion de Critica" name="critica">
                <UInput v-model="state.descripcion" />
            </UFormGroup>
            <UFormGroup label="Tipo de Critica" name="tipo">
                <UInput v-model="state.tipo" />
            </UFormGroup>
            <UFormGroup label="Estado" name="estado">
                <UInputMenu label="Estado" name="estado"  type="none" v-model="selected" :options="estados"/>
            </UFormGroup>
            <br>
            <UButton type="submit"> Modificar </UButton>
        </UForm>

    </UCard>
    </UModal>
</template>

<script setup lang="ts">
    // Importaciones
    import { _selected } from '#tailwind-config/theme/aria'
    import type { FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server'

    // Interfaces
    interface Props {
        open: boolean,
        id: number
    }

    // Variables
    let estados = ['activo', 'inactivo']
    let selected = ref()
    let props = defineProps<Props>();
    let emit = defineEmits(['hidden', 'refreshList']);
    let isOpen = ref(props.open)
    let Critica:Ref<any> = ref()
    
    const state = reactive({
        descripcion: undefined,
        tipo: undefined,
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
    
    onMounted(() => {
        getCritica()
    })
    
    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })

    async function getCritica(){
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/criticas/' + props.id)
            Critica.value = JSON.parse(response)
            state.descripcion = Critica.value.descripcion
            state.tipo = Critica.value.tipo
            selected.value = Critica.value.estado
        } catch(e:any){
            console.log(e)
        }
    }
    
    async function onSubmit(event: FormSubmitEvent<any>) {
        Critica.value.descripcion = state.descripcion
        Critica.value.tipo = state.tipo
        Critica.value.estado = selected.value
        event.preventDefault();
        try {
            const response : any = await $fetch(`${server.HOST}/api/v1/criticas/${Critica.value.cod}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Critica.value)
            });
            isOpen.value = false;
            emit('refreshList')
        } catch (e: any) {
            console.log(e);
        }
    }
    
</script>
