import { getOpenId, getUserInfo } from '../../utils/user'

Page({
  data: {
    openid: '',
    userInfo: null
  },

  async onLoad() {
    // 方式1: 只获取 openid
    const openid = await getOpenId()
    this.setData({ openid })
    
    // 方式2: 获取完整用户信息
    const userInfo = await getUserInfo()
    this.setData({ userInfo })
  }
})
