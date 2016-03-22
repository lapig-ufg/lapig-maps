Ext.namespace("gxp.plugins")

gxp.plugins.LapigLogin = Ext.extend(gxp.plugins.Tool, {

    ptype: "gxp_lapiglogin",

    userRegister: function(callback) {
        var form = Ext.getCmp('lapig_login::frm-user')
        var formPanel = form.getForm()
        var jsonData = formPanel.getValues()
        var jsonResult = {jsonData}
        var firstName = []
        firstName = (jsonData.name).split(' ')

        var emailRegExp = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]+");
        var nameRegExp = new RegExp("^[A-Za-záàâãẽéèêíïóôõöúçñÁÀÂÃẼÉÈÍÏÓÔÕÖÚÇÑ ]{3,140}$");
        var ocupationRegExp = new RegExp("^[a-zA-ZáàâãẽéèêíïóôõöúçñÁÀÂÃẼÉÈÍÏÓÔÕÖÚÇÑ ./_-]+");
        var passRegExp = new RegExp("^[A-Za-z0-9!@#$%^&*()-_ ]{6,12}$");
        
        var validations = [
            {
                validator: emailRegExp.test(jsonData._id),
                msg: "Preencha o campo do E-mail corretamente!"
            },
            {
                validator: nameRegExp.test(jsonData.name),
                msg: "Preencha o campo nome com no mínimo 3 caracteres!"
            },
            {
                validator: ocupationRegExp.test(jsonData.ocupation),
                msg: "Preencha o campo de ocupação e instituição corretamente!"
            },
            {
                validator: passRegExp.test(jsonData.password),
                msg: "Preencha os campos de senha com 6 a 12 dígitos, se possivel use caracteres especiais (!@#$%()^&*)"
            }
        ]

        var flag = true;
        for(var i=0; i <  validations.length; i++) {
            console.log(i)
            var validation = validations[i]
            if(validation.validator == false) {
                Ext.MessageBox.alert("",validation.msg);
                flag = false
                break;
            }
        }

        if(flag == true) {
            var panelCadast = Ext.Ajax.request({
                url: '/user/insert',
                method: 'PUT',
                jsonData: jsonResult,
                success: function (response){
                    var result = JSON.parse(response.responseText)
                    if(result.success == false) {
                        if(result.error == 'senha'){
                            Ext.MessageBox.alert("",i18n.LAPIGLOGIN_ALERT_INCORRECTPASS)
                        } else if(result.error == 'email') {
                            Ext.MessageBox.alert("",i18n.LAPIGLOGIN_ALERT_ALREADYUSED)
                        }   
                    } else {
                        Ext.MessageBox.alert("", i18n.LAPIGLOGIN_ALERT_THEUSER +" "+ firstName[0] +" "+ i18n.LAPIGLOGIN_ALERT_THEUSERCOMP)
                        callback()
                        Ext.getCmp('idCadaster').close()
                    }
                }
            })
        }            
    },

    userInfo: function() {
        var instance = this
        Ext.Ajax.request({
            url: '/user/info',
            method: 'GET',
            success: function (response){
                if(response.responseText == ''){
                    instance.adjustLoginButtons('')
                }else{
                    var responseText = response.responseText
                    var user = JSON.parse(responseText)
                    user = user.name
                    user = user.split(' ')
                    instance.adjustLoginButtons(user)
                }
            }
        });
    },

    adjustLoginButtons: function(name) {
        if(name == ''){
            Ext.getCmp('buttonLogout').hide(true)
            Ext.getCmp('buttonLogin').show()
        }else{
            var buttonLogout = Ext.getCmp('buttonLogout')
            buttonLogout.setText(name[0])
            Ext.getCmp('buttonLogin').hide(true)
            buttonLogout.show()
        }
    },

    userLogin: function(keysLogin, callback) {
        var instance = this

        Ext.Ajax.request({
            url: '/user/login',
            method: 'POST',
            jsonData: keysLogin,
            success: function (response){

                var responseText = response.responseText
                var user = JSON.parse(responseText)

                if(user.error == true){
                    Ext.MessageBox.alert('', i18n.LAPIGLOGIN_ALERT_INCORRECTPASSORID)
                }else{
                    user = user.name
                    user = user.split(' ')
                    instance.adjustLoginButtons(user)

                    if (callback != undefined) {
                        callback()
                    }
                }
            },
        })
    },

    formCadastro: function() {
        var instance = this
        var winCadaster = new Ext.FormPanel({
            height: 215,
            renderTo: Ext.getBody(),
            labelWidth: 75,
            region: 'center',
            id: 'lapig_login::frm-user',
            url: 'save-form.php',
            frame: false,
            bodyStyle: 'padding:5px 5px 0',
            width: 250,
            defaults: {width: 150},
            items: [{
                name: 'name',
                xtype: 'textfield',
                fieldLabel: i18n.LAPIGLOGIN_FIELDLBL_NAME
            },{
                name: 'ocupation',
                xtype: 'textfield',
                fieldLabel: i18n.LAPIGLOGIN_FIELDLBL_OCCUPATION
            },{
                name: 'instituition',
                xtype: 'textfield',
                fieldLabel: i18n.LAPIGLOGIN_FIELDLBL_INSTITUTION
            },{
                name: "_id",
                id: 'idLogin',
                xtype: 'textfield',
                fieldLabel: i18n.LAPIGLOGIN_FIELDLBL_EMAIL
            },{
                name: "password",
                id: 'idSenha',
                xtype: 'textfield',
                inputType: 'password',
                fieldLabel: i18n.LAPIGLOGIN_FIELDLBL_PASSWORD
            },{
                name: 'repeatPassword',
                xtype: 'textfield',
                inputType: 'password',
                fieldLabel: i18n.LAPIGLOGIN_FIELDLBL_RPTPASSWORD
            }],
            buttons: [{
                text: i18n.LAPIGLOGIN_BTNTXT_CONFIRM,
                listeners: {
                    click: function(n){
                        instance.userRegister(function() {
                            var form = Ext.getCmp('lapig_login::frm-user')
                            var formPanel = form.getForm()
                            var jsonData = formPanel.getValues()
                            var keysLogin = {jsonData}
                            instance.userLogin(keysLogin)
                        })
                    }
                }
            }],
        });

        var screenCadaster = new Ext.Window({
            id: 'idCadaster',
            title: i18n.LAPIGLOGIN_TITLE_REGISTER,
            closable: true,
            border: false,
            width: 260,
            height: 240,
            items: [winCadaster],
            border:false
        });
        screenCadaster.show(this)
    },

    userLogout:function() {
        var instance = this
        Ext.Ajax.request({
            url: '/user/logout',
            method: 'GET',
            success: function (response){
                if(response.responseText == ''){
                    instance.adjustLoginButtons('')
                }
            }
        })
    },

    addActions: function() {
        var instance = this
        instance.userInfo()

        gxp.plugins.LapigLogin.superclass.addActions.apply(this,[
            {
                menuText: 'Lapig Login',
                tooltip: i18n.LAPIGLOGIN_TXT_LOGIN,
                id: 'buttonLogin',
                iconCls: 'gxp-icon-lapiglogin',
                text: i18n.LAPIGLOGIN_TXT_LOGIN,
                xtype: 'button',
                handler: function() {
                    var form = new Ext.FormPanel({
                        labelWidth: 75,
                        region:'center',
                        id: 'formId',
                        url:'save-form.php',
                        frame:false,
                        bodyStyle:'padding:5px 5px 0',
                        width: 250,
                        defaults: {width: 150},
                        defaultType: 'textfield',
                        items: [{
                                name: '_id',
                                xtype: 'textfield',
                                fieldLabel: i18n.LAPIGLOGIN_FIELDLBL_EMAIL
                            },{
                                name: 'password',
                                xtype: 'textfield',
                                inputType: 'password',
                                fieldLabel: i18n.LAPIGLOGIN_FIELDLBL_PASSWORD
                            }],
                        buttons: [{
                            text: i18n.LAPIGLOGIN_BTNTXT_CONFIRM,
                            listeners:{
                                click:  function(n){
                                    var login = Ext.getCmp('formId')
                                    var formLogin = login.getForm()
                                    var jsonData = formLogin.getValues()
                                    var keysLogin = {jsonData}
                                    instance.userLogin(keysLogin, function(){
                                        Ext.getCmp('idWindow').close()
                                    })
                                }
                            }
                        },{
                            text: i18n.LAPIGLOGIN_BTNTXT_REGISTER,
                            listeners:{
                                click: function(n){
                                    instance.formCadastro()
                                    Ext.getCmp('idWindow').close()
                                }
                            }
                        }],
                    })

                    var win = new Ext.Window({
                        title: i18n.LAPIGLOGIN_TXT_LOGIN,
                        id: 'idWindow',
                        closable:true,
                        width:270,
                        height:135,
                        border:false,
                        plain:true,
                        layout: 'border',
                        items: [form]
                    });
                    win.show(this)
                },
                scope: this,
            }
        ])

        gxp.plugins.LapigLogin.superclass.addActions.apply(this,[
            {
                menuText: 'Lapig Login User',
                tooltip: i18n.LAPIGLOGIN_TXT_USER,
                id: 'buttonLogout',
                xtype: 'splitbutton',
                menu: ({
                    items: [{
                        iconCls: 'gxp-icon-lapiglogout',
                        text: i18n.LAPIGLOGIN_TXT_LOGOUT,
                        handler: function(){
                            var panelLogout = new Ext.FormPanel({
                                region:'center',
                                id: 'formIdLogout',
                                url:'save-form.php',
                                buttons: [{
                                    text: i18n.LAPIGLOGIN_BTNTXT_YES,
                                    listeners: {
                                        click: function(n){
                                            Ext.getCmp('idLogout').close()
                                            instance.userLogout()
                                        }
                                    }
                                },{
                                    text: i18n.LAPIGLOGIN_BTNTXT_NO,
                                    listeners: {
                                        click: function(n){
                                            Ext.getCmp('idLogout').close()
                                        }
                                    }
                                }],
                            });

                            var winLogout = new Ext.Window({
                                title: i18n.LAPIGLOGIN_TITLE_WINLOGOUT,
                                id: 'idLogout',
                                closable:true,
                                width:185,
                                height:65,
                                border:false,
                                plain:true,
                                items: [panelLogout],
                            })
                            winLogout.show(this)
                        }
                    }]
                }),
            }
        ])
    },
})

Ext.preg(gxp.plugins.LapigLogin.prototype.ptype, gxp.plugins.LapigLogin)