<script setup lang="ts">
import { gsap } from 'gsap';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

interface Props {
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  glowColor?: string;
  disableAnimations?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  enableBorderGlow: true,
  enableTilt: true,
  enableMagnetism: true,
  clickEffect: true,
  glowColor: DEFAULT_GLOW_COLOR,
  disableAnimations: false
});

const cardRef = ref<HTMLDivElement | null>(null);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT;
};

const shouldDisableAnimations = computed(() => props.disableAnimations || isMobile.value);

let cleanupEventListeners: (() => void) | null = null;

const setupEventListeners = () => {
  if (shouldDisableAnimations.value || !cardRef.value) return;

  const element = cardRef.value;

  const handleMouseEnter = () => {
    gsap.to(element, { y: -2, duration: 0.3, ease: 'power2.out' });

    if (props.enableTilt) {
      gsap.to(element, {
        rotateX: 5,
        rotateY: 5,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000
      });
    }
  };

  const handleMouseLeave = () => {
    if (props.enableTilt) {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (props.enableMagnetism) {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    element.style.setProperty('--glow-intensity', '0');
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Update glow position
    const relativeX = (x / rect.width) * 100;
    const relativeY = (y / rect.height) * 100;
    element.style.setProperty('--glow-x', `${relativeX}%`);
    element.style.setProperty('--glow-y', `${relativeY}%`);
    element.style.setProperty('--glow-intensity', '1');

    if (props.enableTilt) {
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: 'power2.out',
        transformPerspective: 1000
      });
    }

    if (props.enableMagnetism) {
      const magnetX = (x - centerX) * 0.05;
      const magnetY = (y - centerY) * 0.05;

      gsap.to(element, {
        x: magnetX,
        y: magnetY,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (!props.clickEffect) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const maxDistance = Math.max(
      Math.hypot(x, y),
      Math.hypot(x - rect.width, y),
      Math.hypot(x, y - rect.height),
      Math.hypot(x - rect.width, y - rect.height)
    );

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${maxDistance * 2}px;
      height: ${maxDistance * 2}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(${props.glowColor}, 0.4) 0%, rgba(${props.glowColor}, 0.2) 30%, transparent 70%);
      left: ${x - maxDistance}px;
      top: ${y - maxDistance}px;
      pointer-events: none;
      z-index: 1000;
    `;

    element.appendChild(ripple);

    gsap.fromTo(
      ripple,
      {
        scale: 0,
        opacity: 1
      },
      {
        scale: 1,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      }
    );
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('click', handleClick);

  cleanupEventListeners = () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('click', handleClick);
  };
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  setupEventListeners();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  cleanupEventListeners?.();
});

watch(
  () => shouldDisableAnimations.value,
  () => {
    cleanupEventListeners?.();
    setupEventListeners();
  }
);
</script>

<template>
  <div
    ref="cardRef"
    class="glow-box-wrapper"
    :class="{ 'glow-box--border-glow': enableBorderGlow }"
    :style="{
      '--glow-x': '50%',
      '--glow-y': '50%',
      '--glow-intensity': '0',
      '--glow-radius': '200px',
      '--glow-color': glowColor
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.glow-box-wrapper {
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glow-box--border-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: radial-gradient(
    var(--glow-radius) circle at var(--glow-x) var(--glow-y),
    rgba(var(--glow-color), calc(var(--glow-intensity) * 0.8)) 0%,
    rgba(var(--glow-color), calc(var(--glow-intensity) * 0.4)) 30%,
    transparent 60%
  );
  border-radius: inherit;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: subtract;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.glow-box--border-glow:hover {
  box-shadow:
    0 4px 20px rgba(46, 24, 78, 0.4),
    0 0 30px rgba(var(--glow-color), 0.2);
}
</style>
