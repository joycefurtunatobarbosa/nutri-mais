<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
<template>
    <div class="marca">
        <RouterLink to="/" class="marca-link">
            <span class="marca-icone">N</span>
            <span class="marca-nome">Nutri<span>Mais</span></span>
        </RouterLink>
    </div>
</template>

<style scoped>
.marca-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #0a2540;
    text-decoration: none;
}
.marca-icone {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 10px;
    background: #635bff;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
}
.marca-nome { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
.marca-nome span { color: #635bff; }
</style>