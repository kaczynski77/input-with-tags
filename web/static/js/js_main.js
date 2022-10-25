(function (window) {
  ("use strict");

  let ajaxResult = "";
  let inputHandlerResult = [];
  let currentList = [];
  let currentTags = [];

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

  const inputHandler = (inputHandlerResult) => {
    let focus = true;
    let currentValue = "";
    const requestInput = document.getElementById("id_location01");

    //find delimeter and clear input
    requestInput.addEventListener("input", (event) => {
      const dropdownUserList = document.querySelector("#dropdown .user_input");

      currentValue = requestInput.value;
      dropdownUserList.innerText = currentValue;

      let lastChar = currentValue.slice(-1);
      let delimeterFound =
        lastChar === " " || lastChar === "," || lastChar === "\n";

      if (delimeterFound) {
        inputHandlerResult.pop();
        inputHandlerResult.push(currentValue.slice(0, -1));
        renderDropdown(inputHandlerResult, "pre");
        //clear input
        requestInput.value = "";
        currentValue = "";
      }
      dropdownVisibility(focus, currentValue);
    });

    //if focused paint the box borders, repaint back on focusout

    const border = document.querySelector(
      "#request_container span .border_box"
    );

    const dropdown = document.querySelector("#dropdown");

    requestInput.addEventListener("focus", (event) => {
      border.style.border = "1px solid var(--blue)";
      focus = true;
      dropdownVisibility(focus);
    });

    requestInput.addEventListener("blur", (event) => {
      focus = false;
      dropdownVisibility(focus);
    });
  };

  //show/hide dropdown list
  const dropdownVisibility = (focus, inputValue) => {
    const dropdownList = document.querySelector("#dropdown .list");
    const dropdownUserList = document.querySelector("#dropdown .user_input");

    if (focus) {
      if (inputValue !== undefined && inputValue.length > 0) {
        dropdownList.classList.add("hidden");
        dropdownUserList.classList.remove("hidden");
      } else {
        dropdownList.classList.remove("hidden");
        dropdownUserList.classList.add("hidden");
      }
    } else {
      dropdownList.classList.add("hidden");
      dropdownUserList.classList.add("hidden");
    }
  };

  const renderDropdown = (data, param) => {
    const selectList = document.querySelector("#dropdown .list");
    //selectList.innerHTML = "";

    const createItem = (index, element, input) => {
      //get current list of items in dropdown
      let renderedList = selectList.children;
      let currentlyRendered = [...renderedList];
      let mappedList = currentlyRendered.map((element) => element.innerText);

      //check if item is already in list - if true: do nothing
      let isInList = mappedList.includes(input[index]);

      if (isInList) {
        return;
      } else {
        let newItem = document.createElement("span");
        let itemText = document.createElement("span");
        let checkmark = document.createElement("span");

        itemText.classList.add("list_text");
        checkmark.classList.add("checkmark");

        itemText.innerText = input[index];

        newItem.append(itemText);
        selectList.append(newItem);

        if (param === "pre") selectList.prepend(newItem);

        //handle clicks on items
        const itemsClickHandler = (item) => {
          item.addEventListener("mousedown", function (event) {
            event.preventDefault();
            //focus on input when item clicked
            const requestInput = document.querySelector("#id_location01");
            requestInput.click();
            //mark as selected
            let noCheckmark = event.target.children.length === 0;
            noCheckmark ? item.append(checkmark) : "";
            event.currentTarget.classList.toggle("selected");
          });
        };

        itemsClickHandler(newItem);
        currentList.push(input[index]);
      }
    };

    //generate items for dropdown

    data.forEach((element, index) => {
      createItem(index, element, data);
    });
  };

  const checkTagsWidth = (exceeded) => {
    let box = document.querySelector("#request_container .tag_box");
    let tagsSpan = document.querySelector("#request_container .tag_items");
    let tagItems = [...tagsSpan.children];
    let boxWidth = parseInt(getComputedStyle(box).width);
    let currentWidth = 0;

    tagItems.forEach((tag) => {
      console.log(tag, typeof tag);
      let tagWidth = getComputedStyle(tag).width;
      currentWidth += parseInt(tagWidth.slice(0, -2));
    });

    exceeded = currentWidth >= boxWidth * 0.8;
    /*  console.log(currentWidth, typeof currentWidth);
    console.log("available width", boxWidth * 0.8);
    console.log(tagItems);
    console.log(exceeded); */
  };

  const tagHandler = () => {
    //new tag in input box from clicking on list item

    const selectListItems = document.querySelectorAll("#dropdown .list_text");
    const itemsArray = [...selectListItems];
    console.log(itemsArray);

    //handle clicks on list item to create a tag in a box
    itemsArray.forEach((item) => {
      item.parentElement.addEventListener("click", function (event) {
        let notExists = true;

        if (currentTags.length > 0) {
          currentTags.forEach((tag) => {
            if (currentTags.includes(tag)) {
              item.parentElement.remove();
              notExists = false;
            }
          });
        }

        if (notExists) {
          const selectTagSpan = document.querySelector(
            "#request_container .tag_items"
          );
          const tagsSpanArray = [...selectTagSpan];

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

          selectTagSpan.append(newTag);
          currentTags.push(newTag);

          //check if width is exceeded
          let exceeded = false; //by default
          checkTagsWidth(exceeded);

          //remove tag from box on click at X sign

          cross.addEventListener("click", (event) => {
            event.currentTarget.parentElement.remove();
            //find selected row in list and remove 'selected' class
            const selectListItems = document.querySelectorAll(
              "#dropdown .list_text"
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

  document.addEventListener("DOMContentLoaded", () => {
    ajaxRequest("http://127.0.0.1:8000/api/categories_json/", "GET").then(
      (result) => {
        ajaxResult = result["data"];
        renderDropdown(ajaxResult, currentList);
        inputHandler(inputHandlerResult);
      }
    );
  });
})(window);
