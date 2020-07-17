
// Budget Controller (IIFE)
var budgetController = (function(){

    // Expense function constructure that passes in id, description and value
    var Expense = function(id, description, value){
        
        // this refers to Expense object
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Expense prototype for the calcPercentage function which calculates the percentage
    Expense.prototype.calcPercentage = function(totalIncome){

        // check if totalIcome is greater than 0
        if(totalIncome > 0){

            // calculate the percentage 
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1; // set the percentage to non existent
        }
        

    };

    // Expense prototype for getPercentage function which gets the percentage
    Expense.prototype.getPercentage = function(){

        // retrieve the percentage from the object and return it
        return this.percentage;


    };

    var Income = function(id, description, value){
        
        // this refers to Income object
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    // calculate total
    var calculateTotal = function(type){

        // stores the sum
        var sum = 0;

        // loop through which type of array
        data.allItems[type].forEach(function(cur){

            // sum is equal to the sum plus the current value
            sum += cur.value

        });

         // set totals object in the data structure equal to the sum var outside of loop
         data.totals[type] = sum;

    }

    // store data (data structure)
    var data = {
        
        // store items
        allItems: {
            exp: [],
            inc: []
            },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // non existent; no percentage
    };

    // add a new method that will allow other modules to add a new item into the data structure
    return {
        addItem: function(type, des, val){ // gather the type, description, and value

            // declare newItem and ID
            var newItem, ID;

            // make sure ID is greater than 0
            if(data.allItems[type].length > 0){

                // ID needs to be equal to the last ID, plus 1
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            }else{
                ID = 0;
            }

            // decide whether the new item will be an exp or inc
            if(type === 'exp'){

                // create a new Expense object
                newItem = new Expense(ID, des, val);

            } else if(type === 'inc'){

                // create a new Income object
                newItem = new Income(ID, des, val);

            }
            // selects either exp or inc and adds to the end of the array with the push method
            data.allItems[type].push(newItem);

            // return the newItem
            return newItem;

        },

        // Delete item
        deleteItem: function(type, id){

            // declare id and index variables
            var ids, index;

            // gets all the items in the allItems array targeting the type and creates a new array
            ids = data.allItems[type].map(function(current){

                // returns the current id in the new array
                return current.id;

            });

            // find the index
            index = ids.indexOf(id);

            // if the index is not equal to -1
            if(index !== -1){

                // remove element using splice which takes two parameters, starting position (index in our case) and how many (1 in our case)
                data.allItems[type].splice(index, 1)

            }

        },

        // calculate the budget
        calculateBudget: function(){

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // if the total income is greater than 0
            if(data.totals.inc > 0){

                // calculate the percentage of income that we spent and round it using the Math.round function
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            }else{
                data.percentage = -1; // none existant
            }

        },

        // calculate the percentages
        calculatePercentages: function(){

            // get all the items in the expense array and loop through
            data.allItems.exp.forEach(function(cur){

                // call calcPercentage function which will calculate every expense in the object
                cur.calcPercentage(data.totals.inc);

            });
        },

        // get percentages
        getPercentages: function(){

            // store the percentages in allPerc variable
            var allPerc = data.allItems.exp.map(function(cur){

                // returns the current percentage from the getPercentage function
                return cur.getPercentage();
            });

            // return allPerc variable
            return allPerc;

        },

        // Get the budget
        getBudget: function(){

            // get the data
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };

        },

        testing: function(){
            console.log(data);
        }
    };

})();


// UI Controller (IIFE)
var UIController = (function(){

    // create private variables
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

     // define formatNumber function
      var formatNumber = function(num, type){

        // declare variables
        var numSplit, int, dec, sign;

        // store the absolute value in num variable
        num = Math.abs(num);

        // makes the number have two decimal places after decimal
        num = num.toFixed(2);

        // split the string by the (.)
        numSplit = num.split('.');

        // stores the first elemnt in the numSplit array
        int = numSplit[0];

        // check if more than 1000
        if(int.length > 3){

            // seperates the two parts of the array and inserts a comma by calculating the length of the number
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        // stores the second element in the numSplit array
        dec = numSplit[1];

        // return formatted output for dollars; // shorthand if/else for assinging the +/- and dollar sign in front of number
        return (type === 'exp' ? '-$' : '+$') + '' + int + '.' + dec;

    };

    // function for creating a loop for the .item__percentage class
    var nodeListForEach = function(list, callback){

        // loop through however many items are in the expenses list in html (.item__percentage) 
        for(var i = 0; i < list.length; i++){

            // displays current element (.item__percentage) and its index
            callback(list[i], i);

        }
    };

    // read data from UI
    return {
        getinput: function(){
            
            // create objects and their properties (type, description, and value)
            return{
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
        },

        //
        addListItem: function(obj, type){

            // declare html variable
            var html, newHtml, element;

            // Create HTML string with placeholder text

            // if type is exp or inc
            if(type === 'inc'){

                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }else if(type === 'exp'){

                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }


            // Replace placeholder text with real data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        // delete item from the UI
        deleteListItem: function(selectorID){
          
            // store the selected id (item) and stores in el variable
            var el = document.getElementById(selectorID);

            // removes the selected id for item and removes it using removeChild function, passing in the el variable holding the selected id item
            el.parentNode.removeChild(el);

        },

        // clear inputs
        clearFields: function(){

            // declare fields variable
            var fields, fieldsArr;

            // select all description and value fields and store in fields variable
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // returns an array by tricking the slice method so it can use the call method, which passes in the fields variable
            fieldsArr = Array.prototype.slice.call(fields);

            // loop through and clear all fields selected
            fieldsArr.forEach(function(current, index, array){

                // sets to empty
                current.value = "";

            });

            // sets the description field to focus
            fieldsArr[0].focus();

        },

        // display the budget, total income, total expense, and percentage to the UI
        displayBudget: function(obj){

            // declare type variable
            var type;

            // check if inc or exp
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            // dipslay to the UI
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            // check to see if there is a percentage
            if(obj.percentage > 0){

                // display percentage
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            }else{
                // display percentage
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        // display percentages; pass in percentage array from our app controller
        displayPercentages: function(percentages){
            
            // selecting all the items with the .item__percentage class from the DOMstrings and store into fields variable
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            // define nodeListForEach function
            nodeListForEach(fields, function(current, index){

                // check if the percentage is greater than 0
                if(percentages[index] > 0){

                    // display the percentage at the current index
                    current.textContent = percentages[index] + '%';

                }else{
                    current.textContent = '---' // if no percentage, display dashes
                }


            });
        },

        // define display month funciton
        displayMonth: function(){

            // declare variables
            var now, months, month, year;

            // create the variable called new as an object constructor
            now = new Date();

            // passes in getFullYear from the Date prototype and stores it into the year variable
            year = now.getFullYear();

            // store the months in an array, months
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            // passes in get month from the Date prototype and stores it into the month variable
            month = now.getMonth();

            // selects the class .budget__title--month and changes it to current date
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        // changes the input focus based on the color of income or expense (green, red)
        changedType: function(){

            // apply the red focus class in css to input type, description and value
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            // loop through and add red focus class
            nodeListForEach(fields, function(cur){

                // adds/removes red-focus class 
                cur.classList.toggle('red-focus');

            });

            // toggle the red class to red or green based on income or expense
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        // make DOMstrings availible 
        getDOMstrings: function(){

            // return DOMstrings variable abject
            return DOMstrings;
        }
    };

})();


// Global app controller (IIFE)
var controller = (function(budgetCtrl, UICtrl){

    // store eventListeners
    var setupEventListeners = function(){

        // create DOM variable to get the DOMstrings
        var DOM = UICtrl.getDOMstrings();

        // select the .add__btn class by passing the class in the DOM variable, which has the variables for all the classes located in the UI Controller, and add the click event adn also pass in the ctrlAddItem function
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        
        // uses the keypress event, so that when a user presses any key, in our case, the enter, the same calculation is applied from the global controller
        document.addEventListener('keypress', function(event){

            // check to see if the enter key was pressed
            // use event.which to test for older browsers
            if(event.keyCode === 13 || event.which === 13){

                // call controlAddItem function (ctrAddItem)
                ctrlAddItem();

            }

        });

        // select the .container class by passing the class in the DOM variable, which has the variables for all the classes located in the UI Controller, and add the click event adn also pass in the ctrlDeleteItem function
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // 
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    // update budget
    var updateBudget = function(){

        // Calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        var budget = budgetCtrl.getBudget();

        // Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    // Update percentages
    var updatePercentages = function(){

        // Calculate percentages
        budgetCtrl.calculatePercentages();

        // Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // Update teh UI with the new percentages
        UICtrl.displayPercentages(percentages);


    };

    // add item controller
    var ctrlAddItem = function(){

        // declare variables
        var input, newItem;

        // Get field input data
        input = UICtrl.getinput();
         
        // description to not be empty (input is not empty and is not (not) a number and greater than 0) 
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){

            // Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Clear the fields
            UICtrl.clearFields();

            // Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // call updateBudget function and have it Calculate and update budget
            updateBudget();

            // call updatePercentages function and have it calculate and update the percentages
            updatePercentages();

        }

    };

    // Delete item controller
    var ctrlDeleteItem = function(event){

        // declare itemID variable
        var itemID, splitID, type, ID;

        // sellect the id in parent node four levels up in the html from the icon code in the button element
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // checks if itemID exists
        if(itemID){

            //split the id where the dash is
            splitID = itemID.split('-');

            // selects the first element in the array
            type = splitID[0];

            // selects the second element in the array
            ID = parseInt(splitID[1]);

            // delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // update and show the new budget in UI
            updateBudget();

            // call updatePercentages function and have it calculate and update the percentages
            updatePercentages();

        }

    };

    // call initialize function as an object
    return {
        init: function(){
            console.log('Application has started.');

            // Display date at the start of application
            UICtrl.displayMonth();

            // Display the budget on the UI
            UICtrl.displayBudget({

                // reset items
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            // call the eventListeners so that those proccesses can be executed
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();