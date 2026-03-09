<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Beams from "@/components/effects/Beams.vue";
import TextType from "@/components/effects/TextType.vue";

const router = useRouter();
const isLoaded = ref(false);

onMounted(() => {
	setTimeout(() => {
		isLoaded.value = true;
	}, 100);
});

const goHome = () => {
	router.push({ name: "home" });
};

const goBack = () => {
	router.back();
};
</script>

<template>
  <div class="not-found-container">
    <!-- 背景光束效果 -->
    <div class="beams-wrapper">
      <Beams
        :beamWidth="2.5"
        :beamHeight="20"
        :beamNumber="15"
        lightColor="#00f5ff"
        :speed="2.5"
        :noiseIntensity="2"
        :scale="0.25"
        :rotation="25"
      />
    </div>
    
    <!-- 渐变遮罩层 -->
    <div class="overlay"></div>
    
    <!-- 主内容 -->
    <div class="not-found-content" :class="{ loaded: isLoaded }">
      <div class="glitch-wrapper">
        <div class="error-code" data-text="404">404</div>
      </div>
      
      <div class="error-divider">
        <span class="line"></span>
        <span class="diamond"></span>
        <span class="line"></span>
      </div>
      
      <div class="error-message">
        <TextType
          :text="['These are not the droids you are looking for.', '您访问的页面已迷失在时空裂缝中...', 'ERROR: PAGE_NOT_FOUND']"
          :typingSpeed="80"
          :pauseDuration="2500"
          :deletingSpeed="40"
          :loop="true"
          :showCursor="true"
          cursorCharacter="_"
          class="typing-text"
        />
      </div>
      
      <div class="error-stats">
        <div class="stat">
          <span class="stat-value">∞</span>
          <span class="stat-label">迷失页面</span>
        </div>
        <div class="stat">
          <span class="stat-value">0</span>
          <span class="stat-label">找到结果</span>
        </div>
        <div class="stat">
          <span class="stat-value">404</span>
          <span class="stat-label">错误代码</span>
        </div>
      </div>
      
      <div class="error-actions">
        <button class="btn btn-primary" @click="goHome">
          <span class="btn-content">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            返回首页
          </span>
          <span class="btn-glow"></span>
        </button>
        <button class="btn btn-secondary" @click="goBack">
          <span class="btn-content">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12,19 5,12 12,5"/>
            </svg>
            返回上页
          </span>
        </button>
      </div>
      
      <div class="terminal-hint">
        <span class="prompt">$</span>
        <span class="command">cd /home</span>
        <span class="cursor-blink">▊</span>
      </div>
    </div>
    
    <!-- 扫描线效果 -->
    <div class="scanlines"></div>
    
    <!-- 角落装饰 -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
  </div>
</template>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  position: relative;
  overflow: hidden;
  font-family: 'Courier New', monospace;
}

.beams-wrapper {
  position: absolute;
  inset: 0;
  opacity: 0.6;
}

.overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%);
  pointer-events: none;
}

