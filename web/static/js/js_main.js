(function (window, $) {
  "use strict";

  const ajaxRequest = (url, method, data) => {
    return new Promise((resolve, reject) => {
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

  const renderDropDown = () => {
    const requestInput = document.getElementById("id_location01");

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

    //event listeners
    requestInput.addEventListener("click", showDropdown);
    requestInput.addEventListener("input", showDropdown);
    requestInput.addEventListener("blur", showDropdown);
  };

  const buildAndRenderDropDown = (inputData) => {
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
    renderDropDown();
  };

  const tagHandler = () => {
    //new tag in search box from clicking on list item
    const selectListItems = document.querySelectorAll(
      "#dropdown span.list_text"
    );
    const itemsArray = [...selectListItems];

    //handle clicks on list item to create a tag in search box
    itemsArray.forEach((item) => {
      item.parentElement.addEventListener("click", function (event) {
        let initial = document.querySelectorAll(".tag_text");
        let current = [...initial];
        let exists = false;

        if (current.length > 0) {
          current.forEach((tag) => {
            if (tag.innerHTML === item.innerHTML) {
              tag.parentElement.remove();
              exists = true;
            }
          });
        }

        if (!exists) {
          let newTag = document.createElement("span");
          newTag.classList.add("tag");

          let tagText = document.createElement("span");
          tagText.innerText = item.innerText;
          tagText.classList.add("tag_text");
          newTag.append(tagText);

          let cross = document.createElement("span");
          cross.classList.add("cross");
          cross.innerText = "✕";
          newTag.append(cross);

          let selectTagSpan = document.querySelector(
            "#request_container .tag_items"
          );
          selectTagSpan.append(newTag);

          //remove tag from searchbox on click at X sign

          cross.addEventListener("click", (event) => {
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

  $(document).ready(() => {
    ajaxRequest("http://127.0.0.1:8000/api/categories_json/", "GET").then(
      (result) => {
        buildAndRenderDropDown(result["data"]);
        tagHandler();
      }
    );
  });
})(window, jQuery);
