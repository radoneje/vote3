/*document.querySelectorAll(".linkGroup").forEach(elem => {
    elem.addEventListener("click", async () => {
        await navigator.clipboard.writeText(elem.querySelector(".linkText").innerHTML)
        let btn = elem.querySelector(".linkCopy")
        let txt = btn.innerHTML
        btn.innerHTML = "Готово"
        setTimeout(() => {
            btn.innerHTML = txt
        }, 2000)
    })
})*/
document.querySelectorAll(".linkQr").forEach(elem => {
   /* elem.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        let link=elem.getAttribute("href")
        let a=document.createElement("a")
        a.download="qr_code.png"
        a.href="/qrcode/?url="+encodeURI(link)
        a.click();
        document.body.appendChild(a)

    })*/
})
let qEnable=document.getElementById("qEnable")
if(qEnable){
    qEnable.addEventListener("click",()=>{
        qEnable.classList.toggle("active")
    })

}
let qPreModEnable=document.getElementById("qPreModEnable")
if(qPreModEnable){
    qPreModEnable.addEventListener("click",()=>{
        qPreModEnable.classList.toggle("active")
    })

}
let timeout=ms=>{
    return new Promise((resolve, reject)=>{
        setTimeout(resolve, ms);
    })
}

