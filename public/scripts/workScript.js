let app = new Vue({
    el: "#app",
    data: {
        event: {},
        qText: '',
        personid: null,
        person: {approve: false, short: short},
        showPersonBox: false,
        regError: "",
        q: [],
        newQ: 0,
        files: [],
        votes: [],
        clouds:[],
        cloudAnswer:[],
        cloudHTML:[],
        players:[],
    },
    methods: {

        formatPerc:function(num){
            if(num==100 || num==0)
                return num
            return (Math.round(num * 100) / 100).toFixed(2);
        },
        unvote: async function (answer) {
            if(!this.personid)
                return
            let r=await post("/api/unHand",{answer:answer.short, personid:this.personid})
        },
        isAnswered: function (answer) {
            return localStorage.getItem("answer_" + answer.id)
        },
        sendCloud: async function (cloud) {
            let value=this.cloudAnswer[cloud.short]
            if(!value)
                return;
            let btn=document.getElementById("cloudBtn"+cloud.id);
            if(btn.classList.contains('process'))
                return
            btn.classList.add('process')

            let r=await post("/api/cloudAnswer",{value,short:cloud.short, personid:this.personid})
            if(r.err) {
                //btn.innerHTML=txt
                btn.classList.remove('process')
                return console.log(r.message)
            }
            this.personid=r.data.personid;
            this.$forceUpdate();
            setTimeout(()=>{
                btn.classList.remove('process')
            },1000)
        },
        voting: async function (answer, vote) {
            let btn=document.getElementById("voteBtn"+answer.id);
            if(btn.classList.contains('process'))
                return
            btn.classList.add('process')
            if (!vote.isMulti) {
                for (let a of vote.answers) {
                    if (localStorage.getItem("answer_" + a.id))
                        await this.unvote(a);
                    localStorage.removeItem("answer_" + a.id)
                }
            }
            if (vote.isMulti && localStorage.getItem("answer_" + answer.id) ){
                localStorage.removeItem("answer_" + answer.id)
                await this.unvote(answer);
                this.$forceUpdate();
                btn.classList.remove('process')
                return;
            }
            if (!vote.isMulti && localStorage.getItem("answer_" + answer.id) ){
                this.$forceUpdate();
                btn.classList.remove('process')
                return;
            }

            localStorage.setItem("vote_" + vote.id, true)
            localStorage.setItem("answer_" + answer.id, true)
            let txt=btn.innerHTML;
            //btn.innerHTML="Голос принят"
            let r=await post("/api/hand",{answer:answer.short, personid:this.personid})
            if(r.err) {
                //btn.innerHTML=txt
                btn.classList.remove('process')
                return console.log(r.message)
            }
            this.personid=r.data.personid;
            this.$forceUpdate();
            setTimeout(()=>{
               // btn.innerHTML=txt;
                btn.classList.remove('process')
            },1000)
        },
        downloadEventFile: function (item) {
            let a = document.createElement("a")
            a.href = "/file/" + item.short
            a.download = item.originalname;
            a.click();
        },
        scrollQ: function (e) {
            let objDiv = document.querySelector(".pqBox")
            if (objDiv)
                objDiv.scrollTop = objDiv.scrollHeight;
        },
        onScrollQ: function (e) {
            console.log("onScrollQ", e.target.scrollTop, e.target.scrollHeight - e.target.offsetHeight)
            if (e.target.scrollTop >= (e.target.scrollHeight - e.target.offsetHeight - 20))
                this.newQ = 0;
        },
        regPerson: async function () {
            if (!this.person.i || this.person.i.length < 0) {
                this.regError = "Поле Имя должно быть заполнено";
                document.getElementById("persI").focus()
                return;
            }
            if (!this.person.f || this.person.f.length < 0) {
                this.regError = "Поле Фамилия должно быть заполнено";
                document.getElementById("persF").focus()
                return;
            }
            if (!this.person.phone || this.person.phone.length < 0) {
                this.regError = "Поле Телефон должно быть заполнено";
                document.getElementById("persPhone").focus()
                return;
            }
            if (!this.person.email || this.person.email.length < 0 || !validateEmail(this.person.email)) {
                this.regError = "Поле Email должно быть заполнено корректно";
                document.getElementById("persEmail").focus()
                return;
            }
            this.regError = false;

            let responce = await fetch("/api/regPerson/", {
                method: 'POST',
                headers: {'Content-Type': 'application/json;charset=utf-8'},
                body: JSON.stringify(this.person)
            })

            if (responce.ok) {

                let result = await responce.json();
                this.showPersonBox = null;
                this.personid = result.personid;
                await this.sendQ();
            } else {
                this.regError = "Ошибка регистрации, попробуйте позже";
            }


        },
        sendQ: async function () {
            if (this.qText.length == 0)
                return;
            if (!this.personid || this.personid<0)
                return this.showPersonBox = true
            let ret = await post("/api/newQ", {personid: this.personid, text: this.qText, eventshort: short})
            this.q.push(ret.data)
            this.qText = "";
            setTimeout(() => {
                let objDiv = document.querySelector(".pqBox")
                objDiv.scrollTop = objDiv.scrollHeight;
            }, 0)

            console.log(ret)
        },
        updateStatus: async function (lastTime) {
            let timeout = 20;
            let res = await fetch("/c/status/" + short + "/" + lastTime)
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
                    this.$forceUpdate();
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
                    this.files = this.files.filter(qq => qq.isMod)
                    this.$forceUpdate();
                }
                /////////////
                if (r.votes) {
                    r.votes.forEach(item => {
                        if (this.votes.filter(qq => qq.id == item.id).length == 0) {

                            this.votes.push(item)
                        } else {
                            this.votes.forEach(qq => {
                                if (qq.id == item.id) {
                                    for (let key of Object.keys(item)) {
                                        if (key != "id")
                                            qq[key] = item[key]
                                    }
                                    //qq.isMod=item.isMod;
                                    //qq.isDeleted=item.isDeleted;
                                }
                            })
                        }
                    })
                    this.votes = this.votes.filter(qq => !qq.isDeleted && qq.isActive)
                    this.$forceUpdate();
                }
                /////////////////
                if(r.players) {
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
                    this.players=this.players.filter(qq => qq.isActive)
                }
                ////////////////
                if (r.clouds) {
                    r.clouds.forEach(item => {
                        if (this.clouds.filter(qq => qq.id == item.id).length == 0) {

                            this.clouds.push(item)
                        } else {
                            this.clouds.forEach(qq => {
                                if (qq.id == item.id) {
                                    for (let key of Object.keys(item)) {
                                        if (key != "id")
                                            qq[key] = item[key]
                                    }
                                    //qq.isMod=item.isMod;
                                    //qq.isDeleted=item.isDeleted;
                                }
                            })
                        }
                        if(item.isActive && item.isComplite){
                            this.cloudHTML[item.short]="подождите, идет загрузка..."
                            fetch("/c/cloudRes/"+item.short)
                                .then(async res=>{
                                    if(res.ok){
                                        //.cloudResContainer(id="cloudResContainer"+short  data=)
                                        let dt=await res.json();
                                        if(!dt.err) {
                                            this.cloudHTML[item.short] =dt
                                                setTimeout(() => {
                                                    console.log(dt)
                                                    let chart = anychart.tagCloud(dt);
                                                    chart.container("cloudResContainer"+item.short);
                                                    chart.scale(anychart.scales.log());
                                                    chart.angles([0]);
                                                    chart.draw();
                                                }, 0)
                                        }
                                    }
                                })

                        }
                    })
                    this.clouds = this.clouds.filter(qq => !qq.isDeleted && qq.isActive)
                    this.$forceUpdate();
                }

                ////////////
            }
            setTimeout(() => {
                this.updateStatus(lastTime)
            }, timeout * 1000);
        }
    },
    watch: {
        personid: function () {
            try {
                localStorage.setItem("personid", this.personid)
            } catch (e) {
                console.warn(e)
            }
        },
        person: function () {
            try {
                localStorage.setItem("person", JSON.stringify(this.person))
            } catch (e) {
                console.warn(e)
            }
        },
        showPersonBox: function () {
            if (this.showPersonBox)
                setTimeout(() => {
                    document.getElementById("persI").focus()
                }, 0);
        },
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
        setTimeout(() => {
            this.scrollQ();
        }, 1000)
        try {
            this.personid = localStorage.getItem("personid")
            let person = localStorage.getItem("person")
            if (person)
                this.person = JSON.parse(person)
        } catch (e) {
            console.warn("cant access to Local Storage")
        }
    }
})
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
const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentNode.getBoundingClientRect();
    return rect.top < parentRect.bottom
}

