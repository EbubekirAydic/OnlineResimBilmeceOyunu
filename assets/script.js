let pusher;

function escapeOutput(toOutput){
    return toOutput.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

$(document).ready(function() {
  
    
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    pusher = new Pusher('b115e2e5c70fe61fbb46', {
      cluster: 'eu',
      authEndpoint: "https://phpr.org/pusher.php"
    });

    var channel = pusher.subscribe('private-channel');
  
    channel.bind("new-message", (data) => {
      console.log(data);
      
      message = escapeOutput(data.message);
      name = escapeOutput(data.name);
      
      $('#messages').prepend('<li><b>'+name+'</b>: '+message+'</li>');
    });
  
    $('#myMessage').keydown(function(event) {
      if (event.key === 'Enter') {

        $.post("https://phpr.org/pusher.php", {
            event: "new-message",
            name: $('#myName').val(),
            message: $('#myMessage').val()
          });
        
        name = escapeOutput($('#myName').val());
        message = escapeOutput($('#myMessage').val());
        
        $('#messages').prepend('<li><b>'+name+'</b>: '+message+'</li>');
        
        $('#myMessage').val('')
        
      }
    });
});