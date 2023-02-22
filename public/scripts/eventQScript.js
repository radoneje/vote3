let app = new Vue({
    el:"#app",
    data:{
        event:event,
        q:[],
    },
    methods:{
        toogleEvent:async function(column){
            this.event[column]=!this.event[column]
        },
        updateStatus:async function(lastTime){
            let timeout=20;
            let res=await fetch("/c/status/"+event.short+"/"+lastTime+"?prm=all")
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

    },
    mounted:async function () {
        this.updateStatus(0)
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
