/*
 * APICloud api 对象扩展
 * 作者：李梦凯
 * 修改日期：2019.01.01
 */

var rootURL_web = "http://192.168.98.57:82"; //服务器地址---web接口服务
// var rootURL_web = "http://192.168.100.1:82"; //服务器地址---web接口服务
var rootURL_access = "http://192.168.98.58:8001"; //服务器地址---接入服务
// var rootURL_access = "http://192.168.100.1:8001"; //服务器地址---接入服务
//api.js扩展库，对api.js中的一些函数与常用方法进行封装，便于管理。
! function(context) {
    var apiready_base; //指向apiready
    var apireadyExtend = function() { //apiready的扩展，先执行此方法，后执行apiready，此函数也是在api初始化完毕后自动调用，所以api在此函数中可正常调用
        //console.log封装，非debug环境下，不打印控制台日志，注意要在apiready后调用
        window.log = function() {
            if (api.debug) {
                return Function.prototype.bind.call(console.log, console);
            } else {
                return new Function();
            }
        }();
        window.alert = context.alert;

        //
        window.apicloud_rootPageInit = function() {
            console.log("——————————启动后,只在root页执行一次,但不必强制在root引入该js " + api.winName + " : " + api.frameName);
            window.apicloud_isLaunched = true;
            //移除启动后判断是否第一次执行的所有标志位
            $api.rmStorage('firstByLaunchFlags');
            //移除图片缓存记录，注意不是移除缓存，只是移除记录，防止多页面同时调用imgCache，详见refreshImg方法
            $api.setStorage('apicloud_httpImg_pageMap', {});
        }

        window.apiclpud_execApiready = function() {
            //执行apiready
            apiready_base();
            context.refreshImg();
        }

        if (api.winName == "root" && !api.frameName) {
            apicloud_rootPageInit();
            apiclpud_execApiready();
        } else {
            //函数注入，将function注入root页中去执行
            api.execScript({
                name: "root",
                script: "setTimeout(function(){" +
                    "if(!window.apicloud_isLaunched){" +
                    "(" + apicloud_rootPageInit.toString() + ")();" +
                    "}" +
                    "}());"
            });
            api.execScript({
                name: api.winName,
                frameName: api.frameName,
                script: "apiclpud_execApiready()"
            });
        }


    }

    // window.sURL = {
    //   showing : rootURL+"/v2/movie/in_theaters"
    // }
    context.CALLBACK1_AJAX = "CALLBACK1_AJAX";
    context.CALLBACK2_AJAX = "CALLBACK2_AJAX";

    var requestMap = {} //存放正在进行中的ajax。key：请求参数params的string类型
    context.ajax = function(params, callback) {
        if (requestMap[JSON.stringify(params)]) { //重复请求,返回
            return
        }
        if (!params.timeout) { //默认超时6秒
            params.timeout = 6;
        }
        if (params.cache == undefined) {
            params.cache = false; //默认不使用缓存
        }
        var headers = {
            //TODO 自定义公共请求头
        };
        if (params.headers) {
            for (var header in params.headers) {
                headers[header] = params.headers[header]
            }
        }
        params.data = {
            values: params.values,
            stream: params.stream,
            body: params.body,
            files: params.files
        };
        // params.url = rootURL + params.url;
        delete params.values;
        delete params.stream;
        delete params.body;
        delete params.files;
        requestMap[JSON.stringify(params)] = true;
        api.ajax(params, function(ret, err) {
            requestMap[JSON.stringify(params)] = false;
            var staticCallback = callback(ret, err)
            if (staticCallback === undefined || staticCallback === false) {
                //TODO 默认回调处理
            } else if (staticCallback === context.CALLBACK1_AJAX) {
                //TODO 默认回调处理2，不同的公共回调处理
                //错误处理----error
                api.hideProgress();

                // alert(JSON.stringify(err) + ",code:" + err.code)

            } else if (staticCallback === context.CALLBACK2_AJAX) {
                //TODO 默认回调处理3，不同的公共回调处理
                //错误处理----success:false
                api.hideProgress();

                // alert("请求数据失败")

            } else if (staticCallback === true) {
                //不要在这里写东西
                //回调事件已处理，无需再二次处理
            }
            console.warn('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++' + new Date().getHours() + ':' + new Date()
                .getMinutes() + ':' + new Date().getSeconds());
            console.log('请求地址--------------------------' + params.url)
            console.log('请求参数-----values---------------------' + JSON.stringify(params.data.values))
            console.log('请求参数-----body---------------------' + JSON.stringify(params.data.body))
            console.log('请求参数-----files---------------------' + JSON.stringify(params.data.files))
            console.log('返回--------------------------' + JSON.stringify(ret))
            console.log('错误--------------------------' + JSON.stringify(err))
            console.warn('----------------------------------------------------------');

        });
    };

    //文件日志，非debug环境下,不输出文件日志
    //android路径在UZMap>项目id(config中可查看)->file_log。
    //ios查看日志文件需要引入docInteraction模块，然后在合适代码处调用$api.showFlog
    var logFileExist; //判断日志文件是否存在
    window.flog = function(content) {
        content = content || "";
        if (!api.debug) {
            try { //没有引入该模块，正常执行其他代码
                var fs = api.require('fs');
            } catch (e) {
                return;
            }
            var logPath = 'fs://file_log/' + new Date().toLocaleString().split(' ')[0].replace(/\//g, '-') + '.txt';
            //判断log文件存在，不存在则创建
            if (!logFileExist) {
                var existRsp = fs.existSync({
                    path: logPath
                });
                logFileExist = existRsp.exist
                if (!logFileExist) {
                    fs.createFileSync({
                        path: logPath
                    });
                }
            }
            //日志写入
            fs.writeByLengthSync({
                path: logPath,
                content: new Date().toLocaleString() + " | " + api.winName + " | " + api.frameName + "\r\n" + content + "\r\n",
                place: {
                    start: 0,
                    strategy: 0
                }
            }, function(ret) {
                if (!ret.status && (ret.code == 0 || ret.code == 1)) {
                    logFileExist = false;
                }
            });
            //自动删除文件日志，日志大于7份时，删除日期最早的一份
            if (context.isFirstByDay("fileLogDelete")) {
                fs.readDir({
                    path: 'fs://file_log'
                }, function(dirRes) {
                    if (dirRes.status && dirRes.data.length > 7) {
                        dirRes.data.sort(function(fileA, fileB) {
                            var dateA = fileA.substring(0, fileA.lastIndexOf(".txt")) || 0;
                            var dateB = fileB.substring(0, fileB.lastIndexOf(".txt")) || 0;
                            return new Date(dateA).getTime() - new Date(dateB).getTime();
                        })
                        fs.remove({
                            path: "fs://file_log/" + dirRes.data[0]
                        });
                    }
                });
            }
        } else {
            return;
        }
    }

    context.closeWidget = function() {
        api.confirm({
            title: '退出提示',
            msg: '确定要退出程序吗?',
        }, function(ret, err) {
            if (ret) {
                if (ret.buttonIndex == 2) {
                    $api.send('logOut');
                    api.closeWidget({
                        silent: true,
                    });
                } else {

                }
            }
        });
    }

    function deleteCloudFlog(fileTag) {
        new Promise(function(resolve, reject) {
            $api.ajax({
                url: "https://d.apicloud.com/mcm/api/file?filter=" + JSON.stringify({
                    where: {
                        name: {
                            like: fileTag
                        }
                    }
                }),
                headers: {
                    "X-APICloud-AppId": api.appId,
                    "X-APICloud-AppKey": CLOUD_SIGN
                }
            }, function(ret, err) {
                log("数据云相关数据： " + JSON.stringify(ret) + JSON.stringify(err))
                if (ret && ret.length) {
                    resolve(ret)
                } else {
                    reject(JSON.stringify(ret) + JSON.stringify(err));
                }
            })
        }).then(function(res) {
            {
                var funArr = [];
                res.forEach(function(item) {
                    if (item.createdAt && (Date.now() - new Date(item.createdAt).getTime()) > 1000 * 60 * 60 * 24 * 4) { //判断创建时间大于4天
                        funArr.push(new Promise(function(resolve, reject) {
                            $api.ajax({
                                url: "https://d.apicloud.com/mcm/api/file/" + item.id,
                                method: "POST",
                                "headers": {
                                    "X-APICloud-AppId": api.appId,
                                    "X-APICloud-AppKey": CLOUD_SIGN
                                },
                                values: {
                                    "_method": "DELETE"
                                }
                            }, function(ret, err) {
                                if (ret) {
                                    resolve(ret)
                                } else {
                                    resolve(err)
                                }
                            })
                        }))
                    }
                })
                return Promise.all(funArr)
            }
        }).then(function(res) {
            log("删除4天以上云数据ret: " + JSON.stringify(res))
        }).catch(function(errMsg) {
            log("删除4天以上云数据：" + errMsg)
        })
    }

    var CLOUD_SIGN = "94e992bf5aa5d2f6845e215ae4adb41124edb882.1533873089632";
    context.uploadFlog = function(fileTag) {
        fileTag = fileTag || api.deviceId;
        deleteCloudFlog(fileTag); //删除云数据大于4天的数据
        var fs = api.require('fs');
        new Promise(function(resolve, reject) {
            fs.readDir({
                path: 'fs://file_log'
            }, function(dirRes, err) {
                if (dirRes.status && dirRes.data.length > 0) {
                    resolve(dirRes.data);
                } else {
                    if (dirRes.status && !dirRes.data.length) {
                        log('没有新日志');
                    } else {
                        log('新日志打开失败' + JSON.stringify(dirRes) + JSON.stringify(err));
                    }
                    resolve();
                }
            })
        }).then(function(pathArr) {
            //获取到了日志文件列表，准备移动至待上传文件夹
            if (!pathArr) {
                Promise.resolve();
            } else {
                var funArr = pathArr.map(function(path) {
                    return new Promise(function(resolve, reject) {
                        var fName = path.substring(0, path.lastIndexOf(".txt")) || 0;
                        var moveToPath = {
                            oldPath: "fs://file_log/" + fName + ".txt",
                            newPath: "fs://log_upload/"
                        }
                        fs.moveTo(moveToPath, function(ret, err) {
                            if (ret.status) {
                                resolve(ret)
                            } else {
                                log('移动文件至log_upload失败,' + JSON.stringify(ret) + JSON.stringify(err));
                                resolve(err)
                            }
                        });
                    })
                })
                return Promise.all(funArr);
            }
        }).then(function(fileRes) {
            //移动到了待上传文件夹，准备修改名字并上传
            var ret = fs.readDirSync({
                path: 'fs://log_upload'
            });
            if (ret.status && ret.data.length > 0) {
                var funArr = ret.data.map(function(fName) {
                    var newName = fName;
                    if (/^[1-9]\d{3}-([1-9]|0[1-9]|1[0-2])-([1-9]|0[1-9]|[1-2][0-9]|3[0-1]).txt$/.test(newName)) { //重命名待上传文件，加时间戳的目的防止文件名重复，并可以区分上传时间细节
                        newName = fName.substring(0, fName.lastIndexOf('.txt')) + "-" + Date.now();
                        fs.renameSync({
                            oldPath: 'fs://log_upload/' + fName,
                            newPath: 'fs://log_upload/' + newName
                        });
                    }
                    filename = fileTag + "-" + newName;
                    return new Promise(function(resolve, reject) {
                        if (!/^[1-9]\d{3}-([1-9]|0[1-9]|1[0-2])-([1-9]|0[1-9]|[1-2][0-9]|3[0-1])-\d{13}$/.test(newName)) {
                            resolve({
                                localPath: 'fs://log_upload/' + fName
                            });
                        } else {
                            $api.ajax({
                                url: 'https://d.apicloud.com/mcm/api/file',
                                method: 'POST',
                                headers: {
                                    "X-APICloud-AppId": api.appId,
                                    "X-APICloud-AppKey": CLOUD_SIGN
                                },
                                values: {
                                    filename: filename,
                                    appVersion: api.appVersion,
                                    deviceModel: api.deviceModel
                                },
                                files: {
                                    "file": 'fs://log_upload/' + newName,
                                }
                            }, function(ret, err) {
                                if (!ret) {
                                    resolve(null)
                                } else {
                                    ret.localPath = 'fs://log_upload/' + newName;
                                    resolve(ret);
                                }
                            });
                        }
                    })
                })
                return Promise.all(funArr);
            }
        }).then(function(resArr) {
            //上报完成，准备删除本地数据
            if (resArr) {
                resArr.forEach(function(res) {
                    if (res && res.localPath) {
                        fs.removeSync({
                            path: res.localPath
                        });
                    }
                })
                log("删除本地待上传文件")
            } else {
                log('没有待上传日志')
            }
        }).catch(function(errMsg) {
            log(errMsg)
        })
    }


    var DEFAULT_IMG = "widget://image/img_loading.png"
    var ERR_IMG = "widget://image/img_error.png"
    var imgCacheMap = {}; //图片网络地址对缓存地址的映射，{httpImgPath：cacheImgPath}
    //加载图片
    context.refreshImg = function() {
        var domImgArr = document.querySelectorAll("[data-src],[data-bg],[data-default-img]");
        var defaultImgArr = [];
        for (var i = 0; i < domImgArr.length; i++) {
            var domImg = domImgArr[i];
            var httpImg = domImg.dataset['src'] || domImg.dataset['bg'] || null;
            if (httpImg && httpImg.indexOf("http") != 0) {
                setImg(domImg, httpImg);
                continue;
            }
            var cacheImg = httpImg && imgCacheMap[httpImg]
                //图片已缓存，直接加载缓存图片。
            if (cacheImg) {
                setImg(domImg, cacheImg)
                continue;
            }

            //加载默认图片
            var defaultImg = domImg.dataset['defaultImg'];
            if (defaultImg == "") {
                setImg(domImg, DEFAULT_IMG)
            } else if (defaultImg) {
                setImg(domImg, defaultImg)
            }

            //需要加载网络图片，且本地没有缓存,但当前在下载中
            // if(httpImg && !cacheImg && imgCacheing[httpImg]){
            //   continue;
            //需要加载网络图片，且本地没有缓存,且当前没有在下载中
            // if(httpImg && !cacheImg && !imgCacheing[httpImg]){
            //将当前页面，存入storage，目的是为了所有页面共享缓存图片，当一个地方缓存完毕后通知也需要此图片的页面刷新
            //防止多页面调用缓存，格式：{httpImgPath：[page,page,page...]}
            var imgPageMap = $api.getStorage("apicloud_httpImg_pageMap");
            if (imgPageMap[httpImg]) {
                //有页面正在缓存这个图片，将当前页存入storage，continue；当缓存图片完毕后，会通过该storage通知当前页面
                imgPageMap[httpImg].push({
                    winName: api.winName,
                    frameName: api.frameName
                })
                $api.setStorage('apicloud_httpImg_pageMap', imgPageMap);
                continue;
            } else {
                imgPageMap[httpImg] = [{
                    winName: api.winName,
                    frameName: api.frameName
                }]
                $api.setStorage('apicloud_httpImg_pageMap', imgPageMap);
            }
            loadHttpImg(httpImg)
                // }
        }

        function loadHttpImg(httpImg) {
            api.imageCache({
                url: httpImg
            }, function(ret, err) {
                log("loadHttpImg callback : " + JSON.stringify(ret))
                var cacheImg = ret.status ? ret.url : null;
                var imgPageMap = $api.getStorage("apicloud_httpImg_pageMap");
                if (imgPageMap[httpImg]) {
                    for (var i = 0; i < imgPageMap[httpImg]; i++) {
                        var page = imgPageMap[httpImg][i]
                        if (page.winName != api.winName && page.frameName != api.frameName) { //当前页无需通知，直接在下边设置
                            api.execScript({
                                name: frameItem.winName,
                                frameName: frameItem.frameName,
                                script: "apicloud_listenerImgCache(" + JSON.stringify({
                                        httpImg: httpImg,
                                        cacheImg: cacheImg
                                    }) + ")" //通知其他页面
                            });
                        }
                    }
                    delete imgPageMap[httpImg]
                    $api.setStorage('imgCacheFrameMap', imgPageMap);
                    refreshImgByPath(httpImg, cacheImg);
                }
            })
        }
    }

    if (window.Vue) {
        //Vue版本图片缓存策略
        var apicloud_assistVue = new Vue({
            data: function() {
                return {
                    imgCacheMap: {}
                }
            }
        })
        var apicloud_imgLoadingMap = {}; //相同的网络图片计数器，没获取一次相同的网络图片加一
        Vue.prototype.$api = {}
        Vue.prototype.$api.getCacheImg = function(httpImg, defaultImg, errImg) {
            defaultImg = defaultImg || DEFAULT_IMG
            if (!httpImg) { //传参有误，返回默认图片地址
                return defaultImg;
            } else if (httpImg.indexOf("http") != 0) { //传入的是本地地址，直接返回
                return httpImg;
            } else if (apicloud_assistVue.imgCacheMap[httpImg]) { //网络图片已经缓存，返回缓存地址
                if (apicloud_assistVue.imgCacheMap[httpImg] == "error") {
                    return errImg || ERR_IMG || defaultImg;
                } else {
                    return apicloud_assistVue.imgCacheMap[httpImg]
                }
            }
            if (apicloud_imgLoadingMap[httpImg]) { //此图片正在缓存
                return defaultImg
            }
            var imgPageMap = $api.getStorage("apicloud_httpImg_pageMap") || {};
            if (imgPageMap[httpImg]) { //有其他页面正在缓存这个图片，将当前页存入storage，当缓存图片完毕后，会通过该storage通知当前页面
                apicloud_imgLoadingMap[httpImg] = true;
                imgPageMap[httpImg].push({
                    winName: api.winName,
                    frameName: api.frameName
                })
                $api.setStorage('apicloud_httpImg_pageMap', imgPageMap);
                return defaultImg
            } else {
                imgPageMap[httpImg] = [{
                    winName: api.winName,
                    frameName: api.frameName
                }]
                $api.setStorage('apicloud_httpImg_pageMap', imgPageMap);
            }
            apicloud_imgLoadingMap[httpImg] = true;
            api.imageCache({
                url: httpImg
            }, function(ret, err) {
                var cacheImg = ret.status ? ret.url : null;
                var imgPageMap = $api.getStorage("apicloud_httpImg_pageMap");
                for (var i = 0; i < imgPageMap[httpImg].length; i++) {
                    var page = imgPageMap[httpImg][i]
                    if (page.winName != api.winName || page.frameName != api.frameName) { //当前页无需通知，直接在下边设置
                        api.execScript({
                            name: page.winName,
                            frameName: page.frameName,
                            script: "apicloud_listenerImgCache(" + JSON.stringify({
                                    httpImg: httpImg,
                                    cacheImg: cacheImg
                                }) + ")" //通知其他页面
                        });
                    }
                }
                refreshImgByPath(httpImg, cacheImg);
                delete imgPageMap[httpImg];
                $api.setStorage('apicloud_httpImg_pageMap', imgPageMap);
            })
            return defaultImg;
        }
    }


    var refreshImgByPath = function(httpImg, cacheImg) {
        apicloud_imgLoadingMap[httpImg] = false;
        if (window.Vue) {
            if (cacheImg) {
                Vue.set(apicloud_assistVue.imgCacheMap, httpImg, cacheImg);
            } else {
                Vue.set(apicloud_assistVue.imgCacheMap, httpImg, "error");
            }
        }
        var domImgArr = document.querySelectorAll("[data-src],[data-bg]");
        for (var i = 0; i < domImgArr.length; i++) {
            var domImg = domImgArr[i]
            if (domImg.dataset['src'] != httpImg && domImg.dataset['bg'] != httpImg) { //找到使用这个hettp地址的标签
                continue;
            }
            if (cacheImg) {
                setImg(domImg, cacheImg)
            } else {
                var errImg = domImg.dataset['errImg']
                if (errImg == "") {
                    setImg(domImg, ERR_IMG) //公共默认异常图片
                } else if (errImg) {
                    setImg(domImg, errImg) //其他异常图片
                }
            }
        }
    }

    var setImg = function(domImg, imgPath) {
        if (imgPath == domImg.dataset['curImg']) {
            return
        }
        if (domImg.dataset['src']) {
            domImg.src = imgPath
        } else {
            domImg.style["background-image"] = "url(" + imgPath + ")"
        }
        domImg.setAttribute('data-cur-img', imgPath);
    }

    window.apicloud_listenerImgCache = function(refreshImgData) {
        console.warn("被通知 " + "api.winName : " + api.winName + " api.frameName : " + api.frameName + JSON.stringify(
            refreshImgData))
        refreshImgByPath(refreshImgData.httpImg, refreshImgData.cacheImg)
    }

    //查看文件
    context.showFileByDir = function(dirPath) {
        if (!dirPath) return
        try {
            var docInteraction = api.require('docInteraction');
            var fs = api.require('fs');
        } catch (e) {
            return
        }
        var dirRes = fs.readDirSync({
            path: dirPath
        });
        if (!dirRes.status || dirRes.data.length <= 0) {
            context.toast("文件路径不存在: " + dirPath)
            return
        }
        var buttons = dirRes.data
        api.actionSheet({
            title: '选择文件',
            cancelTitle: '取消',
            buttons: buttons
        }, function(ret, err) {
            var index = ret.buttonIndex - 1;
            docInteraction.open({
                path: dirPath + "/" + dirRes.data[index]
            }, function(ret, err) {
                if (err) {
                    api.toast({
                        msg: '未知类型'
                    });
                }
            });
        });
    }

    //当天第一次执行该标志位方法，当前第一次启动
    context.isFirstByDay = function(flag) {
        flag = flag || "";
        var dateStr = $api.getStorage("apicloud_" + flag + "_day");
        if (dateStr && dateStr == new Date().toDateString()) {
            return false
        } else {
            $api.setStorage("apicloud_" + flag + "_day", new Date().toDateString());
            return true
        }
    }

    //启动后第一次执行该标志位方法
    context.isFirstByLaunch = function(flag) {
        flag = flag || "";
        var firstByLaunchFlags = $api.getStorage("firstByLaunchFlags") || {};
        if (!firstByLaunchFlags[flag]) {
            firstByLaunchFlags[flag] = 1
            $api.setStorage('firstByLaunchFlags', firstByLaunchFlags);
            return true;
        }
        return false;
    }

    //toast,默认2.5秒
    context.toast = function(msg, duration) {
        duration = duration || 2500
        api.toast({
            msg: msg,
            duration: duration,
            location: 'top'
        });
    };

    //toast,默认2.5秒
    context.alert = function(msg) {
        api.alert({
            // title: 'testtitle',
            msg: msg,
            buttons: ['确定']
        }, function(ret, err) {

        });
    };

    //发送事件
    context.send = function(flag, extra) {
        extra = extra || {}
        api.sendEvent({
            name: flag,
            extra: extra
        });
    }

    //监听事件
    context.listener = function(flag, callback) {
        api.addEventListener({
            name: flag
        }, function(ret, err) {
            callback(ret, err)
        });
    }

    //长按事件监听
    context.longTouch = function(dom, callback) {
        dom.removeEventListener("touchstart", touchstart);
        dom.addEventListener("touchstart", touchstart);
        var startX;
        var startY;
        var timer;

        function touchstart(event) {
            startX = event.changedTouches[0].clientX;
            startY = event.changedTouches[0].clientY;
            event.currentTarget.addEventListener("touchend", touchcancel)
            event.currentTarget.addEventListener("touchcancel", touchcancel)
            var dom = event.currentTarget
            timer = setTimeout(function() {
                dom.removeEventListener("touchend", touchcancel);
                dom.removeEventListener("touchcancel", touchcancel);
                callback();
                dom = null;
            }, 1000)
        }

        function touchcancel(event) {
            event.currentTarget.removeEventListener("touchend", touchcancel)
            event.currentTarget.removeEventListener("touchcancel", touchcancel)
            clearTimeout(timer);
            dom = null;
        }
    }

    //双击退出
    context.dblBackQuit = function(msg) {
        msg = msg || "再按一次退出应用";
        context.listener("keyback", function(ret, err) {
            context.toast(msg);
            context.listener("keyback", function(ret, err) {
                api.closeWidget({
                    silent: true
                });
            });
            setTimeout(function() {
                context.dblBackQuit();
            }, 3000);
        });
    }

    //清除缓存
    context.clearCache = function(callback) {
        imgCacheMap = {}; //清空图片网络地址对缓存地址的映射
        $api.setStorage('apicloud_httpImg_pageMap', {}); //清空缓存图片的页面通知
        api.clearCache(function(ret, err) {
            if (callback) callback(ret, err);
        });
    }

    //打开win
    context.openWin = function(name_, url_, params_, bounces_) {
            api.openWin({
                name: name_,
                url: url_,
                pageParam: params_ || {},
                bounces: false || bounces_,
                slidBackEnabled: false
            });
        }
        //打开frame
    context.openFrame = function(name_, url_, params_, bounces_) {
            api.openFrame({
                name: name_,
                url: url_,
                pageParam: params_ || {},
                bounces: false || bounces_,
                slidBackEnabled: false,
                useWKWebView: true
            });
        }
        //图像预览
    context.imageView = function(image_, index_, event_, url_) {
            event.stopPropagation()
            var imageSrcArr = [];
            if (image_ instanceof Array) {
                imageSrcArr = image_
            } else {
                imageSrcArr.push(image_);
            }
            api.openWin({
                name: 'imageViewcloseImageViewer',
                url: url_,
                pageParam: {
                    imageSrcArr: imageSrcArr,
                    index: index_,
                },
                bounces: false,
                animation: {
                    type: "fade",
                    duration: 300
                }
            });
        },

        //删除截图
        context.deleteThumbnailImage = function(obj_) {
            var thumbnailImages = getDBStorage('thumbnailImages');
            for (var i = 0; i < thumbnailImages.length; i++) {
                if (thumbnailImages[i].id == obj_.id) {
                    thumbnailImages.splice(i, 1);
                    setDBStorage('thumbnailImages', thumbnailImages)
                    return
                }
            }
        }
    context.setGlobalData = function(_key, _value) {
        api.setGlobalData({
            key: _key,
            value: {
                'val': _value
            } //setGlobalData有bug，不支持存数组。
        });
    }
    context.getGlobalData = function(_key) {
        var data = api.getGlobalData({
            key: _key
        });
        return data.val;
    }

    //取所有数据
    //@params  name_:本地存储的key
    context.getAllData = function(name_) {
            var allData = context.getGlobalData(name_);
            if (!allData) {
                var m = []
                context.setGlobalData(name_, m);
                return m;
            } else {
                return allData;
            }
        }
        //弹出提示
    context.notification = function(tittle_, content_, callback_) {
        api.notification({
            notify: {
                title: tittle_,
                content: content_
            }
        }, function() {
            if (typeof callback_ == 'function') {
                callback_()
            }
        })
    }

    //判断是不是空对象
    context.isEmptyObject = function(obj_) {
            var t;
            for (t in obj_)
                return !1;
            return !0
        }
        //获取对象的第一个属性
    context.get_object_first_attribute = function(data) {
            for (var key in data)
                return data[key];
        }
        //获取对象的第一个属性值
    context.get_object_first_key = function(data) {
            for (var key in data)
                return key;
        }
        //播放音效
    context.playSound = function(path_) {
            var soundPlayer = api.require('soundPlayer');
            soundPlayer.play({
                alert: true,
                paths: [{
                    path: path_,
                    leftVolume: 0.8,
                    rightVolume: 0.8,
                    priority: 1,
                    loop: 0,
                    rate: 1
                }]
            });
        }
        //监听apiready的调用，调用apiready时会自动先执行此库中的apireadyExtend，后执行apiready
    Object.defineProperty(window, "apiready", {
        get: function() {
            return apireadyExtend;
        },
        set: function(value) {
            apiready_base = value;
        },
        enumerable: true, //可枚举
        configurable: true //apiready可删除，可修改属性的特性
    });
}(window.$api)

//promise https://github.com/then/promise
! function(t, r) {
    if (typeof define === "function" && define.amd) {
        define(r)
    } else if (typeof exports === "object") {
        module.exports = r()
    } else {
        t.returnExports = r()
    }
}(this, function() {
    var t = Function.prototype.call;
    var r = Array.prototype;
    var e = Object.prototype;
    var n = r.slice;
    var i = Array.prototype.splice;
    var o = Array.prototype.push;
    var a = Array.prototype.unshift;
    var l = e.toString;
    var u = function(t) {
        return e.toString.call(t) === "[object Function]"
    };
    var p = function(t) {
        return e.toString.call(t) === "[object RegExp]"
    };
    var s = function W(t) {
        return l.call(t) === "[object Array]"
    };
    var f = function tr(t) {
        var r = l.call(t);
        var e = r === "[object Arguments]";
        if (!e) {
            e = !s(r) && t !== null && typeof t === "object" && typeof t.length === "number" && t.length >= 0 && u(t.callee)
        }
        return e
    };

    function c() {}
    if (!Function.prototype.bind) {
        Function.prototype.bind = function rr(t) {
            var r = this;
            if (!u(r)) {
                throw new TypeError("Function.prototype.bind called on incompatible " + r)
            }
            var e = n.call(arguments, 1);
            var i = function() {
                if (this instanceof p) {
                    var i = r.apply(this, e.concat(n.call(arguments)));
                    if (Object(i) === i) {
                        return i
                    }
                    return this
                } else {
                    return r.apply(t, e.concat(n.call(arguments)))
                }
            };
            var o = Math.max(0, r.length - e.length);
            var a = [];
            for (var l = 0; l < o; l++) {
                a.push("$" + l)
            }
            var p = Function("binder", "return function (" + a.join(",") + "){return binder.apply(this,arguments)}")(i);
            if (r.prototype) {
                c.prototype = r.prototype;
                p.prototype = new c;
                c.prototype = null
            }
            return p
        }
    }
    var h = t.bind(e.hasOwnProperty);
    var y;
    var g;
    var v;
    var d;
    var b;
    if (b = h(e, "__defineGetter__")) {
        y = t.bind(e.__defineGetter__);
        g = t.bind(e.__defineSetter__);
        v = t.bind(e.__lookupGetter__);
        d = t.bind(e.__lookupSetter__)
    }
    var m = function() {
        var t = {};
        Array.prototype.splice.call(t, 0, 0, 1);
        return t.length === 1
    }();
    var w = [1].splice(0).length === 0;
    var S = function() {
        var t = [1, 2];
        var r = t.splice();
        return t.length === 2 && s(r) && r.length === 0
    }();
    if (S) {
        Array.prototype.splice = function er(t, r) {
            if (arguments.length === 0) {
                return []
            } else {
                return i.apply(this, arguments)
            }
        }
    }
    if (!w || !m) {
        Array.prototype.splice = function nr(t, r) {
            if (arguments.length === 0) {
                return []
            }
            var e = arguments;
            this.length = Math.max(q(this.length), 0);
            if (arguments.length > 0 && typeof r !== "number") {
                e = n.call(arguments);
                if (e.length < 2) {
                    e.push(q(r))
                } else {
                    e[1] = q(r)
                }
            }
            return i.apply(this, e)
        }
    }
    if ([].unshift(0) !== 1) {
        Array.prototype.unshift = function() {
            a.apply(this, arguments);
            return this.length
        }
    }
    if (!Array.isArray) {
        Array.isArray = s
    }
    var x = Object("a");
    var A = x[0] !== "a" || !(0 in x);
    var j = function ir(t) {
        var r = true;
        var e = true;
        if (t) {
            t.call("foo", function(t, e, n) {
                if (typeof n !== "object") {
                    r = false
                }
            });
            t.call([1], function() {
                "use strict";
                e = typeof this === "string"
            }, "x")
        }
        return !!t && r && e
    };
    if (!Array.prototype.forEach || !j(Array.prototype.forEach)) {
        Array.prototype.forEach = function or(t) {
            var r = Q(this),
                e = A && l.call(this) === "[object String]" ? this.split("") : r,
                n = arguments[1],
                i = -1,
                o = e.length >>> 0;
            if (!u(t)) {
                throw new TypeError
            }
            while (++i < o) {
                if (i in e) {
                    t.call(n, e[i], i, r)
                }
            }
        }
    }
    if (!Array.prototype.map || !j(Array.prototype.map)) {
        Array.prototype.map = function ar(t) {
            var r = Q(this),
                e = A && l.call(this) === "[object String]" ? this.split("") : r,
                n = e.length >>> 0,
                i = Array(n),
                o = arguments[1];
            if (!u(t)) {
                throw new TypeError(t + " is not a function")
            }
            for (var a = 0; a < n; a++) {
                if (a in e) {
                    i[a] = t.call(o, e[a], a, r)
                }
            }
            return i
        }
    }
    if (!Array.prototype.filter || !j(Array.prototype.filter)) {
        Array.prototype.filter = function lr(t) {
            var r = Q(this),
                e = A && l.call(this) === "[object String]" ? this.split("") : r,
                n = e.length >>> 0,
                i = [],
                o, a = arguments[1];
            if (!u(t)) {
                throw new TypeError(t + " is not a function")
            }
            for (var p = 0; p < n; p++) {
                if (p in e) {
                    o = e[p];
                    if (t.call(a, o, p, r)) {
                        i.push(o)
                    }
                }
            }
            return i
        }
    }
    if (!Array.prototype.every || !j(Array.prototype.every)) {
        Array.prototype.every = function ur(t) {
            var r = Q(this),
                e = A && l.call(this) === "[object String]" ? this.split("") : r,
                n = e.length >>> 0,
                i = arguments[1];
            if (!u(t)) {
                throw new TypeError(t + " is not a function")
            }
            for (var o = 0; o < n; o++) {
                if (o in e && !t.call(i, e[o], o, r)) {
                    return false
                }
            }
            return true
        }
    }
    if (!Array.prototype.some || !j(Array.prototype.some)) {
        Array.prototype.some = function pr(t) {
            var r = Q(this),
                e = A && l.call(this) === "[object String]" ? this.split("") : r,
                n = e.length >>> 0,
                i = arguments[1];
            if (!u(t)) {
                throw new TypeError(t + " is not a function")
            }
            for (var o = 0; o < n; o++) {
                if (o in e && t.call(i, e[o], o, r)) {
                    return true
                }
            }
            return false
        }
    }
    var O = false;
    if (Array.prototype.reduce) {
        O = typeof Array.prototype.reduce.call("es5", function(t, r, e, n) {
            return n
        }) === "object"
    }
    if (!Array.prototype.reduce || !O) {
        Array.prototype.reduce = function sr(t) {
            var r = Q(this),
                e = A && l.call(this) === "[object String]" ? this.split("") : r,
                n = e.length >>> 0;
            if (!u(t)) {
                throw new TypeError(t + " is not a function")
            }
            if (!n && arguments.length === 1) {
                throw new TypeError("reduce of empty array with no initial value")
            }
            var i = 0;
            var o;
            if (arguments.length >= 2) {
                o = arguments[1]
            } else {
                do {
                    if (i in e) {
                        o = e[i++];
                        break
                    }
                    if (++i >= n) {
                        throw new TypeError("reduce of empty array with no initial value")
                    }
                } while (true)
            }
            for (; i < n; i++) {
                if (i in e) {
                    o = t.call(void 0, o, e[i], i, r)
                }
            }
            return o
        }
    }
    var E = false;
    if (Array.prototype.reduceRight) {
        E = typeof Array.prototype.reduceRight.call("es5", function(t, r, e, n) {
            return n
        }) === "object"
    }
    if (!Array.prototype.reduceRight || !E) {
        Array.prototype.reduceRight = function fr(t) {
            var r = Q(this),
                e = A && l.call(this) === "[object String]" ? this.split("") : r,
                n = e.length >>> 0;
            if (!u(t)) {
                throw new TypeError(t + " is not a function")
            }
            if (!n && arguments.length === 1) {
                throw new TypeError("reduceRight of empty array with no initial value")
            }
            var i, o = n - 1;
            if (arguments.length >= 2) {
                i = arguments[1]
            } else {
                do {
                    if (o in e) {
                        i = e[o--];
                        break
                    }
                    if (--o < 0) {
                        throw new TypeError("reduceRight of empty array with no initial value")
                    }
                } while (true)
            }
            if (o < 0) {
                return i
            }
            do {
                if (o in e) {
                    i = t.call(void 0, i, e[o], o, r)
                }
            } while (o--);
            return i
        }
    }
    if (!Array.prototype.indexOf || [0, 1].indexOf(1, 2) !== -1) {
        Array.prototype.indexOf = function cr(t) {
            var r = A && l.call(this) === "[object String]" ? this.split("") : Q(this),
                e = r.length >>> 0;
            if (!e) {
                return -1
            }
            var n = 0;
            if (arguments.length > 1) {
                n = q(arguments[1])
            }
            n = n >= 0 ? n : Math.max(0, e + n);
            for (; n < e; n++) {
                if (n in r && r[n] === t) {
                    return n
                }
            }
            return -1
        }
    }
    if (!Array.prototype.lastIndexOf || [0, 1].lastIndexOf(0, -3) !== -1) {
        Array.prototype.lastIndexOf = function hr(t) {
            var r = A && l.call(this) === "[object String]" ? this.split("") : Q(this),
                e = r.length >>> 0;
            if (!e) {
                return -1
            }
            var n = e - 1;
            if (arguments.length > 1) {
                n = Math.min(n, q(arguments[1]))
            }
            n = n >= 0 ? n : e - Math.abs(n);
            for (; n >= 0; n--) {
                if (n in r && t === r[n]) {
                    return n
                }
            }
            return -1
        }
    }
    var N = Object.keys && function() {
        return Object.keys(arguments).length === 2
    }(1, 2);
    if (!Object.keys) {
        var T = !{
                toString: null
            }.propertyIsEnumerable("toString"),
            I = function() {}.propertyIsEnumerable("prototype"),
            D = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable",
                "constructor"
            ],
            _ = D.length;
        Object.keys = function yr(t) {
            var r = u(t),
                e = f(t),
                n = t !== null && typeof t === "object",
                i = n && l.call(t) === "[object String]";
            if (!n && !r && !e) {
                throw new TypeError("Object.keys called on a non-object")
            }
            var o = [];
            var a = I && r;
            if (i || e) {
                for (var p = 0; p < t.length; ++p) {
                    o.push(String(p))
                }
            } else {
                for (var s in t) {
                    if (!(a && s === "prototype") && h(t, s)) {
                        o.push(String(s))
                    }
                }
            }
            if (T) {
                var c = t.constructor,
                    y = c && c.prototype === t;
                for (var g = 0; g < _; g++) {
                    var v = D[g];
                    if (!(y && v === "constructor") && h(t, v)) {
                        o.push(v)
                    }
                }
            }
            return o
        }
    } else if (!N) {
        var M = Object.keys;
        Object.keys = function gr(t) {
            if (f(t)) {
                return M(Array.prototype.slice.call(t))
            } else {
                return M(t)
            }
        }
    }
    var F = -621987552e5,
        R = "-000001";
    if (!Date.prototype.toISOString || new Date(F).toISOString().indexOf(R) === -1) {
        Date.prototype.toISOString = function vr() {
            var t, r, e, n, i;
            if (!isFinite(this)) {
                throw new RangeError("Date.prototype.toISOString called on non-finite value.")
            }
            n = this.getUTCFullYear();
            i = this.getUTCMonth();
            n += Math.floor(i / 12);
            i = (i % 12 + 12) % 12;
            t = [i + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
            n = (n < 0 ? "-" : n > 9999 ? "+" : "") + ("00000" + Math.abs(n)).slice(0 <= n && n <= 9999 ? -4 : -6);
            r = t.length;
            while (r--) {
                e = t[r];
                if (e < 10) {
                    t[r] = "0" + e
                }
            }
            return n + "-" + t.slice(0, 2).join("-") + "T" + t.slice(2).join(":") + "." + ("000" + this.getUTCMilliseconds())
                .slice(-3) + "Z"
        }
    }
    var k = false;
    try {
        k = Date.prototype.toJSON && new Date(NaN).toJSON() === null && new Date(F).toJSON().indexOf(R) !== -1 && Date.prototype
            .toJSON.call({
                toISOString: function() {
                    return true
                }
            })
    } catch (C) {}
    if (!k) {
        Date.prototype.toJSON = function dr(t) {
            var r = Object(this),
                e = K(r),
                n;
            if (typeof e === "number" && !isFinite(e)) {
                return null
            }
            n = r.toISOString;
            if (typeof n !== "function") {
                throw new TypeError("toISOString property is not callable")
            }
            return n.call(r)
        }
    }
    var U = Date.parse("+033658-09-27T01:46:40.000Z") === 1e15;
    var Z = !isNaN(Date.parse("2012-04-04T24:00:00.500Z")) || !isNaN(Date.parse("2012-11-31T23:59:59.000Z"));
    var J = isNaN(Date.parse("2000-01-01T00:00:00.000Z"));
    if (!Date.parse || J || Z || !U) {
        Date = function(t) {
            function r(e, n, i, o, a, l, u) {
                var p = arguments.length;
                if (this instanceof t) {
                    var s = p === 1 && String(e) === e ? new t(r.parse(e)) : p >= 7 ? new t(e, n, i, o, a, l, u) : p >= 6 ? new t(
                            e, n, i, o, a, l) : p >= 5 ? new t(e, n, i, o, a) : p >= 4 ? new t(e, n, i, o) : p >= 3 ? new t(e, n, i) : p >=
                        2 ? new t(e, n) : p >= 1 ? new t(e) : new t;
                    s.constructor = r;
                    return s
                }
                return t.apply(this, arguments)
            }
            var e = new RegExp("^" + "(\\d{4}|[+-]\\d{6})" + "(?:-(\\d{2})" + "(?:-(\\d{2})" + "(?:" + "T(\\d{2})" +
                ":(\\d{2})" + "(?:" + ":(\\d{2})" + "(?:(\\.\\d{1,}))?" + ")?" + "(" + "Z|" + "(?:" + "([-+])" + "(\\d{2})" +
                ":(\\d{2})" + ")" + ")?)?)?)?" + "$");
            var n = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

            function i(t, r) {
                var e = r > 1 ? 1 : 0;
                return n[r] + Math.floor((t - 1969 + e) / 4) - Math.floor((t - 1901 + e) / 100) + Math.floor((t - 1601 + e) /
                    400) + 365 * (t - 1970)
            }

            function o(r) {
                return Number(new t(1970, 0, 1, 0, 0, 0, r))
            }
            for (var a in t) {
                r[a] = t[a]
            }
            r.now = t.now;
            r.UTC = t.UTC;
            r.prototype = t.prototype;
            r.prototype.constructor = r;
            r.parse = function l(r) {
                var n = e.exec(r);
                if (n) {
                    var a = Number(n[1]),
                        l = Number(n[2] || 1) - 1,
                        u = Number(n[3] || 1) - 1,
                        p = Number(n[4] || 0),
                        s = Number(n[5] || 0),
                        f = Number(n[6] || 0),
                        c = Math.floor(Number(n[7] || 0) * 1e3),
                        h = Boolean(n[4] && !n[8]),
                        y = n[9] === "-" ? 1 : -1,
                        g = Number(n[10] || 0),
                        v = Number(n[11] || 0),
                        d;
                    if (p < (s > 0 || f > 0 || c > 0 ? 24 : 25) && s < 60 && f < 60 && c < 1e3 && l > -1 && l < 12 && g < 24 && v <
                        60 && u > -1 && u < i(a, l + 1) - i(a, l)) {
                        d = ((i(a, l) + u) * 24 + p + g * y) * 60;
                        d = ((d + s + v * y) * 60 + f) * 1e3 + c;
                        if (h) {
                            d = o(d)
                        }
                        if (-864e13 <= d && d <= 864e13) {
                            return d
                        }
                    }
                    return NaN
                }
                return t.parse.apply(this, arguments)
            };
            return r
        }(Date)
    }
    if (!Date.now) {
        Date.now = function br() {
            return (new Date).getTime()
        }
    }
    if (!Number.prototype.toFixed || 8e-5.toFixed(3) !== "0.000" || .9.toFixed(0) === "0" || 1.255.toFixed(2) !==
        "1.25" || 0xde0b6b3a7640080.toFixed(0) !== "1000000000000000128") {
        (function() {
            var t, r, e, n;
            t = 1e7;
            r = 6;
            e = [0, 0, 0, 0, 0, 0];

            function i(n, i) {
                var o = -1;
                while (++o < r) {
                    i += n * e[o];
                    e[o] = i % t;
                    i = Math.floor(i / t)
                }
            }

            function o(n) {
                var i = r,
                    o = 0;
                while (--i >= 0) {
                    o += e[i];
                    e[i] = Math.floor(o / n);
                    o = o % n * t
                }
            }

            function a() {
                var t = r;
                var n = "";
                while (--t >= 0) {
                    if (n !== "" || t === 0 || e[t] !== 0) {
                        var i = String(e[t]);
                        if (n === "") {
                            n = i
                        } else {
                            n += "0000000".slice(0, 7 - i.length) + i
                        }
                    }
                }
                return n
            }

            function l(t, r, e) {
                return r === 0 ? e : r % 2 === 1 ? l(t, r - 1, e * t) : l(t * t, r / 2, e)
            }

            function u(t) {
                var r = 0;
                while (t >= 4096) {
                    r += 12;
                    t /= 4096
                }
                while (t >= 2) {
                    r += 1;
                    t /= 2
                }
                return r
            }
            Number.prototype.toFixed = function p(t) {
                var r, e, n, p, s, f, c, h;
                r = Number(t);
                r = r !== r ? 0 : Math.floor(r);
                if (r < 0 || r > 20) {
                    throw new RangeError("Number.toFixed called with invalid number of decimals")
                }
                e = Number(this);
                if (e !== e) {
                    return "NaN"
                }
                if (e <= -1e21 || e >= 1e21) {
                    return String(e)
                }
                n = "";
                if (e < 0) {
                    n = "-";
                    e = -e
                }
                p = "0";
                if (e > 1e-21) {
                    s = u(e * l(2, 69, 1)) - 69;
                    f = s < 0 ? e * l(2, -s, 1) : e / l(2, s, 1);
                    f *= 4503599627370496;
                    s = 52 - s;
                    if (s > 0) {
                        i(0, f);
                        c = r;
                        while (c >= 7) {
                            i(1e7, 0);
                            c -= 7
                        }
                        i(l(10, c, 1), 0);
                        c = s - 1;
                        while (c >= 23) {
                            o(1 << 23);
                            c -= 23
                        }
                        o(1 << c);
                        i(1, 1);
                        o(2);
                        p = a()
                    } else {
                        i(0, f);
                        i(1 << -s, 0);
                        p = a() + "0.00000000000000000000".slice(2, 2 + r)
                    }
                }
                if (r > 0) {
                    h = p.length;
                    if (h <= r) {
                        p = n + "0.0000000000000000000".slice(0, r - h + 2) + p
                    } else {
                        p = n + p.slice(0, h - r) + "." + p.slice(h - r)
                    }
                } else {
                    p = n + p
                }
                return p
            }
        })()
    }
    var $ = String.prototype.split;
    if ("ab".split(/(?:ab)*/).length !== 2 || ".".split(/(.?)(.?)/).length !== 4 || "tesst".split(/(s)*/)[1] === "t" ||
        "test".split(/(?:)/, -1).length !== 4 || "".split(/.?/).length || ".".split(/()()/).length > 1) {
        (function() {
            var t = /()??/.exec("")[1] === void 0;
            String.prototype.split = function(r, e) {
                var n = this;
                if (r === void 0 && e === 0) {
                    return []
                }
                if (l.call(r) !== "[object RegExp]") {
                    return $.call(this, r, e)
                }
                var i = [],
                    o = (r.ignoreCase ? "i" : "") + (r.multiline ? "m" : "") + (r.extended ? "x" : "") + (r.sticky ? "y" : ""),
                    a = 0,
                    u, p, s, f;
                r = new RegExp(r.source, o + "g");
                n += "";
                if (!t) {
                    u = new RegExp("^" + r.source + "$(?!\\s)", o)
                }
                e = e === void 0 ? -1 >>> 0 : V(e);
                while (p = r.exec(n)) {
                    s = p.index + p[0].length;
                    if (s > a) {
                        i.push(n.slice(a, p.index));
                        if (!t && p.length > 1) {
                            p[0].replace(u, function() {
                                for (var t = 1; t < arguments.length - 2; t++) {
                                    if (arguments[t] === void 0) {
                                        p[t] = void 0
                                    }
                                }
                            })
                        }
                        if (p.length > 1 && p.index < n.length) {
                            Array.prototype.push.apply(i, p.slice(1))
                        }
                        f = p[0].length;
                        a = s;
                        if (i.length >= e) {
                            break
                        }
                    }
                    if (r.lastIndex === p.index) {
                        r.lastIndex++
                    }
                }
                if (a === n.length) {
                    if (f || !r.test("")) {
                        i.push("")
                    }
                } else {
                    i.push(n.slice(a))
                }
                return i.length > e ? i.slice(0, e) : i
            }
        })()
    } else if ("0".split(void 0, 0).length) {
        String.prototype.split = function mr(t, r) {
            if (t === void 0 && r === 0) {
                return []
            }
            return $.call(this, t, r)
        }
    }
    var G = String.prototype.replace;
    var P = function() {
        var t = [];
        "x".replace(/x(.)?/g, function(r, e) {
            t.push(e)
        });
        return t.length === 1 && typeof t[0] === "undefined"
    }();
    if (!P) {
        String.prototype.replace = function wr(t, r) {
            var e = u(r);
            var n = p(t) && /\)[*?]/.test(t.source);
            if (!e || !n) {
                return G.call(this, t, r)
            } else {
                var i = function(e) {
                    var n = arguments.length;
                    var i = t.lastIndex;
                    t.lastIndex = 0;
                    var o = t.exec(e);
                    t.lastIndex = i;
                    o.push(arguments[n - 2], arguments[n - 1]);
                    return r.apply(this, o)
                };
                return G.call(this, t, i)
            }
        }
    }
    if ("".substr && "0b".substr(-1) !== "b") {
        var B = String.prototype.substr;
        String.prototype.substr = function Sr(t, r) {
            return B.call(this, t < 0 ? (t = this.length + t) < 0 ? 0 : t : t, r)
        }
    }
    var H = "	\n\f\r \xa0\u1680\u180e\u2000\u2001\u2002\u2003" +
        "\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028" + "\u2029\ufeff";
    var L = "\u200b";
    if (!String.prototype.trim || H.trim() || !L.trim()) {
        H = "[" + H + "]";
        var X = new RegExp("^" + H + H + "*"),
            Y = new RegExp(H + H + "*$");
        String.prototype.trim = function xr() {
            if (this === void 0 || this === null) {
                throw new TypeError("can't convert " + this + " to object")
            }
            return String(this).replace(X, "").replace(Y, "")
        }
    }
    if (parseInt(H + "08") !== 8 || parseInt(H + "0x16") !== 22) {
        parseInt = function(t) {
            var r = /^0[xX]/;
            return function e(n, i) {
                n = String(n).trim();
                if (!Number(i)) {
                    i = r.test(n) ? 16 : 10
                }
                return t(n, i)
            }
        }(parseInt)
    }

    function q(t) {
        t = +t;
        if (t !== t) {
            t = 0
        } else if (t !== 0 && t !== 1 / 0 && t !== -(1 / 0)) {
            t = (t > 0 || -1) * Math.floor(Math.abs(t))
        }
        return t
    }

    function z(t) {
        var r = typeof t;
        return t === null || r === "undefined" || r === "boolean" || r === "number" || r === "string"
    }

    function K(t) {
        var r, e, n;
        if (z(t)) {
            return t
        }
        e = t.valueOf;
        if (u(e)) {
            r = e.call(t);
            if (z(r)) {
                return r
            }
        }
        n = t.toString;
        if (u(n)) {
            r = n.call(t);
            if (z(r)) {
                return r
            }
        }
        throw new TypeError
    }
    var Q = function(t) {
        if (t == null) {
            throw new TypeError("can't convert " + t + " to object")
        }
        return Object(t)
    };
    var V = function Ar(t) {
        return t >>> 0
    }
});

