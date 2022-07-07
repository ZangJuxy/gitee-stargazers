function HttpCode(){}

HttpCode.verify = function (code){
    return code === 200;
}

HttpCode.getMsg = function (code){
    let msg = '';
    switch (code){
        case 200:
            return;
        case 404:
            msg = "仓库不存在 或还没有star"
            break;
        default:
            msg = "系统异常,请稍后再试"
    }
    return msg;
}

module.exports = HttpCode;