.not-found-content {
  text-align: center;
  z-index: 10;
  padding: 2rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.not-found-content.loaded {
  opacity: 1;
  transform: translateY(0);
}

/* Glitch 404 效果 */
.glitch-wrapper {
  position: relative;
  display: inline-block;
}

.error-code {
  font-size: clamp(6rem, 18vw, 14rem);
  font-weight: 900;
  color: #fff;
  text-shadow: 
    0 0 10px rgba(0, 245, 255, 0.8),
    0 0 20px rgba(0, 245, 255, 0.6),
    0 0 40px rgba(0, 245, 255, 0.4),
    0 0 80px rgba(0, 245, 255, 0.2);
  position: relative;
  animation: textGlow 2s ease-in-out infinite;
}

.error-code::before,
.error-code::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.error-code::before {
  color: #0080ff;
  animation: glitch-1 2s infinite linear alternate-reverse;
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
  transform: translateX(-2px);
}

.error-code::after {
  color: #00ff88;
  animation: glitch-2 3s infinite linear alternate-reverse;
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
  transform: translateX(2px);
}

@keyframes glitch-1 {
  0%, 100% { transform: translateX(-2px); }
  25% { transform: translateX(2px); }
  50% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}

@keyframes glitch-2 {
  0%, 100% { transform: translateX(2px); }
  25% { transform: translateX(-2px); }
  50% { transform: translateX(1px); }
  75% { transform: translateX(-1px); }
}

@keyframes textGlow {
  0%, 100% { 
    text-shadow: 
      0 0 10px rgba(0, 245, 255, 0.8),
      0 0 20px rgba(0, 245, 255, 0.6),
      0 0 40px rgba(0, 245, 255, 0.4);
  }
  50% { 
    text-shadow: 
      0 0 20px rgba(0, 245, 255, 1),
      0 0 40px rgba(0, 245, 255, 0.8),
      0 0 60px rgba(0, 245, 255, 0.6),
      0 0 80px rgba(0, 245, 255, 0.4);
  }
}

/* 分隔线 */
.error-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.error-divider .line {
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
}

.error-divider .diamond {
  width: 10px;
  height: 10px;
  background: #00f5ff;
  transform: rotate(45deg);
  box-shadow: 0 0 10px #00f5ff;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1;
    box-shadow: 0 0 10px #00f5ff, 0 0 20px #00f5ff;
  }
  10% { 
    opacity: 0.3;
    box-shadow: 0 0 5px #00f5ff;
  }
  20% { 
    opacity: 1;
    box-shadow: 0 0 15px #00f5ff, 0 0 30px #00f5ff;
  }
  30% { 
    opacity: 0.5;
    box-shadow: 0 0 8px #00f5ff;
  }
  40% { 
    opacity: 1;
    box-shadow: 0 0 10px #00f5ff, 0 0 25px #00f5ff;
  }
  70% { 
    opacity: 0.4;
    box-shadow: 0 0 5px #00f5ff;
  }
  80% { 
    opacity: 1;
    box-shadow: 0 0 20px #00f5ff, 0 0 40px #00f5ff;
  }
}

/* 错误消息 */
.error-message {
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  color: #e0e0e0;
  margin-bottom: 2rem;
  min-height: 2.5em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-text {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
}

/* 统计数据 */
.error-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #00f5ff;
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* 按钮 */
.error-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.75rem;
  position: relative;
  z-index: 2;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-primary {
  background: transparent;
  color: #fff;
  border: 1px solid #00f5ff;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #00f5ff 0%, #0080ff 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 245, 255, 0.4);
}

.btn-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #00f5ff, #0080ff, #00f5ff);
  filter: blur(10px);
  opacity: 0;
  z-index: 1;
  transition: opacity 0.3s ease;
}

.btn-primary:hover .btn-glow {
  opacity: 0.5;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #aaa;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
  transform: translateY(-2px);
}

/* 终端提示 */
.terminal-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.85rem;
}

.prompt {
  color: #00f5ff;
}

.command {
  color: #0f0;
}

.cursor-blink {
  color: #fff;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 扫描线效果 */
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
  opacity: 0.3;
}

/* 角落装饰 */
.corner {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid rgba(0, 245, 255, 0.3);
  pointer-events: none;
}

.corner-tl {
  top: 20px;
  left: 20px;
  border-right: none;
  border-bottom: none;
}

.corner-tr {
  top: 20px;
  right: 20px;
  border-left: none;
  border-bottom: none;
}

.corner-bl {
  bottom: 20px;
  left: 20px;
  border-right: none;
  border-top: none;
}

.corner-br {
  bottom: 20px;
  right: 20px;
  border-left: none;
  border-top: none;
}

/* 响应式 */
@media (max-width: 640px) {
  .error-stats {
    gap: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 220px;
    justify-content: center;
  }
  
  .corner {
    width: 40px;
    height: 40px;
  }
}
</style>
