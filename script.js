/**********************************
You Tube Search
All code is in vanilla jS
**********************************/

var searchBar   = document.querySelector('.search-bar');        // variable for search bar
var searchBtn   = document.querySelector('.search-btn');        // variable for search button
var nextPageBtn = document.querySelector('.next-page-btn');     // variable for next page button
var prevPageBtn = null;                                                // variable for prev page button, leave 'undefined'
var mainContain = document.querySelector('.main-contain');      // mainContain is a div holding all videos
var display = document.querySelector('.display-size');          // variable for the display size drop down menu
var userQ;                                                      // variable for users search query term
var nPage;                                                      // variable for current value of next page from you tube api
var pPage;                                                      // variable for current value of prev page from you tube api
var pageTrack = [];                                             // array containing values of each page
var numResult = 3;                                              // # of videos to show per page


// when user enters a search...
searchBtn.addEventListener('click', function() {
    mainContain.innerHTML = '';                                 // remove all videos currently in the mainContain div
    userQ = searchBar.value;                                    // store user's query into variable
    search(userQ, false, false);                                // call the search function with users query, and 
})                                                              // boolean false for we don't want next page nor previous page.
                                                                // essentiall this grabs page 1 results of user's search.

// when user requests next page of results...
nextPageBtn.addEventListener('click', function() {
    mainContain.innerHTML = '';                                 // remove all videos currently in the mainContain div
    search(userQ, true, false);                                 // call search function with user's query
})                                                              // boolean true for we want the next page of results
                                                                // boolean false on wanting the previous page of results

// when user selects a different display size...

display.addEventListener('change', function() {
    mainContain.innerHTML = '';                                 // clear out all videos from mainContain div
    
    for (var x = 0; x < pageTrack.length; x++) {                // cycle through each page in pageTrack array
        if ( nPage === pageTrack[x]) {                          // when current next Page value is matched in the array
            nPage = pageTrack[x-1];                             // store the value of our CURRENT page
            search(userQ, true, false);                         // call the search function to retrieve our current page of results
        }
    }
})

// function is called from inline JS in our HTML file with onload event
function loadAPI() {
    gapi.client.load('youtube', 'v3')                                           // get API for YouTube V3
        .then(function() {                                                      // call 'success' function
            gapi.client.setApiKey('AIzaSyCMaFTFFidsXIteOavc8Qd9abNq-8muPf0');   // set API EY
             if (typeof userQ !== "undefined") {                                // if a query term is already set, 
                search(userQ, false, false);                                    // search using that term
             }
             else {
                userQ = 'grumpy cat';                                           // else look up grumpy cat by default   
                search( userQ, false, false);
             }
        })
}

