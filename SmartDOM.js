const randomIdGenerator = () => {
  return 'SmartDOM-' + Math.random().toString(36).slice(2);;
}

class SmartVar {
  constructor(node, value, type = 'var') {
    this.value = value;
    this.node = node;
    this.type = type;
    this.onChange = ({value}) => value;
    this.onChanged = ({value}) => value;
  };

  get() {
    return this.value;
  };

  set(value) {
    const oldValue = this.value;
    const newValue = this.onChange({value: value, oldvalue: oldValue, node: this.node}) || value;
    this.value = newValue;
    this.node.innerHTML = newValue;
    this.changed = true;
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
  disable() {
    this.disabled = true;
    this.set("");
  }
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

  findNode(name, values, parentName = null, parent = null) {
    for (let key of Object.keys(values)) {
      if (key === name && values[key] && values[key].type === 'field' && (!parentName || parentName === parent)) {
          return values[key];
      }
      else if (values[key].type === 'obj') {
        return this.findNode(name, values[key].value, parentName, values[key].name);
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
          smartElem.set(values[i]);
        }
      }
    }
  };

  removeUnusedFields(values = this.value, path = "") {
    const keys = Object.keys(values);
    for (let i = keys?.length - 1; i >= 0; i--) {
      const key = keys[i];
      if (!values[key].changed && values[key].type === "field") {
        values[key].disable();
        continue;
      }
      if (values[key].type === "obj") {
        this.removeUnusedFields(values[key].value, values[key].name, i);
      }
    }
  };

  cleanValuesIntoObject(cleanObj = {}, values) {
    for (const key of Object.keys(values)) {
      if (values[key].type === "obj") {
        cleanObj[key] = this.cleanValuesIntoObject({}, values[key].value);
      }
      else if (values[key].type === "field") {
        cleanObj[key] = values[key].value;
      }
    }
    return cleanObj;
  };

  mergeOldAndNewValue(oldValue, newValue) {
    let finalValue = {};
    if (!oldValue || !newValue)
      return finalValue;
    const newKeys = Object.keys(newValue);
    const oldKeys = Object.keys(oldValue);
    for (const key of newKeys) {
      if (typeof newValue[key] === "string" || typeof newValue[key] === "number") {
        finalValue[key] = newValue[key];
      }
      else if (SmartDOM.isObject(newValue[key])) {
        finalValue[key] = this.mergeOldAndNewValue(oldValue[key], newValue[key]);
      }
    }
    if (this.preserveFields) {
      console.log("test");
      for (const key of oldKeys) {
        if (finalValue[key]) {
          continue;
        }
        else {
          finalValue[key] = oldValue[key];
        }
      }
    }
    return finalValue;
  }

  set(value) {
    const oldValue = this.value;
    let cleanOldValue = this.cleanValuesIntoObject({} , oldValue);
    const mergedValue = this.mergeOldAndNewValue(cleanOldValue, value);
    const newValue = this.onChange({
      value: mergedValue,
      oldValue: cleanOldValue,
      node: this.node
    }) || mergedValue;
    this.replaceValues(newValue);
    if (!this.preserveFields) {
      this.removeUnusedFields();
    }
    this.onChanged({value: newValue, node: this.node});
  };

  getNodeFromDotNotationValue(path) {
    console.log(this.value);
    //if (!this.value[path])
  }

  addClass(c) {
    this.node.classList.add(c);
  };

  removeClass(c) {
    this.node.classList.remove(c);
  };

  applyStyles(node, CSSProperties) {

  };

  setStyle(CSSProperties, path = "") {
    if (path.length === 0) {
      //applyStyles(this.node, CSSProperties);
    }
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

  get: function (name, ...props) {
    if (!this.values[name]) {
      return this.logError('get-missing-node', {name: name});
    }
    const value = this.values[name].get();
    //console.log("props :", props);
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
      if (!node?.dataset?.smartid || node.dataset.smartid.length === 0) {
        node.dataset.smartid = randomIdGenerator();
      }
      if (node?.children?.length > 0) {
        this.assignNames(node?.children);
      }
    }
  },

  findSmartChilds: function(node) {
    let res = {};
    for (elem of node.children) {
      const name = elem.dataset.name;
      const id = elem.dataset.smartid;
      if (elem.localName == "smartvar") {
        res[name] = {name: elem.dataset.name, value: parseInt(elem.innerText) || elem.innerText, node: elem, type: "var"};
      }
      else if (elem.localName == "smartobjfield") {
        res[name] = new SmartVar(elem, parseInt(elem.innerText) || elem.innerText, "field");
      }
      else if (elem.localName == "smartobj") {
        res[name] = {name: elem.dataset.name, node: elem, value: this.findSmartChilds(elem), type: "obj"};
      }
      if (elem.children.length > 0)
        res = {...res, ...this.findSmartChilds(elem)};
    }
    return res;
  },

  hasParent: function(objs = [], obj, type) {
    const objName = obj.dataset.name;
    for (pobj of objs) {
      for (child of Object.keys(pobj.value)) {
        if (!pobj.value[objName])
          continue;
        if (pobj.value[objName].type == type)
          return true;
        else if (pobj.value[objName].type == type)
          return this.hasParent(pobj.value[objName].value, obj);
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

  setStyle: function(path, CSSProperties) {
    const dotPos = path.indexOf('.');
    if (dotPos === -1)
      this.values[path].setStyle(CSSProperties);
    else {
      const pathArray = path.split('.');
      const name = pathArray[0];
      if (!this.values[name]) {
        return this.logError('register-missing-node', {name: name});
      }
      const newPath = path.split('.').slice(1, pathArray.length).join('.');
      this.values[name].setStyle(CSSProperties, path);
    }
  },

  hide: function(name, fields = []) {
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
  SmartDOM.create(v.dataset.name, v, parseInt(v.innerText) || v.innerText, "var");
}

for (const obj of objTree) {
  SmartDOM.create(obj.name, obj.node, obj.value, "obj");
}


