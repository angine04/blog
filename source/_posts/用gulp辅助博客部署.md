---
title: 用gulp和Github Actions辅助博客部署
tags:
  - gulp
  - 建站
post-index: true
categories: Dev
linkhash: '@@linkhash'
date: 2023-12-24 07:23:25
updated: 2023-12-24 07:23:25
---

众所周知hexo默认直接用原md文件名当做生成的html文件名，而且还要放在yyyy/mm/dd目录下。这导致链接非常长，而且包含很多非ascii字符，我觉得有点蠢。

好在这是可以修改的。在`_config.yml`里面有一项叫做`permalink`，修改成如下形式：

```yaml
permalink: /posts/:dest/
```

其中dest其实是一个变量，可以在文章的front-matter部分指定它的值。

```yaml
title: 我是文章的标题
tags:
  - 我是tag
  - 我也是tag
categories: 我是分类
dest: directory-of-the-post
date: 某年-某月-某日 某时:某分:某秒
```

于是文章就会被放在`/posts/directory-of-the-post/index.html`。然而我还是觉得有点长了，而且每次都给文章起名很麻烦。事实上可以这样做：

```yaml
title: 我是文章的标题
tags:
  - 我是tag
  - 我也是tag
categories: 我是分类
dest: ‘@@hash’ # 这一部分由脚本自动替换
date: 某年-某月-某日 某时:某分:某秒
```

为了实现脚本自动计算文章的hash并替换`@@hash`，我们需要一个自动化构建工具。我选用的是gulp。在gulp脚本中可以定义一系列任务，并且在命令行下执行。

```javascript
// 第一个参数是任务名，第二个参数是这个任务要干的事
gulp.task('gen-link', function () {
    // 这一部分是具体干活的地方
});
```