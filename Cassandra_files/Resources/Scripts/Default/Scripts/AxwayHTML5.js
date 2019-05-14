function moveSearch() {
    h1Headings = document.getElementsByTagName("h1");
    for (h = 0; h < h1Headings.length; h++) {
        h1Heading = h1Headings[h];
        if (h1Heading.getAttribute("class") == "Search Bar") {
            h1Heading.setAttribute("style", "margin-right : 200px");
        }
    }
}

window.onload = moveSearch;


$(document).ready(function(){
   $('head').append('<link rel="shortcut icon" href="Content/Resources/Images/favicon.ico" type="image/x-icon" />');
});