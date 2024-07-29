const toggleMenu = (myTopnav, navToggle) =>{
  console.log("test")
  const nav = document.getElementById(myTopnav),
        icon = document.getElementById(navToggle)
  
  icon.addEventListener('click', function () {
      nav.classList.toggle('responsive')
      icon.classList.toggle('show-icon')
      console.log("test")
    })
}

toggleMenu("myTopnav", "nav-toggle")