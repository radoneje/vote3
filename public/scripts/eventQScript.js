let app = new Vue({
    el: "#app",
    data: {
        event: event,
        q: [],
        files: [],
        uploading: [],
        votes: [],
        clouds:[],
        players:[],
        baros:[]
    },
    methods: {
        baroLike:async function(baro){
            let elem=document.getElementById("baroLike"+baro.id)
            if(!elem)
                return;
            if(elem.classList.contains("active")) {
                document.getElementById("baroLike"+baro.id).classList.remove("active")
                return;
            }
            elem.classList.add("active")
            if(elem.classList.contains("clicked"))
                return;
            elem.classList.add("clicked")
            setTimeout(()=>{ document.getElementById("baroLike"+baro.id).classList.remove("active")},500)
            setTimeout(()=>{ document.getElementById("baroLike"+baro.id).classList.remove("clicked")},2000)
            let ret =await post("/api/baroLike",{personid:this.personid, short:baro.short, value:1})
            if(ret.err)
                return console.warn(ret.message)
            this.personid=ret.data.personid;
            console.log(ret)
        },
        baroUnLike:async function(baro,e){
            let elem=document.getElementById("baroUnLike"+baro.id)
            if(!elem)
                return;
            if(elem.classList.contains("active")) {
                document.getElementById("baroUnLike"+baro.id).classList.remove("active")
                return;
            }
            elem.classList.add("active")
            if(elem.classList.contains("clicked"))
                return;
            elem.classList.add("clicked")
            setTimeout(()=>{ document.getElementById("baroUnLike"+baro.id).classList.remove("active")},500)
            setTimeout(()=>{ document.getElementById("baroUnLike"+baro.id).classList.remove("clicked")},2000)
            let ret =await post("/api/baroLike",{personid:this.personid, short:baro.short, value:-1})
            if(ret.err)
                return console.warn(ret.message)
            this.personid=ret.data.personid;

        },

        uploadVideoToPlayer:async function(player){
            let inp = document.createElement("input")
            inp.type = "file";

            inp.accept="video/mp4"
            inp.click();
            inp.onchange = () => {
                this.uploadFileDo(inp.files[0],async (fileid, fileshort)=>{
                    console.log(fileshort)
                    player.url="/file/" + fileshort
                    await this.changePlayer('url',player)
                });
            }
        },
        uploadPosterToPlayer:async function(player){
            let inp = document.createElement("input")
            inp.type = "file";

            inp.accept="image/jpeg,image/png"
            inp.click();
            inp.onchange = () => {
                this.uploadFileDo(inp.files[0],async (fileid, fileshort)=>{
                    console.log(fileshort)
                    player.poster="/file/" + fileshort
                    await this.changePlayer('poster',player)
                });
            }
        },
        playerTypeChange:async function(){
            console.log("change")
        },
        scrollQ: function (e) {
            let objDiv = document.querySelector(".scroolBox")
            if (objDiv)
                objDiv.scrollTop = objDiv.scrollHeight;
        },
        formatPerc:function(num){
            if(num==100 || num==0)
                return num
            return (Math.round(num * 100) / 100).toFixed(2);
        },
        addAnswer: async function (item) {
            let r = await post("/api/addAnswer", {id: item.id})
            if (r.err)
                return console.warn(r.message)
            item.answers.push(r.data)
            setTimeout(()=>{
                let lastElem = document.querySelector(".vVoteAnswInput[answerid='" + r.data.id + "']")
                if(lastElem)
                    lastElem.focus();
            },0)
        },
        changeAnswer: async function (col, item) {
            let prm = {};
            prm[col] = item[col]
            let r = await post("/api/changeAnswer", {id: item.id, prm})
        },
        changeVote: async function (col, item) {
            let prm = {};
            prm[col] = item[col]
            let r = await post("/api/changeVote", {id: item.id, prm})
        },
        changeCloud:async function (col, item) {
            let prm = {};
            prm[col] = item[col]
            let r = await post("/api/changeCloud", {id: item.id, prm})
        },

        addVote: async function (item) {
            let r = await post("/api/addVote", {short: event.short})
            if (r.err)
                return console.warn(e.message)
            this.votes.push(r.data);
            if(this.votes.length>1) {
                let lastElem = document.querySelector(".qItem[voteid='" + this.votes[this.votes.length - 2].id + "']")
                if (lastElem)
                    setTimeout(() => {
                        this.scrollQ()
                    }, 100)
            }
            setTimeout(()=>{
                let lastElem = document.querySelector(".qItem[voteid='" + r.data.id + "']")
                if(lastElem)
                    lastElem.querySelector(".vItemTitleInput").focus();
            },0)


        },
        addCloud: async function (item) {
            let r = await post("/api/addCloud", {short: event.short})
            if (r.err)
                return console.warn(e.message)
            this.clouds.push(r.data);
            if(this.clouds.length>1) {
                let lastElem = document.querySelector(".qItem[cloudid='" + this.clouds[this.clouds.length - 2].id + "']")
                if (lastElem)
                    setTimeout(() => {
                        this.scrollQ()
                    }, 100)
            }
            setTimeout(()=>{
                let lastElem = document.querySelector(".qItem[cloudid='" + r.data.id + "']")
                if(lastElem)
                    lastElem.querySelector(".vItemTitleInput").focus();
            },0)


        },
        downloadEventFile: function (item) {
            let a = document.createElement("a")
            a.href = "/file/" + item.short
            a.download = item.originalname;
            a.click();
        },
        uploadFile:async function (file){
            await this.uploadFileDo(file, async (fileid)=>{
                let res = await post("/api/fileToEvent", {fileid, short: event.short})
                if (!res.err) {
                    this.files.push(res.data)
                    setTimeout(() => {
                        this.uploading = this.uploading.filter(u => u.id != uploadItem.id)
                    }, 2000)
                } else
                    console.warn(res.message)
            })
        },
        uploadFileDo: async function (file, callBack) {

            let res = await get("/api/newFile")
            if (res.err)
                return console.warn(res.message);
            let fileid = res.data.id;
            let fileshort=res.data.short;
            let uploadItem = {id: fileid, name: file.name, done: 0, total: file.size, percent: 0, status: 0, err: false}
            this.uploading.push(uploadItem);
            let fd = new FormData();
            fd.append("file", file)
            fd.append("name", file.name)
            fd.append("id", fileid)
            const xhr = new XMLHttpRequest()
            xhr.responseType = 'json'
            xhr.onreadystatechange = async () => {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if (xhr.status == 200) {
                        callBack(fileid, fileshort)

                    } else {
                        uploadItem.err = true
                    }
                }
            }
            xhr.upload.onprogress = (ev) => {
                uploadItem.done = ev.loaded
                uploadItem.total = ev.total
                uploadItem.percent = parseInt((parseFloat(ev.loaded) / parseFloat(ev.total)) * 100) + "%"
                console.log(ev.loaded, ev.total)
            }

            xhr.open('POST', "/api/uploadFile")
            xhr.send(fd)

        },
        selectFile: function () {
            let inp = document.createElement("input")
            inp.type = "file";
            inp.click();
            inp.onchange = () => {
                this.uploadFile(inp.files[0]);
            }
        },
        approveAllVote: async function (column, status) {
            for (let item of this.votes) {
                item[column] = status;
                let dt = {id: item.id}
                dt[column] = item[column]
                this.votes = this.votes.filter(qq => !qq.isDeleted);
                await post("/api/vote/", dt);
            }
        },
        approveAllFile: async function (column, status) {
            for (let item of this.files) {
                item[column] = status;
                let dt = {id: item.id}
                dt[column] = item[column]
                this.files = this.files.filter(qq => !qq.isDeleted);
                await post("/api/file/", dt);
            }
        },
        approveAllQ: async function (column, status) {
            for (let item of this.q) {
                item[column] = status;
                let dt = {id: item.id}
                dt[column] = item[column]
                this.q = this.q.filter(qq => !qq.isDeleted);
                await post("/api/q/", dt);
            }
        },
        changeFile: async function (item) {
            await post("/api/file/", item);
        },
        toogleAnswer: async function (column, item) {
            //if(column=="isComplite" && !item.isActive)
            //    return;
            if (column == "isDeleted") {
                let exit = false;
                this.votes.forEach(v => {
                    if (v.id == item.voteid) {
                        if(v.answers.filter(a=>!a.isDeleted).length<=2)
                            exit=true
                    }
                })
                if(exit)
                    return alert("Ответов должно быть больше двух, удалить невозможно.")
            }
            item[column] = !item[column]
            let dt = {id: item.id}
            dt[column] = item[column]
            this.votes.forEach(vote => {
                if (vote.id == item.voteid) {
                    vote.answers = vote.answers.filter(a => !a.isDeleted)
                }
            })
            await post("/api/answer/", dt);
        },
        toogleVote: async function (column, item) {
            //if(column=="isComplite" && !item.isActive)
            //    return;
            item[column] = !item[column]
            let dt = {id: item.id}
            dt[column] = item[column]
            this.votes = this.votes.filter(qq => !qq.isDeleted);
            await post("/api/vote/", dt);
        },
        toogleCloud: async function (column, item) {
            //if(column=="isComplite" && !item.isActive)
            //    return;
            item[column] = !item[column]
            let dt = {id: item.id}
            dt[column] = item[column]
            this.votes = this.votes.filter(qq => !qq.isDeleted);
            await post("/api/cloud/", dt);
        },
        toogleFile: async function (column, item) {
            item[column] = !item[column]
            let dt = {id: item.id}
            dt[column] = item[column]
            this.files = this.files.filter(qq => !qq.isDeleted);
            await post("/api/file/", dt);
        },
        toogleBaro: async function (column, item) {
            item[column] = !item[column]
            let dt = {id: item.id}
            dt[column] = item[column]
            this.files = this.files.filter(qq => !qq.isDeleted);
            await post("/api/baro/", dt);
        },
        toogleQ: async function (column, item) {
            item[column] = !item[column]
            let dt = {id: item.id}
            dt[column] = item[column]
            this.q = this.q.filter(qq => !qq.isDeleted);
            await post("/api/q/", dt);
        },
        toogleEvent: async function (column) {
            this.event[column] = !this.event[column]
            let dt = {id: event.id}
            dt[column] = this.event[column]
            console.log(this.event[column], column)
            await post("/api/event/", dt);
            this.$forceUpdate();
        },
        tooglePlayer: async function (column, player) {
            player[column] = player[column]?false:true

            let dt = {id: player.id}
            dt[column] =player[column]
            await post("/api/player/", dt);
            document.location.reload();
           // this.$forceUpdate();
        },
        changeTypePlayer: async function (column, player, e) {
            player[column]=e.target.getAttribute("value")
           await this.changePlayer(column, player)
        },
        changePlayer: async function (column, player) {
            let dt = {id: player.id}
            dt[column] =player[column]
            await post("/api/player/", dt);
            document.location.reload();
        },
        changeEvent: async function (column) {
            //this.event[column] = value
            let dt = {id: event.id}
            dt[column] = this.event[column]

            await post("/api/event/", dt);
            this.$forceUpdate();
        },
        updateStatus: async function (lastTime) {
            let timeout = 20;
            let res = await fetch("/c/status/" + event.short + "/" + lastTime + "?prm=all")
            if (res.ok) {
                let r = await res.json();
                timeout = r.timeout;
                lastTime = r.lastTime;
                if (r.event)
                    this.event = r.event;


                if (r.q) {
                    r.q.forEach(item => {
                        if (this.q.filter(qq => qq.id == item.id).length == 0) {

                            if (this.q.length > 1) {
                                let lastElem = document.querySelector(".qItem[qid='" + this.q[this.q.length - 1].id + "']")
                                if (lastElem && isInViewport(lastElem))
                                    setTimeout(() => {
                                        this.scrollQ()
                                    }, 100)
                                else
                                    this.newQ++;
                            }
                            this.q.push(item)
                        } else {
                            this.q.forEach(qq => {
                                if (qq.id == item.id) {
                                    qq.text = item.text;
                                    qq.isMod = item.isMod;
                                    qq.isDeleted = item.isDeleted;
                                }
                            })
                        }
                    })
                    this.q = this.q.filter(qq => !qq.isDeleted)
                }
                /////////////
                if (r.files) {
                    r.files.forEach(item => {
                        if (this.files.filter(qq => qq.id == item.id).length == 0) {

                            this.files.push(item)
                        } else {
                            this.files.forEach(qq => {
                                if (qq.id == item.id) {
                                    qq.title = item.title;
                                    qq.isMod = item.isMod;
                                    qq.isDeleted = item.isDeleted;
                                }
                            })
                        }
                    })
                    this.files = this.files.filter(qq => !qq.isDeleted)
                }
                /////
                if(r.players){
                    r.players.forEach(item => {
                        if (this.players.filter(qq => qq.id == item.id).length == 0) {
                            this.players.push(item)
                        } else {
                            this.players.forEach(qq => {
                                if (qq.id == item.id) {
                                    qq.type = item.type;
                                    qq.isActive = item.isActive;
                                    qq.YT = item.YT;
                                    qq.url = item.url;
                                    qq.urlType = item.urlType;
                                    qq.poster = item.poster;


                                }
                            })
                        }
                    })
                    //this.players = this.players.filter(qq => !qq.isDeleted)
                }
                //////
                if(r.baros) {
                    r.baros.forEach(item => {
                        if (this.baros.filter(qq => qq.id == item.id).length == 0) {
                                        this.baros.push(item)
                        } else {
                            this.baros.forEach(qq => {
                                if (qq.id == item.id) {
                                    qq.isActive = item.isActive;
                                    qq.like= item.like;
                                    qq.dislike= item.dislike;
                                }
                            })
                        }
                    })

                }
                /////////////
                if (r.votes) {
                    r.votes.forEach(item => {
                        if (this.votes.filter(qq => qq.id == item.id).length == 0) {

                            this.votes.push(item)
                        } else {
                            this.votes.forEach(qq => {
                                if (qq.id == item.id) {
                                    for(let key of Object.keys(item)){
                                        if(key!="id")
                                            qq[key]=item[key]
                                    }
                                }
                            })
                        }
                    })
                    this.votes = this.votes.filter(qq => !qq.isDeleted)
                    this.$forceUpdate();
                }

                /////
                if (r.clouds) {
                    r.clouds.forEach(item => {
                        if (this.clouds.filter(qq => qq.id == item.id).length == 0) {

                            this.clouds.push(item)
                        } else {
                            this.clouds.forEach(qq => {
                                if (qq.id == item.id) {
                                    for(let key of Object.keys(item)){
                                        if(key!="id")
                                            qq[key]=item[key]
                                    }
                                }
                            })
                        }
                    })
                    this.clouds = this.clouds.filter(qq => !qq.isDeleted)
                    this.$forceUpdate();
                }
                ///////
            }
            setTimeout(() => {
                this.updateStatus(lastTime)
            }, timeout * 1000);
        }
    },
    watch: {
        players:function (){
            this.players.forEach(pl=>{
                if(pl.isActive && pl.type==1){
                    setTimeout(()=>{
                        console.log(pl)
                        if(videoPlayers[pl.short])
                            videojs(pl.short).dispose();

                        videoPlayers[pl.short]=videojs(pl.short)
                        let type="video/mp4"
                        if(pl.url.match(/\.m3u8$/))
                            type="application/x-mpegURL"
                        if(pl.url.match(/\.smil$/))
                            type="application/x-mpegURL"

                        videoPlayers[pl.short].src({src:pl.url, type})
                        videoPlayers[pl.short].poster( pl.poster);

                    },100)
                }
                else
                    delete videoPlayers[pl.short]

            })
        }
    },
    mounted: async function () {
        this.updateStatus(0)
    }
})

