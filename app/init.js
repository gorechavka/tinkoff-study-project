function init(){
    const model = createModel();
    const connector = createConnector(model);
    const component = createComponent(connector);

    connector.bindAction({event: 'search', handler: model.getMoviesData});
    connector.bindAction({event: 'remove_tag', handler: model.removeTag});

    connector.subscribe({update: 'loading', handler: component.showPreloader});

    connector.subscribe({update: 'tags', handler: component.renderTags});
    connector.subscribe({update: 'moviesData', handler: component.renderCards});
    connector.subscribe({update: 'counts', handler: component.renderResultsHeader});
    connector.subscribe({update: 'error', handler: component.renderError});

    connector.init();
}