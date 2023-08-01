function skillsMember() {
    return {
        restrict: 'E',
        templateUrl: 'app/views/skills-member.html',
        controller: function($scope, $http) {
            $http.get("assets/json/skills.json").then(function(response) {
                $scope.skills = response.data;
            });
        }
    };
}