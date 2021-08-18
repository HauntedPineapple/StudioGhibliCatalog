//#region Head Image Changer
const headImage = document.querySelector("#logo");
const newImage = document.querySelector("#newArea");
const mediaQuery = window.matchMedia('(max-width: 800px)');

function changeLogo(e) {
    if (e.matches) { // If media query matches
        headImage.src = "images/wordmark_vertical.svg";
        newImage.innerHTML = '<img id="totoros" src="images/totoros.png" alt="More totoros"</img>';
    }
    else {
        headImage.src = "images/Studio_Ghibli_logo.svg";
        newImage.innerHTML = "";
    }
}
mediaQuery.addListener(changeLogo);
changeLogo(mediaQuery);
//#endregion

//#region locally store last search term
const prefix = "aam6039-";
const termKey = prefix + "term"
const searchText = document.querySelector("#searchTerm");
const storedTerm = localStorage.getItem(termKey);
if (storedTerm) {
    searchText.value = storedTerm;
} else {
    searchText.value = "";
}
searchText.onchange = e => { localStorage.setItem(termKey, e.target.value); };
//#endregion

window.onload = (e) => { document.querySelector("#searchButton").onclick = searchButtonClicked };
const parameterSelect = document.querySelector("#searchBy");
const filterSelect = document.querySelector("#filterBy");
let displayTerm = "";
let isLoading = false;

if (isLoading) {
    document.querySelector("#output").innerHTML = '<img src="images/loading.gif" alt="loading!">';
}

function searchButtonClicked() {
    if (!isLoading) {
        isLoading = true;
    }
    const GHIBLI_URL = "https://ghibliapi.herokuapp.com/films";
    let url = GHIBLI_URL;

    let term = document.querySelector("#searchTerm").value;
    displayTerm = term;
    // get rid of leading and trailing spaces. URLs do not work with spaces!
    term = term.trim();
    // encodeURIComponent() will escape characters like spaces 
    term = encodeURIComponent(term);
    url += "?&q=" + term;

    getData(url);
}

function getData(url) {
    let request = new XMLHttpRequest();

    request.onload = dataLoaded;
    request.onerror = dataError;

    // Open a new connection, using the GET request on the URL endpoint
    // this specific URL gets the film data from the API
    request.open('GET', url);
    request.send()
}

function dataLoaded(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.response);
    let results = [];

    if (parameterSelect.value == "title") {
        results = searchTitle(document.querySelector("#searchTerm").value, obj);
    }
    if (parameterSelect.value == "keyword") {
        results = searchKeyword(document.querySelector("#searchTerm").value, obj);
    }

    if (filterSelect.value == "date") {
        let from = parseInt(dateRangeFROM.value);
        let to = parseInt(dateRangeTO.value);

        //if the range is not valid, break and print error message
        if (to - from < 0) {
            document.querySelector("#output").innerHTML = "<b>ERROR! Please enter a <i>valid</i> date range!</b>";
            return;
        }
        results = searchDateRange(from, to, results);
    }

    if (filterSelect.value == "director") {
        results = searchDirector(document.querySelector("#directorSearch").value, results);
    }

    if (!results || results.length <= 0 || e.status < 200 || e.status >= 400) {
        let message = "<b>No results found for '" + displayTerm + "'</b>";
        message += "<p><i>Try different search parameters or adjusting your filters!</i></p>";
        document.querySelector("#output").innerHTML = message;
        return;
    }

    createResults(results);
    loading = false;
}
function dataError(e) {
    console.log("An error just occurred!");
    document.querySelector("#output").innerHTML = '<img src="images/s-404.png" alt="loading!"> <p>Oops, an error occured. Try again!</p>';
}

//#region Search framework
filterSelect.onchange = changeFilterFor;
function changeFilterFor(e) {
    if (filterSelect.value == "none") {
        document.querySelector("#filterInput").innerHTML = "";
    }

    if (filterSelect.value == "date") {
        //dynamically create a data dropdown that goes from 
        //the year Studio Ghibli was founded to current day
        let currentYear = (new Date()).getFullYear();
        let dropdown = "";
        for (let i = 1985; i <= currentYear; i++) {
            dropdown += '<option value="' + i + '">' + i + '</option>';
        }
        let dateSelector_1 = '<select name="dataRangeFROM" id="dateRangeFROM">';
        dateSelector_1 += dropdown; //fill element with the dropdown
        dateSelector_1 += '</select>';
        dropdown = ""; //reset
        let dateSelector_2 = '<select name="dataRangeTO" id="dateRangeTO">';
        for (let i = 1985; i < currentYear; i++) {
            dropdown += '<option value="' + i + '">' + i + '</option>';
        }
        //modify the last option so the current year is
        // the automatically selected option in the second dropdown
        dropdown += '<option value="' + currentYear + '" selected>' + currentYear + '</option>';
        dateSelector_2 += dropdown;
        dateSelector_2 += '</select>';

        document.querySelector("#filterInput").innerHTML = '<div id="dateRange">' + dateSelector_1 + ' to ' + dateSelector_2 + '</div>';
    }

    if (filterSelect.value == "director") {
        let dropdown = '<select name="directorSearch" id="directorSearch">';
        dropdown += '<option value="yoshifumi">Yoshifumi Kondō</option>'
        dropdown += '<option value="hayao">Hayao Miyazaki</option>'
        dropdown += '<option value="gorō">Gorō Miyazaki</option>'
        dropdown += '<option value="hiroyuki">Hiroyuki Morita</option>'
        dropdown += '<option value="yoshiaki">Yoshiaki Nishimura</option>'
        dropdown += '<option value="isao">Isao Takahata</option>'
        dropdown += '<option value="hiromasa">Hiromasa Yonebayashi</option>'
        dropdown += '<option value="Michaël">Michaël Dudok de Wit</option>'
        dropdown += '</select>';
        document.querySelector("#filterInput").innerHTML = dropdown;
    }
}

