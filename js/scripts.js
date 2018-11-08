$(function () {
    console.log('scripts loaded');


    //build a table with ajax loaded data
    var seaUrl = 'js/seaSurfaceTemp';
    var tempData = [];
    var temp = [];
    var upper = [];
    var lower = [];
    var year = [];
    var range = [];

    var stormUrl = 'js/storms';
    var stormsData = [];
    var numStorms = [];
    var yearStorms = [];
    var avgIntensity = [];
    var bubbleData = [];


    $.ajax({
        type: 'GET',
        dataType: 'json',
        data: tempData,
        url: seaUrl,
        async: 'true',
        success: function (tempData) {
            console.log(tempData);
            for (i = 0; i < tempData.length; i++) {
                //loop through data and build an array to put into highcharts
                year.push(tempData[i].Year);
                var toBePushed = [tempData[i].Year, tempData[i]['Annual anomaly']];
                temp.push(toBePushed);
                upper.push(tempData[i]['Upper 95% confidence interval']);
                lower.push(tempData[i]['Lower 95% confidence interval']);
                var innerArray = [tempData[i].Year, tempData[i]['Lower 95% confidence interval'], tempData[i]['Upper 95% confidence interval']];
                range.push(innerArray);
            }
            buildTempChart();
        }
    });


    $('#allStormsChart').DataTable({
        "ajax": "js/allStorms",
        "columns": [
            {"data": "Storm Name"},
            {"data": "Year"},
            {"data": "Max Classification"},
            {"data": "Max Winds"},
            {"data": "Min Pressure"}
        ]
    });


    $.ajax({
        type: 'GET',
        dataType: 'json',
        data: stormsData,
        url: stormUrl,
        async: 'true',
        success: function (stormsData) {
            console.log(stormsData);
            Taucharts.api.tickFormat.add('simpleDate', function (x) {
                return x.toString();
            })

            var chart = new Taucharts.Chart({
                guide: {
                    x: {
                        label: 'Year',
                        nice: false,
                        tickFormat: 'simpleDate'
                    },  // custom label for X axis
                    y: {
                        label: 'Number of Storms'
                    },    // custom label for Y axis
                    padding: {},   // chart paddings
                    color: {                          // custom colors
                        brewer: ['#7CB5EC']
                    },
                    size: {
                        minSize: 1,
                        maxSize: 20
                    }
                },
                data: stormsData,
                type: 'scatterplot',
                x: 'Year',
                y: 'NumStorms',
                size: 'AvgMaxWind',
                plugins: [Taucharts.api.plugins.get('tooltip')()],
                settings: {}
            });
            chart.renderTo('#stormsChart');


            //insert trendline
            var data = [
                {x: 1850, y: 2.3775, name: 'trendline'},
                {x: 2015, y: 2.8065, name: 'trendline'},
            ];
            var lineElement = {
                unit: {
                    type: 'COORDS.RECT',
                    x: 'x',
                    y: 'y',
                    guide: {
                        nice: false,
                        showGridLines: 'xy',
                        padding: {l: 56, b: 46, r: 8, t: 8},
                        x: {padding: 8, label: 'x', min: 1840, max: 2020, nice: false},
                        y: {padding: 8, label: 'Y', min: 0, max: 9, nice: false}
                    },
                    unit: [{
                        type: 'ELEMENT.LINE',
                        x: 'x',
                        y: 'y',
                        color: 'name'
                    }]
                }
            };

            var s = new Taucharts.Plot(
                {
                    data: data,
                    spec: lineElement
                }).renderTo('#stormsTrend');

        }
    });


    function buildTempChart() {

        var myChart = Highcharts.chart('tempChart', {
            chart: {
                type: 'line'
            },
            title: {
                style: {
                    fontFamily: 'Georgia'
                },
                text: 'Annual Mean Sea Surface Temperature Anomalies 1880-2015'
            },

            subtitle: {
                style: {
                    fontFamily: 'Georgia'
                },
                text: 'Source: EPA.gov Climate Change Indicators'
            },
            xAxis: {
                title: {
                    style: {
                        fontFamily: 'Georgia'
                    },
                    text: 'Year'
                },
                categories: year,
            },
            yAxis: {
                title: {
                    style: {
                        fontFamily: 'Georgia'
                    },
                    text: 'Average Temperature Degrees F'
                }
            },
            legend: {
                style: {
                    fontFamily: 'Georgia'
                }

            },
            series: [{
                name: 'Average Anomaly',
                data: temp,
                zIndex: 1,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            }, {
                name: '95% Confidence Anomaly',
                type: 'arearange',
                data: range,
                linkedTo: ':previous',
                lineWidth: 0,
                color: Highcharts.getOptions().colors[0],
                fillOpacity: 0.3,
                zIndex: 0,
                marker: {
                    enabled: false
                } //close marker
            } //close range
            ] //close data series
        }); //close var high chart
    } //close build Sea Temp Chart


    //close ready function
});