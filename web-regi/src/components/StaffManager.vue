<template>
  <div>
    <ErrorMessage ref="errorMessage"></ErrorMessage>
    <div class="flexbox">
      <div id="staff-list">
        <StaffList v-if="loadedStaffs" :staffs="staffs" @select="selectStaff($event)" @add="selectNew()"></StaffList>
        <div v-else class="loading">
          <font-awesome-icon :icon="['fas', 'spinner']" pulse></font-awesome-icon>
        </div>
      </div>
      <div id="manage-pane">
        <div v-if="manageState === 'notselected'" class="message">
          <h2 class="title">スタッフ</h2>
          <p>
            スタッフが選択されていません。<br />
            左のリストからスタッフを選択してください。
          </p>
        </div>
        <div v-else-if="manageState === 'add'" class="selected form">
          <h2 class="title">スタッフを追加</h2>
          <div class="props">
            <div class="name">
              <h4>スタッフ名</h4>
            </div>
            <div class="value staff-name">
              <input v-model="input.name" type="text" maxlength="30" />
            </div>
          </div>
          <div class="actions">
            <a class="button add" :class="{ 'disabled': !validateForm }" @click="validateForm && addStaff()">追加</a>
          </div>
        </div>
        <div v-else-if="manageState === 'selected'" class="selected form">
          <h2 class="title">スタッフを編集</h2>
          <div class="props">
            <div class="name">
              <h4>スタッフ名</h4>
            </div>
            <div class="value staff-name">
              {{ input.name }}
            </div>
            <div class="name">
              <h4>レジ状態</h4>
            </div>
            <div class="value state">
              <div class="select">
                <select v-model="input.state">
                  <option value="offline">オフライン</option>
                  <option value="waiting">待機中</option>
                  <option value="typing">会計中</option>
                  <option value="closed">休止中</option>
                </select>
                <font-awesome-icon class="down-arrow" :icon="['fas', 'caret-down']"></font-awesome-icon>
              </div>
            </div>
          </div>
          <div class="actions">
            <a class="button update" :class="{ 'disabled': !validateForm }" @click="updateStaff()">更新</a>
            <a class="button delete" @click="deleteStaff()">削除</a>
          </div>
        </div>
        <StaffManagerProcessDisplay v-else :state="manageState"></StaffManagerProcessDisplay>
      </div>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'
import ErrorMessage from './ErrorMessage'
import StaffList from './StaffList'
import StaffManagerProcessDisplay from './StaffManagerProcessDisplay'

