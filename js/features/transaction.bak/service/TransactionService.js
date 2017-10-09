/**
 *  Defines the TransactionService
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the TransactionService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var TransactionService = function(http, utils, $location) {

            this.getMemberDetail = function(id){
                return http.get(utils.getapi('/sales/admin/membership/cards/orders/' + id));
            };

            this.getMemberList = function(params){
                return http.get(utils.getapi('/sales/admin/membership/cards/orders/list'), {params: params});
            };  

            this.createGroupChat = function(params){
                return http.post(utils.getapi('/sales/admin/chatgroups'), params);
            };

            this.getCustomerService = function(){
                return http.get(utils.getapi('/sales/admin/chatgroups/service/my'));
            };
            
            this.getLessorInfo = function(buildingId){
                return http.get(utils.getapi('/sales/admin/buildings/' + buildingId + '/lessor'));
            };

            this.collectionSalesOffline = function(id, params){
                return http.patch(utils.getapi('/sales/admin/leases/bills/' + id + '/collection'), params);
            };
            
            this.getLeasesBillDetail = function(id, params){
                return http.get(utils.getapi('/sales/admin/leases/bills/' + id), {params: params});
            };

            this.batchPushBills = function(leaseId, params){
                return http.post(utils.getapi('/sales/admin/leases/' + leaseId + '/bills/batch/push'), params);
            };

            this.changeLeasesOrderAmount = function(id, params){
                return http.patch(utils.getapi('/sales/admin/leases/bills/' + id), params);
            };

            this.changeSpaceOrderAmount = function(id, params){
                return http.patch(utils.getapi('/sales/admin/orders/' + id + '/preorder'), params);
            };

            this.createOtherBills = function(params){
                return http.post(utils.getapi('/sales/admin/leases/bills'), params);
            };

            this.setDepositNote = function(id, params){
                return http.patch(utils.getapi('/sales/admin/leases/' + id + '/deposit'), params);
            };

            this.getLeasesLog = function(params){
                return http.get(utils.getapi('/sales/admin/logs'), {params: params});
            };

            this.getPushedBills = function(id){
                return http.get(utils.getapi('/sales/admin/leases/' + id + '/bills'));
            };

            this.pushLeasesBill = function(id, params){
                return http.patch(utils.getapi('/sales/admin/leases/bills/') + id, params);
            };

            this.getUsersInfo = function(params){
                return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getLeasesLists = function(params){
                return http.get(utils.getapi('/sales/admin/leases'), {params: params});
            };

            this.setLeasesStatus = function(id, params){
                return http.patch(utils.getapi('/sales/admin/leases/') + id + '/status', params);
            };

            this.setOrderStatus = function(order_id, params){
                return http.patch(utils.getapi('/sales/admin/orders/'+ order_id + '/rejected'), params);
            };

            this.deleteLeases = function(id){
                return http.delete(utils.getapi('/sales/admin/leases/' + id));
            };

            this.getLeasesDetail = function(id){
                return http.get(utils.getapi('/sales/admin/leases/' + id));
            };
            
            this.updateLease = function(id, params){
                return http.put(utils.getapi('/sales/admin/leases/') + id, params);
            };

            this.getProductDetail = function(id){
                return http.get(utils.getapi('/sales/admin/products/') + id);
            };

            this.createLease = function(params){
                return http.post(utils.getapi('/sales/admin/leases'), params);
            };
            
            this.searchUser = function(params){
                return http.get(utils.getapi('/admin/users/by_phone'), {params: params});
            };

            this.getAppointmentList = function(params){
                return http.get(utils.getapi('/sales/admin/products/appointments/list'), {params: params});
            };

            this.getAppointmentDetail = function(id){
                return http.get(utils.getapi('/sales/admin/products/appointments/') + id);
            };

            this.setAgreementStatus = function(id, params){
                return http.patch(utils.getapi('/sales/admin/products/appointments/') + id, params);
            };

            this.getEventList = function(params){
                return http.get(utils.getapi('/sales/admin/events/orders'), {params: params});
            };

            this.getEventOrderDetail = function(id){
                return http.get(utils.getapi('/sales/admin/events/orders/' + id));
            };

            this.getSpaceDetail = function(id){
                return http.get(utils.getapi('/sales/admin/orders/' + id));
            };

            this.cancelOrder = function(id){
                return http.post(utils.getapi('/sales/admin/orders/' + id + '/cancel'));
            };
            
            this.getRoomTypes = function(){
                return http.get(utils.getapi('/rooms/types'));
            };

            this.getWorkspaceList = function(params) {
                return http.get(utils.getapi('/sales/admin/orders'), {params: params});
            };

            this.getUserList = function(params){
                return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getBuildingList = function(params) {
                return http.get(utils.getapi('/sales/admin/location/buildings'), {params: params});
            };

            this.getRemarkList = function(params){
              return http.get(utils.getapi('/sales/admin/remarks'), {params: params});
            };

            this.createRemark = function(params){
              return http.post(utils.getapi('/sales/admin/remarks'), params);
            };

            this.getWorkspaceStatusDesc = function(){
                return {
                    cancelled: '已取消',
                    completed: '已完成',
                    paid: '已付款',
                    unpaid: '未付款'
                };
            };

            this.getAppointmentStatusDesc = function(){
                return {
                    accepted: '已同意',
                    pending: '审核中',
                    rejected: '己拒绝',
                    withdrawn: '已撤销'
                };
            };

            this.getAgreementStatusDesc = function(){
                return {
                    confirming: '待确认',
                    reconfirming: '重新确认',
                    confirmed: '已确认',
                    performing: '履行中',
                    end: '已结束',
                    closed: '已关闭',
                    expired: '已超时',
                    matured: '已到期',
                    terminated: '已结束(终止)'
                };
            };

            this.getUnitDesc = function(){
                return {
                    hour: '小时',
                    day: '天',
                    month: '月'
                }
            };

            this.getSupplementaryList = function(){
                return http.get(utils.getapi('lease/renttypes'));
            };

            this.getStepBoxs = function(){
                return [{
                    step: 1,
                    des: '审核中'
                },{
                    step: 2,
                    des: '待确认'
                },{
                    step: 3,
                    des: '已确认'
                },{
                    step: 4,
                    des: '履行中'
                },{
                    step: 5,
                    des: '已结束'
                }]
            };

            this.getKeywordList = function(tabType){
                var response = [];
                if(tabType === 'longrent'){
                    response = [
                        {name: '承租方(包含)', value: 'applicant'},
                        {name: '空间名(包含)', value: 'room'},
                        {name: '预约号(包含)', value: 'number'}
                    ];
                }else if(tabType === 'space'){
                    response = [
                        {name: '订单号(包含)', value: 'number'},
                        {name: '空间名(包含)', value: 'room'},
                        {name: '用户名', value: 'user'},
                        {name: '用户手机', value: 'phone'},
                        {name: '用户邮箱', value: 'email'}
                    ];
                }else if(tabType === 'agreement'){
                    response = [
                        {name: '承租方(包含)', value: 'applicant'},
                        {name: '空间名(包含)', value: 'room'},
                        {name: '合同号', value: 'number'}
                    ];
                }else if(tabType === 'event'){
                    response = [
                        {name: '订单号(是)', value: 'number'},
                        {name: '活动名(包含)', value: 'event'}
                    ];
                }else if(tabType === 'member'){
                    response = [
                        {name: '订单号', value: 'number'},
                        {name: '全员卡名', value: 'card_name'},
                        {name: '用户名', value: 'user'},
                        {name: '用户手机', value: 'phone'},
                        {name: '用户邮箱', value: 'email'}
                    ];
                }
                return response;
            };

            this.getFilterStatus = function(tabType){
                var response = [];
                if(tabType === 'space'){
                    response = [
                        {name: '未付款', value: 'unpaid'},
                        {name: '已付款', value: 'paid'},
                        {name: '已完成', value: 'completed'},
                        {name: '已取消', value: 'cancelled'}
                    ];
                }else if(tabType === 'agreement'){
                    response = [
                        {name: '待确认', value: 'confirming'},
                        {name: '已确认', value: 'confirmed'},
                        {name: '履行中', value: 'performing'},
                        {name: '重新确认', value: 'reconfirming'},
                        {name: '已终止', value: 'terminated'},
                        {name: '已关闭', value: 'closed'},
                        {name: '已超时', value: 'expired'},
                        {name: '已到期', value: 'matured'},
                        {name: '已结束', value: 'end'}
                    ];
                }else if(tabType === 'longrent'){
                    response = [
                        {name: '审核中', value: 'pending'},
                        {name: '已同意', value: 'accepted'},
                        {name: '己拒绝', value: 'rejected'},
                        {name: '已撤销', value: 'withdrawn'}
                    ];
                }

                return response;
            };

            this.getFilterExchangeHour = function(){
                var response = [
                        {name: '最近一周', value: 'last_week'},
                        {name: '最近一个月', value: 'last_month'},
                        {name: '交易时间段', value: 'period'}
                    ];
                return response;
            };

            this.getFilterRentDate = function(){
                var response = [
                        {name: '起租日', value: 'rent_start'},
                        {name: '时间段', value: 'rent_range'},
                        {name: '结束日', value: 'rent_end'}
                ];
                return response;
            };        

            this.getFilterRentDate = function(){
                var response = [
                        {name: '起租日', value: 'rent_start'},
                        {name: '时间段', value: 'rent_range'},
                        {name: '结租日', value: 'rent_end'}
                    ];
                return response;
            };

            this.getFilterPayDate = function(){
                var response = [
                        {name: '付款日', value: 'pay_date'},
                        {name: '付款时间段', value: 'both'},
                        {name: '在此时间前', value: 'pay_end'},
                        {name: '在此时间后', value: 'pay_start'}
                    ];
                return response;
            };

            this.getAgreementOption = function(){
                return {
                    lessor_name: '',
                    lessor_address: '',
                    lessor_contact: '',
                    lessor_phone: '',
                    lessor_email: '',
                    lessee_name: '',
                    lessee_address: '',
                    lessee_contact: '',
                    lessee_phone: '',
                    lessee_email: '',
                    supervisor: '',
                    drawee: '',
                    product: '',
                    start_date: '',
                    end_date: '',
                    monthly_rent: '',
                    total_rent: '',
                    purpose: '',
                    status: '',
                    other_expenses: '',
                    supplementary_terms: '',
                    deposit: '',
                    bills: {},
                    lease_rent_types: []
                };
            };

            this.getChannels = function(params){
                return http.get(utils.getapi('/payments/types'), {params: params});
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

        };

        return ['http', 'utils', '$location', TransactionService];

    });

})(define);
