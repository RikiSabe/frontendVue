<template>
    <UModal v-model="isOpen" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
            <div class="flex items-center justify-between">
                <h3 class="ml-4 text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Generar nueva credencial
                </h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
            </div>
        </template>
        <UForm :state="state" @submit="onSubmit">
            <div class="p-4">
                <p class="mb-4 font-semibold"> Datos del lecturador</p>
                <p> Usuario: {{ props.id }} </p>
                <p> Nombre: {{ state.nombre }} </p>
                <p> Apellido: {{ state.apellido }} </p>
                <p> Cédula de identidad: {{ state.ci }} </p>
            </div>
            <UButton color="blue" class="ml-4 mt-5" type="submit"> Generar nueva credencial </UButton>
        </UForm>
    </UCard>
    </UModal>

    <UModal v-model="isnewPasswordDialogOpen" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                <h3 class="text-center text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Nueva credencial generada exitosamente
                </h3>
            </template>
            <div class="p-4">
                <p> Nombre: {{ state.nombre }} </p>
                <p> Apellido: {{ state.apellido }} </p>
                <p> Cedula de Identidad : {{ state.ci }} </p>
                <p> Nombre de Usuario: {{ props.id }} </p>
                <p> Contraseña generada: {{ generatedPassword }} </p>
            </div>
            <div class="text-right">
                <UButton class="mr-2" color="blue" label="Imprimir nueva credencial" @click="pdfCredenciales" />
                <UButton color="blue" label="Cerrar" @click="isnewPasswordDialogOpen = false; isOpen = false;" />
            </div>
        </UCard>
    </UModal>
</template>

<script setup lang="ts">
    // Importaciones
    import type { FormSubmitEvent } from '#ui/types'
    import jsPDF from 'jspdf';
    import { server } from '~/server/server';
    import hero from '@/images/cosaalt_logo.png'
    
    // Interfaces
    interface Props {
        open: boolean,
        id: string
    }

    // Variables
    let props = defineProps<Props>();
    let emit = defineEmits(['hidden']);
    let isOpen = ref(props.open)
    let Usuario = ref()
    let isnewPasswordDialogOpen = ref(false)
    let generatedPassword = ref('')

    let state = reactive({
        nombre: undefined,
        apellido: undefined,
        ci: undefined
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
    
    onMounted( async () => {
        getUsuario()
    })

    async function getUsuario() {
        // console.log(props.id)
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/usuarios/lecturadorbyuser/' + props.id)
            Usuario.value = JSON.parse(response)
            state.nombre = Usuario.value.nombre
            state.apellido = Usuario.value.apellido
            state.ci = Usuario.value.ci
        } catch(e:any){
            console.log(e)
        }
    }

    // Asincronas
    async function onSubmit (event: FormSubmitEvent<any>) {
        event.preventDefault()
        try{
            const response : any = await $fetch(`${server.HOST}/api/v1/usuarios/lecturador/nuevacredencial/${Usuario.value.codPersona}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            generatedPassword.value = response
            isnewPasswordDialogOpen.value = true
        } catch(e:any) {
            console.log(e)
        }
    }
    
    function horaActual() {
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        return `${date} ${time}`;
    }

    function pdfCredenciales() {
        const doc = new jsPDF()
        const hora = horaActual()
        
        doc.setFontSize(10)
        doc.text(`Fecha y Hora: ${hora}`, 10, 10)

        const logo = hero
        const logoX = 180, logoY = 5, logoWidth = 20, logoHeight = 20
        const img = new Image()

        img.src = logo

        img.onload = () => {
            doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight)
            doc.setFontSize(18)
            doc.setFont("helvetica", "bold")
            const pageWidth = doc.internal.pageSize.getWidth()
            doc.text("Reimpresión de credencial", pageWidth / 2, 25, { align: "center" })

            doc.setFontSize(12)

            // Headings in bold
            doc.setFont("helvetica", "bold")
            doc.text("Nombre:", 60, 40)
            doc.text("Apellido:", 60, 50)
            doc.text("Cédula de Identidad:", 60, 60)
            doc.text("Nombre de Usuario:", 60, 70)
            doc.text("Nueva contraseña Generada:", 60, 80)

            doc.setFont("helvetica", "normal")
            doc.text(state.nombre + "", 125, 40)
            doc.text(state.apellido + "", 125, 50)
            doc.text(state.ci + "", 125, 60)
            doc.text(props.id, 125, 70)
            doc.text(generatedPassword.value, 125, 80)

            doc.save('Nueva credencial ' + props.id + '.pdf')
        }
    }
</script>
