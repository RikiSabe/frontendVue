<template>
    <UModal v-model="isOpen" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
            <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Modificar Datos Personales
                </h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
            </div>
        </template>

        <UForm :validate="validate" :state="state" @submit="onSubmit">
            <UFormGroup label="Nombre" name="nombre">
                <UInput v-model="state.nombre" />
            </UFormGroup>
            <UFormGroup label="Apellido" name="apellido">
                <UInput v-model="state.apellido" />
            </UFormGroup>
            <UFormGroup label="Cedula de Identidad" name="ci">
                <UInput v-model="state.ci" />
            </UFormGroup>
            <br>
            <UButton color="blue" type="submit" :disabled="hasErrors" > Modificar </UButton>
        </UForm>
    </UCard>
    </UModal>
</template>

<script setup lang="ts">
    // Importaciones
    import type { FormError, FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server';

    // Interfaces
    interface Props {
        open: boolean,
        id: string
    }

    // Variables
    let props = defineProps<Props>();
    let emit = defineEmits(['hidden', 'refreshList']);
    let isOpen = ref(props.open)
    let Lecturadores = ref([])
    let Usuario:Ref<any> = ref()

    let state = reactive({
        nombre: '',
        apellido: '',
        ci: ''
    })
 
    let validate = (state : any): FormError[] => {
        const error = []
        // Nombre
        if(!state.nombre) {
            error.push({path: 'nombre', message: 'Nombre requerido'})
        }
        if( state.nombre.length > 25 ){
            error.push({path: 'nombre', message: 'El nombre no debe contener más de 25 caracteres'})
        }
        if( espacios_consecutivos(state.nombre) || espacioslaterales(state.nombre) ) {
            error.push({path: 'nombre', message: 'Espacios innecesarios'})
        }
        // Apellido
        if( !state.apellido ) {
            error.push({path: 'apellido', message: 'Apellido requerido'})
        }
        if( state.apellido.length > 25 ){
            error.push({path: 'apellido', message: 'El apellido no debe contener más de 25 caracteres'})
        }
        if( espacios_consecutivos(state.apellido) || espacioslaterales(state.apellido) ){
            error.push({path: 'apellido', message: 'Espacios innecesarios'})
        }
        // CI
        if(!state.ci) {
            error.push({path: 'ci', message: 'Cedula de identidad requerida'})
        }
        if( okCI() ){
            error.push({ path: 'ci', message: 'Cédula de Identidad no disponible' });
        }
        if( okComplemento() || espacios_innecesarios( state.ci ) || ceros_izquierda() || espacioslaterales(state.ci) ){
            error.push({ path: 'ci', message: 'Formato no correcto' });
        }
        return error
    }

    let hasErrors = computed( () => {
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
    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })

    // Asincronas
    onMounted( async () => {
        getUsuario()
    })

    function espacios_consecutivos( str :string ){
        return / {2,}/.test(str)
    }

    function espacioslaterales( str :string ){
        return /^\s+|\s+$/.test(str)
    }

    function okCI() {
        return Lecturadores.value.some((lecturador) => lecturador.ci === state.ci)
    }

    function ceros_izquierda(){
        return /^0\d+/.test(state.ci)
    }
    
    function espacios_innecesarios( str :string ){
        return (str.match(/ /g) || []).length > 0
    }

    function okComplemento(){
        if( state.ci.length < 7 ) return true
        // solo tiene numeros
        if( /^\d+$/.test(state.ci) && (state.ci.length == 8 || state.ci.length == 7)) return false
        // si tiene complemento
        if( /^\d{7,8}-\d[A-Z]$/.test(state.ci) ) return false
        if( state.ci.length >= 8 ) return true
        return true
    }

    async function getLecturadores(){
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/usuarios/lecturador') // cambiar a lecturadores
            Lecturadores.value = JSON.parse(response)   
        } catch (e:any){
            console.log(e)
        }
    }

    async function getUsuario(){
        try{
            // console.log(props.id);
            const response:any = await $fetch(server.HOST + '/api/v1/usuarios/lecturadorbyuser/' + props.id)
            Usuario.value = JSON.parse(response)

            state.nombre = Usuario.value.nombre
            state.apellido = Usuario.value.apellido
            state.ci = Usuario.value.ci

            // console.log(Usuario.value.codPersona)
        } catch(e:any){
            console.log(e)
        }
    }

    async function onSubmit(event: FormSubmitEvent<any>) {
        Usuario.value.nombre = state.nombre
        Usuario.value.apellido = state.apellido
        Usuario.value.ci = state.ci
        event.preventDefault();
        try {
            const response : any = await $fetch(`${server.HOST}/api/v1/usuarios/lecturador/${Usuario.value.codPersona}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Usuario.value)
            });
            isOpen.value = false;
            emit('refreshList')
        } catch (e: any) {
            console.log(e);
        }
    }
    
</script>
