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
      
  $('.mobile-chat-messages,.desktop-chat-messages').prepend(`
      <div class="message">
          <div class="user-icon">
              <i class="fas fa-user"></i>
          </div>
          <div class="text"><b>${name}</b> : ${message}</div>
      </div>`);
});
  
$('#myMessage').keydown(function(event) {
  if ($('#myMessage')) {
    
      if (event.keyCode == 13) {
        SendMessage();
      }
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
    $('.mobile-chat-messages,.desktop-chat-messages').prepend(`
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

    if (!message == '') {
      
    $('.mobile-chat-messages,.desktop-chat-messages').prepend(`
                <div class="message">
                    <div class="user-icon ${img ? `` : `user-icon-line`}">
                    ${img ? 
                      `<img src="${img}" alt="User Image" style="width: 30px; height: 30px; border-radius: 50%;">` 
                      : 
                      `<i class="fas fa-user"></i>`
                    }
                    </div>
                    <div class="text"><b>${name}</b> : ${message}</div>
                </div>
            `);
    }
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



//tahmin ve sohbet değiştirmek için kod

function chatChange(chatName,button) {
  $('.btn-tahminAndSohbet').removeClass('secilen');
  button.classList.add('secilen');
  
  $(`.chats`).css('display','none');
  $(`#${chatName}`).css('display','block');
}







    // Canvasları ve Context'leri al
    const canvas1 = document.getElementById("drawingCanvasPc");
    const ctx1 = canvas1.getContext("2d");

    const canvas2 = document.getElementById("drawingCanvasMobile");
    const ctx2 = canvas2.getContext("2d");

    let isDrawing = false;

    function startDrawing(e, canvas, ctx, targetCtx) {
        isDrawing = true;
        draw(e, canvas, ctx, targetCtx);
    }

    function stopDrawing() {
        isDrawing = false;
        ctx1.beginPath();
        ctx2.beginPath();
    }

    function draw(e, canvas, ctx, targetCtx) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Çizimi yapan canvas
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        // Diğer canvas'a da aynısını uygula
        const targetRect = targetCtx.canvas.getBoundingClientRect();
        const targetX = x * (targetCtx.canvas.width / canvas.width);
        const targetY = y * (targetCtx.canvas.height / canvas.height);

        targetCtx.lineWidth = 3;
        targetCtx.lineCap = "round";
        targetCtx.strokeStyle = "black";
        targetCtx.lineTo(targetX, targetY);
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.moveTo(targetX, targetY);
    }

    // Canvas 1 olayları
    canvas1.addEventListener("mousedown", (e) => startDrawing(e, canvas1, ctx1, ctx2));
    canvas1.addEventListener("mouseup", stopDrawing);
    canvas1.addEventListener("mousemove", (e) => draw(e, canvas1, ctx1, ctx2));

    // Canvas 2 olayları
    canvas2.addEventListener("mousedown", (e) => startDrawing(e, canvas2, ctx2, ctx1));
    canvas2.addEventListener("mouseup", stopDrawing);
    canvas2.addEventListener("mousemove", (e) => draw(e, canvas2, ctx2, ctx1));








//EKRAN AYARLAMALARI
function elemaniTasi() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    $("#scoreboard").prependTo("#chat-container");
  } else {
    $("#scoreboard").prependTo("#scoreboardContainer"); // Eski yerine geri al
  }
}
  
// Sayfa yüklendiğinde kontrol et
elemaniTasi();
  
// Ekran boyutu değiştiğinde tekrar kontrol et
window.addEventListener("resize", elemaniTasi);