### Installation
```
python -m venv .env
source .env/bin/activate

pip install -r requirements.txt
pip install --force-reinstall -r requirements.txt
```


### Description

Tag input written in pure JS for pre-interview

features:
          • initial list of tags from ajax request
          • click/focus on input reveals initial list of tags
          • click on list item adds tag to the input box, marks list item as selected
          • clicking on list items not causing focus loss on input
          • ability to removing tags by:
            - clicking on selected item in dropdown list
            - clicking on X sign at tag span
          • new tag from user input:
            - on pressing enter
            - on space
            - on comma
            - on clicking on dropdown row while input is active
          • while user's input, initial list is hidden is hidden and row with current user input is shown
          • if user tries to enter tag that is already in list, input becomes cleared
          • if user tries to press enter/space or enter comma , input becomes cleared
          • calculating available space for tags in input box based on rendered elements
          • hide tags if there is no space in the input box while adding, show amount of hidden
          • reveal hidden tags if some were removed
          • dropdown visibility based on user focus
          • post tag input result to database

### Running 
```
python3 manage.py runserver
```
