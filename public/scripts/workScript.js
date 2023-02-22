let app = new Vue({
    el:"#app",
    data:{
        event:{},
        qText:'',
        personid:null,
        person:{approve:false},
        showPersonBox:false,
        regError:""
    },
    methods:{
        regPerson: async function(){
            if(!person.i || (person.i && person.i.length<0)){
                this.regError="Поле Имя должно быть заполнено";
                document.getElementById("persI").focus()
                return;
            }
        },
        sendQ:async function(lastTime){
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
        showPersonBox:function (){
            if(this.showPersonBox)
                setTimeout(()=>{document.getElementById("persI").focus()},0);
        }
    },
    mounted:async function (){
        this.updateStatus(0)
        try {
            this.personid=localStorage.getItem("personid")
        } catch (e) {
            console.warn("cant access to Local Storage")
        }
    }
})
