var budgetcontroller = (function(){
     
    var Expense = function(id, description, value){
        this.id = id,
            this.description = description,
            this.value = value,
            this.percentage =-1
    };
    Expense.prototype.calcPercentage = function(total){
        if(total>0)
        this.percentage = Math.round((this.value/total)*100);
        else
            this.percentage = -1;
    };
    Expense.prototype.getPercent = function(){
      return this.percentage;  
    };
    
    var Income = function(id, description, value){
        this.id = id,
            this.description = description,
            this.value = value
    };
    
    var data = {
        allItems : {
        exp : [],
        inc : []
    },
    totals : {
        exp : 0,
        inc : 0
    },
     budget: 0,
        percent: 0
    };
    var calculateTotal= function(type){
        var sum=0;
        
        data.allItems[type].forEach(function(cur){
            sum+=cur.value;
        });
        data.totals[type]= sum;
    }
    return {
        addItem : function(type, des,val){
           
            //create new Id
            var newItem, ID;
            
            if(data.allItems[type].length > 0)
            ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            else
                ID=0;
            
            
            //create new item based on 'inc' or 'exp'
            if(type === 'exp')
            newItem = new Expense(ID,des, val);
            else if(type === 'inc')
                newItem = new Income(ID, des, val);
            //push the newly created object
            data.allItems[type].push(newItem);
            //return the newly created object
            return newItem;
        },
        
        deleteBudget: function(type, id){
            
            var ids,index;
            ids= data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            
            if(index!==-1){
                data.allItems[type].splice(index,1);
            }
            
        },
        calculateBudget: function(){
            
            //calculate total income and expenses 
            
            calculateTotal('inc');
            calculateTotal('exp');
            
            //calculate the budget i.e. income - expense
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate percentrage
            if(data.totals.inc>0)
            data.percent= Math.round((data.totals.exp/data.totals.inc)*100);
        else{
            data.percent= -1;
        }
            
        },
        calcPercentage: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
                
            });
        },
        getPercent: function(){
            var percent;
            percent= data.allItems.exp.map(function(cur){
                return cur.percentage;
            });
            return percent;
        },
        
        
        getBudget: function(){
            return{
                budget : data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percent: data.percent
            };
        },
        testing: function(){
            console.log(data);
        }
        
        
    };
})();


