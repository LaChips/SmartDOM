const randomIdGenerator = () => {
  return 'SmartDOM-' + Math.random().toString(36).slice(2);;
}

class SmartVar {
  constructor(node, value) {
    this.value = value;
    this.node = node;
    this.type = 'var';
    this.onChange = (value) => value;
    this.onChanged = (value) => value;
  };

  get() {
    return this.value;
  };

  set(value) {
    const oldValue = this.value;
    const newValue = this.onChange({value: value, oldvalue: oldValue, node: this.node}) || value;
    this.value = newValue;
    this.node.innerText = newValue;
    this.onChanged({value: newValue, node: this.node});
  };
  addClass(c) {
    this.node.classList.add(c);
  };
  removeClass(c) {
    this.node.classList.remove(c);
  };
  setStyle(prop, value) {
    this.node.style[prop] = value;
  };
}

class SmartObj {
  constructor(baseNode, value) {
    this.value = value;
    this.node = baseNode;
    this.type = 'obj';
    this.onChange = (value) => value;
    this.onChanged = (value) => value;
  };

  get() {
    return this.value;
  };

  applyDomChange(smartElem) {
    if (smartElem.type === 'field') {
      smartElem.node.innerText = smartElem.node.value;
      smartElem.changed = true;
    }
    else if (smartElem === 'obj') {
      for (const elem of smartElem.value) {
        this.applyDomChange(elem);
      }
    }
  };

  findNode(name, values, parentName = null, parent = null) {
    for (let value of values) {
      if (value.name === name) {
        if (value.type === 'field' && (!parentName || parentName === parent)) {
          return value;
        }
      }
      else if (value.type === 'obj') {
        return this.findNode(name, value.value, parentName, value.name);
      }
    }
  };

  replaceValues(obj, parentName = null) {
    const keys = Object.keys(obj);
    const values = Object.values(obj);

    for (let i = 0; i < values.length; i++) {
      if (SmartDOM.isObject(values[i])) {
        this.replaceValues(values[i], keys[i])
      }
      else {
        let smartElem = this.findNode(keys[i], this.value, parentName);
        if (smartElem) {
          smartElem.node.innerText = values[i];
          smartElem.changed = true;
        }
      }
    }
  };

  flattenObj(obj) {
    let result = {};
    for (const i in obj) {
      if (SmartDOM.isObject(obj[i]) && !SmartDOM.isArray(obj[i])) {
        const temp = this.flattenObj(obj[i]);
        for (const j in temp) {
          result[i + '.' + j] = temp[j];
        }
      }
      else {
        result[i] = obj[i];
      }
    }
    return result;
  };

  removeUnusedFields(values = this.value, path = "") {
    for (let i = values?.length - 1; i >= 0; i--) {
      if (!values[i].changed && values[i].type === "field") {
        values[i].node.innerText = "";
        continue;
      }
      if (values[i].type === "obj") {
        this.removeUnusedFields(values[i].value, values[i].name, i);
      }
    }
  };

  cleanValuesIntoObject(cleanObj = {}, values) {
    for (const value of values) {
      if (value.type === "obj") {
        cleanObj[value.name] = this.cleanValuesIntoObject({}, value.value);
      }
      else if (value.type === "field") {
        cleanObj[value.name] = value.value;
      }
    }
    return cleanObj;
  };

  set(value) {
    const oldValue = this.value;
    const cleanOldValue = this.cleanValuesIntoObject({} , oldValue);
    const newValue = this.onChange({
      value:value,
      oldValue: cleanOldValue,
      node: this.node
    }) || value;
    this.replaceValues(newValue);
    if (!this.preserveFields) {
      this.removeUnusedFields();
    }
    this.onChanged({value: newValue, node: this.node});
  };

  addClass(c) {
    this.node.classList.add(c);
  };

  removeClass(c) {
    this.node.classList.remove(c);
  };

  setStyle(prop, value) {
    this.node.style[prop] = value;
  };

  hide(fields) {
    for (const fieldName of fields) {
      const value = this.findNode(fieldName, this.value);
      value.node.style.display = "none";
    }
    if (fields?.length === 0) {
      this.node.style.display = "none";
    }
  };

  show(fields) {
    for (const fieldName of fields) {
      const value = this.findNode(fieldName, this.value);
      value.node.style.display = "initial";
    }
    this.node.style.display = "initial";
  }
};

