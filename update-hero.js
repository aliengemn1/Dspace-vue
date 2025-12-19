
const fs = require('fs');
const content = fs.readFileSync('src/components/home/HeroSection.vue', 'utf-8');
const updated = content
  .replace(/<div class="hero-background">[sS]*?</div>s*</div>/m, 
    '<div class="hero-background">
      <!-- Animated Gradient Background with Floating Elements -->
      <div class="hero-gradient"></div>
      <div class="hero-particles">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
      </div>
      <div class="hero-pattern"></div>
    </div>');
fs.writeFileSync('src/components/home/HeroSection.vue', updated);
console.log('Updated');
