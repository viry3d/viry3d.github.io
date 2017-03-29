var posts_all = [
    {
        post_type: "Android",
        time: "8.14.2015",
        link: "javascript:;",
        title: "Android ant打包",
        summary: '<p>\
原料：<br/>\
java sdk、android sdk、ant<br/>\
环境变量：<br/>\
ANT_HOME、ant bin、JAVA_HOME、android platform-tools、android tools。<br/><br/>\
为android工程生成ant配置：<br/>\
<code class="hljs">\
android update project --name def -t 9 --path "D:/def"\
</code><br/>\
ant参数:<br/>\
　　debug：带调试用签名的构建<br/>\
　　release：构建应用程序，生成的apk必须签名才可以发布<br/>\
　　install：安装调试构建的包到运行着的模拟器或者设备<br/>\
　　reinstall<br/>\
　　uninstall<br/><br/>\
打包：<br/>\
工程目录<br/>\
<code class="hljs">ant debug</code>\
或任意目录\
<code class="hljs">ant debug -file "D:/def/build.xml"</code><br/>\
release设置签名，项目根目录文件ant.properties，内容：<br/>\
key.store=D:/xxx<br/>\
key.store.password=xxx<br/>\
key.alias=xxx<br/>\
key.alias.password=xxx<br/><br/>\
<a href="http://ant.apache.org/" target=target="_blank">ant主页</a>\
</p>',
    },
    {
        post_type: "Android",
        time: "8.12.2015",
        link: "javascript:;",
        title: "Android网络状态检测",
        summary: '<p>\
所需权限：\
<code class="hljs">\
&ltuses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\
</code><br/>\
使用API：\
<code class="hljs">\
ConnectivityManager manager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);<br/>\
State wifi = manager.getNetworkInfo(ConnectivityManager.TYPE_WIFI).getState();<br/>\
State mobile = manager.getNetworkInfo(ConnectivityManager.TYPE_MOBILE).getState();<br/>\
</code><br/>\
这里获取了wifi、移动网络的状态，还可以获取蓝牙、vpn等其它网络类型的状态。\
</p>',
    },
    {
        post_type: "iOS",
        time: "7.27.2015",
        link: "blog/ios/ipa install.html",
        title: "iOS ipa网络安装",
        summary: "<p>\
适用环境：<br/>\
· 有iOS企业证书<br/>\
· 或在个人证书里添加了设备id<br/>\
· 或越狱设备<br/>\
</p>",
    },
    {
        post_type: "Linux",
        time: "7.25.2015",
        link: "javascript:;",
        title: "Linux ssh远程登录",
        summary: "\
<p>\
先用putty登入系统（输入用户名、密码），<br/>\
生成rsa秘钥：<br/>\
<code class='hljs'>ssh-keygen -t rsa<br/>\
输入默认路径，passphrase留空<br/>\
mv id_rsa.pub authorized_keys\
</code><br/>\
用winscp把私钥id_rsa下载到win<br/>\
用puttygen导入私钥，保存私钥ppk<br/>\
最后，就可以用putty和ppk免密码远程登录了<br/>\
</p>",
    },
    {
        post_type: "Linux",
        time: "7.25.2015",
        link: "javascript:;",
        title: "Linux磁盘挂载",
        summary: "\
<p>\
查看磁盘信息：<br/>\
<code class='hljs'>fdisk -l</code><br/>\
在分区创建文件系统：<br/>\
<code class='hljs'>mkfs -t ext3 -c /dev/hda5</code><br/>\
挂载磁盘分区：<br/>\
<code class='hljs'>mount /dev/hda5 /mnt</code><br/>\
查看已挂载文件系统：<br/>\
<code class='hljs'>df -h</code><br/>\
</p>",
    },
    {
        post_type: "Galaxy3D",
        time: "7.10.2015",
        link: "javascript:;",
        title: "Rich Text富文本功能展示",
        summary: "\
<p>指定颜色：<br/>\
<code class='hljs'>&ltcolor=#ffffffff>&lt/color></code><br/>\
阴影：<br/>\
<code class='hljs'>&ltshadow>&lt/shadow><br/>\
&ltshadow=#000000ff>&lt/shadow>\
</code><br/>\
边框：\
<code class='hljs'>&ltoutline>&lt/outline><br/>\
&ltoutline=#000000ff>&lt/outline>\
</code><br/>\
下划线：<br/>\
<code class='hljs'>&ltunderline>&lt/underline></code><br/>\
指定字体尺寸：<br/>\
<code class='hljs'>&ltsize=30>&lt/size></code><br/>\
指定字体：<br/>\
<code class='hljs'>&ltfont=msyh>&lt/font></code><br/>\
插入图像：<br/>\
<code class='hljs'>&ltimage=cool>&lt/image></code><br/>\
1个label内所有文字共用1个drawcall，<br/>\
每个嵌入图像使用1个drawcall，图像支持序列帧，<br/>\
支持换行符、限宽自动换行、左中右对齐。<br/>\
</p>\
<img src='blog/galaxy3d/001/richtext.gif' width='580'/>\
",
    },
    {
        post_type: "Git",
        time: "6.19.2015",
        link: "javascript:;",
        title: "Git for Windows",
        summary: "\
<a href='http://msysgit.github.io/' target='_blank'>Git for Windows下载地址</a>\
",
    },
    {
        post_type: "Unity3D",
        time: "6.15.2015",
        link: "javascript:;",
        title: "Unity3D内部编译错误解决办法",
        summary: "\
错误描述：\
<p style='color:red;'>Internal compiler error. See the console log for more information. output was:<br/>\
Unhandled Exception: System.ArgumentException: Arg_InsufficientSpace</p>\
错误原因：cs代码文件编码问题，编译器会用UTF8格式去读取和分析代码，<br/>\
而出问题的代码文件是使用GB2312编码保存的。<br/><br/>\
出现这个错误的麻烦在于，Unity Editor不会告诉你哪个文件有问题。<br/>\
直到你把问题解决之前，都无法Play your game。<br/><br/>\
解决办法：尝试把一部分代码文件移出工程，如果移出文件里包含了问题文件，<br/>\
Editor会报正常的编译错误，否则问题文件还在工程内，仍然报上面那个错误。<br/>\
先定位到大范围，然后逐步缩小，直至找到问题文件，改用UTF8编码保存。<br/><br/>\
建议工程内所有文本文件都使用UTF8编码保存。\
",
    },
    {
        post_type: "Git",
        time: "6.14.2015",
        link: "javascript:;",
        title: "Working with Git on Mac",
        summary: "\
<pre>\
克隆版本库：\
<code class='hljs'>git clone {git url}</code>\n\
对某些文件作出改动之后：\
<code class='hljs'>\
cd {repository dir}\n\
git add *\n\
git commit -m '{log}'\n\
git push</code>\n\
如果需要更新：\
<code class='hljs'>git pull</code>\n\
如果pull遇到问题（mac自动创建的隐藏文件会导致问题）：\
<code class='hljs'>git clean -d -fx</code>\
</pre>\
<a href='http://pan.baidu.com/s/1eQGo8Ae' target='_blank'>Git for Mac下载地址</a>\
",
    },
    {
        post_type: "OpenGL ES 3.0",
        time: "6.12.2015",
        link: "blog/gles3/001.html",
        title: "OpenGL ES 3.0简介",
        summary: "OpenGL ES 3.0设备支持要求，<br/>\
                    Android 4.3(根据设备GPU型号)、iOS 7(iPhone 5s及以上、iPad Air及以上、iPad mini 2及以上)，<br/>\
                    算是比较普及了，所以有必要了解和学习一下。",
    },
    {
        post_type: "WebGL",
        time: "6.11.2015",
        link: "blog/webgl/007.html",
        title: "DJ's WebGL Tutorial 007--骨骼动画",
        summary: "骨骼动画是目前最常用的模型动画，<br />\
                    这一节将增加对骨骼动画的支持，<br />\
                    使用javascript进行基于cpu的骨骼更新，<br />\
                    使用vertex shader进行基于gpu的顶点蒙皮。<br />\
                    所用模型和动画数据都导出自Unity3D。",
    },
    {
        post_type: "WebGL",
        time: "6.11.2015",
        link: "blog/webgl/006.html",
        title: "DJ's WebGL Tutorial 006--模型加载、显示",
        summary: "本节将加载并显示一个3D模型，<br />\
                    从渲染方法上讲，和上一节的立方体没有本质区别，只是顶点数据不一样。<br />\
                    立方体是我们自己定义顶点数据，<br />\
                    而3D模型，是从资源文件读取顶点数据，<br />\
                    所以这一节的重点在于数据读取。",
    },
    {
        post_type: "WebGL",
        time: "6.11.2015",
        link: "blog/webgl/005.html",
        title: "DJ's WebGL Tutorial 005--3D渲染与所需矩阵变换",
        summary: "在前面几节，我们省略了顶点的矩阵变换，直接使用的屏幕空间坐标进行渲染。<br />\
                    本节中，我们将开始进入3D世界，渲染一个旋转的3D立方体。",
    },
    {
        post_type: "WebGL",
        time: "6.11.2015",
        link: "blog/webgl/004.html",
        title: "DJ's WebGL Tutorial 004--带贴图的矩形",
        summary: "1.用2个三角形组成矩形，增加3个顶点，",
    },
    {
        post_type: "WebGL",
        time: "6.11.2015",
        link: "blog/webgl/003.html",
        title: "DJ's WebGL Tutorial 003--渲染一个三角形",
        summary: "1.WebGL继承于OpenGL ES 2.0，只能使用可编程渲染管线，所以先创建shader：",
    },
    {
        post_type: "WebGL",
        time: "6.11.2015",
        link: "blog/webgl/002.html",
        title: "DJ's WebGL Tutorial 002--渲染循环、显示FPS",
        summary: "1.为了便于编码，先将html与javascript拆分为2个文件。<br />\
                    2.在页面中再添加一个canvas，用来绘制2d文本显示FPS",
    },
    {
        post_type: "WebGL",
        time: "6.11.2015",
        link: "blog/webgl/001.html",
        title: "DJ's WebGL Tutorial 001--渲染准备",
        summary: "1.首先声明一张画布canvas，作为webgl的渲染目标：",
    },
];
var post_base = '<div class="post clearfix maincontent" post_type="post_type_value">\
                    <div class="entry clearfix">\
                        <h1>\
                            <a href="link_value" target="_blank" class="post_title">\
                                title_value\
                            </a>\
                        </h1>\
                        <p>\
                            summary_value\
                        </p>\
                    </div>\
                    <div class="postinfo2">\
                        <span class="date-box" id="date_time">time_value</span>\
                        <span class="read-more"><a href="link_value">阅读全文</a></span>\
                    </div>\
                </div>';

