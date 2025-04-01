//Pusher
let pusher; // Pusher nesnesi
var channel;

// Resim
let preview; //Görsel önizleme
let imageUrl; // Görsel URL'si

//kullanıcı bilgileri
let Kullanicilar = []; // Kullanıcılar dizisi
let MyId; //Benim id'm
let pings = []; //5 saniyedir sunucuda olanların listesi

// Tema kelime ve sıradaki
let order = 1; //Çizim sırası kimdeyse onu bekleriz
let SecilenKelime; //adı üstünde
let Tema;

let ArtTime = 60;

//Puan
let turPuan = 10; //Doğru cevap verme puanı
let bilensayisi = 0; //Doğru cevap veren kişi sayısı
let cevapVerebilenSayisi; //Cevap verebilen kişi sayısı

const JoinTheGameSound = $('#JoinTheGameS')[0];
const LeftTheGameSound = $('#LeftTheGameS')[0];

const SecimSirasiSendeSound = $('#SecimSirasiSendeS')[0];
const WordSelectSound = $('#WordSelectS')[0];

const buttonClick1Sound = $('#button-click1S')[0];

const correctSound = $('#correctS')[0];
const wrongSound = $('#wrongS')[0];

const AllCorrect = $('#AllCorrect')[0];

//Rastgele sayı üretme fonksiyonu
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

    console.log('Gönderilen Mesaj: ',data);

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
  console.log('?-----Biri Sunucuya Girdi------?');

  if (Kullanicilar[0] && $('#myName').val()) {
    if (Kullanicilar[0].name == $('#myName').val()) {
      console.log('--------Ben hostum--------');
      console.log('Gelen kullanıcı: ',data);

      //Eğer aynı isimde başka bir kullanıcı varsa oyuna giremez
        if (Kullanicilar.find(user => user.name === data.name)) {
          console.log('Bu isimde bir kullanıcı var!');

          channel.trigger("client-user-left-game", {
            name: data.name,
            id : Kullanicilar.length,
          });

        }else{
          Kullanicilar.push({name: data.name, img: data.img, id: Kullanicilar.length + 1, puan : 0});

          console.log('Kullanıcılar: ',Kullanicilar);
          
          SendMessage('mySendMessage', 'chat-messages', true, `<p style='color:green;margin:0;'><i class="fa-solid fa-door-open"></i> Sunucuya <b style='font-size: 14px;'>${data.name}</b> katıldı!</p>`);

          pings.push({id :Kullanicilar.length});

          channel.trigger("client-user", {
            KullanicilarM: Kullanicilar,
          });
          
          JoinTheGameSound.play(); // Sesi başlat

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

      if (user.name == $('#myName').val()) {
      MyId = user.id;
      }
    });

  
  scorBoardRefresh();
});
  


//Kullanıcı siteden çıkarsa
channel.bind("client-user-left", (data) => {
  console.log('?--------Sunucudan Biri Çıktı--------?');
  console.log('Şu Kullanıcı çıktı: ',data);

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

      SendMessage('mySendMessage', 'chat-messages', true, `<p style='color:red;margin:0;'><i class="fa-solid fa-plug-circle-xmark"></i> <b style='font-size: 14px;'>${data.name}</b>(Yönetici) bağlantısı gitti! Yeni yönetici: <b style='font-size: 14px;'>${Kullanicilar[0].name}</b></p>`);
    }

    scorBoardRefresh();
    console.log(LeftTheGameSound);

    if (order == data.id) {
      if (data.id == 1) {
        OyunBitirArtistLeftTheGame(data.name);
      }else{
        OyunBitirArtistLeftTheGame();
      }
    }else{
      StartGamingEvresi1();
    }
    
    LeftTheGameSound.play(); // Sesi başlat

    return;
  }
  
  if (Kullanicilar[0] && $('#myName').val()) {
    if (Kullanicilar[0].name == $('#myName').val()) {
      console.log('------------Ben hostum!------------');
      console.log('Eski Kullanıcılar: ',Kullanicilar);

      Kullanicilar = Kullanicilar.filter((user) => user.name !== data.name);

      // Kullanıcıların id'lerini yeniden düzenle
      Kullanicilar.forEach((user, index) => {
        user.id = index + 1;
      });

      SendMessage('mySendMessage', 'chat-messages', true, `<p style='color:red;margin:0;'><i class="fa-solid fa-plug-circle-xmark"></i> <b style='font-size: 14px;'>${data.name}</b> bağlantısı gitti!</p>`);

      console.log('Yeni Kullanıcılar: ',Kullanicilar);

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
    LeftTheGameSound.play();
  console.log('*---------------------------------*');
  console.warn('');
});


