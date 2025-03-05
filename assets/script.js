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
          
          SendMessage('mySendMessage', 'send-messages', true, `Sunucuya <b id='NameColor${Kullanicilar.length}'  style='font-size: 14px;'>${data.name}</b> katıldı!`);

          console.log(Kullanicilar.length);
          /* for (let i = 0; i < Kullanicilar.length; i++) {
           // Kullanicilar.push({name:Kullanicilar[i].name, img: Kullanicilar[i].img, id: i+1});
          } */

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
  console.log(data);

  Kullanicilar = data.KullanicilarM;

  //kullanıcıların hepsine id ver
  if (MyId == undefined) {
    return;
  }

  for (let i = 0; i < Kullanicilar.length; i++) {
    let user = Kullanicilar[i]

    console.log('Benim ilk id:'+MyId);
    console.log(user);
    console.log('id: '+ (i + 1));
    console.log((i + 1));
    console.log(i + 1);
    console.log(user.name, $('#myName').val());
    console.log(user.name == $('#myName').val())
    
    if (user.name == $('#myName').val()) {
      MyId =  i + 1;
    }

    console.log('Benim id:'+MyId);
    console.log('--------------------------');

    Kullanicilar.push({name:Kullanicilar[i].name, img: Kullanicilar[i].img, id: i+1});
  }

  
  scorBoardRefresh();
});
  


//Kullanıcı siteden çıkarsa
channel.bind("client-user-left", (data) => {
  console.log('?--------client-user-left--------?');
  console.log('Kullanıcı çıktı:');
  console.log(data);
  
  if (Kullanicilar[0] && $('#myName').val()) {
    if (Kullanicilar[0].name == $('#myName').val()) {
      console.log('Ben hostum!');
      console.log('Eski Kullanıcılar:');
      console.log(Kullanicilar);

      Kullanicilar = Kullanicilar.filter((user) => user.name !== data.name);

      SendMessage('mySendMessage', 'send-messages', true, `<b id='NameColor${data.id}'  style='font-size: 14px;'>${data.name}</b> <b style='color: red; font-size: 14px;'>sunucudan ayrıldı!</b>`);

      console.log('Yeni Kullanıcılar:');
      console.log(Kullanicilar);

      channel.trigger("client-user", {
        KullanicilarM: Kullanicilar,
      });
      channel.trigger("client-RemoveMessageUser", {
        name: data.name,
        message: 'Sunucudan '+data.name+' ayrıldı!',
        massageDiv: 'chat-messages',
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
}
);

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









