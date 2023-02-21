const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
const activateCodeForm=(email)=>{
    let elem = document.querySelector("#regBoxCode")
    elem.addEventListener("change", () => {
        elem.parentNode.classList.remove("error")
        if(!elem.value.length)
            elem.parentNode.classList.add("error")
        return;
    })
    let btn=document.querySelector("#regBoxConfirmButton")
    btn.addEventListener("click", async () => {
        let responce = await fetch("/api/checkCode/", {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify({email, code:elem.value})
        })
    });
}

try {
    let email = localStorage.getItem("email")
    let elem = document.querySelector("#regBoxEmail")
    if (elem) {
        elem.value = email;
        elem.addEventListener("change", async () => {
            elem.parentNode.classList.remove("error")
            if(validateEmail(elem.value))
                localStorage.setItem("email", elem.value)
            else
                elem.parentNode.classList.add("error")
            if (responce.ok) {
                let result = await responce.json();
                document.location.href="/userEvent/"+result.guid;
            }
            else
                elem.parentNode.classList.add("error")

        })
    }
    let btn=document.querySelector("#regBoxButton")
    if(btn) {
        btn.addEventListener("click", async () => {
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
                let code=document.querySelector("#regBoxCode")
                code.focus();
                activateCodeFortm(elem.value);
            }
        })
    }
} catch (e) { console.warn(e) }
