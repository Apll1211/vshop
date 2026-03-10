<script setup lang="ts">
import logoM from "@/assets/logo-m.svg";
import MetallicPaint from "./effects/MetallicPaint.vue";
</script>

<template>
  <div class="logo-container">
    <MetallicPaint
      :image-src="logoM"
      :seed="42"
      :scale="4"
      :pattern-sharpness="1"
      :noise-scale="0.5"
      :speed="0.3"
      :liquid="0.75"
      :mouse-animation="false"
      :brightness="2"
      :contrast="0.5"
      :refraction="0.01"
      :blur="0.015"
      :chromatic-spread="2"
      :fresnel="1"
      :angle="0"
      :wave-amplitude="1"
      :distortion="1"
      :contour="0.2"
      light-color="#ffffff"
      dark-color="#000000"
      tint-color="#8b5cf6"
    />
  </div>
</template>

<style scoped>
.logo-container {
  width: 100%;
  height: 100%;
}
</style>
