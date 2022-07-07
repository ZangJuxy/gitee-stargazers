const echarts = require("echarts");

function Chart(){}

Chart.getStarChart = function (times,starNums){

    const chart = echarts.init(null, null, {
        renderer: 'svg',
        ssr: true,
        width: 1024,
        height: 450
    });

    const option = {
        backgroundColor: '#FFFFFF',
        animation: false,
        xAxis: {
            type: 'category',
            data: times,
        },
        yAxis: {
            name:'Gitee StarChar',
            nameLocation: 'middle',
            nameGap: 50,
            nameRotate: 270,
            type: 'value',
            position: 'right',
        },
        series: [
            {
                data: starNums,
                type: 'line',
                smooth: true,
                showSymbol: false,
            }
        ]
    }

    chart.setOption(option)

    return chart.renderToSVGString();
}

module.exports = Chart;
