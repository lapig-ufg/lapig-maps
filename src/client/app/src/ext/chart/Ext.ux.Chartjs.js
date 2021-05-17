/*
 * Copyright 2014 Tocco AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Available at: https://github.com/tocco/extjs3-chartjs-extension
 */

Ext.ns("Ext.ux");

/**
 * @class Ext.ux.Chartjs
 * @extends Ext.BoxComponent
 * @xtype chartjs
 */
Ext.ux.Chartjs = Ext.extend(Ext.BoxComponent, {
    autoEl: "canvas",

    type: null,
    data: null,
    options: {},

    chart: {},

    afterRender: function () {
        Ext.ux.Chartjs.superclass.afterRender.call(this);

        var el = Ext.getDom(this.id);
        var ctx = el.getContext("2d");
        Ext.applyIf(this.options, {
            responsive: true
        });
        this.chart = new Chart(ctx, {type: this.type.toLowerCase(), data: this.data, options:this.options});
    },

    updateValues: function (data, options) {
        this.chart.destroy();
        this.type = "line";

        this.data = data;

        this.options = (options == null ? {
            responsive: true,
            // pointDot: false,
            // pointDotRadius: 4,
            // pointHitDetectionRadius: 20,
            // scaleShowLabels: false,
             // scales: {
            //     yAxes: [{
            //         ticks: {
            //             autoSkip: true,
            //             stepSize: 0.2
            //         }
            //     }],
            //     xAxes: [{
            //         ticks: {
            //             autoSkip: true,
            //             maxTicksLimit: 20
            //         },

            //     }]
            // }
            // //Boolean - If we want to override with a hard coded scale
            // scaleOverride: true,
            // //** Required if scaleOverride is true **
            // //Number - The number of steps in a hard coded scale
            // scaleSteps: 10,
            // //Number - The value jump in the hard coded scale
            // scaleStepWidth: 10,
            // //Number - The scale starting value
            // scaleStartValue: 0
            scales: {
                y: {
                    max: 5,
                    min: 0,
                    ticks: {
                        stepSize: 0.5
                    }
                }
            }
        } : options)

        var el = Ext.getDom(this.id);
        var ctx = el.getContext("2d");
        this.chart = new Chart(ctx, {type: this.type.toLowerCase(), data: this.data, options:this.options});
        this.chart.update();
    },

});

Ext.reg("chartjs", Ext.ux.Chartjs);