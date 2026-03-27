/**
 * 谢霆锋成都演唱会开票搜索技能 - 初始化模块
 * 提供定时任务配置和技能注册功能
 */

const path = require('path');
const fs = require('fs').promises;

// 技能元数据
const SKILL_METADATA = {
  name: 'xietingfeng-concert',
  description: '谢霆锋2026成都进化演唱会开票搜索技能',
  version: '1.0.0',
  author: 'OpenClaw',
  created: '2026-03-26',
  lastUpdated: '2026-03-26',
  enabled: true
};

// 定时任务配置
const CRON_CONFIG = {
  id: 'xietingfeng-concert-2026-chengdu',
  name: '谢霆锋成都演唱会开票搜索',
  schedule: {
    kind: 'every',
    everyMs: 86400000 // 每天执行一次（24小时）
  },
  payload: {
    kind: 'agentTurn',
    message: '🎤 谢霆锋2026成都进化演唱会开票搜索任务\n\n请使用浏览器工具搜索最新的开票信息，包括：\n- 演唱会时间\n- 开票时间\n- 票价信息\n- 购票渠道\n\n将结果整理成Markdown表格格式发送到飞书。'
  },
  sessionTarget: 'isolated',
  delivery: {
    mode: 'announce',
    channel: 'feishu',
    to: 'ou_3b363dce9bb583f7ec9f822e2b7a7880'
  },
  wakeMode: 'now',
  deleteAfterRun: false,
  enabled: true
};

/**
 * 技能初始化函数
 * 在OpenClaw启动时调用
 */
async function initialize() {
  console.log('🎤 正在初始化谢霆锋演唱会搜索技能...');
  
  try {
    // 检查技能配置文件
    await checkSkillConfig();
    
    // 注册定时任务
    await registerCronJob();
    
    // 创建必要的目录和文件
    await setupSkillEnvironment();
    
    console.log('✅ 谢霆锋演唱会搜索技能初始化完成');
    return { success: true, metadata: SKILL_METADATA };
  } catch (error) {
    console.error('❌ 技能初始化失败:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 检查技能配置
 */
async function checkSkillConfig() {
  const configPath = path.join(__dirname, 'config.json');
  
  try {
    await fs.access(configPath);
    console.log('✅ 技能配置文件存在');
  } catch {
    // 配置文件不存在，创建默认配置
    const defaultConfig = {
      searchKeyword: '谢霆锋2026成都进化演唱会开票时间',
      executeTime: '12:00',
      pushTarget: 'ou_3b363dce9bb583f7ec9f822e2b7a7880',
      maxRetries: 3,
      enabled: true
    };
    
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✅ 已创建默认配置文件');
  }
}

/**
 * 注册定时任务
 */
async function registerCronJob() {
  const cronDir = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'state', 'cron');
  const cronFile = path.join(cronDir, 'jobs.json');
  
  try {
    // 确保cron目录存在
    await fs.mkdir(cronDir, { recursive: true });
    
    // 读取现有任务
    let jobs = [];
    try {
      const content = await fs.readFile(cronFile, 'utf8');
      jobs = JSON.parse(content);
    } catch {
      // 文件不存在或解析失败，使用空数组
      jobs = [];
    }
    
    // 检查是否已存在相同ID的任务
    const existingIndex = jobs.findIndex(job => job.id === CRON_CONFIG.id);
    
    if (existingIndex >= 0) {
      // 更新现有任务
      jobs[existingIndex] = CRON_CONFIG;
      console.log('✅ 已更新现有定时任务');
    } else {
      // 添加新任务
      jobs.push(CRON_CONFIG);
      console.log('✅ 已创建新的定时任务');
    }
    
    // 写回文件
    await fs.writeFile(cronFile, JSON.stringify(jobs, null, 2));
    console.log('✅ 定时任务已注册');
    
  } catch (error) {
    console.error('⚠️ 定时任务注册警告:', error.message);
    // 不抛出错误，技能仍然可以手动使用
  }
}

/**
 * 设置技能运行环境
 */
async function setupSkillEnvironment() {
  // 创建logs目录
  const logsDir = path.join(__dirname, 'logs');
  await fs.mkdir(logsDir, { recursive: true });
  
  // 创建results目录
  const resultsDir = path.join(__dirname, 'results');
  await fs.mkdir(resultsDir, { recursive: true });
  
  console.log('✅ 技能运行环境已设置');
}

/**
 * 技能卸载函数
 */
async function cleanup() {
  console.log('🧹 正在清理谢霆锋演唱会搜索技能...');
  
  try {
    // 移除定时任务
    await removeCronJob();
    
    console.log('✅ 技能清理完成');
    return { success: true };
  } catch (error) {
    console.error('❌ 技能清理失败:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 移除定时任务
 */
async function removeCronJob() {
  const cronFile = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'state', 'cron', 'jobs.json');
  
  try {
    const content = await fs.readFile(cronFile, 'utf8');
    let jobs = JSON.parse(content);
    
    // 过滤掉本技能的任务
    const originalLength = jobs.length;
    jobs = jobs.filter(job => job.id !== CRON_CONFIG.id);
    
    if (jobs.length < originalLength) {
      await fs.writeFile(cronFile, JSON.stringify(jobs, null, 2));
      console.log('✅ 定时任务已移除');
    }
  } catch (error) {
    console.warn('⚠️ 定时任务移除警告:', error.message);
  }
}

/**
 * 手动执行搜索
 */
async function manualExecute() {
  console.log('🎤 手动执行谢霆锋演唱会搜索...');
  
  try {
    const searchModule = require('./search.js');
    await searchModule.main();
    return { success: true };
  } catch (error) {
    console.error('❌ 手动执行失败:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 获取技能状态
 */
async function getStatus() {
  return {
    metadata: SKILL_METADATA,
    cronJob: CRON_CONFIG,
    status: 'active',
    lastExecuted: null,
    nextExecution: new Date(Date.now() + CRON_CONFIG.schedule.everyMs).toISOString()
  };
}

module.exports = {
  initialize,
  cleanup,
  manualExecute,
  getStatus,
  metadata: SKILL_METADATA,
  cronConfig: CRON_CONFIG
};