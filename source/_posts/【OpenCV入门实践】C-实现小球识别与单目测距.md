---
title: 【OpenCV入门实践】C++实现单目测距：（一）识别小球
tags:
  - 教程
  - OpenCV
  - 单目测距
  - 识别
  - 计算机视觉
post-index: true
categories: Dev
linkhash: '4729'
date: 2023-05-21 21:14:49
updated: 2023-5-25 12:44:32
---

 > 先叠甲：本人在实践和探索过程中不可避免地参考了大量文章，并有可能把相应的内容反映到本文中。如您认为您的权利受到侵犯，请与我联系。

在本系列博文中，我们将识别目标小球，并在小球直径已知的条件下实现单目测距。笔者使用的语言是C++，环境是Ubuntu 20.04 LTS x64。  
本文是系列文章的第一篇。在这篇文章里，我们将实现**对小球的识别**。  
本文假设你：
 - 会基本的C++语法；
 - 知道OpenCV的一些基本知识；
 - 有一个摄像头；
 - 有一个（些）单色小球；
如果你还不满足以上的一点或几点，你也可以先看下去，遇到有问题的地方再稍事解决。  
让我们开始吧。  

# 读取视频流

OpenCV提供了`VideoCapture`类用于处理视频。

```cpp
cv::VideoCapture inputVideo;
inputVideo = cv::VideoCapture(0);
if (inputVideo.isOpened()) {
    std::cout << "video is on." << std::endl;
} else {
    std::cout << "video is off." << std::endl;
}
```
`VideoCapture`类的构造函数接受一个参数。
 - 当视频来源于文件，参数应当为视频文件的路径，例如`cv::VideoCapture("filename.mp4");`。
 - 当视频来源于相机等设备，参数可以直接传`0`。设备将自动被识别。

`isOpened()`方法返回一个布尔值，表明视频是否成功初始化。

# 标定与矫正畸变

**标定（Calibration）**是求解相机参数的过程。这些参数描述了相机成像的几何模型。利用这些参数，可以修正相机的畸变。这些参数是相机自身的固有属性，因此标定一次可以一直使用。

限于篇幅~~（和知识水平）~~，本文将不会对标定的原理和过程进行详细的介绍。网上的教程有很多，且Matlab也内置了相机标定的功能。你只需要打印一张下面这样的棋盘图，平整地糊在一块板子上（至少摊平），然后按照网上的教程进行操作即可。

![标定用的棋盘图](/images/0e61189074adddd0/calibration.jpg)

就我使用的摄像头而言，标定的结果如下：
```yaml
# 相机的内参矩阵
cameraMatrix:
  - [ 473.47735154, 0, 340.74974772 ]
  - [ 0, 473.65574398, 228.11903207 ]
  - [ 0, 0, 1 ]

# 相机的畸变参数
distortionCoefficients:
  - -0.09308854
  - 0.35950345
  - -0.00096885
  - -0.0017941
  - -0.40272195
```
相应地，创建两个Mat对象，存放标定得到的参数：
```cpp
    cv::Mat cameraMatrix = cv::Mat::eye(3, 3, CV_64F);
    cameraMatrix.at<double>(0, 0) = 473.47735154;
    cameraMatrix.at<double>(0, 2) = 340.74974772;
    cameraMatrix.at<double>(1, 1) = 473.65574398;
    cameraMatrix.at<double>(1, 2) = 228.11903207;
    cameraMatrix.at<double>(2, 2) = 1;

    cv::Mat distortionCoefficients = cv::Mat::zeros(5, 1, CV_64F);
    distortionCoefficients.at<double>(0, 0) = -0.09308854;
    distortionCoefficients.at<double>(1, 0) = 0.35950345;
    distortionCoefficients.at<double>(2, 0) = -0.00096885;
    distortionCoefficients.at<double>(3, 0) = -0.0017941;
    distortionCoefficients.at<double>(4, 0) = -0.40272195;
```
于是可以修正相机的畸变。首先计算无畸变和修正转换关系，利用的是`initUndistortRectifyMap()`函数。该函数利用相机参数计算出两个输出映射`map1`和`map2`。然后，用`remap()`函数矫正畸变。
```cpp
cv::Mat frame;
// 读取一帧
inputVideo >> frame; 
cv::Mat map1, map2;
cv::Size frameSize;
// 准备图像的尺寸
frameSize = frame.size(); 
initUndistortRectifyMap(cameraMatrix, distortionCoefficients, cv::Mat(), cameraMatrix, frameSize, 
                        CV_16SC2, map1, map2);
```
对`initUndistortRectifyMap()`函数的说明：
 - 前两个参数分别是相机的内参矩阵和畸变参数。
 - 对于单目相机来说，取第四个参数与第一个一致即可。

得到两个映射之后，应当注意我们需要对每一帧都进行重新映射以矫正畸变。

```cpp
while (true) {
    // 每次循环都读取一个新的帧
    inputVideo >> frame; 
        if (frame.empty()) {
            // 检测是否能读到帧。如果读不到则跳出循环
            break; 
        }
        // 重映射，修正畸变
        remap(frame, frame, map1, map2, cv::INTER_LINEAR); 

        // ---各种各样其他要做的事---
}
```
对`remap()`函数的说明：
 - 第一个参数是输入的帧。
 - 第二个参数是矫正后输出的矩阵。
 - 第三、第四个参数是刚才求出的映射。

# 霍夫圆检测

OpenCV提供了`HoughCircles()`函数用于检测圆形。检测到的圆形会以`Vec3f`的形式表示，`Vec3f[0]`和`Vec3f[1]`存放圆心的坐标，`Vec3f[2]`为半径。
该函数的原理是**霍夫圆变换**。然而，本文并不会详细介绍其原理，仅仅给出使用方法：
```cpp
cv::Mat gray;
cvtColor(frame, gray, cv::COLOR_BGR2GRAY); // 转化为灰度图
std::vector<cv::Vec3f> circles; // 该vector存放检测到的圆
double minDist = 100;
double param1 = 70;
double param2 = 0.8;
int minRadius = 25;
int maxRadius = 300;
HoughCircles(gray, circles, cv::HOUGH_GRADIENT_ALT, 1.5, minDist, param1, param2, minRadius, maxRadius);
```
其中：
 - gray是传入的帧。需要注意的是，其应当是灰度图，所以需要首先用`cvtColor()`转化为灰度图。
 - circles是一个`vector<Vec3f>`，用于存放检测到的圆。
 - minDist是圆心之间的最小距离。
 - param1和param2是两个阈值。数值越大越严格，越小越不精准。
 - minRadius和maxRadius分别是半径的上下限。

然后遍历每一个检测到的圆，输出结果。
```cpp
for (auto &i: circles) {
    // 标注圆的轮廓和圆心
    circle(frame, cv::Point2f(i[0], i[1]), static_cast<int>(i[2]), cv::Scalar(0, 255, 0), 2, 8);
    circle(frame, cv::Point2f(i[0], i[1]), 3, cv::Scalar(250, 0, 0), -1, 8);
}
// 创建窗口，输出检测结果
cv::namedWindow("hough circle", cv::WINDOW_FREERATIO);
imshow("hough circle", frame);
cv::waitKey(1);
```
至此，已经实现了检测圆形的基本功能。众所周知，球投影到二维平面上就是圆的，所以检测出画面上的圆形其实就可以检测球。
然而，不论如何调参，当前实现的效果并不令人满意。如何通过一些手段优化识别的效果？请听下回分解。
