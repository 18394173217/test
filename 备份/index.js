define(['jquery', 'StyleableList', 'StyledSelector', 'PopupDialog', 'Alert', 'DatePicker', 'VideoPlayer', 'NewSelect'], function($, StyleableList, StyledSelector, PopupDialog, Alert, DatePicker, VideoPlayer, NewSelect){
    var VideoAudit = function(){};
      VideoAudit.prototype = {
      $root: null,
      init(id) {
        var _this = this;
        this.$root = $('#' + id)
        $.get('content/menuVideoAudit/index.html', function(data) {
          var html = patchHTML(data)
          _this.$root.empty().append(html);
          _this.bindEventsParticular();
        })
      },
      // 绑定详情页的事件
      bindEventsParticular() {
        var _this = this;
        $("#btn_show").bind('click', function() {
          _this.showParticular();
        });
        $('#particular .title_head .right .btn').bind('click', function() {
          _this.closeParticular();
        });
        // 模拟点击详情按钮进行测试
        _this.showParticular();
      },
      // show particular
      showParticular() {
        var _this = this;
        _this.showVideoPlay();
        _this.showResultDetail();
        _this.showSelect();
        _this.showPosterImg();
        // 以下三种加载一种
        // _this.showPosterList();
        _this.showListTable();
        document.getElementById('particular').style.display = 'block';
      },
      // close particular
      closeParticular() {
        document.getElementById('particular').style.display = 'none';
      },
      // 加载视频
      showVideoPlay() {
        var video_play = new VideoPlayer({
          container: '#video_player',
          left: 20,
          top: 10,
          width: 190,
          height: 130,
          src: 'https://mediascreening-beijing.oss-cn-beijing.aliyuncs.com/INPUT/DIR1/4%20-%206%20-%202-6%20%E4%BB%80%E9%BA%BC%E6%89%8D%E6%98%AF%E3%80%8C%E6%88%90%E5%8A%9F%E3%80%8D%EF%BC%9F.mp4'
        });
      },
      // 加载识别结果明细列表
      showResultDetail() {
        var title = [
          {label: ''},
          {label: '标记'},
          {label: '可信度'},
          {label: '建议'},
          {label: ''},
          {label: '标记'},
          {label: '可信度'},
          {label: '建议'}
        ];
        var style = {
          titleBg: "#45d1f4",
          titleColor: "#FFFFFF",
          cellBg: "white",
          evenBg: "#F5FDFF",
          cellColor: "#797979",
          columnsWidth: [0.14, 0.14, 0.14, 0.08, 0.14, 0.14, 0.14, 0.08]
        }
        var result_table = new StyleableList({
          container: $('#detail_table'),
                  rows: 4,
                  columns: 8,
                  titles: title,
                  styles: style,
                  listType: 0,
          async: true,
          data: []
        });
        result_table.create();
      },
      // 加载识别详情下拉框
      showSelect() {
        var selectData = [{
          name: 'LOGO识别详情',
          value: 0,
        }, {
          name: '语音检测',
          value: 1,
        }, {
          name: '智能鉴黄',
          value: 2,
        }, {
          name: '暴恐涉政',
          value: 3,
        }, {
          name: '不良场景',
          value: 4,
        }, {
          name: '视频敏感人脸',
          value: 5,
        }, {
          name: '视频标签识别',
          value: 6,
        }, {
          name: '广告识别',
          value: 7,
        }];
        var style = {
          width: 160,
          height: 30,
          headerBorderColor: "#d9d9d9",
          fontSize: 16,
          headerColor: '#999',
          headerBorderRadius: 20,
          background: '#fff',
          openIconUrl: "./uiWidget/images/select_open1.png",
          closeIconUrl: "./uiWidget/images/select_close1.png",
        };
        var select = new NewSelect('#recognition_select', selectData, style, function(value) {
          console.log('value==',selectData[value].name)
        })
        this.select = select;
      },
      // 加载海报式识别详情
      showPosterImg() {
        var particularData = [];
        particularData.length = 10;
        var dom = `
        <div class="row">
            <div class="col left">
                <div class="background_img" id="particular_poster_img_left"></div>
                <div class="background_time">
                    <div class="time"></div>
                    <div class="creat_time" id="particular_poster_time_left"></div>
                    <div class="time"></div>
                </div>
            </div>
            <div class="col right">
                <div class="background_img" id="particular_poster_img_right"></div>
                <div class="background_time">
                    <div class="time"></div>
                    <div class="creat_time" id="particular_poster_time_right"></div>
                    <div class="time"></div>
                </div>
            </div>
        </div>`;
        var content = $('#particular_poster_content');
        for(var i = 0; i < (particularData.length / 2); i++) {
          content.append(dom)
        }
      },
      // 加载海报式识别详情列表
      showPosterList() {
        var style = {
          titleBg: "#45d1f4",
          titleColor: "#FFFFFF",
          cellBg: "white",
          evenBg: "#F5FDFF",
          cellColor: "#797979",
          columnsWidth: [0.15, 0.55, 0.15, 0.15]
        }
        var title = [
          {label: '标记'},
          {label: '名称'},
          {label: '类型'},
          {label: '可信度'},
        ];
        var poster_list = new StyleableList({
          container: $('#particular_poster_content_list'),
                  rows: 10,
                  columns: 4,
                  titles: title,
                  styles: style,
                  listType: 0,
          async: true,
          data: []
        });
        poster_list.create();
      },
      // 加载列表式识别详情
      showListTable(type) {
        // type = 'logo'
        // var title, style;
        // logo
        // var logo_title = [
        var title = [
          {label: '标记'},
          {label: '名称'},
          {label: '类型'},
          {label: '可信度'},
          {label: '视频帧'},
          {label: '位置'},
        ];
        // var columnsWidth = [0.1, 0.5, 0.1, 0.1, 0.1, 0.1];
  
        // var styles = {
        var style = {
          titleBg: "#45d1f4",
          titleColor: "#FFFFFF",
          cellBg: "white",
          evenBg: "#F5FDFF",
          cellColor: "#797979",
          columnsWidth = [0.1, 0.5, 0.1, 0.1, 0.1, 0.1],
        }
        // styles.push(columnsWidth);
  
        // if(type == 'logo') {
        //   title = logo_title;
        //   style = styles;
        // }
        var list_table = new StyleableList({
          container: $('#content_list_table'),
                  rows: 10,
                  columns: 6,
                  titles: title,
                  styles: style,
                  listType: 0,
          async: true,
          data: []
        });
        list_table.create();
      },
  
  
      };
      return VideoAudit;
  });
  