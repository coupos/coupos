import Vue from 'vue'
import Router from 'vue-router'
import * as AwsUtil from '@/utils/AwsUtil'
import PublicMain from '@/components/PublicMain'
import Top from '@/components/Top'
import CouponViewer from '@/components/CouponViewer'
import MapViewer from '@/components/MapViewer'
import RegiMain from '@/components/RegiMain'
import Dashboard from '@/components/Dashboard'
import SignIn from '@/components/SignIn'
import SignUp from '@/components/SignUp'
import SignUpComplete from '@/components/SignUpComplete'
import ChangePassword from '@/components/ChangePassword'
import ChangePasswordComplete from '@/components/ChangePasswordComplete'
import ForgotPassword from '@/components/ForgotPassword'
import ForgotPasswordComplete from '@/components/ForgotPasswordComplete'
import ResetPassword from '@/components/ResetPassword'
import ResetPasswordComplete from '@/components/ResetPasswordComplete'
import Verify from '@/components/Verify'
import FirstConfigure from '@/components/FirstConfigure'
import Configure from '@/components/Configure'
import SignOut from '@/components/SignOut'
import Sale from '@/components/Sale'
import ItemManager from '@/components/ItemManager'
import CouponManager from '@/components/CouponManager'
import StaffManager from '@/components/StaffManager'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: PublicMain,
      children: [
        {
          path: '',
          name: 'Top',
          component: Top
        },
        {
          path: 'coupons/:id',
          name: 'CouponViewer',
          component: CouponViewer
        },
        {
          path: 'maps/:id',
          name: 'MapViewer',
          component: MapViewer
        }
      ]
    },
    {
      path: '/regi',
      component: RegiMain,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: Dashboard,
          beforeEnter: (to, from, next) => {
            AwsUtil.currentAuthenticatedUser()
              .then(user => next())
              .catch(() => next({ name: 'SignIn' }))
          }
        },
        {
          path: 'signin',
          name: 'SignIn',
          component: SignIn,
          beforeEnter: (to, from, next) => {
            AwsUtil.currentAuthenticatedUser()
              .then(user => next({ name: 'Dashboard' }))
              .catch(() => next())
          }
        },
        {
          path: 'signout',
          name: 'SignOut',
          component: SignOut,
          beforeEnter: (to, from, next) => {
            AwsUtil.currentAuthenticatedUser()
              .then(user => next())
              .catch(() => next({ name: 'SignIn' }))
          }
        },
        {
          path: 'signup/complete',
          name: 'SignUpComplete',
          component: SignUpComplete
        },
        {
          path: 'signup/verify',
          name: 'Verify',
          component: Verify
        },
        {
          path: 'signup/config',
          name: 'FirstConfigure',
          component: FirstConfigure,
          beforeEnter: (to, from, next) => {
            AwsUtil.currentAuthenticatedUser()
              .then(user => next())
              .catch(() => next({ name: 'SignIn' }))
          }
        },
        {
          path: 'signup',
          name: 'SignUp',
          component: SignUp
        },
        {
          path: 'changepassword/complete',
          name: 'ChangePasswordComplete',
          component: ChangePasswordComplete
        },
        {
          path: 'changepassword',
          name: 'ChangePassword',
          component: ChangePassword
        },
        {
          path: 'fotgotpassword/complete',
          name: 'ForgotPasswordComplete',
          component: ForgotPasswordComplete
        },
        {
          path: 'fotgotpassword',
          name: 'ForgotPassword',
          component: ForgotPassword
        },
        {
          path: 'resetpassword/complete',
          name: 'ResetPasswordComplete',
          component: ResetPasswordComplete
        },
        {
          path: 'resetpassword',
          name: 'ResetPassword',
          component: ResetPassword
        },
        {
          path: 'config',
          name: 'Configure',
          component: Configure,
          beforeEnter: (to, from, next) => {
            AwsUtil.currentAuthenticatedUser()
              .then(user => next())
              .catch(() => next({ name: 'SignIn' }))
          }
        },
        {
          path: 'sale',
          name: 'Sale',
          component: Sale,
          beforeEnter: (to, from, next) => {
            AwsUtil.currentAuthenticatedUser()
              .then(user => next())
              .catch(() => next({ name: 'SignIn' }))
          }
        },
        {
          path: 'item',
          name: 'ItemManager',
          component: ItemManager,
          beforeEnter: (to, from, next) => {
            AwsUtil.currentAuthenticatedUser()
              .then(user => next())
              .catch(() => next({ name: 'SignIn' }))
          }
        },
        {
          path: 'coupon',
          name: 'CouponManager',
          component: CouponManager,
          beforeEnter: (to, from, next) => {
            AwsUtil.currentAuthenticatedUser()
              .then(user => next())
              .catch(() => next({ name: 'SignIn' }))
          }
        },
        {
          path: 'staff',
          name: 'StaffManager',
          component: StaffManager,
          beforeEnter: (to, from, next) => {
            AwsUtil.currentAuthenticatedUser()
              .then(user => next())
              .catch(() => next({ name: 'SignIn' }))
          }
        }
      ]
    },
    {
      path: '*',
      name: 'Default',
      redirect: { name: 'Top' }
    }
  ]
})
