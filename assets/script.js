let pusher; // Pusher nesnesi
let preview; //Görsel önizleme
let imageUrl; // Görsel URL'si
let Kullanicilar = []; // Kullanıcılar dizisi
var channel;
let MyId;

// HTML'e eklenen metinleri güvenli hale getirmek için fonksiyon
function escapeOutput(toOutput){
    return toOutput.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

$(document).ready(function() {

  // Pusher nesnesini oluştur
  pusher = new Pusher("a9e16f9df028c5878b24", {
    cluster: "eu",
    authEndpoint: "https://phpr.org/pusher.php"
  });


  // Kanal oluştur
  channel = pusher.subscribe("private-channel");
    





// Kanaldan gelen mesajları yazdır
channel.bind("client-ChatMessage", (data) => {
    console.log('?-----client-ChatMessage------?');

    console.log(data);

    if (data.name == 'Server78901234567890') {
      message = data.message;
    }else{
      message = escapeOutput(data.message);
    }
    name = escapeOutput(data.name);
    img = data.img;
    messageDiv = data.massageDiv;
    
    setupChatScroll(`#${messageDiv}`);
    mesajEkle(`#${messageDiv}`);
        
    console.error('Mesaj 3 gönderiliyor');
    $(`#${messageDiv}`).append(`
      <div class="message ${data.name == 'Server78901234567890' ? 'ServerMessage' : ''}">
          ${data.img == 'serverImg' ?
             ``
             : 
             `<div class="user-icon ${img ? `` : `user-icon-line`}">
             ${img ? 
              `<img src="${img}" alt="User Image" style="width: 30px; height: 30px; border-radius: 50%;">` 
              : 
              `<i class="fas fa-user"></i>`
            }

              </div>`
          }
          <div class="text">
          ${data.name == 'Server78901234567890' ? 
            message
            :
            `<b id='NameColor${data.HeId}' class='col-12'>${name}</b><div class='col-12'>${message}</div>`
          }
          </div>
      </div>
    `);

    console.log('*---------------------------------*');
    console.warn('');
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








//KULLANICI GİRİŞİ VE ÇIKIŞI İŞLEMLERİ--------------------------------------------

//Birisi sunucuda var mı diye sor ve host varsa host onu kullanicilar'a eklesin
//Oyunda biri yoksa zaten burası çalışmayacak
channel.bind("client-Is-there-anyone", (data) => {
  console.log('?-----client-Is-there-anyone------?');

  if (Kullanicilar[0] && $('#myName').val()) {
    if (Kullanicilar[0].name == $('#myName').val()) {
      console.log('--------Ben hostum--------');
      console.log('Gelen kullanıcı:');
      console.log(data);

      //Eğer aynı isimde başka bir kullanıcı varsa oyuna giremez
        if (Kullanicilar.find(user => user.name === data.name)) {
          console.log('Bu isimde bir kullanıcı var!');

          channel.trigger("client-user-left-game", {
            name: data.name,
            id : Kullanicilar.length,
          });

        }else{
          Kullanicilar.push({name: data.name, img: data.img, id: Kullanicilar.length + 1});

          console.log('Kullanıcılar:');
          console.log(Kullanicilar);
          
          SendMessage('mySendMessage', 'send-messages', true, `<p style='color:green;margin:0;'><i class="fa-solid fa-door-open"></i> Sunucuya <b style='font-size: 14px;'>${data.name}</b> katıldı!</p>`);

          console.log(Kullanicilar.length);

          channel.trigger("client-user", {
            KullanicilarM: Kullanicilar,
          });

          

          scorBoardRefresh();
        }
        
    
    }else{
      console.log('Ben host değilim!');
    }
  }else{
    console.log('Ben oyunda değilim!');
  }
  console.log('*---------------------------------*');
  console.warn('');
});







//kullanıcı girdiği zaman chata yazdırma işlemi
channel.bind("client-AddMessageUser", (data) => {
  console.log('?-----client-AddMessageUser------?');
  console.log('Gelen kullanıcı:');
  console.log(data);

  console.error('Mesaj 2 gönderiliyor');

  console.log('*---------------------------------*');
  console.warn('');
});









//Aynı isimde kullanıcı varsa o kişi oyuna giremez
channel.bind("client-user-left-game", (data) => {
  console.log('?-----client-user-left-game------?');
  console.log('Oyuna giremeyen kullanıcı:');
  console.log(data);

  if (MyId == 1) {
    console.error('Sen host değilsin O yüzden çıkan kişi sensin! : '+data.name);
    GoToFunction('AnaMenu');
    showWarning("Bu isimde bir kullanıcı var! Oyuna giremezsiniz.");
  }

  console.log('*---------------------------------*');
  console.warn('');
}
);









//Host gelen kullanıcıyı diğer kullanıcılara ekletip ve yazdırması işlemi
channel.bind("client-user", (data) => {

  Kullanicilar = data.KullanicilarM;

  //kullanıcıların hepsine id ver
  if (MyId == undefined) { return;}
  if (!Kullanicilar) { return;}
  if (Kullanicilar.length == 0) { return;}


    $.each(Kullanicilar, function(index, user) {
      console.log(user.id);

      if (user.name == $('#myName').val()) {
      MyId = user.id;
      }
    });

  
  scorBoardRefresh();
});
  


//Kullanıcı siteden çıkarsa
channel.bind("client-user-left", (data) => {
  console.log('?--------client-user-left--------?');
  console.log('Kullanıcı çıktı:');
  console.log(data);

  if (data.id == 1) {
    console.log('Host çıktı');
    // Kullanıcıların id'lerini yeniden düzenle
    Kullanicilar = Kullanicilar.filter((user) => user.name !== data.name);

    Kullanicilar.forEach((user, index) => {
      user.id = index + 1;
    });
    
    console.log(Kullanicilar[0],' Host oldu');

    if (MyId == 2) {
      channel.trigger("client-user", {
        KullanicilarM: Kullanicilar,
      });

      MyId = 1;

      SendMessage('mySendMessage', 'send-messages', true, `<p style='color:red;margin:0;'><i class="fa-solid fa-plug-circle-xmark"></i> <b style='font-size: 14px;'>${data.name}</b>(Yönetici) bağlantısı gitti! Yeni yönetici: <b style='font-size: 14px;'>${Kullanicilar[0].name}</b></p>`);
    }

    scorBoardRefresh();

    return;
  }
  
  if (Kullanicilar[0] && $('#myName').val()) {
    if (Kullanicilar[0].name == $('#myName').val()) {
      console.log('Ben hostum!');
      console.log('Eski Kullanıcılar:');
      console.log(Kullanicilar);

      Kullanicilar = Kullanicilar.filter((user) => user.name !== data.name);

      // Kullanıcıların id'lerini yeniden düzenle
      Kullanicilar.forEach((user, index) => {
        user.id = index + 1;
      });

      SendMessage('mySendMessage', 'send-messages', true, `<p style='color:red;margin:0;'><i class="fa-solid fa-plug-circle-xmark"></i> <b style='font-size: 14px;'>${data.name}</b> bağlantısı gitti!</p>`);

      console.log('Yeni Kullanıcılar:');
      console.log(Kullanicilar);

      channel.trigger("client-user", {
        KullanicilarM: Kullanicilar,
      });
    }else{
      console.log('Ben host değilim!');
    }
  }else{
    console.log('Ben oyunda değilim!');
  }

  scorBoardRefresh();
  console.log('*---------------------------------*');
  console.warn('');
});














// Resim çizme
channel.bind('client-drawing', function(data) {
  const { drawing } = data;

  ctx1.beginPath();
  drawing.forEach(point => {
    if (point.type === "start") {
      ctx1.moveTo(point.x, point.y);
    } else {
      ctx1.lineTo(point.x, point.y);
      ctx1.stroke();
    }
  });
  ctx1.closePath();
});


//------------------------------------------------------
});







function SendMessage(messageInput,messageDiv,IsServer,ServerMessage) {

  if (IsServer) {
    setupChatScroll(`#${messageDiv}`);
    mesajEkle(`#${messageDiv}`);

    channel.trigger("client-ChatMessage", {
      name: 'Server78901234567890',
      message: ServerMessage,
      img: 'serverImg',
      massageDiv: 'chat-messages',
    });

    $(`#chat-messages`).append(`
                  <div class="message ServerMessage">
                      <div class="text">${ServerMessage}</div>
                  </div>`);
  }else{
    if (!escapeOutput($(`#${messageInput}`).val()) == '') {

      setupChatScroll(`#${messageDiv}`);
      mesajEkle(`#${messageDiv}`);
      
      channel.trigger("client-ChatMessage", {
        name: $('#myName').val(),
        message: $(`#${messageInput}`).val(),
        img: preview ? imageUrl: null,
        massageDiv: messageDiv,
        HeId: MyId,
      });

      // Mesajı HTML'e ekle
      name = escapeOutput($('#myName').val());
      message = escapeOutput($(`#${messageInput}`).val());
      preview ? img = preview.src : img = null;

        
      $(`#${messageDiv}`).append(`
                  <div class="message">
                      <div class="user-icon ${img ? `TransparentBack` : `user-icon-line`}">
                      ${img ? 
                        `<img src="${img}" alt="User Image" style="width: 30px; height: 30px; border-radius: 50%;">`
                        :
                        `<i class="fas fa-user"></i>`
                      }
                      </div>
                      <div class="text"><b id='NameColor${MyId}' class='col-12'>${name}</b><div class='col-12'>${message}</div></div>
                  </div>
              `);
    }
    $(`#${messageInput}`).val('')
  };

}






//------------------------------------------------------
function GoToFunction(Open){

  // Döngüyle elemanlara erişme
  $(".Menus").each(function() {
    $(this).addClass("close").removeClass("d-flex");
  });

  $(`#${Open}`).removeClass("close");

  if ($(`#${Open}`).attr('id') === 'OdaKurKat') {
    $(`#${Open}`).addClass('d-flex');
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
          uploadImage(preview.src); // Görseli yükleme ve URL'sini almak için fonksiyonu çağır
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

  if (PersonName.length > 14) {
      showWarning("İsim çok uzun! Maksimum 14 karakter olmalıdır. Yazdığınız karakter sayısı :" + PersonName.length);
      return;
  }

  if (!/^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s\.\-']+$/.test(PersonName)) {
      showWarning("İsim yalnızca harf, sayı ve özel karakterlerden (. - ') oluşabilir.");
      return;
  }

  console.log('Kullanıcı isminde sorun Yok: '+PersonName);
  console.warn('');
  nameSave(PersonName);

  NewUser(PersonName);

  //0.5 saniye sonra odaya git
  GoToFunction('GameMenu');
}






function NewUser(NewUserName) {
  // Kendini host olarak tanıt
  Kullanicilar.push({name: NewUserName, img: preview ? imageUrl: null, id: 1});
  MyId = 1;

  scorBoardRefresh();
      
  //--------------------------------------------------------------------------------
  //eğer sunucuda biri varsa kendi bilgilerini gönder ve hostluktan çık
  channel.trigger("client-Is-there-anyone", {
    name: NewUserName,
    img: preview ? imageUrl: null,
  });
}






// Sayfadan ayrılınca kullanıcıyı çıkart
window.addEventListener("beforeunload", function () {
  channel.trigger("client-user-left", {
    name: escapeOutput($('#myName').val()),
    id: MyId,
  });
});









function scorBoardRefresh() {

  $('#playerScores').html('');

  // Kullanıcıları HTML'e ekle
  if (Kullanicilar) {
    Kullanicilar.forEach((user) => {
      $('#playerScores').append(`
        
      <div class="player ${Theme}">
        <div class="col ${Theme}">
            <div class="user-icon user-icon-flex ${user.img ? `` : `user-icon-line`} ${Theme}">
            ${user.img ? 
              `<img id='Profil' src="${user.img}" alt="User Image">` 
              : 
              `<i class="fas fa-user ${Theme}"></i>`
            }
            </div>
        </div>
        <div class="col-9 ${Theme}">
          <div class="playerPuan ${Theme}"><p><b id='NameColor${user.id}'>${user.name}</b></p><p id='Puan' class='${Theme}'>Puan: <span class='${Theme}'>0</span></p></div>
        </div>
      </div>
      `);
    });
  }
  
}











// KAYITLI İSİM VE GÖRSELİ YÜKLEME VE KAYDETME

// Kayıtlı isim ve görseli yükle
let PersoneNameSave = {PersoneName : '',PersoneImg : '',imageUrl : ''};

if (localStorage.getItem('PersoneNameSave')) {
  PersoneNameSave = JSON.parse(localStorage.getItem('PersoneNameSave'));

  if (PersoneNameSave.PersoneImg) {
    // Görseli img etiketine ekle
    preview = document.getElementById("previewImage");
    preview.src = PersoneNameSave.PersoneImg;
    preview.style.display = "block";
  }

  if (PersoneNameSave.imageUrl) {
    imageUrl = PersoneNameSave.imageUrl;
  }

  $('#myName').val(PersoneNameSave.PersoneName);
}

// İsim ve görseli kaydet
function nameSave(PersonName) {

  if (PersonName != undefined) {
    PersoneNameSave.PersoneName = PersonName;
  }
  if (preview) {
    PersoneNameSave.PersoneImg = preview.src;
  }
  if (imageUrl) {
    PersoneNameSave.imageUrl = imageUrl
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










let Theme; // Tema değişkeni

// Gece Modu ve Aydınlık Modu arasında geçiş yapmak için:
const themeToggleButton = document.getElementById('theme-toggle');

// Kullanıcının tercihini localStorage'a kaydet
function setTheme(theme) {
  document.body.classList.remove('dark-mode', 'light-mode');
  document.body.classList.add(theme);
  Theme = theme;
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

    let response = await fetch("https://api.imgbb.com/1/upload?key=7cb37f14333869b93d591bc9e1fc0b44", {
      method: "POST",
      body: formData
    });

    let result = await response.json();

    if (!response.ok) {
      throw new Error(`Hata Kodu: ${response.status}, Mesaj: ${result.error ? result.error.message : 'Bilinmeyen hata'}`);
    }

    imageUrl = result.data.url;
    console.log('resminiz başarıyla bir kere yedeklendi');
    console.log(imageUrl);
    nameSave();

    // 📌 Resmi Pusher ile gönder

  } catch (error) {
    // Hata durumunda hata mesajını konsola yazdırıyoruz
    console.error("Resim yükleme hatası:", error);
    return null;
  }
}












//RESİM PALETİ

//Renk güncellemesi
$('#colorPicker').on('change', function updateColor() {
  console.log($(this).val());
  this.style.backgroundColor = $(this).val();
});




















const canvas1 = document.getElementById("drawingCanvasPc");
const ctx1 = canvas1.getContext("2d");

let isDrawing = false;
let currentDrawing = []; // Çizilen noktaları sakla
const MAX_POINTS = 20; // 🔥 20 noktada bir veri gönderelim

ctx1.lineWidth = 3; // Çizgi kalınlığı

// Çizim verisini Pusher'a gönder
function sendDrawingData(drawing) {
  if (drawing.length === 0) return;

  try {
    channel.trigger('client-drawing', { drawing });
    console.log("Çizim verisi gönderildi:", drawing);
  } catch (error) {
    console.error("Pusher gönderim hatası:", error);
  }
}

// Çizim başladığında
function startDrawing(e) {
  e.preventDefault();
  isDrawing = true;
  currentDrawing = [];

  const pos = getMousePos(e);
  if (!pos) {
    stopDrawing(e);
    return;
  }

  currentDrawing.push({ x: pos.x, y: pos.y, type: "start" });

  ctx1.beginPath();
  ctx1.moveTo(pos.x, pos.y);
}

// Çizim durduğunda
function stopDrawing(e) {
  e.preventDefault();
  isDrawing = false;

  // Çizimi Pusher'a gönder
  sendDrawingData(currentDrawing);
  ctx1.closePath();
}

// Çizim yapılırken
function draw(e) {

  if (!isDrawing) return;
  e.preventDefault();

  const pos = getMousePos(e);
  if (!pos) {
    stopDrawing(e);
    return;
  }


  currentDrawing.push({ x: pos.x, y: pos.y, type: "line" });

  ctx1.lineTo(pos.x, pos.y);
  ctx1.stroke();
  ctx1.beginPath();
  ctx1.moveTo(pos.x, pos.y);

  // 🔥 20 noktada bir Pusher'a veri gönderelim
  if (currentDrawing.length >= MAX_POINTS) {
    sendDrawingData(currentDrawing);
    currentDrawing = [{ x: pos.x, y: pos.y, type: "start" }]; // Yeni çizim başlat
  }
}

// Mouse veya parmak konumunu al
function getMousePos(e) {
  const rect = canvas1.getBoundingClientRect();
  const scaleX = canvas1.width / rect.width;
  const scaleY = canvas1.height / rect.height;

  let clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
  let clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

  if (clientX == null || clientY == null) return null;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

// Olay dinleyicileri
canvas1.addEventListener("mousedown", startDrawing);
canvas1.addEventListener("mouseup", stopDrawing);// Mouse canvas'a girdiğinde
canvas1.addEventListener("mouseleave", stopDrawing); 
canvas1.addEventListener("mousemove", draw);

canvas1.addEventListener("touchstart", startDrawing);
canvas1.addEventListener("touchend", stopDrawing);
canvas1.addEventListener("touchmove", draw);