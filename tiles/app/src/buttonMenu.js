define(function (require, exports, module) {

    var _ = require('./lodash');

    module.exports = function (buttons, selectedHandler) {
        _.each(buttons, function(button, i){
            button.$toggleGroupId = i;

            button._eventOutput.on('click', function(){
                if (!button.isSelected()){
                    return button.select();
                }
                _.each(buttons, function(button){
                    if (button.isSelected() && (button.$toggleGroupId != i)){
                        button.deselect();
                    }
                });

                if (selectedHandler){
                    selectedHandler(button, i);
                }
            })
        })
    };
});