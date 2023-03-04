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
        if(!elem.value.length) {
            elem.parentNode.classList.add("error")
            elem.focus();
            return;
        }
    })
    let btn=document.querySelector("#regBoxConfirmButton")
    elem.onkeydown=(e)=>{
        if(e.keyCode==13)
            btn.click();
    }
    btn.addEventListener("click", async () => {
        if(!elem.value.match(/^\d+$/)){
            elem.parentNode.classList.add("error")
            elem.focus();
            elem.value=""
        }
        let responce = await fetch("/api/checkCode/", {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify({email, code:elem.value})
        })
        if (responce.ok) {
            let result = await responce.json();
            document.location.href="/userEvent/";
        }
        else {
            elem.parentNode.classList.add("error")
            elem.focus();
            elem.value=""
        }
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
            else {
                elem.parentNode.classList.add("error")

            }


        })
    }
    let btn=document.querySelector("#regBoxButton")
    elem.onkeydown=(e)=>{
        if(e.keyCode==13)
            btn.click();
    }
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
                activateCodeForm(elem.value);
            }
        })
    }
} catch (e) { console.warn(e) }

const regVK=()=>{
    const windowFeatures = "left=100,top=100,width=320,height=320";
    const handle = window.open(
        "https://oauth.vk.com/authorize?client_id=51571826&display=popup&scope=email&redirect_uri=https://event-24.ru/verify",
        "mozillaWindow",
        "popup"
    );
    return;

}
