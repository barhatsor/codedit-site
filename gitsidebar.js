
// toggle sidebar on click of bookmark
github.addEventListener('click', () => {
  
  body.classList.toggle('expanded');
  
})


// render files
// call this function when signed in to github
// to render sidebar
async function renderFiles() {
  
  // map tree location
  let query = 'https://api.github.com';
  const [user, repo, contents] = treeLoc;
  
  // if navigating in repository
  if (repo != '') {
    
    query += '/repos/'+ user +'/'+ repo +'/contents'+ contents;
    
  } else { // else, show all repositories
    
    query += '/user/repos?visibility=all&sort=updated&page=1';
    
  }

  // get the query
  var resp = await axios.get(query, githubToken);
  
  // save rendered HTML
  let out = '';
  
  // if response
  if (resp) {
    
    // show title
    
    sidebarLogo.classList.remove('overflow');
    
    if (contents != '') {
      
      // show path
      sidebarLogo.innerText = repo + contents;
      
      // if path is too long, overflow
      if (sidebarLogo.innerText.length > 25) {
        
        sidebarLogo.classList.add('overflow');
        
      }
      
    } else if (repo != '') {
      
      // show repo name
      sidebarLogo.innerText = repo;
      
    } else {
      
      // show title
      sidebarLogo.innerText = 'Repositories';
      
    }
    
    
    // if navigating in repository
    if (repo != '') {
      
      // render files
      resp.forEach(item => {
        
        // if item is a file
        if (item.type == 'file') {
          
          // add modified flag to file
          let modified = '';
          if (modifiedFiles[item.sha]) modified = 'modified';
          
          out += `
          <div class="item file `+ modified +`" sha="`+ item.sha +`">
            <div class="label">
              `+ fileIcon +`
              <a class="name">`+ item.name +`</a>
            </div>
            `+ pushIcon +`
          </div>
          `;
          
          
        } else { // if item is a folder
          
          out += `
          <div class="item folder">
            <div class="label">
              `+ folderIcon +`
              <a class="name">`+ item.name +`</a>
            </div>
            `+ arrowIcon +`
          </div>
          `;
          
        }
        
      });
      
    } else { // else, show all repositories
      
      // render repositories
      resp.forEach(item => {
        
        // if repo is not user-created,
        // show username of admin (username/repo)
        let fullName = item.permissions.admin ? item.name : item.full_name;
        
        out += `
        <div class="item repo" fullname="`+ item.full_name +`">
          <div class="label">
            `+ repoIcon +`
            <a class="name">`+ fullName +`</a>
          </div>
          `+ arrowIcon +`
        </div>
        `;
        
      });
      
    }
    
  }
  
  // add rendered HTML to dom
  fileWrapper.innerHTML = out;
  sidebar.scrollTo(0, 0);
  
  // add item event listeners
  addItemListeners();
  
  // if selected file exists
  if (getStorage('selectedFile')) {
    
    let selectedFile = fileWrapper.querySelector('.item[sha="'+ getStorage('selectedFile') +'"]');
    
    if (selectedFile) {
    
      // select file
      selectedFile.classList.add('selected');
      selectedFile.scrollIntoViewIfNeeded();
      
      // set event listener for file change
      let fileChange = cd.textarea.addEventListener('keydown', () => {

        // enable pushing file
        file.classList.add('modified');
        
        // save modified file in localStorage
        saveFile(file);
        
        // remove event listener
        cd.textarea.removeEventListener('keydown', fileChange);
        
        console.log('a');

      });
      
    }
    
  }
  
}


