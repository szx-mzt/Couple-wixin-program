const cloud = require("wx-server-sdk");
const Time = require('./util/dateTime');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 获取openid
const getOpenId = async () => {
  // 获取基础信息
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 获取小程序二维码
const getMiniProgramCode = async () => {
  // 获取小程序二维码的buffer
  const resp = await cloud.openapi.wxacode.get({
    path: "pages/index/index",
  });
  const { buffer } = resp;
  // 将图片上传云存储空间
  const upload = await cloud.uploadFile({
    cloudPath: "code.png",
    fileContent: buffer,
  });
  return upload.fileID;
};

// ==================== 用户信息表 CRUD ====================
// 创建/更新用户信息
const createOrUpdateUser = async (event) => {
  const wxContext = cloud.getWXContext();
  const { gender, coupleId, partnerOpenid } = event;
  
  try {
    // 查询用户是否已存在
    const userRes = await db.collection('user').where({
      openid: wxContext.OPENID
    }).get();
    
    if (userRes.data.length > 0) {
      // 更新用户信息
      await db.collection('user').doc(userRes.data[0]._id).update({
        data: {
          gender,
          coupleId,
          partnerOpenid,
          updateTime: Time.now() // 使用时间工具获取当前时间
        }
      });
      return { success: true, message: '用户信息更新成功' };
    } else {
      // 创建新用户
      await db.collection('user').add({
        data: {
          openid: wxContext.OPENID,
          gender,
          coupleId,
          partnerOpenid,
          createTime: Time.now(),
          updateTime: Time.now()
        }
      });
      return { success: true, message: '用户创建成功' };
    }
  } catch (err) {
    return { success: false, error: err };
  }
};

// 获取用户信息
const getUser = async () => {
  console.log("getUser called");
  const wxContext = cloud.getWXContext();
  try {
    const res = await db.collection('user').where({
      openid: wxContext.OPENID
    }).get();
    return { success: true, data: res.data[0] || null };
  } catch (err) {
    return { success: false, error: err };
  }
};

// ==================== 情侣日常记录表 CRUD ====================
// 创建日常记录
const createDaily = async (event) => {
  const wxContext = cloud.getWXContext();
  const { coupleId, content, imgList, videoUrl, videoCover, location, tags } = event;
  try {
    await db.collection('daily').add({
      data: {
        coupleId,
        authorOpenid: wxContext.OPENID,
        content: content || '',
        imgList: imgList || [],
        videoUrl: videoUrl || '',
        videoCover: videoCover || '',
        location: location || '',
        isTop: false,
        createTime: Time.now(),
        updateTime: Time.now(),
        tags: tags || []
      }
    });
    return { success: true, message: '日常记录创建成功' };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 获取日常记录列表
const getDailyList = async (event) => {
  const { page = 1, pageSize = 10 } = event;
  try {
    const res = await db.collection('daily')
      .orderBy('isTop', 'desc')
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 更新日常记录
const updateDaily = async (event) => {
  const { _id, content, imgList, videoUrl, videoCover, location, tags } = event;
  try {
    await db.collection('daily').doc(_id).update({
      data: {
        content,
        imgList,
        videoUrl,
        videoCover,
        location,
        tags,
        updateTime: Time.now()
      }
    });
    return { success: true, message: '日常记录更新成功' };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 删除日常记录
const deleteDaily = async (event) => {
  const { _id } = event;
  try {
    await db.collection('daily').doc(_id).remove();
    return { success: true, message: '日常记录删除成功' };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 置顶/取消置顶日常
const toggleTopDaily = async (event) => {
  const { _id, isTop } = event;
  try {
    await db.collection('daily').doc(_id).update({
      data: { isTop, updateTime: Time.now() }
    });
    return { success: true, message: '操作成功' };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 头像上传（返回可访问 URL）
const uploadAvatar = async (event) => {
  const { filePath } = event;
  if (!filePath) return { success: false, error: 'filePath is required' };

  const basePath = '636c-cloud1-5g9hjld9cb8fe986-1310518816/image';
  const ext = (filePath.split('.').pop() || 'png').toLowerCase();
  const cloudPath = `${basePath}/avatar_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const uploadRes = await cloud.uploadFile({
      cloudPath,
      filePath
    });

    const tempRes = await cloud.getTempFileURL({
      fileList: [uploadRes.fileID]
    });

    const url = tempRes?.fileList?.[0]?.tempFileURL || '';
    return { success: true, url, fileID: uploadRes.fileID };
  } catch (err) {
    return { success: false, error: err };
  }
};

// ==================== 订阅消息推送 ====================

// 订阅消息推送
const sendSubscribeMessage = async (event) => {
  const { openIds, templateId, content } = event

    // 获取基础信息
    const wxContext = cloud.getWXContext()
    // 获取当前用户 openid
    const OPENID = wxContext.OPENID

    const tasks = openIds.map(openid => {

      return cloud.openapi.subscribeMessage.send({
        touser: openid,
        template_id: templateId,
        miniprogram_state: 'trial', // developer 为开发版；trial 为体验版；formal 为正式版；默认为正式版
        page: 'pages/index/index',
        data: {
          thing1: {
            value: OPENID === 'ounUN5p0KPTKPA9KwPVg2eYL3XvY'
              ? '老公'
              : '老婆'
          },
          thing2: {
            value: content.slice(0, 20) || '有新内容发布'
          },
          thing5: {
            value: '请及时查看'
          },
          time3: {
            value: Time.format(Time.now(),'YYYY-MM-DD HH:mm:ss')
          }
        }
      })
    })
    // ⭐ 不让单个失败影响整体
    const result = await Promise.allSettled(tasks)

    return result
};

// ==================== 云函数入口 ====================
exports.main = async (event, context) => {
  const { type } = event;
  
  switch (type) {
    // 用户相关
    case 'getOpenId':
      return await getOpenId();
    case 'createOrUpdateUser':
      return await createOrUpdateUser(event);
    case 'getUser':
      return await getUser();
    case 'unbindCouple':
      return await unbindCouple();
    case 'bindPartner':
      return await bindPartner(event);
    
    // 日常记录相关
    case 'createDaily':
      return await createDaily(event);
    case 'getDailyList':
      return await getDailyList(event);
    case 'updateDaily':
      return await updateDaily(event);
    case 'deleteDaily':
      return await deleteDaily(event);
    case 'toggleTopDaily':
      return await toggleTopDaily(event);

    // 消息推送
    case 'sendSubscribeMessage':
      return await sendSubscribeMessage(event);
    
    // 其他
    case 'getMiniProgramCode':
      return await getMiniProgramCode();
    case 'uploadAvatar':
      return await uploadAvatar(event);
    
    default:
      return { success: false, error: '未知的操作类型' };
  }
};
