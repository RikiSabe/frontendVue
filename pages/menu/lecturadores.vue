<template>
    <div class="bg-cyan-400 h-screen">
        <header class="py-4 bg-slate-800">
            <h1 class="text-2xl text-center font-bold"> LISTA DE LECTURADORES </h1>
        </header>

        <div class="grid grid-cols-2 ml-10 mr-10 mt-5 mb-0 border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
                <UButton icon="i-heroicons-plus-20-solid" color="gray" label="Nuevo Lecturador" @click="isOpen = true" />
            </div>
            <div class="flex items-center justify-end space-x-4">
                <UInput v-model="q" placeholder="Filtrar lecturadores..." />
                <UPagination v-model="page" :page-count="pageCount" :total="Lecturadores.length" />
            </div>
        </div>

        <div>
            <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="ml-10 text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Agregar nuevo Lecturador
                    </h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                </div>
                </template>
                <UForm :validate="validate" :state="state" @submit="onSubmit">
                    <UFormGroup class="mb-5 ml-5 mr-5" label="Nombre" name="nombre">
                        <UInput v-model="state.nombre" />
                    </UFormGroup>
                    <UFormGroup class="m-5" label="Apellido" name="apellido">
                        <UInput v-model="state.apellido" />
                    </UFormGroup>
                    <UFormGroup class="m-5" label="Cedula de Identidad" name="ci">
                        <UInput v-model="state.ci" />
                    </UFormGroup>
                    <UFormGroup class="m-5 mb-0" label="Nombre de Usuario" name="usuario">
                        <UInput v-model="state.usuario" />
                    </UFormGroup>
                    <br>
                    <UButton class="ml-5 mr-5 mt-0" color="blue" type="submit" :disabled="hasErrors"> Agregar </UButton>
                </UForm>
            </UCard>
            </UModal>
        </div>
        <div>
            <UTable
                :loading="isLoading"
                :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Cargando...' }"
                :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Sin lecturadores.' }"
                :rows="paginatedLecturadores"
                :columns="columnas"
                class="p-10 ml-10 mr-10 mt-5 mb-0 bg-slate-800">
                <template #actions-data="{ row }" >
                    <UDropdown class="bg-slate-800" :items="items(row)" :ui="{background: 'bg-white dark:bg-gray-800'}" >
                        <UButton color="white" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                    </UDropdown>
                </template>
            </UTable>
        </div>
    </div>

    <UModal v-model="isPasswordDialogOpen" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                <h3 class="text-center text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Datos Registrados Exitosamente
                </h3>
            </template>
            <div class="p-4">
                <p>Nombre: {{ state.nombre }}</p>
                <p>Apellido: {{ state.apellido }}</p>
                <p>Cedula de Identidad : {{ state.ci }}</p>
                <p>Nombre de Usuario: {{ state.usuario }}</p>
                <p>Contraseña generada: {{ generatedPassword }}</p>
            </div>
            <div class="text-right">
                <UButton class="mr-2" color="blue" label="Imprimir credenciales" @click="pdfCredenciales" />
                <UButton color="blue" label="Cerrar" @click="isPasswordDialogOpen = false" />
            </div>
        </UCard>
    </UModal>

    <modificarDatosPersonalesLecturador @refreshList="getLecturadores()" :id="indice" :open="isOpenModificarDatosPersonalesLecturador" v-if="isOpenModificarDatosPersonalesLecturador" @hidden="isOpenModificarDatosPersonalesLecturador = false"/>
    <modificarCredencialesLecturador :open="isOpenModificarCredenciales" :id="indice" v-if="isOpenModificarCredenciales" @hidden="isOpenModificarCredenciales = false" />
</template>