// adds item event listeners
function addItemListeners() {
  
  let items = fileWrapper.querySelectorAll('.item');
  
  // run on all items
  items.forEach(item => {
    
    // navigate on click
    item.addEventListener('click', async (e) => {
      
      // if item is a repository
      if (item.classList.contains('repo')) {
        
        // change location
        let itemLoc = getAttr(item, 'fullname').split('/');
        
        treeLoc[0] = itemLoc[0],
        treeLoc[1] = itemLoc[1];
        setStorage('tree', treeLoc.join());
        
        // render files
        renderFiles();
        
      } else if (item.classList.contains('folder')) {
        
        // if item is a repository
        
        // change location
        treeLoc[2] += '/' + item.innerText;
        setStorage('tree', treeLoc.join());
        
        // render files
        renderFiles();
        
      } else { // if item is a file
        
        // if not clicked on push button
        if (e.target != item.querySelector('.push')) {
          
          // if file not already selected
          if (!item.classList.contains('selected')) {
            
            // load file
            loadFile(item, getAttr(item, 'sha'));
            
          }
          
        } else {
          
          // push file
          
          // get sha of item
          const sha = getAttr(item, 'sha');
          
          const content = modifiedFiles[sha];
          
          const message = 'Update ' + item.innerText;
          
          let query = 'https://api.github.com/repos/' +
                      treeLoc[0] +
                      '/' + treeLoc[1] +
                      '/contents' + treeLoc[2] +
                      '?message=' + message +
                      '&content=' + content +
                      '&sha=' + sha;
          
          var resp = await axios.put(query, githubToken);
          
          // delete item from array
          delete modifiedFiles[sha];
          
          item.classList.remove('modified');
          
        }
        
      }
      
    })
    
  })
  
}


async function loadFile(file, sha) {
  
  // save previous selection in localStorage
  if (getStorage('selectedFile')) {
    
    let selectedFile = fileWrapper.querySelector('.selected');
    
    if (selectedFile) {
      
      saveFile(selectedFile);
      
    }
    
  }
  
  // clear existing selections
  if (fileWrapper.querySelector('.selected')) {
    fileWrapper.querySelector('.selected').classList.remove('selected');
  }
  
  // save selected file
  file.classList.add('selected');
  setStorage('selectedFile', sha);
  
  // if file is not modified; fetch from Git
  if (!file.classList.contains('modified')) {
  
    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;

    query += '/repos/'+ user +'/'+ repo +'/contents/'+ contents +'/'+ file.innerText;

    // get the query
    var resp = await axios.get(query, githubToken);

    // show file content in codeit
    cd.setValue(atob(resp.content));
    
  } else { // else, load file from local storage
    
    const content = modifiedFiles[sha][0];
    
    // show file content in codeit
    cd.setValue(atob(content));
    
  }
  
  // set caret pos in code
  cd.textarea.setSelectionRange(0, 0);
  cd.scrollTo(0, 0);
  
  // set event listener for file change
  let fileChange = cd.textarea.addEventListener('keydown', () => {

    // enable pushing file
    file.classList.add('modified');

    // save modified file in localStorage
    saveFile(file);

    // remove event listener
    cd.textarea.removeEventListener('keydown', fileChange);

    console.log('a');

  });
  
}


// traverse backwards in tree when clicked on button
sidebarTitle.addEventListener('click', () => {
  
  // map tree location
  const [user, repo, contents] = treeLoc;
  
  // clear selected file
  setStorage('selectedFile', '');
  
  // if navigating in folders
  if (contents != '') {
    
    // pop last folder
    let splitContents = contents.split('/');
    splitContents.pop();
    
    // change location
    treeLoc[2] = splitContents.join('/');
    setStorage('tree', treeLoc.join());
    
    // render files
    renderFiles();
    
  } else if (repo != '') { // if navigating in repository
    
    // change location
    treeLoc[1] = '';
    setStorage('tree', treeLoc.join());
    
    // render files
    renderFiles();
    
  } else { // show user
    
    
    
  }
  
})


const repoIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" fill="currentColor"></path> </svg>';
const fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M14.59 2.59c-.38-.38-.89-.59-1.42-.59H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8.83c0-.53-.21-1.04-.59-1.41l-4.82-4.83zM15 18H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm-2-6V3.5L18.5 9H14c-.55 0-1-.45-1-1z" fill="currentColor"></path> </svg>';
const folderIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-1.41-1.41z" fill="currentColor"></path> </svg>';

const pushIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="push" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" fill="currentColor"></path> </svg>';
const arrowIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="arrow" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" fill="currentColor"></path> </svg>';
