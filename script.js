/**********************************
You Tube Search
All code is in vanilla jS
**********************************/

var searchBar   = document.querySelector('.search-bar');        // variable for search bar
var searchBtn   = document.querySelector('.search-btn');        // variable for search button
var nextPageBtn = document.querySelector('.next-page-btn');     // variable for next page button
var prevPageBtn = null;                                         // variable for prev page button, leave 'undefined'
var mainContain = document.querySelector('.main-contain');      // mainContain is a div holding all videos
var display = document.querySelector('.display-size');          // variable for the display size drop down menu
var userQ;                                                      // variable for users search query term
var nPage;                                                      // variable for current value of next page from you tube api
var pPage;                                                      // variable for current value of prev page from you tube api
var numResult = 5;                                              // # of videos to show per page
var currentPage;                                                // number variable to store current page number
var pageTrack = [];                                             // array of youtube page tokens.  Used to re-display 
                                                                //   current page when user changes video size

// when user enters a search...
searchBtn.addEventListener('click', function() {
    pageTrack = [];                                             // clear the page numbers array
    mainContain.innerHTML = '';                                 // remove all videos currently in the mainContain div
    userQ = searchBar.value;                                    // store user's query into variable
    search(userQ, false, false);                                // call the search function with users query, and 
})                                                              // boolean false for we don't want next page nor previous page.
                                                                // this grabs page 1 results of user's search.

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
        if ( nPage === pageTrack[x]) {                          // find element that has value of next page token
            nPage = pageTrack[x-1];                             // grab the token for current page
            search(userQ, true, false);                         // call search function with the token for current page
        }
    }
})

// This function loads the YouTube API
// The HTML file has inline Javascript of onload event to call this function
function loadAPI() {
    gapi.client.load('youtube', 'v3')                                           // get API for YouTube V3
        .then(function() {                                                      // call 'success' function
            gapi.client.setApiKey('AIzaSyCMaFTFFidsXIteOavc8Qd9abNq-8muPf0');   // set API EY
             if (typeof userQ !== "undefined") {                                // if user enters a search...
                search(userQ, false, false);                                    // execute search
             }
             else {
                userQ = 'web development';                                      // else page is loaded first time
                search( userQ, false, false);                                   // show web development videos
             }
        })
}

// search function, this function pulls videos from the YouTube API
// arguments: user's search term, boolean to pull next page results, boolean to pull prev page results
function search(queryTerm, wantNext, wantPrev) {                                                                 
    if(wantNext) {                                          // if user wants next page of results
        var req = gapi.client.youtube.search.list({     
            part: 'snippet, id',
            maxResults: numResult, 
            q: queryTerm,
            type: 'video',
            pageToken: nPage                                // store API "pageToken" property to nPage
        });
    }
    else if(wantPrev) {                                     // if user wants previous page of results
        var req = gapi.client.youtube.search.list({
            part: 'snippet, id',
            maxResults: numResult, 
            q: queryTerm,
            type: 'video',
            pageToken: pPage                                // store API "pageToken" property to pPage
        });
    }
    else {
        var req = gapi.client.youtube.search.list({         // else send request without including "pageToken"
            part: 'snippet',                                // this will return page 1 of results
            maxResults: numResult, 
            q: queryTerm,
            type: 'video'   
        });
    }

    req.then(                                               // 'success' function to handle YouTube's response
        function(resp) {                                        
            nPage = resp.result.nextPageToken;              // store next page token into nPage (there will always be a next page token) 
            
            if( pageTrack.indexOf(nPage) === -1 ) {         // if the token isn't in the pageTrack array...
                pageTrack.push(nPage);                      // add to array
            }
            
            currentPage = pageTrack.indexOf(nPage) + 2 - 1;             // calculate the current page number
            document.querySelector('.panel-page-number').innerHTML =    // insert page # into DOM
                "<p>Page " + currentPage + "</p>" ;

            // if there is a previous page property, we're on page 2 or after...
            if (resp.result.prevPageToken) {                
                pPage = resp.result.prevPageToken;                      // save the token to pPage.
                
                // show the previous page navigation button
                if ( prevPageBtn === null ) {                                   // verify the variable is NULL
                    prevPageBtn = document.querySelector('.prev-page-btn');     // set variable to DOM element
                    prevPageBtn.classList.remove('no-show');                    // add CSS class to show element
                    
                    prevPageBtn.addEventListener('click', function() {          // add event handler.  Call search()
                        mainContain.innerHTML = '';                             // when user clicks on prevPageBtn
                        search(userQ, false, true);                             // search() will pull results using prev page token
                    });
                }               
            }
            // Else means we are on page 1.  
            // Hide the prev page button & re-set the variable to NULL.
            else {
                if(prevPageBtn !== null) {
                    prevPageBtn.classList.add('no-show');
                    prevPageBtn = null;
                }               
            }

            // this for loop gets all video details and displays them in the DOM
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
                // switch statement will set width/height according to user's choice.
                switch(display.value) {
                    case '1':
                        videoWin.setAttribute('width', 640);
                        videoWin.setAttribute('height', 360);
                        break;
                    case '2':
                        videoWin.setAttribute('width', 864);
                        videoWin.setAttribute('height', 486);
                        break;
                    case '3':
                        videoWin.setAttribute('width', 960);
                        videoWin.setAttribute('height', 540);
                        break;
                    case '4':
                        videoWin.setAttribute('width', 1024);
                        videoWin.setAttribute('height', 576);
                        break;
                    case '5':
                        videoWin.setAttribute('width', 1280);
                        videoWin.setAttribute('height', 720);
                        break;
                    case '6':
                        videoWin.setAttribute('width', 1366);
                        videoWin.setAttribute('height', 768);
                        break;
                }

                // infoPanel will be a div holding all of the video information we pulled.
                var infoPanel = document.createElement('div');
                infoPanel.classList.add('infopanel')
                infoPanel.appendChild(videoTitle);      // title
                infoPanel.appendChild(videoUser);       // creator
                infoPanel.appendChild(videoDate);       // publish date
                infoPanel.appendChild(videoDesc);       // description

                // vidDiv is the div that holds infoPanel div & the video iframe 
                vidDiv.appendChild(infoPanel);
                vidDiv.appendChild(videoWin);
                
                // mainContain is the main container div element that holds everything
                mainContain.appendChild(vidDiv);

                /*  UNCOMMENT ONLY FOR TROUBLESHOOTING
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
            alert("Whoops, can't reach You Tube API!");
        }
    )
}
