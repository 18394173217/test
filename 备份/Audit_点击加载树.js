define(['jquery', 'StyleableList', 'mCustomScrollbar', 'NewPaging', 'jquery.ztree', 'OSS'],
  function($, StyleableList, mCustomScrollbar, NewPaging, Tree, oss){
  let menuPrioityAudit = function(){};
  menuPrioityAudit.prototype = {
    init(id) {
      $.get('content/menuPriorityAudit/index.html').always((resp, status, xhr) => {
        if(status == 'success') {
          let html = patchHTML(resp);
          $('#' + id).empty().append(html);
          Pane.init();
        } else {
          $('#' + id).empty().append('404');
        }
      });
    }
  };
  let Pane = {
    init() {
      this.set_mCustomScrollbar();
      this.bindEvents();
      this.initTable(0, 20);
      this.initPaging();
    },
    // 加载tree
    initTree(type) {
        let _this = this;
        $('#priority_audit .left_nav .tree').html('');
        $('#priority_audit .left_nav').mCustomScrollbar('scrollTo', 0);
        // window.scrollTo(0, 0);  // 将页面滚动条回归顶部
        Tree.init(
          $('#priority_audit #' + type), {
            // async: {
            //   enable: true,
            //   url: API.getURL,
            //   type: 'Get',
            //   headers: {
            //     'Accept': 'application/json',
            //     'Content-Type': 'application/json'
            //   }
            // },
            view: {
              dblClickExpand: false, // 禁用双击
              addDiyDom: (treeId, treeNode) => {
                if ($('#' + treeNode.tId + ' > a').hasClass('level0')) {
                  // let icon = '<span class="icon_tree"></span>';
                  // $('#' + treeNode.tId + ' > a').append(icon);
                } else {
                  let icon = '<span class="icon_tree"></span>';
                  $('#' + treeNode.tId).append(icon);
                }
              }
            },
            callback: {
              beforeClick: function(treeId, treeNode, clickFlag) {
                if (treeNode.level == 0) {
                  return false; // 禁用level0的节点
                }
              },
              onClick: function(e, treeId, treeNode, clickFlag) {
                API.name = treeNode.name;
                _this.initTable(0, 20);
                _this.initPaging();
              }
            }
          }, 
          API.getTree(type) // 储存树数据的数组
        );
    },
    // 根据tree获取的name，加载table
    initTable(start, end) {
      $('#priority_audit #priority_audit_table .mCSB_container').html('');
      $('#priority_audit #priority_audit_table').mCustomScrollbar('scrollTo', 0);
      // window.scrollTo(0, 0);  // 将页面滚动条回归顶部
      let titles = [
        {label: i18n('PRIORITY_AUDIT_TABLE_NAME')},
        {label: i18n('PRIORITY_AUDIT_TABLE_SIZE')},
        {label: i18n('PRIORITY_AUDIT_TABLE_TIME')},
        {label: i18n('PRIORITY_AUDIT_TABLE_PRIOEITY')},
        {label: i18n('PRIORITY_AUDIT_TABLE_STATE')},
        {label: i18n('PRIORITY_AUDIT_TABLE_OPR')}
      ];
      let styles = {
        titleColor: '#FFFFFF',
        cellBg: 'white',
        evenBg: '#F5FDFF',
        cellColor: '#797979',
        columnsWidth: [0.28, 0.14, 0.14, 0.13, 0.13, 0.18]
      };
      let data = API.getList(start, end);
      let table = new StyleableList({
        container: $('#priority_audit_table .mCSB_container'),
        rows: Math.max(13, data.length),
        columns: titles.length,
        titles: titles,
        styles: styles,
        listType: 0,
        async: true,
        data: data
      });
      table.create();
    },
    // 根据返回的数据加载分页
    initPaging() {
      let _this = this;
      let total = API.getList().length;
      let paging_styles = {
        height: '45px',
        pageWidth: '25px',
        pageHeight: '25px',
        pageBorder: '1px solid #f2f2f2',
        pageCheckedBackground: '#fe931f',
        pageFontSize: '14px',
        rowWidth: '40px',
        rowHeight: '40px',
        rowCheckedColor: '#27b2d5',
      }
      let paging = new NewPaging({
        container: '#priority_table_paging',
        total: total,
        rows: [20, 50, 100],
        styles: paging_styles,
        callback: (current_page, row) => {
          _this.initTable((current_page - 1) * row, current_page * row)
        }
      })
    },
    // 事件绑定
    bindEvents() {
      let _this = this;
      // 左侧导航点击
      $('#priority_audit .nav.priority').unbind().bind('click', (e) => { // 当前优先列表
        if($('#priority_audit .left_nav #priority_tree').is(':hidden')) {
          _this.initTree('priority_tree');
          $('#priority_audit .nav.working').removeClass('checked');
          $('#priority_audit .nav.priority').addClass('checked');
          $('#priority_audit .left_nav #working_tree').hide();
          $('#priority_audit .left_nav #priority_tree').show();
        } else {
          // API.name = '';
          // _this.initTable(0, 20);
          // _this.initPaging();
          // $('#priority_audit .nav.priority').removeClass('checked');
          $('#priority_audit .left_nav #priority_tree').hide();
        }
      });
      $('#priority_audit .working').unbind().bind('click', (e) => { // 当前工作列表
        if($('#priority_audit .left_nav #working_tree').is(':hidden')) {
          _this.initTree('working_tree');
          $('#priority_audit .nav.priority').removeClass('checked');
          $('#priority_audit .nav.working').addClass('checked');
          $('#priority_audit .left_nav #priority_tree').hide();
          $('#priority_audit .left_nav #working_tree').show();
        } else {
          API.name = '';
          _this.initTable(0, 20);
          _this.initPaging();          
          $('#priority_audit .nav.working').removeClass('checked');
          $('#priority_audit .left_nav #working_tree').hide();
        }
      });
      // 列表操作事件绑定
      $('#priority_audit #priority_audit_table')
      .on('click', '.btn.cancal_priority', (e) => { // 取消优先
        let index = $(e.target).data('index');
        console.log('cancal_priority', index);
      })
      .on('click', '.btn.set_priority', (e) => { // 设置优先
        let index = $(e.target).data('index');
        console.log('set_priority', index);
      })
    },
    // 加载滚动条
    set_mCustomScrollbar() {
      $('#priority_audit #priority_audit_table').mCustomScrollbar({ // table列表的滚动条
        axis: 'y',
        theme: 'light-4'
      });
      $('#priority_audit .left_nav').mCustomScrollbar({ // left_nav的滚动条
        axis: 'y',
        theme: 'light-4'
      });
    }
  };
  let API = {
    name: '',
    // 获取tree
    getTree(type) {
      let data = [];
      if(type == 'priority_tree') {
        data  = [{
          name: 'Bucket/INPUT',
          isParant: true,
          open: true,
          children: [
            {name: 'priority_tree目录名称-01'},
            {name: 'priority_tree目录名称-02'},
            {name: 'priority_tree目录名称-03'},
            {name: 'priority_tree目录名称-04'},
            {name: 'priority_tree目录名称-05'},
            {name: 'priority_tree目录名称-06'},
            {name: 'priority_tree目录名称-07'},
            {name: 'priority_tree目录名称-08'},
            {name: 'priority_tree目录名称-09'},
            {name: 'priority_tree目录名称-10'},
            {name: 'priority_tree目录名称-11'},
            {name: 'priority_tree目录名称-12'},
            {name: 'priority_tree目录名称-13'},
            {name: 'priority_tree目录名称-14'},
            {name: 'priority_tree目录名称-15'},
            {name: 'priority_tree目录名称-16'},
            {name: 'priority_tree目录名称-17'},
            {name: 'priority_tree目录名称-18'},
            {name: 'priority_tree目录名称-19'},
            {name: 'priority_tree目录名称-20'},
            {name: 'priority_tree目录名称-21'},
            {name: 'priority_tree目录名称-22'},
            {name: 'priority_tree目录名称-23'},
            {name: 'priority_tree目录名称-24'},
            {name: 'priority_tree目录名称-25'}
          ]
        }];
      } else if(type == 'working_tree') {
        data  = [{
          name: 'Bucket/INPUT',
          isParant: true,
          open: true,
          children: [
            {name: 'working_tree目录名称-01'},
            {name: 'working_tree目录名称-02'},
            {name: 'working_tree目录名称-03'},
            {name: 'working_tree目录名称-04'},
            {name: 'working_tree目录名称-05'},
            {name: 'working_tree目录名称-06'},
            {name: 'working_tree目录名称-07'},
            {name: 'working_tree目录名称-08'},
            {name: 'working_tree目录名称-09'},
            {name: 'working_tree目录名称-10'},
            {name: 'working_tree目录名称-11'},
            {name: 'working_tree目录名称-12'},
            {name: 'working_tree目录名称-13'},
            {name: 'working_tree目录名称-14'},
            {name: 'working_tree目录名称-15'},
            {name: 'working_tree目录名称-16'},
            {name: 'working_tree目录名称-17'},
            {name: 'working_tree目录名称-18'},
            {name: 'working_tree目录名称-19'},
            {name: 'working_tree目录名称-20'},
            {name: 'working_tree目录名称-21'},
            {name: 'working_tree目录名称-22'},
            {name: 'working_tree目录名称-23'},
            {name: 'working_tree目录名称-24'},
            {name: 'working_tree目录名称-25'}
          ]
        }];
      }
      this.name = data[0].name;
      return data;
    },
    // 获取列表数据
    getList(start, end) {
      let data = [];
      if(API.name == 'priority_tree目录名称-01') {
        data = [
            {name: '1111名-01', size: '1111大小-01', time: '更新时间-01', priority: true, state: 'wait'},
            {name: '1111名-02', size: '1111大小-02', time: '更新时间-02', priority: '', state: 'wait'},
            {name: '1111名-03', size: '1111大小-03', time: '更新时间-03', priority: '', state: 'audit'},
            {name: '1111名-04', size: '1111大小-04', time: '更新时间-04', priority: true, state: 'wait'},
            {name: '1111名-05', size: '1111大小-05', time: '更新时间-05', priority: '', state: 'wait'},
            {name: '1111名-06', size: '1111大小-06', time: '更新时间-06', priority: '', state: 'audit'},
            {name: '1111名-07', size: '1111大小-07', time: '更新时间-07', priority: '', state: 'audit'},
            {name: '1111名-08', size: '1111大小-08', time: '更新时间-08', priority: true, state: 'wait'},
            {name: '1111名-09', size: '1111大小-09', time: '更新时间-09', priority: '', state: 'audit'}
        ];
      } else if(API.name == 'priority_tree目录名称-02') {
        data = [
            {name: '2222名-01', size: '2222大小-01', time: '更新时间-01', priority: true, state: 'wait'},
            {name: '2222名-02', size: '2222大小-02', time: '更新时间-02', priority: '', state: 'wait'},
            {name: '2222名-03', size: '2222大小-03', time: '更新时间-03', priority: '', state: 'audit'},
            {name: '2222名-04', size: '2222大小-04', time: '更新时间-04', priority: true, state: 'wait'},
            {name: '2222名-05', size: '2222大小-05', time: '更新时间-05', priority: '', state: 'wait'},
            {name: '2222名-06', size: '2222大小-06', time: '更新时间-06', priority: '', state: 'audit'},
            {name: '2222名-07', size: '2222大小-07', time: '更新时间-07', priority: '', state: 'audit'},
            {name: '2222名-08', size: '2222大小-08', time: '更新时间-08', priority: true, state: 'wait'},
            {name: '2222名-09', size: '2222大小-09', time: '更新时间-09', priority: '', state: 'audit'}
        ];
      } else if(API.name == 'priority_tree目录名称-03') {
        data = [
            {name: '3333名-01', size: '3333大小-01', time: '更新时间-01', priority: true, state: 'wait'},
            {name: '3333名-02', size: '3333大小-02', time: '更新时间-02', priority: '', state: 'wait'},
            {name: '3333名-03', size: '3333大小-03', time: '更新时间-03', priority: '', state: 'audit'},
            {name: '3333名-04', size: '3333大小-04', time: '更新时间-04', priority: true, state: 'wait'},
            {name: '3333名-05', size: '3333大小-05', time: '更新时间-05', priority: '', state: 'wait'},
            {name: '3333名-06', size: '3333大小-06', time: '更新时间-06', priority: '', state: 'audit'},
            {name: '3333名-07', size: '3333大小-07', time: '更新时间-07', priority: '', state: 'audit'},
            {name: '3333名-08', size: '3333大小-08', time: '更新时间-08', priority: true, state: 'wait'},
            {name: '3333名-09', size: '3333大小-09', time: '更新时间-09', priority: '', state: 'audit'}
        ];
      } else if(API.name == 'working_tree目录名称-01') {
        data = [
            {name: '文件名-01', size: '文件大小-01', time: '更新时间-01', priority: true, state: 'wait'},
            {name: '文件名-02', size: '文件大小-02', time: '更新时间-02', priority: '', state: 'wait'},
            {name: '文件名-03', size: '文件大小-03', time: '更新时间-03', priority: '', state: 'audit'},
            {name: '文件名-04', size: '文件大小-04', time: '更新时间-04', priority: true, state: 'wait'},
            {name: '文件名-05', size: '文件大小-05', time: '更新时间-05', priority: '', state: 'wait'},
            {name: '文件名-06', size: '文件大小-06', time: '更新时间-06', priority: '', state: 'audit'},
            {name: '文件名-07', size: '文件大小-07', time: '更新时间-07', priority: '', state: 'audit'},
            {name: '文件名-08', size: '文件大小-08', time: '更新时间-08', priority: true, state: 'wait'},
            {name: '文件名-09', size: '文件大小-09', time: '更新时间-09', priority: '', state: 'audit'},
            {name: '文件名-10', size: '文件大小-10', time: '更新时间-10', priority: '', state: 'wait'},
            {name: '文件名-11', size: '文件大小-11', time: '更新时间-11', priority: true, state: 'wait'},
            {name: '文件名-12', size: '文件大小-12', time: '更新时间-12', priority: '', state: 'audit'},
            {name: '文件名-13', size: '文件大小-13', time: '更新时间-13', priority: true, state: 'audit'},
            {name: '文件名-14', size: '文件大小-14', time: '更新时间-14', priority: true, state: 'wait'},
            {name: '文件名-15', size: '文件大小-15', time: '更新时间-15', priority: '', state: 'audit'},
            {name: '文件名-16', size: '文件大小-16', time: '更新时间-16', priority: '', state: 'wait'},
            {name: '文件名-17', size: '文件大小-17', time: '更新时间-17', priority: '', state: 'wait'},
            {name: '文件名-18', size: '文件大小-18', time: '更新时间-18', priority: true, state: 'audit'},
            {name: '文件名-19', size: '文件大小-19', time: '更新时间-19', priority: true, state: 'audit'},
            {name: '文件名-20', size: '文件大小-20', time: '更新时间-20', priority: true, state: 'wait'},
            {name: '文件名-21', size: '文件大小-21', time: '更新时间-21', priority: '', state: 'wait'},
            {name: '文件名-22', size: '文件大小-22', time: '更新时间-22', priority: '', state: 'audit'},
            {name: '文件名-23', size: '文件大小-23', time: '更新时间-23', priority: '', state: 'audit'},
            {name: '文件名-24', size: '文件大小-24', time: '更新时间-24', priority: '', state: 'wait'},
            {name: '文件名-25', size: '文件大小-25', time: '更新时间-25', priority: '', state: 'audit'},
            {name: '文件名-26', size: '文件大小-26', time: '更新时间-26', priority: '', state: 'wait'},
            {name: '文件名-27', size: '文件大小-27', time: '更新时间-27', priority: '', state: 'wait'},
            {name: '文件名-28', size: '文件大小-28', time: '更新时间-28', priority: true, state: 'wait'},
            {name: '文件名-29', size: '文件大小-29', time: '更新时间-29', priority: true, state: 'wait'},
            {name: '文件名-30', size: '文件大小-30', time: '更新时间-30', priority: true, state: 'wait'},
            {name: '文件名-31', size: '文件大小-31', time: '更新时间-31', priority: true, state: 'wait'},
            {name: '文件名-32', size: '文件大小-32', time: '更新时间-32', priority: '', state: 'audit'},
            {name: '文件名-33', size: '文件大小-33', time: '更新时间-33', priority: true, state: 'audit'},
            {name: '文件名-34', size: '文件大小-34', time: '更新时间-34', priority: true, state: 'wait'},
            {name: '文件名-35', size: '文件大小-35', time: '更新时间-35', priority: true, state: 'audit'},
            {name: '文件名-36', size: '文件大小-36', time: '更新时间-36', priority: true, state: 'wait'},
            {name: '文件名-37', size: '文件大小-37', time: '更新时间-37', priority: true, state: 'wait'},
            {name: '文件名-38', size: '文件大小-38', time: '更新时间-38', priority: true, state: 'audit'},
            {name: '文件名-39', size: '文件大小-39', time: '更新时间-39', priority: true, state: 'audit'},
            {name: '文件名-40', size: '文件大小-40', time: '更新时间-40', priority: '', state: 'wait'},
            {name: '文件名-41', size: '文件大小-41', time: '更新时间-41', priority: '', state: 'wait'},
            {name: '文件名-42', size: '文件大小-42', time: '更新时间-42', priority: '', state: 'audit'},
            {name: '文件名-43', size: '文件大小-43', time: '更新时间-43', priority: '', state: 'audit'},
            {name: '文件名-44', size: '文件大小-44', time: '更新时间-44', priority: '', state: 'wait'},
            {name: '文件名-45', size: '文件大小-45', time: '更新时间-45', priority: '', state: 'audit'},
            {name: '文件名-46', size: '文件大小-46', time: '更新时间-46', priority: '', state: 'wait'},
            {name: '文件名-47', size: '文件大小-47', time: '更新时间-47', priority: '', state: 'wait'},
            {name: '文件名-48', size: '文件大小-48', time: '更新时间-48', priority: '', state: 'audit'},
            {name: '文件名-49', size: '文件大小-49', time: '更新时间-49', priority: '', state: 'audit'},
            {name: '文件名-50', size: '文件大小-50', time: '更新时间-50', priority: '', state: 'wait'},
            {name: '文件名-51', size: '文件大小-51', time: '更新时间-51', priority: '', state: 'wait'},
            {name: '文件名-52', size: '文件大小-52', time: '更新时间-52', priority: '', state: 'audit'},
            {name: '文件名-53', size: '文件大小-53', time: '更新时间-53', priority: '', state: 'audit'},
            {name: '文件名-54', size: '文件大小-54', time: '更新时间-54', priority: '', state: 'wait'},
            {name: '文件名-55', size: '文件大小-55', time: '更新时间-55', priority: '', state: 'audit'},
            {name: '文件名-56', size: '文件大小-56', time: '更新时间-56', priority: '', state: 'wait'},
            {name: '文件名-57', size: '文件大小-57', time: '更新时间-57', priority: '', state: 'wait'},
            {name: '文件名-58', size: '文件大小-58', time: '更新时间-58', priority: '', state: 'audit'},
            {name: '文件名-59', size: '文件大小-59', time: '更新时间-59', priority: '', state: 'audit'},
            {name: '文件名-60', size: '文件大小-60', time: '更新时间-60', priority: '', state: 'wait'},
            {name: '文件名-61', size: '文件大小-61', time: '更新时间-61', priority: '', state: 'wait'},
            {name: '文件名-62', size: '文件大小-62', time: '更新时间-62', priority: '', state: 'audit'},
            {name: '文件名-63', size: '文件大小-63', time: '更新时间-63', priority: '', state: 'audit'},
            {name: '文件名-64', size: '文件大小-64', time: '更新时间-64', priority: '', state: 'wait'},
            {name: '文件名-65', size: '文件大小-65', time: '更新时间-65', priority: '', state: 'audit'},
            {name: '文件名-66', size: '文件大小-66', time: '更新时间-66', priority: '', state: 'wait'},
            {name: '文件名-67', size: '文件大小-67', time: '更新时间-67', priority: '', state: 'wait'},
            {name: '文件名-68', size: '文件大小-68', time: '更新时间-68', priority: '', state: 'audit'},
            {name: '文件名-69', size: '文件大小-69', time: '更新时间-69', priority: '', state: 'audit'},
            {name: '文件名-70', size: '文件大小-70', time: '更新时间-70', priority: '', state: 'wait'},
            {name: '文件名-71', size: '文件大小-71', time: '更新时间-71', priority: '', state: 'wait'},
            {name: '文件名-72', size: '文件大小-72', time: '更新时间-72', priority: '', state: 'audit'},
            {name: '文件名-73', size: '文件大小-73', time: '更新时间-73', priority: '', state: 'audit'},
            {name: '文件名-74', size: '文件大小-74', time: '更新时间-74', priority: '', state: 'wait'},
            {name: '文件名-75', size: '文件大小-75', time: '更新时间-75', priority: '', state: 'audit'},
            {name: '文件名-76', size: '文件大小-76', time: '更新时间-76', priority: '', state: 'wait'},
            {name: '文件名-77', size: '文件大小-77', time: '更新时间-77', priority: '', state: 'wait'},
            {name: '文件名-78', size: '文件大小-78', time: '更新时间-78', priority: '', state: 'audit'},
            {name: '文件名-79', size: '文件大小-79', time: '更新时间-79', priority: '', state: 'audit'},
            {name: '文件名-80', size: '文件大小-80', time: '更新时间-80', priority: true, state: 'wait'},
            {name: '文件名-81', size: '文件大小-81', time: '更新时间-81', priority: true, state: 'wait'},
            {name: '文件名-82', size: '文件大小-82', time: '更新时间-82', priority: true, state: 'audit'},
            {name: '文件名-83', size: '文件大小-83', time: '更新时间-83', priority: true, state: 'audit'},
            {name: '文件名-84', size: '文件大小-84', time: '更新时间-84', priority: true, state: 'wait'},
            {name: '文件名-85', size: '文件大小-85', time: '更新时间-85', priority: true, state: 'audit'},
            {name: '文件名-86', size: '文件大小-86', time: '更新时间-86', priority: true, state: 'wait'},
            {name: '文件名-87', size: '文件大小-87', time: '更新时间-87', priority: true, state: 'wait'},
            {name: '文件名-88', size: '文件大小-88', time: '更新时间-88', priority: true, state: 'audit'},
            {name: '文件名-89', size: '文件大小-89', time: '更新时间-89', priority: true, state: 'audit'},
            {name: '文件名-90', size: '文件大小-90', time: '更新时间-90', priority: true, state: 'wait'},
            {name: '文件名-91', size: '文件大小-91', time: '更新时间-91', priority: true, state: 'wait'},
            {name: '文件名-92', size: '文件大小-92', time: '更新时间-92', priority: true, state: 'audit'},
            {name: '文件名-93', size: '文件大小-93', time: '更新时间-93', priority: '', state: 'audit'},
            {name: '文件名-94', size: '文件大小-94', time: '更新时间-94', priority: '', state: 'wait'},
            {name: '文件名-95', size: '文件大小-95', time: '更新时间-95', priority: '', state: 'audit'},
            {name: '文件名-96', size: '文件大小-96', time: '更新时间-96', priority: '', state: 'wait'},
            {name: '文件名-97', size: '文件大小-97', time: '更新时间-97', priority: '', state: 'wait'},
            {name: '文件名-98', size: '文件大小-98', time: '更新时间-98', priority: '', state: 'audit'},
            {name: '文件名-99', size: '文件大小-99', time: '更新时间-99', priority: '', state: 'audit'},
            {name: '文件名-100', size: '文件大小-100', time: '更新时间-100', priority: '', state: 'wait'},
            {name: '文件名-101', size: '文件大小-101', time: '更新时间-101', priority: '', state: 'wait'},
            {name: '文件名-102', size: '文件大小-102', time: '更新时间-102', priority: '', state: 'audit'},
            {name: '文件名-103', size: '文件大小-103', time: '更新时间-103', priority: '', state: 'audit'},
            {name: '文件名-104', size: '文件大小-104', time: '更新时间-104', priority: '', state: 'wait'},
            {name: '文件名-105', size: '文件大小-105', time: '更新时间-105', priority: '', state: 'audit'},
            {name: '文件名-106', size: '文件大小-106', time: '更新时间-106', priority: '', state: 'wait'},
            {name: '文件名-107', size: '文件大小-107', time: '更新时间-107', priority: '', state: 'wait'},
            {name: '文件名-108', size: '文件大小-108', time: '更新时间-108', priority: '', state: 'audit'},
            {name: '文件名-109', size: '文件大小-109', time: '更新时间-109', priority: '', state: 'audit'},
            {name: '文件名-110', size: '文件大小-110', time: '更新时间-110', priority: '', state: 'wait'},
            {name: '文件名-111', size: '文件大小-111', time: '更新时间-111', priority: '', state: 'wait'},
            {name: '文件名-112', size: '文件大小-112', time: '更新时间-112', priority: true, state: 'audit'},
            {name: '文件名-113', size: '文件大小-113', time: '更新时间-113', priority: true, state: 'audit'},
            {name: '文件名-114', size: '文件大小-114', time: '更新时间-114', priority: true, state: 'wait'},
            {name: '文件名-115', size: '文件大小-115', time: '更新时间-115', priority: true, state: 'audit'},
            {name: '文件名-116', size: '文件大小-116', time: '更新时间-116', priority: true, state: 'wait'},
            {name: '文件名-117', size: '文件大小-117', time: '更新时间-117', priority: true, state: 'wait'},
            {name: '文件名-118', size: '文件大小-118', time: '更新时间-118', priority: true, state: 'audit'},
            {name: '文件名-119', size: '文件大小-119', time: '更新时间-119', priority: true, state: 'audit'},
            {name: '文件名-120', size: '文件大小-120', time: '更新时间-120', priority: '', state: 'wait'},
            {name: '文件名-121', size: '文件大小-121', time: '更新时间-121', priority: '', state: 'wait'},
            {name: '文件名-122', size: '文件大小-122', time: '更新时间-122', priority: '', state: 'audit'},
            {name: '文件名-123', size: '文件大小-123', time: '更新时间-123', priority: '', state: 'audit'},
            {name: '文件名-124', size: '文件大小-124', time: '更新时间-124', priority: '', state: 'wait'},
            {name: '文件名-125', size: '文件大小-125', time: '更新时间-125', priority: '', state: 'audit'},
            {name: '文件名-126', size: '文件大小-126', time: '更新时间-126', priority: '', state: 'wait'},
            {name: '文件名-127', size: '文件大小-127', time: '更新时间-127', priority: '', state: 'wait'},
            {name: '文件名-128', size: '文件大小-128', time: '更新时间-128', priority: '', state: 'audit'},
            {name: '文件名-129', size: '文件大小-129', time: '更新时间-129', priority: '', state: 'audit'},
            {name: '文件名-130', size: '文件大小-130', time: '更新时间-130', priority: '', state: 'wait'},
            {name: '文件名-131', size: '文件大小-131', time: '更新时间-131', priority: '', state: 'wait'},
            {name: '文件名-132', size: '文件大小-132', time: '更新时间-132', priority: '', state: 'audit'},
            {name: '文件名-133', size: '文件大小-133', time: '更新时间-133', priority: '', state: 'audit'},
            {name: '文件名-134', size: '文件大小-134', time: '更新时间-134', priority: '', state: 'wait'},
            {name: '文件名-135', size: '文件大小-135', time: '更新时间-135', priority: '', state: 'audit'},
            {name: '文件名-136', size: '文件大小-136', time: '更新时间-136', priority: '', state: 'wait'},
            {name: '文件名-137', size: '文件大小-137', time: '更新时间-137', priority: '', state: 'wait'},
            {name: '文件名-138', size: '文件大小-138', time: '更新时间-138', priority: '', state: 'audit'},
            {name: '文件名-139', size: '文件大小-139', time: '更新时间-139', priority: '', state: 'audit'},
            {name: '文件名-140', size: '文件大小-140', time: '更新时间-140', priority: true, state: 'wait'},
            {name: '文件名-141', size: '文件大小-141', time: '更新时间-141', priority: true, state: 'wait'},
            {name: '文件名-142', size: '文件大小-142', time: '更新时间-142', priority: true, state: 'audit'},
            {name: '文件名-143', size: '文件大小-143', time: '更新时间-143', priority: true, state: 'audit'},
            {name: '文件名-144', size: '文件大小-144', time: '更新时间-144', priority: true, state: 'wait'},
            {name: '文件名-145', size: '文件大小-145', time: '更新时间-145', priority: true, state: 'audit'},
            {name: '文件名-146', size: '文件大小-146', time: '更新时间-146', priority: true, state: 'wait'},
            {name: '文件名-147', size: '文件大小-147', time: '更新时间-147', priority: true, state: 'wait'},
            {name: '文件名-148', size: '文件大小-148', time: '更新时间-148', priority: true, state: 'audit'},
            {name: '文件名-149', size: '文件大小-149', time: '更新时间-149', priority: true, state: 'audit'},
            {name: '文件名-150', size: '文件大小-150', time: '更新时间-150', priority: true, state: 'wait'},
            {name: '文件名-151', size: '文件大小-151', time: '更新时间-151', priority: true, state: 'wait'},
            {name: '文件名-152', size: '文件大小-152', time: '更新时间-152', priority: '', state: 'audit'},
            {name: '文件名-153', size: '文件大小-153', time: '更新时间-153', priority: '', state: 'audit'},
            {name: '文件名-154', size: '文件大小-154', time: '更新时间-154', priority: '', state: 'wait'},
            {name: '文件名-155', size: '文件大小-155', time: '更新时间-155', priority: '', state: 'audit'},
            {name: '文件名-156', size: '文件大小-156', time: '更新时间-156', priority: '', state: 'wait'},
            {name: '文件名-157', size: '文件大小-157', time: '更新时间-157', priority: '', state: 'wait'},
            {name: '文件名-158', size: '文件大小-158', time: '更新时间-158', priority: '', state: 'audit'},
            {name: '文件名-159', size: '文件大小-159', time: '更新时间-159', priority: '', state: 'audit'},
            {name: '文件名-160', size: '文件大小-160', time: '更新时间-160', priority: '', state: 'wait'},
            {name: '文件名-161', size: '文件大小-161', time: '更新时间-161', priority: '', state: 'wait'},
            {name: '文件名-162', size: '文件大小-162', time: '更新时间-162', priority: '', state: 'audit'},
            {name: '文件名-163', size: '文件大小-163', time: '更新时间-163', priority: '', state: 'audit'},
            {name: '文件名-164', size: '文件大小-164', time: '更新时间-164', priority: '', state: 'wait'},
            {name: '文件名-165', size: '文件大小-165', time: '更新时间-165', priority: '', state: 'audit'},
            {name: '文件名-166', size: '文件大小-166', time: '更新时间-166', priority: '', state: 'wait'},
            {name: '文件名-167', size: '文件大小-167', time: '更新时间-167', priority: '', state: 'wait'},
            {name: '文件名-168', size: '文件大小-168', time: '更新时间-168', priority: '', state: 'audit'},
            {name: '文件名-169', size: '文件大小-169', time: '更新时间-169', priority: '', state: 'audit'},
            {name: '文件名-170', size: '文件大小-170', time: '更新时间-170', priority: '', state: 'wait'},
            {name: '文件名-171', size: '文件大小-171', time: '更新时间-171', priority: '', state: 'wait'},
            {name: '文件名-172', size: '文件大小-172', time: '更新时间-172', priority: '', state: 'audit'},
            {name: '文件名-173', size: '文件大小-173', time: '更新时间-173', priority: '', state: 'audit'},
            {name: '文件名-174', size: '文件大小-174', time: '更新时间-174', priority: true, state: 'wait'},
            {name: '文件名-175', size: '文件大小-175', time: '更新时间-175', priority: true, state: 'audit'},
            {name: '文件名-176', size: '文件大小-176', time: '更新时间-176', priority: '', state: 'wait'},
            {name: '文件名-177', size: '文件大小-177', time: '更新时间-177', priority: '', state: 'wait'},
            {name: '文件名-178', size: '文件大小-178', time: '更新时间-178', priority: '', state: 'audit'},
            {name: '文件名-179', size: '文件大小-179', time: '更新时间-179', priority: '', state: 'audit'},
            {name: '文件名-180', size: '文件大小-180', time: '更新时间-180', priority: '', state: 'wait'},
            {name: '文件名-181', size: '文件大小-181', time: '更新时间-181', priority: '', state: 'wait'},
            {name: '文件名-182', size: '文件大小-182', time: '更新时间-182', priority: true, state: 'audit'},
            {name: '文件名-183', size: '文件大小-183', time: '更新时间-183', priority: true, state: 'audit'},
            {name: '文件名-184', size: '文件大小-184', time: '更新时间-184', priority: true, state: 'wait'},
            {name: '文件名-185', size: '文件大小-185', time: '更新时间-185', priority: true, state: 'audit'},
            {name: '文件名-186', size: '文件大小-186', time: '更新时间-186', priority: true, state: 'wait'},
            {name: '文件名-187', size: '文件大小-187', time: '更新时间-187', priority: true, state: 'wait'},
            {name: '文件名-188', size: '文件大小-188', time: '更新时间-188', priority: true, state: 'audit'},
            {name: '文件名-189', size: '文件大小-189', time: '更新时间-189', priority: true, state: 'audit'},
            {name: '文件名-190', size: '文件大小-190', time: '更新时间-190', priority: true, state: 'wait'},
            {name: '文件名-191', size: '文件大小-191', time: '更新时间-191', priority: true, state: 'wait'},
            {name: '文件名-192', size: '文件大小-192', time: '更新时间-192', priority: true, state: 'audit'},
            {name: '文件名-193', size: '文件大小-193', time: '更新时间-193', priority: true, state: 'audit'},
            {name: '文件名-194', size: '文件大小-194', time: '更新时间-194', priority: true, state: 'wait'},
            {name: '文件名-195', size: '文件大小-195', time: '更新时间-195', priority: true, state: 'audit'},
            {name: '文件名-196', size: '文件大小-196', time: '更新时间-196', priority: true, state: 'wait'},
            {name: '文件名-197', size: '文件大小-197', time: '更新时间-197', priority: true, state: 'wait'},
            {name: '文件名-198', size: '文件大小-198', time: '更新时间-198', priority: true, state: 'audit'},
            {name: '文件名-199', size: '文件大小-199', time: '更新时间-199', priority: true, state: 'audit'},
            {name: '文件名-200', size: '文件大小-200', time: '更新时间-200', priority: true, state: 'wait'},
            {name: '文件名-201', size: '文件大小-201', time: '更新时间-201', priority: true, state: 'wait'},
            {name: '文件名-202', size: '文件大小-202', time: '更新时间-202', priority: true, state: 'audit'},
            {name: '文件名-203', size: '文件大小-203', time: '更新时间-203', priority: true, state: 'audit'},
            {name: '文件名-204', size: '文件大小-204', time: '更新时间-204', priority: true, state: 'wait'},
            {name: '文件名-205', size: '文件大小-205', time: '更新时间-205', priority: true, state: 'audit'},
            {name: '文件名-206', size: '文件大小-206', time: '更新时间-206', priority: true, state: 'wait'},
            {name: '文件名-207', size: '文件大小-207', time: '更新时间-207', priority: true, state: 'wait'},
            {name: '文件名-208', size: '文件大小-208', time: '更新时间-208', priority: true, state: 'audit'},
            {name: '文件名-209', size: '文件大小-209', time: '更新时间-209', priority: true, state: 'audit'},
            {name: '文件名-210', size: '文件大小-210', time: '更新时间-210', priority: true, state: 'wait'},
            {name: '文件名-211', size: '文件大小-211', time: '更新时间-211', priority: true, state: 'wait'},
            {name: '文件名-212', size: '文件大小-212', time: '更新时间-212', priority: true, state: 'audit'},
            {name: '文件名-213', size: '文件大小-213', time: '更新时间-213', priority: true, state: 'audit'},
            {name: '文件名-214', size: '文件大小-214', time: '更新时间-214', priority: true, state: 'wait'},
            {name: '文件名-215', size: '文件大小-215', time: '更新时间-215', priority: true, state: 'audit'},
            {name: '文件名-216', size: '文件大小-216', time: '更新时间-216', priority: true, state: 'wait'},
            {name: '文件名-217', size: '文件大小-217', time: '更新时间-217', priority: true, state: 'wait'},
            {name: '文件名-218', size: '文件大小-218', time: '更新时间-218', priority: true, state: 'audit'},
            {name: '文件名-219', size: '文件大小-219', time: '更新时间-219', priority: true, state: 'audit'},
            {name: '文件名-220', size: '文件大小-220', time: '更新时间-220', priority: true, state: 'wait'},
            {name: '文件名-221', size: '文件大小-221', time: '更新时间-221', priority: true, state: 'wait'},
            {name: '文件名-222', size: '文件大小-222', time: '更新时间-222', priority: true, state: 'audit'},
            {name: '文件名-223', size: '文件大小-223', time: '更新时间-223', priority: true, state: 'audit'},
            {name: '文件名-224', size: '文件大小-224', time: '更新时间-224', priority: true, state: 'wait'}
        ];
      }
      let resp = data.slice(start, end);
      return Model.table(resp);
    }
  };
  let Model = {
    table(data) {
      let table_list = [];
      for(let i = 0; i < data.length; i++) {
        let row = [];
        row.push({label: '<div class="table_col">' + data[i].name + '</div>'});
        row.push({label: data[i].size});
        row.push({label: data[i].time});
        let priority;
        if(data[i].priority == true) {
          priority = '<div class="priority"></div>';
        } else {
          priority = '';
        }
        row.push({label: priority});
        let status, cancal_priority, set_priority;
        if(data[i].state == 'wait') {
          status = '<div class="wait"></div>';
          if(data[i].priority == true) {
            cancal_priority = '<a class="btn cancal_priority" data-index=' + i + '>' + i18n('PRIORITY_AUDIT_TABLE_CANCAL_PRIORITY') + '</a>';
            set_priority= '<a class="btn" data-index=' + i + '>' + i18n('PRIORITY_AUDIT_TABLE_SET_PRIORITY') + '</a>';
          } else {
            cancal_priority = '<a class="btn" data-index=' + i + '>' + i18n('PRIORITY_AUDIT_TABLE_CANCAL_PRIORITY') + '</a>';
            set_priority= '<a class="btn set_priority" data-index=' + i + '>' + i18n('PRIORITY_AUDIT_TABLE_SET_PRIORITY') + '</a>';
          }
        } else if(data[i].state == 'audit') {
          status = '<div class="audit"></div>';
          cancal_priority = '<a class="btn" data-index=' + i + '>' + i18n('PRIORITY_AUDIT_TABLE_CANCAL_PRIORITY') + '</a>';
          set_priority= '<a class="btn" data-index=' + i + '>' + i18n('PRIORITY_AUDIT_TABLE_SET_PRIORITY') + '</a>';
        }
        row.push({label: status});
        
        row.push({label: '<span style="display: flex">' + [cancal_priority, set_priority].join('') + '</span>'});
        table_list.push(row);
      }
      return table_list;
    }
  };
  return menuPrioityAudit;
});