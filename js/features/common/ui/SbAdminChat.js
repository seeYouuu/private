/**
 *
 *  The SbAdminChat.
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 **/
(function(define) {
    'use strict';

    define(['FeatureBase', 'lodash', 'tpl!./ChatImagePreview.html'], function(Base, _, chatPreviewTpl) {
        
        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('SbAdminChatModule');
            };

            this.run = function() {
                var features = require.toUrl('features');
                var dir = function(events, MessageStorageService, SendMessage, http, utils, CONF, ImageUploaderService, $timeout, $location, AdminChatService, XmppConnector, CurrentUser) {
                    return {
                        restrict: 'E',
                        templateUrl: features + '/common/ui/SbAdminChat.html',
                        scope: {
                            'chatGroups': '='
                        },
                        link: function($scope, element, attrs) {

                            $scope.showChatboxFlag = false;
                            $scope.leftChatboxFlag = false;
                            $scope.selectedGroup = {};
                            $scope.message = {
                                content: ''
                            };
                            $scope.search = {
                                search: ''
                            };
                            $scope.member = {};
                            $scope.showTotalFlag = true;
                            $scope.selectRecords = [];
                            $scope.records = {};
                            var storage = '',
                                today = new Date();

                            var getChatMember = function(){
                                http.get(utils.getapi('/sales/admin/chatgroups/service/members')).success(function(data){
                                    _.each(data, function(item){
                                        $scope.member[item.xmpp_user] = item;
                                    });
                                    MessageStorageService.setGroupMembers($scope.member);
                                });
                            };

                            var onContentImageUploaded = function (item, response) {
                                var message = {};
                                var toJId = $scope.selectedGroup.id + '@customerservice.' + CONF.xmpp;
                                message.body = {url: response.download_link, type: response.content_type, fileid: response.fileid, filename: response.filename};
                                message.body.service = 'FileShare';
                                message.body = JSON.stringify(message.body);
                                message.service = 'FileShare';
                                SendMessage.send_file_message(message, toJId, $scope.selectedGroup.id);
                            };

                            var getSelectedGroup = function(groupChatId){
                                return _.filter($scope.chatGroups, function(item){
                                    return item.id == groupChatId;
                                });
                            };

                            var is_json_string = function (text) {
                                try {
                                    JSON.parse(text);
                                } catch (e) {
                                    return false;
                                }
                                return true;
                            };
               

                            $scope.chatImageUploader = ImageUploaderService.createUncompressedImageUploader(
                                'customer',
                                onContentImageUploaded
                            );

                            $scope.openRoomDetail = function(item){
                                var params = $location.search();
                                _.each(params, function(value, key){
                                    $location.search(key, undefined);
                                });
                                $location.search('ptype', 'spaceDetail');
                                $location.search('roomId', item.body.roomId);
                                $location.search('productId', item.body.productId);
                                $location.search('communityId', item.body.buildingId);
                                $location.path('space');
                            };

                            $scope.showUserInfo = function(user_id){
                                var params = $location.search();
                                _.each(params, function(value, key){
                                    $location.search(key, undefined);
                                });
                                $location.search('pageType', 'detail');
                                $location.search('userid', user_id);
                                $location.path('user');
                            };

                            $scope.uploaderChatImage = function(){
                                $('#chatImageUpload').click();
                            };

                            $scope.closeTotalMsg = function(){
                                $scope.showTotalFlag = false
                            };

                            events.on('message', function(message) {
                                if($scope.selectedGroup && message && message.jId === $scope.selectedGroup.id){
                                    message.recordDate = new Date(message.time * 1);
                                    if(message.recordDate.getFullYear() === today.getFullYear() && message.recordDate.getMonth() === today.getMonth() && message.recordDate.getDate() === today.getDate()){
                                        message.today = true;
                                    }
                                    $scope.records[$scope.selectedGroup.id][message.id] = message;
                                    $scope.selectRecords = _.sortBy(_.values($scope.records[$scope.selectedGroup.id]), 'time');
                                }
                                $timeout(function(){
                                    $('#chatPanel').scrollTop(10000);
                                }, 300);
                                _.keys($scope.records).length !== $scope.chatGroups.length ? events.emit('refreshGroup') : '';
                                $scope.showChatboxFlag ? '' : $scope.showTotalFlag = true;

                                // storage = MessageStorageService.getStorage().historyMessage;
                                // $scope.records = storage ? JSON.parse(storage) : {};

                                // if($scope.selectedGroup && $scope.selectedGroup.id){
                                //     $scope.selectRecords = _.sortBy(_.values($scope.records[$scope.selectedGroup.id]), 'time');
                                //     _.each($scope.selectRecords, function(record){
                                //         record.recordDate = new Date(record.time * 1);
                                //         if(record.recordDate.getFullYear() === today.getFullYear() && record.recordDate.getMonth() === today.getMonth() && record.recordDate.getDate() === today.getDate()){
                                //             record.today = true;
                                //         }
                                //     });
                                // }
                                // $timeout(function(){
                                //     $('#chatPanel').scrollTop(10000);
                                // }, 300);
                                // _.keys($scope.records).length !== $scope.chatGroups.length ? events.emit('refreshGroup') : '';
                                // $scope.showChatboxFlag ? '' : $scope.showTotalFlag = true;
                            });

                            events.on('count', function(){
                                storage = MessageStorageService.getStorage().historyMessage;
                                var temp = storage ? JSON.parse(storage) : {};
                                $scope.totalCount = 0;
                                _.each($scope.chatGroups, function(item){
                                    var chatRecord = _.filter(temp[item.id], function(value, key){
                                        return !value.readFlag;
                                    });
                                    item.count = chatRecord ? chatRecord.length : 0;
                                    $scope.totalCount += item.count;
                                });
                            });

                            events.on('openChat', function(groupChatId){
                                var temp = getSelectedGroup(groupChatId);

                                $timeout(function(){
                                    temp = getSelectedGroup(groupChatId);
                                    $scope.selectedGroup = temp[0];
                                    _.each($scope.records[groupChatId], function(value){
                                        value.readFlag = true;
                                    });
                                    MessageStorageService.setHistoryMessage($scope.records);
                                    $scope.selectedGroup.count = 0;
                                }, 500);
                                $scope.leftChatboxFlag = true;
                                $scope.showChatboxFlag = true;
                                $scope.showTotalFlag = false;
                            });

                            $scope.showChatbox = function(group){
                                events.emit('openChat', group.id);
                            };

                            $scope.sendMsg = function(event){
                                if(event.keyCode === 13 && !event.shiftKey && $scope.message.content){
                                    var service = 'text';
                                    var toJId = $scope.selectedGroup.id + '@customerservice.' + CONF.xmpp;
                                    SendMessage.send_message($scope.message.content, toJId, service, $scope.selectedGroup.id);
                                    $scope.message.content = '';
                                }
                            };

                            $scope.clearSearch = function(){
                                $scope.search.search = '';
                            };

                            $scope.toggleChatbox = function(){
                                !$scope.showChatboxFlag ? $scope.showTotalFlag = false : '';
                                $scope.showChatboxFlag = $scope.showChatboxFlag ? false: true;
                            };

                            $scope.closeChatbox = function(){
                                $scope.leftChatboxFlag = false;
                            };

                            $scope.openChatbox = function(group){
                                // if(!XmppConnector.check_conncted()){
                                //     XmppConnector.reset_connection();
                                //     XmppConnector.create_connection(CurrentUser.get_user_id());
                                // }

                                if(($scope.selectedGroup.id && group.id !== $scope.selectedGroup.id) || !$scope.selectedGroup.id){
                                    AdminChatService.getGroupHistory(group.id).success(function(data){
                                        console.log(data)
                                        _.each(data, function(item){
                                            item.xmpp_username = item.fromJID.split('@')[0];
                                            item.body = is_json_string(item.body) ? JSON.parse(item.body) : item.body;
                                            item.service = item.body.service ? item.body.service : 'text';
                                            item.user_id = item.user_id ? item.user_id : $scope.member[item.xmpp_username].user_id;
                                            item.avatar = item.avatar ? item.avatar : CONF.file + '/person/' + item.user_id + '/avatar_small.jpg'
                                            item.readFlag = true;
                                            item.time = item.sentDate;
                                            $scope.records[group.id] = $scope.records[group.id] ? $scope.records[group.id] : {};
                                            $scope.records[group.id][item.messageID] = item;
                                        });
                                        $scope.selectRecords = _.sortBy(_.values($scope.records[group.id]), 'time');
                                        _.each($scope.selectRecords, function(record){
                                            record.recordDate = new Date(record.time * 1);
                                            if(record.recordDate.getFullYear() === today.getFullYear() && record.recordDate.getMonth() === today.getMonth() && record.recordDate.getDate() === today.getDate()){
                                                record.today = true;
                                            }
                                        });
                                    });
                                }
                                $scope.selectedGroup.selected = false
                                group.selected = true;
                                $scope.selectedGroup = group;
                                $scope.leftChatboxFlag = true;
                                // console.log($scope.records[group.id]);
                                _.each($scope.records[group.id], function(value){
                                    value.user_id = value.user_id ? value.user_id : $scope.member[value.xmpp_username].user_id;
                                    value.avatar = value.avatar ? value.avatar : CONF.file + '/person/' + value.user_id + '/avatar_small.jpg'
                                    value.readFlag = true;
                                });
                                MessageStorageService.setHistoryMessage($scope.records);
                                $scope.selectedGroup.count = 0;
                                $timeout(function(){
                                    $('#chatPanel').scrollTop(10000);
                                }, 300)
                            };

                            $scope.showOriginImage = function(url){
                                $scope.originImageUrl = url;
                                events.emit('modal', {
                                    scope: $scope,
                                    placement: 'bottom',
                                    animation: 'am-fade',
                                    template: 'financePreviewTpl'
                                });
                            };

                            $scope.$watch('chatGroups', function(newValue){
                                if(newValue && newValue.length > 0){
                                    _.each(newValue, function(item){
                                        $scope.member[item.creator_xmppUsername] = {user_id: item.creatorId};
                                    });
                                    getChatMember();
                                }
                            }, true);
                        }
                    };
                };

                this.mod.directive('sbAdminChat', ['events', 'MessageStorageService', 'SendMessage', 'http', 'utils', 'CONF', 'ImageUploaderService', '$timeout', '$location', 'AdminChatService', 'XmppConnector', 'CurrentUser', dir]);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('chatPreviewTpl', chatPreviewTpl());
                }]);

                this.mod.factory('AdminChatService', ['http', 'utils', 'CONF', '$cookies', function (http, utils, CONF, $cookies) {

                    this.getGroupHistory = function(jid){
                        var toJId = jid + '@customerservice.' + CONF.xmpp;
                        var params = {toJID: toJId};
                        return http.get(utils.getapi('/sales/admin/chatgroups/service/history/message'), {params: params});
                    };

                    return this;
                }]);
            };

        });

        return Feature;

    });


})(define);
