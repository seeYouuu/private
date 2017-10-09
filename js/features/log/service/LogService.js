/**
 *  Defines the LogService
 *
 *  @author  liping.chen
 *  @date    July 28, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the LogService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var LogService = function(http, utils, $location) {
            this.addRemark = function(id, params){
                return http.patch(utils.getapi('/sales/admin/logs/' + id + '/mark'), params);
            };

            this.getBuildings = function(params){
                return http.get(utils.getapi('/location/buildings'), {params: params});
            };

            this.getUserList = function(params){
                return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getModules = function(){
                return http.get(utils.getapi('/sales/admin/logs/modules'));
            };

            this.getRoomTypes = function(){
                return http.get(utils.getapi('/rooms/types'));
            };

            this.getLogList = function(params){
                return http.get(utils.getapi('/sales/admin/logs'), {params: params});
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getUnitDesc = function(){
                return {
                    hour: '小时',
                    day: '天',
                    month: '月'
                }
            };

            this.getStatusDesc = function(){
                return {
                    unpaid: '未付款',
                    paid: '已付款',
                    completed: '已完成',
                    cancelled: '已取消'
                }
            };

            this.getBuildingStatus = function(){
                return {
                    accept: '使用中',
                    banned: '冻结中',
                    invisible: '下架中',
                    pending: '审核中'
                };
            };

            this.getLogAction = function(){
                return {
                    create: '创建了',
                    delete: '删除了',
                    edit: '编辑了',
                    cancel: '取消了',
                    authorize: '认证了',
                    ban: '冻结了',
                    unban: '解冻了',
                    on_sale: '上架了',
                    off_sale: '下架了',
                    recommend: '推荐了',
                    remove_recommend: '取消推荐了',
                    agree: '同意了',
                    reject: '拒绝了',
                    private: '设置私人可见',
                    remove_private: '取消私人可见',
                    performing: '生效了'
                }
            };

            this.getLogModule = function(){
                return {
                    admin: '管理员',
                    building: '社区',
                    invoice: '发票',
                    event: '活动',
                    price_rule: '价格模板',
                    room: '空间',
                    room_order: '空间订单',
                    room_order_reserve: '设置内部占用',
                    room_order_preorder: '推送空间订单',
                    user: '用户',
                    product: '商品',
                    lease: '合同',
                    product_appointment: '预约申请'
                }
            };

        };

        return ['http', 'utils', '$location', LogService];

    });

})(define);
