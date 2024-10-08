const toggleMenu = (myTopnav, navToggle) =>{
  const nav = document.getElementById(myTopnav),
        icon = document.getElementById(navToggle)
  
  icon.addEventListener('click', function () {
      nav.classList.toggle('responsive')
      icon.classList.toggle('show-icon')
      
    })
}

toggleMenu("myTopnav", "nav-toggle")


const dropdownItems = document.querySelectorAll('.dropdown')
const dropdownButtons = document.querySelectorAll('.dropbtn')
  // Show/hide the elements in the clicked menu

dropdownItems.forEach((dropdown) => {
  var dropbtn = dropdown.querySelector('.dropbtn')
  dropbtn.addEventListener('click', () => {
    dropdown.classList.toggle('show')
    for (let i=0; i < dropdownItems.length; i++){
      if (dropdown !== dropdownItems[i]){
        dropdownItems[i].classList.remove('show')
      }
    }
  })  
})

function closeOpenDropdowns() {
  openMenus = document.querySelectorAll('.dropdown');
  openMenus.forEach(function(menus) {
    menus.classList.remove('show');
  });  
}

window.addEventListener('click', function(event) {
  isInDropdown = false
  dropdownItems.forEach(function (dropdown) {
    if (dropdown.contains(event.target)) {
      isInDropdown = true
    }
  })
    if (!(isInDropdown)) {
      console.log(event.target.tagName)
      closeOpenDropdowns();
    }
  });


