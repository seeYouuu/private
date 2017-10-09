/**
 *  Defines the FinanceService
 *  @author  liping.chen
 *  @date    Jun 13, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the FinanceService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */

        var FinanceService = function(http, utils, $location) {
            
            this.getBillBuildingIds = function(params){
                return http.get(utils.getapi('/sales/admin/leases/bills/numbers'), {params: params});
            };

            this.getOrderBuildingIds = function(params){
                return http.get(utils.getapi('/sales/admin/orders/numbers'), {params: params});
            };

            this.createGroupChat = function(params){
                return http.post(utils.getapi('/sales/admin/chatgroups'), params);
            };
            
            this.getCustomerService = function(){
                return http.get(utils.getapi('/sales/admin/chatgroups/service/my'));
            };
            
            this.checkProfileExist = function(){
                return http.get(utils.getapi('/sales/admin/finance/withdrawals/check/company/profile/exist'));
            };

            this.getWalletCounts = function(){
                return http.get(utils.getapi('/sales/admin/finance/withdrawals/wallet'));
            };

            this.getFinanceCounts = function(){
                return http.get(utils.getapi('/sales/admin/finance/summary/counts'));
            };

            this.getCurrentSummary = function(){
                return http.get(utils.getapi('/sales/admin/finance/summary/current'));
            };

            this.getSummaryList = function(params){
                return http.get(utils.getapi('/sales/admin/finance/summary'), {params: params});
            };

            this.getYearsList = function(){
                return http.get(utils.getapi('/sales/admin/finance/summary/years'));
            };

            this.getSandboxInvoiceInfo = function(){
                return http.get(utils.getapi('/sales/admin/finance/official/invoice/profile'));
            };

            this.getFinanceWithDrawalsList = function(params){
                return http.get(utils.getapi('/sales/admin/finance/withdrawals'), {params: params});
            };

            this.createFinanceWithDrawals = function(params){
                return http.post(utils.getapi('/sales/admin/finance/withdrawals'), params);
            };

            /* add for service fee */
            this.cancelledServiceBill = function(id, params){
                return http.patch(utils.getapi('/sales/admin/finance/long/rent/bills/' + id), params);
            };

            this.getFileServer = function(params){
                return http.get(utils.getapi('/fileserver/url'), {params: params});
            };
            
            this.generateServiceBill = function(params){
                return http.post(utils.getapi('/sales/admin/finance/long/rent/bills'), params);
            };

            this.getTotalServiceFee = function(){
                return http.get(utils.getapi('/sales/admin/finance/long/rent/bills/total/fee'));
            };

            this.getServiceBillDetail = function(id){
                return http.get(utils.getapi('/sales/admin/finance/long/rent/bills/' + id));
            };
            
            this.getLongTermRentServiceList = function(params){
                return http.get(utils.getapi('/sales/admin/finance/long/rent/bills'), {params: params});
            };

            this.getLongTermRentHistoryServiceList = function(params){
                return http.get(utils.getapi('/sales/admin/finance/long/rent/service/bills'), {params: params});
            };

            /* sales offline*/
            this.getBillsList = function(params){
                return http.get(utils.getapi('/sales/admin/leases/bills/lists'), {params: params});
            };

            this.getLeasesBillDetail = function(id, params){
                return http.get(utils.getapi('/sales/admin/leases/bills/' + id), {params: params});
            };

            this.collectionSalesOffline = function(id, params){
                return http.patch(utils.getapi('/sales/admin/leases/bills/' + id + '/collection'), params);
            };
            /* sales offline*/

            /* second rent invoice*/
            this.getShortRentInvoices = function(params){
                return http.get(utils.getapi('/sales/admin/finance/short/rent/invoices'), {params: params});
            };

            this.getShortRentInvoicesByIds = function(params){
                return http.get(utils.getapi('/sales/admin/finance/short/rent/invoices/ids'), {params: params});
            };

            this.createShortRentInvoiceApplicetion = function(params){
                return http.post(utils.getapi('/sales/admin/finance/short/rent/invoice/applications'), params);
            };

            this.resentShortRentInvoiceApplicetion = function(id, params){
                return http.patch(utils.getapi('/sales/admin/finance/short/rent/invoice/applications/' + id), params);
            };

            this.getShortRentInvoiceApplications = function(params){
                return http.get(utils.getapi('/sales/admin/finance/short/rent/invoice/applications'), {params: params});
            };

            this.getShortRentInvoiceApplicationById = function(id){
                return http.get(utils.getapi('/sales/admin/finance/short/rent/invoice/applications/' + id));
            };
            /* second rent invoice*/

            this.getInvoiceList = function(params){
                return http.get(utils.getapi('/sales/admin/invoices', 'ext_api'), {params: params});
            };

            this.getInvoice = function(id){
                return http.get(utils.getapi('/sales/admin/invoices/' + id, 'ext_api'));
            };

            this.getNotinvoiced = function(params){
                return http.get(utils.getapi('/sales/admin/orders/sales/notinvoiced'), {params: params});
            };

            this.editInvoice = function(params, id){
                return http.patch(utils.getapi('/sales/admin/invoices/' + id, 'ext_api'), params);
            };

            this.getUsers = function(params){
                return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getBuildings = function(params){
                return http.get(utils.getapi('/sales/admin/location/buildings'), {params: params});
            };

            this.setDelivery = function(id, params){
                return http.patch(utils.getapi('/sales/admin/invoices/' + id, 'ext_api'), params);
            };

            this.getCategory = function(){
                return http.get(utils.getapi('/sales/admin/finance/invoice/categories'));
            };

            this.getOrder = function(id){
                return http.get(utils.getapi('/sales/admin/orders/' + id));
            };

            this.getRoomTypes = function(){
                return http.get(utils.getapi('/rooms/types'));
            };

            this.getChannels = function(params){
                return http.get(utils.getapi('/payments/types'), {params: params});
            };

            this.getAccountInfo = function(){
                return http.get(utils.getapi('/sales/admin/finance/profiles/account'));
            };

            this.createAccountInfo = function(params){
                return http.post(utils.getapi('/sales/admin/finance/profiles/account'), params);
            };

            this.editAccountInfo = function(params, id){
                return http.patch(utils.getapi('/sales/admin/finance/profiles/account/' + id), params);
            };

            this.getInvoiceInfo = function(){
                return http.get(utils.getapi('/sales/admin/finance/profiles/invoice'));
            };

            this.createInvoiceInfo = function(params){
                return http.post(utils.getapi('/sales/admin/finance/profiles/invoice'), params);
            };

            this.editInvoiceInfo = function(params, id){
                return http.patch(utils.getapi('/sales/admin/finance/profiles/invoice/' + id), params);
            };

            this.getExpressInfo = function(){
                return http.get(utils.getapi('/sales/admin/finance/profiles/express'));
            };

            this.createExpressInfo = function(params){
                return http.post(utils.getapi('/sales/admin/finance/profiles/express'), params);
            };

            this.editExpressInfo = function(params, id){
                return http.patch(utils.getapi('/sales/admin/finance/profiles/express/' + id), params);
            };

            this.getRemarkList = function(params){
              return http.get(utils.getapi('/sales/admin/remarks'), {params: params});
            };

            this.createRemark = function(params){
              return http.post(utils.getapi('/sales/admin/remarks'), params);
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getFilterStatus = function(pageType){
                var response = [];
                if(pageType === 'longRent'){
                    response = [
                        {name: '待确认', value: 'pending'},
                        {name: '己确认', value: 'paid'},
                        {name: '已撤销', value: 'cancelled'}
                    ];
                }else if(pageType === 'longRentHistory'){
                    response = [
                        {name: '长租账单服务费', value: 'service_fee'}
                    ];
                }else if(pageType === 'secondRent'){
                    response = [
                        {name: '未结算', value: 'incomplete'},
                        {name: '待确认', value: 'pending'},
                        {name: '已结算', value: 'paid'}
                    ];
                }else if(pageType === 'withdrawalRecord'){
                    response = [
                        {name: '提现中', value: 'pending'},
                        {name: '提现成功', value: 'successful'},
                        {name: '提现失败', value: 'failed'}
                    ];
                }
                return response;
            };

            this.getInvoiceStatus = function(){
                return {
                    pending: '待开发票',
                    completed: '己开发票',
                    cancelled: '已撤销',
                    cancelled_wait: '待撤销'
                };
            };

            this.getSpaceOrderStatus = function(){
                return {
                    cancelled: '已取消',
                    completed: '已完成',
                    paid: '已付款',
                    unpaid: '未付款'
                };
            };

            this.getUnitDesc = function(){
                return {
                    hour: '小时',
                    day: '天',
                    month: '月'
                }
            };

            this.getInvoiceType = function(){
                return {
                    special: '增值税专用发票',
                    common: '增值税普通发票'
                };
            };

            this.getInvTypeList = function(){
                var response = [
                    {name: '增值税专用发票', value: 'special'},
                    {name: '增值税普通发票', value: 'common'}
                ];
                return response;
            };

            this.getInvStatusList = function(){
                var response = [
                    {name: '待开发票', value: 'pending'},
                    {name: '己开发票', value: 'completed'},
                    {name: '已撤销', value: 'cancelled'}
                ];
                return response;
            };

            this.getKeywordList = function(pageType){
                var response = [];
                if(pageType == 'invoice'){
                    response = [
                        {name: '订单号(是)', value: 'order_number'},
                        {name: '发票号(是)', value: 'invoice_number'},
                        {name: '用户昵称', value: 'user_name'}
                    ];
                }else if(pageType == 'salesOffline'){
                    response = [
                        {name: '账单号', value: 'bill'},
                        {name: '合同号', value: 'lease'},
                        {name: '用户昵称', value: 'user'}
                    ];
                }else if(pageType === 'longRentHistory'){
                    response = [
                        {name: '服务费账单号', value: 'service'},
                        {name: '合同号', value: 'lease'},
                        {name: '合同账单号', value: 'bill'}
                    ];
                }
                return response;
            };

            this.getDeliveryOption = function(){
                return{
                    invoice_id: '',
                    delivery_id: '',
                    delivery_company: '',
                    phone: '',
                    name: '',
                    zipCode: '',
                    address: ''
                };
            };

        };

        return ['http', 'utils', '$location', FinanceService];

    });

})(define);
