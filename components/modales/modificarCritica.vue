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
        
        <UForm :validate="validate" :state="state" @submit="onSubmit">
            <UFormGroup class="ml-5 mr-5 mb-5" label="Descripcion de Critica" name="descripcion">
                <UInput v-model="state.descripcion" />
            </UFormGroup>
            <UFormGroup class="ml-5 mr-5 mb-5" label="Tipo de Crítica" name="tipo">
                <UInputMenu label="Tipo de critica" name="tipo"  type="none" v-model="state.tipo" :options="tipos"/>
            </UFormGroup>
            <UFormGroup class="ml-5 mr-5 mb-0" label="Estado" name="estado">
                <UInputMenu label="Estado" name="estado"  type="none" v-model="selected" :options="estados"/>
            </UFormGroup>
            <br>
            <UButton class="mb-5 ml-5 mr-5" :disabled="hasErrors" type="submit"> Modificar </UButton>
        </UForm>

    </UCard>
    </UModal>
</template>

<script setup lang="ts">
    // Importaciones
    import { _selected } from '#tailwind-config/theme/aria'
    import type { FormError, FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server'

    // Interfaces
    interface Props {
        open: boolean,
        id: number
    }

    // Variables
    let estados = ['activo', 'inactivo']
    let tipos = ['normal', 'promedio']
    let selected = ref()
    let props = defineProps<Props>();
    let emit = defineEmits(['hidden', 'refreshList']);
    let isOpen = ref(props.open)
    let Critica:Ref<any> = ref()
    
    const state = reactive({
        descripcion: '',
        tipo: '',
        estado: ''
    })

    let validate = (state : any): FormError[] => {
        const error = []
        if( !state.descripcion ) {
            error.push({path: 'descripcion', message: 'Descripción Requerida'})
        }
        if( state.descripcion.length >= 25 ){
            error.push({path: 'descripcion', message: 'La descripción no debe contener más de 25 caracteres'})
        }
        if( espacios_consecutivos(state.descripcion) ){
            error.push({path: 'descripcion', message: 'Formato no correcto'})
        }
        if( espacioslaterales(state.descripcion) ){
            error.push({path: 'descripcion', message: 'Formato no correcto'})
        }
        if( !okMayusculas(state.descripcion) ){
            error.push({path: 'descripcion', message: 'La descripción no debe tener letras en minúsculas'})
        }
        return error;
    }

    let hasErrors = computed( ()=> {
        const errors = validate(state)
        return errors.length > 0
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

    function espacios_consecutivos( str :string ){
        return / {2,}/.test(str)
    }

    function espacioslaterales( str :string ){
        return /^\s+|\s+$/.test(str)
    }

    function okMayusculas( str : string ){
        const strim = str.replaceAll(/\s+/g, '')
        return /^[A-Z]*$/.test(strim)
    }

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
            emit('refreshList', 'success')
        } catch (e: any) {
            console.log(e);
        }
    }
    
</script>
