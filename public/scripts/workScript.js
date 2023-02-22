
let app = new Vue({
    el:"#app",
    data:{
        event:{},
        qText:'',
        personid:null,
        person:{approve:false, short:short},
        showPersonBox:false,
        regError:"",
        q:[],
        newQ:0,
    },
    methods:{
        scrollQ:function(e){
            let objDiv = document.querySelector(".pqBox")
            if(objDiv)
                objDiv.scrollTop = objDiv.scrollHeight;
        },
        onScrollQ:function(e){
            console.log("onScrollQ",e.target.scrollTop,e.target.scrollHeight-e.target.offsetHeight  )
            if(e.target.scrollTop>= (e.target.scrollHeight-e.target.offsetHeight -20))
                this.newQ=0;
        },
        regPerson: async function(){
            if(!this.person.i || this.person.i.length<0){
                this.regError="Поле Имя должно быть заполнено";
                document.getElementById("persI").focus()
                return;
            }
            if(!this.person.f || this.person.f.length<0){
                this.regError="Поле Фамилия должно быть заполнено";
                document.getElementById("persF").focus()
                return;
            }
            if(!this.person.phone || this.person.phone.length<0){
                this.regError="Поле Телефон должно быть заполнено";
                document.getElementById("persPhone").focus()
                return;
            }
            if(!this.person.email || this.person.email.length<0 || !validateEmail(this.person.email)){
                this.regError="Поле Email должно быть заполнено корректно";
                document.getElementById("persEmail").focus()
                return;
            }
            this.regError=false;

            let responce = await fetch("/api/regPerson/", {
                method: 'POST',
                headers: {'Content-Type': 'application/json;charset=utf-8'},
                body: JSON.stringify(this.person)
            })

            if (responce.ok) {

                let result = await responce.json();
                this.showPersonBox=null;
                this.personid=result.personid;
                await this.sendQ();
            }
            else {
                this.regError="Ошибка регистрации, попробуйте позже";
            }


        },
        sendQ:async function(){
            if(this.qText.length==0)
                return ;
            if(!this.personid)
                return this.showPersonBox=true
            let ret=await post("/api/newQ",{personid:this.personid, text:this.qText, eventshort:short})
            this.q.push(ret.data)
            this.qText="";
            setTimeout(()=>{
                let objDiv = document.querySelector(".pqBox")
                objDiv.scrollTop = objDiv.scrollHeight;
            },0)

            console.log(ret)
        },
        updateStatus:async function(lastTime){
            let timeout=20;
            let res=await fetch("/c/status/"+short+"/"+lastTime)
            if(res.ok){
                let r=await res.json();
                timeout=r.timeout;
                lastTime=r.lastTime;
                if(r.event)
                    this.event=r.event;
                if(r.q){
                    r.q.forEach(item=>{
                        if(this.q.filter(qq=>qq.id==item.id).length==0) {

                            if(this.q.length>1) {
                                let lastElem = document.querySelector(".qItem[qid='" + this.q[this.q.length - 1].id + "']")
                                if (lastElem && isInViewport(lastElem))
                                    setTimeout(() => {
                                        this.scrollQ()
                                    }, 100)
                                else
                                    this.newQ++;
                            }
                            this.q.push(item)
                        }
                        else{
                            this.q.forEach(qq=>{
                                if(qq.id==item.id){
                                    qq.trxt=item.text;
                                    qq.isMod=item.isMod;
                                    qq.isDeleted=item.isDeleted;
                                }
                            })
                        }
                    })
                    this.q=this.q.filter(qq=>!qq.isDeleted)
                }
            }
            setTimeout(()=>{
                this.updateStatus(lastTime)
            }, timeout*1000);
        }
    },
    watch:{
        personid:function (){
            try {
                localStorage.setItem("personid", this.personid)
            }catch (e) {
                console.warn(e)
            }
        },
        person:function (){
            try {
                localStorage.setItem("person", JSON.stringify(this.person))
            }catch (e) {
                console.warn(e)
            }
        },
        showPersonBox:function (){
            if(this.showPersonBox)
                setTimeout(()=>{document.getElementById("persI").focus()},0);
        }
    },
    mounted:async function (){
        this.updateStatus(0)
        setTimeout(() => {
            this.scrollQ();
        }, 1000)
        try {
            this.personid=localStorage.getItem("personid")
            let person = localStorage.getItem("person")
            if(person )
                this.person=JSON.parse(person)
        } catch (e) {
            console.warn("cant access to Local Storage")
        }
    }
})
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const post =(url, body)=>{
    return new Promise(async (resolve, reject)=>{
        let res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify(body)
        })
        if(res.ok){
            resolve({data:await res.json()})
        }
        else
            resolve({err:true, message:await res.text()})

    })



}
const isInViewport=(element) =>{
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentNode.getBoundingClientRect();
    return rect.top<parentRect.bottom

}
