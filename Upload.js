var i = 0;
var table = null;
var btn = null;
var files = null;
var options = {};

$(function () {

    var pageType="Add";//定义页面类型，当页面类型为新增时，展示文件的上传、删除功能，当页面为编辑页面页面时，展示文件的下载，删除的功能
    if(pageType=="Add"){
        InitFileGrid("FileArea", {pk: "IDS"});
    }else{
        var IDS = "1";  //定义当前文件的主键。IDS主键应该从所传接口获取，这里我先写死
        InitFileGrid("FileArea", {
            pk: "IDS",
            data : {
                urltype : "File",
                urlname : "GetFileListByID",
                params : {
                    IDS : IDS,
                    tableName : "T_DATA_PROJECT" //后台存入数据库的表名
                }
            },
            delete : {
                urltype : "File",
                urlname : "DelFiles"
            }
        });
    }

});

function InitFileGrid(id, opt){
    var gridId = id + '-table';
    var btnId = id + '-choose';
    var filesId = id + '-files';
    var downFrameId = id + '-downFrame';
    options = opt;
    //绘制前端页面
    var html = '<h4 class="title">附件信息</h4>' +
        '<label class="btn btn-success" id="' + btnId + '" style="position:absolute;right:8px;top:3px;height:33px;" for="f0">选择文件</label>' +
        '<div id="' + filesId + '">' +
        '<input type="file" id="f0" style="position:absolute;clip:rect(0 0 0 0);">' +
        '</div>' +
        '<table class="table table-striped" id="' + gridId + '" style="border-left:none;border-right:none;"></table>' +
        '<iframe name="' + downFrameId + '" id="' + downFrameId + '" style="display: none"></iframe>';

    $("." + id).append(html);

    btn = $("#" + btnId);
    files = $("#" + filesId);
    //绘制文件表格
    table = $('#' + gridId).bootstrapTable({
        pagination: false,//分页
        minimumCountColumns: 4,
        paginationLoop: false,
        sidePagination: "server",
        striped: true,
        paginationPreText : "上一页",
        paginationNextText :"下一页",
        undefinedText: "",
        queryParamsType: "limit",
        idField: options.pk,
        columns:[
            {title:"序号",width:30, formatter :function(v, r, i){return i + 1;}},
            {field: options.pk, title:"pk", hidden:true, visible : false},
            {field:'FILENAME',title:'附件名称',align:"left",halign:"middle"},
            {field:'ATTACHMENTSIZE',title:'附件大小（KB）',width : 100,align:"right",halign:"middle",formatter:function(v, r, i){
                    return Math.round(v / 1024 * 100) / 100;//文件大小以KB为单位进行转换
                }},
            {field:'OPER',title:'操作',width : 80,align:"center",halign:"middle",formatter: function (v, r, i) {
                    var operate = "<a href='javascript:removeFileRow(\"" + r[options.pk] + "\");'>删除</a>";
                    if (r.ABPATH != undefined && r.ABPATH != ""){
                        operate += " <a href=\"javascript:download('" + downFrameId + "', '" + r.ABPATH + "');\">下载</a>";
                    }
                    return operate;
                }}
        ]
    });

    if (options.data != undefined){
        var jsondata = GetDataByAjax( options.data.params, "GET");
        table.bootstrapTable('load', jsondata);//将数据动态生成到表格
    }

    bondFileSelectE();//选择上传文件并插入表格
}

function bondFileSelectE(){
    $("#f" + i).change(function(e){
        i++;
        var nextId = "f" + i;

        files.append('<input type="file" id="' + nextId + '" style="position:absolute;clip:rect(0 0 0 0);">');
        btn.attr("for", nextId);

        var multipleFiles = this.files;
        $.each(this.files, function(i, file){
            var row = {};
            row[options.pk] = e.target.id;
            row["FILENAME"] = file.name;
            row["ATTACHMENTSIZE"] = file.size;
            table.bootstrapTable('insertRow', {
                index: i,
                row: row
            });
        });

        bondFileSelectE();
    });
}
//删除文件
function removeFileRow(id){
    table.bootstrapTable('remove', {
        field: options.pk,
        values: [id]
    });

    $("#" + id).remove();

    if (options.delete != undefined){
        var param = {};
        param[options.pk] = id;
        var jsondata = GetDataByAjax(param, "GET");
        if (jsondata.status == 200){
            alert('删除成功。');
        }
    }
}
//文件下载
function download(downFrameId, v){
    //当文件为为jpg、png、pdf、txt格式时下载文件时方式为打开新页面，其他格式时文件为下载为所相应的格式
    if (v.indexOf(".") >= 0){
        var ext = v.substring(v.lastIndexOf(".") + 1, v.length).toLowerCase();
        if (ext == "jpg" || ext == "png" || ext == "pdf" || ext == "txt"){
            window.open(v);
            return;
        }
    }
    $("#" + downFrameId).attr("src", v);
}
//用ajax GET请求方法获取数据
function GetDataByAjax( paras, requsttype) {
    var result = "";
    $.ajax({
        // url: GetUrl(urltype, urlname),
        url:"Json/file.json", //模拟接口数据文件路径
        type: requsttype,
        async: false,
        data: paras,//调用有参后台的方法
        error: function (e) {
            alert("数据请求错误！");//错误执行方法
        },
        success: function (datas) {
            if (datas) {
                result = datas;
            }
        }//成功执行方法
    });
    return result;
}