var UIcontroller = (function(){
    
    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentLabel:'.budget__expenses--percentage',
        container: '.container',
        expensePerLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNum =  function(num, type){
         var numsplit, int, dec;
           /*
           + or - before the number
           2 decimals after the number
           adding , at the thousands place or so
           */
           num = Math.abs(num);
           num= num.toFixed(2);
           numsplit = num.split('.');
        int = numsplit[0];
        dec = numsplit[1];
        if(int.length>3){
            int = int.substr(0,int.length-3)+ ',' + int.substr(int.length-3,3);
        }
        return (type==='inc'?'+':'-') + ' '+ int+ '.' +dec;
       };
    var nodelistforEach = function(list,callback)
           {
               for(var i =0;i<list.length;i++){
                   callback(list[i],i);
               }
           };
    
   return {
       getinput: function()
            {
                return{
                 type: document.querySelector(DOMstrings.inputType).value,
                 description: document.querySelector(DOMstrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                };
            },
       addListItem: function(obj, type){
           var html, newhtml, element;
           //create the html string with placeholder text
           if(type === 'inc'){
               element=DOMstrings.incomeContainer;
               html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value"> %val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
           }
           else if(type === 'exp'){
               element= DOMstrings.expenseContainer;
               html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>';
           }
           //replace the placeholder text with some actual data
          newhtml= html.replace('%id%', obj.id);
           newhtml= newhtml.replace('%desc%', obj.description);
           newhtml= newhtml.replace('%val%',formatNum(obj.value,type));
           
           //add the item into the document
           document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
           
           
       },
       
       deleteListItem: function(id){
           
           var el= document.getElementById(id);
           el.parentNode.removeChild(el);
       },
       
       clearFields: function(){
           var fields, fieldsArr;
           fields= document.querySelectorAll(DOMstrings.inputDescription + ', '+ DOMstrings.inputValue);//this retruns a list
           fieldsArr= Array.prototype.slice.call(fields);//to conver this list into an array using a function that is originally inside the prototype of the array since we need to use 'forEach' which appearantly can only be used on the array
           fieldsArr.forEach(function(current,index,array){
               current.value= "";
              fieldsArr[0].focus();
               
           });
       },
       
       displayBudget: function(obj){
           var type;
           obj.budget>0?type='inc':type='exp';
           document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(obj.budget,type);
           document.querySelector(DOMstrings.incomeLabel).textContent = formatNum(obj.totalIncome,'inc');
           document.querySelector(DOMstrings.expenseLabel).textContent = formatNum(obj.totalExpense,'exp');
           if(obj.percent>0)
           document.querySelector(DOMstrings.percentLabel).textContent = obj.percent+'%';
           else
               document.querySelector(DOMstrings.percentLabel).textContent = '---';
            
       },
       displayPercent: function(percent){
           
           var fields = document.querySelectorAll(DOMstrings.expensePerLabel);
           
           nodelistforEach(fields,function(current,index){
               
              if(percent[index]>0)
                  {
                      current.textContent = percent[index] + '%';
                  }
               else{
                   current.textContent = '---';
               }
           });
       },
       
       displayDate: function(){
           var now,month,months,year;
           now= new Date();
           //parameter can also be given in this class or function constructor as they say it in javascript so  this is how its done like for christmas Date(2018,11,25)  notice that the month of december is written as 11 here and not 12 since month here is zero based so keep that in mind.
           year = now.getFullYear();
           month= now.getMonth();
           months= ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
           document.querySelector(DOMstrings.dateLabel).textContent= months[month] + ' '+ year;
       },
       changeType: function(){
           
           var fields = document.querySelectorAll(DOMstrings.inputType + ','+ DOMstrings.inputDescription+ ','+DOMstrings.inputValue);
           
           nodelistforEach(fields, function(cur){
               cur.classList.toggle('red-focus');
           });
           document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
       },
       
       getDOMstrings : function(){
       return DOMstrings;
   }
   } ;
    
})();

var controller= (function(bgtctrl, uictrl){
    
    var setupEventListners = function(){
        
        var DOM = uictrl.getDOMstrings();
         document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAdd);
    
    //event listner for ENTER key
    
    document.addEventListener('keypress', function(event){
        
        if(event.charCode=== 13 || event.keyCode=== 13 || event.which=== 13 ){
            ctrlAdd();
        }
    });
    
    document.querySelector(DOM.container).addEventListener('click', ctrlDelete);
        document.querySelector(DOM.inputType).addEventListener('change',uictrl.changeType);
        
    }
    
    
    var updateBudget = function(){
        
        //calculate the budget
        bgtctrl.calculateBudget();
    
        //return budget
        var budget= bgtctrl.getBudget();
        
    //add the result to the UI 
        //console.log(budget);
        uictrl.displayBudget(budget);
    };
    
    var updatePercent = function(){
      
        //calculate percentages
        bgtctrl.calcPercentage();
        //Read percentages from the budgetController
        var percentages = bgtctrl.getPercent();
        //update the UI withthe new percentages
        //console.log(percentages);
        uictrl.displayPercent(percentages);
    };
    
    var ctrlAdd = function(){
    
        
        var input,addItem;
    //get the input data
        input= uictrl.getinput();
        //console.log(input);
    //add the data to budget controller
    if(input.description !=="" && !isNaN(input.value) && input.value > 0){
        
        addItem= bgtctrl.addItem(input.type, input.description, input.value);
    //add the data to UI 
    
        uictrl.addListItem(addItem,input.type);
    //clear the fields
        uictrl.clearFields();
     //calculate and update the budget
        updateBudget();
    //update the percetages
        updatePercent();
        
    }
        
    };
    var ctrlDelete = function(Event){
        var ItemId, splitId, type, ID;
        
        ItemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(ItemId);
        if(ItemId){// eg inc-1
            
            splitId = ItemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            
            //delete the item from the data structure
            bgtctrl.deleteBudget(type,ID);
            //delete the item from the UI
            uictrl.deleteListItem(ItemId);
            //update and show the budget
            updateBudget();
            //update the percetages
            updatePercent();
        }
        
    };
    
   return {
       init : function(){
           console.log('Application is started');
           uictrl.displayDate();
           uictrl.displayBudget({
                budget : 0,
                totalIncome: 0,
                totalExpense: 0,
                percent: 0
            });
           setupEventListners();
       }
   };
    
})(budgetcontroller, UIcontroller);

controller.init();