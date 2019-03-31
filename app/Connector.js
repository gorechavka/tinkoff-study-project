class Connector{
    constructor(model){
        this.actions = {};
        this.subscribers = {};
        this.model = model;
    }

    //subscription on data updates
    subscribe({update, context, handler}){
        if (!this.subscribers[update]) this.subscribers[update] =  [];
        this.subscribers[update].push({
            update,
            context,
            handler
        });
    }

    //bind actions with data to some user events
    bindAction({event, handler}){
        this.actions[event] = handler.bind(this.model);
    }

    //trigger binded actions for corresponding events
    notify({event, data}){
        this.actions[event](data);
    }

    //trigger handlers, subscribed to corresponding data updates
    sendUpdates(nextState){
        for (let change in nextState){
            if (nextState[change]) {
                this.subscribers[change].forEach( s => s.handler.call(s.context, nextState[change]));
            }
        }
    }
}