<script setup lang="ts">
    import type { FormError, FormSubmitEvent } from '#ui/types'
    import { server } from '~/server/server'
    import modificarDatosPersonalesLecturador from '~/components/modales/modificarDatosPersonalesLecturador.vue'
    import modificarCredencialesLecturador from '~/components/modales/modificarCredencialesLecturador.vue'
    import jsPDF from 'jspdf'
    import hero from '@/images/cosaalt_logo.png'

    let isOpenModificarDatosPersonalesLecturador = ref(false)
    let isOpenModificarCredenciales = ref(false)
    let isPasswordDialogOpen = ref(false)
    let generatedPassword = ref('')
    let indice = ref()
    let Lecturadores = ref([])
    let isOpen = ref(false)
    let q = ref('')
    let page = ref(1)
    const pageCount = 5
    const isLoading = ref(false)

    let columnas = [ 
        { key: 'usuario', label: 'Usuario', sortable: true },     
        { key: 'nombre', label: 'Nombre', sortable: true },
        { key: 'apellido', label: 'Apellido', sortable: true}, 
        { key: 'ci', label: 'Cedula de Identidad', sortable: true }, 
        { key: 'actions' }
    ]

    let validate = (state : any): FormError[] => {
        const error = []
        if(!state.nombre) error.push({path: 'nombre', message: 'Nombre Requerido'})
        if(!state.apellido) error.push({path: 'apellido', message: 'Apellido Requerido'})
        if(!state.ci) {
            error.push({path: 'ci', message: 'Cédula de Identidad Requerida'})
        } else if (!/^\d+$/.test(state.ci)) {
            error.push({ path: 'ci', message: 'Cédula de Identidad debe contener solo números' });
        }
        if(!state.usuario) error.push({path: 'usuario', message: 'Usuario Requerido'})
        return error;
    }

    let hasErrors = computed( ()=> {
        const errors = validate(state)
        return errors.length > 0
    })

    let state = reactive({
        nombre: '', apellido: '', ci: '', codRuta: 1,
        usuario: '', contra: '', codGrupo: 1, estado: 'activo'
    })

    let items = (row:any) => [[
        {
            label: 'Modificar datos',
            icon: 'i-heroicons-pencil-square-20-solid',
            click: () => { 
                isOpenModificarDatosPersonalesLecturador.value = true;
                indice.value = row.usuario;
            }
        },
        {
            label: 'Nueva credencial',
            icon: 'i-heroicons-pencil-square-20-solid',
            click: () => {
                isOpenModificarCredenciales.value = true;
                indice.value = row.usuario;
            }
        }
    ]]
    
    definePageMeta({ layout: 'menu' })
    
    onMounted(()=>{ getLecturadores() })
    
    defineShortcuts({
        escape: {
            usingInput: true,
            whenever: [isOpen],
            handler: () => { isOpen.value = false }
        }
    })

    async function getLecturadores(){
        isLoading.value = true
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/usuarios/lecturador') // cambiar a lecturadores
            Lecturadores.value = JSON.parse(response)
            
        } catch (e:any){
            console.log(e)
        } finally {
            isLoading.value = false
        }
    }

    async function onSubmit (event: FormSubmitEvent<any>) {
        event.preventDefault();
        try {
            const response : any = await $fetch(`${server.HOST}/api/v1/usuarios/lecturador`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state)
            });
            generatedPassword.value = response;
            isPasswordDialogOpen.value = true;
            
            await getLecturadores();
            isOpen.value = false;
        } catch (e: any) {
            console.log(e);
        }
    }

    const paginatedLecturadores = computed(() => {
        const start = (page.value - 1) * pageCount
        const end = page.value * pageCount
        return filteredLecturadores.value.slice(start, end)
    })

    const filteredLecturadores = computed(() => {
        if (!q.value) {
            return Lecturadores.value;
        }
        return Lecturadores.value.filter((lecturador) =>
            Object.values(lecturador).some((value) =>
                String(value).toLowerCase().includes(q.value.toLowerCase())
            )
        )
    })
    
    function horaActual() {
        const now = new Date()
        const date = now.toLocaleDateString()
        const time = now.toLocaleTimeString()
        return `${date} ${time}`
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
            doc.text("Credencial de nuevo lecturador", pageWidth / 2, 25, { align: "center" })
            doc.setFontSize(12)

            doc.setFont("helvetica", "bold")
            doc.text("Nombre:", 60, 40)
            doc.text("Apellido:", 60, 50)
            doc.text("Cédula de Identidad:", 60, 60)
            doc.text("Nombre de Usuario:", 60, 70)
            doc.text("Contraseña Generada:", 60, 80)

            doc.setFont("helvetica", "normal")
            doc.text(state.nombre, 115, 40)
            doc.text(state.apellido, 115, 50)
            doc.text(state.ci, 115, 60)
            doc.text(state.usuario, 115, 70)
            doc.text(generatedPassword.value, 115, 80)

            doc.save('credenciales ' + state.usuario + '.pdf')
        }
    }

</script>
