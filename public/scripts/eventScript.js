document.querySelectorAll(".linkGroup").forEach(elem => {
    elem.addEventListener("click", async () => {
        await navigator.clipboard.writeText(elem.querySelector(".linkText").innerHTML)
        let btn = elem.querySelector(".linkCopy")
        let txt = btn.innerHTML
        btn.innerHTML = "Готово"
        setTimeout(() => {
            btn.innerHTML = txt
        }, 2000)
    })
})
