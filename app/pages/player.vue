<script setup>
const { encounter } = useCharacters()

const activeCombatant = computed(() => encounter.value.find(c => c.active) ?? null)
</script>

<template>
    <div class="player-screen ">

        <!-- ── Active turn banner ────────────────────────── -->
        <div class="active-banner">
            <div class="active-banner__eyebrow">▶ Active Turn</div>
            <div class="active-banner__name">
                {{ activeCombatant?.name ?? '—' }}
            </div>
            <div class="active-banner__sub">
                {{ activeCombatant?.type ?? '' }}
            </div>
        </div>

        <!-- ── Initiative list ───────────────────────────── -->
        <div class="list-wrap">
            <Playerinitiativelist :data="encounter" />
        </div>

    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/css/styles.scss';

.player-screen {
    // width: 400px;
    // height: 1280px;
    width: 100dvw;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: $monument-dark;
}

// ── Active turn banner ────────────────────────────────────────
.active-banner {
    flex-shrink: 0;
    background: $monument;
    padding: 20px 20px 16px;
    border-bottom: 3px solid $burnt;

    &__eyebrow {
        @include eyebrow(9px);
        color: $burnt-light;
        margin-bottom: 6px;
    }

    &__name {
        font-family: $font-display;
        font-size: 36px;
        font-weight: 700;
        color: $text-bright;
        line-height: 1;
        letter-spacing: 0.02em;
    }

    &__sub {
        @include eyebrow(10px);
        color: $text-dim;
        margin-top: 6px;
    }
}

// ── List ──────────────────────────────────────────────────────
.list-wrap {
    flex: 1;
    overflow: hidden;
}
</style>