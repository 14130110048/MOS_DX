function fnLanSwitch(_txt) {
	var _JSON = {
		//cutImage
		'renwuhao':{
			'English': 'Task ID',
			'Chinese': '任务号'
		},
		'daqianchenggong':{
			'English': 'Successfully labeled',
			'Chinese': '打签成功'
		},
		'daqianshibai':{
			'English': 'Failed to label',
			'Chinese': '打签失败'
		},
		'jietu':{
			'English': 'Snapshot',
			'Chinese': '截图'
		},
		'paizhao':{
			'English': 'Camera',
			'Chinese': '拍照'
		},
		'tijiao':{
			'English': 'UPLOAD',
			'Chinese': '提交'
		},
		//fiexd
		'zhanghao': {
			'English': 'Account',
			'Chinese': '账号'
		},
		'xingming': {
			'English': 'Name',
			'Chinese': '姓名'
		},
		'keshi': {
			'English': 'Department',
			'Chinese': '科室'
		},
		'juese': {
			'English': 'Role',
			'Chinese': '角色'
		},
		'shouye': {
			'English': 'Home',
			'Chinese': '首页'
		},
		'xiaoxizhongxin': {
			'English': 'Info Center',
			'Chinese': '消息中心'
		},
		'yuyanshezhi': {
			'English': 'Language Settings',
			'Chinese': '语言设置'
		},
		'zhongwen': {
			'English': 'Chinese',
			'Chinese': '中文'
		},
		'yingyu': {
			'English': 'English',
			'Chinese': '英语'
		},
		'gongzuoquyu': {
			'English': 'Work Area',
			'Chinese': '工作区域'
		},
		'dating':{
			'English': 'Hall',
			'Chinese': '大厅'
		},
		'chukou':{
			'English': 'Exit',
			'Chinese': '出口'
		},
		'tuichudenglu':{
			'English': 'Logout',
			'Chinese': '退出登录'
		},
		//home
		'dangriguobaozongshu': {
			'English': 'Daily Pass-through',
			'Chinese': '当日过包总数'
		},
		'xianyibaoguozongshu': {
			'English': 'Rejected Baggages',
			'Chinese': '嫌疑包裹总数'
		},
		'daqianshibaizongshu': {
			'English': 'Labeling Failures',
			'Chinese': '打签失败总数'
		},
		'lanjiebaoguozongshu': {
			'English': 'Intercepted',
			'Chinese': '拦截包裹总数'
		},
		'yunxing': {
			'English': 'Online',
			'Chinese': '运行'
		},
		'guzhang': {
			'English': 'Fault',
			'Chinese': '故障'
		},
		'lixian': {
			'English': 'Offline',
			'Chinese': '离线'
		},
		'renwuxiaoxi': {
			'English': 'Task Info',
			'Chinese': '任务消息'
		},
		'xitongxiaoxi': {
			'English': 'System Info',
			'Chinese': '系统消息'
		},
		'xialashuaxin': {
			'English': 'Pull to fresh',
			'Chinese': '下拉刷新'
		},
		'songkaishuaxin': {
			'English': 'Release to fresh',
			'Chinese': '松开刷新'
		},
		'jiazaizhong': {
			'English': 'Loading',
			'Chinese': '加载中'
		},
		'zuihougengxin': {
			'English': 'Last fresh',
			'Chinese': '最后更新'
		},
		//imageEdit
		'baocun': {
			'English': 'SAVE',
			'Chinese': '保存'
		},
		'qingchu': {
			'English': 'CLEAR',
			'Chinese': '清除'
		},
		//login
		'shebeilianwangjiance': {
			'English': 'Networking Test',
			'Chinese': '设备联网检测'
		},
		'shebeishouquanjiance': {
			'English': 'Authorizing Test',
			'Chinese': '设备授权检测'
		},
		'zhanghaodenglu': {
			'English': 'Account and Password',
			'Chinese': '账号密码登录'
		},
		'denglu': {
			'English': 'LOGIN',
			'Chinese': '登录'
		},
		'jizhumima': {
			'English': 'keep password',
			'Chinese': '记住密码'
		},
		'mima':{
			'English': 'PASSWORD',
			'Chinese': '密码'
		},
		//renwu
		'baoguoguiji': {
			'English': 'Baggage Track',
			'Chinese': '包裹轨迹'
		},
		'renwuguiji': {
			'English': 'Task Track',
			'Chinese': '任务轨迹'
		},
		'guanliantupian': {
			'English': 'Associate Images',
			'Chinese': '关联图片'
		},
		'chakanbaojingluxiang': {
			'English': 'view videos',
			'Chinese': '查看报警录像'
		},
		'shanchu': {
			'English': 'DELETE',
			'Chinese': '删除'
		},
		'xitong': {
			'English': 'System',
			'Chinese': '系统'
		},
		'chuangjianrenwu': {
			'English': 'Create Task',
			'Chinese': '创建任务'
		},
		'xiafarenwu': {
			'English': 'Dispatch Task',
			'Chinese': '下发任务'
		},
		'shangchuanjietu': {
			'English': 'Upload Snapshot',
			'Chinese': '上传截图'
		},
		'renwuchaoshi': {
			'English': 'Task Timeout',
			'Chinese': '任务超时'
		},
		'renwuguoqi': {
			'English': 'Task Expired',
			'Chinese': '任务过期'
		},
		'renwuwancheng': {
			'English': 'Task Completed',
			'Chinese': '任务完成'
		},
		'renwuquxiao': {
			'English': 'Task Cancelled',
			'Chinese': '任务取消'
		},
		//messageWin
		'renwuxiaoxi': {
			'English': 'Task Info',
			'Chinese': '任务消息'
		},
		'xitongxiaoxi': {
			'English': 'System Info',
			'Chinese': '系统消息'
		},
		'guanbi':{
			'English': 'CLOSE',
			'Chinese': '关闭'
		},
		//map
		'mingcheng':{
			'English': 'Name',
			'Chinese': '名称'
		},
		'weizhi':{
			'English': 'Position',
			'Chinese': '位置'
		},
		'zhuangtai':{
			'English': 'Status',
			'Chinese': '状态'
		},
		'yichangxinxi':{
			'English': 'Exception Cause',
			'Chinese': '异常信息'
		},
		'denglurenyuan':{
			'English': 'Officer Name',
			'Chinese': '登录人员'
		},
		'yuangongbianhao':{
			'English': 'Staff ID',
			'Chinese': '员工编号'
		},
		'lianxifangshi':{
			'English': 'Contact Info',
			'Chinese': '联系方式'
		},
		'zuihouyicidenglushijian':{
			'English': 'Last Login',
			'Chinese': '上次登录时间'
		},
		'jiankongyulan':{
			'English': 'Monitoring Screen',
			'Chinese': '监控预览'
		},
		'chakanzuijinbaojing':{
			'English': 'Historical Alarm',
			'Chinese': '查看最近报警'
		},
		//popwin
		'dating':{
			'English': 'Hall',
			'Chinese': '大厅'
		},
		'weishengjian':{
			'English': 'Toilet',
			'Chinese': '卫生间'
		},
		'chukou':{
			'English': 'Exit',
			'Chinese': '出口'
		},
		'qingxuanzegongzuoquyu':{
			'English': 'Please choose work areas',
			'Chinese': '请选择工作区域'
		},
		'queding':{
			'English': 'OK',
			'Chinese': '确定'
		},
	}
	if (_txt in _JSON) {
		if ($api.getStorage('appLanguage')) {
			var _lan = $api.getStorage('appLanguage');
		} else {
			var _lan = (navigator.language || navigator.browserLanguage).toLowerCase();
		}
		return _JSON[_txt][_lan];
	} else {
		return _txt;
	}
}


var LTrans = {} //用来存储根据当前语言设置转换后的文字
function language() {
	for (key in L) {
		LTrans[key] = fnLanSwitch(L[key])
	}
	$api.listener('changeLanguage',function(){//初始化开始监听语言变化
		languageChange()
	})
}

function languageChange() {
	for (key in L) {
		vm.L[key] = fnLanSwitch(L[key])
	}
}


