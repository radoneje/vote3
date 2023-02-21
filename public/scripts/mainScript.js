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
} catch (e) { console.warn(e) }
