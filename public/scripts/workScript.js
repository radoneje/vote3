let app = new Vue({
    el:"#app",
    data:{

    },
    methods:{
        updateStatus:async function(lastTime){
            let timeout=20;
            let res=await fetch("/c/status/"+short+"/"+lastTime)
            if(res.ok){
                let r=await res.json();
                timeout=r.timeout;
                lastTime=r.lastTime;
            }
            setTimeout(()=>{
                this.updateStatus(lastTime)
            }, timeout*1000);
        }
    },
    watch:{},
    mounted:async function (){
        this.updateStatus(0)
    }
})
