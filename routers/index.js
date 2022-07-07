const express = require('express');
const StarUtil = require('../utils/StarUtil');
const ChartUtil = require("../utils/ChartUtil");
const HttpCodeUtil = require("../utils/HttpCodeUtil");

const router = express.Router();

router.get('/', function (req, res, next) {
    let result = {
        input: true,
    }
    res.render('index',result);
});

router.get('/:owner/:repo', async function (req, res, next) {
    const result = await renderRepoInfo(req)

    if(HttpCodeUtil.verify(result.code)){
        result.url = req.protocol+"://"+req.headers.host
        result.input = false
        res.render("index",result)
    }else{
        res.render("error",{msg:HttpCodeUtil.getMsg(result.code)})
    }
});

router.get('/:owner/:repo/chart.svg', async function (req, res, next) {
    const result = await renderStargazers(req)

    if(HttpCodeUtil.verify(result.code)){
        res.writeHead(200, {
            'Content-Type': 'image/svg+xml;charset=utf-8'
        });
        res.write(result.svgStr);
        res.end()
    }else{
        res.render("error",{msg:HttpCodeUtil.getMsg(result.code)})
    }
});

async function renderRepoInfo(req) {
    const owner = req.params.owner
    const repo = req.params.repo

    const result = await StarUtil.getRepoInfo({
        owner: owner,
        repo: repo,
    });

    let data = {}
    if(result.code !== 200){
        data.code= result.code
        return data;
    }else{
        data = {
            code: result.code,
            name: owner+'/'+repo,
            creatTime: result.creatTime,
            starNum: result.starNum
        }
        return data;
    }
}

async function renderStargazers(req) {
    const owner = req.params.owner
    const repo = req.params.repo

    const result = await StarUtil.getStargazers({
        owner: owner,
        repo: repo,
        page: 1,
        per_page: 100
    });

    let data = {}
    if(result.code !== 200){
        data.code= result.code
        return data;
    }else{
        data = {
            code: result.code,
            name: owner+'/'+repo,
            svgStr: ChartUtil.getStarChart(result.times,result.starNums),
            creatTime: result.times[0],
            starNum: result.starNums[result.starNums.length-1]
        }
        return data;
    }
}

module.exports = router;
