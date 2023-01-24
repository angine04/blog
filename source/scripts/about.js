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

function sesameSeeds() {
    console.log("\"Sesame Seeds...\" Whispered you.");
    var location = getUrlRelativePath().toString();
    if(location == "/about/"){
        console.log("The gate opens.");
        console.log("You found a scroll in the secret cave.");
        console.log("On which nothing is written but a letter: \"y\"!");
        return 0;
    }else{
        console.log("Nothing happened.");
        return 1;
    }
}