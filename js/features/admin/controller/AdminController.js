/**
 *  Defines the AdminController controller
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';
    /**
     * Register the AdminController class with RequireJS
     */
    define(['lodash', 'angular'], function(_, angular) {

        /**
         * @constructor
         */
        var AdminController = function($rootScope, $scope, AdminService, events, CONF, md5, CurrentAdminService, $translate, $cookies, FilterStorageService) {
            
            $scope.page = AdminService.getSearchParam('page') ? AdminService.getSearchParam('page') : 'admin';
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_KEY = 'sales.platform.admin';
            $scope.popoverType = '';
            $scope.adminList = [];
            $scope.adminMenu = [];
            $scope.positionMenu = [];
            $scope.positionIcons = [];
            $scope.positions = [];
            $scope.buildingMenu = [];
            $scope.selectedFilterPosition = [];
            $scope.selectedPositionName = '所有管理员';
            $scope.selectedMenu = '';
            $scope.selectedPosition = '';
            $scope.adminNumOfPosition = '';
            $scope.operationType = '';
            $scope.loading = false;
            $scope.confirm = {
                key: ''
            };
            $scope.filterOption = {
                search: ''
            };
            $scope.positionFilter = {
                type: ''
            };
            $scope.placeholder = {
                reportTo: '报告给(上级)',
                selectPosition: '选择职位',
                position: '选择职位'
            };
            $scope.createPosition = {
                name: '',
                icon: '',
                leader: '',
                perArr: []
            };
            $scope.search = {
                selectedUser: {},
                userList: [],
                phone: '',
                name: '',
                flag: true,
                admins: []
            };

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var validParams = function(param, msg){
                if(param){
                    noty('error', msg);
                    return false;
                }
                return true;
            };

            var getAdmins = function(param){
                var params = _.extend({'platform': 'sales', 'company': $cookies.get('salesCompanyId')}, param);
                params.pageLimit = 100;
                $scope.loading = true;
                AdminService.getAdmins(params).success(function(data){
                    $scope.adminList = data.items;
                    _.each($scope.adminList, function(admin){
                        //社区职位显示过滤
                        var filtered = [];
                        if($scope.selectedMenu && $scope.selectedMenu.key == 'building'){
                            //社区职位显示过滤
                            filtered = _.filter(admin.bind, function(pos){
                                return pos.building_id == $scope.selectedMenu.id;
                            });
                            admin.position_desc = '';
                            admin.position = [];

                            _.each(filtered,function(item){
                                if(admin.position_desc == ''){
                                    admin.position_desc = item.position.name;
                                }else{
                                    admin.position_desc = admin.position_desc + ',' + item.position.name;
                                }
                                admin.position.push(item.position.id);
                            });

                            //社区职位显示过滤
                        }else if($scope.selectedMenu && $scope.selectedMenu.key == 'platform'){
                            filtered = _.filter(admin.bind, function(pos){
                                return (pos.position.permission_mappings.length > 0 && pos.position.permission_mappings[0].permission.level == 'global') || pos.position.is_super_admin;
                            });
                            admin.position_desc = '';
                            _.each(filtered,function(item){
                                if(admin.position_desc == ''){
                                    admin.position_desc = item.position.name;
                                }else{
                                    admin.position_desc = admin.position_desc + ',' + item.position.name;
                                }
                            });
                        }else{
                            //平台与所有管理员职位显示 formate
                            admin.position_desc = (_.pluck(admin.position, 'name')).join(', ');
                        }
                        //formate 其他社区职位
                        admin.otherCount = 0;
                        admin.bindFormated = [];//其他社区职位
                        admin.positionDetail = [];//职位详情
                        var dicPos = {},
                            dicBuilding = {};
                        _.each(admin.bind, function(bind){
                            //其他职位
                            var building_id = '';
                            if(bind.building_id && $scope.selectedMenu && bind.building_id != $scope.selectedMenu.id){
                                admin.otherCount += 1;
                                building_id = bind.building_id;
                                if(!dicBuilding[building_id]){
                                    dicBuilding[building_id] = building_id;
                                    admin.bindFormated[dicBuilding[building_id]] = [];
                                }
                                admin.bindFormated[dicBuilding[building_id]].push(bind);
                            }
                            //

                            if(bind.building_id && $scope.selectedMenu && bind.building_id == $scope.selectedMenu.id){
                                admin.positionDetail.push(bind);
                            }else if($scope.selectedMenu && $scope.selectedMenu.key == 'platform'){
                                if(!bind.building_id){
                                    admin.positionDetail.push(bind);
                                }
                            }else if($scope.selectedMenu && $scope.selectedMenu.key == 'all'){
                                var key = bind.position.id;
                                if(!dicPos[key]){
                                    dicPos[key] = key;
                                    admin.positionDetail[dicPos[key]] = [];
                                }
                                admin.positionDetail[dicPos[key]].push(bind);
                            }
                        });
                        if($scope.selectedMenu.key == 'all'){
                            admin.positionDetail = _.compact(admin.positionDetail);
                        }else{
                            admin.bindFormated = _.compact(admin.bindFormated);
                        }
                        //formate 其他社区职位
                        if($scope.selectedMenu && $scope.selectedMenu.key == 'platform'){
                            admin.positionDetail = _.filter(admin.positionDetail, function(pos){
                                var flag = false;
                                if(pos.position.permission_mappings){
                                    _.each(pos.position.permission_mappings, function(per){
                                        if(per.permission.level == 'global'){
                                            flag = true;
                                        }
                                    });
                                }
                                if(pos.position.is_super_admin){
                                    flag = true;
                                }
                                return flag;
                            });
                        }
                        admin.is_super_admin = _.contains(_.pluck(admin.position, 'is_super_admin'), true);
                        admin.avatar = CONF.file + '/person/' + admin.user_id + '/avatar_small.jpg';
                    });
                    $scope.adminNumOfPosition = data.total_count;
                    $scope.loading = false;
                });
            };

            var getExtraAdmins = function(id, buildingId){
                var params = typeof(buildingId) === 'number' ? _.extend({pageLimit: 100}, {position: id}, {building: buildingId}) : _.extend({pageLimit: 100}, {position: id});
                AdminService.getExtraAdmins(params).success(function(data){
                    $scope.addAdminList = data;
                    _.each($scope.addAdminList, function(admin){
                        admin.position_desc = (_.pluck(admin.position, 'name')).join(', ');
                        admin.avatar = CONF.file + '/person/' + admin.id + '/avatar_small.jpg';
                    });
                });
            };

            var getAdminMenu = function(refreshFlag){
                var params = {
                    'platform': 'sales',
                    'company': $cookies.get('salesCompanyId')
                };
                AdminService.getAdminMenu(params).success(function(data){
                    _.each(data, function(item){
                        item.id = item.id ? item.id : item.key;
                    })
                    if(refreshFlag){

                        var temp = {};
                        _.each(data, function(item){
                            temp[item.id] = item.count;
                        });
                        _.each($scope.adminMenu, function(item){
                            item.count = temp[item.id];
                        });
                        _.each($scope.adminMenu, function(item){
                            if(item.id == $scope.selectedMenu.id && $scope.selectedMenu.selected){
                                item.selected = true;
                            }
                        });
                    }else{
                        $scope.adminMenu = data;
                        $scope.buildingMenu = angular.copy(_.filter(data, function(item){return item.key == 'building'}));
                        $scope.adminMenu[0].selected = true;
                        $scope.selectedMenu = $scope.adminMenu[0];
                    }
                });
            };

            var showPop = function(){
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'additemTpl'
                });
            };

            var getPermissions = function(){
                var params = {
                    'platform': 'sales',
                    'company': $cookies.get('salesCompanyId')
                };
                // AdminService.getExcludePermission().success(function(exclude){
                    AdminService.getPermissions(params).success(function(data){
                        // data = _.filter(data, function(item){return !_.contains(_.pluck(exclude.permissions, 'id'), item.id)});
                        _.each(data, function(item){
                            if($scope.operationType == 'edit-job'){
                                _.each($scope.positionItem.permission_mappings, function(per){
                                    if(item.id == per.permission.id){
                                        item.op_level = per.op_level;
                                    }
                                });
                            }
                        });
                        $scope.createPosition.perArr = data;
                        _.each($scope.createPosition.perArr, function(per){
                            var tempArr = per.op_level_select.split(',');
                            _.each(tempArr, function(level){
                                per['levelItem' + level] = true;
                            });
                        });
                    });
                // });
                
            };

            var getPositionsCounts = function(){
                AdminService.getPositionsCounts().success(function(data){
                    $scope.positionCounts = data;
                }).error(function(){});
            };

            var getPositions = function(type){
                var params = {
                    'pageLimit': 50, 
                    'pageIndex': 1,
                    'platform': 'sales',
                    'company': $cookies.get('salesCompanyId')
                };
                if(type){
                    params.type = type;
                }
                $scope.positionFilter.type ? params.type = $scope.positionFilter.type : '';

                AdminService.getPositions(params).success(function(data){
                    $scope.positions = data.items;
                    $scope.filterPositions = angular.copy(data.items);
                    _.each($scope.positions, function(item){
                        item.power_mappings = item.permission_mappings.slice(0,3);
                        _.each(item.permission_mappings, function(permission, index){
                            index === 0 ? item.type = permission.permission.level : '';
                            if(permission.op_level === 1){
                                permission.op_des = '查看';
                            }else if(permission.op_level === 2){
                                permission.op_des = '编辑';
                            }else if(permission.op_level === 3){
                                permission.op_des = '冻结';
                            }
                        });
                    });
                    if(!type){
                        $scope.positionOptions = {positions: []};
                        $scope.positionOptions.positions = angular.copy($scope.positions);
                    }
                    
                });
            };

            var getAdminPositions = function(admin, flag){
                var params = {admin_id: admin.id};
                if($scope.selectedMenu.key == 'building'){
                    params.type = 'specify';
                    params.building_id = $scope.selectedMenu.id;
                }else if($scope.selectedMenu.key == 'platform'){
                    params.type = 'global';
                }else if($scope.selectedMenu.key == 'all' && $scope.selectedBuilding){
                    if($scope.selectedBuilding.key == 'platform'){
                        params.type = 'global';
                    }else{
                        params.type = 'specify';
                        params.building_id = $scope.selectedBuilding.id;
                    }
                }
                AdminService.getAdminPositions(params).success(function(data){
                    admin.exsitPositions = data;
                    if(flag && data.length > 0){
                        $scope.operateAdminFlag = 'update';
                        $scope.updateAdmin = {
                            platform: {}
                        };
                        $scope.originJobArr = [];
                        _.each(data, function(item){
                            if(item.building_id){
                                if($scope.updateAdmin[item.building_id]){
                                    $scope.updateAdmin[item.building_id][item.position_id] = item.id;
                                }else{
                                    $scope.updateAdmin[item.building_id] = {};
                                    $scope.updateAdmin[item.building_id][item.position_id] = item.id;
                                }
                                $scope.originJobArr.push(item.building_id + ':' + item.position_id);
                            }else{
                                $scope.updateAdmin.platform[item.position_id] = item.id;
                                $scope.originJobArr.push('platform:' + item.position_id);
                            }
                        });
                        _.each($scope.globalPositionList, function(building){
                            _.each(building.jobList, function(item){
                                if(building.key === 'building'){
                                    item.selected = $scope.updateAdmin[building.id] && $scope.updateAdmin[building.id][item.id] ? true : false;
                                }else{
                                    item.selected = $scope.updateAdmin.platform && $scope.updateAdmin.platform[item.id] ? true : false; 
                                }
                            });
                        });
                    }
                });
            };

            var getPositionMenu = function(params){
                AdminService.getPositionMenu(params).success(function(data){
                    $scope.positionMenu = data;
                    $scope.selectedMenu.positionMenu = $scope.positionMenu;
                    $scope.filterPositions = angular.copy(data);
                    if($scope.selectedPosition && $scope.selectedPosition.selected){
                        var position = '';
                        _.each($scope.positionMenu, function(p){
                            if(p.id == $scope.selectedPosition.id){
                                position = p;
                                p.selected = true;
                            }
                        });
                        position == '' ? $scope.selectedMenu.selected = true : '';
                    }
                });
            };

            var refreshMenu = function(){
                var data = {};
                var params = {};
                if($scope.selectedMenu.selected){
                    if($scope.selectedMenu.key == 'super'){
                        data.isSuperAdmin = 1;
                    }else if($scope.selectedMenu.key == 'building'){
                        data.building = $scope.selectedMenu.id;
                    }
                }else if($scope.selectedPosition.selected){
                    data.position = $scope.selectedPosition.id;
                    if($scope.selectedMenu.key == 'building'){
                        data.building = $scope.selectedMenu.id;
                    }
                }
                getAdmins(data);
                if($scope.selectedMenu.key != 'all'){
                    params.key = $scope.selectedMenu.key;
                    if($scope.selectedMenu.key == 'building'){
                        params.building = $scope.selectedMenu.id;
                    }
                    getPositionMenu(params);
                }
                getAdminMenu(true);
            };

            var showConfirm = function(){
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'deleteConfTpl'
                });
            };

            var getIcons = function(){
                AdminService.getIcons().success(function(data){
                    $scope.positionIcons = data;
                    if($scope.positionItem){
                        _.each($scope.positionIcons, function(item){
                            if(item.id == $scope.positionItem.icon.id){
                                item.selected = true;
                            }else{
                                item.selected = false;
                            }
                        });
                    }
                });
            };

            var resetGlobalPositionList = function(){
                _.each($scope.globalPositionList, function(building){
                    _.each(building.jobList, function(item){
                        item.selected = false;
                    });
                });
            };

            var initAddPosition = function(){
                var perArr = [];
                var groupArr = [];
                _.each($scope.createPosition.perArr, function(item){
                    if(item.op_level){
                        perArr.push({'permissionId': item.id, 'opLevel': item.op_level});
                    }
                });
                _.each($scope.permissionGroup, function(item){
                    if(item.selected){
                        groupArr.push({'id': item.group.id});
                    }
                });
                var params = {
                    'name': $scope.createPosition.name,
                    'iconId': $scope.createPosition.icon,
                    'currentPlatform': 'sales',
                    'platform': 'sales',
                    'permissions': perArr,
                    'salesCompanyId': $cookies.get('salesCompanyId'),
                    'permissionGroups': groupArr
                };
                return params;
            };

            var validAddPos = function(params) {
                var validationFlag = true;
                validationFlag = validationFlag ? validParams(!params.name, '请输入职位名称！') : validationFlag;
                validationFlag = validationFlag ? validParams(!params.iconId, '请选择职位图标！') : validationFlag;
                validationFlag = validationFlag ? validParams(params.permissions.length == 0, '请为职位添加权限！') : validationFlag;
               
                return validationFlag;
            };

            var validatePosition = function(){
                var flag = true;
                _.each($scope.search.admins, function(admin){
                    admin.hasPosition = _.contains(_.pluck(admin.positionList, 'selected'), true) ? true : false;
                });
                flag = _.contains(_.pluck($scope.search.admins, 'hasPosition'), false) ? false : true;
                
                if(!flag){
                    noty('error', '请给管理员配置职位！');
                }
                return flag;
            };

            var verifySuperAdmin = function(){
                var flag = _.contains(_.pluck(_.without($scope.adminList, $scope.adminItem), 'is_super_admin'), true);
                return flag;
            };

            var initEditPosition = function(){
                var groupArr = [];
                _.each($scope.permissionGroup, function(item){
                    if(item.selected){
                        groupArr.push({'id': item.group.id});
                    }
                });
                if(!$scope.createPosition.name){
                    noty('error', '请输入职位名称！');
                    return;
                }
                if(!$scope.createPosition.icon){
                    noty('error', '请选择职位图标！');
                    return;
                }
                var editArr = [];
                var originArr = [];
                var params = {
                    'name': $scope.createPosition.name,
                    'iconId': $scope.createPosition.icon,
                    'parentPositionId': $scope.createPosition.leader ? $scope.createPosition.leader.id : '',
                    'permissions': {
                        'add': [],
                        'modify': [],
                        'remove': []
                    },
                    'permissionGroups': groupArr
                };
                _.each($scope.createPosition.perArr, function(item){
                    if(item.op_level){
                        editArr.push({'permissionId': item.id, 'opLevel': item.op_level});
                    }
                });
                _.each($scope.positionItem.permission_mappings, function(item){
                    originArr.push({'permissionId': item.permission.id, 'opLevel': item.op_level});
                });

                _.each(originArr, function(per){
                    _.each(editArr, function(item){
                        if(item.permissionId == per.permissionId && item.opLevel != per.opLevel){
                            params.permissions.modify.push(item);
                        }
                    });
                });
                _.each(editArr, function(per){
                    var flag = false;
                    _.each(originArr, function(item){
                        if(per.permissionId == item.permissionId){
                            flag = true;
                        }
                    });
                    if(!flag){
                        params.permissions.add.push(per);
                    }
                });
                _.each(originArr, function(per){
                    var flag = false;
                    _.each(editArr, function(item){
                        if(per.permissionId == item.permissionId){
                            flag = true;
                        }
                    });
                    if(!flag){
                        params.permissions.remove.push(per);
                    }
                });
                return params;
            };

            var getSpecifyAdmin = function(){
                AdminService.getSpecifyAdmin({admin_id: $scope.adminItem.user_id, type: 'specify'}).success(function(data){
                    var temp = {};
                    _.each(data, function(position){
                        if(temp[position.building_id]){
                            temp[position.building_id].push(position.position_id);
                        }else{
                            temp[position.building_id] = [position.position_id];
                        }
                    });
                    _.each($scope.buildingMenu, function(building){
                        building.positions = temp[building.id];
                        var arr = _.xor(building.positions, $scope.adminItem.position);
                        if(building.positions){
                            building.disabled = arr.length + $scope.adminItem.position.length == building.positions.length ? true : false;
                        }
                    });
                });
            };

            var initBindPositions = function(){
                var params = {
                    add: [],
                    delete: {
                        position_binding_ids: []
                    }
                };
                if($scope.operateAdminFlag === 'add'){
                    _.each($scope.globalPositionList, function(building){
                        _.each(building.jobList, function(item){
                            if(item.selected){
                                if(building.key === 'building'){
                                    params.add.push({position_id: item.id, user_id: $scope.search.admins.id, building_id: building.id});
                                }else{
                                    params.add.push({position_id: item.id, user_id: $scope.search.admins.id});
                                }
                            }
                        });
                    });
                }else{
                    var tempJobArr = [];
                    _.each($scope.globalPositionList, function(building){
                        _.each(building.jobList, function(item){
                            if(item.selected){
                                if(building.key === 'building'){
                                    tempJobArr.push(building.id + ':' + item.id);
                                }else{
                                    tempJobArr.push('platform:' + item.id);
                                }
                            }
                        });
                    });
                    params.add = _.map(_.difference(tempJobArr, $scope.originJobArr), function(item){
                        var arr = item.split(':');
                        var result = '';
                        if(arr[0] === 'platform'){
                            result = {position_id: arr[1], user_id: $scope.search.admins.id};
                        }else{
                            result = {position_id: arr[1], user_id: $scope.search.admins.id, building_id: arr[0]};
                        }
                        return result;
                    });

                    params.delete.position_binding_ids = _.map(_.difference($scope.originJobArr, tempJobArr), function(item){
                        var arr = item.split(':');
                        var result = '';
                        if(arr[0] === 'platform'){
                            result = $scope.updateAdmin.platform[arr[1]];
                        }else{
                            result = $scope.updateAdmin[arr[0]][arr[1]];
                        }
                        return result;
                    });
                }
                return params;
            };

            var deleteAdminPosition = function(params){
                AdminService.deleteAdminPosition(params).success(function(){
                    noty('info', '管理员从职位删除成功！');
                    refreshMenu();
                }).error(function(data){
                    if(data.code === 400006){
                        noty('error', '至少需要保留一个超级管理员！');
                    }
                });
            };

            var deleteFromCommunity = function(params){
                AdminService.deleteFromCommunity(params).success(function(){
                    noty('info', '管理员从社区删除成功！');
                    refreshMenu();
                }).error(function(data){
                    if(data.code === 400006){
                        noty('error', '至少需要保留一个超级管理员！');
                    }
                });
            };

            var deleteFromGlobal = function(params){
                AdminService.deleteFromGlobal(params).success(function(){
                    noty('info', '管理员从平台删除成功！');
                    refreshMenu();
                }).error(function(data){
                    if(data.code === 400006){
                        noty('error', '至少需要保留一个超级管理员！');
                    }
                });
            };

            var getGroupsMap = function(){
                AdminService.getExcludePermission().success(function(exclude){
                    AdminService.getGroupsMap().success(function(data){
                        data = _.filter(data, function(item){return !_.contains(_.pluck(exclude.groups, 'id'), item.group.id)});
                        _.each(data, function(item){
                            item.permissions = _.filter(item.permissions, function(per){return !_.contains(_.pluck(exclude.permissions, 'id'), per.id)});
                        });
                        $scope.permissionGroup = data;
                        var perArr = [];
                        if($scope.positionType == 'edit'){
                            perArr = _.pluck(_.pluck($scope.positionItem.permission_mappings, 'permission'), 'id');
                            $scope.positionItem.permission_mappings = _.filter($scope.positionItem.permission_mappings, function(item){
                                return !_.contains(_.pluck(exclude.permissions, 'id'), item.permission.id)
                            });
                            _.each($scope.positionItem.permission_mappings, function(map){
                                map.permission.op_level = map.op_level;
                                if(!_.contains(_.pluck($scope.createPosition.perArr, 'id'), map.permission.id)){
                                    $scope.createPosition.perArr.push(_.pick(map.permission, 'id', 'level', 'max_op_level', 'name', 'op_level', 'op_level_select'));
                                }
                            });
                            _.each($scope.createPosition.perArr, function(per){
                                var tempArr = per.op_level_select.split(',');
                                _.each(tempArr, function(level){
                                    per['levelItem' + level] = true;
                                });
                            });
                        }
                        _.each($scope.permissionGroup, function(item){
                            if($scope.positionItem && _.contains(_.pluck($scope.positionItem.permission_groups, 'id'), item.group.id)){
                                item.selected = true;
                            }
                            _.each(item.permissions, function(per){
                                var tempArr = per.op_level_select.split(',');
                                _.each(tempArr, function(level){
                                    per['levelItem' + level] = true;
                                });
                                per.op_level = tempArr[tempArr.length-1];

                                if($scope.positionType == 'edit'){
                                    if(_.contains(perArr, per.id)){
                                         per.selected = true;
                                    }else{
                                         per.selected = false;
                                    }
                                    $scope.globalArr = _.filter($scope.createPosition.perArr, function(item){return item.level == 'global'});
                                    $scope.specifyArr = _.filter($scope.createPosition.perArr, function(item){return item.level == 'specify'});
                                }
                            });
                        });
                    });
                });
            };

            var formatePer = function(){
                _.each($scope.permissionGroup, function(item){
                    _.each(item.permissions, function(p){
                       if(_.contains(_.pluck($scope.createPosition.perArr, 'id'), p.id)){
                            p.selected = true;
                       }else{
                            p.selected = false;
                       }
                    });
                    if(!_.contains(_.pluck(item.permissions, 'selected'), true)){
                        item.selected = false;
                    }
                });
            };

            var seeEditPosition = function(){
                $scope.createPosition.name = $scope.positionItem.name;
                $scope.createPosition.icon = $scope.positionItem.icon.id;
                if($scope.positionItem.parent_position){
                    $scope.createPosition.leader = $scope.positionItem.parent_position;
                }
            };

            var init = function(){
                $rootScope.crumbs = {first: '管理员'};
                if($scope.page == 'admin'){
                    getAdmins();
                    getAdminMenu();
                    getPositions();
                }else if($scope.page == 'job'){
                    $rootScope.crumbs.second = '职位管理';
                    getPositions();
                    getIcons();
                    getPositionsCounts();
                }else if($scope.page == 'edit-job'){
                    $scope.positionType = AdminService.getSearchParam('positionType');
                    $rootScope.crumbs.second = '职位管理';
                    $rootScope.crumbs.third = $scope.positionType == 'edit' ? '编辑职位' : '创建职位';
                    getIcons();
                    getGroupsMap();
                    getPositions();
                    if($scope.positionType == 'edit'){
                        $scope.positionItem = JSON.parse(FilterStorageService.getStorage().currentFilter).positionItem;
                        seeEditPosition();
                    }
                }
            };

            init();

            $scope.clearSearch = function(){
                $scope.filterOption.search = '';
                $scope.searchAdmin();
            };

            $scope.selectIcon = function(icon){
                _.each($scope.positionIcons, function(icon){
                    icon.selected = false;
                });
                icon.selected = !icon.selected;
                if(icon.selected){
                    $scope.createPosition.icon = icon.id;
                }
            };

            $scope.selectAddAdmin = function(admin){
                admin.selectedAdd = true;
                admin.positionList = angular.copy($scope.positions);
                getAdminPositions(admin);
                $scope.search.admins.push(admin);
            };

            $scope.cancelSelectAdmin = function(admin){
                admin.selectedAdd = false;
                $scope.search.admins = _.filter($scope.search.admins, function(item){
                    return item.id !== admin.id;
                });
            };

            $scope.setPermission = function(item, level){
                item.op_level = item.op_level === level? '': level;
                $scope.menuSelected = item.level;
                var flag = false;
                _.each($scope.createPosition.perArr,function(per){
                    if(per.op_level && per.op_level != ''){
                        flag = true;
                    }
                });
                !flag ? $scope.menuSelected = '' : '';
            };

            $scope.addPosition = function(){
                var params = initAddPosition();
                if(validAddPos(params)) {
                    if($scope.createPosition.leader){
                        params.parentPositionId = $scope.createPosition.leader.id;
                    }
                    $scope.loading = true;
                    AdminService.addPosition(params).success(function(){
                        noty('info', '添加职位成功！');
                        $scope.loading = false;
                        AdminService.updateSearchParam('page', 'job');
                    }).error(function(data){
                        if(data.code == 409){
                            noty('error', '职位名称重复！');
                        }
                        $scope.loading = false;
                    });
                }
            };

            $scope.deletePosition = function(id, $hide){
                $hide();
                events.emit('confirm', {
                    title: '系统提示',
                    content: '是否确认删除' + $scope.positionItem.name + '职位, 删除后所有应用此职位权限的管理员将不再享有此职位权限？',
                    onConfirm: function() {
                        AdminService.deletePosition(id).success(function(){
                            noty('info', '删除职位成功！');
                            getPositions();
                            getPositionsCounts();
                        });
                    }
                });
            };

            $scope.selectGroupPer = function(item, tag){
                if(tag == 'group'){
                    if(item.selected){
                        _.each(item.permissions, function(per){
                            if(!_.contains(_.pluck($scope.createPosition.perArr, 'id'), per.id)){
                                $scope.createPosition.perArr.push(per);
                            }
                        });
                        _.each(item.permissions, function(per){per.selected = true;});
                    }else{
                        _.each(item.permissions, function(per){per.selected = false;});
                        var temp = [];
                        _.each($scope.permissionGroup, function(per){
                            if(per.selected){
                                var idArr = [];
                                idArr = _.intersection(_.pluck(per.permissions, 'id'), _.pluck(item.permissions, 'id'));
                                if(idArr.length > 0){
                                    _.each(idArr, function(id){
                                        temp = temp.concat(_.filter(per.permissions, function(p){return p.id == id}));
                                    });
                                }
                            }
                        });
                        _.each(item.permissions, function(per){
                            $scope.createPosition.perArr = _.filter($scope.createPosition.perArr, function(p){return p.id != per.id});
                        });
                        if(temp.length > 0){
                            _.each(temp, function(per){per.selected = true;});
                            $scope.createPosition.perArr = $scope.createPosition.perArr.concat(temp);
                        }
                    }
                }else{
                    item.selected = !item.selected;
                    if(item.selected && !_.contains(_.pluck($scope.createPosition.perArr, 'id'), item.id)){
                        $scope.createPosition.perArr.push(item);
                    }else{
                        $scope.createPosition.perArr = _.filter($scope.createPosition.perArr, function(per){return item.id != per.id});
                    }
                }
                $scope.createPosition.perArr = _.uniq($scope.createPosition.perArr);
                $scope.globalArr = _.filter($scope.createPosition.perArr, function(item){return item.level == 'global'});
                $scope.specifyArr = _.filter($scope.createPosition.perArr, function(item){return item.level == 'specify'});
            };

            $scope.editPosition = function(){
                var params = initEditPosition();
                $scope.loading = true;
                AdminService.editPosition(params, $scope.positionItem.id).success(function(){
                    noty('info', '职位编辑成功！');
                    $scope.loading = false;
                    // $scope.operationType = '';
                    // getPositions();
                    AdminService.updateSearchParam('page', 'job');
                }).error(function(data){
                    data.code === 409 ? noty('error', '该职位名称已经存在！'): '';
                    $scope.loading = false;
                });
            };

            $scope.changePosition = function(id, action){
                var params = {'action': action};
                AdminService.changePosition(id, $scope.positionFilter.type, params).success(function(){
                    action === 'up' ? noty('info', '职位上移成功！') : noty('info', '职位下移成功！');
                    getPositions();
                });
            };

            $scope.filterPosition = function(flag){
                $scope.menuSelected = angular.copy(flag);
                if(flag == 'all'){
                    $scope.positionFilter.type = '';
                }else{
                    $scope.positionFilter.type = flag;
                }
            };

            $scope.seeOptions= function(tag, item){
                $scope.operationType = tag;
                if(tag == 'edit-job'){
                    $scope.positionItem = item;
                }else if(tag == 'edit-admin'){
                    $scope.adminItem = item;
                }
            };

            $scope.selectBuildings = function(item){
                item.selected = !item.selected;
            };

            $scope.selectMenu = function(menu){
                $scope.selectedBuilding = '';
                $scope.selectedPosition = '';
                $scope.filterOption.search = '';
                $scope.selectedFilterPosition = [];
                $scope.clearAllFitler();
                if(!menu.selected){
                    _.each($scope.adminMenu, function(item){
                        item.selected = false;
                    });
                    menu.selected = true;
                    $scope.selectedPositionName = menu.name;
                    $scope.selectedMenu = menu;
                    if(menu.key === 'all'){
                        getAdmins();
                    }else if(menu.key === 'super'){
                        getAdmins({isSuperAdmin: 1});
                    }else if(menu.key === 'building'){
                        getAdmins({building: menu.id});
                    }
                }
                _.each($scope.adminMenu, function(a){
                    if(menu.key != a.key || (menu.key == a.key && menu.id != a.id)){
                        a.collapse = false;
                    }
                });
                if(!menu.collapse){
                    var params = {};
                    if(menu.key != 'all' && menu.key != 'super'){
                        params.key = menu.key;
                        if(menu.key == 'building'){
                            params.building = menu.id;
                        }
                        getPositionMenu(params);
                    }
                }
                if(menu.key == 'all'){
                    getPositions();
                }else{
                    menu.key == 'platform' ? getPositions('global') : getPositions('specify');
                }
                menu.collapse = !menu.collapse;
            };

            $scope.selectPosition = function(item, menu){
                $scope.filterOption.search = '';
                $scope.selectedFilterPosition = [];
                $scope.clearAllFitler();
                menu.selected = false;
                _.each(menu.positionMenu, function(position){
                    position.selected = false;
                });
                item.selected = true;
                $scope.selectedPosition = item;
                $scope.selectedPositionName = item.name;
                if(menu.key == 'building'){
                    getAdmins({'position': item.id, 'building': menu.id});
                }else{
                    getAdmins({'position': item.id});
                }
            };

            $scope.searchAdminByPhone = function(str){
                 if($scope.search.phone){
                     var params = {
                         'query': $scope.search.phone
                     };
                     AdminService.searchUser(params).success(function(data){
                        if(data.length >0){
                            $scope.search.phone = '';
                            $scope.search.flag = true;
                            data[0].avatar = CONF.file + '/person/' + data[0].id + '/avatar_small.jpg';
                            data[0].positionList = angular.copy($scope.positions);
                            if(str){
                                getAdminPositions(data[0], 'addAdmin');
                                $scope.saveFlag = true;
                                $scope.search.admins = data[0];
                                $scope.adminItem = angular.copy(data[0]);
                            }else{
                                getAdminPositions(data[0]);
                                $scope.search.admins = $scope.search.admins.concat(data);
                            }
                         }else{
                            $scope.search.flag = false;
                         }
                     });
                 }
            };

            $scope.searchAdmin = function(){
                $scope.selectedFilterPosition = [];
                $scope.clearAllFitler();
                if($scope.filterOption.search){
                    $scope.selectedPositionName = $scope.filterOption.search;
                    getAdmins({search: $scope.filterOption.search});
                }else{
                    if($scope.selectedMenu){
                        $scope.selectedPositionName = $scope.selectedMenu.name;
                        if($scope.selectedMenu.key === 'all'){
                            getAdmins();
                        }else if($scope.selectedMenu.key === 'platform'){
                            getAdmins({type: 'global'});
                        }
                    }else if($scope.selectedPosition){
                        $scope.selectedPositionName = $scope.selectedPosition.name;
                        getAdmins({position: $scope.selectedPosition.id});
                    }
                }
            };

            $scope.addItem= function(tag, $hide, item){
                if($hide){
                    $hide();
                }
                $scope.addType = tag;
                if(tag == 'admin'){
                    if(item){
                        $scope.selectedBuilding = item;
                        if($scope.selectedBuilding.key == 'platform'){
                            getPositionMenu({key: 'platform'});
                            getPositions('global');
                        }else{
                            getPositionMenu({key: 'building', building: $scope.selectedBuilding.id});
                            getPositions('specify');
                        }
                    }
                    $scope.search.flag = true;
                    $scope.operationType = '';
                    $scope.search.admins = [];
                    $scope.search.name = '';
                    $scope.search.phone = '';
                    if($scope.selectedPosition && $scope.selectedPosition.selected){
                        getExtraAdmins($scope.selectedPosition.id, $scope.selectedMenu.id);
                    }else{
                        getExtraAdmins();
                    }
                    showPop();
                }else if(tag == 'job'){
                    $scope.operationType = '';
                    $scope.positionItem = '';
                    $scope.createPosition.name = '';
                    $scope.createPosition.icon = '';
                    $scope.createPosition.leader = '';
                    $scope.menuSelected = $scope.positionFilter.type;
                    _.each($scope.positionIcons, function(item){
                        item.selected = false;
                    });
                    getPermissions();
                }else if(tag == 'move'){
                    showPop();
                    getSpecifyAdmin();
                }
            };

            $scope.operateOneAdmin = function(flag, $hide){
                $scope.operateAdminFlag = flag;
                $scope.globalPositionList = _.filter($scope.adminMenu, function(item){
                    return item.key !== 'all';
                });
                _.each($scope.globalPositionList, function(item){
                    if(item.key == 'super'){
                        item.jobList = angular.copy(_.filter($scope.positionOptions.positions, function(pos){return pos.is_super_admin}));
                    }else{
                        item.jobList = angular.copy(_.filter($scope.positionOptions.positions, function(pos){return !pos.is_super_admin}));
                    }
                    
                });
                if(flag === 'update'){
                    $scope.saveFlag = true;
                    $scope.search.admins = angular.copy($scope.adminItem.user);
                    $scope.search.admins.avatar = $scope.adminItem.avatar;
                    $scope.updateAdmin = {
                        platform: {}
                    };
                    $scope.originJobArr = [];

                    _.each($scope.adminItem.bind, function(item){
                        if(item.building_id){
                            if($scope.updateAdmin[item.building_id]){
                                $scope.updateAdmin[item.building_id][item.position_id] = item.id;
                            }else{
                                $scope.updateAdmin[item.building_id] = {};
                                $scope.updateAdmin[item.building_id][item.position_id] = item.id;
                            }
                            $scope.originJobArr.push(item.building_id + ':' + item.position_id);
                        }else{
                            $scope.updateAdmin.platform[item.position_id] = item.id;
                            $scope.originJobArr.push('platform:' + item.position_id);
                        }
                    });
                    _.each($scope.globalPositionList, function(building){
                        _.each(building.jobList, function(item){
                            // if(building.key === 'building'){
                                item.selected = $scope.updateAdmin[building.id] && $scope.updateAdmin[building.id][item.id] || $scope.updateAdmin.platform && $scope.updateAdmin.platform[item.id] ? true : false;
                            // }else{
                            //     item.selected = $scope.updateAdmin.platform && $scope.updateAdmin.platform[item.id] ? true : false; 
                            // }
                        });
                    });
                    $hide();
                }else{
                    $scope.saveFlag = false;
                    resetGlobalPositionList();
                    $scope.search.admins = '';
                }
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'operateAdminTpl'
                });
            };

            $scope.addPositionForAdmin = function($hide){
                if($scope.search.admins.length > 0){
                    var params = [];
                    if($scope.selectedPosition && $scope.selectedPosition.selected){
                        if($scope.selectedMenu.key == 'building'){
                            params = _.map($scope.search.admins, function(item){
                                return {user_id: item.id, position_id: $scope.selectedPosition.id, building_id: $scope.selectedMenu.id};
                            });

                        }else{
                            params = _.map($scope.search.admins, function(item){
                                return {user_id: item.id, position_id: $scope.selectedPosition.id};
                            });
                        }
                    }else if($scope.selectedMenu && $scope.selectedPosition == ''){
                        var flag = validatePosition();
                        if(flag){
                            _.each($scope.search.admins, function(admin){
                                _.each(admin.positionList, function(position){
                                    var temp = {user_id: admin.id, position_id: position.id};
                                    $scope.selectedMenu.key === 'building' ? temp.building_id = $scope.selectedMenu.id : (($scope.selectedMenu.key === 'all' && $scope.selectedBuilding.key != 'platform') ? temp.building_id = $scope.selectedBuilding.id : '');
                                    position.selected ? params.push(temp) : '';
                                });
                            });
                        }else{
                            return;
                        }
                    }

                    $scope.loading = true;
                    AdminService.addPositionForAdmin({add:params}).success(function(){
                        noty('info', '添加管理员成功！');
                        refreshMenu();
                        $hide();
                        $scope.loading = false;
                    }).error(function(data){
                        if(data.code === 400005){
                            $hide();
                            noty('error', '超级管理员最多只能设置2个！');
                        }
                        $scope.loading = false;
                    });
                }
            };

            $scope.bindingPosition = function($hide){
                var params = [];
                if($scope.selectedPosition && $scope.selectedPosition.selected){
                    _.each($scope.buildingMenu, function(item){
                        if(item.selected){
                            params.push({'user_id': $scope.adminItem.user_id, 'position_id': $scope.selectedPosition.id, 'building_id': item.id});
                        }
                    });
                }else if($scope.selectedMenu && $scope.selectedMenu.key != 'all'){
                    _.each($scope.adminItem.position, function(per){
                        _.each($scope.buildingMenu, function(item){
                            if(item.selected){
                                params.push({'user_id': $scope.adminItem.user_id, 'position_id': per, 'building_id': item.id});
                            }
                        });
                    });
                }
                AdminService.bindingPosition(params).success(function(){
                    noty('info', '添加到指定职位成功！');
                    $hide();
                    refreshMenu();
                });
            };

            $scope.selectFilter = function(item){
                item.filterSelected = !item.filterSelected;
                $scope.selectedFilterPosition = _.filter($scope.filterPositions, 'filterSelected', true);
            };

            $scope.selectAllFilter = function(){
                _.each($scope.filterPositions, function(item){
                    item.filterSelected = true;
                });
                $scope.selectedFilterPosition = _.filter($scope.filterPositions, 'filterSelected', true);
            };

            $scope.clearAllFitler = function(){
                _.each($scope.selectedFilterPosition, function(item){
                    item.filterSelected = false;
                });
                $scope.selectedFilterPosition = [];
            };

            $scope.deleteAdminPosition = function($hide){
                $hide();
                if($scope.selectedMenu.selected && $scope.selectedMenu.key != 'building' || $scope.selectedPosition.selected && $scope.selectedPosition.name == '超级管理员'){
                    if(!verifySuperAdmin()){
                        noty('error', '至少需要保留一个超级管理员！');
                        return;
                    }
                }
                events.emit('confirm', {
                    title: '系统提示',
                    content: '是否确认将管理员从该板块移除, 移除后将不再拥有此板块的职位权限',
                    onConfirm: function() {
                        var params = {};
                        if($scope.selectedMenu.key == 'building' && !$scope.selectedPosition){
                            params = {
                                'user_id': $scope.adminItem.user_id,
                                'building_id': $scope.selectedMenu.id
                            }
                        }else if($scope.selectedMenu.key == 'building' && $scope.selectedPosition != ''){
                            params = {
                                'user_id': $scope.adminItem.user_id,
                                'position_id': $scope.selectedPosition.id,
                                'building_id': $scope.selectedMenu.id
                            };
                        }else if($scope.selectedMenu.key == 'platform' && $scope.selectedPosition != ''){
                            params = {
                                'user_id': $scope.adminItem.user_id,
                                'position_id': $scope.selectedPosition.id
                            };
                        }else if($scope.selectedMenu.key == 'platform' && $scope.selectedPosition == ''){
                            params = {
                                'user_id': $scope.adminItem.user_id
                            };
                        }
                        if($scope.selectedMenu.selected){
                            $scope.selectedMenu.key == 'platform' ? deleteFromGlobal(params) : deleteFromCommunity(params);
                        }else{
                            deleteAdminPosition(params);
                        }
                    }
                });
            };

            $scope.deleteAdminFromPlatform = function($hide){
                $hide();
                if(!verifySuperAdmin()){
                    noty('error', '至少需要保留一个超级管理员！');
                    return;
                }
                events.emit('confirm', {
                    title: '系统提示',
                    content: '是否确认将管理员从平台删除, 删除后此账户将无法登录',
                    onConfirm: function() {
                        $scope.confirm.key = '';
                        showConfirm();
                    }
                });
            };

            $scope.confirmDelete = function($hide){
                if($scope.confirm.key == 'delete'){
                    $hide();
                    var params = {
                        'user_id': $scope.adminItem.user_id
                    }
                    AdminService.deleteAdminFromPlatform(params).success(function(){
                        noty('info', '管理员从平台删除成功！');
                        refreshMenu();
                    }).error(function(data){
                        if(data.code === 400006){
                            noty('error', '至少需要保留一个超级管理员！');
                        }
                    });
                }else{
                    noty('error', '请输入框中提示字样！');
                }
            };

            $scope.seePopover= function(tag, item){
                $scope.popoverType = tag;
                if(tag == 'admin' || tag == 'building_position'){
                    $scope.adminItem = item;
                }
            };

            $scope.togglePage= function(page, type){
                AdminService.updateSearchParam('page', page);
                type ? AdminService.updateSearchParam('positionType', type) : '';
                if(type == 'edit'){
                    FilterStorageService.setCurrentFilter({positionItem: $scope.positionItem});
                }
            };

            $scope.setPositionForAdmin = function(item){
                item.selected = !item.selected;
            };

            $scope.clearSelectedPosition = function(item){
                _.each(item.jobList, function(job){
                    job.selected = false;
                });
            };

            $scope.reSearch = function(){
                $scope.saveFlag = false;
                resetGlobalPositionList();
            };

            $scope.bindPositionForAdmin = function($hide){
                var params = initBindPositions();
                if($scope.globalPositionList[0].jobList[0].selected && $scope.adminMenu[1].count > 1 && !$scope.adminItem.is_super_admin){
                    noty('warning', '超级管理员最多只能设置2个！');
                    return ;
                }
                if($scope.operateAdminFlag === 'add' && params.add.length === 0){
                    noty('warning', '请选择职位！');
                    return ;
                }else if($scope.operateAdminFlag === 'update' && params.delete.position_binding_ids.length === $scope.originJobArr.length && params.add.length === 0){
                    noty('warning', '管理员职位不能为空！');
                    return ;
                }
                AdminService.bindPositionsForAdmin(params).success(function(){
                    refreshMenu();
                    $scope.saveFlag = false;
                    $scope.operateAdminFlag === 'add' ? noty('info', '添加管理员成功！') : noty('info', '管理员职位编辑成功！');
                    $hide();
                });
            };

            $scope.$watch('createPosition.perArr', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                formatePer();
            }, true);

        };

        return ['$rootScope', '$scope', 'AdminService', 'events', 'CONF', 'md5', 'CurrentAdminService', '$translate', '$cookies', 'FilterStorageService', AdminController];
    });

})(define);
