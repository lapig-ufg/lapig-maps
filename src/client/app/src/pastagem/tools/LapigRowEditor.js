/**
 * @requires RowEditor.js
 */

Ext.namespace("gxp.plugins");

gxp.plugins.LapigRowEditor = Ext.extend(Ext.ux.grid.RowEditor, {
	ptype: 'gxp_lapigroweditor',
	buttonAlign: 'center',

	initComponent: function(){
    Ext.ux.grid.RowEditor.superclass.initComponent.call(this);
    this.addEvents(
      /**
       * @event beforeedit
       * Fired before the row editor is activated.
       * If the listener returns <tt>false</tt> the editor will not be activated.
       * @param {Ext.ux.grid.RowEditor} roweditor This object
       * @param {Number} rowIndex The rowIndex of the row just edited
       */
      'beforeedit',
      /**
       * @event canceledit
       * Fired when the editor is cancelled.
       * @param {Ext.ux.grid.RowEditor} roweditor This object
       * @param {Boolean} forced True if the cancel button is pressed, false is the editor was invalid.
       * @param {Number} rowIndex The rowIndex of the row just edited.
       */
      'canceledit',
      /**
       * @event validateedit
       * Fired after a row is edited and passes validation.
       * If the listener returns <tt>false</tt> changes to the record will not be set.
       * @param {Ext.ux.grid.RowEditor} roweditor This object
       * @param {Object} changes Object with changes made to the record.
       * @param {Ext.data.Record} r The Record that was edited.
       * @param {Number} rowIndex The rowIndex of the row just edited
       */
      'validateedit',
      /**
       * @event afteredit
       * Fired after a row is edited and passes validation.  This event is fired
       * after the store's update event is fired with this edit.
       * @param {Ext.ux.grid.RowEditor} roweditor This object
       * @param {Object} changes Object with changes made to the record.
       * @param {Ext.data.Record} r The Record that was edited.
       * @param {Number} rowIndex The rowIndex of the row just edited
       */
      'afteredit'
    );
  },

	init: function(grid){
    this.grid = grid;
    this.ownerCt = grid;
    if(this.clicksToEdit === 2){
      grid.on('rowdblclick', this.onRowDblClick, this);
    }else{
      grid.on('rowclick', this.onRowClick, this);
      if(Ext.isIE){
        grid.on('rowdblclick', this.onRowDblClick, this);
      }
    }

    // stopEditing without saving when a record is removed from Store.
    grid.getStore().on('remove', function() {
      this.stopEditing(false);
    },this);

    grid.on({
      scope: this,
      keydown: this.onGridKey,
      columnresize: this.verifyLayout,
      columnmove: this.refreshFields,
      reconfigure: this.refreshFields,
      beforedestroy : this.beforedestroy,
      destroy : this.destroy,
      bodyscroll: {
        buffer: 250,
        fn: this.positionButtons
      }
    });
    grid.getColumnModel().on('hiddenchange', this.verifyLayout, this, {delay:1});
    grid.getView().on('refresh', this.stopEditing.createDelegate(this, []));

    this.enableBubble(['canceledit', 'beforeedit', 'validateedit', 'afteredit']);
  },

  stopEditing : function(saveChanges){
    this.editing = false;
    if(!this.isVisible()){
      return;
    }
    if(saveChanges === false || !this.isValid()){
      this.hide();
      this.fireEvent('canceledit', this, saveChanges === false, this.rowIndex);
      return;
    }
    var changes = {},
      r = this.record,
      hasChange = false,
      cm = this.grid.colModel,
      fields = this.items.items;
    for(var i = 0, len = cm.getColumnCount(); i < len; i++){
      if(!cm.isHidden(i)){
        var dindex = cm.getDataIndex(i);
        if(!Ext.isEmpty(dindex)){
          var oldValue = r.data[dindex],
            value = this.postEditValue(fields[i].getValue(), oldValue, r, dindex);
          if(String(oldValue) !== String(value)){
            changes[dindex] = value;
            hasChange = true;
          }
        }
      }
    }
    if(hasChange && this.fireEvent('validateedit', this, changes, r, this.rowIndex) !== false){
      r.beginEdit();
      Ext.iterate(changes, function(name, value){
        r.set(name, value);
      });
      r.endEdit();
      this.fireEvent('afteredit', this, changes, r, this.rowIndex);
    } else {
      this.fireEvent('canceledit', this, false, this.rowIndex);
    }
    this.hide();
  },

  onRowClick: function(g, rowIndex, e){
    if(this.clicksToEdit == 'auto'){
      var li = this.lastClickIndex;
      this.lastClickIndex = rowIndex;
      if(li != rowIndex && !this.isVisible()){
        return;
      }
    }
    if(this.editing){
      // this.showTooltip(this.commitChangesText);
      return;
    }

    this.startEditing(rowIndex, false);
    this.doFocus.defer(this.focusDelay, this, [e.getPoint()]);
  },

  newRecord: function(rowIndex){
  	if(rowIndex != undefined){
  		this.startEditing(rowIndex)
  		this.values = {};
  	}
  }

});

Ext.preg(gxp.plugins.LapigRowEditor.ptype, gxp.plugins.LapigRowEditor);