channel.bind("client-ping", (data) => {
  if (Kullanicilar[0] && $('#myName').val()) {
    if (Kullanicilar[0].name == $('#myName').val()) {
      pings.push(data);
    }
  }
});








// Kelime seçildi
channel.bind('client-WordSelect', function(data) {

  const timerInterval = setInterval(() => {
    if (remainingTime > 0) {
      console.log(`Remaining time: ${remainingTime} seconds`);
      $(`#TimeBarr`).css('width', `${(remainingTime / ArtTime) * 100}%`);
      $(`#TimeBarr`).attr('aria-valuenow', remainingTime);
      remainingTime -= 0.1;
    } else {
      $(`#TimeBarr`).css('width', `0%`);
      OyunBitir();
      clearInterval(timerInterval);
      console.log("Time's up!");
      // Trigger any necessary actions when the timer ends
    }
  }, 100);

  SecilenKelime = data.Word;
  order = data.order;
  Tema = data.secilenTema;
  bilensayisi = 0;
  cevapVerebilenSayisi = Kullanicilar.length-1;
  
  $('#mySendMessage').addClass('activeSend');

  $('#SelectWordView').html('');
  ButtonsActiv(document.getElementById('drawingCanvas'),'HostDivMegaMenus','close',true);
  
  WordSelectSound.play(); // Sesi başlat
});



