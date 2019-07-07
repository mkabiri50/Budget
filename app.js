//budjet controller
var budgetConroller = (function (){
  var Expense = function(id,description,value){
      this.id = id;
      this .description = description;
      this .value = value;
      this.percentage = -1;
  };

  Expense.prototype.calcpercentage = function(totalIncome){
    if (totalIncome>0) {
        this.percentage = Math.round((this.value / totalIncome)*100);
    }else{
        this.percentage = -1;
    }
   
}
Expense.prototype.getPercentage = function(){
    return this.percentage;
}
  var Income = function(id,description,value){
    this.id = id;
    this .description = description;
    this .value = value;
   
};

var calcTotal = function(type){
    sum = 0;
    data.allitems[type].forEach(function(cur){
        sum += cur.value;
    });
    data.total[type] = sum;

};
var data={
    allitems: {
        exp:[],
        inc:[]
    },
    total :{
        exp: 0,
        inc : 0
    },
    budget :0,
    percentage : -1
};
return {
    addItem : function(type, des, val){
        var newItem,ID;
        //create new id
        if (data.allitems[type].length > 0) {
            ID = data.allitems[type][data.allitems[type].length-1].id+1;
        }else{
            ID = 0;
        }
  
        // create new item
        if (type === 'exp') {
             newItem = new Expense(ID, des, val);
        }else if(type === 'inc') {
              newItem = new Income(ID, des, val);
        }
        //push it in to data structure
        data.allitems[type].push(newItem);
        return newItem;  
    },
    deletItem: function(type,id){
        var ids , index;
        ids = data.allitems[type].map(function(current){
            return current.id;
        });
        index = ids.indexOf(id);
        if(index !== -1){
          data.allitems[type].splice(index,1);  
        }
    },
    calculateBudget : function () {
        // calculate total incom and expenses
        calcTotal('inc');
        calcTotal('exp'); 
        //calculate the budget (inc-exp)
        data.budget = data.total.inc - data.total.exp;
        // calc the percentage of income that we spend
        if (data.total.inc > 0) {
             data.percentage = Math.round((data.total.exp/data.total.inc)*100);
        }else{
            data.percentage = -1;
        }
       
    },
    getBudget : function(){
        return {
            budget : data.budget,
            totalInc : data.total.inc,
            totalexp : data.total.exp,
            percent : data.percentage
        };
    },
    calculatePercentage: function(){
        data.allitems.exp.forEach(function(curr){
            curr.calcpercentage(data.total.inc);
        });
    },
    getPercentages: function(){
        var allperc = data.allitems.exp.map(function(curr){
            return curr.getPercentage();
        });
        return allperc;
    },
testing: function(){
    console.log(data);
}
 
};
  
}) ();
//ui controller
var UIController = (function(){
    var DOMstrings ={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputButton:'.add__btn',
        incomecontainer:'.income__list',
        expanContainer:'.expenses__list',
        budgetLable:'.budget__value',
        incomeLable :'.budget__income--value',
        expenseLable:'.budget__expenses--value',
        percentageLable :'.budget__expenses--percentage',
        container :'.container',
        expensePerclable:'.item__percentage',
        dateAble:'.budget__title--month'
        }
        var formatNumber = function(num,type){
            var numSplit,int,dec,type;
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            int = numSplit[0];
            if (int.length ){
                int = int.substr(0,int.length-3) + ','+int.substr(int.length-3 , 3);
            }
            dec = numSplit[1];
            return (type ==='inc'?'+':'-') +int +'.'+ dec;
        };
        var nodeListForeach = function(list, calback){
            for (let i = 0; i < list.length; i++) {
              calback(list[i],i);    
            }
        };

    return {
        getinput: function (){
            return{
                type:document.querySelector(DOMstrings.inputType).value,
                description:document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem : function(obj,type){
            //create HYML string with palceholder text
            var elemnt,html,newHtml;
            if (type==='inc') {
                elemnt = DOMstrings.incomecontainer;
                html='<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div</div>';
            }else if (type==='exp') {
                elemnt = DOMstrings.expanContainer;
                html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            //replace placeholder with same actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            //insert HTML into the DOM
            document.querySelector(elemnt).insertAdjacentHTML('beforeEnd',newHtml);

        },
        deletListItem : function(selectorID){
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription +', '+DOMstrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function(current, index, array){
                current.value ="";
            })
            fieldArr[0].focus();
        },
        displayBudget : function(obj){
            var type;
         
            obj.budget <0 ? type='exp':type ='inc';
            document.querySelector(DOMstrings.budgetLable).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLable).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLable).textContent=formatNumber(obj.totalexp,'exp');
          
            if (obj.percent> 0) {
            document.querySelector(DOMstrings.percentageLable).textContent=obj.percent +'%';
           }else{
            document.querySelector(DOMstrings.percentageLable).textContent='---';
           } 
        },

        displayPercentages :function(percentage){
            var feilds =document.querySelectorAll(DOMstrings.expensePerclable);
        
            
        nodeListForeach(feilds,function(current , index){
            if (percentage[index] > 0 ){
             current.textContent = percentage[index]+'%';
            }else{
             current.textContent = '---';
            }
            
         });
        },
        displayDate: function(){
           var now , year , mounth , mounths;
            now = new Date();
            year =now.getFullYear();
            mounths=['january', 'febuary', 'march', 'april', 'may', 'june', 'july', 'agust', 'september', 'october', 'november', 'december']; 
            mounth = now.getMonth();
            document.querySelector(DOMstrings.dateAble).textContent=mounths[mounth]+' '+year;

        },
        changeType: function(){
            var feilds = document.querySelectorAll(DOMstrings.inputType + ',' +DOMstrings.inputDescription + ',' +DOMstrings.inputValue);
            nodeListForeach(feilds,function(cur){
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },        
       
        getDOMstrings: function(){
            return DOMstrings;
        }
    }

})();

//global app controller
var controller = (function(budgetctrl,UIctrl){
    var setupEventListeners = function(){
        var DOM = UIctrl.getDOMstrings();
        document.querySelector(DOM.inputButton).addEventListener('click',controllAddItem);
        document.addEventListener('keypress',function(event){
            if (event.keyCode === 13 || event.witch === 13) {
                controllAddItem();
            }
        });
     document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);   
    document.querySelector(DOM.inputType).addEventListener('change',UIctrl.changeType);
    };  
    
   var updateBudget = function(){
    // 1- calculate the budget
    budgetctrl.calculateBudget();
    // 2- return the buget
    var budget = budgetctrl.getBudget();
    // 3- display the budget in the UI
    UIctrl.displayBudget(budget);
   };

   var updatePercentages = function(){
       //1, calculate percentage
        budgetctrl.calculatePercentage();
       // 2. read percentage from budgetController
        var percentages = budgetctrl.getPercentages();
       //3. update UIwith the new percentage
       UIctrl.displayPercentages(percentages);

   }
    var controllAddItem =function(){
        var input,newItem;
            //1)get the field iput data
            input = UIctrl.getinput();
            if (input.description !=="" && ! isNaN(input.value) && input.value > 0 ) {
             //2)add the itemto the budget controller
            newItem=budgetctrl.addItem(input.type, input.description, input .value);
            //3)add item to UI
            UIctrl.addListItem(newItem, input.type);
            //4)clear fields
            UIctrl.clearFields();
            // 5- calculate and update the budget
            updateBudget();
            //6. calculate and update percentaes
            updatePercentages();
            }
       
    };
    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, ID;
       itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
       if (itemId){
           splitId = itemId.split('-');
           type =splitId[0];
            ID =parseInt(splitId[1]);
            //1. delet the item from data structure
            budgetctrl.deletItem(type,ID);
            //2. delet item from UI
             UIctrl.deletListItem(itemId);
            //3. update new budget
            updateBudget();
            //4. calculate and update percentaes
            updatePercentages();
       }
    };
    return { 
        init : function(){
        
            console.log("the app is started");
            UIctrl.displayDate();
            UIctrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalexp : 0,
                percent : 0
            });
            setupEventListeners();
        }
    };  
   
})(budgetConroller,UIController);

controller.init();
