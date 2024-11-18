<template>
    <div class="bg-cyan-400 h-screen">
        <div>
            <header class="py-4 bg-slate-800">
                <h1 class="text-2xl text-center font-bold"> PERFIL </h1>
            </header>
        </div>
        <div class="bg-background text-primary-foreground flex items-start justify-center p-10">
            <div class="bg-slate-600 rounded-lg shadow-lg w-full max-w-max">
                <div class="bg-cyan-600 p-4 rounded-lg shadow-md m-4">
                    <h2 class="text-lg font-medium mb-2">Información personal</h2>
                    <div class="flex items-center justify-between">
                        <div>
                        <p class="text-sm text-muted-foreground">Nombre Completo: {{ nombre_completo }}</p>
                        <p class="text-sm text-muted-foreground">Nombre de usuario: {{ usuario }}</p>
                        <p class="text-sm text-muted-foreground">Cédula de identidad: {{ ci }}</p>
                        </div>
                        <img aria-hidden="true" alt="profile" src="/images/icon_w.png" class="w-16 h-22" />
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-4">                
                    <div class="bg-cyan-600 p-4 rounded-lg shadow-md mb-4 ml-4">
                        <h2 class="text-lg text-center font-medium mb-2">Nro de Lecturadores</h2>
                        <p 
                            class="text-3xl text-center font-bold text-white"
                            >{{ cantidadLecturadores }}
                        </p>
                        <!-- style="text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;" -->
                    </div>
                    <div class="bg-cyan-600 p-4 rounded-lg shadow-md mb-4">
                        <h2 class="text-lg text-center font-medium mb-2">Nro de Medidores</h2>
                        <p 
                            class="text-3xl text-center font-bold text-white"
                            >{{ cantidadMedidores }}
                        </p>
                        <!-- style="text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;" -->
                    </div>
                    <div class="bg-cyan-600 p-4 rounded-lg shadow-md mb-4">
                        <h2 class="text-lg text-center font-medium mb-2">Nro de Rutas</h2>
                        <p 
                            class="text-3xl text-center font-bold text-white"
                            >{{ cantidadRutas }}
                        </p>
                        <!-- style="text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;" -->
                    </div>
                    <div class="bg-cyan-600 p-4 rounded-lg shadow-md mb-4 mr-4">
                        <h2 class="text-lg text-center font-medium mb-2">Nro de Críticas</h2>
                        <p 
                            class="text-3xl text-center font-bold text-white"
                            >{{ cantidadCriticas }}
                        </p>
                        <!-- style="text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;" -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    //Importaciones
    import { server } from '~/server/server';
    // Variables
    let nombre_completo = ref('Cargando') 
    let usuario = ref('Cargando')
    let ci = ref()
    
    let cantidadLecturadores = ref(0)
    let cantidadMedidores = ref(0)
    let cantidadRutas = ref(0)
    let cantidadCriticas = ref(0)
    let token = ""
    // console.log(token)
    
    // Funciones
    definePageMeta({
        layout: 'menu'
    })
    onMounted( () => {
        token = localStorage.getItem('auth_token') as string
        getCantidadLecturadores()
        getCantidadMedidores()
        getCantidadRutas()
        getCantidadCriticas()
        getDatos()
    })

    async function getCantidadLecturadores() {
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/usuarios/cantidad-lecturadores')
            cantidadLecturadores.value = JSON.parse(response)
        } catch (e:any){
            console.log(e)
        }
    }

    async function getCantidadMedidores() {
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/medidores/cantidad')
            cantidadMedidores.value = JSON.parse(response)
        } catch (e:any){
            console.log(e)
        }
    }

    async function getCantidadRutas() {
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/rutas/cantidad')
            cantidadRutas.value = JSON.parse(response)
        } catch (e:any){
            console.log(e)
        }
    }

    async function getCantidadCriticas() {
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/criticas/cantidad')
            cantidadCriticas.value = JSON.parse(response)
        } catch (e:any){
            console.log(e)
        }
    }

    async function getDatos() {
        try{
            const response:any = await $fetch(server.HOST + '/api/v1/usuarios/datos-admin',{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const Datos = response
            console.log(Datos)
            nombre_completo.value = Datos.nombre + " " + Datos.apellido
            usuario.value = Datos.usuario
            ci.value = Datos.ci

        } catch ( e:any ){
            console.log(e)
        }
    }
</script>
