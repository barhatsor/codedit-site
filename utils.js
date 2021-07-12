
const body = document.body,
      
      cd = document.querySelector('cd'),
      
      github = document.querySelector('.github'),
      
      sidebar = document.querySelector('.sidebar'),
      introWrapper = sidebar.querySelector('.intro-wrapper'),
      contentWrapper = sidebar.querySelector('.content-wrapper'),
      
      loginButton = introWrapper.querySelector('.login'),
      
      header = contentWrapper.querySelector('.header'),
      
      titleScreen = header.querySelector('.titlescreen'),
      searchScreen = header.querySelector('.searchscreen'),
      
      sidebarTitle = titleScreen.querySelector('.title'),
      sidebarLogo = sidebarTitle.querySelector('.logo'),
      
      searchButton = titleScreen.querySelector('.search'),
      searchBack = searchScreen.querySelector('.back'),
      searchInput = searchScreen.querySelector('.searchinput'),
      searchClear = searchScreen.querySelector('.clear'),
      
      fileWrapper = sidebar.querySelector('.files');



// localStorage

let getStorage = (item) => {
  
  return localStorage.getItem(item);
  
}

let setStorage = (item, value) => {
  
  return localStorage.setItem(item, value);
  
}


// Attributes

let getAttr = (element, item) => {
  
  return element.getAttribute(item);
  
}

let setAttr = (element, item, value) => {
  
  return element.setAttribute(item, value);
  
}


// HTTP Request
let axios = {
  'get': (url, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            resolve(JSON.parse(this.responseText));
          }
        };
        
        xmlhttp.open('GET', url, true);
        
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  },
  'post': (url, data, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && (this.status == 201 || this.status == 200)) {
            resolve(JSON.parse(this.responseText));
          }
        };

        xmlhttp.open('POST', url, true);
        
        xmlhttp.setRequestHeader('Accept', 'application/json');
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send(JSON.stringify(data));
      } catch(e) { reject(e) }
    });
  },
  'put': (url, data, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && (this.status == 201 || this.status == 200)) {
            resolve(JSON.parse(this.responseText));
          }
        };

        xmlhttp.open('PUT', url, true);

        xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send(JSON.stringify(data));
      } catch(e) { reject(e) }
    });
  },
  'delete': (url, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            resolve(JSON.parse(this.responseText));
          }
        };

        xmlhttp.open('DELETE', url, true);
        
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  }
};