import initDatabse from './init-database'
import getSetData from './set-data'

import { importJsonDatabase } from 'database/result'
import { $warn, loadGolbalStyle } from '../../util/index'
import { createCursor } from '../../expand/cursor'
import { initColumn } from '../../component/column/init'
import { contentFilter } from '../../component/activity/content/content-filter'
import { config, initConfig, initPathAddress } from '../../config/index'
import { initPreload, loadPrelaod } from 'preload/index'
import { adaptiveImage } from './adp-image'

import {
  configLaunch,
  resetBrMode,
  resetDelegate,
  setHistory,
  setPaintingMode
} from '../../config/launch-config/index.js'


export default function baseConfig(callback) {
  //导入数据库
  importJsonDatabase((results) => {
    setDatabse(results)
  })

  //根据数据库的配置设置
  function setDatabse(results) {
    initDatabse(results, function(dataRet) {
      $warn('logic', '初始化数据库完成')
      const novelData = dataRet.Novel.item(0)
      const data = getSetData(dataRet.Setting)
      const chapterTotal = dataRet.Chapter.length

      //配置lanuch
      configLaunch(novelData)

      //配置config
      configInit(novelData, data)

      //配置图片
      configImage()

      //处理预加载文件
      loadPrelaod(function(hasPreFile, globalBrMode) {
        resetBrMode(hasPreFile, globalBrMode)
        loadStyle(novelData, chapterTotal)
      })
    })
  }

  /**
   * 加载样式
   * @return {[type]} [description]
   */
  function loadStyle(novelData, chapterTotal) {
    /*加载svg的样式*/
    loadGolbalStyle('svgsheet', function() {
      //判断是否有分栏处理
      configColumn(function() {
        //如果启动预加载配置
        //先探测下是否能支持
        if (config.launch.preload) {
          initPreload(chapterTotal, () => callback(novelData))
        } else {
          callback(novelData)
        }
      })
    })
  }
}


/*
  配置初始化
 */
function configInit(novelData, tempSettingData) {

  /*启动代码用户操作跟踪:启动*/
  config.sendTrackCode('launch')

  //创建过滤器
  Xut.CreateFilter = contentFilter('createFilter');
  Xut.TransformFilter = contentFilter('transformFilter');

  //初始化配置一些信息
  initConfig(novelData.pptWidth, novelData.pptHeight)

  //新增模式,用于记录浏览器退出记录
  //如果强制配置文件recordHistory = false则跳过数据库的给值
  setHistory(tempSettingData)

  //2015.2.26
  //启动画轴模式
  setPaintingMode(tempSettingData)

  //创建忙碌光标
  if (!Xut.IBooks.Enabled) {
    createCursor()
  }

  //初始资源地址
  initPathAddress()
}


/**
 * 初始分栏排版
 * 嵌入index分栏
 * 默认有并且没有强制设置关闭的情况，打开缩放
 */
function configColumn(callback) {
  initColumn(haColumnCounts => {
    if (haColumnCounts) {
      resetDelegate()
    }
    callback()
  })
}


function configImage() {
  //mini杂志设置
  //如果是pad的情况下设置font为125%
  if (config.launch.platform === 'mini' && Xut.plat.isTablet) {
    $('body').css('font-size', '125%')
  }

  /*图片分辨了自适应*/
  if (config.launch.imageSuffix) {
    adaptiveImage()
  }
}