// search function, this function is what pulls videos from youtube API
function search(queryTerm, wantNext, wantPrev) {            // called with search term, and boolean arguments 
                                                            // for if we want the next page or prev page of results
    
    if(wantNext) {                                          // if want next page of results
        var req = gapi.client.youtube.search.list({
            part: 'snippet, id',
            maxResults: numResult, 
            q: queryTerm,
            type: 'video',
            pageToken: nPage                                // set API "pageToken" property equal to value of the next page
        });
    }
    else if(wantPrev) {                                     // if want previous page of results
        var req = gapi.client.youtube.search.list({
            part: 'snippet, id',
            maxResults: numResult, 
            q: queryTerm,
            type: 'video',
            pageToken: pPage                                // set API "pageToken" property equal to value of the previous page
        });
    }
    else {
        var req = gapi.client.youtube.search.list({         // else set request to not include "pageToken"
            part: 'snippet',                                // this returns page 1 of results
            maxResults: numResult, 
            q: queryTerm,
            type: 'video'   
        });
    }

    req.then(                                               // on success, call a function to handle our response data
        function(resp) {                                        
            nPage = resp.result.nextPageToken;              // there will always be a next page value in the results, 
            pageTrack.push(nPage);                          // so save that value to our nPage variable & pageTrack array

            if (resp.result.prevPageToken) {                // if there is a previous page property,
                pPage = resp.result.prevPageToken;          // save that value to pPage variable

                
                // At first, there isn't a prev page button in the DOM, and the prevPageBtn will be null.
                // When a user goes to page 2 of results, this if statement will create/insert a button into the DOM
                // and assign an event handler to call for a search for the previous page of results.
                // Using an if statement should ensure that this button is created once, and not on every subsequent page 2, 3, 4, 5, etc...
                if ( prevPageBtn === null ) {
                    prevPageBtn = document.createElement('button');
                    prevPageBtn.textContent = 'Previous';
                    document.querySelector('.panel-navigate').insertBefore( prevPageBtn, nextPageBtn);

                    prevPageBtn.addEventListener('click', function() {
                        mainContain.innerHTML = '';
                        search(userQ, false, true);
                    });
                }               
            }
            // Else when we're on page 1, so there is no previous page property in the response data.
            // Check that prevPageBtn does not have value = null, this means there is a prev page button in the DOM.
            // Then remove the previous page button from the DOM & re-set the prevPageBtn variable to value of null.
            else {
                if(prevPageBtn !== null) {
                    document.querySelector('.panel-navigate').removeChild(prevPageBtn); 
                    prevPageBtn = null;
                }               
            }

            // this for loop gets all details of the videos and displays them in the DOM
            for (var x = 0; x < resp.result.items.length; x++) {

                
                // vidDiv is a div element for each video result we find
                var vidDiv = document.createElement('div');
                vidDiv.classList.add('vid');

                // videoTitle is a element for the video's title
                var videoTitle = document.createElement('h2');
                videoTitle.innerHTML = resp.result.items[x].snippet.title; 

                // video user is a anchor tag linking to the youtube channel's main page
                var videoUser = document.createElement('a');
                videoUser.innerHTML = '<small>By: ' + resp.result.items[x].snippet.channelTitle + '</small>';
                videoUser.href = 'https://www.youtube.com/channel/' + resp.result.items[x].snippet.channelId;

                // videoDate is a p element to display the video's publish date
                var videoDate = document.createElement('p');
                videoDate.innerHTML = '<small>Date: ' + resp.result.items[x].snippet.publishedAt.substr(0, 10) + '</small>';

                // videoDesc is a p element to display the video's description
                var videoDesc = document.createElement('p');
                videoDesc.innerHTML = '<small>Desc: ' + resp.result.items[x].snippet.description + '</small>';

                // videoWin is a iframe element to hold the actual youtube video for playback
                var videoWin = document.createElement('iframe');
                videoWin.src = 'https://www.youtube.com/embed/' + resp.result.items[x].id.videoId;              

                
                // display.value is the selection # from the video size drop down menu.
                // switch statement will set width/height according to what the user sets
                switch(display.value) {
                    case '1':
                        videoWin.setAttribute('width', 864);
                        videoWin.setAttribute('height', 486);
                        break;
                    case '2':
                        videoWin.setAttribute('width', 960);
                        videoWin.setAttribute('height', 540);
                        break;
                    case '3':
                        videoWin.setAttribute('width', 1024);
                        videoWin.setAttribute('height', 576);
                        break;
                    case '4':
                        videoWin.setAttribute('width', 1280);
                        videoWin.setAttribute('height', 720);
                        break;
                    case '5':
                        videoWin.setAttribute('width', 1366);
                        videoWin.setAttribute('height', 768);
                        break;
                    case '6':
                        videoWin.setAttribute('width', 1600);
                        videoWin.setAttribute('height', 900);
                        break;
                }

                // infoPanel will be a div holding all of the video information we pulled.
                var infoPanel = document.createElement('div');
                infoPanel.classList.add('infopanel')
                infoPanel.appendChild(videoTitle);
                infoPanel.appendChild(videoUser);               
                infoPanel.appendChild(videoDate);
                infoPanel.appendChild(videoDesc);

                // vidDiv is the div that holds infoPanel div & the video iframe 
                vidDiv.appendChild(infoPanel);
                vidDiv.appendChild(videoWin);
                
                // mainContain is the main container div element that holds everything
                mainContain.appendChild(vidDiv);

                /*  TROUBLESHOOTING CODE
                console.log('--------------------------------------------------------------');
            
                console.log( resp.result.items[x].id.videoId);
                console.log( resp.result.items[x].snippet.channelId);
                console.log( resp.result.items[x].snippet.channelTitle);
                console.log( resp.result.items[x].snippet.description);
                console.log( resp.result.items[x].snippet.publishedAt);
                console.log( resp.result.items[x].snippet.title);
                console.log( resp.result.items[x].snippet.thumbnails.default.url);
                console.log( resp.result.items[x].snippet.thumbnails.high.url);
                console.log( resp.result.items[x].snippet.thumbnails.medium.url);

                console.log( resp.result.items[x].nextPageToken);
                console.log( resp.result.pageInfo.resultsPerPage);
                console.log( resp.result.pageInfo.totalResults);
                */
            }
        },
        // 'failure' function if we can't access the youtube API
        function() {
            console.log("error!!!");
        }
    )
}
