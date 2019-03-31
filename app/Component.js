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
        const searchHandler = () => {
            //empty search - do nothing
            if (this.search.value === '') return;
            //else send request data
            this.connector.notify({event: 'search', data: this.search.value.toLowerCase()});

            //search has just started
            if (!this.results.querySelector('.preloader')){
                removeChildren(this.results);
                this.results.appendChild(createPreloader());
            }
        };

        this.search.addEventListener('focus', () => this.el.classList.add('search_active'));
        this.search.addEventListener('blur', () => {
            if (this.search.value !== '') return;
            this.el.classList.remove('search_active')
        });

        this.search.addEventListener('input', searchHandler.bind(this));
        this.search.addEventListener('submit', e => e.preventDefault());


    }

    onTagClick(){
        const tagClickHandler = (e) => {
            e.preventDefault();
            if (!e.target.classList.contains('history-item')) return;
            //alt+click = delete tag
            if (e.altKey) this.connector.notify({event: 'remove_tag', data: e.target.dataset.movie});
            //only click = search 
            else this.connector.notify({event: 'search', data: e.target.dataset.movie});
        }
        
        this.history.addEventListener('click', tagClickHandler.bind(this));
    }

    onScroll(){
        const scrollHandler = () => {
            if (window.pageYOffset > this.search.getBoundingClientRect().bottom) {
                if (!this.el.classList.contains('scroll')) this.el.classList.add('scroll');
            } else {
                this.el.classList.remove('scroll');
            }
        }

        window.addEventListener('scroll', scrollHandler.bind(this));
    }

    onKeyDown(){
        //automatic focus on input when push any key
        const keyDownHandler = (e) => {
            if (e.keyCode < 32) return;
            this.search.focus();
        }

        document.addEventListener('keydown', keyDownHandler.bind(this));
    }

    onClear(){
        const clearButtonHandler = () => {
            this.search.focus();
            this.search.value = '';
        }

        this.el.querySelector('.clear').addEventListener('click', clearButtonHandler.bind(this));
    }

    //update renderes

    renderCards(moviesData){
        const container = document.createDocumentFragment();

        const cardsContainer = document.createElement('div');
        cardsContainer.classList.add('results__wrapper');

        moviesData.forEach(movie => {
            //custom element - see createMovieCard.js
            const movieCard = document.createElement('movie-card');

            movieCard.title = movie.title;
            movieCard.link = movie.link;
            movieCard.poster = movie.poster;
            movieCard.year = movie.year;
            movieCard.genre = movie.genre;
            movieCard.rate = movie.rate;

            cardsContainer.appendChild(movieCard);
        });
        container.appendChild(cardsContainer);

        removeChildren(this.results);
        this.results.appendChild(container);

    }

    renderResultsHeader(counts){
        const header = document.createElement('h2');
        header.classList.add('results__info');
        header.textContent = `Нашли ${counts} ${chooseEnding(counts)}`;
        this.results.insertBefore(header, this.results.firstElementChild);
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
        
        const header = document.createElement('h2');
        header.classList.add('results__info');
        header.textContent = `Мы не поняли о чем речь ¯\_(ツ)_/¯`;
        this.results.appendChild(header);
    }
}