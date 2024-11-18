<template>
    <UModal v-model="isOpen" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Modificar Funciones 
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
          </div>
        </template>
        <UForm :state="state" @submit="onSubmit">
          <UFormGroup label="Asignación de Ruta" name="ruta">
              <UInput v-model="state.ruta" />
          </UFormGroup>
          <UFormGroup label="Asignación de Grupo" name="grupo">
              <UInput v-model="state.grupo" />
          </UFormGroup>
          <br>
          <UButton type="submit"> Modificar </UButton>
        </UForm>
      </UCard>
    </UModal>
</template>

<script setup lang="ts">
    interface Props {
        open: boolean
    }
    const props = defineProps<Props>();
    const emit = defineEmits(['hidden']);
    const isOpen = ref(props.open)
    watch(() => props.open, (newVal) => {
        isOpen.value = newVal;
    });
    watch(isOpen, (newVal) =>{
        if(!newVal){
            emit('hidden');
        }
    });
    const state = reactive({
        ruta: undefined,
        grupo: undefined
    })
    import type { FormSubmitEvent } from '#ui/types'
    async function onSubmit (event: FormSubmitEvent<any>) {
        // Do something with data
        console.log(event.data)
    }
    defineShortcuts({
      escape: {
        usingInput: true,
        whenever: [isOpen],
        handler: () => { isOpen.value = false }
      }
    })
</script>
