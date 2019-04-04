'use strict'
function createConnector(model){
    let actions = {},
        subscribers = {};

    function init(){
        model.addListener(update);
        model.init()
    }

    function subscribe({update, handler}){
        if (!subscribers[update]) subscribers[update] =  [];
        subscribers[update].push({
            update,
            handler
        });
    }

    function bindAction({event, handler}){
        actions[event] = handler;
    }

    function notify({event, data}){
        actions[event](normalize(data));
    }

    function update(newState){
        for (let change in newState) {
            if (newState[change]) {
                subscribers[change].forEach( s => s.handler(newState[change]));
            }
        }
    }

    return {
        init,
        subscribe,
        bindAction,
        notify,
        update
    }

}