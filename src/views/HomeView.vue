<script setup>
import HeroSection from '@/components/home/HeroSection.vue'
import StatisticsCards from '@/components/home/StatisticsCards.vue'
import RecentItems from '@/components/home/RecentItems.vue'
import MostViewed from '@/components/home/MostViewed.vue'
import FeaturedCollections from '@/components/home/FeaturedCollections.vue'
import BrowseSection from '@/components/home/BrowseSection.vue'
</script>

<template>
  <div class="home-view">
    <!-- Hero Section with Search -->
    <HeroSection />

    <!-- Statistics -->
    <StatisticsCards />

    <!-- Recent Additions -->
    <RecentItems />

    <!-- Most Viewed -->
    <MostViewed />

    <!-- Featured Collections -->
    <FeaturedCollections />

    <!-- Browse Options -->
    <BrowseSection />
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  min-height: 100vh;
}
</style>
