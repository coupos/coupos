<template>
  <div :class="{ 'processing': !stateProps.completed, 'completed': stateProps.completed }">
    <h2 class="title">{{ stateProps.title }}</h2>
    <div class="icon">
      <div class="circle">
        <font-awesome-icon :icon="['fas', stateProps.icon]" :spin="!stateProps.completed"></font-awesome-icon>
      </div>
    </div>
    <h3>{{ stateProps.message }}</h3>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    state: String
  },
  computed: {
    stateProps () {
      if (this.state === 'adding') {
        return {
          title: 'スタッフを追加',
          message: '追加しています...',
          icon: 'sync',
          completed: false
        }
      } else if (this.state === 'updating') {
        return {
          title: 'スタッフを更新',
          message: '更新しています...',
          icon: 'sync',
          completed: false
        }
      } else if (this.state === 'deleting') {
        return {
          title: 'スタッフを削除',
          message: '削除しています...',
          icon: 'sync',
          completed: false
        }
      } else if (this.state === 'added') {
        return {
          title: 'スタッフを追加',
          message: '追加しました',
          icon: 'check',
          completed: true
        }
      } else if (this.state === 'updated') {
        return {
          title: 'スタッフを更新',
          message: '更新しました',
          icon: 'check',
          completed: true
        }
      } else if (this.state === 'deleted') {
        return {
          title: 'スタッフを削除',
          message: '削除しました',
          icon: 'check',
          completed: true
        }
      } else {
        return {
          title: undefined,
          message: undefined,
          icon: 'check',
          completed: true
        }
      }
    }
  }
}
</script>

<style scoped>
h2 {
  width: 100%;
  padding: 0 0.5rem;
  margin-bottom: 1rem;

  font-size: 1.1rem;
  line-height: 2em;

  color: #fff;
  background-color: #555;
}

.icon .circle {
  width: 100px;
  height: 100px;
  margin: 2rem auto 1rem auto;
  border-radius: 50%;

  font-size: 50px;
  color: #fff;
  background-color: #FCA919;
  text-align: center;
}
.circle svg {
  margin: 25px;
}
h3 {
  margin-top: 1rem;

  font-weight: normal;
  font-size: 1.4rem;
  text-align: center;
}
</style>
