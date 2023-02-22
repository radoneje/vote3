

let app = new Vue({
    el:"#app",
    data:{
        event:event,
        q:[],
        files:[],
        uploading:[]
    },
    methods:{
        uploadFile:async function(file){
            let res=await get("/api/newFile")
            if(res.err)
                return console.warn(res.message);
            let fileid=res.data
            let fd=new FormData();
            fd.append("file", file)
            fd.append("id", fileid)
            const xhr = new XMLHttpRequest()
            xhr.responseType = 'json'
            xhr.onreadystatechange = async function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    let res=await post("/api/fileToEvent",{fileid, short:event.short})
                    console.log(xhr.response)
                }
            }

            xhr.open('POST', "/api/uploadFile")
            xhr.send(fd)

        },
        selectFile:function (){
            let inp=document.createElement("input")
            inp.type="file";
            inp.click();
            inp.onchange= ()=>{
                this.uploadFile(inp.files[0]);
            }
        },
        approveAllQ:async function(column, status){
            for(let item of this.q)
            {
                item[column]=status;
                let dt={id:item.id}
                dt[column]=item[column]
                this.q=this.q.filter(qq=>!qq.isDeleted);
                await post("/api/q/",dt);
            }
        },
        toogleQ:async function(column, item){
            item[column]=!item[column]
            let dt={id:item.id}
            dt[column]=item[column]
            this.q=this.q.filter(qq=>!qq.isDeleted);
            await post("/api/q/",dt);
        },
        toogleEvent:async function(column){
            this.event[column]=!this.event[column]
            let dt={id:event.id}
            dt[column]=this.event[column]
            await post("/api/event/",dt);
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
const get =(url)=>{
    return new Promise(async (resolve, reject)=>{
        let res = await fetch(url, {
            method: 'GET',
        })
        if(res.ok){
            let ret=await res.json()

            resolve({data:ret})
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
