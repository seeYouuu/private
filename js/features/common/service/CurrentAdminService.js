/**
 * Common service used to store current admin info
 */
(function(define) {
    'use strict';

    /**
     * Register the CurrentAdminService class with RequireJS
     */
    define(['FeatureBase'], function(FeatureBase) {

        var CurrentAdminService = function() {

            var storage = {
                currentAdmin: {}
            };

            var getStorage = function () {
                return storage;
            };

            /**
             * callback for permission.forEach
             * @param onePermission
             * @private
             */
            var generatePermissionMap = function (onePermission) {
                if(onePermission.building_id){

                    if(!storage.currentAdmin.permissionMap[onePermission.key] || (storage.currentAdmin.permissionMap[onePermission.key] && onePermission.op_level > storage.currentAdmin.permissionMap[onePermission.key])){
                        storage.currentAdmin.permissionMap[
                            onePermission.key
                        ] = onePermission.op_level;
                    }
                    if(onePermission.key === 'sales.building.building' && (!storage.currentAdmin.buildingMap['sales.building.building' + onePermission.building_id] || storage.currentAdmin.buildingMap['sales.building.building' + onePermission.building_id] < onePermission.op_level)){
                        storage.currentAdmin.buildingMap[
                            'sales.building.building' + onePermission.building_id
                        ] = onePermission.op_level;
                    }else if(onePermission.key === 'sales.building.room' && (!storage.currentAdmin.roomMap['sales.building.building' + onePermission.building_id] || storage.currentAdmin.roomMap['sales.building.building' + onePermission.building_id] < onePermission.op_level)){
                        storage.currentAdmin.roomMap[
                            'sales.building.room' + onePermission.building_id
                        ] = onePermission.op_level;
                    }else if(onePermission.key === 'sales.building.product' && (!storage.currentAdmin.productMap['sales.building.building' + onePermission.building_id] || storage.currentAdmin.productMap['sales.building.building' + onePermission.building_id] < onePermission.op_level)){
                        storage.currentAdmin.productMap[
                            'sales.building.product' + onePermission.building_id
                        ] = onePermission.op_level;
                        storage.currentAdmin.buildingIdMap[onePermission.building_id] = onePermission.op_level;
                    }else if(onePermission.key === 'sales.building.order.preorder' && (!storage.currentAdmin.preorderMap['sales.building.building' + onePermission.building_id] || storage.currentAdmin.preorderMap['sales.building.building' + onePermission.building_id] < onePermission.op_level)){
                        storage.currentAdmin.preorderMap[
                            'sales.building.order.preorder' + onePermission.building_id
                        ] = onePermission.op_level;
                    }else if(onePermission.key === 'sales.building.order.reserve' && (!storage.currentAdmin.reserveMap['sales.building.building' + onePermission.building_id] || storage.currentAdmin.reserveMap['sales.building.building' + onePermission.building_id] < onePermission.op_level)){
                        storage.currentAdmin.reserveMap[
                            'sales.building.order.reserve' + onePermission.building_id
                        ] = onePermission.op_level;
                    }else if(onePermission.key === 'sales.building.long_term_lease' && (!storage.currentAdmin.leasesMap['sales.building.building' + onePermission.building_id] || storage.currentAdmin.leasesMap['sales.building.building' + onePermission.building_id] < onePermission.op_level)){
                        storage.currentAdmin.leasesMap[
                            'sales.building.long_term_lease' + onePermission.building_id
                        ] = onePermission.op_level;
                    }else if(onePermission.key === 'sales.building.long_term_appointment' && (!storage.currentAdmin.appointmentMap['sales.building.building' + onePermission.building_id] || storage.currentAdmin.appointmentMap['sales.building.building' + onePermission.building_id] < onePermission.op_level)){
                        storage.currentAdmin.appointmentMap[
                            'sales.building.long_term_appointment' + onePermission.building_id
                        ] = onePermission.op_level;
                    }else if(onePermission.key === 'sales.building.order' && (!storage.currentAdmin.spaceOrderMap['sales.building.building' + onePermission.building_id] || storage.currentAdmin.spaceOrderMap['sales.building.building' + onePermission.building_id] < onePermission.op_level)){
                        storage.currentAdmin.spaceOrderMap[
                            'sales.building.order' + onePermission.building_id
                        ] = onePermission.op_level;
                    }
                    
                }else{
                    if(onePermission.type === 'super'){
                        storage.currentAdmin.permissionMap[
                            onePermission.key
                        ] = 'super';
                    }else{
                        if(!storage.currentAdmin.permissionMap[onePermission.key] || storage.currentAdmin.permissionMap[onePermission.key] && onePermission.op_level > storage.currentAdmin.permissionMap[onePermission.key]){
                            storage.currentAdmin.permissionMap[
                                onePermission.key
                            ] = onePermission.op_level;
                        }
                    }
                }
            };

            /**
             * store current admin info
             * @param admin
             * @public
             */
            var setCurrentAdmin = function (admin) {
                storage.currentAdmin.user = admin.admin;
                storage.currentAdmin.permissions = admin.permissions;
                storage.currentAdmin.permissionMap = {};
                storage.currentAdmin.buildingMap = {};
                storage.currentAdmin.roomMap = {};
                storage.currentAdmin.productMap = {};
                storage.currentAdmin.buildingIdMap = {};
                storage.currentAdmin.reserveMap = {};
                storage.currentAdmin.preorderMap = {};
                storage.currentAdmin.leasesMap = {};
                storage.currentAdmin.appointmentMap = {};
                storage.currentAdmin.spaceOrderMap = {};

                storage.currentAdmin.permissions.forEach(generatePermissionMap);
            };

            return {
                getStorage: getStorage,
                setCurrentAdmin: setCurrentAdmin
            };

        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('CurrentAdminModule');
            };

            this.run = function () {
                this.mod.factory(
                    'CurrentAdminService',
                    CurrentAdminService
                );
            };

        });

        return Feature;

    });

})(define);