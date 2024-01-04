function openSesame() {
    console.log("\"Open Sesame...\" Whisper you.");
    let urlPattern = /about/g;
    let location = document.location.toString();
    if(urlPattern.test(location)){
        console.log("The gate opens.");
        console.log("You find a scroll in the secret cave.");
        console.log("On which nothing but a letter is written: \"y\"!");
        return 0;
    }else{
        console.log("Nothing happened.");
        return 1;
    }
}