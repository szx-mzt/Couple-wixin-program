import { Time } from "../../utils/dateTime"
Page({
  data: {
    statusBarHeight: 0,
    content: '',
    imgList: [],
    videoUrl: '',
    videoCover: '',
    selectedTags: [], // 已选中的标签
    tagOptions: ['约会', '美食', '旅行', '日常', '纪念日', '礼物', '电影', '运动', '其他'], // 可选标签
    location: '',
    userInfo: {},
  },
  // 输入内容同步
  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },
    // 地点输入
  onLocationInput(e) {
    this.setData({ location: e.detail.value });
  },
  // 获取用户信息
  async getUserInfo() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: { type: 'getUser' }
      });
      if (res.result.success && res.result.data) {
        this.setData({ userInfo: res.result.data });
      }
    } catch (err) {
      console.error('获取用户信息失败', err);
    }
  },
  onLoad(options) {
    // 编辑模式回显
    if (options && options.edit && options.cardData) {
      try {
        const card = JSON.parse(decodeURIComponent(options.cardData));
        this.setData({
          isEdit: true,
          editId: card._id,
          content: card.content || '',
          imgList: card.imgList || [],
          videoUrl: card.videoUrl || '',
          videoCover: card.videoCover || '',
          location: card.location || '',
          selectedTags: card.tags || []
        });
      } catch (e) {
        wx.showToast({ title: '数据解析失败', icon: 'none' });
      }
    }
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    this.getUserInfo();
  },

  // 用户点击“发布”按钮，先请求订阅授权，再发布
  onPublishTap() {
    const templateId = '6yV5bqlNF3WbJy6ZeOcMJ_s2bieU2f9NWGxxxxxxx'; // 替换为实际的订阅消息模板 ID
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
    try {
      let cloudType = 'createDaily';
      let cloudData = {
        type: '',
        content: this.data.content.trim(),
        imgList: this.data.imgList,
        videoUrl: this.data.videoUrl,
        videoCover: this.data.videoCover,
        location: this.data.location.trim(),
        tags: this.data.selectedTags
      };
      if (this.data.isEdit && this.data.editId) {
        cloudType = 'updateDaily';
        cloudData.type = 'updateDaily';
        cloudData._id = this.data.editId;
      } else {
        cloudData.type = 'createDaily';
      }
      const res = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: cloudData
      });
      wx.hideLoading();

      if (res.result.success) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        // ====== 订阅消息推送逻辑 ======
        if (shouldSendMsg && templateId) {
          const openIds = ['ounUN5p0KPTKPA9KwPVgxxxxxxx', 'ounUN5oG_SiY37Nb0AMvxxxxxxxx']; // 替换为实际的 openid 列表
          console.log('准备发送订阅消息给 openIds:', openIds);
          openIds.forEach(openid => {
            wx.cloud.callFunction({
              name: 'quickstartFunctions',
              data: {
                type: 'sendSubscribeMessage',
                templateId,
                touser: openid,
                data: {
                  thing1: { value: openid === 'ounUN5p0KPTKPA9KwPVgxxxxxxxx' ? '老公' : '老婆' },
                  thing2: { value: this.data.content.slice(0, 20) || '有新内容发布' },
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

  // 选择图片或视频
  chooseImage() {
    wx.showActionSheet({
      itemList: ['从相册选择', '拍摄'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.chooseImage({
            count: 9 - this.data.imgList.length,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success: (imgRes) => {
              console.log('选择图片', imgRes);
              this.handleMediaFiles(imgRes.tempFilePaths.map(path => ({ fileType: 'image', tempFilePath: path })));
            }
          });
        } else if (res.tapIndex === 1) {
          wx.chooseVideo({
            sourceType: ['camera'],
            compressed: true,
            success: (videoRes) => {
              this.handleMediaFiles([{ fileType: 'video', tempFilePath: videoRes.tempFilePath }]);
            }
          });
        }
      }
    });
  },

  // 处理媒体文件
  async handleMediaFiles(files) {
    wx.showLoading({ title: '上传中...' });

    for (let file of files) {
      console.log('处理文件', file);
      if (file.fileType === 'image') {
        await this.uploadImage(file.tempFilePath);
      } else if (file.fileType === 'video') {
        await this.uploadVideo(file.tempFilePath);
        break; // 只允许上传一个视频
      }
    }

    wx.hideLoading();
  },

  // 上传图片
  async uploadImage(filePath) {
    try {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const cloudPath = `daily/img/${timestamp}_${random}.jpg`;

      const res = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      });
      console.log('上传图片',res)
      const imgList = [...this.data.imgList, res.fileID];
      this.setData({ imgList });

      return res.fileID;
    } catch (err) {
      console.error('图片上传失败', err);
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  // 上传视频
  async uploadVideo(filePath) {
    try {
      const timestamp = Date.now();
      const cloudPath = `daily/video/${timestamp}.mp4`;

      // 上传视频
      const videoRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      });

      // 生成封面（截取首帧）
      const coverPath = await this.generateVideoCover(filePath);
      const coverCloudPath = `daily/cover/${timestamp}.jpg`;

      const coverRes = await wx.cloud.uploadFile({
        cloudPath: coverCloudPath,
        filePath: coverPath
      });

      this.setData({
        videoUrl: videoRes.fileID,
        videoCover: coverRes.fileID
      });

      wx.showToast({ title: '视频上传成功', icon: 'success' });
    } catch (err) {
      console.error('视频上传失败', err);
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  // 生成视频封面
  generateVideoCover(videoPath) {
    return new Promise((resolve) => {
      const ctx = wx.createVideoContext('temp-video');
      // 简化处理：直接返回视频路径作为封面
      // 实际项目中需要使用 canvas 截取视频首帧
      resolve(videoPath);
    });
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset;
    wx.previewImage({
      urls: this.data.imgList,
      current: this.data.imgList[index]
    });
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const imgList = this.data.imgList.filter((_, i) => i !== index);
    this.setData({ imgList });
  },

  // 删除视频
  deleteVideo() {
    this.setData({
      videoUrl: '',
      videoCover: ''
    });
  },

  // 切换标签
  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    let selectedTags = [...this.data.selectedTags]

    const index = selectedTags.indexOf(tag)
    if (index > -1) {
      // 已选中，则取消选中
      selectedTags.splice(index, 1)
    } else {
      // 未选中，则添加选中
      selectedTags.push(tag)
    }

    this.setData({
      selectedTags
    })
    console.log('已选标签：', this.data.selectedTags)
  },

  // 返回
  goBack() {
    if (this.data.content || this.data.imgList.length > 0 || this.data.videoUrl) {
      wx.showModal({
        title: '提示',
        content: '内容尚未发布，确定要返回吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  }
});