var post_container = null;
var posts_type = {};
var posts_time = {};


onload = function() {
    init_type();
};

function array_sort(a, func) {
    var i = a.length, j;
    var temp;
    while (i > 0) {
        for (j = 0; j < i - 1; j++) {
            if (func(a[j], a[j+1])) {
                temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
        i--;
    }
    
    return a;
}

function init_type() {
    post_container = document.getElementById('content');

    for (var i = 0; i < posts_all.length; i++) {
        var obj = posts_all[i];
        var type = obj.post_type;

        var c = document.createElement('div');
        c.innerHTML = post_base.replace('post_type_value', type)
            .replace('time_value', obj.time)
            .replace(new RegExp('link_value','gm'), obj.link)
            .replace('title_value', obj.title)
            .replace('summary_value', obj.summary);

        if (obj.link == 'javascript:;') {
            var title = c.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
            title.removeAttribute('href');

            var read = c.firstElementChild.lastElementChild.lastElementChild;
            read.parentNode.removeChild(read);
        }

        if (posts_type[type] == null) {
            posts_type[type] = [];
        }
        posts_type[type].push(c);

        var date = obj.time;
        var date_v = date.split('.');
        var y = date_v[2];
        var m = date_v[0];
            
        if (m.length == 1) {
            m = '0' + m;
        }
        var type_time = y + '.' + m;
            
        if (posts_time[type_time] == null) {
            posts_time[type_time] = [];
        }
        posts_time[type_time].push(c);
    }

    var by_types = document.getElementById('by_types');
    var base = by_types.firstElementChild;
    by_types.removeChild(base);

    //sort type key
    var keys_type = array_sort(Object.keys(posts_type),
        function(a, b) {
            var va = a.toLowerCase().charAt(0);
            var vb = b.toLowerCase().charAt(0);
            if (va == vb) {
                va = a.toLowerCase().charAt(1);
                vb = b.toLowerCase().charAt(1);

                return va > vb;
            } else {
                return va > vb;
            }
        }
    );
    
    for (var i = 0; i < keys_type.length; i++) {
        var type = keys_type[i];
        var node = base.cloneNode(true);
        by_types.appendChild(node);

        var link = node.firstElementChild.firstElementChild;
        var link_text = "<a href='javascript:;'" + "onclick='on_click_type(\"" + type + "\")'>";
        link_text += type;
        link_text += ' (' + posts_type[type].length + ')';
        link_text += '</a';
        link.outerHTML = link_text;
    }

    var by_times = document.getElementById('by_times');
    base = by_times.firstElementChild;
    by_times.removeChild(base);

    //sort time key
    var keys_time = array_sort(Object.keys(posts_time),
                               function(a, b) {
                               var ya = a.substr(0, 4);
                               var ma = a.substr(5, 2);
                               
                               var yb = b.substr(0, 4);
                               var mb = b.substr(5, 2);
                               
                               return ya * 100 + ma < yb * 100 + mb;
                               });

    for (var i = 0; i < keys_time.length; i++) {
        var type = keys_time[i];
        var node = base.cloneNode(true);
        by_times.appendChild(node);

        var link = node.firstElementChild.firstElementChild;
        var link_text = "<a href='javascript:;'" + "onclick='on_click_time(\"" + type + "\")'>";
        link_text += type;
        link_text += ' (' + posts_time[type].length + ')';
        link_text += '</a';
        link.outerHTML = link_text;
    }

    on_click_time(keys_time[0]);
}

function on_click_type(type) {
    while (post_container.childElementCount > 0) {
        post_container.removeChild(post_container.firstChild);
    }

    var ps = posts_type[type];
    for (var c in ps) {
        post_container.appendChild(ps[c]);
    }
};

function on_click_time(time) {
    while (post_container.childElementCount > 0) {
        post_container.removeChild(post_container.firstChild);
    }

    var ps = posts_time[time];
    for (var c in ps) {
        post_container.appendChild(ps[c]);
    }
};