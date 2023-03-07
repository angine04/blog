function getUrlRelativePath() {
    var url = document.location.toString();
    var arrUrl = url.split("//");
    var start = arrUrl[1].indexOf("/");
    var relUrl = arrUrl[1].substring(start);//stop省略，截取从start开始到结尾的所有字符
    if (relUrl.indexOf("?") != -1) {
        relUrl = relUrl.split("?")[0];
    }
    return relUrl;
}

var now = new Date();
function createtime() {
    var grt = new Date("01/01/2023 22:30:00");//此处修改你的建站时间或者网站上线时间             
    now.setTime(now.getTime()+250); 
    days = (now - grt) / 1000 / 60 / 60 / 24;
    dnum = Math.floor(days);
    hours = (now - grt) / 1000 / 60 / 60 - (24 * dnum);
    hnum = Math.floor(hours);
    if (String(hnum).length == 1) {
        hnum = "0" + hnum;
    }
    minutes = (now - grt) / 1000 / 60 - (24 * 60 * dnum) - (60 * hnum);
    mnum = Math.floor(minutes); 
    if(String(mnum).length == 1){
        mnum = "0" + mnum;
    }
    seconds = (now - grt) / 1000 - (24 * 60 * 60 * dnum) - (60 * 60 * hnum) - (60 * mnum);
    snum = Math.round(seconds);
    if (String(snum).length == 1) {
        snum = "0" + snum;
    }
    document.getElementById("timeDate").innerHTML = "本站已在线运行<br />" + dnum + "天 ";
    document.getElementById("times").innerHTML = hnum + "小时 " + mnum + "分 " + snum + "秒<br/>";
    if(location == "/about/"){
        document.getElementById("aboutTimeDate").innerHTML = dnum + "天 ";
        document.getElementById("aboutTimes").innerHTML = hnum + "小时 " + mnum + "分 " + snum + "秒";
    }
}
setInterval("createtime()", 250);    