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
document.querySelectorAll(".linkQr").forEach(elem => {
    elem.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        let link=elem.parentNode.querySelector(".linkText").innerHTML;
        let a=document.createElement("a")
        a.download="qr_code.png"
        a.href="/qrcode/"+encodeURI(link)
        a.click();
        d.body.appendChild(a)

    })
})

