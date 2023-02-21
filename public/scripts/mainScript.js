const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };


try {
    let email = localStorage.getItem("email")
    let elem = document.querySelector(".regBoxEmail")
    if (elem) {
        elem.value = email;
        elem.addEventListener("change", () => {
            elem.parentNode.classList.remove("error")
            if(validateEmail(elem.value))
                localStorage.setItem("email", elem.value)
            else
                elem.parentNode.classList.add("error")
        })
    }
    let btn=document.querySelector("#regBoxButton")
    if(btn){
        btn.addEventListener("click",async ()=> {
            let responce = await fetch("/api/login/", {
                method: 'POST',
                headers: {'Content-Type': 'application/json;charset=utf-8'},
                body: JSON.stringify({email: elem.value})
            })
            if (responce.ok) {
                let result = await responce.json();
                document.querySelectorAll(".emailInput").forEach(e => {
                    e.style.display = "none"
                })
                document.querySelectorAll(".codeInput").forEach(e => {
                    e.style.display = "block"
                })
            }
        }
} catch (e) { console.warn(e) }
