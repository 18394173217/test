var ChannelTag = (function($, Table, Combo) {
	let Pane = {
		table: null,
		namespaces: "chCategory",
		search: {
			name: ""
		},
		init() {
			this.initSelect();
			this.initNamespace();
			this.bindEvents();
		},
		initSelect() { // 下拉框选择tag的元数据
			API.getMetadata((tag_list) => {
				console.log(tag_list)
				let styles = {
					width: "165px",
					height: "38",
					background: "#2EA2D7",
	        		selectbackground: "rgb(79, 184, 241)",
	            	ScrollBarHeight: "200px",
					color: '#fff',
				};
				let combo = new Combo("#channel_manage #channel_manage_type", select_obj, styles, (value) => {
					Pane.search.chCategory = value;
					Pane.table.getPageData = API.getList;
		    		Pane.table.create();
				});
			});
		},
		initNamespace() {  // 验证namespace是否存在
			let _this = this;
			API.getNamespaces((data) => {
				let namespaces = [];
				for(let i = 0; i < data.length; i++) {
					namespaces.push(data[i].name);
				}
				if(namespaces.indexOf(Pane.namespaces) < 0) {  // namespace中不存在chCategory,创建
					API.createNamespace(() => {
						_this.initTable();
					});
				} else {
					_this.initTable();
				}
			});
		},
		initTable() {
			let title = [
				{label: i18n("CHANNEL_CATEGORY_TAG_TABLE_NAME")},
				{label: i18n("CHANNEL_CATEGORY_TAG_TABLE_TITLE")},
				{label: i18n("CHANNEL_CATEGORY_TAG_TABLE_OPR")}
			];
			let styles = {
				borderColor: "#E2E2E2",
		        borderWidth: 1,
		        titleBg: "#45d1f4",
		        titleColor: "#FFFFFF",
		        titleHeight: 31,
		        cellBg: "white",
		        evenBg: "#F5FDFF",
		        cellColor: "#797979",
		        cellHeight: 37,
		        footBg: "#FFFFFF",
		        footColor: "#797979",
		        inputBg: "#FFFFFF",
		        inputBorder: "1px solid #CBCBCB",
		        iconColor: "#0099CB",
		        columnsWidth: [0.45, 0.45, 0.1]
			};
			Pane.table = new Table({
				containerId: "channel_tag_list_table",
				rows: 15,
				columns: 3,
				titles: title,
				styles: styles,
				listType: 1,
				async: true,
				specialStyle:{"tdTextAlignLeftIndex":6,"tdColorBlueCursorPointerIndex":1}
			});
			Pane.table.getPageData = API.getList;
			Pane.table.create();
		},
		bindEvents() {
			let _this = this;
			$('#channel_tag .search_input').on('keydown', (e) => {  // 回车查询事件
				let key = e.keyCode || e.which;
				if(key == 13) {
					let value = $(e.target).val();
					Pane.search.name = value;
					Pane.initTable();
				}
			});
			
			$('#channel_tag .search_btn').unbind().bind('click', (e) => {  // 按钮查询
				let value = $('#channel_tag .search_input').val();
				Pane.search.name = value;
				Pane.initTable();
			});
			$('#channel_tag .btn').unbind().bind('click', (e) => {  // 新增标签
				let create_dialog = new ChannelTagDialog({
					namespaces: Pane.namespaces,
					state: 'create',
					callback: () => {
						Pane.table.refreshList();
					}
				});
			});
			// 列表操作
			$('#channel_tag #channel_tag_list_table')
			.on('click', 'a[name=edit]', (e) => {  // 编辑
				let index = $(e.target).data('index');
				let data = API.data[index];
				let edit_dialog = new ChannelTagDialog({
					namespaces: Pane.namespaces,
					state: 'update',
					data: data,
					callback: () => {
						Pane.table.refreshList();
					}
				});
				
			})
			.on('click', 'a[name=del]', (e) => {  // 删除
				let index = $(e.target).data('index');
				let name = API.data[index].name;
				let message = i18n("CHANNEL_CATEGORY_TAG_DEL_HINT").replace(/{{}}/, name);
				let del_dialog = new AlertDialog({
					message: message,
					confirmFn: (callback) => {
			            API.delete(name, () => {
							Pane.table.refreshList();
			            	callback&&callback();
			            });
			        }
				});
			})
		}
	};
	let API = {
		data: [],
		// 获取元数据
		getMetadata(callback) {
	      	let url = aquapaas_host + "/aquapaas/rest/assetdef/metadata/channel";
	      	let method = "GET";
	      	$.ajax({
				url: url,
				type: method,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				}
	      	}).always((resp, status, xhr)=>{
	        	if (status == "success") {
	        		let tag_list = [];
	        		for(let i = 0; i < resp.length; i++) {
	        			if(resp[i].type == "tag") {
	        				tag_list.push(resp[i]);
	        			}
	        		}
	        		callback&&callback(Model.tag_select(tag_list));
	        	} else {
	        		callback&&callback([]);
	        	}
	      	});
	    },
		// 获取所有命名空间
		getNamespaces(callback) {
			let url = aquapaas_host + "/aquapaas/rest/tagdef/";
			let method = "GET";
			let urlParam = [];
				urlParam.push("app_key=" + paasAppKey);
                urlParam.push("timestamp=" + new Date().toISOString());
				url += "?" + urlParam.join("&");
			$.ajax({
				type: method,
				url: url,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"x-aqua-sign": getPaaS_x_aqua_sign(method, url)
				}
			}).always((resp, status, xhr) => {
				if(status == "success") {
					callback&&callback(resp);
				}
			});
		},
		// 创建命名空间
		createNamespace(callback) {
			let url = aquapaas_host + "/aquapaas/rest/tagdef/" + Pane.namespaces;
			let method = "PUT";
			let urlParam = [];
				urlParam.push("app_key=" + paasAppKey);
                urlParam.push("timestamp=" + new Date().toISOString());
				url += "?" + urlParam.join("&");
			let data = {
				title: "频道分类标签"
			};
			$.ajax({
				type: method,
				url: url,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"x-aqua-sign": getPaaS_x_aqua_sign(method, url)
				},
				data: JSON.stringify(data)
			}).always((resp, status, xhr) => {
				if(status == "success") {
					callback&&callback();
				}
			});
		},
		// 获取列表数据
		getList(pageNum, callback) {
			let url = aquapaas_host + "/aquapaas/rest/tagdef/" + Pane.namespaces;
			let method = "GET";
			let urlParam = [];
			if(!Pane.search.name) {
				urlParam.push("start=" + (pageNum - 1) * this.rowsLmt);
				urlParam.push("end=" + (pageNum * this.rowsLmt));
			}
				urlParam.push("app_key=" + paasAppKey);
                urlParam.push("timestamp=" + new Date().toISOString());
				url += "?" + urlParam.join("&");
			$.ajax({
				type: method,
				url: url,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"x-aqua-sign": getPaaS_x_aqua_sign(method, url)
				}
			}).always((resp, status, xhr) => {
				if(status == "success") {
					if(!Pane.search.name) {
						API.data = resp;
						Pane.table.onTotalCount(xhr.getResponseHeader("x-aqua-total-count"));
						callback&&callback(Model.table(resp));
					} else {
						let data = [];
						for(let i = 0; i < resp.length; i++) {
							if(resp[i].name.includes(Pane.search.name)) {
								data.push(resp[i]);
							}
						}
						API.data = data;
						Pane.table.onTotalCount(data.length);
						callback&&callback(Model.table(data));
					}
				}
			});
		},
		// 删除
		delete(tag_name, callback) {
			let url = aquapaas_host + "/aquapaas/rest/tagdef/" + Pane.namespaces + "/" + tag_name;
			let method = "DELETE";
			let urlParam = [];
				urlParam.push("app_key=" + paasAppKey);
				urlParam.push("timestamp=" + new Date().toISOString());
				url += "?" + urlParam.join("&");
			$.ajax({
				type: method,
				url: url,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"x-aqua-sign": getPaaS_x_aqua_sign(method. url)
				}
			}).always((resp, status, xhr) => {
				if(status == "success") {
					callback&&callback();
				}
			});
		}
	};
	let Model = {
		tag_select(data) {
			let dataList = [];
			for(let i = 0; i < data.length; i++) {
				dataList.push({key: data[i].name, value: data[i].name});
			}
			return dataList;
		},
		table(data) {
			let dataList = [];
			for(let i = 0; i < data.length; i++) {
				let item = data[i];
				let row = [];
				if(item) {
					let opr_edit = "<a name='edit' data-index='" + i + "'>" + i18n("CHANNEL_CATEGORY_TAG_TABLE_OPR_EDIT") + "</a>";
					let opr_del = "<a name='del' data-index='" + i + "'>" + i18n("CHANNEL_CATEGORY_TAG_TABLE_OPR_DEL") + "</a>"
					row.push({
						label: "<div class='table_name'>" + (item.name ? item.name : '') + "</div>"
					});
					row.push({
						label: "<div class='table_title'>" + (item.title ? item.title : '') + "</div>"
					});
					row.push({
						label: "<span>" + [opr_edit, opr_del].join("") + "</span>"
					});
				};
				dataList.push(row);
			}
			return dataList;
		}
	};
	return {
		init() {
			Pane.init();
		}
	}
	
})(jQuery, StyledList, newSelect)