const SmartDOM = {
  values: {},
  set: function(name, value, { preserveFields = false } = {}) {
    const smartElem = this.values[name];
    if (!smartElem) {
      return this.logError('set-missing-node', {name: name, value: value});
    }
    if (smartElem.type === "obj") {
      smartElem.preserveFields = preserveFields;
    }
    smartElem.set(value);
  },

  /*setFields: function(name, fieldsObj) {
    console.log("fieldsObj :", fieldsObj);
    const smartElem = this.values[name];
    const fields = Object.entries(fieldsObj).map((field) => {return {[field[0]]: field[1]}});
    smartElem.preserveFields = true;
    console.log("fields :", fields);
  },*/

  get: function (name, ...props) {
    if (!this.values[name]) {
      return this.logError('get-missing-node', {name: name});
    }
    const value = this.values[name].get();
    console.log("props :", props);
    return value;
  },

  create: function(name, node, value, type = 'var') {

    if (type === 'var') {
      this.values[name] = new SmartVar(node, value);
    }
    else if (type === 'obj') {
      this.values[name] = new SmartObj(node, value);
    }
  },

  isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
  },
  
  isArray(arr) {
    return Object.prototype.toString.call(arr) === "[object Array]";
  },

  logError: function(errorType, data) {
    if (errorType === 'register-missing-node')
      console.error(`SmartDOM: Cannot register listener for '${data.name}'. '${data.name}' does not exist. Make sure <SmartVar|SmartObject|SmartArray data-name='${data.name}'> is included in your HTML file.`);
    else if (errorType === 'set-missing-node')
      console.error(`SmartDOM: Cannot set '${data.name}' to '${data.value}'. '${data.name}' does not exist. Make sure <SmartVar|SmartObject|SmartArray data-name='${data.name}'> is included in your HTML file.`);
    else if (errorType === 'get-missing-node')
      console.error(`SmartDOM: Cannot get '${data.name}'. '${data.name}' does not exist. Make sure <SmartVar|SmartObject|SmartArray data-name='${data.name}'> is included in your HTML file.`);
    return;
  },

  onChange: function(name, onChange) {
    if (!this.values[name]) {
      return this.logError('register-missing-node', {name: name});
    }
    this.values[name].onChange = onChange;
  },

  onChanged: function(name, onChanged) {
    if (!this.values[name]) {
      return this.logError('register-missing-node', {name: name});
    }
    this.values[name].onChanged = onChanged;
  },

  assignNamesAndIds: function(nodes) {
    for (const node of nodes) {
      if (!node?.dataset?.name || node.dataset.name.length === 0) {
        node.dataset.name = randomIdGenerator();
      }
      if (node?.children?.length > 0) {
        this.assignNames(node?.children);
      }
      if (!node?.dataset?.smartid || node.dataset.smartid.length === 0) {
        node.dataset.smartid = randomIdGenerator();
      }
    }
  },

  findSmartChilds: function(node) {
    let res = [];
    for (elem of node.children) {
      if (elem.localName == "smartvar") {
        res.push({name: elem.dataset.name, value: elem.innerText, node: elem, type: "var"});
      }
      else if (elem.localName == "smartobjfield") {
        res.push({name: elem.dataset.name, value: elem.innerText, node: elem, type: "field"});
      }
      else if (elem.localName == "smartobj") {
        res.push({name: elem.dataset.name, node: elem, value: this.findSmartChilds(elem), type: "obj"});
      }
      if (elem.children.length > 0)
        res = res.concat(this.findSmartChilds(elem));
    }
    return res;
  },

  hasParent: function(objs = [], obj, type) {
    for (pobj of objs) {
      for (child of pobj.value) {
        if (child.name == obj.dataset.name && child.type == type)
          return true;
        if (child.type == type)
          return this.hasParent(child.value, obj);
      }
    }
    return false;
  },

  makeObjTree: function(HTMLobjs) {
    var objs = [].slice.call(HTMLobjs);
    let res = [];
    for (let i = 0; i < objs.length; i++) {
      if (this.hasParent(res, objs[i], "obj") == false) {
        if (!objs[i]?.dataset?.name || objs[i].dataset.name.length === 0) {
          objs[i].dataset.name = randomIdGenerator();
        }
        if (!objs[i]?.dataset?.smartid || objs[i].dataset.smartid.length === 0) {
          objs[i].dataset.smartid = randomIdGenerator();
        }
        res.push({name: objs[i].dataset.name, node: objs[i], value: this.findSmartChilds(objs[i]), type: "obj"});
      }
    }
    return res;
  },

  addClass: function(name, c) {
    this.values[name].addClass(c);
  },

  removeClass: function(name, c) {
    this.values[name].removeClass(c);
  },

  setStyle: function(name, prop, value) {
    this.values[name].setStyle(prop, value);
  },

  hide: function(name, fields = []) {
    console.log("fields :", fields);
    this.values[name].hide(fields);
  },

  show: function(name, fields = []) {
    this.values[name].show(fields);
  }
}

const vars = document.querySelectorAll('SmartVar');
const objs = document.querySelectorAll('SmartObj');

SmartDOM.assignNamesAndIds(vars);
//SmartDOM.assignNames(objs);

const objTree = SmartDOM.makeObjTree(objs);

for (const v of vars) {
  SmartDOM.create(v.dataset.name, v, v.innerText, "var");
}

//console.log({objs})

for (const obj of objTree) {
  SmartDOM.create(obj.name, obj.node, obj.value, "obj");
}


