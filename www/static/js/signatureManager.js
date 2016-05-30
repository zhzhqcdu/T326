$(document).ready(function() {
    $("#search").click(function() {
        var _this = $(this);
        var queryWords = $("#queryWords").val()
        if (!queryWords) {
            alert("请输入查询信息");
            return;
        }
        $('form').submit();
        //     $.ajax({
        //         type: 'get',
        //         "url": "/classes?page_size=100&page=1&queryWords=" + queryWords,
        //         cache: false,
        //         dataType: 'json',
        //         success: function(data) {
        //             // console.log(JSON.stringify(data));
        //             $('#classInfos').html(doT.template($('#classTmp').html())(data));
        //             $('#classInfos table').DataTable({
        //                 responsive: false,
        //                 dom: 'ti'
        //             });
        //         },
        //         error: function(error) {
        //             console.error(error);
        //             alert("异常！");
        //         }
        //     });
    });
});
