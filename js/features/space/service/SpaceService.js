/**
 *  Defines the AdminService
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the AdminService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var SpaceService = function(http, utils, $location) {

            this.getTypeTags = function(params){
                return http.get(utils.getapi('/rooms/type_tags'), {params: params});
            };

            this.uploadCommunityImage = function(params){
                return http.post(utils.getapi('/sales/admin/rooms/attachments'), params);
            };

            this.deleteCommunityImage = function(id){
                return http.delete(utils.getapi('/sales/admin/rooms/attachments/' + id));
            };

            this.createGroupChat = function(params){
                return http.post(utils.getapi('/sales/admin/chatgroups'), params);
            };
            
            this.getCustomerService = function(){
                return http.get(utils.getapi('/sales/admin/chatgroups/service/my'));
            };

            this.getRecommendList = function(params) {
                return http.get(utils.getapi('/sales/admin/products/recommend'), {params: params});
            };

            this.changePosition = function(id, params) {
                return http.post(utils.getapi('/sales/admin/products/' + id + '/recommend/position'), params);
            };

            this.addRecommend = function(params) {
                return http.post(utils.getapi('/sales/admin/products/recommend'), params);
            };

            this.deleteRecommend = function(params) {
                return http.delete(utils.getapi('/sales/admin/products/recommend'), {params: params});
            };

            this.getAllAdmins = function(params){
                return http.get(utils.getapi('admin/admins'), {params: params});
            };

            this.uploadRoomsImage = function(buildId, params){
                return http.post(utils.getapi('/sales/admin/buildings/' + buildId + '/room/attachment'), params);
            };

            this.setAgreementStatus = function(id, params){
                return http.patch(utils.getapi('/sales/admin/products/appointments/') + id, params);
            };

            this.getAppointmentList = function(params){
                return http.get(utils.getapi('/sales/admin/products/appointments/list'), {params: params});
            };

            this.setCommunityVisible = function(building_id, params){
                return http.patch(utils.getapi('/sales/admin/buildings/'+ building_id ), params);
            };

            this.deleteCommunity = function(id){
                return http.delete(utils.getapi('/sales/admin/buildings/' + id));
            };

            this.getOfficeUsage = function(id, params){
                return http.get(utils.getapi('/sales/admin/rooms/office/' + id + '/usage'), {params: params});
            };

            this.getLongtermUsage = function(id, params){
                return http.get(utils.getapi('/sales/admin/rooms/longterm/' + id + '/usage'), {params: params});
            };

            this.getFixedUsage = function(id, params){
                return http.get(utils.getapi('/sales/admin/rooms/fixed/' + id + '/usage'), {params: params});
            };

            this.getFlexibleUsage = function(id, params){
                return http.get(utils.getapi('/sales/admin/rooms/flexible/' + id + '/usage'), {params: params});
            };

            this.getMeetingUsage = function(id, params){
                return http.get(utils.getapi('/sales/admin/rooms/meeting/' + id + '/usage'), {params: params});
            };
            
            this.addRoom = function(params){
                return http.post(utils.getapi('/sales/admin/rooms'), params);
            };

            this.deleteRoom = function(id){
                return http.delete(utils.getapi('/sales/admin/rooms/') + id);
            };

            this.updateRoom = function(id, params){
                return http.patch(utils.getapi('/sales/admin/rooms/') + id, params);
            };

            this.getRoomDetail = function(id){
                return http.get(utils.getapi('/sales/admin/rooms/' + id));
            };

            this.editCommunity = function(id, params){
                return http.put(utils.getapi('/sales/admin/buildings/' + id), params);
            };

            this.addCommunity = function(params){
                return http.post(utils.getapi('/sales/admin/buildings'), params);
            };

            this.getCommunityRoomAttachments = function(params){
                return http.get(utils.getapi('/sales/admin/rooms/attachments'), {params: params});
            };
            
            this.getFloors = function(params){
                return http.get(utils.getapi('/location/floors'), {params: params});
            };

            this.getDoors = function(params){
                return http.get(utils.getapi('/sales/admin/doors'), {params: params});
            };

            this.getServiceList = function(){
                return http.get(utils.getapi('/building/services'));
            };

            this.getOfficeSupplies = function(){
                return http.get(utils.getapi('/sales/admin/rooms/supplies'));
            };

            this.getRoomTypes = function(){
                return http.get(utils.getapi('/sales/admin/room/types'));
            };

            this.getPropertyTypes = function(){
                return http.get(utils.getapi('/property/types'));
            };

            this.getProductDetail = function(id){
                return http.get(utils.getapi('/sales/admin/products/') + id);
            };

            this.searchUser = function(params){
                return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getDateInfo = function(id,params){
                return http.get(utils.getapi('/client/products/' + id + '/dates'), {params: params});
            };

            this.getSupplementaryList = function(){
                return http.get(utils.getapi('lease/renttypes'));
            };

            this.setVisible = function(params, id){
                return http.patch(utils.getapi('/sales/admin/products/' + id), params);
            };

            this.spacePreorder = function(params){
                return http.post(utils.getapi('/sales/admin/orders/preorder'), params);
            };

            this.spaceReserve = function(params){
                return http.post(utils.getapi('/sales/admin/orders/reserve'), params);
            }

            this.searchByPhone = function(params){
                return http.get(utils.getapi('/admin/users/by_phone'), {params: params});
            };

            this.getUsers = function(params){
                return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getBuildingAttachments = function (params) {
                return http.get(utils.getapi('/sales/admin/rooms/attachments'), {params: params});
            };

            this.editProduct = function(id, params){
                return http.put(utils.getapi('/sales/admin/products/') + id, params);
            };

            this.createProduct = function(params){
                return http.post(utils.getapi('/sales/admin/products'), params);
            };

            this.getCommunityDetail = function(id){
                return http.get(utils.getapi('/sales/admin/buildings/' + id));
            };

            this.getServiceList = function(){
                return http.get(utils.getapi('/building/services'));
            };

            this.getComSpaceList = function(params){
                return http.get(utils.getapi('/sales/admin/space/communities/spaces'), {params: params});
            };

            this.getRegionList = function(params){
                return http.get(utils.getapi('/sales/admin/space/administrative_region'), {params: params});
            };

            this.getHotCities = function(params) {
                return http.get(utils.getapi('/sales/admin/location/hot/cities'), {params: params});
            };

            this.getRoomTypeListOfCommunity = function(id){
                return http.get(utils.getapi('/sales/admin/space/community/' + id + '/roomtypes'));
            };
            
            this.getCommunities = function(){
                return http.get(utils.getapi('/sales/admin/space/communities'));
            };

            this.getLeasesLists = function(params){
                return http.get(utils.getapi('/sales/admin/leases'), {params: params});
            };

            this.getSpaceOrders = function(params) {
                return http.get(utils.getapi('/sales/admin/orders'), {params: params});
            };

            this.cancelOrder = function(id){
                return http.post(utils.getapi('/sales/admin/orders/' + id + '/cancel'));
            };
            
            this.setOrderStatus = function(order_id, params){
                return http.patch(utils.getapi('/sales/admin/orders/'+ order_id + '/rejected'), params);
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getAppointmentStatusDesc = function(){
                return {
                    accepted: '已同意',
                    pending: '审核中',
                    rejected: '己拒绝',
                    withdrawn: '已撤销'
                };
            };
            
        };

        return ['http', 'utils', '$location', SpaceService];

    });

})(define);
