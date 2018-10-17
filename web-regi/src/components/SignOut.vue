<template>
  <div>
    <p>サインアウト中です。まもなくリダイレクトします。</p>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'SignOut',
  created () {
    AwsUtil.signOut()
      .then(() => {
        console.log('サインアウト')
        this.$parent.signedin = false
        this.$router.push({ name: 'SignIn' })
      })
      .catch(err => {
        console.log(err)
      })
  }
}
</script>

<style scoped>
</style>
