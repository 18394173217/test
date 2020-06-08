var ChannelManagementInfo = (function ($, Table, Combo, DatePicker) {
	let closeCallback;
	let Pane = {
		self: null,
		containerId: null,
		state: null,
		channel_id: null,
		metadata_custom_names: [],
		tab_info: {  // 用来储存绘制input, select, multi_selects, date, time, tag, file的group_name;
			inputs: [],
			selects: [],
			// multi_selects: [],
			dates: [],
			times: [],
			tags: [],
			files: []
		},
		init() {
			this.initInfo();
			this.bindEvents();
			this.initMetadata();
			this.initNotInputInfo();   //加载非input框
			this.loadData();   //加载input框的状态和内容
		},
		initInfo() {
			$.ajax({
				type: "GET",
				url: "content/channel/manage/info.html",
				async: false
			}).done((data) => {
				Pane.self = $(patchHTML(data));
              	$(Pane.containerId).append(Pane.self);
				var btns_list = Model.btns();
				$("#channel_manage_info #channel_manage_info_btns").html(btns_list);   // 加载底部按钮
			})
		},
		// 加载元数据信息
		initMetadata() {
			API.metadata((data) => { // 获取元数据信息
				if(Pane.state == 'view' || Pane.state == 'update') {
					API.getList(Pane.channel_id);   // 获取具体频道信息
				}
				var group_titles = [];
				for(let group_title in data) { // 使用两个for循环是为了将 “自定义”tab放在最后
					if(group_title != "自定义") {
						group_titles.push(group_title);
					}
				}
				for(let group_title in data) {
					if(group_title == "自定义") {
						group_titles.push(group_title);
						if(!API.data.metadata) { // 设置metada初始值
							API.data.metadata = {};
						}
						for(let i = 0; i < data[group_title].children.length; i++) { // 将自定义分组的元数据的名称储存起来
							Pane.metadata_custom_names.push(data[group_title].children[i].name);
						}
					}
				}
				var tabs_list = Model.tabs(group_titles);
				var tabs_contents_list = Model.tabContents(data, group_titles);
				$("#channel_manage_info #channel_manage_info_body .tabs").html(tabs_list);   // 加载tab
				$("#channel_manage_info #channel_manage_info_body .tabs_contents").html(tabs_contents_list);   // 加载tab内容
				$("#channel_manage_info #channel_manage_info_body .tabs .tab_0").addClass('tab_checked');
				$("#channel_manage_info #channel_manage_info_body .tabs_contents .group_0").addClass('group_checked');
				/*$("#channel_manage_info #channel_manage_info_body .group input.channel_id").on("blur", (e) => {
					API.getChannel((channel_ids) => {
						if(channel_ids.includes(Pane.channel_id)) {
							alert("此频道编号已存在！");
						}
					})
				});*/
			});
		},
		// 加载menu、date、time、file类型的标签
		initNotInputInfo() {
			for(let select_i = 0; select_i < Pane.tab_info.selects.length; select_i++) {  // 加载tab中的enum,array
				var group_name = Pane.tab_info.selects[select_i];
 				for(let i = 0; i < API.metadata_list.length; i++) {
					if(group_name == API.metadata_list[i].name) {
						if(API.metadata_list[i].multiple_value == true) { // 是否是多值下拉框
							Pane.initMultiSelect(group_name);
						} else {
							Pane.initSelect(group_name);
						}
					}
				}
			}
			// for(let multi_select_i = 0; multi_select_i < Pane.tab_info.multi_selects.length; multi_select_i++) {  // 加载tab中的enum,array，切为多值
			// 	var group_name = Pane.tab_info.multi_selects[multi_select_i];
			// 	Pane.initMultiSelect(group_name);
			// }
			for(let date_i = 0; date_i < Pane.tab_info.dates.length; date_i++) {  // 加载tab中的date
				var group_name = Pane.tab_info.dates[date_i];
				Pane.initDate(group_name);
			}
			for(let time_i = 0; time_i < Pane.tab_info.times.length; time_i++) {  // 加载tab中的time
				var group_name = Pane.tab_info.times[time_i];
				Pane.initTime(group_name);
			}
			for(let file_i = 0; file_i < Pane.tab_info.files.length; file_i++) {  // 加载tab中的file
				var group_name = Pane.tab_info.files[file_i];
				Pane.initFile(group_name);
			}
		},
		// 单值下拉框
		initSelect(group_name) {
			$("#channel_manage_info #info_select_" + group_name).html('');   // 绘制前先清空
			var data = API.metadata_list;
			var select_list = [], select_obj = [];
        	for(let i = 0; i < data.length; i++){
        		if(data[i].name == group_name){
        			select_list = data[i].value_definition && data[i].value_definition.enum_values || [];
        		}
        	}
			for(let i = 0; i < select_list.length; i++) {
				var item = select_list[i];
				select_obj.push({
					key: item, value: item
				});
			};
			var styles = {
				width: "90%",
				height: "31px",
				background: "#fff",
        		selectbackground: "#f3f3f3",
	            ScrollBarHeight: "200px",
				disablebackground: '#ebebe4',
				color: '#727272',
			};
			var select = new Combo("#channel_manage_info #info_select_" + group_name, select_obj, styles, (value) => {
				let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
				data[group_name] = [value];
			});
			if(Pane.state == 'create') {  // 设置显示数据
	          	select["setAvailable"]();
	          	select.setValue('');
			} else if(Pane.state == 'view') {
	          	select["setDisable"]();
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	          	select.setValue((data[group_name] || data[group_name] == 0) ? data[group_name] : '');
			} else if(Pane.state == 'update') {
	          	select["setAvailable"]();
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	         	select.setValue((data[group_name] || data[group_name] == 0) ? data[group_name] : '');
			}
			for(let i = 0; i < API.metadata_list.length; i++) {
				if(group_name == API.metadata_list[i].name) {
					if(API.metadata_list[i].readonly == true) { // 是否只读
						select["setDisable"]();
					}
				}
			}
		},
		// 多值下拉框
		initMultiSelect(group_name) {
			$("#channel_manage_info #info_select_" + group_name).html('');   // 绘制前先清空
			var data = API.metadata_list;
			var select_list = [], select_obj = [];
        	for(let i = 0; i < data.length; i++){
        		if(data[i].name == group_name){
        			select_list = data[i].value_definition && data[i].value_definition.enum_values || [];
        		}
        	}
			for(let i = 0; i < select_list.length; i++) {
				var item = select_list[i];
				select_obj.push({
					key: item, value: item
				});
			};
			var styles = {
	 			width: "90%",
	 			height: "31px",
				background: "#fff",
	 			border: '1px solid #e2e2e2',
	 			borderRadius: '3px',
	 			ScrollBarHeight: "200px",
				selectBackground: '#f5f7fa',
				disablebackground: '#ebebe4',
				color: '#727272'
	 		};
		    var hintMsg = '请选择选项，支持多选';
			var multi_select = new MultiSelect({
				container: "#channel_manage_info #info_select_" + group_name,
				options: select_obj,
				styles: styles,
				hintMsg: hintMsg,
				callback: (values) => {
					let data;
					if(Pane.metadata_custom_names.includes(group_name)) {
						data = API.data.metadata;
					} else {
						data = API.data;
					}
					data[group_name] = values;
				}
			});
			if(Pane.state == 'create') {  // 设置显示数据
	          	multi_select["setAvailable"]();
	          	multi_select.setValue([]);
			} else if(Pane.state == 'view') {
	          	multi_select["setDisable"]();
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	          	if(data[group_name]) {
	          		multi_select.setValue(data[group_name]);
	          	}
			} else if(Pane.state == 'update') {
	          	multi_select["setAvailable"]();
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	         	if(data[group_name]) {
	          		multi_select.setValue(data[group_name]);
	          	}
			}
			for(let i = 0; i < API.metadata_list.length; i++) {
				if(group_name == API.metadata_list[i].name) {
					if(API.metadata_list[i].readonly == true) { // 是否只读
						multi_select["setDisable"]();
					}
				}
			}
		},
		// date
		initDate(group_name) {
			$("#channel_manage_info #info_date_" + group_name).html('');   //绘制前先清空
			let calendarStyles = {
	            width: 300,
	            navTitleHeight: 30,
	            navTitleBgColor: '#0f84a1',
	            datesViewHeight: 230,
	            datesViewGridColor: '#e2e2e2',
	            datesViewCellColor: '#ffffff',
	            weekdaysHeight: 30,
	            weekdaysColor: '#000000',
	            currMonthColor: '#737373',
	            nonCurrMonthColor: '#e2e2e2',
	            position: 'inherit'
	        };
	        var date = new DatePicker({
	            containerId: "info_date_" + group_name,
	            calendarStyles: calendarStyles,
	            dateInputStyles: {
	              borderColor: '#d3d3d3'
	            },
	            iconImage: 'images/smallCalendarIcon.png'
	        });
	        date.onChange = function () {
	        	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	            data[group_name] = this.inputDateStr;
	        }
	        if(Pane.state == 'create') {
	        	// var dates = Model.getDateTime('dates');
	          	date["enable"]();
	          	// date.jqDateInput.val(dates);
	          	date.jqDateInput.val('');
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	          	// data[group_name] = dates;
	          	data[group_name] = '';
			} else if(Pane.state == 'view') {
	          	date["disable"]();
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	          	date.jqDateInput.val(data[group_name] ? data[group_name] : '');
			} else if(Pane.state == 'update') {
	          	date["enable"]();
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	          	date.jqDateInput.val(data[group_name] ? data[group_name] : '');
			}
			for(let i = 0; i < API.metadata_list.length; i++) {
				if(group_name == API.metadata_list[i].name) {
					if(API.metadata_list[i].readonly == true) { // 是否只读
						date["disable"]();
					}
				}
			}
		},
		// time
		initTime(group_name) {
			$("#channel_manage_info #info_time_" + group_name).html('');   //绘制前先清空
			$("#channel_manage_info #info_time_hour_" + group_name).html('');   //绘制前先清空
			$("#channel_manage_info #info_time_minute_" + group_name).html('');   //绘制前先清空
			$("#channel_manage_info #info_time_second_" + group_name).html('');   //绘制前先清空
			// datepicker
			let calendarStyles = {
	            width: 300,
	            navTitleHeight: 30,
	            navTitleBgColor: '#0f84a1',
	            datesViewHeight: 230,
	            datesViewGridColor: '#e2e2e2',
	            datesViewCellColor: '#ffffff',
	            weekdaysHeight: 30,
	            weekdaysColor: '#000000',
	            currMonthColor: '#737373',
	            nonCurrMonthColor: '#e2e2e2',
	            position: 'inherit'
	        };
	        var date = new DatePicker({
	            containerId: "info_time_" + group_name,
	            calendarStyles: calendarStyles,
	            dateInputStyles: {
	              borderColor: '#d3d3d3'
	            },
	            iconImage: 'images/smallCalendarIcon.png'
	        });
	        date.onChange = function () {
	        	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	            let val = data[group_name];
	            if(val) {
	             	val = this.inputDateStr + ' ' + val.split(' ')[1];
	            } else {
	            	val = this.inputDateStr + " 00:00:00";
	            }
	            data[group_name] = val;
	        }
	        // select
	        let selectStyle = {
	            width: "100%",
	            height: "31",
	            background: "#fff",
        		selectbackground: "#f3f3f3",
	            ScrollBarHeight: "100px",
				color: '#727272',
	        };
	        let hour = [],
	        	minute = [],
	            second = [];
	        for(let i = 0; i < 24; i++) {
	            let item = String(i).padStart(2, "0")
	            hour.push({
	              key: item,
	              value: item
	            });
	        };
	        for(let i = 0; i < 60; i++) {
	            let item = String(i).padStart(2, "0")
	            minute.push({
	              key: item,
	              value: item
	            });
	            second.push({
	              key: item,
	              value: item
	            });
	        };
	        var hour_select = new Combo("#channel_manage_info #info_time_hour_" + group_name, hour, selectStyle, (value) => {
	        	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	        	let val = data[group_name];
	            if(val) {  // 日期创建时存在值
	             	val = val.split(' ')[0] + ' ' + value + ':' + val.split(' ')[1].split(':')[1] + ':' + val.split(' ')[1].split(':')[2];
	            }
	            data[group_name] = val;
			});
			var minute_select = new Combo("#channel_manage_info #info_time_minute_" + group_name, minute, selectStyle, (value) => {
				let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
				let val = data[group_name];
	            if(val) {
	             	val = val.split(' ')[0] + ' ' + val.split(' ')[1].split(':')[0] + ':' + value +  ':' + val.split(' ')[1].split(':')[2];
	            }
	            data[group_name] = val;
			});
			var second_select = new Combo("#channel_manage_info #info_time_second_" + group_name, second, selectStyle, (value) => {
				let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
				let val = data[group_name];
	            if(val) {
	             	val = val.split(' ')[0] + ' ' + val.split(' ')[1].split(':')[0] + ':' + val.split(' ')[1].split(':')[1] + ':' + value;
	            }
	            data[group_name] = val;
			});
			if(Pane.state == 'create') {
				/*var dates = Model.getDateTime('dates');
	        	var hours = Model.getDateTime('hours');
	        	var minutes = Model.getDateTime('minutes');
	        	var seconds = Model.getDateTime('seconds');*/
	          	date["enable"]();
	          	hour_select["setAvailable"]();
	          	minute_select["setAvailable"]();
	          	second_select["setAvailable"]();
	          	/*date.jqDateInput.val(dates);
	          	hour_select.setValue(hours);
	          	minute_select.setValue(minutes);
	          	second_select.setValue(seconds);*/
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	          	// data[group_name] = dates + ' ' + hours + ':' + minutes + ':' + seconds;
	          	data[group_name] = null;
			} else if(Pane.state == 'view') {
				date["disable"]();
				hour_select["setDisable"]();
	          	minute_select["setDisable"]();
	          	second_select["setDisable"]();
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	          	date.jqDateInput.val(data[group_name] ? data[group_name].split(' ')[0] : '');
	          	hour_select.setValue(data[group_name] ? data[group_name].split(' ')[1].split(':')[0] : '');
	          	minute_select.setValue(data[group_name] ? data[group_name].split(' ')[1].split(':')[1] : '');
	          	second_select.setValue(data[group_name] ? data[group_name].split(' ')[1].split(':')[2] : '');
			} else if(Pane.state == 'update') {
				date["enable"]();
				hour_select["setAvailable"]();
	          	minute_select["setAvailable"]();
	          	second_select["setAvailable"]();
	          	let data;
				if(Pane.metadata_custom_names.includes(group_name)) {
					data = API.data.metadata;
				} else {
					data = API.data;
				}
	          	date.jqDateInput.val(data[group_name] ? data[group_name].split(' ')[0] : '');
	          	hour_select.setValue(data[group_name] ? data[group_name].split(' ')[1].split(':')[0] : '');
	          	minute_select.setValue(data[group_name] ? data[group_name].split(' ')[1].split(':')[1] : '');
	          	second_select.setValue(data[group_name] ? data[group_name].split(' ')[1].split(':')[2] : '');
			}
			for(let i = 0; i < API.metadata_list.length; i++) {
				if(group_name == API.metadata_list[i].name) {
					if(API.metadata_list[i].readonly == true) { // 是否只读
						date["disable"]();
						hour_select["setDisable"]();
	          			minute_select["setDisable"]();
	          			second_select["setDisable"]();
					}
				}
			}
		},
		// file
		initFile(group_name) {
			let _this = this;
			$("#channel_manage_info #info_file_" + group_name).html('');   //绘制前先清空
			let data;
			if(Pane.metadata_custom_names.includes(group_name)) {
				data = API.data.metadata;
			} else {
				data = API.data;
			}
			let file_name;
			for(let item in data) {
				if(item == group_name){
        			file_name = data[item] || '';
        		}
			}
			if(Pane.state == 'create') {  // 设置显示数据
	          	$("#channel_manage_info #info_file_" + group_name).html(i18n("CHANNEL_MANAGE_INFO_FILE_HINT"));   //默认显示
	          	$("#channel_manage_info #info_file_" + group_name).css({'background-color': ''});
	          	$("#channel_manage_info #btn_upload_" + group_name).css({cursor: 'pointer'});
			} else if(Pane.state == 'view') {
	          	$("#channel_manage_info #info_file_" + group_name).html(file_name);   //默认显示
	          	$("#channel_manage_info #info_file_" + group_name).css({'background-color': '#ebebe4'}); // 禁用
	          	$("#channel_manage_info #btn_upload_" + group_name).css({cursor: 'default'});
			} else if(Pane.state == 'update') {
	          	$("#channel_manage_info #info_file_" + group_name).html(file_name);   //默认显示
	          	$("#channel_manage_info #info_file_" + group_name).css({'background-color': ''});
	          	$("#channel_manage_info #btn_upload_" + group_name).css({cursor: 'pointer'});
			}
			for(let i = 0; i < API.metadata_list.length; i++) {
				if(group_name == API.metadata_list[i].name) {
					if(API.metadata_list[i].readonly == true) { // 是否只读
						$("#channel_manage_info #info_file_" + group_name).css({'background-color': '#ebebe4'}); // 禁用
	          			$("#channel_manage_info #btn_upload_" + group_name).css({cursor: 'default'});
					}
				}
			}
			// 上传按钮
			if(Pane.state == 'create' || Pane.state == 'update') {  // 绑定上传事件
	          	$("#channel_manage_info #btn_upload_" + group_name).unbind().bind('click', (e) => {
	          		let channel_id = $("#channel_manage_info #channel_manage_info_body .group input.channel_id").val();  // 获取频道编号的值
	          		if(channel_id) {
						let files_upload = new ChannelUpload({
		          			state: 'upload',
		          			channel_id: channel_id,
		          			group_name: group_name,
		          			callback: (back_url) => {
								$("#channel_manage_info #info_file_" + group_name).html(back_url).attr("title", back_url);
								data[group_name] = back_url;
		          			}
		          		});
					} else {
						alert('请先输入频道编号！');
					}
	          	})
			}
		},
		// input、tag
		loadData() {
			if(Pane.state == 'view') {  //查看
				$("#channel_manage_info #channel_manage_info_body .group input").attr("disabled", "disabled");
				$("#channel_manage_info #channel_manage_info_body .group .info_tag").attr("disabled", "disabled");
			} else if(Pane.state == 'update') {  // 编辑
				$("#channel_manage_info #channel_manage_info_body .group input.channel_id").attr("disabled", "disabled");
			}
			if(Pane.state == 'view' || Pane.state == 'update') {
				let data = API.data;
				for(let item in data) {
					if(item == 'metadata') { // 自定义分组的元数据对应的input、tag
						for(let item_metadata in data.metadata) {
							if(Pane.tab_info.inputs.includes(item_metadata)) {
								$("#channel_manage_info #channel_manage_info_body .group input." + item_metadata).val(data.metadata[item_metadata]);
							} else if(Pane.tab_info.tags.includes(item_metadata)) {
								API.getTags(item_metadata, (tags) => { // 获取tag对应的元数据
									var value = Model.tags(data.metadata[item_metadata], tags);
									$("#channel_manage_info #channel_manage_info_body .group .info_tag." + item_metadata).html(value.join(','));
								});
							}
						}
						for(let i = 0; i < API.metadata_list.length; i++) {
							if(item_metadata == API.metadata_list[i].name) {
								if(API.metadata_list[i].readonly == true) { // 是否只读
									$("#channel_manage_info #channel_manage_info_body .group input." + item_metadata).attr("disabled", "disabled");
									$("#channel_manage_info #channel_manage_info_body .group .info_tag." + item_metadata).attr("disabled", "disabled");
								}
							}
						}
					} else { // 非自定义分组的元数据对应的input、tag
						if(Pane.tab_info.inputs.includes(item)) {
							$("#channel_manage_info #channel_manage_info_body .group input." + item).val(data[item]);
						} else if(Pane.tab_info.tags.includes(item)) {
							API.getTags(item, (tags) => { // 获取tag对应的元数据
								var value = Model.tags(data[item], tags);
								$("#channel_manage_info #channel_manage_info_body .group .info_tag." + item).html(value.join(','));
							});
						}
					}
					for(let i = 0; i < API.metadata_list.length; i++) {
						if(item == API.metadata_list[i].name) {
							if(API.metadata_list[i].readonly == true) { // 是否只读
								$("#channel_manage_info #channel_manage_info_body .group input." + item).attr("disabled", "disabled");
								$("#channel_manage_info #channel_manage_info_body .group .info_tag." + item).attr("disabled", "disabled");
							}
						}
					}
				}
			} else {
				for(let i = 0; i < API.metadata_list.length; i++) {
					if(API.metadata_list[i].type != 'enum' && API.metadata_list[i].type != 'array' && API.metadata_list[i].type != 'date' && API.metadata_list[i].type != 'time' && API.metadata_list[i].type != 'file') {
						if(API.metadata_list[i].readonly == true) { // 是否只读
							$("#channel_manage_info #channel_manage_info_body .group input." + API.metadata_list[i].name).attr("disabled", "disabled");
							$("#channel_manage_info #channel_manage_info_body .group .info_tag." + API.metadata_list[i].name).attr("disabled", "disabled");
						}
					}
				}
			}
		},
		bindEvents() {
			var _this = this;
			// tab切换
			$("#channel_manage_info #channel_manage_info_body .tabs").on("click", ".tab", (e) => {
				let index = $(e.target).data("index");
				$("#channel_manage_info #channel_manage_info_body .tabs .tab").removeClass("tab_checked");
				$("#channel_manage_info #channel_manage_info_body .tabs .tab_" + index).addClass("tab_checked");
				$("#channel_manage_info #channel_manage_info_body .tabs_contents .group").removeClass("group_checked");
				$("#channel_manage_info #channel_manage_info_body .tabs_contents .group_" + index).addClass("group_checked");
			});
			// 打开tag元数据页面
			$("#channel_manage_info .tabs_contents")
			.on("click", ".info_tag", (e) => {
				if(Pane.state == 'create' || Pane.state == 'update') {
					let type = $(e.target).data('type');
					let channel_id = $("#channel_manage_info #channel_manage_info_body .group input.channel_id").val();  // 获取频道编号的值
	          		if(channel_id) {
	          			let title = '';
						for(let i = 0; i < API.metadata_list.length; i++) {
							if(type == API.metadata_list[i].name) {
								title = API.metadata_list[i].title;
							}
						}
						let data;
						if(Pane.metadata_custom_names.includes(type)) {
							data = API.data.metadata;
						} else {
							data = API.data;
						}
						let tag_dialog = new ChannelManageTag({
							type: type,
							title: title,
							tag_names: data[type],
							closeFn: (tag_names) => {
								if(tag_names.length > 0) {
									API.getTags(type, (tags) => { // 获取tag对应的元数据
										let value = Model.tags(tag_names, tags);
										$("#channel_manage_info #channel_manage_info_body .group .info_tag." + type).html(value.join(','));
										data[type] = tag_names;
									});
								} else {
									$("#channel_manage_info #channel_manage_info_body .group .info_tag." + type).html("");
									data[type] = [""];
								}
				            }
						});
					} else {
						alert('请先输入频道编号！');
					}
				}
			});
			// 底部按钮
			$("#channel_manage_info #channel_manage_info_btns")
			.on("click", ".cancel, .return", (e) => {   // 取消，返回
				_this.backHome();
			})
			.on("click", ".btn.submit", (e) => {  // 保存或更新
				// tab中input
				for(let input_i = 0; input_i < Pane.tab_info.inputs.length; input_i++) {  // 加载tab中的enum,array
					var group_name = Pane.tab_info.inputs[input_i];
					var value = $("#channel_manage_info #channel_manage_info_body .group input." + group_name).val();
					if(group_name == "channel_id") {
						if(value) {
							Pane.channel_id = value;
						} else {
							Pane.channel_id = null;
						}
					} else {
						let data;
						if(Pane.metadata_custom_names.includes(group_name)) {
							API.data.metadata = API.data.metadata ? API.data.metadata : {};
							data = API.data.metadata;
						} else {
							data = API.data;
						}
						if(value) {
							data[group_name] = value;
						} else {
							data[group_name] = null;
						}
					}
				}
				API.data = Model.convertNumber(API.data);
				Model.sendable(API.data, (ret, metadata_group, metadata_name) => { // 检查必填参数
					if(ret) {
						if(Pane.state == 'update') { // 编辑更新调用的接口
							API.setChannel(Pane.channel_id, Pane.state, () => {
								_this.backHome();
								closeCallback && closeCallback();
							});
						} else { // 创建保存调用的接口
							API.getChannel((channel_ids) => {
								if(!channel_ids.includes(Pane.channel_id)) {
									API.setChannel(Pane.channel_id, Pane.state, () => {
										_this.backHome();
										closeCallback && closeCallback();
									});
								} else {
									alert("此频道编号已存在！");
								}
							})
						}
					} else {
						alert('请输入"' +  metadata_group+ '"Tab中的"' + metadata_name + '"');
					}
				});
			});
		},
		backHome() {  // 返回首页；
			Pane.self.remove();
			Pane.tab_info = {
				inputs: [],
				selects: [],
				// multi_selects: [],
				dates: [],
				times: [],
				tags: [],
				files: []
			};
			API.data = {};
		}
	};
	let API = {// 获取tab信息以及tab信息内容
		data: {},
		metadata_list: [],
		tags: [],
		metadata(callback) {
		    let url = aquapaas_host + "/aquapaas/rest/assetdef/metadata/channel?";
		    let method = "GET";
		    $.ajax({
				url: url,
				type: method,
		        async: false,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				}
		    }).always((resp, status, xhr)=>{
		        if (status == "success") {
		        	API.metadata_list = resp;
		        	callback&&callback(Model.metadata(resp));
		        } else {
		        	callback&&callback([]);
		        }
		    });
		},
		getChannel(callback) {
			let url = aquapaas_host + "/aquapaas/rest/scheduleinfo/channels/";
			let method = "POST";
			var data = {};
			$.ajax({
				url: url,
				type: method,
				async: true,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: JSON.stringify(data)
			})
			.done((resp, status, xhr) => {
				if(status == "success"){
					let channel_ids = [];
					for(let i = 0; i < resp.length; i++) {
						channel_ids.push(resp[i].channel_id)
					}
					callback&&callback(channel_ids);
				}
			})
		},
		// 获取tag信息
		getTags(tag, callback) {
		  	let url = aquapaas_host + "/aquapaas/rest/tagdef/channel_" + tag;
			let method = "GET";
			let urlParam = [];
				urlParam.push("app_key=" + paasAppKey);
                urlParam.push("timestamp=" + new Date().toISOString());
				url += "?" + urlParam.join("&");
			$.ajax({
				type: method,
				url: url,
		        async: false,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"x-aqua-sign": getPaaS_x_aqua_sign(method, url)
				}
			}).always((resp, status, xhr) => {
				if(status == "success") {
					callback&&callback(resp)
				}
			});
	    },
		// 根据 channel_id查询
		getList(channel_id, callback) {
			let url = aquapaas_host + "/aquapaas/rest/scheduleinfo/channel/" + channel_id;
			let method = "GET";
			$.ajax({
				url: url,
				type: method,
		        async: false,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				}
			}).always((resp, status, xhr) => {
				if(status == "success"){
					API.data = resp;
					callback&&callback();
				}
			})
		},
		// 创建频道
		setChannel(channel_id, state, callback) {
			let url = aquapaas_host + "/aquapaas/rest/scheduleinfo/channel/" + channel_id;
			let method = "POST";
			if(state == 'update') {
				method = "PUT";
			}
			$.ajax({
				url: url,
				type: method,
	        	async: true,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				data: JSON.stringify(API.data)
			}).always((resp, status, xhr) => {
				if(status == 'success') {
					callback&&callback();
				}
			});
		}
	};
	let Model = {
		// 获取tab信息以及tab信息内容
		metadata(resp) {
			resp.sort((a, b) => {
		        return(a.representation && a.representation.group_title || "").localeCompare(b.representation && b.representation.group_title || "");
		    });
			var metadata_list = {};
			for(let i = 0; i < resp.length; i++){
				var item = resp[i];
				var group_title = item.representation && item.representation.group_title || "";
				if(!metadata_list[group_title]){
					metadata_list[group_title] = {
						name: group_title,
						children: []
					}
				}
				metadata_list[group_title].children.push(item);
			}
			for(let group_name in metadata_list){
				metadata_list[group_name].children.sort((a, b) => {
		            return parseInt(a.representation && a.representation.sequence || 0) - parseInt(b.representation && b.representation.sequence || 0)
		        })
			}
			return metadata_list;
		},
		tabs(group_titles) {
			var tabs_list = '';
			for(let i = 0; i < group_titles.length; i++) {
				var item = group_titles[i];
				tabs_list += '<div class="tab tab_' + i + '" data-index=' + i + ' title="' + item + '">' + item + '</div>';
			}
			return tabs_list;
		},
		tabContents(data, group_titles) {
			var tab_contents_list = '';
			for(let i = 0; i < group_titles.length; i++) {
				let tab_contents = data[group_titles[i]].children;
				let row = '<div class="tab_info"></div><div  class="tab_info_msg"><div class="tab_info_group_title">' + data[group_titles[i]].name + '</div></div>';
				for(let j = 0; j < tab_contents.length; j++) {
					var item = tab_contents[j];
					if(item.type == 'enum' || item.type == 'array') {  // select
						if(item.mandatory == true) {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})<label style="color: red;display: inline-block">*</label></label><div class="${item.name}" id=info_select_${item.name}></div></div>`;
						} else {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})</label><div class="${item.name}" id=info_select_${item.name}></div></div>`;
						}
						// if(item.multiple_value == true) { // 是否是多值下拉框
						// 	Pane.tab_info.multi_selects.push(item.name);
						// } else {
							Pane.tab_info.selects.push(item.name);
						// }
					} else if(item.type == 'date') {  // datepicker
						if(item.mandatory == true) {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})<label style="color: red;display: inline-block">*</label></label><div class="date_picker ${item.name}" id=info_date_${item.name}></div></div>`;
						} else {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})</label><div class="date_picker ${item.name}" id=info_date_${item.name}></div></div>`;
						}
						Pane.tab_info.dates.push(item.name);
					} else if(item.type == 'time' || item.type == 'datatime') {  // datepicker + select * 3
						if(item.mandatory == true) {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})<label style="color: red;display: inline-block">*</label></label><div class="_dialog_row"><div class="date_picker ${item.name}" id=info_time_${item.name}></div><div class="info_time_select ${item.name}" id=info_time_hour_${item.name}></div><label>时</label><div class="info_time_select ${item.name}" id=info_time_minute_${item.name}></div><label>分</label><div class="info_time_select ${item.name}" id=info_time_second_${item.name}></div><label>秒</label></div></div>`;
						} else {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})</label><div class="_dialog_row"><div class="date_picker ${item.name}" id=info_time_${item.name}></div><div class="info_time_select ${item.name}" id=info_time_hour_${item.name}></div><label>时</label><div class="info_time_select ${item.name}" id=info_time_minute_${item.name}></div><label>分</label><div class="info_time_select ${item.name}" id=info_time_second_${item.name}></div><label>秒</label></div></div>`;
						}
						Pane.tab_info.times.push(item.name);
					} else if(item.type == 'tag') {  // tag
						if(item.mandatory == true) {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})<label style="color: red;display: inline-block">*</label></label><div class="info_tag ${item.name}" id=info_tag_${item.name} data-type="${item.name}"></div></div>`;
						} else {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})</label><div class="info_tag ${item.name}" id=info_tag_${item.name} data-type="${item.name}"></div></div>`;
						}
						Pane.tab_info.tags.push(item.name);
					} else if(item.type == 'file') {  // file
						if(item.mandatory == true) {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})<label style="color: red;display: inline-block">*</label></label><div style="display: flex;"><div class="file_upload ${item.name}" id=info_file_${item.name}></div><input id=upload_${item.name} type="file" style="display: none;"><div class="btn_upload" id=btn_upload_${item.name}></div></div></div>`;
						} else {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})</label><div style="display: flex;"><div class="file_upload ${item.name}" id=info_file_${item.name}></div><input id=upload_${item.name} type="file" style="display: none;"><div class="btn_upload" id=btn_upload_${item.name}></div></div></div>`;
						}
						Pane.tab_info.files.push(item.name);
					} else {  // input
						if(item.mandatory == true) {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})<label style="color: red;display: inline-block">*</label></label><input class="${item.name}"></input></div>`;
						} else {
							row += `<div class="widget ${item.name}"><label>${item.title} (${item.name})</label><input class="${item.name}"></input></div>`;
						}
						Pane.tab_info.inputs.push(item.name);
					}
				}
				tab_contents_list += '<div class="group group_' + i + '" data-index=' + i + '>' + row + '</div>';
			}
			return tab_contents_list;
		},
		btns() {
			var status = Pane.state;
			var btns = '';
			switch(status){
				case 'create':
				case 'update':
					btns += '<div class="btn cancel">' + i18n("CHANNEL_MANAGE_INFO_CANCEL") + '</div><div class="btn submit">' + i18n("CHANNEL_MANAGE_INFO_" + status.toLocaleUpperCase()) + '</div>';
					break;
				case 'view':
					btns += '<div class="btn return">' + i18n("CHANNEL_MANAGE_INFO_RETURN") + '</div>';
					break;
				default:
					break;
			}
			return btns;
		},
		// 将tag的name换成title来显示
		tags(tag_titles, tags) {
			var tag_list = [];
			for(let i = 0; i < tags.length; i++) {
				for(let j = 0; j < tag_titles.length; j++) {
					if(tag_titles[j] == tags[i].name) {
						tag_list.push(tags[i].title);
					}
				}
			}
			return tag_list;
		},
		// 验证必填数据
		sendable(data, callback) {
			var ret = true,
				metadata = API.metadata_list,
				metadata_group,
				metadata_name;   // 必填数据
		    for(let i = 0; i < metadata.length; i++) {
		    	if(metadata[i].mandatory == true) {
		    		var item = metadata[i].name;
		    		if(item == 'channel_id') { // 由于channel_id从API.data中独立了出来，所以进行单独的判断
		    			if(!!!Pane.channel_id) {
				    		ret = false;
				    		metadata_group = metadata[i].representation.group_title;
				    		metadata_name = metadata[i].name;
		    				callback&&callback(ret, metadata_group, metadata_name);
		    				return;
				    	} else {
				    		ret = true;
				    	}
		    		} else {
		    			if(!!!data[item]) {
				    		ret = false;
				    		metadata_group = metadata[i].representation.group_title;
				    		metadata_name = metadata[i].name;
				    		callback&&callback(ret, metadata_group, metadata_name);
		    				return;
				    	} else {
				    		ret = true;
				    	}
		    		}
		    	}
		    };
		    callback&&callback(ret, metadata_group, metadata_name);
    	},
    	// 处理日期和时间
    	getDateTime(type) {
    		var date_time = '',
				years = new Date().getFullYear(),  //获取年份
				months = new Date().getMonth() + 1,  //加载月份
				dates = new Date().getDate(),  //加载日期
				hours = new Date().getHours(),  //加载时
				minutes = new Date().getMinutes(),  //加载分
				seconds = new Date().getSeconds();  //加载秒
    		if(type == 'dates') {
    			date_time = years + '-' + months.toString().padStart(2, '0') + '-' + dates.toString().padStart(2, '0');
    		} else if(type == 'hours') {
    			date_time = hours.toString().padStart(2, '0');
    		} else if(type == 'minutes') {
    			date_time = minutes.toString().padStart(2, '0');
    		} else if(type == 'seconds') {
    			date_time = seconds.toString().padStart(2, '0');
    		}
    		return date_time;
    	},
    	// 将要传入的参数type: int类型的 强制转换
    	convertNumber(data) {
    		var metadata = API.metadata_list;
		    for(let i = 0; i < metadata.length; i++) {
		    	if(metadata[i].type == 'int' && data[metadata[i].name]) {
		    		data[metadata[i].name] = Number(data[metadata[i].name]);
		    	}
		    };
		    return data;
    	}
	};
	return function(opts) {
		Pane.containerId = opts.containerId;
		Pane.state = opts.state;
		Pane.channel_id = opts.channel_id;
		closeCallback = opts.closeFn;
		Pane.init();
	}
})(jQuery, StyledList, newSelect, DatePicker)