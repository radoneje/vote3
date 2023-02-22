let app = new Vue({
    el:"#app",
    data:{
        event:{},
        qText:'',
        personid:null,
        showPersonBox:false
    },
    methods:{
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
    watch:{},
    mounted:async function (){
        this.updateStatus(0)
        try {
            this.personid=localStorage.getItem("personid")
        } catch (e) {
            console.warn("cant access to Local Storage")
        }
    }
})
