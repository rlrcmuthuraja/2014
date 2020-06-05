E.browsercheck = (function() {

    var inputs = {};

    function inputCheck() {
        return inputs;
    }

    function checkDateTimeLocal() {
        var i;

        i = document.createElement('input');
        i.setAttribute("type", "datetime-local");
        return (i.type !== 'text');
    }

    function checkDateTime() {
        var i;

        i = document.createElement('input');
        i.setAttribute("type", "datetime");
        return (i.type !== 'text');
    }

    function checkDate() {
        var i;

        i = document.createElement('input');
        i.setAttribute("type", "date");
        return (i.type !== 'text');
    }

    function checkTime() {
        var i;

        i = document.createElement('input');
        i.setAttribute("type", "time");
        return (i.type !== 'text');
    }

    function checkInput(type) {
        var i;

        i = document.createElement('input');
        i.setAttribute("type", type);
        return (i.type === type);
    }

    return {
        init: function () {
            inputs['datetime-local'] = checkInput('datetime-local');
            inputs['datetime'] = checkInput('datetime');
            inputs['date'] = checkInput('date');
            inputs['time'] = checkInput('time');

            if (!(inputCheck())['datetime']) {
                var jqUI,
                    a;
//                jqUI = document.createElement('script');
//                jqUI.src = 'jquery-ui-1.10.2.custom.min.js';
//                jqUI.type = 'text/javascript';
//                a = document.getElementsByTagName('script')[0];
//                a.parentNode.insertBefore(jqUI, a);
                $(document).ready(function() {
                    $('.ok').on('click focus', function () {
                        console.log('hey you');
                    });
                    $('.datepicker').on('click', function () {
                        event.preventDefault;
                        $(this).datepicker();
                    });
                });

//                $('.datepicker').on('click', function () {
//                    event.preventDefault;
//                    $(this).datepicker();
//                });
            }
        },

        inputs: inputCheck.curry()
    }
}());