Ext.ns("Ext.ux");

/**
 * @class Ext.ux.Chartjs
 * @extends Ext.BoxComponent
 * @xtype chartjs
 *
 * @author Urs Wolfer
 */
Ext.ux.Chartjs = Ext.extend(Ext.BoxComponent, {
    autoEl : "canvas",

    type: null,
    data: null,
    options: {},

    afterRender: function() {
        Ext.ux.Chartjs.superclass.afterRender.call(this);

        var el = Ext.getDom(this.id);
        var ctx = el.getContext("2d");
        Ext.applyIf(this.options, {
            responsive: true
        });
        new Chart(ctx)[this.type](this.data, this.options);
    }
});

Ext.reg("chartjs", Ext.ux.Chartjs);