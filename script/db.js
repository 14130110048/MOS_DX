		//创建数据库/创建表
		function createDB(){
			//打开数据库用于缓存
			var db = api.require('db');
			var ret = db.openDatabaseSync({
				name : 'storagedb',
				//path：'fs://storagedb',
			});
			console.log("opendatabase" + JSON.stringify(ret));
			var ret = db.selectSqlSync({
				name : 'storagedb',
				sql : 'SELECT count(*) FROM storagetable'
			});
			console.log(JSON.stringify(ret));
			if (!ret.status)//如果不存在表，则创建表
			{
				var createret = db.executeSqlSync({
					name : 'storagedb',
					sql : 'CREATE TABLE storagetable(Id_P int, KeyName varchar(100), KeyValue ext)'
				});
				console.log("CREATEDB:" + JSON.stringify(createret));
			}
			var testret = db.selectSqlSync({
				name : 'storagedb',
				sql : "SELECT * FROM storagetable where KeyName='hitchList_0'"
			});
			console.log("testret:" + JSON.stringify(testret));
		}
		//同步插入或更新db数据
		function setDBStorage(stroageKey, json) {
			var db = api.require('db');
			var ret = db.selectSqlSync({
				name: 'storagedb',
				sql: "SELECT KeyValue FROM storagetable where KeyName='" + stroageKey + "'"
			});
			//console.log("241"+stroageKey+"&select KeyValue" + JSON.stringify(ret));
			if(ret.data && ret.data.length > 0) {
				var updateret = db.executeSqlSync({
					name: 'storagedb',
					sql: "update storagetable set KeyValue='" + JSON.stringify(json) + "' where KeyName='" + stroageKey + "'"
				});
				//console.log("247"+stroageKey+"&updatedb:" + JSON.stringify(updateret));
			} else {
				var insertret = db.executeSqlSync({
					name: 'storagedb',
					sql: "insert into storagetable(KeyName,KeyValue) values('" + stroageKey + "','" + JSON.stringify(json) + "')"
				});
				//console.log("253"+stroageKey+"&insertdb:" + JSON.stringify(insertret));
			}
		}
		//异步插入或更新db数据
		function setDBStorageUnSync(stroageKey, json) {
			var db = api.require('db');
			db.selectSql({
				name: 'storagedb',
				sql: "SELECT KeyValue FROM storagetable where KeyName='" + stroageKey + "'"
			}, function(ret, err) {
				if(ret.status && ret.data && ret.data.length > 0) {
					db.executeSql({
						name: 'storagedb',
						sql: "update storagetable set KeyValue='" + JSON.stringify(json) + "' where KeyName='" + stroageKey + "'"
					}, function(ret1, err1) {
						if(ret1.status) {
// 							api.hideProgress(); //隐藏load加载弹窗
// 							api.alert({
// 								msg: '数据保存成功！',
// 							}, function(ret, err) {
// 								alert(JSON.stringify(getDBStorage('thumbnailImages')))
// 							});
						}
					});
				} else {
					db.executeSql({
						name: 'storagedb',
						sql: "insert into storagetable(KeyName,KeyValue) values('" + stroageKey + "','" + JSON.stringify(json) + "')"
					}, function(ret1, err1) {
						if(ret1.status) {
// 							api.hideProgress(); //隐藏load加载弹窗
// 							api.alert({
// 								msg: '数据保存成功！',
// 							}, function(ret, err) {
// 								alert(JSON.stringify(getDBStorage('thumbnailImages')))
// 							});
						}
					});
				}
			});
		
		}
		//获取db数据
		function getDBStorage(stroageKey) {
			var json;
			var db = api.require('db');
			//console.log("288stroageKey:" + stroageKey);
			var ret = db.selectSqlSync({
				name: 'storagedb',
				sql: "SELECT KeyValue FROM storagetable where KeyName='" + stroageKey + "'"
			});
			//console.log("293select storage from db:" + JSON.stringify(ret));
			if(ret.data && ret.data.length > 0 && ret.data[0].KeyValue) {
				if(ret.data[0].KeyValue != "undefined") {
					json = JSON.parse(ret.data[0].KeyValue);
				}
			}
			return json;
		}
		//删除db数据
		function delDBStorage(stroageKey) {
			var db = api.require('db');
			var ret = db.selectSqlSync({
				name: 'storagedb',
				sql: "DELETE FROM storagetable WHERE KeyName = '" + stroageKey + "'"
			});
			return ret;
		}
		
		
// 		context.setTaskInfo = function(obj_) {
// 			obj_ = obj_.Body;
// 			var allTaskInfoData = this.getAllData('taskInfoData');
// 			//当任务类型为取消时，这一条需要删除
// 			if (obj_.Task.Status == '4' || obj_.Task.Status == '5') { //取消或者过期，需要删除
// 				for (var i = 0, len = allTaskInfoData.length; i < len; i++) {
// 					if (allTaskInfoData[i].Task.TaskID == obj_.Task.TaskID) {
// 						allTaskInfoData.splice(i, 1) //如果当前内存中有这个任务，那就要把这个任务也删除掉
// 					}
// 				}
// 			} else { //如果是其他情况，就需要替换或者添加
// 				var index = allTaskInfoData.indexOf(obj_);
// 				if (index == '-1') {
// 					allTaskInfoData.push(obj_)
// 				} else {
// 					allTaskInfoData[index] = obj_
// 				}
// 			}
// 			//存进去 有就替换没有就添加
// 			$api.setStorage('taskInfoData', allTaskInfoData) //千万记住 任何在通知其他页面发生改变时 都要现进行本地存储这一步，allTaskInfoData的变化只是缓存变量的变化，并没有实际存储的变化
// 			if (!taskTestTimeOut) {
// 				taskTestTimeOut = setTimeout(function() {
// 					context.send('taskChange')
// 					taskTestTimeOut = null
// 				}, 1000)
// 			}
// 		}