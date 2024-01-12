
const handleSettingsSave = () => {
    // needs changing as new options are added
    let newusername = document.getElementById('usernameChange').value;
    localStorage.setItem('username', newusername);
    console.log(newusername);
    window.alert("settings saved");
}


