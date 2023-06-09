/* Inicio Dropdown Navbar */
//let notification = document.querySelector(".notification");
let avatar = document.querySelector(".avatar");

dropMenu(avatar);
//dropMenu(notification);

function dropMenu(selector) {
    //console.log(selector);
    selector.addEventListener("click", () => {
        let dropdownMenu = selector.querySelector(".dropdown-menu");
        dropdownMenu.classList.contains("active") ? dropdownMenu.classList.remove("active") : dropdownMenu.classList.add("active");
    });
}
/* Fim Dropdown Navbar */

/* Inicio Sidebar Toggle / bars */


let sidebar = document.querySelector(".sidebar");
let bars = document.querySelector(".bars");

bars.addEventListener("click", () => {
    sidebar.classList.contains("active") ? sidebar.classList.remove("active") : sidebar.classList.add("active");
});

window.matchMedia("(max-width: 768px)").matches ? sidebar.classList.remove("active") : sidebar.classList.add("active");
/* Fim Sidebar Toggle / bars */

function actionDropdown(id) {
    const closeDropdownb = document.getElementById('actionDropdown' + id);

    if(closeDropdownb.classList.contains("show-dropdown-action")){
        closeDropdownb.classList.remove("show-dropdown-action");
    }else{
        closeDropdownAction();
        document.getElementById("actionDropdown" + id).classList.toggle("show-dropdown-action");
    }
}

window.onclick = function (event) {
    if (!event.target.matches(".dropdown-btn-action")) {
        /*document.getElementById("actionDropdown").classList.remove("show-dropdown-action");*/
        closeDropdownAction();
    }
}

function closeDropdownAction() {
    var dropdowns = document.getElementsByClassName("dropdown-action-item");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i]
        if (openDropdown.classList.contains("show-dropdown-action")) {
            openDropdown.classList.remove("show-dropdown-action");
        }
    }
}


/* Inicio dropdown sidebar */

var dropdownSidebar = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdownSidebar.length; i++) {
    dropdownSidebar[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
            dropdownContent.style.display = "none";
        } else {
            dropdownContent.style.display = "block";
        }
    });
}
/* Fim dropdown sidebar */
/*Inicio preview imagem do usuario*/

function inputFilePriviewImg()
{
    // Receber o seletor do campo imagem
    var new_image = document.querySelector('#image');

    // Receber o valor do campo
    var filePath = new_image.value;

    //Extensões de imagens permitidas
    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

    if(allowedExtensions.exec(filePath)){

        if((new_image.files) && (new_image.files[0])){
        var reader = new FileReader();
            
        reader.onload = function(e){

        document.getElementById('preview-img').innerHTML = 
        "<img src='"+ e.target.result + "' alt='imagem'  class='view-image-user'>";
        }
        }

        reader.readAsDataURL(new_image.files[0]);
    }else{
        document.getElementById('preview-img').innerHTML = 
        "<img src='/images/users/user.jpg' alt='imagem'  class='view-image-user'>";

    }
}