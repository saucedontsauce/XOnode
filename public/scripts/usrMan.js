class gameUser {
    constructor() {
        this.id = socket.id || crypto.randomUUID();
        this.username = "imAuser";
        this.inGame = false;
        this.game = null;
        this.runChecks()
    }
    runChecks() {
        let storedUsername = localStorage.getItem('username');
        if(storedUsername){
            console.log('username previously used:', storedUsername);
            this.username = storedUsername;
        }
    }

}

let thisUsr = new gameUser