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
        var patt = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]+");
        var res = patt.test(jsonData._id);
        if(res == false){
            Ext.MessageBox.alert("","E-mail inválido!") 
        } else {
            if(jsonData.password == jsonData.repeatPassword){
                var panelCadast = Ext.Ajax.request({
                    url: '/user/insert',
                    method: 'PUT',
                    jsonData: jsonResult,
                    success: function (response){
                        if((response.responseText == "Cadastro invalido") || (jsonData.password != jsonData.repeatPassword)){
                            Ext.MessageBox.alert("","E-mail já utilizado")
                        } else {
                            Ext.MessageBox.alert("","O usuário "+firstName[0]+" foi cadastrado com sucesso")
                            callback()
                            Ext.getCmp('idCadaster').close()
                        }
                    },
                })
            }else{
                Ext.MessageBox.alert("","Senha incorreta!")
            }
        }
    },

    userInfo: function() {
        var instance = this
        Ext.Ajax.request({
            url: '/user/info',
            method: 'GET',
            success: function (response){
                if(response.responseText == ''){
                    Ext.getCmp('buttonLogout').hide(true)
                    Ext.getCmp('buttonLogin').show()
                }else{
                    var buttonLogout = Ext.getCmp('buttonLogout')
                    var responseText = response.responseText
                    var user = JSON.parse(responseText)
                    user = user.name
                    user = user.split(' ')
                    var name = user[0]
                    buttonLogout.setText(name)
                    Ext.getCmp('buttonLogin').hide(true)
                    buttonLogout.show()
                }
            }
        });
    },

    userLogin: function(keysLogin, callback) {
        Ext.Ajax.request({
            url: '/user/login',
            method: 'POST',
            jsonData: keysLogin,
            success: function (response){
                if(response.responseText == 'Error'){
                    Ext.MessageBox.alert('',"Senha ou ID inválidos.")
                }else{
                    var responseText = response.responseText
                    var user = JSON.parse(responseText)
                    user = user.name
                    user = user.split(' ')
                    callback()
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
                name: "_id",
                id: 'idLogin',
                xtype: 'textfield',
                fieldLabel: 'E-mail'
            },{
                name: 'name',
                xtype: 'textfield',
                fieldLabel: 'Nome'
            },{
                name: 'ocupation',
                xtype: 'textfield',
                fieldLabel: 'Ocupação'
            },{
                name: 'instituition',
                xtype: 'textfield',
                fieldLabel: 'Instituição'
            },{
                name: "password",
                id: 'idSenha',
                xtype: 'textfield',
                inputType: 'password',
                fieldLabel: 'Senha'
            },{
                name: 'repeatPassword',
                xtype: 'textfield',
                inputType: 'password',
                fieldLabel: 'Repetir Senha'
            }],
            buttons: [{
                text: 'Confirmar',
                listeners: {
                    click: function(n){
                        instance.userRegister(function() {
                            var form = Ext.getCmp('lapig_login::frm-user')
                            var formPanel = form.getForm()
                            var jsonData = formPanel.getValues()
                            var keysLogin = {jsonData}
                            console.log('keysLogin: ',keysLogin)
                            instance.userLogin(keysLogin, function(){
                                instance.userInfo()
                            })
                        })
                    }
                }
            }],
        });

        var screenCadaster = new Ext.Window({
            id: 'idCadaster',
            title: 'Cadastro',
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
                    instance.userInfo()
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
                tooltip: 'Login',
                id: 'buttonLogin',
                iconCls: 'gxp-icon-lapiglogin',
                text: "Login",
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
                                fieldLabel: "E-mail"
                            },{
                                name: 'password',
                                xtype: 'textfield',
                                inputType: 'password',
                                fieldLabel: "Senha"
                            }],
                        buttons: [{
                            text: "Confirmar",
                            listeners:{
                                click:  function(n){
                                    var login = Ext.getCmp('formId')
                                    var formLogin = login.getForm()
                                    var jsonData = formLogin.getValues()
                                    var keysLogin = {jsonData}
                                    instance.userLogin(keysLogin, function(){
                                        instance.userInfo()
                                        Ext.getCmp('idWindow').close()
                                    })
                                }
                            }
                        },{
                            text: "Cadastre-se",
                            listeners:{
                                click: function(n){
                                    instance.formCadastro()
                                    Ext.getCmp('idWindow').close()
                                }
                            }
                        }],
                    })

                    var win = new Ext.Window({
                        title: 'Login',
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
                tooltip: 'Usuário',
                id: 'buttonLogout',
                xtype: 'splitbutton',
                menu: ({
                    items: [{
                        iconCls: 'gxp-icon-lapiglogout',
                        text: "Logout",
                        handler: function(){
                            var panelLogout = new Ext.FormPanel({
                                region:'center',
                                id: 'formIdLogout',
                                url:'save-form.php',
                                buttons: [{
                                    text: "Sim",
                                    listeners: {
                                        click: function(n){
                                            Ext.getCmp('idLogout').close()
                                            instance.userLogout()
                                        }
                                    }
                                },{
                                    text: "Não",
                                    listeners: {
                                        click: function(n){
                                            Ext.getCmp('idLogout').close()
                                        }
                                    }
                                }],
                            });

                            var winLogout = new Ext.Window({
                                title: "Deseja sair?",
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