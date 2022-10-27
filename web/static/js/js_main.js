(function (window) {
  ("use strict");

  let ajaxResult = "";
  let inputHandlerResult = [];
  let currentList = [];
  let currentTags = [];
  let hiddenTags = [];
  let currentTagWidth = 0;
  let spaceAvailable = 0;
  let widthExceeded = false;

  const formHandler = () => {
    submitButton = document.querySelector("#request_container button");
    submitButton.addEventListener("click", (event) => {
      let requestInput = document.querySelector("#id_request");
      let requestTextarea = document.querySelector("#id_location01");
      requestTextarea.value = new Date().toLocaleString();
      requestTextarea.style.color = "white";

      currentTags.forEach((element) => {
        requestInput.value += element + ", ";
      });
    });
  };

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
    let requestTextarea = document.getElementById("id_location01");

    //find delimeter and clear input
    requestTextarea.addEventListener("input", (event) => {
      let dropdownUserList = document.querySelector(
        "#dropdown .user_input span"
      );

      currentValue = requestTextarea.value;

      //check if input value is delimeter and clear input
      if (
        currentValue === "\n" ||
        currentValue === "," ||
        currentValue === " "
      ) {
        requestTextarea.value = "";
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
          requestTextarea.value = "";

          tagHandler(currentValue.slice(0, -1));
          currentValue = "";
        }
        dropdownVisibility(focus, currentValue);
      }
    });

    //if user clicks on user_input dropdown part

    let userInput = document.querySelector("#dropdown .user_input span");
    userInput.addEventListener("mousedown", (event) => {
      event.preventDefault();
      inputHandlerResult.pop();
      inputHandlerResult.push(currentValue);
      renderDropdown(inputHandlerResult, "pre");
      //clear input
      requestTextarea.value = "";
      currentValue = "";
      tagHandler(event.target.innerText);
      dropdownVisibility(focus);
    });

    /*if focused paint the box borders, repaint back on blur
      + handle visibility of dropdown  */

    let border = document.querySelector("#request_container span .border_box");

    requestTextarea.addEventListener("focus", (event) => {
      border.style.border = "1px solid var(--blue)";
      focus = true;
      dropdownVisibility(focus);
    });

    requestTextarea.addEventListener("blur", (event) => {
      border.style.border = "";
      focus = false;
      dropdownVisibility(focus);
    });
  };

  const dropdownVisibility = (focus, inputValue) => {
    //show/hide dropdown list
    let dropdownList = document.querySelector("#dropdown .list");
    let dropdownUserList = document.querySelector("#dropdown .user_input");

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
    let selectList = document.querySelector("#dropdown .list");
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
        let itemsClickHandler = (item) => {
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

              //remove selected
              let tagsTextsInitial = document.querySelectorAll(".tag_text");
              let tagsTextsCurrent = [...tagsTextsInitial];

              tagsTextsCurrent.forEach((element, index) => {
                if (element.innerText === itemText) {
                  wrapHandler(element.parentElement, "remove");
                  element.parentElement.remove();
                }
              });

              item.classList.toggle("selected");
            } else {
              //focus on input when item clicked
              let requestTextarea = document.querySelector("#id_location01");
              requestTextarea.click();
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

  const wrapHandler = (tag, param) => {
    let box = document.querySelector("#request_container .tag_box");
    let tagsSpan = document.querySelector("#request_container .tag_items");
    let tagItems = [...tagsSpan.children];
    let tagLimit = document.querySelector("#request_container .tag_limit");
    let selectHiddenTags = document.querySelectorAll(".tag.hidden");
    let boxWidth = parseInt(getComputedStyle(box).width);
    let tagWidth = parseInt(getComputedStyle(tag).width);
    let maxWidth = 0;

    const mediaQuery = () => {
      let screen = window.matchMedia("(max-width: 700px)");
      if (screen.matches) {
        // If media query matches
        maxWidth = (boxWidth / 100) * 80 - 80;
      } else {
        maxWidth = (boxWidth / 100) * 80 - 160;
      }
    };

    mediaQuery();

    if (isNaN(tagWidth)) {
      hiddenTags.forEach((element) => {
        if (tag.children[0].innerText === element[0]) tagWidth = element[1];
      });
    }

    if (tagWidth === "auto") {
      hiddenTags.forEach((element, index) => {
        element.forEach((innerElement, i) => {
          if (innerElement === tag.children[0].innerText) {
            tagWidth = element[1];
          }
        });
      });
    }

    //

    if (param === "remove" && currentTagWidth > 0) {
      currentTagWidth -= tagWidth;
    } else {
      currentTagWidth += tagWidth;
    }

    widthExceeded = currentTagWidth >= maxWidth;

    if (widthExceeded) {
      //compensate currentTagWith if greater than 0
      if (currentTagWidth > 0) {
        currentTagWidth -= tagWidth;
      }

      //hide, last added  element increment the counter on limit span

      //if limit span is empty, fill it. Update counter

      let isEmpty = tagLimit.children.length === 0;
      isEmpty ? tagLimit.classList.remove("hidden") : "";
      let lastTag = tagItems.slice(-1)[0];

      if (param !== "remove") {
        let preparedPush = [lastTag.children[0].innerText, tagWidth];
        hiddenTags.push(preparedPush);
      }

      lastTag.classList.add("hidden");
      tagLimit.innerText = "+" + hiddenTags.length + " ...";
    } else {
      spaceAvailable = maxWidth - currentTagWidth;

      if (hiddenTags.length > 0) {
        for (let i = 1; i < 3; i++) {
          let [hiddenTag] = hiddenTags;

          if (hiddenTags.length !== 0) {
            if (spaceAvailable > hiddenTag[1]) {
              let selectHiddenTags = document.querySelectorAll(".tag.hidden");
              let firstHiddenTag = selectHiddenTags[0];
              if (firstHiddenTag !== undefined) {
                firstHiddenTag.classList.remove("hidden");
                //remove first element from hiddenTags array
                hiddenTags.shift();
                tagLimit.innerText = "+" + hiddenTags.length + " ...";

                //adjust currentTagWidth
                currentTagWidth += hiddenTag[1];
              } else {
                tagLimit.classList.add("hidden");
              }
            } else {
              return;
            }
          } else {
            //hide limit span if nothing to reveal
            tagLimit.classList.add("hidden");
          }
        }
      }
    }

    if (hiddenTags.length === 0) tagLimit.classList.add("hidden");
    //setWidthForTags(currentTagWidth);
  };

  const tagHandler = (str) => {
    //new tag in input box from clicking on list item
    //check if exists
    currentTags.includes(str) ? (notExists = false) : (notExists = true);
    //build and render new if not
    if (notExists) {
      let selectTagSpan = document.querySelector(
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
        let requestTextarea = document.querySelector("#id_location01");
        requestTextarea.click();
      });

      //check if width is widthExceeded, wrap if true

      wrapHandler(newTag);

      //remove tag from box on click at X sign

      cross.addEventListener("mousedown", (event) => {
        let tag = event.currentTarget.parentElement;
        event.preventDefault();

        wrapHandler(tag, "remove");
        event.currentTarget.parentElement.remove();

        //find selected row in list and remove 'selected' class
        let selectListItems = document.querySelectorAll("#dropdown .list_text");
        let itemsArray = [...selectListItems];
        itemsArray.forEach((item) => {
          if (event.target.previousSibling.innerText === item.innerText)
            item.parentElement.classList.remove("selected");
        });

        //remove from currentTags array
        currentTags.forEach((element, index) => {
          if (element === str) currentTags.splice(index, 1);
        });
      });
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    ajaxRequest("http://127.0.0.1:8000/api/categories_json/", "GET").then(
      (result) => {
        ajaxResult = result["data"];
        renderDropdown(ajaxResult, currentList);
        inputHandler(inputHandlerResult);
        formHandler();
      }
    );
  });
})(window);
