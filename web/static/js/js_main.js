//ajax
ajaxRequest = (url, method, data) => {
  return new Promise(function (resolve, reject) {
    let request = new XMLHttpRequest();
    request.responseType = "json";
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if ((request.status === 200) & (request.readyState === 4)) {
          resolve(request.response);
        } else {
          reject(Error(request.status));
        }
      }
    };
    request.onerror = function () {
      reject(Error("Network Error"));
    };
    request.open(method, url, true);
    request.send(data);
  });
};

const buildDropdown = (inputData) => {
  const selectDropdown = document.querySelector("#dropdown");

  //generate items for dropdown
  for (i = 0; i < inputData.length; i++) {
    let newListItem = document.createElement("span");
    let listText = document.createElement("span");
    listText.classList.add("list_text");
    let checkmark = document.createElement("span");
    checkmark.classList.add("checkmark");

    listText.innerText = inputData[i];
    newListItem.append(listText);
    selectDropdown.append(newListItem);

    //handle clicks on items
    newListItem.addEventListener("click", function (event) {
      let noCheckmark = event.target.children.length === 0;
      noCheckmark ? newListItem.append(checkmark) : "";
      event.currentTarget.classList.toggle("selected");
    });
  }
  //handle dropdown visibility behavior
  dropdownHandler();
};

const dropdownHandler = () => {
  const requestInput = document.getElementById("id_location01");

  //event listeners
  requestInput.addEventListener("click", showDropdown);
  requestInput.addEventListener("input", showDropdown);
  requestInput.addEventListener("blur", showDropdown);

  //show/hide dropdown list
  function showDropdown() {
    let dropdown = document.querySelector("#dropdown");
    let isActive = dropdown.classList === "active";
    dropdown.classList = isActive ? "hidden" : "active";

    /* 
    setting textarea height if dropdown is active
    to prevent dropdown closing while clicking on tags from list
    */

    //calculate list height
    let cssObj = window.getComputedStyle(dropdown);
    let dropdownHeight = cssObj.getPropertyValue("height");

    requestInput.style.height = isActive ? "" : dropdownHeight;
  }
};

const tagHandler = () => {
  //new tag in search box from clicking on list item
  const selectListItems = document.querySelectorAll("#dropdown span.list_text");
  const itemsArray = [...selectListItems];

  //handle clicks on list item to create a tag in search box
  itemsArray.forEach((item) => {
    item.parentElement.addEventListener("click", function (event) {
      console.log(item);

      //check if tag exists in searchbox, remove it
      let selectTagItems = document.querySelectorAll(".tag_text");
      let currentTagsArray = [...selectTagItems];

      let exists = "";
      if (currentTagsArray.length > 0) {
        currentTagsArray.forEach((tag) => {
          if (tag.innerHTML === item.innerHTML) {
            console.log();
            tag.parentElement.remove();
            // console.log(tag.innerText + " removed");
            //console.log(tag);
            return (exists = true);
          } else {
            //return (exists = false);
          }
        });
      }

      if (exists) {
        console.log("exists, do nothing");
      } else {
        //create tag
        let newTag = document.createElement("span");
        newTag.classList.add("tag");
        let tagText = document.createElement("span");
        tagText.innerText = item.innerText;
        tagText.classList.add("tag_text");
        newTag.append(tagText);
        //add cross to it
        let cross = document.createElement("span");
        cross.classList.add("cross");
        cross.innerText = "✕";
        newTag.append(cross);
        //insert tag
        let selectTagSpan = document.querySelector(
          "#request_container .tag_items"
        );
        selectTagSpan.append(newTag);

        //remove tag from searchbox on click at X sign

        cross.addEventListener("click", function (event) {
          event.currentTarget.parentElement.remove();
          //find selected row in list and remove 'selected' class
          const selectListItems = document.querySelectorAll(
            "#dropdown span.list_text"
          );
          const itemsArray = [...selectListItems];
          itemsArray.forEach((item) => {
            if (event.target.previousSibling.innerText === item.innerText)
              item.parentElement.classList.remove("selected");
          });
        });
      }
    });
  });
};

$(document).ready(function () {
  ajaxRequest("http://127.0.0.1:8000/api/categories_json/", "GET").then(
    function (result) {
      const data = result["data"];
      buildDropdown(data);
      tagHandler();
    }
  );
});
