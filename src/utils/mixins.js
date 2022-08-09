import store from '@/store'

export const mixins = {
  methods: {
    checkPermission(key) {
      return !store.state.user.userInfo?.roles.points.includes(key)
    }
  }
}
