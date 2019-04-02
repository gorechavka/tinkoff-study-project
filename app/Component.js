class Component{
    constructor(){
        this.el = document.querySelector('.main');
        this.search = document.getElementById('search');
        this.history = document.querySelector('.search-box__history');
        this.results = document.querySelector('.results');
    }

    init(connector){
        //init inner eventListeners
        this.initEvents();
        this.connector = connector;

    }

    initEvents(){
        this.getEventHandlers().forEach( handler => handler.call(this));
    }

    getEventHandlers(){
        return [this.onScroll, this.onSearch, this.onTagClick, this.onKeyDown, this.onClear]
    }

    //client event handlers
    onSearch(){
        let searchHandler = () => {
            //empty search - do nothing
            if (this.search.value === '') return;
            //else send request data
            this.connector.notify({event: 'search', data: this.search.value.toLowerCase()});
        };

        /*
        изначально ограничивал поиск по инпуту вот так:

        searchHandler = debounce(searchHandler, 1000);

        */ 

        this.search.addEventListener('focus', () => this.el.classList.add('search_active'));
        this.search.addEventListener('blur', () => {
            if (this.search.value !== '') return;
            this.el.classList.remove('search_active')
        });

        this.search.addEventListener('input', searchHandler);
        this.search.addEventListener('submit', e => e.preventDefault());


    }

    onTagClick(){
        const tagClickHandler = (e) => {
            e.preventDefault();
            if (!e.target.classList.contains('history-item')) return;
            if (e.target === this.history.firstElementChild) return;
            //alt+click = delete tag
            if (e.altKey) this.connector.notify({event: 'remove_tag', data: e.target.dataset.movie});
            //only click = search 
            else {
                this.connector.notify({event: 'search', data: e.target.dataset.movie});
                this.search.value = e.target.dataset.movie
            }
        }
        
        this.history.addEventListener('click', tagClickHandler);
    }

    onScroll(){
        const scrollHandler = () => {
            if (window.pageYOffset > this.search.getBoundingClientRect().bottom) {
                if (!this.el.classList.contains('scroll')) this.el.classList.add('scroll');
            } else {
                this.el.classList.remove('scroll');
            }
        }

        window.addEventListener('scroll', scrollHandler);
    }

    onKeyDown(){
        //automatic focus on input when push any key
        const keyDownHandler = (e) => {
            if (e.keyCode < 32) return;
            this.search.focus();
        }

        document.addEventListener('keydown', keyDownHandler);
    }

    onClear(){
        const clearButtonHandler = () => {
            this.search.focus();
            this.search.value = '';
        }

        this.el.querySelector('.clear').addEventListener('click', clearButtonHandler);
    }

    //update renderes

    showPreloader(){
        if (!this.preloader){
            removeChildren(this.results);
            this.preloader = createPreloader();
            this.results.appendChild(this.preloader);
        }
    }

    hidePreloader(){
        if (this.preloader) {
            this.preloader.remove();
            this.preloader = null;
        }
    }

    renderCards(moviesData){
        const container = document.createDocumentFragment();

        if (this.cardsContainer) this.cardsContainer.remove();
        this.cardsContainer = document.createElement('div');
        this.cardsContainer.classList.add('results__wrapper');

        moviesData.forEach(movie => {
            //custom element - see createMovieCard.js
            const movieCard = document.createElement('movie-card');

            movieCard.title = movie.title;
            movieCard.link = movie.link;
            movieCard.poster = movie.poster;
            movieCard.year = movie.year;
            movieCard.genre = movie.genre;
            movieCard.rate = movie.rate;

            this.cardsContainer.appendChild(movieCard);
        });
        container.appendChild(this.cardsContainer);

        this.hidePreloader();

        this.results.appendChild(container);

    }

    renderResultsHeader(counts){
        if (this.header) this.header.remove();
        this.header = document.createElement('h2');
        this.header.classList.add('results__info');
        this.header.textContent = `Нашли ${counts} ${chooseEnding(counts)}`;
        this.results.insertBefore(this.header, this.results.firstElementChild);
    }

    renderTags(tags){
        removeChildren(this.history);
        const tagsContainer = document.createDocumentFragment();
        tags.forEach( tag => {
            const newTag = document.createElement('a');
            newTag.classList.add('history-item');
            newTag.href = `/?search=${tag}`;
            newTag.target = '_blank';
            newTag.textContent = tag;
            newTag.dataset.movie = tag;
            tagsContainer.appendChild(newTag);
        })
        this.history.appendChild(tagsContainer);
    }

    //when nothing found
    renderError(error){
        if (!error) return;

        removeChildren(this.results); 
        if (this.search.value === '') return;

        if (this.header) this.header.remove();
        this.header = document.createElement('h2');
        this.header.classList.add('results__info');
        this.header.textContent = `Мы не поняли о чем речь ¯\_(ツ)_/¯`;
        this.results.appendChild(this.header);
    }
}