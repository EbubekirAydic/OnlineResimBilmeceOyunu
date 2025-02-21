let pusher;
let preview;

function escapeOutput(toOutput){
    return toOutput.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

pusher = new Pusher("a9e16f9df028c5878b24", {
  cluster: "eu",
  authEndpoint: "https://phpr.org/pusher.php"
});
  
var channel = pusher.subscribe("private-channel");
  
channel.bind("client-message", (data) => {
  console.log(data);
      
  message = escapeOutput(data.message);
  name = escapeOutput(data.name);
  img = escapeOutput(data.img);
      
  $('#chat-messages').prepend(`
      <div class="message">
          <div class="user-icon">
              <i class="fas fa-user"></i>
          </div>
          <div class="text"><b>${name}</b> : ${message}</div>
      </div>`);
});
  
$('#myMessage').keydown(function(event) {
      if (event.keyCode == 13) {
        SendMessage();
      }
});

function SendMessage(ServerName,IsServer,ServerMessage) {
  channel.trigger("client-message", {
    name: $('#myName').val(),
    message: $('#myMessage').val(),
    if (preview) {
      img = preview.src;
    },
  });
  
  if (IsServer) {
    ServerName = escapeOutput($('#myName').val());
    ServerMessage = escapeOutput($('#myMessage').val());
    $('#chat-messages').prepend(`
                  <div class="message">
                      <div class="user-icon">
                          <i class="fas fa-user"></i>
                      </div>
                      <div class="text"><b>${ServerName}</b> : ${ServerMessage}</div>
                  </div>`);
    
    $('#myMessage').val('')
  }else{
            
    // Mesajı HTML'e ekle
    name = escapeOutput($('#myName').val());
    message = escapeOutput($('#myMessage').val());
    if (preview) {
      img = preview.src;
    }else{
      img = null
    }

    $('#chat-messages').prepend(`
                <div class="message">
                    <div class="user-icon">
                    ${img ? 
                      `<img src="${img}" alt="User Image" style="width: 40px; height: 40px; border-radius: 50%;">` 
                      : 
                      `<i class="fas fa-user"></i>`
                    }
                    </div>
                    <div class="text"><b>${name}</b> : ${message}</div>
                </div>
            `);
  };

  $('#myMessage').val('')
}






//------------------------------------------------------
function GoToFunction(Open){
  const elements = document.getElementsByClassName("Menus");

  // Döngüyle elemanlara erişme
  for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add("close");
        elements[i].classList.remove('d-flex');
  }
  document.getElementById(Open).classList.remove("close");

  if (document.getElementById(Open).id == 'OdaKurKat') {
    document.getElementById(Open).classList.add('d-flex');
  }
}



document.getElementById("fileInput").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          preview = document.getElementById("previewImage");
          preview.src = e.target.result;
          preview.style.display = "block";

      };
      reader.readAsDataURL(file);
  }
});

function NameControl() {
  let PersonName = escapeOutput($('#myName').val().trim()); // Trim ile boşlukları temizledik

  // Uyarıları temizle
  $('#myName, #Uyar').removeClass("is-invalid");
  $('#UyarmaCümlesi').text("");

  if (PersonName === "") {
      showWarning("Lütfen isim yerini boş bırakmayınız.");
      return;
  }

  if (PersonName.length > 30) {
      showWarning("İsim çok uzun! Maksimum 30 karakter olmalıdır.");
      return;
  }

  if (!/^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s\.\-']+$/.test(PersonName)) {
      showWarning("İsim yalnızca harf, sayı ve özel karakterlerden (. - ') oluşabilir.");
      return;
  }

  console.log("Kullanıcı adında sıkıntı yok!");
  GoToFunction('GameMenu');
}

// Uyarı mesajlarını göstermek için fonksiyon
function showWarning(message) {
  $('#myName, #Uyar').addClass("is-invalid");
  $('#UyarmaCümlesi').text(message);
}