function searchKeyword(searchterm, resultsArray) {
    let returnedArr = [];
    searchterm = searchterm.trim();
    searchterm = searchterm.toLowerCase();
    resultsArray.forEach((movie) => {
        if (movie.description.toLowerCase().search(searchterm) != -1 || movie.title.toLowerCase().search(searchterm) != -1) {
            returnedArr.push(movie);
        }
    })
    return returnedArr;
}
function searchTitle(searchterm, resultsArray) {
    let returnedArr = [];
    searchterm = searchterm.trim();
    searchterm = searchterm.toLowerCase();
    resultsArray.forEach((movie) => {
        if (movie.title.toLowerCase().search(searchterm) != -1) {
            returnedArr.push(movie);
        }
    })
    return returnedArr;
}
function searchDateRange(fromDate, toDate, resultsArray) {
    let returnedArr = [];
    for (let i = fromDate; i <= toDate; i++) {
        resultsArray.forEach((movie) => {
            if (movie.release_date == i) {
                returnedArr.push(movie);
            }
        })
    }
    return returnedArr;
}
function searchDirector(directorName, resultsArray) {
    let returnedArr = [];
    resultsArray.forEach((movie) => {
        if (movie.director.toLowerCase().search(directorName) != -1) {
            returnedArr.push(movie);
        }
    })
    return returnedArr;
}
//#endregion

function createResults(data) {
    let outputArea = document.querySelector("#output");
    outputArea.innerHTML = ""; //clear out anything already there

    data.forEach((movie) => {
        let resultItem = document.createElement("div");
        resultItem.setAttribute("class", "resultItem");

        let description = document.createElement("div");
        description.setAttribute("class", "description");

        let movieIMG = document.createElement("img");
        movieIMG.setAttribute("class", "movieIMG");
        let imageURL = "images/" + movie.title.toLowerCase().replace(/ /g, "_");
        movieIMG.setAttribute("src", imageURL + ".jpg");
        movieIMG.setAttribute("alt", "the movie poster for " + movie.title);
        // movieIMG.setAttribute("data-toggle", "modal");
        // movieIMG.setAttribute("data-target", "#modalContainer");
        // let imageModal = document.body.querySelector("#imageModal");
        // imageModal.setAttribute("src", imageURL + ".jpg");

        const wikiURL = "https://en.wikipedia.org/wiki/";
        let link = document.createElement("a");
        newURL = wikiURL + movie.title.replace(/ /g, "_");
        link.setAttribute("href", newURL);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");

        let h3 = document.createElement("h3");
        h3.innerHTML = movie.title;
        link.appendChild(h3);

        let summary = document.createElement("p");
        summary.innerHTML = movie.description;
        summary.setAttribute("class", "summary");

        let moreInfo = document.createElement("div");
        moreInfo.setAttribute("class", "moreInfo");
        let date = document.createElement("p");
        date.innerHTML = "Date of release: " + movie.release_date;
        let director = document.createElement("p");
        director.innerHTML = "Director: " + movie.director;
        moreInfo.appendChild(date);
        moreInfo.appendChild(director);

        description.appendChild(link);
        description.appendChild(summary);
        description.appendChild(moreInfo);

        resultItem.appendChild(movieIMG);
        resultItem.appendChild(description);
        outputArea.appendChild(resultItem);
    })

    // //creates modal
    // let imageModalContainer = document.createElement("div");
    // imageModalContainer.setAttribute("id", "modalContainer");
    // imageModalContainer.setAttribute("class", "modal fade");
    // imageModalContainer.setAttribute("tab-index", "-1");
    // imageModalContainer.setAttribute("role", "dialog");
    // imageModalContainer.setAttribute("aria-labelledby", "myModalLabel");
    // imageModalContainer.setAttribute("aria-hidden", "true");
    // imageModalContainer.innerHTML = '<div class="modal-dialog"><div class="modal-content"> <div class="modal-body"><img src="//placehold.it/1000x600" class="img-responsive"></div></div></div>';
    // results.appendChild(imageModalContainer);
}