const dialog = document.querySelector('#new-element');
const form = document.querySelector('#new');
const btn1 = document.querySelector('#addfolder');
const btn2 = document.querySelector('#addfile');
const delfolders = document.querySelector('#folder');
const delfiles = document.querySelector('#dfiles');
const cancelBtn1 = document.querySelector('#cancel1');
const cancelBtn2 = document.querySelector('#cancel2');
const upload = document.querySelector('#upload');
const uploadform = document.querySelector('#uploadform');
const delfile = document.querySelector('#delfilebtn');
const delfolder = document.querySelector('#delfolderbtn');
const nameFormBtn = document.querySelector('#newnamebtn');
const nameForm = document.querySelector('#new-element-name');
const actualForm = document.getElementById('file-upload');
const fileChosen = document.getElementById('file-chosen');
const textArea = document.getElementById('text-contents');
const lineCounter = document.getElementById('line-counter');
const changecolor = document.getElementById('changecolor');
const styleSwitcher = document.getElementById('style-switcher');
const fontAdd = document.getElementById('add')
const fontLessen = document.getElementById('less')
const saveSettings = document.getElementById('saveSettings')
const saveChanges = document.getElementById('saveChanges')
const fileNameDialog = document.getElementById('new-file-name')
const renameFile = document.getElementById('renameFile')
const cancelBtn3 = document.getElementById('cancel3')

if (fontLessen){
  var fontSize = 14
  var styleIte = 0
  let lines = textArea.value.split("\n");
  let val = 1

  updateFont = () => {
    lineCounter.style.fontSize = String(fontSize) + 'px'
    lineCounter.style.height = String(val * fontSize * 1.3) + 'px'
    lineCounter.style.width = String(fontSize * 2) + 'px'
    textArea.style.fontSize = String(fontSize) + 'px'
    textArea.style.height = String(val * fontSize * 1.3) + 'px'
  }

  lines.forEach(e => {
    lineCounter.value += String(val) + '\n'
    val++
  });

  changecolor.addEventListener('click', () => {
    if(styleIte != 3) {
      styleIte++
      styleSwitcher.classList.remove(`style${styleIte-1}`)
      styleSwitcher.classList.add(`style${styleIte}`)
    }
    else {
      styleIte = 0
      styleSwitcher.classList.remove(`style3`)
      styleSwitcher.classList.add(`style${styleIte}`)
    }
    console.log(styleIte);
  })

  saveChanges.addEventListener('click', async() => {
    const response = await fetch('http://192.168.10.112:4000/sendChanged', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        body: JSON.stringify({
          newText: textArea.value
        }),
      },
    });
    const res = await response.json()
    alert(res);
  })

  renameFile.addEventListener('click', () => {
    fileNameDialog.showModal()
  })

  cancelBtn3.addEventListener('click', () => {
    fileNameDialog.close()
  })

  saveSettings.addEventListener('click', async() => {
    const response = await fetch('http://192.168.10.112:4000/sendSettings', {
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
    const res = await response.json()
    alert(res);
  })
  
  refreshAll = async() => {
    const response = await fetch('http://192.168.10.112:4000/getSettings');
    const json = await response.json();
    console.log(json);
    styleIte = json.color
    fontSize = json.size
  
    fontAdd.addEventListener('click', () => {fontSize++; updateFont()})
    fontLessen.addEventListener('click', () => {fontSize--; updateFont()})
    styleSwitcher.classList.add(`style${styleIte}`)
    updateFont()
  }
  refreshAll()
}
else {
  actualForm.addEventListener('change', () => {
    fileChosen.textContent = actualForm.value;
  });

  upload.addEventListener('click', () => {
    if (document.querySelector('#file-upload').value) {
      upload.type = 'submit';
      uploadform.submit();
    }
  });
  cancelBtn1.addEventListener('click', () => {
    dialog.close();
  });
  btn1.addEventListener('click', () => {
    document.querySelector('#dialogtext').innerHTML = 'nazwa nowego folderu:';
    dialog.showModal();
  });
  btn2.addEventListener('click', () => {
    form.action = '/newfile';
    document.querySelector('#dialogtext').innerHTML = 'nazwa nowego pliku:';
    dialog.showModal();
  });
  function logdelete(event) {
    confirm('Jesteś pewny, że chcesz to usunąć?') ? event.submit() : null;
  }
  if (nameFormBtn){
    nameFormBtn.addEventListener('click', () => {
      nameForm.showModal();
    });
  }

  cancelBtn2.addEventListener('click', () => {
    nameForm.close();
  });
}