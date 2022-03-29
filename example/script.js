/*SmartDOM.onChange('test', function({value, oldValue, node}) {
  console.log("onChange :", value);
  console.log("node :", node);
  return `${value} dupont`;
});

SmartDOM.onChange('person', function({value, oldValue, node}) {
  console.log("onChange old value :", oldValue);
  console.log("onChange new value :", value);
  console.log("node :", node);
});

SmartDOM.onChanged('test', function({value, node}) {
  console.log('onChanged :', value);
  console.log("node :", node);
});

SmartDOM.onChanged('person', function({value, node}) {
  console.log("onChanged :", value);
  console.log("node :", node);
});

setTimeout(() => {
  SmartDOM.set('test', 'Paul');
}, 1000);

setTimeout(() => {
  SmartDOM.set('test', 'Elie');
}, 2000);
*/
const person = {
  name: "Titouan",
  age: 25,
  person_adress: {
    street: "6 rue marc sangnier",
    city: "Vanves",
  }
}

setTimeout(() => {
  SmartDOM.set('person', person);
  //SmartDOM.show('person', ["name"]);
}, 3000);

/*setTimeout(() => {
  SmartDOM.hide('person', ["name"]);
}, 4000);

setTimeout(() => {
  SmartDOM.set('person', {name: "Marine"});
  SmartDOM.show('person', ["name"]);
}, 5000);

SmartDOM.hide('person');*/