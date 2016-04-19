翻译计划：为了让更多对freecodecamp中文社区感兴趣的人参与进来。

翻译目的：降低学习门槛，采用中英文同步学习，过程更流畅。

## 翻译规范：

1、简单词汇可不翻译，例如：freecodecamp、web，保持原样输出即可。

2、重点翻译难以理解词汇，例如：portfolio。

3、语句通顺，一定要考虑阅读习惯。

## 翻译课程：
打开https://github.com/huluoyang/freecodecamp.cn/tree/dev/seed/challenges

更改课程对应的.json文件中的discription即可，title请不要翻译，

因为title会附加在url后面，如果是中文会有问题。

另外翻译时请万分注意标点符号，少一个符号或多一个符号都会造成课程录入数据库报错。

例如：
```
"description": [
  "现在让我们来改变某些文本的颜色。",
  "我们可以通过修改<code>h2</code>元素的<code>style</code>来达到目的。",
  "负责颜色（color）的样式（style）是color样式。",
  "以下是如何将你的<code>h2</code>元素的文本颜色设置为蓝色的方法："    //错误
  "以下是如何将你的<code>h2</code>元素的文本颜色设置为蓝色的方法：",   //正确
  "<code>&#60;h2 style=\"color: blue\"&#62;CatPhotoApp&#60;/h2&#62;</code>",
  "修改你的<code>h2</code>元素的style，让文本的颜色变为红色。"
],
```
注意每行结尾处的逗号千万不要忘记，且每行开头和结尾的逗号、双引号一定得是英文符文，不能是中文符文。

一定要确保你翻译的description是个正确的json文件，否则会报错。

翻译过程中遇到问题，请参阅课程第一章节的翻译记录。

多谢参与^-^，一边学编程，一边练英文，何乐而不为呢。

## 提交方式：
1、fork此项目，创建分支，本地更改后pullrequest。

2、边学习边翻译，翻译好后直接发邮件给我即可(huluoyang@gmail.com)。

wish you go go go!
