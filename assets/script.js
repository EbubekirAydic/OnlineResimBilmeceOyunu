let pusher; // Pusher nesnesi
let preview; //Görsel önizleme
let imageUrl; // Görsel URL'si

// HTML'e eklenen metinleri güvenli hale getirmek için fonksiyon
function escapeOutput(toOutput){
    return toOutput.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Pusher nesnesini oluştur
pusher = new Pusher("a9e16f9df028c5878b24", {
  cluster: "eu",
  authEndpoint: "https://phpr.org/pusher.php"
});

// Kanal oluştur
var channel = pusher.subscribe("private-channel");
  
// Kanaldan gelen mesajları yazdır
channel.bind("client-message", (data) => {
  console.log(data);
      
  message = escapeOutput(data.message);
  name = escapeOutput(data.name);
  img = data.img;
  messageDiv = data.massageDiv;
      
  $(`#${messageDiv}`).append(`
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

});
//kanaldan gelen kullanıcıları ekle ve yazdır
channel.bind("client-user", (data) => {
  console.log(data);
  userName = escapeOutput(data.name);
  userImg = data.img;

  $('#playerScores').append(`
    <div class="player">
        <div class="user-icon ${userImg ? `` : `user-icon-line`}">
        ${userImg ? 
          `<img src="${userImg}" alt="User Image" style="width: 30px; height: 30px; border-radius: 50%;">` 
          : 
          `<i class="fas fa-user"></i>`
        }
        </div>
        <div class="text"><b>${userName}</b></div>
    </div>
  `);

});
  
$('#myMessage').keydown(function(event) {
  if ($('#myMessage')) {
    
      if (event.keyCode == 13) {
        SendMessage('myMessage','chat-messages');
      }
    }
});

$('#mySendMessage').keydown(function(event) {
  if ($('#mySendMessage')) {
      if (event.keyCode == 13) {
        SendMessage('mySendMessage','send-messages');
      }
    }
});

function SendMessage(messageInput,messageDiv,ServerName,IsServer,ServerMessage) {

  if (!escapeOutput($(`#${messageInput}`).val()) == '') {

  setupChatScroll(`#${messageDiv}`);
  mesajEkle(`#${messageDiv}`);



  channel.trigger("client-message", {
    name: $('#myName').val(),
    message: $(`#${messageInput}`).val(),
    img: preview ? imageUrl: null,
    massageDiv: messageDiv,
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
    
    $(`#${messageInput}`).val('')
  }else{
            
    // Mesajı HTML'e ekle
    name = escapeOutput($('#myName').val());
    message = escapeOutput($(`#${messageInput}`).val());
    if (preview) {
      img = preview.src;
    }else{
      img = null
    }

      
    $(`#${messageDiv}`).append(`
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

  $(`#${messageInput}`).val('')
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
  nameSave(PersonName)
  if (preview){
    uploadImage(preview.src); // Görseli yükleme ve URL'sini almak için fonksiyonu çağır
  }
  GoToFunction('GameMenu');
}




// KAYITLI İSİM VE GÖRSELİ YÜKLEME VE KAYDETME

// Kayıtlı isim ve görseli yükle
let PersoneNameSave = {PersoneName : '',PersoneImg : ''};

if (localStorage.getItem('PersoneNameSave')) {
  PersoneNameSave = JSON.parse(localStorage.getItem('PersoneNameSave'));

  if (PersoneNameSave.PersoneImg) {
    // Görseli img etiketine ekle
    preview = document.getElementById("previewImage");
    preview.src = PersoneNameSave.PersoneImg;
    preview.style.display = "block";
  }

  $('#myName').val(PersoneNameSave.PersoneName);
}

// İsim ve görseli kaydet
function nameSave(PersonName) {
  PersoneNameSave.PersoneName = PersonName;

  if (preview) {
    PersoneNameSave.PersoneImg = preview.src;
  }

  localStorage.setItem('PersoneNameSave', JSON.stringify(PersoneNameSave));
}

//localStorage.removeItem('PersoneNameSave');





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

    let isDrawing = false;

    function startDrawing(e, canvas, ctx, targetCtx) {
        isDrawing = true;
        draw(e, canvas, ctx, targetCtx);
    }

    function stopDrawing() {
        isDrawing = false;
        ctx1.beginPath();
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
    }

    // Canvas 1 olayları
    canvas1.addEventListener("mousedown", (e) => startDrawing(e, canvas1, ctx1));
    canvas1.addEventListener("mouseup", stopDrawing);
    canvas1.addEventListener("mousemove", (e) => draw(e, canvas1, ctx1));








//EKRAN AYARLAMALARI
function elemaniTasi() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    $("#scoreboard").prependTo("#chat-container-scor");
    
  } else {
    $("#scoreboard").prependTo("#gameMenucuk"); // Eski yerine geri al
    
  }
}
  
// Sayfa yüklendiğinde kontrol et
elemaniTasi();
  
// Ekran boyutu değiştiğinde tekrar kontrol et
window.addEventListener("resize", elemaniTasi);








let scrollLock = true; // Otomatik kaydırma durumu

// Chat kaydırma fonksiyonu
function setupChatScroll(chatSelector) {

  // Kullanıcı manuel yukarı kaydırınca otomatik kaydırmayı durdur
  $(chatSelector).on("scroll", function() {
      let div = $(this);

      // Kullanıcı en alta kaymış mı?
      if (div.scrollTop() + div.innerHeight() >= div[0].scrollHeight - 10) {
          scrollLock = true;  // En alttaysa otomatik kaydırma açık
      } else {
          scrollLock = false; // Yukarı kaydırdıysa otomatik kaydırma kapalı
      }
  });

  let div = $(chatSelector);

  // Kaydırma pozisyonlarını kontrol et

  // Kullanıcı en alta kaymış mı?
  if (div.scrollTop() + div.innerHeight() >= div[0].scrollHeight - 10) {
      scrollLock = true;  // En alttaysa otomatik kaydırma açık
  } else {
      scrollLock = false; // Yukarı kaydırdıysa otomatik kaydırma kapalı
  }

  // İlk başta otomatik kaydırma yapılabilir
  
}
// Mesaj ekleme fonksiyonu
function mesajEkle(chatSelector) {
  
    // Eğer otomatik kaydırma açıksa, en alta kaydır
    if (scrollLock) {
        $(chatSelector).animate({
            scrollTop: $(chatSelector)[0].scrollHeight
        }, 300);
    } else {
    }
}












// Gece Modu ve Aydınlık Modu arasında geçiş yapmak için:
const themeToggleButton = document.getElementById('theme-toggle');

// Kullanıcının tercihini localStorage'a kaydet
function setTheme(theme) {
  document.body.classList.remove('dark-mode', 'light-mode');
  document.body.classList.add(theme);
  document.querySelectorAll('*').forEach(function(element) {
    element.classList.remove('dark-mode');
  });

  // Gece modunu ekle
  document.body.classList.add(theme);

  // Tüm sayfa öğelerine dark-mode sınıfını ekle
  if (theme === 'dark-mode') {
    document.querySelectorAll('*').forEach(function(element) {
      element.classList.add('dark-mode');
    });
  }
  // Tema tercihini localStorage'a kaydet
  localStorage.setItem('theme', theme);

  // Düğme metnini değiştirme
  if (theme === 'dark-mode') {
    themeToggleButton.innerHTML = 'Gece Modu <i class="fas fa-moon" style="margin-left: 5px;"></i>';
  } else {
    themeToggleButton.innerHTML = 'Aydınlık Modu <i class="fas fa-sun" style="margin-left: 5px;"></i>';
  }
}

// Sayfa yüklendiğinde tema tercihlerini kontrol et ve uygula
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme); // Yerel depolamadan tema seçimini uygula
  } else {
    setTheme('dark-mode'); // Varsayılan olarak Aydınlık Modu
  }
});

// Tema değiştirme butonuna tıklama olayını ekle
themeToggleButton.addEventListener('click', () => {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
  const newTheme = currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
  setTheme(newTheme);
});












// Resmi Base64 olarak yükleme ve gönderme

async function uploadImage(previeW) {

  let file = previeW ? previeW : null;

  if (!file) {
    return null;
  }

  // Convert base64 to Blob
  const base64Response = await fetch(file);
  const blob = await base64Response.blob();


  let formData = new FormData();
  formData.append("image", blob, "image.png"); // Added filename for the blob

  try {
    // ✅ Resmi ImgBB'ye yüklüyoruz

    let response = await fetch("https://api.imgbb.com/1/upload?key=46f0d10cac42bc77a03315b676949a88", {
      method: "POST",
      body: formData
    });

    let result = await response.json();

    if (!response.ok) {
      throw new Error(`Hata Kodu: ${response.status}, Mesaj: ${result.error ? result.error.message : 'Bilinmeyen hata'}`);
    }

    imageUrl = result.data.url;

    // 📌 Resmi Pusher ile gönder

  } catch (error) {
    // Hata durumunda hata mesajını konsola yazdırıyoruz
    console.error("Resim yükleme hatası:", error);
    return null;
  }
}









