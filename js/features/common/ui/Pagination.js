/**
 *
 *  The pagination.
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 **/
(function(define) {
    'use strict';

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('pagination');
            };

            this.constructor = function() {

                this.lang = {
                    zh: {
                        GO: '跳转',
                    },
                    en: {
                        GO: 'Go',
                    }
                };
            };

            this.run = function() {
                var features = require.toUrl('features');

                var dir = function($compile, events) {
                    return {
                        restrict: 'AE',
                        transclude: true,
                        scope: {
                            'option': '=',
                            'name': '@',
                            'goPage': '&onPage'
                        },
                        link: function($scope, element, attrs) {
                            var name = $scope.name || 'totalNum';
                            var paginationSize = 5;
                            $scope.page = {
                                index: '',
                                pageNum: ''
                            };

                            var getIndex = function() {
                                if ($scope.option[name] <= 0) {
                                    return $scope.option.pageIndex;
                                }

                                if (!$scope.$currentIndex) {
                                    return 1;
                                }

                                if ($scope.$currentIndex > getTotalPages()) {
                                    return getTotalPages();
                                }
                                return $scope.$currentIndex;
                            };

                            var getTotalPages = function() {
                                $scope.page.pageNum = Math.ceil($scope.option[name] / $scope.option.pageSize);
                                return Math.ceil($scope.option[name] / $scope.option.pageSize);
                            };

                            var getPageIndex = function() {
                                return Math.ceil(getIndex() / paginationSize);
                            };

                            var getShowingPages = function() {
                                var showingPages = [];
                                var start = getPageIndex() > 0 ? (getPageIndex() * paginationSize - paginationSize + 1) : 0;
                                if (start === 0) {
                                    return showingPages;
                                }
                                var end = start + paginationSize - 1 > getTotalPages() ? getTotalPages() : (start + paginationSize - 1);

                                for (var i = start; i <= end; i++) {
                                    showingPages.push({
                                        num: i,
                                        selected: i === getIndex()
                                    });
                                }
                                return showingPages;
                            };

                            $scope.goToPage = function(index) {
                                $scope.$currentIndex = index;
                                $scope.page.index = index;
                                $scope.pages = getShowingPages();
                                $scope.goPage({
                                    index: index
                                });
                            };

                            $scope.go = function() {
                                $scope.page.index = parseInt($scope.page.index);
                                if ($scope.page.index) {
                                    if ($scope.page.index > getTotalPages()) {
                                        $scope.page.index = getTotalPages();
                                    }
                                } else {
                                    $scope.page.index = 1;
                                }
                                $scope.$currentIndex = $scope.page.index;
                                $scope.pages = getShowingPages();
                                $scope.goPage({
                                    index: $scope.page.index
                                });
                            };

                            events.on('pagination', function() {
                                $scope.page.index = 1;
                                $scope.$currentIndex = 1;
                                $scope.pages = getShowingPages();
                                $scope.goPage({
                                    index: $scope.page.index
                                });
                            }, true);

                            $scope.pages = getShowingPages();
                            $scope.$currentIndex = getIndex();
                            $scope.$totalPages = getTotalPages();

                            $scope.show = false;
                            $scope.pageConfig = [10, 20, 50, 100];

                            $scope.$watch('option', function(newValue, oldValue, scope) {
                                $scope.pages = getShowingPages();
                                $scope.$currentIndex = getIndex();
                                $scope.$totalPages = getTotalPages();
                            }, true);
                        },
                        templateUrl: features + '/common/ui/Pagination.html'
                    };
                };

                this.mod.directive('pagination', ['$compile', 'events', dir]);
            };

        });

        return Feature;

    });


})(define);
