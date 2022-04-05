SmartDOM.onChange('name', function({value, oldValue, node}) {
  console.log("onChange :", value);
  console.log("node :", node);
  return `<span>Profile : </span>${value}`;
});

SmartDOM.onChange('person', function({value, oldValue, node}) {
  console.log("onChange old value :", oldValue);
  console.log("onChange new value :", value);
  console.log("node :", node);
  return value;
});

SmartDOM.onChanged('name', function({value, node}) {
  console.log('onChanged :', value);
  console.log("node :", node);
});

SmartDOM.onChanged('person', function({value, node}) {
  console.log("onChanged :", value);
  console.log("node :", node);
});

setTimeout(() => {
  SmartDOM.set('name', 'John');
}, 1000);

const person = {
  name: "Albert",
  age: 42,
  person_adress: {
    street: "4108 Patton Lane",
    city: "Cary",
  }
}

setTimeout(() => {
  SmartDOM.set('person', person, {preserveFields: true});
  SmartDOM.set('name', person?.name);
  SmartDOM.show('person', ["name"]);
}, 3000);

setTimeout(() => {
  SmartDOM.set('person', {name: "Fred"});
  SmartDOM.set('name', "Fred");
}, 4000);

setTimeout(() => {
  SmartDOM.hide('person', ["name"]);
}, 5000);

setTimeout(() => {
  SmartDOM.set('person', {name: "Frank"});
  SmartDOM.set('name', 'Frank');
  SmartDOM.show('person', ["name"]);
  SmartDOM.setStyle('name', {marginBottom: "50px", color: "red"});
  SmartDOM.addClass('name', ["bold", "italic"]);
}, 6000);

SmartDOM.hide('person');