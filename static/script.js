const $ = document.querySelector.bind(document);
const dialog = $('#new-element');
const form = $('#new');
const btn1 = $('#addfolder');
const btn2 = $('#addfile');
const delfolders = $('#folder');
const delfiles = $('#dfiles');
const cancelBtn1 = $('#cancel1');
const cancelBtn2 = $('#cancel2');
const upload = $('#upload');
const uploadform = $('#uploadform');
const delfile = $('#delfilebtn');
const delfolder = $('#delfolderbtn');
const nameFormBtn = $('#newnamebtn');
const nameForm = $('#new-element-name');
const actualForm = $('#file-upload');
const fileChosen = $('#file-chosen');
const textArea = $('#text-contents');
const lineCounter = $('#line-counter');
const changecolor = $('#changecolor');
const styleSwitcher = $('#style-switcher');
const fontAdd = $('#add');
const fontLessen = $('#less');
const saveSettings = $('#saveSettings');
const saveChanges = $('#saveChanges');
const fileNameDialog = $('#new-file-name');
const renameFile = $('#renameFile');
const cancelBtn3 = $('#cancel3');
const ip = 'http://192.168.xx.xxx';
const mainImageDiv = $('#main-image-div');
const filterSection = $('.filters-display');
const moveSec = $('#moveSec');
const lilImgs = document.querySelectorAll('.lil-imgs');
const saveImgBtn = $('#saveImg');
const loginWindow = $('.background-of-login')
const accounts = $('.accounts')

if (accounts) {

}
else if (loginWindow) {

}
else if (mainImageDiv) {
  const image = mainImageDiv;
  let dataUrl;
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = image.naturalHeight;
    canvas.width = image.naturalWidth;
    ctx.drawImage(image, 0, 0);
    dataUrl = canvas.toDataURL();
  };
  saveImgBtn.addEventListener('click', async () => {
    const response = await fetch(ip + ':4000/imageSaved', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newImg: dataUrl,
      }),
    });
    const res = await response.json();
    alert(res);
  });
  moveSec.addEventListener('click', () => {
    filterSection.classList.contains('here')
      ? filterSection.classList.remove('here')
      : filterSection.classList.add('here');
  });
  for (var i = 0; i < lilImgs.length; i++) {
    let filter = lilImgs[i].style.filter;
    lilImgs[i].addEventListener('click', (e) => {
      mainImageDiv.style.filter = filter;
      const image = mainImageDiv;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = image.naturalHeight;
      canvas.width = image.naturalWidth;
      ctx.filter = filter
      ctx.drawImage(image, 0, 0);
      dataUrl = canvas.toDataURL();
      console.log(dataUrl.substr(0,36));
    });
  }
  renameImg.addEventListener('click', () => {
    fileNameDialog.showModal();
  });

  cancelBtn3.addEventListener('click', () => {
    fileNameDialog.close();
  });
} else if (fontLessen) {
  var fontSize = 14;
  var styleIte = 0;
  let val = 1;

  updateFont = () => {
    lineCounter.style.fontSize = String(fontSize) + 'px';
    lineCounter.style.height = String(val * fontSize * 1.3) + 'px';
    lineCounter.style.width = String(fontSize * 2) + 'px';
    textArea.style.fontSize = String(fontSize) + 'px';
    textArea.style.height = String(val * fontSize * 1.3) + 'px';
  };

  let lines = textArea.value.split('\n');
  lines.forEach((e) => {
    lineCounter.value += String(val) + '\n';
    val++;
  });

  changecolor.addEventListener('click', () => {
    if (styleIte != 3) {
      styleIte++;
      styleSwitcher.classList.remove(`style${styleIte - 1}`);
      styleSwitcher.classList.add(`style${styleIte}`);
    } else {
      styleIte = 0;
      styleSwitcher.classList.remove(`style3`);
      styleSwitcher.classList.add(`style${styleIte}`);
    }
    console.log(styleIte);
  });

  saveChanges.addEventListener('click', async () => {
    if (/[^\u0000-\u00ff]/g.test(textArea.value)) {
      //wykryj znaki spoza ISO
      alert('wykryto znaki spoza standardu ISO-8859-1!');
    } else {
      const response = await fetch(ip + ':4000/sendChanged', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          body: JSON.stringify({
            newText: textArea.value,
          }),
        },
      });
      const res = await response.json();
      alert(res);
    }
  });

  renameFile.addEventListener('click', () => {
    fileNameDialog.showModal();
  });

  cancelBtn3.addEventListener('click', () => {
    fileNameDialog.close();
  });

  arrayFromRange = (start, stop) => {
    return Array.from(
      { length: stop - start + 1 },
      (value, index) => start + index
    );
  };

  onTextareaInput = () => {
    var key = window.event.keyCode;
    if (key == 13) {
      //if enter dodaj linijke
      lineCounter.value += String(val) + '\n';
      lineCounter.style.height = String(val * fontSize * 1.3) + 'px';
      textArea.style.height = String(val * fontSize * 1.3) + 'px';
      val++;
    } else if (key == 8) {
      //if backspace zlicz linijki
      val = textArea.value.split('\n').length;
      counterArr = String(arrayFromRange(1, val)).replaceAll(',', '\n') + '\n';
      lineCounter.value = counterArr;
      lineCounter.style.height = String(val * fontSize * 1.3) + 'px';
      textArea.style.height = String(val * fontSize * 1.3) + 'px';
      val++;
    }
  };

  saveSettings.addEventListener('click', async () => {
    const response = await fetch(ip + ':4000/sendSettings', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        body: JSON.stringify({
          size: fontSize,
          color: styleIte,
        }),
      },
    });
    const res = await response.json();
    alert(res);
  });

  refreshAll = async () => {
    const response = await fetch(ip + ':4000/getSettings');
    const json = await response.json();
    console.log(json);
    styleIte = json.color;
    fontSize = json.size;

    fontAdd.addEventListener('click', () => {
      fontSize++;
      updateFont();
    });
    fontLessen.addEventListener('click', () => {
      fontSize--;
      updateFont();
    });
    styleSwitcher.classList.add(`style${styleIte}`);
    updateFont();
  };
  refreshAll();
} else {
  actualForm.addEventListener('change', () => {
    fileChosen.textContent = actualForm.value;
  });

  upload.addEventListener('click', () => {
    if ($('#file-upload').value) {
      upload.type = 'submit';
      uploadform.submit();
    }
  });
  cancelBtn1.addEventListener('click', () => {
    dialog.close();
  });
  btn1.addEventListener('click', () => {
    $('#dialogtext').innerHTML = 'nazwa nowego folderu:';
    dialog.showModal();
  });
  btn2.addEventListener('click', () => {
    form.action = '/newfile';
    $('#dialogtext').innerHTML = 'nazwa nowego pliku:';
    dialog.showModal();
  });
  function logdelete(event) {
    confirm('Jesteś pewny, że chcesz to usunąć?') ? event.submit() : null;
  }
  if (nameFormBtn) {
    nameFormBtn.addEventListener('click', () => {
      nameForm.showModal();
    });
  }

  cancelBtn2.addEventListener('click', () => {
    nameForm.close();
  });
}
