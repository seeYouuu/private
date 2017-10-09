/**
 *  Entrance of common ui
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define([
        './Alerts',
        './Autofocus',
        './SbDropdown',
        './SbNewDropdown',
        './SbMutiDropdown',
        './SbNewMutiDropdown',
        './SbPermissionDropdown',
        './SbSearchableDropdown',
        './SbHourSelector',
        './SbDaySelector',
        './SbGalleryImage',
        './ImageWithFallback',
        './SbImageWithFallback',
        './SbImageUploader',
        './SbCoverImageUploader',
        './SbInputNumber',
        './SbAvatar',
        './SbSelect',
        './SbTagSelector',
        './Confirm',
        './Error',
        './Info',
        './Modal',
        './RouteIndicator',
        './StRatio',
        './TopNavbar',
        './Pagination',
        './AngularComplete',
        './AutoComplete',
        './MutipleTags',
        './SbDatePicker',
        './SbDay',
        './SbHour',
        './SbAdminChat'
    ], function() {
        return [].slice.call(arguments);
    });

}(define));
