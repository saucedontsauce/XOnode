// screenManagement
const showScreen = (targId, reqfunc) => {
    let allScreens = document.getElementsByClassName('gameView');
    let targeted = document.getElementById(targId);
    for (let i = 0; i < allScreens.length; i++) {
        let thisOne = allScreens[i];
        let test = thisOne.classList.contains('hidden');
        if (!test) {
            thisOne.classList.toggle('hidden');
        } else {

        };
    };
    targeted.classList.toggle('hidden');
    if(reqfunc){
        reqfunc()
    }
};