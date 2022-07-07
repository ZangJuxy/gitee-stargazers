const request = require("request");
const {gitee,token} = require("../config/config");
const FileUtil = require("./FileUtil");

function Token(){}

Token.isExpired = function (expiresIn, createAt) {
    return new Date().getTime() > ((createAt + expiresIn) * 1000)
}

Token.getToken = async function () {
    return await this.createToken()
}

Token.createToken = async function (){
    const that = this

    const fileTokenContent = await FileUtil.readFile(token.tokenPath + token.tokenFileName)

    if(fileTokenContent){
        const tokenJson = JSON.parse(fileTokenContent);
        if(that.isExpired(tokenJson.expires_in,tokenJson.created_at)){
            const token = that.refreshToken(tokenJson.refresh_token);
            if(token){
                return token;
            }
        }else{
            return tokenJson.access_token
        }
    }

    const data = {
        username: gitee.username,
        password: gitee.password,
        client_id: gitee.clientId,
        client_secret: gitee.clientSecret,
        scope: gitee.scope,
        grant_type: 'password'
    }

    let requestData = ''
    Object.keys(data).forEach(function (k) {
        requestData = requestData + (k + "=" + encodeURIComponent(data[k])) + "&"
    })

    return new Promise((resolve)=>{
        request({
            url: gitee.tokenUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: requestData,
        },function (error, res, body) {
            if (!error && res.statusCode === 200) {
                FileUtil.writeFile(token.tokenPath,token.tokenFileName,body)
                resolve(that.parseToken(body))
            }else{
                console.log("GiteeTokenUtil: 生成token失败 code:"+res.statusCode+" msg:"+res.body);
                resolve("")
            }
        })
    })
}

Token.refreshToken = async function (refreshToken){
    const that = this

    const data = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
    }

    let requestData = ''
    Object.keys(data).forEach(function (k) {
        requestData = requestData + (k + "=" + encodeURIComponent(data[k])) + "&"
    })

    return new Promise((resolve)=>{
        request({
            url: gitee.tokenUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36 Edg/103.0.1264.37",
            },
            body: requestData,
        },function (error, res, body) {
            if (!error && res.statusCode === 200) {
                FileUtil.writeFile(token.tokenPath,token.tokenFileName,body)
                resolve(that.parseToken(body))
            }else{
                console.log("GiteeTokenUtil: 更新Token失败 code:"+res.statusCode+" msg:"+res.body);
                resolve("")
            }
        })
    })
}

Token.parseToken = function (data){
    if(data){
        const tokenJson = JSON.parse(data)
        return tokenJson.access_token
    }
    return "";
}

module.exports = Token;
