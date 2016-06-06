$('#iwantjoin').click(function(){
  $(".btn-lg").click();
})
$('.carousel').carousel({
  interval: 5000
});
var username = document.getElementById("username");
var telphoneRegex = /^0?(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[0-9])[0-9]{8}$/;
var emailRegex = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
var telphone = document.getElementById("telphone");
var email = document.getElementById("email");
var commit= document.getElementById("commit");
var app = angular.module('app',[]);
app.controller('modal',['$scope','$http', function($scope,$http){
  $scope.commit=function(){
    if(validator()){
      $http.post('/has-username',{username:$scope.username}).then(function(res){
        var out = res.data;
        if(out.status == 404){
          alert("用户名不存在，请先注册FCC！")
        }else{
          $http.post('/has-join',{username:$scope.username,telphone:$scope.telphone}).then(function(res){
            var out = res.data;
            if(out.status == 200){
              alert("你已报名成功，请勿重复报名！");
              $(".close").click();
              $('.btn-lg').text('报名成功').attr('disabled',true);
              window.open("/progress");
            }else{
              $http.post('/add-telphone',{username:$scope.username,telphone:$scope.telphone,category:$("select").val()}).then(function(res){
                var out = res.data;
                if(out.status == 200){
                  alert("恭喜你，报名成功！");
                  $(".close").click();
                  $('.btn-lg').text('报名成功').attr('disabled',true);
                  window.open("/progress");
                }else{
                  alert("提交数据有误，请重新输入！")
                }
              },function(err){
                console.log(err);
              })
            }
          },function(err){
            console.log(err);
          })
        }
      },function(err){
        console.log(err);
      })
    }
  }
}])
function validator(){
  if(!$("#username").val().replace(/(^s*)|(s*$)/g,'')){
    alert("用户名为空，请重新输入！")
    return false;
  }else if(!$("#telphone").val().replace(/(^s*)|(s*$)/g,'')){
    alert("手机号为空，请重新输入！")
    return false;
  }else if(!telphoneRegex.test($("#telphone").val())){
    alert("手机号错误，请重新输入！")
    return false;
  }else if(!$("select").val()){
    alert("请先选组，再提交！");
    return false;
  }else{
    return true;
  }
}
