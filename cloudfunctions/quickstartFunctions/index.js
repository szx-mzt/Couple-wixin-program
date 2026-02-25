const cloud = require("wx-server-sdk");
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
  const now = new Date().toLocaleString('zh-CN', { hour12: false });
  
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
          updateTime: now
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
          createTime: now,
          updateTime: now
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

// 获取情侣信息（双方）
const getCoupleInfo = async (event) => {
  const { coupleId } = event;
  try {
    const res = await db.collection('user').where({
      coupleId
    }).get();
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 解除情侣关系
const unbindCouple = async () => {
  const wxContext = cloud.getWXContext();
  try {
    const userRes = await db.collection('user').where({
      openid: wxContext.OPENID
    }).get();
    
    if (userRes.data.length > 0) {
      await db.collection('user').doc(userRes.data[0]._id).update({
        data: {
          coupleId: '',
          partnerOpenid: '',
          updateTime: new Date().toLocaleString('zh-CN', { hour12: false })
        }
      });
      return { success: true, message: '已解除情侣关系' };
    }
    return { success: false, message: '用户不存在' };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 绑定情侣（对方确认）
const bindPartner = async (event) => {
  const { partnerOpenid, coupleId, myOpenid } = event;
  try {
    // 查询对方用户
    const partnerRes = await db.collection('user').where({
      openid: partnerOpenid
    }).get();
    
    if (partnerRes.data.length > 0) {
      // 更新对方的情侣信息
      await db.collection('user').doc(partnerRes.data[0]._id).update({
        data: {
          coupleId,
          partnerOpenid: myOpenid,
          updateTime: new Date().toLocaleString('zh-CN', { hour12: false })
        }
      });
      
      // 创建情侣设置（如果不存在）
      const settingRes = await db.collection('setting').where({
        coupleId
      }).get();
      
      if (settingRes.data.length === 0) {
        await db.collection('setting').add({
          data: {
            coupleId,
            coupleName: '我们',
            bgUrl: '',
            isPrivate: true,
            loveStartDate: new Date().toLocaleDateString('zh-CN')
          }
        });
      }
      
      return { success: true, message: '绑定成功' };
    }
    return { success: false, message: '对方用户不存在' };
  } catch (err) {
    return { success: false, error: err };
  }
};

// ==================== 情侣日常记录表 CRUD ====================
// 创建日常记录
const createDaily = async (event) => {
  const wxContext = cloud.getWXContext();
  const { coupleId, content, imgList, videoUrl, videoCover, location, tags } = event;
  const now = new Date().toLocaleString('zh-CN', { hour12: false });
  
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
        createTime: now,
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
        tags
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
      data: { isTop }
    });
    return { success: true, message: '操作成功' };
  } catch (err) {
    return { success: false, error: err };
  }
};

// ==================== 纪念日表 CRUD ====================
// 创建纪念日
const createMemorial = async (event) => {
  const { coupleId, title, date, type, isRepeat, remark } = event;
  try {
    await db.collection('memorial').add({
      data: {
        coupleId,
        title,
        date,
        type,
        isRepeat: isRepeat !== undefined ? isRepeat : false,
        remark: remark || ''
      }
    });
    return { success: true, message: '纪念日创建成功' };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 获取纪念日列表
const getMemorialList = async (event) => {
  const { coupleId } = event;
  try {
    const res = await db.collection('memorial')
      .where({ coupleId })
      .orderBy('date', 'asc')
      .get();
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 更新纪念日
const updateMemorial = async (event) => {
  const { _id, title, date, type, isRepeat, remark } = event;
  try {
    await db.collection('memorial').doc(_id).update({
      data: { title, date, type, isRepeat, remark }
    });
    return { success: true, message: '纪念日更新成功' };
  } catch (err) {
    return { success: false, error: err };
  }
};

// 删除纪念日
const deleteMemorial = async (event) => {
  const { _id } = event;
  try {
    await db.collection('memorial').doc(_id).remove();
    return { success: true, message: '纪念日删除成功' };
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
    case 'getCoupleInfo':
      return await getCoupleInfo(event);
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
    
    // 纪念日相关
    case 'createMemorial':
      return await createMemorial(event);
    case 'getMemorialList':
      return await getMemorialList(event);
    case 'updateMemorial':
      return await updateMemorial(event);
    case 'deleteMemorial':
      return await deleteMemorial(event);
    
    // ...existing code...
    
    // 其他
    case 'getMiniProgramCode':
      return await getMiniProgramCode();
    case 'uploadAvatar':
      return await uploadAvatar(event);
    
    default:
      return { success: false, error: '未知的操作类型' };
  }
};
