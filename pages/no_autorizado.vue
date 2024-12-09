<template>
    <div
        :style="{ backgroundImage: `url( ${hero} )`, backgroundSize: 'cover', backgroundPosition: 'center'}"  
        class="min-h-screen flex items-center justify-center">
        <div class="p-6 max-w-md w-full bg-card shadow-lg rounded-lg text-center bg-slate-800 opacity-90">
            <h1 class="text-4xl font-bold mb-4">Acceso no autorizado</h1>
            <p class="text-lg mb-4">Lo siento, no tienes permisos para acceder a esta página.</p>
            <img src="/images/candado.png" alt="locked" class="mx-auto w-40 h-30" />
            <br>
            <a href="/"> Inicia sesión </a>
        </div>
    </div>
</template>

<script setup lang="ts">
    import hero from '../public/fontoinicio.jpeg'
</script>