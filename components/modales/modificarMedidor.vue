<template>
    <UModal v-model="isOpen" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
            <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Modificar Medidor
                </h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
            </div>
        </template>
        <UForm :state="state" @submit="onSubmit">
            <UFormGroup label="Nombre" name="nombre">
                <UInput v-model="state.nombre" />
            </UFormGroup>
            <UFormGroup label="Propietario" name="propietario">
                <UInput v-model="state.propietario" />
            </UFormGroup>
            <UFormGroup label="Ruta" name="ruta">
                <UInputMenu 
                    label="Ruta" 
                    name="ruta"  
                    type="none" 
                    v-model="state.codRuta" 
                    :options="Rutas"
                    value-attribute="cod"
                    option-attribute="nombre" />
            </UFormGroup>
            <UFormGroup label="Tipo" name="tipo">
                <UInputMenu
                    label="Tipo"
                    name="tipo"
                    type="none"
                    v-model="state.tipo"
                    :options="Tipos" />
            </UFormGroup>
            <UFormGroup label="Estado" name="estado">
                <UInputMenu
                    label="Estado"
                    name="estado"
                    type="none"
                    v-model="state.estado"
                    :options="Estados" />
            </UFormGroup>
            <UFormGroup label="Ubicación" name="ubicacion">
                <div class="flex items-center">
                    <UInput class="w-max mr-1" v-model="state.longitud" /> 
                    <UInput class="w-max mr-1" v-model="state.latitud" /> 
                    <UButton @click="openUbicacionModal"> Modificar dirección </UButton>
                </div>
            </UFormGroup>
            <br>
            <UButton type="submit"> Modificar </UButton>
        </UForm>
        </UCard>
    </UModal>

    <ModificarUbicacionMedidor @updateCoordinates="handleUpdateCoordinates" :latitud="state.latitud" :longitud="state.longitud" :open="isOpenNuevaUbicacion" v-if="isOpenNuevaUbicacion" @hidden="closeUbicacionModal"/>
</template>

<script setup lang="ts">
    // Importaciones
    import type { FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server';
    import ModificarUbicacionMedidor from './modificarUbicacionMedidor.vue';

    // Interfaces
    interface Props {
        open: boolean,
        id: number
    }

    // Variables
    let emit = defineEmits(['hidden', 'refreshList']);
    let isOpenNuevaUbicacion = ref(false);
    let props = defineProps<Props>();
    let isOpen = ref(props.open)
    let Medidor = ref()
    let Rutas = ref()
    let Estados = ref(['activo', 'inactivo'])
    let Tipos = ref(['domicilio', 'residencia'])
    let Direccion = ref()

    let state = reactive({
        nombre: undefined,
        propietario: undefined,
        nombreRuta: undefined,
        estado: undefined,
        codRuta: undefined,
        longitud: '',
        latitud: '',
        codDireccion: undefined,
        tipo: undefined
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
        getMedidor()
        getRutas()
    })

    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })
    
    function openUbicacionModal(){
        isOpenNuevaUbicacion.value = true;
    }

    function closeUbicacionModal() {
        isOpenNuevaUbicacion.value = false;
    }

    function handleUpdateCoordinates(coordenadas: [number, number]) {
        state.longitud = coordenadas[0].toString();
        state.latitud = coordenadas[1].toString();
        isOpenNuevaUbicacion.value = false;
        closeUbicacionModal()
    }

    async function getRutas() {
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/rutas')
            Rutas.value = JSON.parse(response)
        } catch(e:any){
            console.log(e)
        }
    }

    async function getDireccion(codDireccion : number){
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/medidores/direccion/' + codDireccion)
            Direccion.value = JSON.parse(response)
            state.longitud = Direccion.value.longitud
            state.latitud = Direccion.value.latitud
        } catch(e:any){
            console.log(e)
        }
    }

    // Asincronas
    async function getMedidor(){
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/medidores/' + props.id)
            Medidor.value = JSON.parse(response)
            state.nombre = Medidor.value.nombre
            state.propietario = Medidor.value.propietario
            state.estado = Medidor.value.estado
            state.codRuta = Medidor.value.codRuta
            state.tipo = Medidor.value.tipo
            getDireccion(Medidor.value.codDireccion)
        } catch(e:any){
            console.log(e)
        }
    }
    
    async function onSubmit(event: FormSubmitEvent<any>) {
        // Medidor
        Medidor.value.nombre = state.nombre
        Medidor.value.propietario = state.propietario
        Medidor.value.estado = state.estado
        Medidor.value.codRuta = state.codRuta
        Medidor.value.tipo = state.tipo
        // Direccion
        Direccion.value.longitud = parseFloat(state.longitud)
        Direccion.value.latitud = parseFloat(state.latitud)
        event.preventDefault();
        try {
            const response1 : any = await $fetch(`${server.HOST}/api/v1/medidores/direccion/modificar/${Medidor.value.codDireccion}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Direccion.value)
            });
            const response2 : any = await $fetch(`${server.HOST}/api/v1/medidores/${Medidor.value.cod}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Medidor.value)
            });
            isOpen.value = false;
            emit('refreshList')
        } catch (e: any) {
            console.log(e);
        }
    }
    
</script>
