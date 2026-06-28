<script setup>
defineProps({
    data: { type: Array, required: true },
})
</script>

<template>
    <ul class="init-list">
        <template v-for="c in data" :key="c.uid">

            <PCRow v-if="c.type === 'PC'" :name="c.name" :initiative="c.initiative" :health-cur="c.healthCur"
                :health-max="c.healthMax" :ac="c.ac" :active="c.active" :conditions="c.conditions ?? []" />

            <NPCRow v-else :name="c.name" :initiative="c.initiative" :health-cur="c.healthCur" :health-max="c.healthMax"
                :active="c.active" :conditions="c.conditions ?? []" :tokenNum="c.tokenNum" />

        </template>
    </ul>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';

.init-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    width: 100%;
}
</style>