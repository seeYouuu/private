/**
 *  Defines the TopNavbar Module.
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['FeatureBase', 'jquery', 'tpl!./TopNavbar.html', 'lodash'], function(Base, $, tpl, _) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('TopnavModule');
            };

            this.constructor = function() {
                this.$body = $('body');

                this.lang = {
                    zh: {
                        DASHBOARD: '控制台',
                        ORDERL: '订单',
                        USER: '客户关系',
                        SPACE: '空间管理',
                        PRICE: '价格模板',
                        ADMINSTRATORS: '管理员',
                        LOGOUT: '退出',
                        LEASE: '合同租赁',
                        EVENT: '活动',
                        TRANSACTION: '交易管理',
                        MEMBERSHIP: '会员卡',
                        FINANCE: '财务管理',
                        LOG: '管理员日志'
                    },
                    en: {
                        DASHBOARD: 'Dashboard',
                        ORDERL: 'Order',
                        USER: 'User',
                        SPACE: 'Space',
                        PRICE: 'Price Rule',
                        ADMINSTRATORS: 'Administrators',
                        LOGOUT: 'Logout',
                        LEASE: 'Lease',
                        EVENT: 'Event',
                        TRANSACTION: 'Transaction',
                        MEMBERSHIP: 'Membership',
                        FINANCE: 'Finance',
                        LOG: 'Administrators log'
                    }
                };
            };

            this.beforeStart = function() {
                this.$body.prepend(tpl());
            };

            this.run = function() {
                var features = require.toUrl('features');

                this.mod.controller('HeaderCtrl', [
                    '$scope',
                    '$cookies',
                    '$location',
                    'CONF',
                    'events',
                    'HeaderService',
                    'CurrentAdminService',
                    '$translate',
                    '$modal',
                    'md5',
                    '$rootScope',
                    'XmppConnector',
                    '$timeout',
                    'XmppPresences',
                    'XmppMessages',
                    'MessageService',
                    'CurrentUser',
                    function(
                        $scope,
                        $cookies,
                        $location,
                        CONF,
                        events,
                        HeaderService,
                        CurrentAdminService,
                        $translate,
                        $modal,
                        md5,
                        $rootScope,
                        XmppConnector,
                        $timeout,
                        XmppPresences,
                        XmppMessages,
                        MessageService,
                        CurrentUser
                    ) {
                        $scope.loginFlag = true;
                        $scope.headerName = '';
                        $scope.language = $location.search().lang || $translate.use();
                        $scope.PERMISSION_RESERVE_KEY = 'sales.building.order.reserve';
                        $scope.PERMISSION_REORDER_KEY = 'sales.building.order.preorder';
                        $scope.currentAdmin = CurrentAdminService
                            .getStorage().currentAdmin;
                        $scope.isTestFlag = CONF.isstaging;
                        $scope.groups = {};
                        $scope.max_height = ($(document).height() - 110) + 'px';
                        $scope.passwordOptions = {
                            old_password: '',
                            first: '',
                            second: ''
                        };
                        $scope.isInspectors = $cookies.get('isInspectors') ? true : false;

                        if($scope.isInspectors){
                            HeaderService.getCompanyInfo().success(function(data){
                                $scope.companyName = data.name;
                            });
                        }
                        var getPlatformInfo = function(data){
                            $scope.platforms = [];
                            $scope.sales = [];
                            $scope.shops = [];
                            $scope.salesInfo = {};
                            $scope.shopInfo = {};
                            $scope.currentPlatform = {};
                            var sales = {}, shops = {};
                            
                            _.each(data.company.sales, function(item){
                                $scope.salesInfo[item.sales_company_id] = item.content;
                            });
                            _.each(data.company.shop, function(item){
                                $scope.shopInfo[item.sales_company_id] = item.content;
                            });
                            if(data.platform.official && data.platform.official.length > 0){
                                data.platform.official[0].sales_company_name = data.platform.official[0].office_name;
                                $scope.platforms.push(data.platform.official[0]);
                            }
                            _.each(data.platform.sales, function(item){
                                if(!sales[item.sales_company_id]){
                                    item.sales_company_id == $cookies.get('salesCompanyId') ? $scope.currentPlatform = item : '';
                                    sales[item.sales_company_id] = item.sales_company_id;
                                    $scope.sales.push(item)
                                }
                            });
                            _.each(data.platform.shop, function(item){
                                if(!shops[item.sales_company_id]){
                                    shops[item.sales_company_id] = item.sales_company_id;
                                    $scope.shops.push(item)
                                }
                            });
                        };

                        events.on('login', function() {
                            $scope.loginFlag = true;

                            HeaderService.checkLogin().success(function(data){
                                $('title').text(CONF.appname + '-' + data.sales_company.name);
                                $scope.headerName = CONF.appname + '-' + data.sales_company.name;
                            }).error(function(){
                            });
                        });

                        events.on('logout', function() {
                            $scope.loginFlag = false;

                            XmppConnector.set_to_normal_disconnection();

                            $('title').text(CONF.appname);
                            $scope.headerName = CONF.appname;
                        });

                        events.on('refreshGroup', function(){
                            getChatGroups(true);
                        });

                        var getGroups = function(){
                            HeaderService.getGroup().success(function(data){
                                $scope.groups.permissionMenu = {};
                                _.each(data, function(item){
                                    $scope.groups.permissionMenu[item.key] = true;
                                });
                            });
                        };

                        XmppConnector.reset_connection();

                        XmppConnector.on_connected(function(){
                            XmppPresences.tell_we_are_online();
                            XmppMessages.start_listening_messages();
                            XmppConnector.set_to_abnormal_disconnection();
                        });
                        
                        XmppConnector.on_disconnected(function(){
                            if(XmppConnector.get_is_normal_disconnection()){
                                return;
                            }
                            XmppConnector.create_connection(CurrentUser.get_user_id());
                        });

                        var formatData = function(data){
                            $scope.secondGroups = {};
                            $scope.secondGroups.permissionMenu = {};
                            _.each(data.permissions, function(item){
                                if(item.key === 'sales.platform.user_group'){
                                    $scope.secondGroups.permissionMenu.user = true;
                                }else if(item.key === 'sales.platform.enterprise_customer'){
                                    $scope.secondGroups.permissionMenu.company = true;
                                }else if(item.key === 'sales.platform.lease_offer'){
                                    $scope.secondGroups.permissionMenu.offer = true;
                                }else if(item.key === 'sales.platform.lease_clue'){
                                    $scope.secondGroups.permissionMenu.clue = true;
                                }else if(item.key === 'sales.platform.customer'){
                                    $scope.secondGroups.permissionMenu.customer = true;
                                }else if(item.key === 'sales.building.long_term_lease'){
                                    $scope.secondGroups.permissionMenu.contract = true;
                                }else if(item.key === 'sales.platform.bill'){
                                    $scope.secondGroups.permissionMenu.bill = true;
                                }
                            });
                        };

                        if($cookies.get('sb_admin_token')){
                            HeaderService.checkLogin().success(function(data){
                                $cookies.put('client_id', data.admin.client_id);
                                $cookies.put('xmpp_username', data.admin.xmpp_username);
                                $cookies.put('user_id', data.admin.id);
                                MessageService.init();
                                if(!XmppConnector.check_conncted()){
                                    console.log('create_connection');
                                    XmppConnector.create_connection(data.admin.xmpp_username);
                                }
                                formatData(data);
                                CurrentAdminService.setCurrentAdmin(data);
                                HeaderService.setCookies().success(function(){
                                    getGroups();
                                });
                                getChatGroups();
                            }).error(function(){
                                window.location.assign(CONF.admin + 'login');
                            });

                            HeaderService.getPlatform().success(function(data){
                                getPlatformInfo(data);
                            });
                        }else{
                            window.location.assign(CONF.admin + 'login');
                        };

                        var getGroupUsers = function(params){
                            HeaderService.getUsers(params).success(function(data){
                                var temp = {};
                                _.each(data, function(item){
                                    temp[item.id] = item;
                                });
                                _.each($scope.chatGroups, function(item){
                                    item.userName = temp[item.creatorId].name;
                                    item.phone = temp[item.creatorId].phone;
                                    item.email = temp[item.creatorId].email;
                                });
                            });
                        };

                        var getChatGroups = function(flag){
                            HeaderService.getChatGroups().success(function(data){
                                $scope.chatGroups = data;
                                var arr = [];
                                _.each($scope.chatGroups, function(item){
                                    item.avatar = CONF.file + '/person/' + item.creatorId + '/avatar_small.jpg';
                                    arr.push(item.creatorId);
                                });
                                arr = _.uniq(arr);
                                getGroupUsers({'id[]': arr});
                                $timeout(function() {
                                    !flag ? events.emit('message') : '';
                                    events.emit('count');
                                }, 300);
                            });
                        };
                        
                        var noty = function(type, msg) {
                            events.emit('alert', {
                                type: type,
                                message: msg,
                                onShow: function() {
                                    console.log('displaying');
                                },
                                onClose: function() {
                                    console.log('closed');
                                }
                            });
                        };

                        var refreshList = function (item) {
                            
                            if($location.path() === item.route && !location.search){
                                events.emit('refresh' + item.url);
                            }else if(location.search){
                                var params = $location.search();
                                _.each(params, function(value, key){
                                    $location.search(key, undefined);
                                });
                            }
                            $location.path(item.url);
                        };

                        var backToMain = function(level){
                            if(level > 1){
                                var length = _.keys($rootScope.crumbs).length;
                                if( length > 1 && level !== length){
                                    window.history.go(level - length);
                                }
                            }else{
                                var params = $location.search();
                                _.each(params, function(value, key){
                                    $location.search(key, undefined);
                                });
                            }
                        };

                        document.addEventListener('visibilitychange', function() {
                            if(document.visibilityState === 'visible'){
                                HeaderService.setCookies().success(function(){});
                            }
                        });
                        
                        $scope.switchLang = function(lang){
                            $scope.language = lang;
                             $translate.use(lang);
                             $location.search('lang', lang);
                        };

                        $scope.getCurrentPath = function () {
                            return $location.path();
                        };

                        $scope.changeNav = function(item){
                            _.each($scope.sidebarItems, function(value){
                                value.selected = false;
                            });
                            refreshList(item);
                        };

                        $scope.changeChildNav = function (item) {
                            refreshList(item);
                        };

                        $scope.isSecondNav = function(item){
                            return (item.url === 'user' && ($location.path() === '/user' || $location.path() === '/customer' || $location.path() === '/company')) ||
                            (item.url === 'lease' && ($location.path() === '/clue' || $location.path() === '/offer' || $location.path() === '/contract' || $location.path() === '/bill')) ;
                        };

                        $scope.toogleNav = function(item){
                            _.each($scope.sidebarItems, function(value){
                                !value.route && value.url !== item.url ? value.selected = false : '';
                            });
                            item.selected = !item.selected;
                        };

                        $scope.logout = function () {
                            HeaderService.logout().success(function () {
                                $scope.loginFlag = false;
                                $cookies.remove('sb_admin_token', {domain: '.sandbox3.cn'});
                                window.location.assign(CONF.admin + 'login');
                                XmppConnector.reset_connection();
                            }).error(function(){
                            });
                        };

                        $scope.backToMain = function(level){
                            var params = $location.search();
                            if((params.pageType == 'editCard' || params.pageType == 'createCard' || params.pageType == 'copyCard' || params.pageType == 'salesRule') && $location.path() == '/membership'){
                                var action = params.pageType == 'editCard' || params.pageType == 'salesRule' ? '编辑' : '创建';
                                events.emit('confirm', {
                                    btnName: '离开',
                                    title: '系统提示',
                                    content: '你当前正在' + action + '会员卡, 离开此页面后当前信息将无法保存, 是否离开此页面?',
                                    onConfirm: function() {
                                        backToMain(level)
                                    }
                                });
                            }else{
                                backToMain(level);
                            }
                        };

                        $scope.backToOfficial = function(){
                            window.location.assign(CONF.official);
                        };

                        $scope.sidebarItems = [
                            {
                                route: '/dashboard',
                                url: 'dashboard',
                                name: '控制台',
                                icon: 'ic_db'
                            },
                            {
                                route: '/finance',
                                url: 'finance',
                                name: '财务管理',
                                icon: 'ic_invoice'
                            },
                            {
                                route: '/trade',
                                url: 'trade',
                                name: '交易管理',
                                icon: 'ic_order'
                            },
                            {
                                route: '/membership',
                                url: 'membership',
                                name: '会员卡',
                                icon: 'ic_card'
                            },
                            {
                                route: '',
                                url: 'user',
                                name: '客户关系',
                                icon: 'ic_cus',
                                children: [
                                    {
                                        route: '/customer',
                                        url: 'customer',
                                        name: '客户'
                                    },
                                    {
                                        route: '/company',
                                        url: 'company',
                                        name: '企业账户'
                                    },
                                    {
                                        route: '/user',
                                        url: 'user',
                                        name: '客户组'
                                    }
                                ]
                            },
                            {
                                route: '/space',
                                url: 'space',
                                name: '空间管理',
                                icon: 'ic_build'
                            },
                            {
                                route: '/admin',
                                url: 'admin',
                                name: '管理员',
                                icon: 'ic_admin'
                            },
                            {
                                route: '',
                                url: 'lease',
                                name: '合同租赁',
                                icon: 'ic_lease',
                                children: [
                                    {
                                        route: '/clue',
                                        url: 'clue',
                                        name: '租赁线索'
                                    },
                                    {
                                        route: '/offer',
                                        url: 'offer',
                                        name: '租赁报价'
                                    },
                                    {
                                        route: '/contract',
                                        url: 'contract',
                                        name: '租赁合同'
                                    },
                                    {
                                        route: '/bill',
                                        url: 'bill',
                                        name: '租赁账单'
                                    }
                                ]
                            },
                            {
                                route: '/activity',
                                url: 'activity',
                                name: '活动',
                                icon: 'ic_event'
                            },
                            {
                                route: '/log',
                                url: 'log',
                                name: '管理员日志',
                                icon: 'ic_log'
                            }
                        ];

                        var setDefaultNav = function(){
                            var route = $location.path(), url;
                            if(route === '/user' || route === '/customer' || route === '/company'){
                                url = 'user';
                            }else if(route === '/clue' || route === '/offer' || route === '/contract' || route === '/bill'){
                                url = 'lease';
                            }
                            _.each($scope.sidebarItems, function(item){
                                item.url === url ? item.selected = true : '';
                            });
                            console.log('setDefaultNav');
                        };
                        setDefaultNav();

                        $scope.changePwd = function($hide){
                            if(!$scope.passwordOptions.old_password){
                                noty('error', '旧密码不能为空！');
                                return;
                            }

                            if(!$scope.passwordOptions.first || !$scope.passwordOptions.second){
                                noty('error', '新密码不能为空！');
                                return;
                            }

                            if($scope.passwordOptions.first !== $scope.passwordOptions.second){
                                noty('error', '新密码不一致！');
                                return;
                            }
                            var params = {
                                old_password: md5.createHash($scope.passwordOptions.old_password).toUpperCase(),
                                password: md5.createHash($scope.passwordOptions.first).toUpperCase()
                            };

                            HeaderService.ChangePassword(params).success(function() {
                                noty('info', '密码修改成功');
                                $hide();
                            }).error(function(data){
                                if(data.code === 400003){
                                    noty('error', '原始密码错误！');
                                }
                            });
                        };

                        $scope.cancel = function($hide){
                            $hide();
                        };

                        $scope.switchPlatform = function(item){
                            if((item.platform === 'sales' && item.sales_company_id != $scope.currentPlatform.sales_company_id) || item.platform === 'shop'){
                                $cookies.put('salesCompanyId', item.sales_company_id, {domain: '.sandbox3.cn'});
                                item.platform === 'sales' ? window.location.assign(CONF[item.bizbase]): window.location.assign(CONF[item.platform]);
                                item.platform === 'shop' ? XmppConnector.set_to_normal_disconnection() : '';
                            }else if(item.platform === 'official'){
                                window.location.assign(CONF[item.platform]);
                                XmppConnector.set_to_normal_disconnection();
                            }
                        };
                    }
                ]);

                this.mod.factory('HeaderService', ['http', 'utils', '$cookies', function (http, utils, $cookies) {
                    
                    this.logout = function () {
                        return http.post(utils.getapi('/admin/auth/logout'));
                    };

                    this.ChangePassword = function(params){
                        return http.post(utils.getapi('/sales/admin/admins/password'), params);
                    };

                    this.checkLogin = function(){
                        var params = {platform: 'sales', sales_company_id: $cookies.get('salesCompanyId')};
                        return http.get(utils.getapi('/admin/auth/me'), {params: params});
                    };

                    this.setCookies = function(){
                        var params = {platform: 'sales', sales_company_id: $cookies.get('salesCompanyId')};
                        return http.post(utils.getapi('/admin/platform_set'), params);
                    };

                    this.getPlatform = function(){
                        return http.get(utils.getapi('/admin/auth/platform'));
                    };

                    this.getGroup = function(){
                        return http.get(utils.getapi('/admin/auth/groups'));
                    };

                    this.getCompanyInfo = function(){
                        return http.get(utils.getapi('/sales/admin/company/') + $cookies.get('salesCompanyId'));
                    };

                    this.getChatGroups = function(){
                        return http.get(utils.getapi('/sales/admin/chatgroups'));
                    };

                    this.getUsers = function(params){
                        return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
                    };

                    return this;
                }]);

                this.mod.filter('checkPermission', [function () {

                    var filterPermissions = function (onePermission) {
                        var currentAdmin = this;
                        return currentAdmin.permissionMenu[
                            onePermission.url
                        ] !== undefined || onePermission.url == 'log';
                    };

                    return function (allItems, currentAdmin) {
                        if (Object.keys(currentAdmin).length === 0) {
                            return [];
                        }
                        return allItems.filter(filterPermissions, currentAdmin);
                    };
                }]);

                this.mod.filter('checkSecondPermission', [function(){
                    
                    var filterPermissions = function (onePermission) {
                        var currentAdmin = this;
                        return currentAdmin.permissionMenu[
                            onePermission.url
                        ] !== undefined;
                    };

                    return function (allItems, currentAdmin) {
                        if (Object.keys(currentAdmin).length === 0) {
                            return [];
                        }
                        return allItems.filter(filterPermissions, currentAdmin);
                    };
                }]);
            };
        });

        return Feature;
    });

})(define);
