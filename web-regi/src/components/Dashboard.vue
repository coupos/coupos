<template>
  <div>
    <div id="top">
      <h1>{{ user.name }}</h1>
      <p>{{ user.description }}</p>
    </div>

    <h2 class="title">クイックアクセス</h2>
    <div id="links">
      <div class="box" style="background-color: #FBA818;">
        <router-link to="/regi/sale">
          <div class="icon">
            <font-awesome-icon :icon="['fas', 'yen-sign']"></font-awesome-icon>
          </div>
          <span class="title">売上登録</span>
        </router-link>
      </div>
      <div class="box" style="background-color: #FBA818;">
        <router-link to="/regi/item">
          <div class="icon">
            <div class="item"></div>
          </div>
          <span class="title">商品管理</span>
        </router-link>
      </div>
      <div class="box" style="background-color: #FBA818;">
        <router-link to="/regi/coupon">
          <div class="icon">
            <div class="coupon"></div>
          </div>
          <span class="title">クーポン管理</span>
        </router-link>
      </div>
      <div class="box" style="background-color: #FBA818;">
        <router-link :to="{ name: 'StaffManager' }">
          <div class="icon">
            <font-awesome-icon :icon="['fas', 'users']"></font-awesome-icon>
          </div>
          <span class="title">スタッフ管理</span>
        </router-link>
      </div>
    </div>

    <h2 class="title">レジ状態</h2>
    <div id="staffs">
      <ul>
        <li v-for="staff in sortedStaffs" class="box" :class="staff.state" :key="staff.name">
          <span class="name">{{ staff.name }}</span>
          <div class="state">
            <span>{{ staffState[staff.state] }}</span>
          </div>
        </li>
      </ul>
      <div v-if="Object.keys(staffs).length < 1">
        スタッフがまだ追加されていません。
      </div>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'Dashboard',
  data () {
    return {
      user: {},
      staffs: {},
      loadedStaffs: false,
      staffState: {
        offline: 'オフライン',
        waiting: '待機中',
        typing: '会計中',
        closed: '休止中'
      }
    }
  },
  computed: {
    sortedStaffs () {
      let names = Object.keys(this.staffs).sort((a, b) => {
        if (this.staffs[a].state === 'offline') {
          if (this.staffs[b].state === 'offline') return 0
          else return 1
        } else if (this.staffs[b].state === 'offline') {
          return -1
        }
        return 0
      })

      let staffs = []
      names.forEach(name => {
        staffs.push({
          name,
          state: this.staffs[name].state
        })
      })
      return staffs
    }
  },
  created () {
    AwsUtil.get('CouposAPI', 'regi')
      .then(response => {
        console.log('ユーザー情報を取得 : ' + response.status)
        this.user = response.data
        if (response.data.force_change_password) {
          this.$router.push({ name: 'ChangePassword', query: { force: true } })
        }
        if (!response.data.name || response.data.name.length === 0) {
          this.$router.push({ name: 'FirstConfigure' })
        }
        if (this.user.description === null || this.user.description.length === 0) {
          this.user.description = 'ブース説明はありません。'
        }
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
    AwsUtil.get('CouposAPI', 'staffs')
      .then(response => {
        console.log('スタッフを取得 : ' + response.status)
        this.staffs = response.data
        this.loadedStaffs = true
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
  }
}
</script>

<style scoped>
#top h1 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #444;
  font-size: 2rem;
  line-height: 1.3em;
}
#top h1:empty {
  width: 10em;
  height: 1.3em;
  border-radius: 3px;

  background-color: #e2e2e2;
}
#top p {
  margin-bottom: 1rem;
  color: #888;
  font-size: 1rem;
  line-height: 1.5em;
}
#top p:empty {
  width: 50em;
  height: 1.5em;
  border-radius: 3px;

  background-color: #e2e2e2;
}

h2.title {
  display: inline-block;

  min-width: 20em;
  padding-left: 0.1em;
  margin: 0 0 0.4rem 0;
  /* border-bottom: 3px solid #FFA918; */

  color: #444;
  font-size: 1.5rem;
  line-height: 1.5em;
}

#links {
  display: grid;
  grid-template-columns: repeat(auto-fit, 150px);
  grid-auto-rows: 150px;
  grid-gap: 20px;
  justify-content: left;

  margin-bottom: 30px;
}
#links .box {
  width: 150px;
  height: 150px;
  border-radius: 5px;

  box-shadow: 0 1px 8px 0px rgba(0, 0, 0, .2);
}
#links a {
  display: block;

  width: 100%;
  height: 100%;
  padding: 0.5rem 0;

  text-align: center;
}
#links .icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: calc(150px - 3rem);

  font-size: 70px;
  color: #fff;
  transition: .3s;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
}
#links a:hover .icon {
  transform: scale(1.1);
}
#links .item {
  width: 70px;
  height: 70px;
  border-radius: 20%;

  background-color: #fff;
}
#links .coupon {
  width: 90px;
  height: 50px;
  border-radius: 2px;

  background-color: #fff;
}
#links .title {
  font-weight: bold;
  font-size: 1.3rem;
  line-height: 2rem;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

#staffs ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, 180px);
  grid-auto-rows: 130px;
  grid-gap: 10px;
  justify-content: left;
}
#staffs .box {
  position: relative;

  border: 3px solid #e0e0e0;
  border-radius: 3px;
}
#staffs .box .name {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: inline-block;

  padding: 0.7em 0 0.5em 0;

  font-weight: bold;
  font-size: 1.1rem;
  line-height: 1.5em;
  text-align: center;
}
#staffs .box .state {
  display: flex;
  align-items: center;

  width: 100%;
  height: 100%;
  padding-top: 1rem;

  text-align: center;
}
#staffs .box .state span {
  display: inline-block;

  width: 100%;

  font-weight: bold;
  font-size: 1.6rem;
}
#staffs .box.offline .state span {
  color: #aaa;
}
#staffs .box.waiting .state span {
  color: #3D77FF;
}
#staffs .box.typing .state span {
  color: #FBA818;
}
#staffs .box.closed .state span {
  color: #FF4747;
}

@media screen and (max-width:600px) {
  #links {
    grid-template-columns: repeat(auto-fit, 120px);
    grid-auto-rows: 120px;
    grid-gap: 10px;
    justify-content: center;
  }
  #links .box {
    width: 120px;
    height: 120px;
  }
  #links .icon {
    height: calc(120px - 3rem);

    font-size: 50px;
  }
  #links .item {
    width: 50px;
    height: 50px;
  }
  #links .coupon {
    width: 70px;
    height: 40px;
  }
  #links .title {
    font-size: 1.3rem;
  }

  #staffs ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, 120px);
    grid-auto-rows: 80px;
    grid-gap: 10px;
    justify-content: center;
  }
  #staffs .box .name {
    padding: 0.7em 0 0.5em 0;
  }
  #staffs .box .state {
    padding-top: 1.3rem;
  }
  #staffs .box .state span {
    font-size: 1.3rem;
  }
}
</style>
