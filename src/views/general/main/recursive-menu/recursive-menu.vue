<template>
  <template v-for="item in items" :key="item.id">
    <el-menu-item v-if="(!item[recursiveAttribute] || item[recursiveAttribute].length === 0) && item.display === 1" :index="item.id + ''" @click="triggerClick" style="position: relative;">
      <el-icon><i :class="'iconfont icon-' + item.icon"></i></el-icon>
      <span class="menu">{{item.name}}</span>
    </el-menu-item>
    <el-sub-menu v-else-if="item.display === 1" :index="item.id + ''">
      <template #title>
        <el-icon><i :class="'iconfont icon-' + item.icon"></i></el-icon>
        <span class="menu">{{item.name}}</span>
      </template>
      <recursive-menu :items="item[recursiveAttribute]" :recursive-attribute="recursiveAttribute" @click="triggerClick"></recursive-menu> <!--这里的@click是emits中定义的事件，和上面的@click含义不一样-->
    </el-sub-menu>
  </template>
</template>

<script>
export default {
  name: "recursive-menu",
  emits: ["click"],
  props: {
    items: {
      type: Array,
      required: true
    },
    recursiveAttribute: {
      type: String,
      required: true
    }
  },
  methods: {
    triggerClick(e) {
      this.$emit("click", e)
    }
  }
}
</script>