(function (window) {
  ("use strict");

  let ajaxResult = "";
  let inputHandlerResult = [];
  let currentList = [];
  let currentTags = [];
  let hiddenTags = [];
  let currentTagWidth = 0;
  let widthExceeded = false;

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
      const dropdownUserList = document.querySelector(
        "#dropdown .user_input span"
      );

      currentValue = requestInput.value;

      //check if input value is delimeter and clear input
      if (
        currentValue === "\n" ||
        currentValue === "," ||
        currentValue === " "
      ) {
        requestInput.value = "";
        currentValue = "";
        return;
      } else {
        dropdownUserList.innerText = currentValue;
        let lastChar = currentValue.slice(-1);
        //check for delimeter at the end of input value
        let delimeterFound =
          lastChar === " " || lastChar === "," || lastChar === "\n";
        // handle tag if found
        if (delimeterFound) {
          inputHandlerResult.pop();
          inputHandlerResult.push(currentValue.slice(0, -1));
          renderDropdown(inputHandlerResult, "pre");
          //clear input
          requestInput.value = "";

          tagHandler(currentValue.slice(0, -1));
          currentValue = "";
        }
        dropdownVisibility(focus, currentValue);
      }
    });

    //if user clicks on user_input dropdown part

    const userInput = document.querySelector("#dropdown .user_input span");
    userInput.addEventListener("mousedown", (event) => {
      event.preventDefault();
      inputHandlerResult.pop();
      inputHandlerResult.push(currentValue);
      renderDropdown(inputHandlerResult, "pre");
      //clear input
      requestInput.value = "";
      currentValue = "";
      tagHandler(event.target.innerText);
      dropdownVisibility(focus);
    });

    /*if focused paint the box borders, repaint back on blur
      + handle visibility of dropdown  */

    const border = document.querySelector(
      "#request_container span .border_box"
    );

    requestInput.addEventListener("focus", (event) => {
      border.style.border = "1px solid var(--blue)";
      focus = true;
      dropdownVisibility(focus);
    });

    requestInput.addEventListener("blur", (event) => {
      border.style.border = "";
      focus = false;
      dropdownVisibility(focus);
    });
  };

  const dropdownVisibility = (focus, inputValue) => {
    //show/hide dropdown list
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

        if (param === "pre") {
          newItem.append(checkmark);
          selectList.prepend(newItem);
          newItem.classList.add("selected");
        }

        //handle clicks on items
        const itemsClickHandler = (item) => {
          let itemText = item.innerText;
          item.addEventListener("mousedown", function (event) {
            event.preventDefault();

            isSelected = item.classList[0] === "selected";

            if (isSelected) {
              //remove from tags arrays
              currentTags.forEach((element, index) => {
                if (element === itemText) currentTags.splice(index, 1);
              });
              // hiddenTags.forEach((element, index) => {
              //   if (element === itemText) hiddenTags.splice(index, 1);
              // });

              //remove tag from box, adjust currentTagWidth
              const tagsTextsInitial = document.querySelectorAll(".tag_text");
              const tagsTextsCurrent = [...tagsTextsInitial];

              tagsTextsCurrent.forEach((element, index) => {
                if (element.innerText === itemText) {
                  let tagWidth = getComputedStyle(element.parentElement).width;
                  currentTagWidth -= parseInt(tagWidth);
                  element.parentElement.remove();
                }
              });

              handleHiddenTags();

              item.classList.toggle("selected");
            } else {
              //focus on input when item clicked
              const requestInput = document.querySelector("#id_location01");
              requestInput.click();
              //mark as selected
              let noCheckmark = event.target.children.length === 0;
              noCheckmark ? item.append(checkmark) : "";
              item.classList.toggle("selected");
              tagHandler(item.innerText);
            }
          });
        };

        itemsClickHandler(newItem);
        currentList.push(input[index]);
      }
    };

    //generate items for dropdown list

    data.forEach((element, index) => {
      createItem(index, element, data);
    });
  };

  const checkAndWrapTags = (tag) => {
    const box = document.querySelector("#request_container .tag_box");
    const tagsSpan = document.querySelector("#request_container .tag_items");
    const tagItems = [...tagsSpan.children];
    let boxWidth = parseInt(getComputedStyle(box).width);

    tagWidth = getComputedStyle(tag).width;

    if (tagWidth === "auto") {
      return;
    } else {
      currentTagWidth += parseInt(tagWidth);
    }

    widthExceeded = currentTagWidth >= (boxWidth / 100) * 80;

    if (widthExceeded) {
      //hide, element increment the counter on limit span
      //check if limit span if empty

      const tagLimit = document.querySelector("#request_container .tag_limit");
      let isEmpty = tagLimit.children.length === 0;
      isEmpty ? tagLimit.classList.remove("hidden") : "";
      let lastTag = tagItems.slice(-1)[0];
      hiddenTags.push(lastTag.children[0].innerText);

      lastTag.classList.add("hidden");
      tagLimit.innerText = "+" + hiddenTags.length + " ...";
    }
  };

  const handleHiddenTags = () => {
    //check if any tags are hidden, show if there is a space,
    //decrease hidden tag counter
    const selectHiddenTags = document.querySelectorAll(".tag.hidden");

    const selectTagLimit = document.querySelector(".tag_limit");
    if (hiddenTags.length > 1) {
      let newCounterValue =
        selectTagLimit.innerText.split("+")[1].split(" ")[0] - 1;
      selectTagLimit.innerText = "+" + newCounterValue + " ...";
      selectHiddenTags[0].classList.remove("hidden");
    } else if (hiddenTags.length === 1) {
      selectHiddenTags[0].classList.remove("hidden");
      selectTagLimit.classList.add("hidden");
    }
    hiddenTags.pop();
  };

  const tagHandler = (str) => {
    //new tag in input box from clicking on list item
    //check if exists
    currentTags.includes(str) ? (notExists = false) : (notExists = true);
    //build and render new if not
    if (notExists) {
      const selectTagSpan = document.querySelector(
        "#request_container .tag_items"
      );

      let newTag = document.createElement("span");
      newTag.classList.add("tag");

      let tagText = document.createElement("span");
      tagText.innerText = str;
      tagText.classList.add("tag_text");
      newTag.append(tagText);

      let cross = document.createElement("span");
      cross.classList.add("cross");
      cross.innerText = "✕";
      newTag.append(cross);

      selectTagSpan.append(newTag);
      currentTags.push(str);

      /*handle direct click on tag (not on X),
       make click on textearea instead.*/

      tagText.addEventListener("mousedown", (event) => {
        event.preventDefault();
        const requestInput = document.querySelector("#id_location01");
        requestInput.click();
      });

      //check if width is widthExceeded, wrap if true

      checkAndWrapTags(newTag);

      //remove tag from box on click at X sign

      cross.addEventListener("mousedown", (event) => {
        let tag = event.currentTarget.parentElement;
        let tagWidth = getComputedStyle(tag).width;
        currentTagWidth -= parseInt(tagWidth);
        event.preventDefault();
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

        //remove from currentTags array
        currentTags.forEach((element, index) => {
          if (element === str) currentTags.splice(index, 1);
        });

        handleHiddenTags();
      });
    }
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
