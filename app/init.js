function init(){
    const model = new Model()
    const connector = new Connector(model);
    const mainComponent = new Component();

    connector.bindAction({event: 'search', handler: model.getMoviesData});
    connector.bindAction({event: 'remove_tag', handler: model.removeTag});

    connector.subscribe({update: 'tags', context: mainComponent, handler: mainComponent.renderTags});
    connector.subscribe({update: 'moviesData', context: mainComponent, handler: mainComponent.renderCards});
    connector.subscribe({update: 'counts', context: mainComponent, handler: mainComponent.renderResultsHeader});
    connector.subscribe({update: 'error', context: mainComponent, handler: mainComponent.renderError});

    mainComponent.init(connector);
    model.init(connector);

}