// fastclick
! function() {
    function t(e, o) {
        function i(t, e) {
            return function() {
                return t.apply(e, arguments)
            }
        }
        var r;
        if (o = o || {}, this.trackingClick = !1, this.trackingClickStart = 0, this.targetElement = null, this.touchStartX =
            0, this.touchStartY = 0, this.lastTouchIdentifier = 0, this.touchBoundary = o.touchBoundary || 10, this.layer = e,
            this.tapDelay = o.tapDelay || 200, this.tapTimeout = o.tapTimeout || 700, !t.notNeeded(e)) {
            for (var a = ["onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel"], c = this, s = 0,
                    u = a.length; u > s; s++) {
                c[a[s]] = i(c[a[s]], c)
            }
            n && (e.addEventListener("mouseover", this.onMouse, !0), e.addEventListener("mousedown", this.onMouse, !0), e.addEventListener(
                    "mouseup", this.onMouse, !0)), e.addEventListener("click", this.onClick, !0), e.addEventListener("touchstart",
                    this.onTouchStart, !1), e.addEventListener("touchmove", this.onTouchMove, !1), e.addEventListener("touchend",
                    this.onTouchEnd, !1), e.addEventListener("touchcancel", this.onTouchCancel, !1), Event.prototype.stopImmediatePropagation ||
                (e.removeEventListener = function(t, n, o) {
                    var i = Node.prototype.removeEventListener;
                    "click" === t ? i.call(e, t, n.hijacked || n, o) : i.call(e, t, n, o)
                }, e.addEventListener = function(t, n, o) {
                    var i = Node.prototype.addEventListener;
                    "click" === t ? i.call(e, t, n.hijacked || (n.hijacked = function(t) {
                        t.propagationStopped || n(t)
                    }), o) : i.call(e, t, n, o)
                }), "function" == typeof e.onclick && (r = e.onclick, e.addEventListener("click", function(t) {
                    r(t)
                }, !1), e.onclick = null)
        }
    }
    var e = navigator.userAgent.indexOf("Windows Phone") >= 0,
        n = navigator.userAgent.indexOf("Android") > 0 && !e,
        o = /iP(ad|hone|od)/.test(navigator.userAgent) && !e,
        i = o && /OS 4_\d(_\d)?/.test(navigator.userAgent),
        r = o && /OS [6-7]_\d/.test(navigator.userAgent),
        a = navigator.userAgent.indexOf("BB10") > 0;
    t.prototype.needsClick = function(t) {
            switch (t.nodeName.toLowerCase()) {
                case "button":
                case "select":
                case "textarea":
                    if (t.disabled) {
                        return !0
                    }
                    break;
                case "input":
                    if (o && "file" === t.type || t.disabled) {
                        return !0
                    }
                    break;
                case "label":
                case "iframe":
                case "video":
                    return !0
            }
            return /\bneedsclick\b/.test(t.className)
        }, t.prototype.needsFocus = function(t) {
            switch (t.nodeName.toLowerCase()) {
                case "textarea":
                    return !0;
                case "select":
                    return !n;
                case "input":
                    switch (t.type) {
                        case "button":
                        case "checkbox":
                        case "file":
                        case "image":
                        case "radio":
                        case "submit":
                            return !1
                    }
                    return !t.disabled && !t.readOnly;
                default:
                    return /\bneedsfocus\b/.test(t.className)
            }
        }, t.prototype.sendClick = function(t, e) {
            var n, o;
            document.activeElement && document.activeElement !== t && document.activeElement.blur(), o = e.changedTouches[0], n =
                document.createEvent("MouseEvents"), n.initMouseEvent(this.determineEventType(t), !0, !0, window, 1, o.screenX, o.screenY,
                    o.clientX, o.clientY, !1, !1, !1, !1, 0, null), n.forwardedTouchEvent = !0, t.dispatchEvent(n)
        },
        t.prototype.determineEventType = function(t) {
            return n && "select" === t.tagName.toLowerCase() ? "mousedown" : "click"
        }, t.prototype.focus = function(t) {
            var e;
            o && t.setSelectionRange && 0 !== t.type.indexOf("date") && "time" !== t.type && "month" !== t.type ? (e = t.value.length,
                t.setSelectionRange(e, e)) : t.focus()
        }, t.prototype.updateScrollParent = function(t) {
            var e, n;
            if (e = t.fastClickScrollParent, !e || !e.contains(t)) {
                n = t;
                do {
                    if (n.scrollHeight > n.offsetHeight) {
                        e = n, t.fastClickScrollParent = n;
                        break
                    }
                    n = n.parentElement
                } while (n)
            }
            e && (e.fastClickLastScrollTop = e.scrollTop)
        }, t.prototype.getTargetElementFromEventTarget = function(t) {
            return t.nodeType === Node.TEXT_NODE ? t.parentNode : t
        }, t.prototype.onTouchStart = function(t) {
            var e, n, r;
            if (t.targetTouches.length > 1) {
                return !0
            }
            if (e = this.getTargetElementFromEventTarget(t.target), n = t.targetTouches[0], o) {
                if (r = window.getSelection(), r.rangeCount && !r.isCollapsed) {
                    return !0
                }
                if (!i) {
                    if (n.identifier && n.identifier === this.lastTouchIdentifier) {
                        return t.preventDefault(), !1
                    }
                    this.lastTouchIdentifier = n.identifier, this.updateScrollParent(e)
                }
            }
            return this.trackingClick = !0, this.trackingClickStart = t.timeStamp, this.targetElement = e, this.touchStartX = n
                .pageX, this.touchStartY = n.pageY, t.timeStamp - this.lastClickTime < this.tapDelay && t.preventDefault(), !0
        }, t.prototype.touchHasMoved = function(t) {
            var e = t.changedTouches[0],
                n = this.touchBoundary;
            return Math.abs(e.pageX - this.touchStartX) > n || Math.abs(e.pageY - this.touchStartY) > n ? !0 : !1
        }, t.prototype.onTouchMove = function(t) {
            return this.trackingClick ? ((this.targetElement !== this.getTargetElementFromEventTarget(t.target) || this.touchHasMoved(
                t)) && (this.trackingClick = !1, this.targetElement = null), !0) : !0
        }, t.prototype.findControl = function(t) {
            return void 0 !== t.control ? t.control : t.htmlFor ? document.getElementById(t.htmlFor) : t.querySelector(
                "button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")
        }, t.prototype.onTouchEnd = function(t) {
            var e, a, c, s, u, l = this.targetElement;
            if (!this.trackingClick) {
                return !0
            }
            if (t.timeStamp - this.lastClickTime < this.tapDelay) {
                return this.cancelNextClick = !0, !0
            }
            if (t.timeStamp - this.trackingClickStart > this.tapTimeout) {
                return !0
            }
            if (this.cancelNextClick = !1, this.lastClickTime = t.timeStamp, a = this.trackingClickStart, this.trackingClick = !
                1, this.trackingClickStart = 0, r && (u = t.changedTouches[0], l = document.elementFromPoint(u.pageX - window.pageXOffset,
                    u.pageY - window.pageYOffset) || l, l.fastClickScrollParent = this.targetElement.fastClickScrollParent), c = l.tagName
                .toLowerCase(), "label" === c) {
                if (e = this.findControl(l)) {
                    if (this.focus(l), n) {
                        return !1
                    }
                    l = e
                }
            } else {
                if (this.needsFocus(l)) {
                    return t.timeStamp - a > 100 || o && window.top !== window && "input" === c ? (this.targetElement = null, !1) : (
                        this.focus(l), this.sendClick(l, t), o && "select" === c || (this.targetElement = null, t.preventDefault()), !1
                    )
                }
            }
            return o && !i && (s = l.fastClickScrollParent, s && s.fastClickLastScrollTop !== s.scrollTop) ? !0 : (this.needsClick(
                l) || (t.preventDefault(), this.sendClick(l, t)), !1)
        }, t.prototype.onTouchCancel = function() {
            this.trackingClick = !1, this.targetElement = null
        }, t.prototype.onMouse = function(t) {
            return this.targetElement ? t.forwardedTouchEvent ? !0 : t.cancelable && (!this.needsClick(this.targetElement) ||
                this.cancelNextClick) ? (t.stopImmediatePropagation ? t.stopImmediatePropagation() : t.propagationStopped = !0, t
                .stopPropagation(), t.preventDefault(), !1) : !0 : !0
        }, t.prototype.onClick = function(t) {
            var e;
            return this.trackingClick ? (this.targetElement = null, this.trackingClick = !1, !0) : "submit" === t.target.type &&
                0 === t.detail ? !0 : (e = this.onMouse(t), e || (this.targetElement = null), e)
        }, t.prototype.destroy = function() {
            var t = this.layer;
            n && (t.removeEventListener("mouseover", this.onMouse, !0), t.removeEventListener("mousedown", this.onMouse, !0), t
                .removeEventListener("mouseup", this.onMouse, !0)), t.removeEventListener("click", this.onClick, !0), t.removeEventListener(
                "touchstart", this.onTouchStart, !1), t.removeEventListener("touchmove", this.onTouchMove, !1), t.removeEventListener(
                "touchend", this.onTouchEnd, !1), t.removeEventListener("touchcancel", this.onTouchCancel, !1)
        }, t.notNeeded = function(t) {
            var e, o, i, r;
            if ("undefined" == typeof window.ontouchstart) {
                return !0
            }
            if (o = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1]) {
                if (!n) {
                    return !0
                }
                if (e = document.querySelector("meta[name=viewport]")) {
                    if (-1 !== e.content.indexOf("user-scalable=no")) {
                        return !0
                    }
                    if (o > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return !0
                    }
                }
            }
            if (a && (i = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/), i[1] >= 10 && i[2] >= 3 && (e = document.querySelector(
                    "meta[name=viewport]")))) {
                if (-1 !== e.content.indexOf("user-scalable=no")) {
                    return !0
                }
                if (document.documentElement.scrollWidth <= window.outerWidth) {
                    return !0
                }
            }
            return "none" === t.style.msTouchAction || "manipulation" === t.style.touchAction ? !0 : (r = +(/Firefox\/([0-9]+)/
                    .exec(navigator.userAgent) || [, 0])[1], r >= 27 && (e = document.querySelector("meta[name=viewport]"), e && (-1 !==
                    e.content.indexOf("user-scalable=no") || document.documentElement.scrollWidth <= window.outerWidth)) ? !0 :
                "none" === t.style.touchAction || "manipulation" === t.style.touchAction ? !0 : !1)
        }, t.attach = function(e, n) {
            return new t(e, n)
        }, "function" == typeof define && "object" == typeof define.amd && define.amd ? define(function() {
            return t
        }) : "undefined" != typeof module && module.exports ? (module.exports = t.attach, module.exports.FastClick = t) :
        window.FastClick = t
}();
FastClick.attach(document.body);
