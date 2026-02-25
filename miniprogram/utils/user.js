/**
 * 获取用户 openid
 * @returns {Promise<string>} openid
 */
export async function getOpenId() {
  try {
    const res = await wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: { type: 'getOpenId' }
    })
    return res.result.openid
  } catch (err) {
    console.error('获取 openid 失败', err)
    throw err
  }
}

/**
 * 获取用户完整信息
 * @returns {Promise<object>} 用户信息对象
 */
export async function getUserInfo() {
  try {
    // 先获取 openid
    const openid = await getOpenId()
    
    // 再获取用户详细信息
    const res = await wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: { type: 'getUser' }
    })
    
    return {
      openid,
      ...res.result.data
    }
  } catch (err) {
    console.error('获取用户信息失败', err)
    throw err
  }
}