//Kullanıcı siteden çıkarsa
channel.bind("client-paunSistem", (data) => {
  console.log('?--------PuanEkle--------?');
  
  if (Kullanicilar[0] && $('#myName').val()) {
      if (1 == MyId) {

        let oo = true;
        let oo2 = true;

        console.log('Şu Kullanıcı: ',data.id,' +',turPuan);

        Kullanicilar.forEach(user => {
          if (data.id == user.id) {
            if (oo) {
              user.puan += turPuan;
              console.log( bilensayisi);
              bilensayisi += 1;
              console.log( bilensayisi);
              if (turPuan > 1) {
                turPuan -= 1;
              }
              oo = false;
            }
          }
        });

        Kullanicilar.forEach(user => {
          if (order == user.id) {
            if (oo2) {
              user.puan += 10;
              oo2 = false;
            }
          }
        });

        //buraya puana gör listeyi sırala
        Kullanicilar.sort((a, b) => b.puan - a.puan);

        channel.trigger("client-user", {
          KullanicilarM: Kullanicilar,
        });

        console.log(bilensayisi,'',cevapVerebilenSayisi)
        if (bilensayisi == cevapVerebilenSayisi) {
          OyunBitir();
          order += 1;
          channel.trigger("client-ArtFinish", {
            KullanicilarM: Kullanicilar,
          });
        }

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


channel.bind("client-ArtFinish", (data) => {
  Kullanicilar = data.KullanicilarM;

  order += 1;
  if (order > Kullanicilar.length) {
    order = 1;
  }
  OyunBitir();
})









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

      let backgroundColorTrueOrFalse = undefined;
      let numberSecilenKelime = 0;

      message = escapeOutput($(`#${messageInput}`).val());
      name = escapeOutput($('#myName').val());

      if (messageDiv == 'send-messages') {
        if (SecilenKelime == message) {
          trueMat(`<p style='color:green;margin:0;'><i class="fa-solid fa-check"></i> <b style='font-size: 14px;'>${name}</b> doğru bildi!</p>`,true);
          $(`#${messageInput}`).val('');
          return;
        }else{


          for (let i = 0; i < SecilenKelime.length; i++) {
            const element = SecilenKelime[i];
            
            if(element == message[i]){
              numberSecilenKelime += 1;
            }
          }

          if (SecilenKelime.length - 1 == numberSecilenKelime) {
            trueMat(`<p style='color:yellow;margin:0;'><i class="fa-solid fa-not-equal"></i> <b style='font-size: 14px;'>${name}</b> çok yaklaştın! cevabın : ${message}</p>`,false);
            $(`#${messageInput}`).val('');
            return;
          }else if(SecilenKelime.length - 2 == numberSecilenKelime){
            trueMat(`<p style='color:orange;margin:0;'><i class="fa-solid fa-not-equal"></i> <b style='font-size: 14px;'>${name}</b> yaklaştın! cevabın : ${message}</p>`,false);
            $(`#${messageInput}`).val('');
            return;
          }else if(SecilenKelime.length - 3 == numberSecilenKelime){
            trueMat(`<p style='color:red;margin:0;'><i class="fa-solid fa-not-equal"></i> <b style='font-size: 14px;'>${name}</b> yakın! cevabın : ${message}</p>`,false);
            $(`#${messageInput}`).val('');
            return;
          }
        }
      }else{
        if (SecilenKelime == message) {
          return
        }
      }

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
                      <div class="text" style='${backgroundColorTrueOrFalse ? 'background-color:'+backgroundColorTrueOrFalse+';' : ''}'><b id='NameColor${MyId}' class='col-12'>${name}</b><div class='col-12'>${message}</div></div>
                  </div>
              `);
    }
    $(`#${messageInput}`).val('');
  };

}










function trueMat(ServerMessage,trueOrFalse){
  setupChatScroll(`#send-messages`);
  mesajEkle(`#send-messages`);

  if (trueOrFalse) {
    channel.trigger("client-ChatMessage", {
      name: 'Server78901234567890',
      message: ServerMessage,
      img: 'serverImg',
      massageDiv: 'send-messages',
    });

    channel.trigger('client-paunSistem', {
      id: MyId,
    });
    
  if (Kullanicilar[0] && $('#myName').val()) {
    if (1 == MyId) {

      let oo = true;
      let oo2 = true;

      console.log('Şu Kullanıcı: ',1,' +',turPuan);

      Kullanicilar.forEach(user => {
        if (1 == user.id) {
          if (oo) {
            user.puan += turPuan;
            console.log( bilensayisi);
            bilensayisi += 1;
            console.log( bilensayisi);
            if (turPuan > 1) {
              turPuan -= 1;
            }
            oo = false;
          }
        }
      });

      Kullanicilar.forEach(user => {
        if (order == user.id) {
          if (oo2) {
            user.puan += 10;
            oo2 = false;
          }
        }
      });

      //buraya puana gör listeyi sırala
      Kullanicilar.sort((a, b) => b.puan - a.puan);

      channel.trigger("client-user", {
        KullanicilarM: Kullanicilar,
      });

      console.log(bilensayisi,'',cevapVerebilenSayisi)
      if (bilensayisi == cevapVerebilenSayisi) {

        OyunBitir();
        order += 1;
        if (order > Kullanicilar.length) {
          order = 1;
        }
        channel.trigger("client-ArtFinish", {
          KullanicilarM: Kullanicilar,
        });
      }

    }else{
      console.log('Ben host değilim!');
    }
  }else{
    console.log('Ben oyunda değilim!');
  }

scorBoardRefresh();
console.log('*---------------------------------*');
console.warn('');

    $('#mySendMessage').removeClass('activeSend').blur();

    correctSound.play();
  }else{
    wrongSound.play();
  }

  $(`#send-messages`).append(`
                <div class="message ServerMessage">
                    <div class="text">${ServerMessage}</div>
                </div>`);
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
  Kullanicilar.push({name: NewUserName, img: preview ? imageUrl: null, id: 1, puan : 0});
  MyId = 1;

  scorBoardRefresh();
      
  StartGamingEvresi1();
  //--------------------------------------------------------------------------------
  //eğer sunucuda biri varsa kendi bilgilerini gönder ve hostluktan çık
  channel.trigger("client-Is-there-anyone", {
    name: NewUserName,
    img: preview ? imageUrl: null,
  });

  JoinTheGameSound.play(); // Sesi başlat
}






// Sayfadan ayrılınca kullanıcıyı çıkart
window.addEventListener("beforeunload", function (event) {
  if (MyId !== undefined) {
    channel.trigger("client-user-left", {
      name: $('#myName').val().trim(),
      id: MyId, 
    });
    
    console.log("Sayfadan ayrılma isteği gönderildi:", MyId); // Türkçe console.log
  } else {
    console.log("MyId tanımlı değil, ayrılma isteği gönderilmedi."); // Türkçe console.log
  }
});


// Kullanıcıya her 5 saniyede bir ping at
/* setInterval(() => {
  if (MyId !== undefined) {
    pings.push({id : MyId});
    channel.trigger("client-ping", { id: MyId });
  }
}, 5000); */

/* setInterval(() => {
  if (MyId == 1) {
    console.log('--------Kullanıcı Testi--------');

    
    if (pings.length == 0) {return;}

    Kullanicilar.forEach((kullanici, i) => {
      


      for (let a = 0; a < pings.length; a++) {

        if (pings[a].id == kullanici.id || kullanici.id == 1) {
          return;
        }
      }

      console.log(Kullanicilar);

      Kullanicilar = Kullanicilar.filter((user) => user.name !== kullanici.name);

      // Kullanıcıların id'lerini yeniden düzenle
      Kullanicilar.forEach((user, index) => {
        user.id = index + 1;
      });

      SendMessage('mySendMessage', 'send-messages', true, `<p style='color:red;margin:0;'><i class="fa-solid fa-plug-circle-xmark"></i> <b style='font-size: 14px;'>${kullanici.name}</b> bağlantısı gitti!</p>`);


      channel.trigger("client-user", {
        KullanicilarM: Kullanicilar,
      });

      channel.trigger("client-user-left", {
        name: kullanici.name,
        id: kullanici.id, 
      });

      
      scorBoardRefresh();


      console.log(pings);
      console.log(kullanici);
      console.log(pings[a]);
      console.log("Kullanıcı bağlantıyı kaybetti, çıkartılıyor. ", kullanici,' ' + kullanici.id);
      
      LeftTheGameSound.play(); // Sesi başlat
    });
  }

  pings = [];
}, 10000); */







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
          <div class="playerPuan ${Theme}"><p><b id='NameColor${user.id}'>${user.name}</b></p><p id='Puan' class='${Theme}'>Puan: <span class='${Theme}'>${user.puan}</span></p></div>
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











function StartGamingEvresi1() {
  ButtonsActiv(document.getElementById('WaitMassege'),'HostDivMegaMenus','close',true);

  const Html = 'Sunucu Aranıyor';
  $('#WaitMassegeP').html(Html);
  setTimeout(() => $('#WaitMassegeP').html(Html+'.'), 500);
  setTimeout(() => $('#WaitMassegeP').html(Html+'..'), 1000);
  setTimeout(() => $('#WaitMassegeP').html(Html+'...'), 1500);

  setTimeout(function(){
  if (MyId == 1) {
    ButtonsActiv(document.getElementById('HostDivMega'),'HostDivMegaMenus','close',true);

  }else{

    ButtonsActiv(document.getElementById('NotHostMassege'),'HostDivMegaMenus','close',true);

    const notHostMessage = 'Yöneticinin oyunu başlatması bekleniyor';
    const updateMessage = () => {
      $('#NotHostMassegeP').html(notHostMessage);
      setTimeout(() => $('#NotHostMassegeP').html(notHostMessage + '.'), 500);
      setTimeout(() => $('#NotHostMassegeP').html(notHostMessage + '..'), 1000);
      setTimeout(() => $('#NotHostMassegeP').html(notHostMessage + '...'), 1500);
    };
    updateMessage();
    setInterval(updateMessage, 2000);
  
  }}, 2000);
}

function ButtonsActiv(button,buttonClass,AddClass,RemoveOrAdd) {
  if (RemoveOrAdd) {
    $(`.${buttonClass}`).addClass(AddClass);
  
    button.classList.remove(AddClass);
  }else{
    $(`.${buttonClass}`).removeClass(AddClass);
  
    button.classList.add(AddClass);
  }
}





function KelimeView(){

  $('#mySendMessage').removeClass('activeSend').blur();

  if (1 == MyId) {
    if (document.getElementsByClassName('active') && document.getElementsByClassName('active')[0]) {
      const buton = document.getElementsByClassName('active');
      console.log(document.getElementsByClassName('active'), document.getElementsByClassName('active')[0])
      Tema = buton[0].parentNode.children[0].innerHTML;
    }
  }

  ButtonsActiv(document.getElementById('ResimSelecter'),'HostDivMegaMenus','close',true);

  

  let Viewkelime1 = kelimeler[Tema][getRndInteger(0, kelimeler[Tema].length - 1)];
  let Viewkelime2 = kelimeler[Tema][getRndInteger(0, kelimeler[Tema].length - 1)];

  $('.DrawH1').eq(0).html(Viewkelime1);
  $('.DrawH1').eq(1).html(Viewkelime2);
  SecimSirasiSendeSound.play(); // Sesi başlat
}

function SelectKelime(SelectedWord){
  SecilenKelime = SelectedWord.parentNode.children[0].innerHTML
  
  $('#SelectWordView').html(SecilenKelime);
  ButtonsActiv(document.getElementById('drawingCanvas'),'HostDivMegaMenus','close',true);

  // Start the timer for the drawing phase
  let remainingTime = ArtTime; // ArtTime is the duration of the timer

  const timerInterval = setInterval(() => {
    if (remainingTime > 0) {
      console.log(`Remaining time: ${remainingTime} seconds`);
      $(`#TimeBarr`).css('width', `${(remainingTime / ArtTime) * 100}%`);
      $(`#TimeBarr`).attr('aria-valuenow', remainingTime);
      remainingTime -= 0.1;
    } else {
      $(`#TimeBarr`).css('width', `0%`);
      OyunBitir();
      clearInterval(timerInterval);
      console.log("Time's up!");
      // Trigger any necessary actions when the timer ends
    }
  }, 100);
  

  if (Kullanicilar.length < order) {
    order = 1;
  }
  WordSelectSound.play(); // Sesi başlat

  bilensayisi = 0;

  cevapVerebilenSayisi = Kullanicilar.length-1;

  channel.trigger("client-WordSelect", {
    Word: SecilenKelime,
    order: order,
    secilenTema: Tema,
  });

  
}





function OyunBitir(){

  AllCorrect.play();

  // Çizim alanını temizle
  clearCanvas();

  ButtonsActiv(document.getElementById('GameEndAllCorrect'),'HostDivMegaMenus','close',true);
  setTimeout(() => {
    if (order == MyId) {
      KelimeView()
    }else{
      ButtonsActiv(document.getElementById('Art'),'HostDivMegaMenus','close',true);
      if (!$('ArtistMassege')) {
        console.error('ArtistMassege bulunamadı!');
      }
      if (!Kullanicilar[order-1]) {
        console.error('Kullanıcı bulunamadı! Kullanıcı: ', Kullanicilar[order-1], 'Order-1: ', order-1, 'Kullanıcılar: ', Kullanicilar, 'MyId: ', MyId, 'order: ', order);
      }
      if (!Kullanicilar[order-1].name) {
        console.error('Kullanıcı ismi bulunamadı! Kullanıcı: ', Kullanicilar[order-1], 'Order-1: ', order-1, 'Kullanıcılar: ', Kullanicilar, 'MyId: ', MyId, 'order: ', order, 'Kullanıcılar[order-1].name: ', Kullanicilar[order-1].name);
      }
      if (!Kullanicilar) {
        console.error('Kullanıcılar bulunamadı! Kullanıcı: ', Kullanicilar[order-1], 'Order-1: ', order-1, 'Kullanıcılar: ', Kullanicilar, 'MyId: ', MyId, 'order: ', order, 'Kullanıcılar[order-1].name: ', Kullanicilar[order-1].name);
      }
      console.log('Kullanıcılar bulunamadı! Kullanıcı: ', Kullanicilar[order-1], 'Order-1: ', order-1, 'Kullanıcılar: ', Kullanicilar, 'MyId: ', MyId, 'order: ', order, 'Kullanıcılar[order-1].name: ', Kullanicilar[order-1].name);
      $('#ArtistMassege').html(Kullanicilar.find(user => user.id === order).name+' kelime seçiyor');
    }
  }, 3000);
}



function OyunBitirArtistLeftTheGame(hostName){
  let user;
  if (hostName) {
    user = hostName;
  }else{
    user = Kullanicilar[order].name;
  }

  // Çizim alanını temizle
  clearCanvas();

  ButtonsActiv(document.getElementById('ArtistLeftTheGame'),'HostDivMegaMenus','close',true);
  $('#ArtistLeftMassege').html(user+' oyundan çıktı. Sırasını kaybetti');
  
  setTimeout(() => {
    if (order == MyId) {
      KelimeView();
    }else{
      ButtonsActiv(document.getElementById('Art'),'HostDivMegaMenus','close',true);
      $('#ArtistMassege').html(Kullanicilar[order].name+' kelime seçiyor');
    }
  }, 3000);
}
















let Idraw = false;

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
  
  console.log(order,' ',MyId,' ',order == MyId);
  if (order != MyId) return;

  if (!Idraw) {
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

function clearCanvas() {
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
}








//SES KISMI

document.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    if (button.classList.contains('NotSound')) {return;}

      buttonClick1Sound.play(); // Sesi başlat
  });
});