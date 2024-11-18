<template>
    <!-- :style="{ backgroundImage: 'url(/images/cosaaltbg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }" -->
    <!-- class="text-primary-foreground min-h-screen flex items-center justify-center" -->
    <div 
        :style="{ backgroundImage: `url( ${hero} )`, backgroundSize: 'cover', backgroundPosition: 'center'}"
    >
        <div class="flex items-center h-screen justify-end pr-28">
            <div class="bg-slate-800  p-8 rounded-lg shadow-lg w-full max-w-md "> 
                <div class="flex items-center justify-between">
                    <h1 class="text-3xl font-extrabold text-center mx-auto ml-0">Inicio de sesión</h1>
                    <img src="/images/cosaalt_logo.png" class="w-16 h-16" />
                </div>
                <form @submit.prevent="ingresarMenu" class="space-y-4">
                    <div>
                        <label for="username" class="block text-sm font-medium mb-2">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            v-model="username"
                            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-primary bg-clip-text"
                            placeholder="Ingrese su usuario"
                        />
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            v-model="password"
                            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-primary bg-clip-text"
                            placeholder="Ingrese su contraseña"
                        />
                    </div>
                    <button
                        type="submit"
                        class="w-full bg-cyan-600 text-primary-foreground py-2 px-4 rounded-md hover:bg-cyan-800"
                    >
                        Ingresar
                    </button>
                </form>
                <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { server } from '~/server/server';
    import hero from '../public/fontoinicio.jpeg'
    let username = ref('');
    let password = ref('');
    let errorMessage = ref('');
    let router = useRouter();

    async function ingresarMenu() {
        try {
            const response = await fetch(server.HOST + '/api/v1/loginweb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.value,
                    password: password.value
                })
            });

            if (!response.ok) {
                const data = await response.json();
                errorMessage.value = data.error || 'Error al iniciar sesión';
                return;
            }

            let data = await response.json();
            let token = data.token;
            localStorage.setItem('auth_token', token);
            router.push('/menu/perfil');
        } catch (error) {
            errorMessage.value = 'Error de conexión';
        }
    }
</script>
