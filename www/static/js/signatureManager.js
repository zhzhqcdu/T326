$(document).ready(function() {
    selected();
    $("#search").click(function() {
        var _this = $(this);
        var queryWords = $("#queryWords").val()
        if (!queryWords) {
            alert("请输入查询信息");
            return;
        }
        $('form').submit();
    });
});


function deleteSig(student_id, student_name) {
    var r = confirm("是否撤销" + student_name + "的签名信息？")
    if (r == true) {
        $.ajax({
            type: 'delete',
            "url": "/students/" + student_id,
            cache: false,
            dataType: 'json',
            success: function(data) {
                if (data.status == 'done') {
                    $("#" + student_id).hide();
                } else {
                    alert("撤销失败");
                }
            },
            error: function(error) {
                console.error(error);
                alert("异常！");
            }
        });
    }
}

function selected() {
    var length = $("input[type='checkbox']:checked").length;
    if (length) {
        $("#export").show();
    } else {
        $("#export").hide();
    }
}

function exportPDF() {
    var ids = new Array();
    $("input[type='checkbox']:checked").each(function(index) {
        ids.push($(this).val());
    });
    var data = {
        ids: ids
    };
    if (ids.length) {
        $.ajax({
            type: 'post',
            "url": "/index/download/",
            cache: false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: 'json',
            success: function(data) {
                if (data.status == 'done') {
                    $("#" + student_id).hide();
                } else {
                    alert("导出失败！");
                }
            },
            error: function(error) {
                console.error(error);
                alert("异常！");
            }
        });
    }
}
