var fullname = document.getElementById("fullname");
var telphoneRegex = /^0?(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[0-9])[0-9]{8}$/;
var emailRegex = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
var telphone = document.getElementById("telphone");
var email = document.getElementById("email");
var commit= document.getElementById("commit");
var app = angular.module('app',[]);
app.controller('group',['$scope','$http', function($scope,$http){
  $scope.commit=function(){
    if(validator()){
      $http.post('/update-profile',{email:$scope.email,username:$('#username').val(),fullname:$scope.fullname,telphone:$scope.telphone,wechat:$scope.wechat,location:$("#location").val(),background:$('#background').val(),group:true}).then(function(res){
        if(res.status == 200){
          $("form").html("<h3 class='text-center'>恭喜你，报名成功！我们后续会把你拉到对应的学习群，也会在你的城市举办线下活动，敬请期待！</h3>")
          //alert("恭喜你，报名成功！我们后续会把你拉到对应的学习群，也会在你的城市举办线下活动，敬请期待！")
        }
      },function(err){
        console.log(err);
      })
    }
  }
}])
function validator(){
  if(!$("#fullname").val().replace(/(^s*)|(s*$)/g,'')){
    alert("用户名为空，请重新输入！")
    return false;
  }else if(!$("#email").val().replace(/(^s*)|(s*$)/g,'')){
    alert("邮箱为空，请重新输入！")
    return false;
  }else if(!emailRegex.test($("#email").val())){
    alert("邮箱不合法，请重新输入！")
  }else if(!$("#telphone").val().replace(/(^s*)|(s*$)/g,'')){
    alert("手机号为空，请重新输入！")
    return false;
  }else if(!telphoneRegex.test($("#telphone").val())){
    alert("手机号错误，请重新输入！")
    return false;
  }else if(!$("#location").val()){
    alert("请先选择城市，再提交！");
    return false;
  }else if(!$("#background").val()){
    alert("请先选择背景，再提交！");
    return false;
  }else{
    return true;
  }
}
