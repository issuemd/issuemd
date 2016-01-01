'use strict';

! function () {

    module.exports = function () {

        this.each(function (issue) {

            issue[0].updates.sort(function (a, b) {
                return (new Date(a.modified)) - (new Date(b.modified));
            });

        });

        return this;

    };

}();