export default {
  name: 'CouponManager',
  components: {
    ErrorMessage,
    StaffList,
    StaffManagerProcessDisplay
  },
  data () {
    return {
      staffs: {},
      loadedStaffs: false,
      manageState: 'notselected',
      input: {
        name: '',
        state: 'offline'
      }
    }
  },
  computed: {
    validateForm () {
      let message = this.manageState === 'adding' || this.manageState === 'updating'

      if (this.manageState === 'add') {
        if (this.input.name.length < 1) {
          if (message) this.$refs.errorMessage.pushMessage('クーポン名を入力してください')
          return false
        } else if (this.input.name.length > 30) {
          if (message) this.$refs.errorMessage.pushMessage('クーポン名は30文字以内で入力してください')
          return false
        }
      } else if (this.manageState === 'selected') {
        if ([ 'offline', 'waiting', 'typing', 'closed' ].indexOf(this.input.state) < 0) {
          if (message) this.$refs.errorMessage.pushMessage('レジ状態が不正です')
          return false
        }
      } else {
        return false
      }
      return true
    }
  },
  methods: {
    selectNew () {
      this.selectedCoupon = null
      this.input = {
        name: ''
      }

      this.manageState = 'add'
    },
    selectStaff (name) {
      if (!this.staffs[name]) {
        console.log('selectStaff()で不明なnameが呼ばれました : ' + name)
        return
      }

      this.selectedStaff = name
      this.input = {
        name,
        state: this.staffs[name].state
      }

      this.manageState = 'selected'
    },
    async addStaff () {
      this.manageState = 'adding'

      if (this.validateForm) {
        this.manageState = 'add'
        return
      }

      /* スタッフを追加 */
      await AwsUtil.post('CouposAPI', 'staffs', this.input)
        .then(response => {
          console.log('スタッフを追加 : ' + response.status)
          this.manageState = 'added'
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('登録に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'add'
        })

      /* クーポンリストを更新 */
      this.loadedStaffs = false
      AwsUtil.get('CouposAPI', 'staffs')
        .then(response => {
          console.log('スタッフを取得 : ' + response.status)
          this.staffs = response.data
          this.loadedStaffs = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async updateStaff () {
      this.manageState = 'updating'

      if (this.validateForm) {
        this.manageState = 'update'
        return
      }

      /* スタッフを更新 */
      await AwsUtil.put('CouposAPI', 'staffs/' + this.selectedStaff, this.input)
        .then(response => {
          console.log('スタッフを更新 : ' + response.status)
          this.manageState = 'updated'
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('登録に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'update'
        })

      /* クーポンリストを更新 */
      this.loadedStaffs = false
      AwsUtil.get('CouposAPI', 'staffs')
        .then(response => {
          console.log('スタッフを取得 : ' + response.status)
          this.staffs = response.data
          this.loadedStaffs = true
        })
        .catch(error => {
          console.log(JSON.stringify(error))
        })
    },
    async deleteStaff () {
      this.manageState = 'deleting'

      /* スタッフを追加 */
      await AwsUtil.del('CouposAPI', 'staffs/' + this.selectedStaff)
        .then(response => {
          console.log('スタッフを削除 : ' + response.status)
          this.manageState = 'deleted'
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          this.$refs.errorMessage.pushMessage('登録に失敗しました。しばらくしてからもう一度お試しください。')
          this.manageState = 'delete'
        })

      /* クーポンリストを更新 */
      this.loadedStaffs = false
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
  },
  created () {
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flexbox {
  margin: 1rem 0;
}

/* スタッフリスト */

#staff-list {
  flex: 1 1 0;
}

.loading {
  padding: 3rem;

  font-size: 3rem;
  text-align: center;
  color: #555;
}

/* 管理パネル */

#manage-pane {
  flex: 1 1 0;

  margin-left: 1rem;
}
#manage-pane h2 {
  width: 100%;
  padding: 0 0.5rem;
  margin-bottom: 1rem;

  font-size: 1.1rem;
  line-height: 2em;

  color: #fff;
  background-color: #555;
}
#manage-pane p.message {
  margin: 0 0.5rem;
  font-size: 1rem;
}
.form .props {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-auto-rows: minmax(2.5rem, auto);
  grid-gap: 0.7rem;

  margin-top: 0.5rem;
}
.form .props div.name {
  display: flex;
  align-items: center;
}
.form .props div.name h4 {
  font-weight: bold;
  font-size: 1rem;
  line-height: 1.4rem;
}
.form .props div.value {
  display: flex;
  align-items: center;
}
.form .select {
  position: relative;
}
.form .select select {
  padding: 0 1.5rem 0 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 2rem;
}
.form .select .down-arrow {
  position: absolute;
  top: 0;
  right: 0.5rem;

  height: 2rem;

  font-size: 1rem;
  pointer-events: none;
}
.form input {
  width: 4rem;
  border: 1px solid #ccc;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 2rem;
}
.form input[type="text"] {
  width: 5rem;
  padding: 0 0.5rem;
}
.form input[disabled] {
  color: #999;
}
.form .props div.staff-name input {
  width: 20rem;

  text-align: left;
}
.form .actions {
  margin: 1.2rem 0 0 0;

  text-align: center;
}
.form .button.add {
  margin: 0;
  padding-left: 5rem;
  padding-right: 5rem;

  background-color: hsl(0, 100%, 63%);
  box-shadow: 0 3px 0 hsl(0, 100%, 38%);
}
.form .button.add:hover {
  background-color: hsl(0, 100%, 66%);
  box-shadow: 0 3px 0 hsl(0, 100%, 43%);
}
.form .button.add:active {
  box-shadow: none;
}
.form .button.update {
  margin: 0 1rem 0 0;
  padding-left: 5rem;
  padding-right: 5rem;

  background-color: hsl(38, 96%, 53%);
  box-shadow: 0 3px 0 hsl(38, 96%, 38%);
}
.form .button.update:hover {
  background-color: hsl(38, 96%, 60%);
  box-shadow: 0 3px 0 hsl(38, 96%, 43%);
}
.form .button.update:active {
  box-shadow: none;
}
.form .button.delete {
  margin: 0;
  padding-left: 1.5rem;
  padding-right: 1.5rem;

  background-color: hsl(222, 100%, 61%);
  box-shadow: 0 3px 0 hsl(222, 100%, 46%);
}
.form .button.delete:hover {
  background-color: hsl(222, 100%, 66%);
  box-shadow: 0 3px 0 hsl(222, 100%, 51%);
}
.form .button.delete:active {
  box-shadow: none;
}
.form .button.disabled {
  background-color: hsl(0, 0%, 72%);
  box-shadow: 0 3px 0 hsl(0, 0%, 52%);
  cursor: default;
}
.form .button.disabled:hover {
  background-color: hsl(0, 0%, 72%);
  box-shadow: 0 3px 0 hsl(0, 0%, 52%);
}
.form .button.disabled:active {
  top: 0;
}

@media screen and (max-width:600px) {
  .flexbox {
    display: block;
  }

  #manage-pane {
    margin-left: 0;
    margin-top: 1rem;
    border-top: 1px solid #ccc;
    padding-top: 1rem;
  }
}
</style>
