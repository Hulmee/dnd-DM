<script setup>
defineProps({
    name: { type: String, required: true },
    initiative: { type: Number, required: true },
    healthCur: { type: Number, required: true },
    healthMax: { type: Number, required: true },
    ac: { type: Number, required: true },
    active: { type: Boolean, default: false },
    conditions: { type: Array, default: () => [] },
})

defineEmits(['select'])

function hpColour(cur, max) {
    const pct = max === 0 ? 0 : (cur / max) * 100
    if (pct > 50) return 'col-ok'
    if (pct > 25) return 'col-hurt'
    return 'col-crit'
}
</script>

<template>
    <li class="init-row" :class="{ 'init-row--active': active }" @click="$emit('select')">
        <div class="init-row__stripe init-row__stripe--pc" />

        <span class="init-row__num">{{ initiative }}</span>

        <div class="init-row__info">
            <span class="init-row__name">{{ name }}</span>
            <span class="init-row__sub">PC</span>
            <div v-if="conditions.length" class="init-row__pips">
                <span v-for="cid in conditions" :key="cid" class="init-row__pip"
                    :class="`init-row__pip--${cid.toLowerCase()}`" :title="cid" />
            </div>
        </div>

        <div class="init-row__right">
            <span class="init-row__hp-val" :class="hpColour(healthCur, healthMax)">
                {{ healthCur }}
            </span>
            <span class="init-row__hp-max">/ {{ healthMax }}</span>
            <span class="init-row__ac">AC {{ ac }}</span>
        </div>
    </li>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';
@import '@/assets/css/row';

.init-row__stripe--pc {
    background: $pc-stripe;
}

.init-row__hp-val {
    display: block;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
}

.init-row__hp-max {
    display: block;
    font-size: 10px;
    color: $text-dim;
    margin-top: 2px;
}

.init-row__ac {
    display: block;
    font-size: 10px;
    color: $text-dim;
    margin-top: 3px;
    letter-spacing: 0.05em;
}
</style>