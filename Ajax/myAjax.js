// 封装自己的ajax
function myAjax(method,url,data,callback,type) {
    var xhr;
    if(window.XMLHttpRequest){  //IE7+, Firefox, Chrome, Opera, Safari
        xhr = new XMLHttpRequest();
    } else {  //IE6, IE5
        xhr = new ActiveXObject("Micorsoft.XMLHttp");
    }

    xhr.onreadystatechange = function(){
        if(xhr.status == 200 && xhr.readyState == 4){
            if(type == 'json'){  //判断返回值类型
                var res = JSON.parse(xhr.responseText);
            } else if(type == 'xml'){
                var res = responseXMl;
            } else {
                var res = xhr.responseText;
            };
            callback(res);
        }
    };

    var param = '';
    if(JSON.stringify(data) != '{}'){
        url += '?';
        for(var i in data){
            param += i + '=' + data[i] + '&';
        };
        param = param.slice(0,param.length - 1);
    };
    
    if(method == 'get'){
        url += param;
    };

    xhr.open(method,url,true);
    if(method == "post"){
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
        xhr.send(param);
    } else {
        xhr.send(null);
    }
}

