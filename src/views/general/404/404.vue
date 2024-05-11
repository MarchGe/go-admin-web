<template>
<div class="container">
  <div class="status">404</div>
  <div class="hint">抱歉，访问的页面不存在 ~ ~</div>
  <div class="blank"></div>
</div>
</template>

<style scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.status {
  font-size: 80px;
  font-weight: bold;
  color: #d4d4d4;
}
.hint {
  color: #a8a8a8;
}

.blank {
  height: 30%;
}
</style>