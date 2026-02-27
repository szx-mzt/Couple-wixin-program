# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

# Couple-wixin-program
<img width="1470" height="920" alt="image" src="https://github.com/user-attachments/assets/1f13e585-0aec-410a-b45f-0568d198f995" />
<img width="1470" height="920" alt="image" src="https://github.com/user-attachments/assets/9277a867-1d39-4d84-8640-86424a00855f" />
<img width="1470" height="920" alt="image" src="https://github.com/user-attachments/assets/cf1226e1-52ea-41c3-9b33-86cfc1259779" />
<img width="1470" height="920" alt="image" src="https://github.com/user-attachments/assets/f36cc00e-6ddb-4f39-afb7-e99ea7455d09" />
<img width="1470" height="920" alt="image" src="https://github.com/user-attachments/assets/f2567709-955a-4c13-bb98-1a0abc735a38" />

## 构建 npm、上传云函数

<img width="1469" height="955" alt="image" src="https://github.com/user-attachments/assets/bb3c1b18-806a-4a8b-af56-444597fa3837" />
<img width="1470" height="920" alt="image" src="https://github.com/user-attachments/assets/38d497e2-beb3-49c9-b7bf-a242baa29b0a" />
<img width="1470" height="920" alt="image" src="https://github.com/user-attachments/assets/c2ce80a6-56e7-46b1-b71f-0fd2bebb52c5" />

## 点击本地调试跑通数据

<img width="1470" height="920" alt="image" src="https://github.com/user-attachments/assets/06c24ab7-0abf-43d4-b254-1352763c33ae" />


# 消息订阅推送

<img width="349" height="762" alt="image" src="https://github.com/user-attachments/assets/a6960460-ab66-43a1-9d5e-f31d390ef278" />
<img width="1920" height="959" alt="image" src="https://github.com/user-attachments/assets/6ad95a45-3dcf-4859-ae1b-7a09e82d44f9" />

## 核心代码

``` vue
// 用户点击“发布”按钮，先请求订阅授权，再发布
  onPublishTap() {
    const templateId = '6yV5bqlNF3WbJy6ZeOcMJ_s2bieU2f9NWGubvfLiCXY';
    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (subRes) => {
        console.log('订阅消息授权结果', subRes);
        this.handlePublish(subRes[templateId] === 'accept', templateId);
      },
      fail: (err) => {
        console.error('订阅消息授权失败', err);
        this.handlePublish(false, templateId);
      }
    });
  },

  // 发布日常（可选推送订阅消息）
  async handlePublish(shouldSendMsg, templateId) {
    wx.showLoading({ title: '发布中...' });
      const res = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: 发布云函数接口传参
      });
      wx.hideLoading();

      if (res.result.success) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        // ====== 订阅消息推送逻辑 ======
        if (shouldSendMsg && templateId) {
          const openIds = ['ounUN5p0KPTKPA9Kwxxxxxxxxx', 'ounUN5oG_SiY37Nb0AMvxxxxxxxxxx'];
          console.log('准备发送订阅消息给 openIds:', openIds);
          openIds.forEach(openid => {
            wx.cloud.callFunction({
              name: 'quickstartFunctions',
              data: {
                type: 'sendSubscribeMessage',
                templateId,
                touser: openid,
                data: {
                  thing1: { value: '发布人' },
                  thing2: { value: '有新内容发布' },
                  thing5: { value: '请及时查看' },
                  time3: { value: Time.format(new Date(), 'YYYY-MM-DD HH:mm:ss') }
                }
              },
              success: (v) => {
                console.log('订阅消息发送成功', openid, v);
              },
              fail: (err) => {
                console.error('订阅消息发送失败', openid, err);
              }
            });
          });
        }
        // ====== END ======
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/index/index',
            parameters: { refresh: true }
          });
        }, 1500);
      } else {
        wx.showToast({ title: '发布失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('发布失败', err);
      wx.showToast({ title: '发布失败', icon: 'none' });
    }
  },
```

<img width="980" height="890" alt="image" src="https://github.com/user-attachments/assets/6e46a9e4-0ee9-4a49-bf71-a6d95ea0c6bb" />
<img width="958" height="889" alt="image" src="https://github.com/user-attachments/assets/8c224d9c-0df6-4b38-b045-7fe627f57839" />
<img width="1470" height="920" alt="image" src="https://github.com/user-attachments/assets/96a43aca-9828-4b81-a474-bbfd38af5493" />


