# SmartDOM

This script is designed to integrate reactive DOM elements easily in a classic HTML file.

## Installation

Simply copy the `SmartDOM.js` file, located in the root folder, in your project directory and add the following at the end of your `<body>` element :

```html
<script type="text/javascript" src="SmartDOM.js"></script>
```

## Initialisation

The reactive variables initialisation is made in the HTML using specifics tags.

For example :

```html
<SmartVar data-name="example">Test</SmartVar>
```

This will create a reactive variable named "example" with the value `Test`.

You can also create `SmartObjects` :

```html
<SmartObj data-name="list">
	<SmartObjField data-name="elem1">Elem1</SmartObjField>
	<SmartObjField data-name="elem2">Elem2</SmartObjField>
	<SmartObj data-name="elem3">
		<SmartObjField data-name="elem3-1">Elem3-1</SmartObjField>
		<SmartObjField data-name="elem3-2">Elem3-2</SmartObjField>
	</SmartObj>
</SmartObj>
```

(Nested objects are possible)

## Listening for changes

You can listen for `SmartVar` and `SmartObj` changes using the following :

```javascript
/*
	Returns a data object containing :
  - value : the new value (passed in .set())
  - oldValue : the previous value
  - node : the HTML node associated to the value
	The return value is optional. If it's provided, the returned content will be used for the render. If not, val will be.
*/
SmartDOM.onChange(<data-name>, function(data) {
  return "Test2";
});
```

It also works for `SmartObjs`. In this case, val is the whole object.

## Modifying values

To change a `SmartVar` value, you will use the `.set()` function, like so :

```javascript
SmartDOM.set(<data-name>, /* new value*/);
```

For `SmartObjs` there's two ways of modifying the values :

```javascript
SmartDOM.set(<data-name>, {/* Your new object */}); // Update the whole object
```

Setting individual fields using dot notation is comming soon.

## Style

You can change style of SmartVars by using :

```javascript
SmartDOM.setStyle(<data-name>, {marginBottom: "20px"});
```

You can also change classes directly by using the following method :

```javascript
SmartDOM.addClass(<data-name>, [/* class names */]); // add the classes to the associated html node
SmartDOM.removeClass(<data-name>, [/* class names */]); // Remove the classes from the associated html node
```

Working on SmartArrs...
