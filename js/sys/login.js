//验证码接口
const genCaptchaUrl = baseUrl+"genCaptcha";
//获取语音提示
const getCaptchaVoiceUrl = baseUrl+"getCaptchaVoice";
//用户登录系统接口
const loginUrl = baseUrl+"login/main";

layui.use(['form'], function () {
    var form = layui.form,
        layer = layui.layer,
        t= Math.random();

    $("#captchaPic")[0].src=""+genCaptchaUrl+"?t="+t;

    //点击更换验证码
    $("#captchaPic").on('click',function () {
        t=Math.random();
        $("#captchaPic")[0].src=""+genCaptchaUrl+"?t="+t;
    })

    //获取语音提示
    $("#voicePrompt").on('click',function () {
        let loadIndex = layer.load(2, {
            shade: [0.3, '#333']
        });
        $.get({
            url:getCaptchaVoiceUrl,
            dataType: "json",
            timeout: 300000,
            xhrFields:{withCredentials: true},
            success: function (res) {
                layer.close(loadIndex);
                let audio = $("#audis");
                audio.attr("src","data:audio/mp3;base64,"+res.data);
                audio.get(0).play();
            },
            error: function () {

            }
        });
    })

    // 登录过期的时候，跳出ifram框架
    if (top.location != self.location) top.location = self.location;

    // 粒子线条背景
    $(document).ready(function(){
        $('.layui-container').particleground({
            dotColor:'#7ec7fd',
            lineColor:'#7ec7fd'
        });
    });

    // 进行登录操作
    form.on('submit(login)', function (data) {
        let loadIndex = layer.load(2, {
            shade: [0.3, '#333']
        });

        if ($('form').find('input[type="checkbox"]')[0].checked){
            data.field.rememberMe = true;
        }else{
            data.field.rememberMe = false;
        }

        $.post({
            url:loginUrl,
            data:data.field,
            dataType: "json",
            timeout: 300000,
            xhrFields: {withCredentials: true},
            success: function (res) {
                layer.close(loadIndex);
                console.log(res)
                //开始播放语音提示
                // if(res.data.voice!=null){
                //
                //     let audio = $("#audis");
                //     audio.attr("src","data:audio/mp3;base64,"+res.data.voice);
                //     audio.get(0).play();
                // }

                if(res.success){
                    layui.sessionData('loginUserData', {
                        key: 'loginUser'
                        ,value: res.data.user
                    });

                    layer.msg(res.message, function(index){
                        window.location = '../index.html';
                    },5000);
                }else{
                    layer.msg(res.message);
                    $("#captchaPic").click();
                }
            },
            error: function () {
                layer.alert('网络连接错误，请联系管理员！')
                layer.close(loadIndex);
            }
        });
        return false;
    });
});