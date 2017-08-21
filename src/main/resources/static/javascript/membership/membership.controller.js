(function () {

    // BIG QUESTIONS: why is there so much output for the URL?

    /**Membership controller for the whole memberships page
     *@param $scope
     *    defining what is within the controller
     *@param  $window
     *    reference to the browser's window
     *@param dataProvider
     *     given the "loadData" function, it loads all the data to be viewed
     *@param dataUpdater
     *    Using the CRUD operators this would be the update of CRUD
     **/
    function MembershipJsController($scope, $window, $filter, dataProvider, dataUpdater) {

        $scope.currentUsername = "";
        $scope.membersList = [];
        $scope.optInList = [];
        $scope.optOutList = [];
        $scope.optedIn = [];
        $scope.optedOut = [];
        $scope.loading = true;

        //these will be place holders for now
        $scope.pagedItemsMembersList=[];
        $scope.pagedItems2=[];
        $scope.pagedItemsOptInList=[];
        $scope.pagedItemsOptedInList=[];
        $scope.pagedItemsOptedOutList=[];
        $scope.gap=2;

        $scope.itemsPerPage = 25;
        $scope.currentPageOptIn = 0;
        $scope.currentPageOptOut = 0;
        $scope.currentPageCancelOptIn = 0;
        $scope.currentPageCancelOptOut = 0;

        $scope.initCurrentUsername = function() {
            $scope.currentUsername = $window.document.getElementById("name").innerHTML;
        };

        $scope.getCurrentUsername = function() {
            return $scope.currentUsername;
        };

        /**init is something that is usually called at the start of something
         * so calling init would be called at the start
         **/
        $scope.init = function () {
            $scope.initCurrentUsername();
            var groupingURL = "api/groupings/" + $scope.getCurrentUsername() + "/myGroupings";
            /**Loads Data into a membersList
             *                  optOutList
             *                  optInList
             *                  optedIn
             *                  optedOut
             *takes all of that data and puts them into pages as called by "grouptToPages"
             **/
            dataProvider.loadData(function (d) {
                console.log(d);
                $scope.membersList = d.groupingsIn;
                $scope.optOutList = d.groupingsToOptOutOf;
                $scope.optInList = d.groupingsToOptInTo;
                $scope.optedIn = d.groupingsOptedInTo;
                $scope.optedOut = d.groupingsOptedOutOf;

                $scope.pagedItemsMembersList = $scope.groupToPages($scope.membersList,$scope.pagedItemsMembersList);
                // $scope.pagedItems2 = $scope.groupToPages($scope.optOutList);
                $scope.pagedItemsOptInList = $scope.groupToPages($scope.optInList, $scope.pagedItemsOptInList);
                $scope.pagedItemsOptedInList = $scope.groupToPages($scope.optedIn,$scope.pagedItemsOptedInList);
                $scope.pagedItemsOptedOutList = $scope.groupToPages($scope.optedOut,$scope.pagedItemsOptedOutList);

                if($scope.optedIn.length === 0)
                {
                    $scope.optedIn.push({'name': "NO GROUPINGS TO CANCEL OPT IN TO"});
                }
                if ($scope.optedOut.length === 0) {
                    $scope.optedOut.push({'name': "NO GROUPINGS TO CANCEL OPT OUT"});
                }
                if ($scope.optInList.length === 0) {
                    $scope.optInList.push({'name': "NO GROUPINGS TO OPT IN TO"});
                }

                $scope.loading = false;
            }, groupingURL);
        };


        /** Adds user to the exclude group.
         * Sends back an alert saying if it failed
         * other than that, it will go through with opting out
         *
         **/
        $scope.optOut = function (index) {
            console.log(index);
            var optOutURL = "api/groupings/" + $scope.membersList[index].path + "/" + $scope.getCurrentUsername() + "/optOut";
            console.log(optOutURL);
            dataUpdater.updateData(function (d) {
                console.log(d);
                if (d[0].resultCode.includes("FAILURE")) {
                    console.log("Failed to opt out");
                    alert("Failed to opt out");
                }
                else {
                    $scope.loading = true;
                    $scope.init();
                }
            }, optOutURL);
        };
8
        /** Adds user to the include group
         * initializes using the init function.
         *@param index - grouping
         *takes in a grouping so it knows which group it is going into for the path
         **/
        $scope.optIn = function (index) {
            var optInURL = "api/groupings/" + $scope.optInList[index].path + "/" + $scope.getCurrentUsername() + "/optIn";
            console.log(optInURL);
            dataUpdater.updateData(function (d) {
                $scope.loading = true;
                $scope.init();
            }, optInURL);
        };

        /** Cancel user opt into a grouping
         *   Calls the URL "cancelOptIn" and gives it the data for the update in the
         *   CRUD operation
         *   @param index - grouping
         *   takes in a grouping so it knows which group it is going into for the path
         **/
        $scope.cancelOptIn = function (index) {
            var cancelInURL = "api/groupings/" + $scope.optedIn[index].path + "/" + $scope.getCurrentUsername() + "/cancelOptIn";
            console.log(cancelInURL);
            dataUpdater.updateData(function (d) {
                $scope.loading = true;
                $scope.init();
            }, cancelInURL);
        };

        /** Cancels the opt out
         * Calls the URL "cancelOptOut" and gives it the data for the update in the
         * CRUD operation
         *@param index - grouping
         *takes in a grouping so it knows which group it is going into for the path
         **/
        $scope.cancelOptOut = function (index) {
            var cancelOutURL = "api/groupings/" + $scope.optedOut[index].path + "/" + $scope.getCurrentUsername() + "/cancelOptOut";
            console.log(cancelOutURL);
            dataUpdater.updateData(function (d) {
                $scope.loading = true;
                $scope.init();
            }, cancelOutURL);
        };
        /**gives you a true or false if it finds the match
        **@param haystack - the thing to be checked
        **@param needle - the check against
        **
        **/
        var searchMatch = function (haystack, needle) {
            if (!needle) {
                return true;
            }
            return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
        };

        /**searches through the array to find matches and then fixes the list
        **@param list - gives the whole list to sort out
        **@param whatList - it gives you the list you need to search through
        **@param whatQuery - it gives the search bar its seperate search function.
        **/
        $scope.search = function (list, whatList,whatQuery) {
            var query = "";
            switch(whatQuery){
                case 'firstQuery':
                    query = $scope.queryMembers;
                    break;
                case 'secondQuery':
                    query = $scope.queryOptIn;
                    break;
                case 'thirdQuery':
                    query = $scope.queryOptedOut;
                    break;
                case 'fourthQuery':
                    query = $scope.queryOptedIn;
                    break;
            }
            $scope.filteredItems = [];
            $scope.filteredItems = $filter('filter')(list, function (item) {
                if(searchMatch(item.name, query)){
                    return true;
                }
            });
            console.log($scope.filteredItems);
            page = 0;
            // now group by pages
            var emptyList = [];
            switch(whatList){
                case 'Paged_1':
                    $scope.pagedItemsMembersList = $scope.groupToPagesChanged(emptyList);
                    break;
                case 'Paged_3':
                    $scope.pagedItemsOptInList = $scope.groupToPagesChanged(emptyList);
                    break;
                case 'Paged_4':
                    $scope.pagedItemsOptedInList = $scope.groupToPagesChanged(emptyList);
                    break;

                case 'Paged_5':
                    $scope.pagedItemsOptedOutList = $scope.groupToPagesChanged(emptyList);
                    break;
            }
        };


         //Disables opt in button if there are no groupings to opt into.
         $scope.disableOptIn = function (index) {
             for (var i = 0; i < $scope.membersList.length; i++) {
                 if ($scope.membersList[i].name === $scope.optInList[index].name) {
                     return true;
                 }
             }
         };

         //Disable button if list is empty
         $scope.disableButton = function (type, index) {
             var list = type[index];
             return list.name.includes("NO GROUPINGS TO");
         };

         $scope.tooltipText = function (index) {
             return ($scope.disableOptOut(index)) ? 'You cannot opt out of this grouping' : '';
         };
         $scope.disableOptOut = function (index) {
             for (var i = 0; i < $scope.optOutList.length; i++) {
                 if ($scope.membersList[index].name === $scope.optOutList[i].name) {
                    // console.log($scope.optOutList[i].name);
                     return false;
                 }
             }
             return true;
         };

        /**groups all the items to pages
         have separate arrays (hopefully)
         @param theList - .
         @param pagedList - .
         **/
        $scope.groupToPages=function(theList , pagedList){
            var pagedList = [];
            for(var i = 0; i < theList.length ; i++){
                if(i % $scope.itemsPerPage === 0){
                    pagedList[Math.floor(i/$scope.itemsPerPage)] = [ theList[i]];
                }else{
                    pagedList[Math.floor(i/$scope.itemsPerPage)].push( theList[i]);
                }
            }
            return pagedList;
        };



        /**shows the range between the start and end
         *checks for negative numbers
         *
         * @param size
         * @param start
         * @param end
         *  all the param are self explanatory
         * @return ret
         *     everything within the range of start,
         *       end, and making sure it's that size
         **/
        $scope.range = function (size, start, end) {
            var ret = [];

            if (size < end) {
                end = size;
                // start = size - $scope.gap;
            }
            if (start < 0) {
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };


        //might make this into my one function
        $scope.currentPage = function(pages){
            switch(pages){
                // Cases for Cancel Opt In Pagination
                case 'Cancel Opt In Next':
                    if ($scope.currentPageCancelOptIn < $scope.pagedItemsOptedInList.length - 1) {
                        $scope.currentPageCancelOptIn = $scope.currentPageCancelOptIn + 1;
                    }
                    break;

                case 'Cancel Opt In Set':
                    $scope.currentPageCancelOptIn = this.n;
                    break;

                case 'Cancel Opt In Prev':
                    if ($scope.currentPageCancelOptIn > 0) {
                        $scope.currentPageCancelOptIn--;
                    }
                    break;
                case 'Cancel Opt In First':
                    if ($scope.currentPageCancelOptIn > 0) {
                        $scope.currentPageCancelOptIn = 0;
                    }
                    break;
                case 'Cancel Opt In Last':
                    if ($scope.currentPageCancelOptIn > 0) {
                        $scope.currentPageCancelOptIn = $scope.pagedItemsOptedInList.length -1;
                    }
                    break;

                    //Cases for Cancel Opt Out Pagination
                case 'Cancel Opt Out Next':
                    if ($scope.currentPageCancelOptOut < $scope.pagedItemsOptedOutList.length - 1) {
                        $scope.currentPageCancelOptOut = $scope.currentPageCancelOptOut + 1;
                    }
                    break;

                case 'Cancel Opt Out Set':
                    $scope.currentPageCancelOptOut = this.n;
                    break;

                case 'Cancel Opt Out Prev':
                    if ($scope.currentPageCancelOptOut > 0) {
                        $scope.currentPageCancelOptOut--;
                    }
                    break;
                case 'Cancel Opt Out First':
                    if ($scope.currentPageCancelOptOut > 0) {
                        $scope.currentPageCancelOptOut = 0;
                    }
                    break;
                case 'Cancel Opt Out Last':
                    if ($scope.currentPageCancelOptOut >= 0) {
                        $scope.currentPageCancelOptOut = $scope.pagedItemsOptedOutList.length -1;
                    }
                    break;

                    //Cases  for Opt out in Pagination

                case 'Page Opt Out Next':
                    if ($scope.currentPageOptOut < $scope.pagedItemsMembersList.length - 1) {
                        $scope.currentPageOptOut = $scope.currentPageOptOut + 1;
                    }
                    break;

                case 'Page Opt Out Set':
                    $scope.currentPageOptOut = this.n;
                    break;

                case 'Page Opt Out Prev':
                    if ($scope.currentPageOptOut > 0) {
                        $scope.currentPageOptOut--;
                    }
                    break;
                case 'Page Opt In First':
                    if ($scope.currentPageOptOut > 0) {
                        $scope.currentPageOptOut = 0;
                    }
                    break;
                case 'Page Opt Out Last':
                    if ($scope.currentPageOptOut >= 0) {
                        $scope.currentPageOptOut = $scope.pagedItemsMembersList.length -1;
                    }
                    break;

                // Cases for Opt in Pagination
                case 'Page Opt In Next':
                    if ($scope.currentPageOptIn < $scope.pagedItemsOptInList.length - 1) {
                        $scope.currentPageOptIn = $scope.currentPageOptIn + 1;
                    }
                    break;

                case 'Page Opt In Set':
                    $scope.currentPageOptIn = this.n;
                    break;

                case 'Page Opt In Prev':
                    if ($scope.currentPageOptIn > 0) {
                        $scope.currentPageOptIn--;
                    }
                    break;
                case 'Page Opt In First':
                    if ($scope.currentPageOptIn > 0) {
                        $scope.currentPageOptIn = 0;
                    }
                    break;
                case 'Page Opt In Last':
                    if ($scope.currentPageOptIn >= 0) {
                        $scope.currentPageOptIn = $scope.pagedItemsOptInList.length -1;
                    }
                    break;

            }
        };

    }

    membershipApp.controller("MembershipJsController", MembershipJsController);
})();
