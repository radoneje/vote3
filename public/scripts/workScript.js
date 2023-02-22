
let app = new Vue({
    el:"#app",
    data:{
        event:{},
        qText:'',
        personid:null,
        person:{approve:false, short:short},
        showPersonBox:false,
        regError:""
    },
    methods:{
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
            this.showPersonBox=null;
            if (responce.ok) {
                let result = await responce.json();

               // this.personid=result.personid;
                //await this.sendQ();
            }
            else {
                this.regError="Ошибка регистрации, попробуйте позже";
            }


        },
        sendQ:async function(){
            if(!this.personId) {
                return this.showPersonBox=true
            }
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
            }
            setTimeout(()=>{
                this.updateStatus(lastTime)
            }, timeout*1000);
        }
    },
    watch:{
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
