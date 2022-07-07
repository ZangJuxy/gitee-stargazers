const fs = require("fs");

function File(){}

File.readFile = function (path){
    return new Promise((resolve)=>{
        fs.readFile(path,function(err,data){
            if(err==null){
                resolve(data.toString())
            }else{
                console.log("FileUtil: 读取文件失败 "+err)
                resolve("")
            }
        })
    })
}

File.writeFile = function (path,fileName,data){
    fs.stat(path,function(err){
        if(err!=null){
            fs.mkdir(path,function (err){
                console.log("FileUtil: 目录不存在.创建目录:"+path)
                fs.writeFile(path+fileName,data,function(err){
                    if(err!=null){
                        console.log("FileUtil: 写入文件失败 "+err)
                    }
                })
            })
        }else{
            fs.writeFile(path+fileName,data,function(err){
                if(err!=null){
                    console.log("FileUtil: 写入文件失败 "+err)
                }
            })
        }
    })
}

module.exports = File;
