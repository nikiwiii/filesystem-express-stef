const dialog = document.querySelector('#new-element');
const form = document.querySelector('#new');
const btn1 = document.querySelector('#addfolder');
const btn2 = document.querySelector('#addfile');
const delfolders = document.querySelector('#folder');
const delfiles = document.querySelector('#files');
const cancelBtn1 = document.querySelector('#cancel1');
const cancelBtn2 = document.querySelector('#cancel2');
const upload = document.querySelector('#upload');
const uploadform = document.querySelector('#uploadform');
const delfile = document.querySelector('#delfilebtn');
const delfolder = document.querySelector('#delfolderbtn');
const nameFormBtn = document.querySelector('#newnamebtn')
const nameForm = document.querySelector('#new-element-name')

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
nameFormBtn.addEventListener('click', () => {
  nameForm.showModal();
})
cancelBtn2.addEventListener('click', () => {
  nameForm.close();
});
