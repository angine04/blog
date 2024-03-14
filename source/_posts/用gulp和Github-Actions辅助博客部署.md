---
title: 用gulp和Github Actions辅助博客部署
tags:
  - gulp
  - 建站
post-index: true
photos: false
mathjax: false
mermaid: false
comments: true
code: true
categories: Dev
linkhash: '79dd'
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

为了实现脚本自动计算文章的hash并替换`@@hash`，我们需要一个自动化构建工具。我选用的是gulp，此外还需要用到through2模块，可以用以下的命令安装。

```shell
npm install gulp through2
```

在gulp脚本中可以定义一系列任务，并且在命令行下执行。其特点在于，处理由一连串的pipe构成。pipe正如其名，接受一个函数作为参数。这个函数接收一个流，进行处理之后，便把这个流返回，一级一级传下去。

```javascript
// 文件名为gulpfile.js
// 第一个参数是任务名，第二个参数是这个任务要干的事
gulp.task('gen-link', function () {
  // 这一部分是具体干活的地方
  return 
  gulp.src('source/_posts/**/*.md') // 遍历md文件
    .pipe(through.obj(function (file, encode, cb) { // 利用through2读写文件内容
        // 使用正则表达式匹配需要替换的字符串
        const regex = /@@hash/g;
        let contents = file.contents.toString();
        if (regex.test(contents)) { // 如匹配到目标字符串
            // 求hash值，用来当做路径。当然hash值本身太长了，只取4位也完全够用了
            const hash = crypto.createHash('sha256').update(file.contents).digest('hex').substring(0, 4);
            // 替换字符串
            let result = contents.replace(regex, hash);
            file.contents = new Buffer.from(result, encode);
        }
        this.push(file);
        cb();
    }))
    .pipe(gulp.dest('source/_posts')); // 把处理完的文件写回原处
});
```

然后，在命令行调用即可。

```shell
gulp gen-link
```

然而，每次部署前都手动调用，岂不是很烦？可以利用Github Action实现完全的自动化（如果你和我一样在用Github Pages的话）。修改仓库内的`.github/workflows/pages.yml`，**在构建前**加上：

```yaml
- name: Generate permalinks # 生成链接
  run: gulp gen-link # run表示在终端下运行命令
- name: Commit & Push changes # 创建commit，把生成的链接保存到仓库中
  uses: actions-js/push@master # 使用其他Action
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

gulp有众多插件，例如压缩html、js、css的。完全可以依照自己的需要，按照上面的方式使用。