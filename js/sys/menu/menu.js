//获取菜单列表接口
const listUrl = baseUrl+"system/menu/treeList";
//添加菜单接口（父菜单和子菜单共用）
const addUrl = baseUrl+"system/menu/insertMenu";
//编辑菜单接口
const editUrl = baseUrl+'system/menu/editMenu';
//删除菜单接口
const deleteUrl = baseUrl+'system/menu/deleteMenu';

layui.use(['layer','util', 'treeTable','laytpl'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var laytpl = layui.laytpl;
    var treetable = layui.treeTable;
    var util = layui.util;

    //渲染表格
    let insTb = treetable.render({
        elem: '#menuTreeTable',
        text: {
            none: '<div style="padding: 18px 0;">暂无数据或您没权限查看~</div>'
        },
        tree: {
            iconIndex: 2,  // 折叠图标显示在第几列
            idName: 'id',  // 自定义id字段的名称
            pidName: 'pid',  // 自定义标识是否还有子节点的字段名称
            haveChildName: 'haveChild',  // 自定义标识是否还有子节点的字段名称
            isPidData: true  // 是否是pid形式数据
        },
        cols: [
            {type: 'numbers', title: '序号', width: 80},
            {field: 'id', title: 'ID', width: 80},
            {field: 'name', title: '菜单名称', width: 260},
            {field: 'permission', title: '权限标识', width: 210},
            {field: 'href', title: '菜单URL', width: 200},
            {field: 'icon', title: '图标', width: 140},
            {field: 'sort', title: '排序', width: 80},
            {
                field: 'isMenu', width: 120, align: 'center', toolbar: function (d) {
                    if (d.isMenu === 1) {
                        return '<span class="layui-badge layui-badge-warm">按钮</span>';
                    }
                    if (d.isMenu === -1) {
                        return '<span class="layui-badge layui-badge-blue">目录</span>';
                    } else {
                        return '<span class="layui-badge layui-badge-green">菜单</span>';
                    }
                }, title: '类型'
            },
            {field: 'createDate', title: '创建时间', width: 180},
            {align: 'center', toolbar: '#currentTableBar', title: '操作', width: 260}
        ],
        reqData: function(data,callback) {
            // 在这里写ajax请求，通过callback方法回调数据
            $.post({
                url: listUrl,
                dataType: "json",
                timeout:300000,
                xhrFields:{withCredentials: true},
                success: function (res) {
                    if(res.code===1){
                        callback([]);
                    }else{
                        callback(res.data);
                    }
                }
            });
        },
        style: 'margin-top:0;'
    });


    // 全部展开
    $('#btn-expand').click(function () {
        insTb.expandAll();
    });

    // 全部折叠
    $('#btn-fold').click(function () {
        insTb.foldAll();
    });

    //监听工具条
    treetable.on('tool(menuTreeTable)',function (obj) {
        let data = obj.data;
        let  layEvent = obj.event;
        if(layEvent==='addChild'){//添加子菜单
            layui.sessionData('childMenuData', {
                key: 'childMenu'
                ,value: data
            });

            let index = layer.open({
                title: '添加子菜单',
                type: 2,
                shade: 0.2,
                maxmin:true,
                shadeClose: true,
                area: ['100%', '100%'],
                content: '../menu/addchild.html',
                success : function(layero, index){
                    setTimeout(function(){
                        layer.tips('点击此处返回菜单列表', '.layui-layer-setwin .layui-layer-close', {
                            tips: 3
                        });
                    },500);
                }
            });

            $(window).on("resize", function () {
                layer.full(index);
            });
            return false;

        } else if(layEvent==='edit'){//编辑菜单
            layui.sessionData('menuData',{
                key: 'menu'
                ,value: data
            });

            let index = layer.open({
                title: '编辑菜单',
                type: 2,
                shade: 0.2,
                maxmin:true,
                shadeClose: true,
                area: ['100%', '100%'],
                content: '../menu/edit.html',
                success : function(layero, index){
                    setTimeout(function(){
                        layer.tips('点击此处返回菜单列表', '.layui-layer-setwin .layui-layer-close', {
                            tips: 3
                        });
                    },500);
                }
            });
        }else  if(layEvent==='del'){//删除菜单
            layer.confirm("你确定要删除该菜单么？这将会使得其下的所有子菜单都删除",{btn:['是的,我确定','我再想想']},
                function () {
                    let loadIndex = layer.load(2, {
                        shade: [0.3, '#333']
                    });

                    $.post({
                        url: deleteUrl,
                        data:{"id":data.id},
                        dataType: "json",
                        timeout:300000,
                        xhrFields:{withCredentials: true},
                        success: function (res) {
                            layer.close(loadIndex);
                            if(res.success){
                                layer.msg("删除成功",{time: 1000},function(){
                                    location.reload();
                                });
                            }else{
                                layer.msg(res.message);
                            }
                        },
                        error: function () {

                        }
                    });
                });
        }

    });

    let active = {
        addPmenu: function () {
            let addIndex = layer.open({
                title : "添加父菜单",
                type : 2,
                content: '../menu/addparent.html',
                success : function(layero, addIndex){
                    setTimeout(function(){
                        layer.tips('点击此处返回菜单列表', '.layui-layer-setwin .layui-layer-close', {
                            tips: 3
                        });
                    },500);
                }
            });
            //改变窗口大小时，重置弹窗的高度，防止超出可视区域（如F12调出debug的操作）
            $(window).resize(function(){
                layer.full(addIndex);
            });
            layer.full(addIndex);

        }

    }

    $('.layui-btn-group .layui-btn').on('click',function () {
        let type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });

});