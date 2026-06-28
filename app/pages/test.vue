<template>
    <ul class="init-list__rows">
        <template v-for="c in encounter" :key="c.uid">

            <PCRow v-if="c.type === 'PC'" :name="c.name" :initiative="c.initiative" :health-cur="c.healthCur"
                :health-max="c.healthMax" :ac="c.ac" :active="c.active" :conditions="c.conditions ?? []" />

            <NPCRow v-else :name="c.name" :initiative="c.initiative" :health-cur="c.healthCur" :health-max="c.healthMax"
                :ac="c.ac" :active="c.active" :conditions="c.conditions ?? []" />

        </template>
    </ul>
    <!-- <pre>{{ sortedEncounter }}</pre>
    <Addcombatantmodal v-if="showAddModal" @close="showAddModal = false" /> -->
</template>

<script setup>
const { encounter } = useCharacters()
const showAddModal = ref(true)

</script>

<style lang="scss" scoped></style>