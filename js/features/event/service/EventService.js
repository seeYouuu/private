/**
 *  Defines the EventService
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the EventService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */

        var EventService = function(http, utils, $location) {
            
            this.getFileServer = function(params){
                return http.get(utils.getapi('/fileserver/url'), {params: params});
            };

            this.deleteComment = function(commentid){
                return http.delete(utils.getapi('/sales/admin/events/comments/' + commentid));
            };
            
            this.getEventComments = function(eventId, params){
                return http.get(utils.getapi('/sales/admin/events/' + eventId + '/comments'), {params: params});
            };

            this.editEvent = function(eventId, params){
                return http.put(utils.getapi('/sales/admin/events/' + eventId), params);
            };

            this.getRegistUser = function(eventId, registrationId){
                return http.get(utils.getapi('/sales/admin/events/' + eventId + '/registrations/' + registrationId));
            };

            this.verifyUsesr = function(params, ids){
                return http.patch(utils.getapi('/sales/admin/events/registrations'),  params, {params: ids});
            };

            this.setEventStatus = function(eventid,params){
                return http.patch(utils.getapi('/sales/admin/events/' + eventid), params);
            };

            this.getCities = function(){
                return http.get(utils.getapi('/sales/admin/location/cities?all'));
            };

            this.getBuildings = function(params){
                return http.get(utils.getapi('/location/buildings'), {params: params});
            };

            this.addEvent = function(params){
                return http.post(utils.getapi('/sales/admin/events'), params);
            };

            this.deleteEvent = function(eventid){
                return http.delete(utils.getapi('/sales/admin/events/' + eventid));
            };

            this.getEvent = function(eventid){
                return http.get(utils.getapi('/sales/admin/events/' + eventid));
            };

            this.getRooms = function(params){
                return http.get(utils.getapi('/sales/admin/rooms'), {params: params});
            };

            this.getEventList = function(params){
                return http.get(utils.getapi('/sales/admin/events'), {params: params});
            };

            this.getRegistrations = function(eventid, params){
                return http.get(utils.getapi('/sales/admin/events/' + eventid + '/registrations'), {params: params});
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

        };

        return ['http', 'utils', '$location', EventService];

    });

})(define);
