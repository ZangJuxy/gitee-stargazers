const request = require('request');
const moment = require("moment");
const {gitee,repoCache} = require("../config/config");

const GiteeTokenUtil = require("./GiteeTokenUtil");
const FileUtil = require("./FileUtil");


function Star(){}

Star.isExpired = function (expiresIn, createAt) {
    return new Date().getTime() > ((createAt + expiresIn) * 1000)
}

Star.getRepoInfo = async function (data) {
    data.access_token = await GiteeTokenUtil.getToken();

    if(!data.access_token){
        console.log("StarUtil: token获取失败")
        return {
            code: 500
        };
    }

    const that = this;
    return new Promise((resolve)=>{
        that.getRepoData(data,async function (res) {
            resolve(res)
        })
    })
}

Star.getStargazers = async function(data){
    const repoStarCache = await FileUtil.readFile(repoCache.repoCachePath + data.owner + '/' + data.repo + '.json')
    if(repoStarCache){
        const repoCacheJson = JSON.parse(repoStarCache);
        if(!this.isExpired(repoCacheJson.expires_in,repoCacheJson.created_at)){
            console.log("StarUtil: 查询star数据 " + data.owner + "/" + data.repo + " 命中缓存")
            return repoCacheJson;
        }
    }
    data.access_token = await GiteeTokenUtil.getToken();
    if(data.access_token === ""){
        return data.code = 500;
    }

    const that = this;
    let dataList = {
        times: [],
        starNums: []
    }
    return new Promise((resolve)=>{
        that.getData(that,data,dataList,async function (res) {
            if(res.code === 200){
                if(res.currentPage === parseInt(res.totalPage)){
                    for (let i = 0; i < dataList.starNums.length; i++) {
                        if (i !== 0) {
                            dataList.starNums[i] = dataList.starNums[i] + dataList.starNums[i - 1];
                        } else {
                            dataList.starNums[i] = dataList.starNums[i];
                        }
                    }
                    dataList.code = res.code
                    if(res.code===200){
                        dataList.created_at = parseInt(new Date().getTime()/1000)
                        dataList.expires_in = repoCache.repoCacheExpires
                        FileUtil.writeFile(repoCache.repoCachePath + data.owner + '/',data.repo + '.json',JSON.stringify(dataList))
                    }
                    resolve(dataList)
                }
            }else{
                resolve({code: res.code})
            }
        })
    })

}

Star.getData = async function(that,data,dataList,callback){

    let requestData = '?';
    Object.keys(data).forEach(function (k) {
        requestData = requestData + (k + "=" + encodeURIComponent(data[k])) + "&"
    })

    const currentPage = data.page;
    await request({
        url: gitee.apiUrl+'/repos/'+data.owner+'/'+data.repo+'/stargazers'+requestData,
        method: "get",
        headers: {
            "content-type": "text/html; charset=utf-8",
        },
    },function (error, res, body) {
        if (!(!error && res.statusCode === 200)) {
            console.log("StarUtil: 查询star数据失败,请求接口异常 code:" + res.statusCode + " msg:" + res.body + " 异常页: " + currentPage)
            callback({
                code: res.statusCode,
                currentPage: currentPage
            })
        } else {
            const starInfoBody = JSON.parse(body)
            for (let i = 0; i < starInfoBody.length; i++) {
                let time = moment(starInfoBody[i].star_at).format('YYYY-MM-DD');
                if (dataList.times.indexOf(time) !== -1) {
                    dataList.starNums[dataList.times.indexOf(time)] = dataList.starNums[dataList.times.indexOf(time)] + 1
                } else {
                    dataList.times.push(time)
                    dataList.starNums.push(1)
                }
            }

            const totalPage = res.headers.total_page
            console.log("StarUtil: 查询star数据 当前第" + currentPage + "页,共" + totalPage + "页,总条数:" + res.headers.total_count)

            callback({
                code: res.statusCode,
                currentPage: currentPage,
                totalPage: totalPage
            })

            if (currentPage < totalPage) {
                data.page = currentPage + 1;
                that.getData(that, data, dataList, callback)
            }
        }
    })
}


Star.getRepoData = async function(data,callback){
    data.page = 1
    data.per_page = 1

    let requestData = '?';
    Object.keys(data).forEach(function (k) {
        requestData = requestData + (k + "=" + encodeURIComponent(data[k])) + "&"
    })

    await request({
        url: gitee.apiUrl+'/repos/'+data.owner+'/'+data.repo+'/stargazers'+requestData,
        method: "get",
        headers: {
            "content-type": "text/html; charset=utf-8",
        },
    },function (error, res, body) {
        const code = res.statusCode;
        if (!(!error && res.statusCode === 200)) {
            callback({
                code: code
            })
            console.log("StarUtil: 查询仓库数据,请求接口异常 code:" + res.statusCode + " msg:" + res.body)
        } else {
            const starInfoBody = JSON.parse(body)
            if(starInfoBody && starInfoBody.length !== 0){
                const creatTime = moment(starInfoBody[0].star_at).format('YYYY-MM-DD')
                const starNum = res.headers.total_count
                callback({
                    code: code,
                    creatTime: creatTime,
                    starNum: starNum
                })
                console.log("StarUtil: 查询仓库数据 仓库: "+data.owner+'/'+data.repo +" 创建时间: "+creatTime+" 总star数: "+starNum)
            }else{
                callback({
                    code: 404
                })
            }
        }
    })
}

module.exports = Star;
