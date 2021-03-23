let btnscrap = document.getElementById('btnscrap')

btnscrap.addEventListener('click', async ()=>{
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    var port = chrome.tabs.connect(tab.id);
    var serachText = document.getElementById('searchText').value;
  
    if(serachText){
        document.getElementById('loader').style.display = "block";
        port.postMessage({acction: 'search', searchtext:serachText});
    }
   
})






