// Instantiate an empty object.
var Instagram = {};

// Small object for holding important configuration data.
Instagram.Config = {
  clientID: // IN CODE
  apiHost: 'https://api.instagram.com'
};


// ************************
// ** Main Application Code
// ************************
(function(){
  var photoTemplate, resource;

  function init(){
    bindEventHandlers();
    photoTemplate = _.template($('#photo-template').html());
  }

  function toTemplate(photo){
    photo = {
      count: photo.likes.count,
      avatar: photo.user.profile_picture,
      photo: photo.images.low_resolution.url,
      url: photo.link
    };

    return photoTemplate(photo);
  }

  function toScreen(photos){
    var photos_html = '';

    $('.paginate a').attr('data-max-id', photos.pagination.next_max_id)
                    .fadeIn();

    $.each(photos.data, function(index, photo){
      photos_html += toTemplate(photo);
    });

    $('div#photos-wrap').append(photos_html);
  }

  function generateResource(location){
    var config = Instagram.Config, url;

    if(typeof location === 'undefined'){
      throw new Error("Resource requires a tag. Try searching for cats.");
    } else {
      // Make sure tag is a string, trim any trailing/leading whitespace and take only the first 
      // word, if there are multiple.
      location = String(location).trim().split(" ")[0];
    }

    //museum of natural history
    url = config.apiHost + "/v1/locations/" + 3000913 + "/media/recent?callback=?&client_id=" + config.clientID;

    return function(max_id){
      var next_page;
      if(typeof max_id === 'string' && max_id.trim() !== '') {
        next_page = url + "&max_id=" + max_id;
      }
      return next_page || url;
    };
  }

  function paginate(max_id){    
    $.getJSON(generateUrl(location), toScreen);
  }

  function search(location){
    resource = generateResource(location);
    $('.paginate a').hide();
    $('#photos-wrap *').remove();
    fetchPhotos();
  }

  function fetchPhotos(max_id){
    $.getJSON(resource(max_id), toScreen);
  }

  function bindEventHandlers(){
    $('body').on('click', '.paginate a.btn', function(){
      var locationID = $(this).attr('data-max-id');
      fetchPhotos(locationID);
      return false;
    });

    // Bind an event handler to the `submit` event on the form
    $('form').on('submit', function(e){

      // Stop the form from fulfilling its destinty.
      e.preventDefault();

      // Extract the value of the search input text field.
      var location = $('input.search-location').val().trim();

      // Invoke `search`, passing `tag` (unless tag is an empty string).
      if(location) {
        search(location);
      };

    });

  }

  function showPhoto(p){
    $(p).fadeIn();
  }

  // Public API
  Instagram.App = {
    search: search,
    showPhoto: showPhoto,
    init: init
  };
}());

$(function(){
  Instagram.App.init();
  
  // Start with a search on cats; we all love cats.
  Instagram.App.search('location');  
});