let dropArea = document.getElementById('fileWr')
if (dropArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
    })

    function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false)
    })

    function highlight(e) {
        dropArea.classList.add('highlight')
    }

    function unhighlight(e) {
        dropArea.classList.remove('highlight')
    }

    dropArea.addEventListener('drop', handleDrop, false)

    async function handleDrop(e) {
        let dt = e.dataTransfer
        let files = dt.files
        for (let file of files) {
            await app.uploadFile(file)
        }
    }
}

let videoPlayers={};
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const post = (url, body) => {
    return new Promise(async (resolve, reject) => {
        let res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify(body)
        })
        if (res.ok) {
            resolve({data: await res.json()})
        } else
            resolve({err: true, message: await res.text()})

    })
}
const get = (url) => {
    return new Promise(async (resolve, reject) => {
        let res = await fetch(url, {
            method: 'GET',
        })
        if (res.ok) {
            let ret = await res.json()

            resolve({data: ret})
        } else
            resolve({err: true, message: await res.text()})

    })
}
const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentNode.getBoundingClientRect();
    return rect.top < parentRect.bottom

}
const initSelectCtrl=(ctrl)=>{
    console.log(ctrl)
    ctrl.addEventListener(
        "change",
        (e) => {
            console.log(e)
        },
        false
    );
    if(!ctrl)
        return;
    ctrl.onclick=()=>{
        ctrl.classList.toggle("active")
        ctrl.querySelectorAll(".aSelectCtrlItem").forEach(elem=>{
            if(elem.getAttribute("value")==ctrl.getAttribute("value"))
                elem.classList.add("active")
            else
                elem.classList.remove("active")
        })
    }
    ctrl.querySelectorAll(".aSelectCtrlItem").forEach(elem=>{
        elem.onclick=()=>{
            ctrl.setAttribute("value", elem.getAttribute("value"))
            ctrl.querySelector(".aSelectCtrlTItleSelected").innerHTML=elem.innerHTML;
            const event = new Event("change");
            ctrl.dispatchEvent(event);
        }
    })
    let initValue=ctrl.getAttribute("value")
    if(initValue){
        let elem=ctrl.querySelector(".aSelectCtrlItem[value='"+initValue+"']")
        ctrl.querySelector(".aSelectCtrlTItleSelected").innerHTML=elem.innerHTML;
    }
    else
        ctrl.removeAttribute("value")
}
